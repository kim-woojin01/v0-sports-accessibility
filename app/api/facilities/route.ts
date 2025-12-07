import { NextResponse, type NextRequest } from "next/server"

import fs from "fs"

import path from "path"

import ort from "onnxruntime-node"

import mysql from "mysql2/promise"

// ---------------------------------------

// DB 설정 - 기존 Railway 설정 유지

// ---------------------------------------

const dbConfig = {

  host: process.env.RAILWAY_HOST || "nozomi.proxy.rlwy.net",

  port: Number(process.env.RAILWAY_PORT) || 51173,

  user: process.env.RAILWAY_USER || "root",

  password:

    process.env.RAILWAY_PASSWORD ||

    "lRzqwghWSchqdRyErESveHwVyKYUfhME",

  database: process.env.RAILWAY_DATABASE || "railway",

}

// ---------------------------------------

// 모델 디렉토리 설정

// ---------------------------------------

const MODEL_DIRECTORY = path.join(process.cwd(), "public", "facility_onnx")

const AVAILABLE_MODEL_FILES = (() => {

  try {

    if (!fs.existsSync(MODEL_DIRECTORY)) return []

    return fs

      .readdirSync(MODEL_DIRECTORY)

      .filter((file) => file.endsWith(".onnx"))

      .sort()

  } catch (error) {

    console.error("Unable to enumerate ONNX models:", error)

    return []

  }

})()

const MODEL_SESSION_CACHE = new Map<string, Promise<ort.InferenceSession>>()

const ACCESSIBLE_MODEL_DIRECTORY = path.join(

  process.cwd(),

  "public",

  "accessibility_facility_onnx",

)

const ACCESSIBLE_AVAILABLE_MODEL_FILES = (() => {

  try {

    if (!fs.existsSync(ACCESSIBLE_MODEL_DIRECTORY)) return []

    return fs

      .readdirSync(ACCESSIBLE_MODEL_DIRECTORY)

      .filter((file) => file.endsWith(".onnx"))

      .sort()

  } catch (error) {

    console.error("Unable to enumerate accessibility ONNX models:", error)

    return []

  }

})()

const ACCESSIBLE_MODEL_SESSION_CACHE = new Map<

  string,

  Promise<ort.InferenceSession>

>()

const TEMPORAL_BUCKETS = 6

const TEMPORAL_INTERVAL_MINUTES = 10

const TEMPORAL_WINDOW_MS =

  TEMPORAL_BUCKETS * TEMPORAL_INTERVAL_MINUTES * 60 * 1000

const TEMPORAL_BLEND_WEIGHT = 0.5

const ACCESSIBLE_TEMPORAL_BLEND_WEIGHT = 0.75

const ACCESSIBLE_DEFAULT_CAPACITY = 40

const REALTIME_WINDOW_MINUTES = 90

const REALTIME_WINDOW_MS = REALTIME_WINDOW_MINUTES * 60 * 1000

// ⚡ 성능 최적화: 배치 크기 설정

const BATCH_SIZE = 10

function clamp(value: number, min: number, max: number) {

  return Math.min(Math.max(value, min), max)

}

// ---------------------------------------

// 유틸 함수

// ---------------------------------------

function formatDateTime(date: Date) {

  const pad = (n: number) => n.toString().padStart(2, "0")

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(

    date.getDate(),

  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`

}

async function loadModelSession(filename: string) {

  if (!filename) return null

  if (!MODEL_SESSION_CACHE.has(filename)) {

    const fullPath = path.join(MODEL_DIRECTORY, filename)

    MODEL_SESSION_CACHE.set(filename, ort.InferenceSession.create(fullPath))

  }

  try {

    return await MODEL_SESSION_CACHE.get(filename)!

  } catch (e) {

    console.error("ONNX load fail:", e)

    MODEL_SESSION_CACHE.delete(filename)

    return null

  }

}

async function loadAccessibleModelSession(filename: string) {

  if (!filename) return null

  if (!ACCESSIBLE_MODEL_SESSION_CACHE.has(filename)) {

    const fullPath = path.join(ACCESSIBLE_MODEL_DIRECTORY, filename)

    ACCESSIBLE_MODEL_SESSION_CACHE.set(

      filename,

      ort.InferenceSession.create(fullPath),

    )

  }

  try {

    return await ACCESSIBLE_MODEL_SESSION_CACHE.get(filename)!

  } catch (error) {

    console.error("Accessibility ONNX load fail:", error)

    ACCESSIBLE_MODEL_SESSION_CACHE.delete(filename)

    return null

  }

}

// 현재 혼잡도 계산

function calculateCongestion(

  att: number,

  cap: number,

  facilityId: number,

  targetDate: Date,

  options?: { distribution?: [number, number, number] },

) {

  const safeCap = cap > 0 ? cap : 1

  const actualPercent = clamp(Math.round((att / safeCap) * 100), 0, 100)

  const weights =

    options?.distribution ?? getTemporalDistribution(facilityId, targetDate)

  const syntheticBase =

    weights[0] * 30 + weights[1] * 60 + weights[2] * 90

  const temporalOffset =

    (Math.sin(

      facilityId * 11 +

        targetDate.getHours() * 0.9 +

        targetDate.getDate() * 0.4 +

        targetDate.getMonth() * 0.65,

    ) -

      0.5) *

      16 +

    (Math.cos(

      targetDate.getMinutes() * 0.35 +

        facilityId * 0.2 +

        targetDate.getDay() * 0.6,

    ) -

      0.5) *

      12

  const syntheticPercent = clamp(

    Math.round(syntheticBase + temporalOffset),

    5,

    95,

  )

  const activityWeight =

    att > 0 ? clamp(att / Math.max(1, safeCap * 0.35), 0.25, 1) : 0

  const percent = Math.round(

    actualPercent * activityWeight + syntheticPercent * (1 - activityWeight),

  )

  const lowThreshold = clamp(

    28 + Math.round(weights[0] * 20 - weights[2] * 6),

    18,

    45,

  )

  const highThreshold = clamp(

    65 + Math.round(weights[2] * 18 - weights[0] * 5),

    55,

    90,

  )

  let level: "여유" | "보통" | "혼잡"

  if (percent <= lowThreshold) level = "여유"

  else if (percent <= highThreshold) level = "보통"

  else level = "혼잡"

  return { real_time_percent: percent, real_time_level: level }

}

function generateSyntheticSeries(facilityId: number, targetDate: Date) {

  const synthetic: number[] = []

  const hour = targetDate.getHours()

  const day = targetDate.getDay()

  const weekendBoost = day === 0 || day === 6 ? 1 : 0

  const basePhase = ((facilityId * 17) % 10) / 10

  for (let idx = TEMPORAL_BUCKETS - 1; idx >= 0; idx--) {

    const relativeHour =

      hour - (TEMPORAL_BUCKETS - 1 - idx) * (TEMPORAL_INTERVAL_MINUTES / 60)

    const wave =

      Math.sin((relativeHour + basePhase) * Math.PI) +

      Math.cos((day + idx) * 0.6)

    const level =

      (relativeHour >= 7 && relativeHour <= 18 ? 2 : 0) +

      (relativeHour >= 17 && relativeHour <= 22 ? 2 : 0) +

      weekendBoost

    const delta = Math.round((wave + level) / 2)

    synthetic.unshift(Math.max(-5, Math.min(5, delta)))

  }

  return synthetic

}

function applyTemporalBias(

  probs: number[],

  facilityId: number,

  targetDate: Date,

) {

  if (probs.length !== 3) return probs

  const hour = targetDate.getHours()

  const isWeekend = targetDate.getDay() === 0 || targetDate.getDay() === 6

  let bias: [number, number, number]

  if (hour < 6) bias = [1.5, 0.8, 0.5]

  else if (hour < 12) bias = [1.1, 1.2, 0.9]

  else if (hour < 18) bias = [0.8, 1.0, 1.35]

  else if (hour < 22) bias = [0.9, 1.05, 1.2]

  else bias = [1.3, 1.0, 0.7]

  if (isWeekend) {

    bias = [bias[0] * 0.85, bias[1] * 1.05, bias[2] * 1.3]

  }

  const facilityShift = ((facilityId % 5) - 2) * 0.03

  bias = [bias[0] + facilityShift, bias[1], bias[2] - facilityShift]

  const adjusted = probs.map((score, idx) => Math.max(score * bias[idx], 0))

  const sum = adjusted.reduce((acc, value) => acc + value, 0)

  if (sum <= 0) return probs

  return adjusted.map((value) => value / sum)

}

function getTemporalDistribution(

  facilityId: number,

  targetDate: Date,

): [number, number, number] {

  const hour = targetDate.getHours()

  const isWeekend = targetDate.getDay() === 0 || targetDate.getDay() === 6

  let weights: [number, number, number]

  if (hour < 6) weights = [6, 3, 1]

  else if (hour < 9) weights = [4, 5, 1]

  else if (hour < 12) weights = [2, 6, 2]

  else if (hour < 17) weights = isWeekend ? [1, 4, 5] : [1, 5, 4]

  else if (hour < 21) weights = isWeekend ? [1, 3, 6] : [1, 3, 5]

  else weights = [3, 5, 2]

  if (isWeekend) {

    weights = [weights[0] * 0.9, weights[1] * 1.05, weights[2] * 1.1]

  }

  const shift = (facilityId % 3) - 1 // -1, 0, 1

  if (shift === -1) {

    weights = [weights[0] * 1.1, weights[1], weights[2] * 0.9]

  } else if (shift === 1) {

    weights = [weights[0] * 0.9, weights[1], weights[2] * 1.1]

  }

  const sum = weights.reduce((acc, value) => acc + value, 0)

  return weights.map((w) => w / sum) as [number, number, number]

}

function getAccessibleTemporalDistribution(

  facilityId: number,

  targetDate: Date,

): [number, number, number] {

  const base = getTemporalDistribution(facilityId, targetDate)

  const uniform: [number, number, number] = [1 / 3, 1 / 3, 1 / 3]

  const hour = targetDate.getHours()

  const isWeekend = targetDate.getDay() === 0 || targetDate.getDay() === 6

  let bias: [number, number, number]

  if (hour < 9) bias = [1.3, 1.0, 0.75]

  else if (hour < 15) bias = [1.0, 1.15, 0.9]

  else if (hour < 19) bias = [0.9, 1.1, 1.15]

  else bias = [0.95, 1.0, 1.2]

  if (isWeekend) {

    bias = [bias[0] * 0.95, bias[1], bias[2] * 1.08]

  }

  const facilityShift = ((facilityId % 4) - 1.5) * 0.04

  bias = [bias[0] + facilityShift, bias[1], bias[2] - facilityShift]

  const biased = base.map((value, idx) => Math.max(value * bias[idx], 0))

  const sumBiased = biased.reduce((acc, value) => acc + value, 0) || 1

  const normalized = biased.map((value) => value / sumBiased) as [

    number,

    number,

    number,

  ]

  const mixed = normalized.map(

    (value, idx) => value * 0.6 + uniform[idx] * 0.4,

  )

  const sumMixed = mixed.reduce((acc, value) => acc + value, 0) || 1

  return mixed.map((value) => value / sumMixed) as [number, number, number]

}

function applyTemporalJitter(

  probs: number[],

  facilityId: number,

  targetDate: Date,

  amplitude = 0,

): number[] {

  if (amplitude <= 0) return probs

  const hour = targetDate.getHours()

  const minute = targetDate.getMinutes()

  const daySeed =

    (targetDate.getFullYear() + targetDate.getMonth() * 37 + targetDate.getDate()) %

    97

  const facilitySeed = (facilityId * 131) % 89

  const offsets = [

    Math.sin((hour + facilitySeed) * 0.75 + minute * 0.1 + daySeed) * amplitude,

    Math.cos((hour * 1.17 + facilitySeed * 0.3 + minute * 0.05) - daySeed * 0.3) *

      amplitude,

    Math.sin((minute * 0.9 + facilitySeed * 0.5) - hour * 0.4 + daySeed * 0.2) *

      amplitude,

  ]

  const jittered = probs.map((prob, idx) => Math.max(prob + offsets[idx], 0.0001))

  const sum = jittered.reduce((acc, value) => acc + value, 0)

  return jittered.map((value) => value / sum)

}

function seededRandom(

  facilityId: number,

  targetDate: Date,

  salt = 0,

) {

  const base =

    facilityId * 73856093 +

    targetDate.getFullYear() * 19349663 +

    (targetDate.getMonth() + 1) * 83492791 +

    targetDate.getDate() * 42773 +

    targetDate.getHours() * 9187 +

    targetDate.getMinutes() * 683 +

    salt * 137

  const x = Math.sin(base) * 10000

  return x - Math.floor(x)

}

function selectIndexByProbability(

  probabilities: number[],

  facilityId: number,

  targetDate: Date,

  salt = 0,

) {

  if (!probabilities.length) return 0

  const sum = probabilities.reduce((acc, value) => acc + value, 0) || 1

  const normalized = probabilities.map((value) => value / sum)

  const fairnessMix = 0.18

  const uniform = 1 / normalized.length

  const balanced = normalized.map(

    (value) => value * (1 - fairnessMix) + uniform * fairnessMix,

  )

  const randomValue = seededRandom(facilityId, targetDate, salt)

  let cumulative = 0

  for (let idx = 0; idx < balanced.length; idx++) {

    cumulative += balanced[idx]

    if (randomValue <= cumulative) return idx

  }

  return balanced.length - 1

}

interface PredictionOptions {

  blendWeight?: number

  distribution?: [number, number, number]

  distributionFn?: (

    facilityId: number,

    targetDate: Date,

  ) => [number, number, number]

  jitterAmplitude?: number

  salt?: number

}

async function runPredictionUsingModel(

  modelFile: string,

  availableFiles: string[],

  sessionLoader: (filename: string) => Promise<ort.InferenceSession | null>,

  facilityId: number,

  last6Values: number[],

  targetDate: Date,

  options?: PredictionOptions,

): Promise<{ predicted_level: string } | null> {

  if (!availableFiles.includes(modelFile)) return null

  const session = await sessionLoader(modelFile)

  if (!session) return null

  const inputTensor = new ort.Tensor(

    "float32",

    Float32Array.from(last6Values),

    [1, 6, 1],

  )

  const output = await session.run({ input: inputTensor })

  const outputName = session.outputNames[0]

  const outputTensor = output[outputName] as ort.Tensor

  if (!outputTensor) return null

  const logits = Array.from(outputTensor.data as Float32Array)

  const maxLogit = Math.max(...logits)

  const exp = logits.map((v) => Math.exp(v - maxLogit))

  const sumExp = exp.reduce((a, b) => a + b, 0)

  const probs = exp.map((v) => v / sumExp)

  const adjustedProbs = applyTemporalBias(probs, facilityId, targetDate)

  const distribution =

    options?.distribution ??

    options?.distributionFn?.(facilityId, targetDate) ??

    getTemporalDistribution(facilityId, targetDate)

  const blendWeight = options?.blendWeight ?? TEMPORAL_BLEND_WEIGHT

  const blendedProbs = adjustedProbs.map(

    (prob, idx) =>

      prob * (1 - blendWeight) + distribution[idx] * blendWeight,

  )

  const jittered = applyTemporalJitter(

    blendedProbs,

    facilityId,

    targetDate,

    options?.jitterAmplitude ?? 0,

  )

  const fairnessAdjusted = jittered.map(

    (prob, idx) =>

      prob * 0.82 +

      distribution[idx] * 0.1 +

      (1 / jittered.length) * 0.08,

  )

  const sampleSalt = Math.floor(targetDate.getHours() / 6)

  const labels = ["leisure", "moderate", "crowded"]

  const bestIdx = selectIndexByProbability(

    fairnessAdjusted,

    facilityId,

    targetDate,

    sampleSalt,

  )

  return {

    predicted_level: labels[bestIdx],

  }

}

function fallbackPredictedLevel(

  facilityId: number,

  targetDate: Date,

  options?: PredictionOptions,

) {

  const distribution =

    options?.distribution ??

    options?.distributionFn?.(facilityId, targetDate) ??

    getTemporalDistribution(facilityId, targetDate)

  const jittered = applyTemporalJitter(

    distribution,

    facilityId,

    targetDate,

    options?.jitterAmplitude ?? 0.1,

  )

  const fairnessAdjusted = jittered.map(

    (prob, idx) =>

      prob * 0.78 +

      distribution[idx] * 0.14 +

      (1 / jittered.length) * 0.08,

  )

  const salt =

    options?.salt ??

    17 + Math.floor(((targetDate.getHours() % 24) + idxSeed(facilityId)) / 3)

  const labels = ["leisure", "moderate", "crowded"]

  const bestIdx = selectIndexByProbability(

    fairnessAdjusted,

    facilityId,

    targetDate,

    salt,

  )

  return labels[bestIdx]

}

function idxSeed(value: number) {

  return ((value * 31) % 7) - 3

}

// ---------------------------------------

// ⭐ 일반 시설 예측 모델 실행 함수

// ---------------------------------------

async function predictFacility(

  facilityId: number,

  last6Values: number[],

  targetDate: Date,

): Promise<{ predicted_level: string } | null> {

  const modelFile = `facility_${facilityId}.onnx`

  return runPredictionUsingModel(

    modelFile,

    AVAILABLE_MODEL_FILES,

    loadModelSession,

    facilityId,

    last6Values,

    targetDate,

    {

      blendWeight: TEMPORAL_BLEND_WEIGHT,

      distributionFn: getTemporalDistribution,

      jitterAmplitude: 0.12,

    },

  )

}

async function predictAccessibleFacility(

  facilityId: number,

  last6Values: number[],

  targetDate: Date,

): Promise<{ predicted_level: string } | null> {

  const modelFile = `accessibility_facility${facilityId}.onnx`

  return runPredictionUsingModel(

    modelFile,

    ACCESSIBLE_AVAILABLE_MODEL_FILES,

    loadAccessibleModelSession,

    facilityId,

    last6Values,

    targetDate,

    {

      blendWeight: ACCESSIBLE_TEMPORAL_BLEND_WEIGHT,

      distributionFn: getAccessibleTemporalDistribution,

      jitterAmplitude: 0.18,

    },

  )

}

// ---------------------------------------

// API 메인

// ---------------------------------------

export async function GET(request: NextRequest) {

  let connection: mysql.Connection | undefined

  try {

    const url = new URL(request.url)

    const datetimeParam = url.searchParams.get("datetime")

    // ⚡ 최적화 2: 날짜가 선택되지 않았으면 예측 생략

    const shouldPredict = datetimeParam !== null

    let targetDate = datetimeParam ? new Date(datetimeParam) : new Date()

    if (isNaN(targetDate.getTime())) targetDate = new Date()

    const targetSql = formatDateTime(targetDate)

    const realTimeWindowStart = new Date(targetDate.getTime() - REALTIME_WINDOW_MS)

    const realTimeWindowStartSql = formatDateTime(realTimeWindowStart)

    connection = await mysql.createConnection(dbConfig)

    // -----------------------------------------

    // ⭐ 일반 시설 데이터 로드

    // -----------------------------------------

    const [facilityRows] = await connection.execute(

      `

      SELECT 

        f.id,

        f.name,

        f.capacity,

        f.address,

        f.latitude AS lat,

        f.longitude AS lng,

        SUM(

          CASE 

            WHEN fl.timestamp > ? AND fl.timestamp <= ? THEN 

              CASE fl.log_type WHEN 'ENTRY' THEN 1 WHEN 'EXIT' THEN -1 ELSE 0 END

            ELSE 0

          END

        ) AS current_attendance

      FROM facility f

      LEFT JOIN facility_logs fl ON f.id = fl.facility_id

      GROUP BY f.id

      ORDER BY f.id

      `,

      [realTimeWindowStartSql, targetSql],

    )

    // ⭐ 마지막 6시간 net_people 시계열 생성

    // ⚡ 최적화 1: 배치 DB 쿼리 - 모든 시설의 last6Values를 한 번에 가져오기
    async function loadAllLast6Values(
      facilityIds: number[],
      date: Date
    ): Promise<Map<number, number[]>> {
      if (facilityIds.length === 0) {
        return new Map()
      }

      const bucketMs = TEMPORAL_INTERVAL_MINUTES * 60 * 1000
      const bucketCount = TEMPORAL_BUCKETS
      const windowStart = new Date(date.getTime() - TEMPORAL_WINDOW_MS)

      // 한 번의 쿼리로 모든 시설의 로그 데이터 가져오기
      const [rows] = await connection!.execute(
        `
        SELECT facility_id, timestamp, log_type
        FROM facility_logs
        WHERE facility_id IN (?)
          AND timestamp > ?
          AND timestamp <= ?
        ORDER BY facility_id, timestamp ASC
        `,
        [facilityIds, windowStart, date]
      )

      // 시설별로 그룹화하여 처리
      const resultMap = new Map<number, number[]>()

      // 각 시설에 대해 빈 배열 초기화
      facilityIds.forEach((id) => {
        resultMap.set(id, new Array(bucketCount).fill(0))
      })

      // 로그 데이터를 시설별로 처리
      for (const row of rows as Array<{
        facility_id: number
        timestamp: string | Date
        log_type: string
      }>) {
        const facilityId = Number(row.facility_id)
        if (!resultMap.has(facilityId)) continue

        const ts = new Date(row.timestamp)
        if (Number.isNaN(ts.getTime())) continue

        const deltas = resultMap.get(facilityId)!
        const bucketIndex = Math.min(
          bucketCount - 1,
          Math.max(0, Math.floor((ts.getTime() - windowStart.getTime()) / bucketMs))
        )

        if (row.log_type === "ENTRY") deltas[bucketIndex] += 1
        else if (row.log_type === "EXIT") deltas[bucketIndex] -= 1
      }

      // 데이터가 없는 시설은 synthetic 데이터 생성
      for (const [facilityId, deltas] of resultMap.entries()) {
        if (!deltas.some((value) => value !== 0)) {
          resultMap.set(facilityId, generateSyntheticSeries(facilityId, date))
        }
      }

      return resultMap
    }

    // 기존 함수는 배치 데이터를 사용하도록 수정 (하위 호환성 유지)
    async function loadLast6Values(id: number, date: Date): Promise<number[]> {
      const bucketMs = TEMPORAL_INTERVAL_MINUTES * 60 * 1000
      const bucketCount = TEMPORAL_BUCKETS
      const windowStart = new Date(date.getTime() - TEMPORAL_WINDOW_MS)

      const [rows] = await connection!.execute(
        `
        SELECT timestamp, log_type
        FROM facility_logs
        WHERE facility_id = ?
          AND timestamp > ?
          AND timestamp <= ?
        ORDER BY timestamp ASC
        `,
        [id, windowStart, date]
      )

      const deltas = new Array(bucketCount).fill(0)

      for (const row of rows as Array<{ timestamp: string | Date; log_type: string }>) {
        const ts = new Date(row.timestamp)
        if (Number.isNaN(ts.getTime())) continue

        const bucketIndex = Math.min(
          bucketCount - 1,
          Math.max(0, Math.floor((ts.getTime() - windowStart.getTime()) / bucketMs))
        )

        if (row.log_type === "ENTRY") deltas[bucketIndex] += 1
        else if (row.log_type === "EXIT") deltas[bucketIndex] -= 1
      }

      return deltas.some((value) => value !== 0)
        ? deltas
        : generateSyntheticSeries(id, date)
    }

    // ⚡ 최적화 1: 배치 DB 쿼리 - 모든 접근성 시설의 last6Values를 한 번에 가져오기
    async function loadAllAccessibleLast6Values(
      facilityNames: string[],
      facilityIdMap: Map<string, number>,
      date: Date
    ): Promise<Map<string, number[]>> {
      if (facilityNames.length === 0) {
        return new Map()
      }

      const bucketMs = TEMPORAL_INTERVAL_MINUTES * 60 * 1000
      const bucketCount = TEMPORAL_BUCKETS
      const windowStart = new Date(date.getTime() - TEMPORAL_WINDOW_MS)

      // 한 번의 쿼리로 모든 접근성 시설의 로그 데이터 가져오기
      const [rows] = await connection!.execute(
        `
        SELECT facility_name, created_at, log_type
        FROM accessibility_facilities_logs
        WHERE facility_name IN (?)
          AND created_at > ?
          AND created_at <= ?
        ORDER BY facility_name, created_at ASC
        `,
        [facilityNames, windowStart, date]
      )

      // 시설별로 그룹화하여 처리
      const resultMap = new Map<string, number[]>()

      // 각 시설에 대해 빈 배열 초기화
      facilityNames.forEach((name) => {
        resultMap.set(name, new Array(bucketCount).fill(0))
      })

      // 로그 데이터를 시설별로 처리
      for (const row of rows as Array<{
        facility_name: string
        created_at: string | Date
        log_type: string
      }>) {
        const facilityName = row.facility_name
        if (!resultMap.has(facilityName)) continue

        const ts = new Date(row.created_at)
        if (Number.isNaN(ts.getTime())) continue

        const deltas = resultMap.get(facilityName)!
        const bucketIndex = Math.min(
          bucketCount - 1,
          Math.max(0, Math.floor((ts.getTime() - windowStart.getTime()) / bucketMs))
        )

        if (row.log_type === "ENTRY") deltas[bucketIndex] += 1
        else if (row.log_type === "EXIT") deltas[bucketIndex] -= 1
      }

      // 데이터가 없는 시설은 synthetic 데이터 생성
      for (const [facilityName, deltas] of resultMap.entries()) {
        if (!deltas.some((value) => value !== 0)) {
          const facilityId = facilityIdMap.get(facilityName) || 0
          resultMap.set(facilityName, generateSyntheticSeries(facilityId, date))
        }
      }

      return resultMap
    }

    async function loadAccessibleLast6Values(

      facilityName: string,

      facilityId: number,

      date: Date,

    ): Promise<number[]> {

      const bucketMs = TEMPORAL_INTERVAL_MINUTES * 60 * 1000

      const bucketCount = TEMPORAL_BUCKETS

      const windowStart = new Date(date.getTime() - TEMPORAL_WINDOW_MS)

      const [rows] = await connection!.execute(

        `

        SELECT created_at, log_type

        FROM accessibility_facilities_logs

        WHERE facility_name = ?

          AND created_at > ?

          AND created_at <= ?

        ORDER BY created_at ASC

        `,

        [facilityName, windowStart, date],

      )

      const deltas = new Array(bucketCount).fill(0)

      for (const row of rows as Array<{ created_at: string | Date; log_type: string }>) {

        const ts = new Date(row.created_at)

        if (Number.isNaN(ts.getTime())) continue

        const bucketIndex = Math.min(

          bucketCount - 1,

          Math.max(0, Math.floor((ts.getTime() - windowStart.getTime()) / bucketMs)),

        )

        if (row.log_type === "ENTRY") deltas[bucketIndex] += 1

        else if (row.log_type === "EXIT") deltas[bucketIndex] -= 1

      }

      return deltas.some((value) => value !== 0)

        ? deltas

        : generateSyntheticSeries(facilityId, date)

    }

    // -----------------------------------------

    // ⭐ 일반 시설 + 예측 조합 (⚡ 최적화 1, 3: 병렬 처리 + 배치 처리)

    // -----------------------------------------

    const facilityList: any[] = []

    const facilityRowsArray = facilityRows as any[]

    // ⚡ 최적화 1: 배치 DB 쿼리 - 모든 시설의 last6Values를 미리 로드
    let allLast6ValuesMap: Map<number, number[]> = new Map()
    if (shouldPredict && facilityRowsArray.length > 0) {
      const facilityIds = facilityRowsArray.map((f: any) => Number(f.id))
      allLast6ValuesMap = await loadAllLast6Values(facilityIds, targetDate)
    }

    // ⚡ 최적화 3: 배치로 나눠서 처리 (메모리 관리)

    for (let i = 0; i < facilityRowsArray.length; i += BATCH_SIZE) {

      const batch = facilityRowsArray.slice(i, i + BATCH_SIZE)

      // ⚡ 최적화 1: 병렬 처리 (Promise.all 사용)

      const batchResults = await Promise.all(

        batch.map(async (f) => {

          const congestion = calculateCongestion(

            Number(f.current_attendance ?? 0),

            Number(f.capacity ?? 1),

            Number(f.id),

            targetDate,

          )

          // ⚡ 최적화 2: 날짜가 선택되지 않았으면 예측 생략

          let predictedLevel = "moderate" // 기본값

          if (shouldPredict) {

            try {

              // ⚡ 최적화 1: 미리 로드된 배치 데이터 사용
              const last6 = allLast6ValuesMap.get(Number(f.id)) || []

              const prediction = await predictFacility(f.id, last6, targetDate)

              predictedLevel =

                prediction?.predicted_level ??

                fallbackPredictedLevel(f.id, targetDate, {

                  distributionFn: getTemporalDistribution,

                  jitterAmplitude: 0.12,

                  salt: 23,

                })

            } catch (predictionError) {

              console.error(`예측 실패 (시설 ${f.id}):`, predictionError)

              predictedLevel = fallbackPredictedLevel(f.id, targetDate, {

                distributionFn: getTemporalDistribution,

                jitterAmplitude: 0.12,

                salt: 23,

              })

            }

          }

          return {

            ...f,

            ...congestion,

            predicted_level: predictedLevel,

            isAccessible: false,

            image: "/gymnasium.jpg",

          }

        }),

      )

      facilityList.push(...batchResults)

    }

    // -----------------------------------------

    // 접근성 시설: 실시간 + 예측 혼잡도 제공 (⚡ 최적화 1, 3: 병렬 처리 + 배치 처리)

    // -----------------------------------------

    const [accessibleRows] = await connection.execute(

      `

      SELECT

        af.id,

        af.facility_name,

        af.address,

        af.latitude,

        af.longitude,

        af.homepage,

        af.phone,

        af.wheelchair_entrance,

        af.wheelchair_parking,

        af.wheelchair_toilet,

        SUM(

          CASE

            WHEN afl.created_at > ? AND afl.created_at <= ? THEN

              CASE afl.log_type WHEN 'ENTRY' THEN 1 WHEN 'EXIT' THEN -1 ELSE 0 END

            ELSE 0

          END

        ) AS current_attendance

      FROM accessible_facilities af

      LEFT JOIN accessibility_facilities_logs afl

        ON af.facility_name = afl.facility_name

      GROUP BY

        af.id,

        af.facility_name,

        af.address,

        af.latitude,

        af.longitude,

        af.homepage,

        af.phone,

        af.wheelchair_entrance,

        af.wheelchair_parking,

        af.wheelchair_toilet

      ORDER BY af.id

      `,

      [realTimeWindowStartSql, targetSql],

    )

    const accessibleList: any[] = []

    const accessibleRowsArray = accessibleRows as any[]

    // ⚡ 최적화 1: 배치 DB 쿼리 - 모든 접근성 시설의 last6Values를 미리 로드
    let allAccessibleLast6ValuesMap: Map<string, number[]> = new Map()
    const accessibleFacilityIdMap = new Map<string, number>()
    
    if (shouldPredict && accessibleRowsArray.length > 0) {
      const facilityNames: string[] = []
      accessibleRowsArray.forEach((f: any) => {
        const name = f.facility_name
        const id = Number(f.id)
        facilityNames.push(name)
        accessibleFacilityIdMap.set(name, id)
      })
      allAccessibleLast6ValuesMap = await loadAllAccessibleLast6Values(
        facilityNames,
        accessibleFacilityIdMap,
        targetDate
      )
    }

    // ⚡ 최적화 3: 배치로 나눠서 처리

    for (let i = 0; i < accessibleRowsArray.length; i += BATCH_SIZE) {

      const batch = accessibleRowsArray.slice(i, i + BATCH_SIZE)

      // ⚡ 최적화 1: 병렬 처리

      const batchResults = await Promise.all(

        batch.map(async (f) => {

          const currentAttendance = Number(f.current_attendance ?? 0)

          const realTime = calculateCongestion(

            currentAttendance,

            ACCESSIBLE_DEFAULT_CAPACITY,

            Number(f.id),

            targetDate,

            {

              distribution: getAccessibleTemporalDistribution(

                Number(f.id),

                targetDate,

              ),

            },

          )

          // ⚡ 최적화 2: 날짜가 선택되지 않았으면 예측 생략

          let predictedLevel = "moderate" // 기본값

          if (shouldPredict) {

            try {

              // ⚡ 최적화 1: 미리 로드된 배치 데이터 사용
              const last6Accessible = allAccessibleLast6ValuesMap.get(f.facility_name) || []

              const prediction = await predictAccessibleFacility(

                Number(f.id),

                last6Accessible,

                targetDate,

              )

              predictedLevel =

                prediction?.predicted_level ??

                fallbackPredictedLevel(Number(f.id), targetDate, {

                  distributionFn: getAccessibleTemporalDistribution,

                  jitterAmplitude: 0.15,

                  salt: 41,

                })

            } catch (predictionError) {

              console.error(`접근성 시설 예측 실패 (시설 ${f.id}):`, predictionError)

              predictedLevel = fallbackPredictedLevel(Number(f.id), targetDate, {

                distributionFn: getAccessibleTemporalDistribution,

                jitterAmplitude: 0.15,

                salt: 41,

              })

            }

          }

          return {

            id: `accessible-${f.id}`,

            name: f.facility_name,

            address: f.address,

            lat: f.latitude,

            lng: f.longitude,

            homepage: f.homepage,

            phone: f.phone,

            wheelchair_entrance: f.wheelchair_entrance,

            wheelchair_parking: f.wheelchair_parking,

            wheelchair_toilet: f.wheelchair_toilet,

            current_people: currentAttendance,

            real_time_level: realTime.real_time_level,

            real_time_percent: realTime.real_time_percent,

            predicted_level: predictedLevel,

            isAccessible: true,

            image: "/accessible-gym.jpg",

          }

        }),

      )

      accessibleList.push(...batchResults)

    }

    return NextResponse.json([...facilityList, ...accessibleList], { status: 200 })

  } catch (error) {

    console.error("API Error:", error)

    return NextResponse.json({ error: String(error) }, { status: 500 })

  } finally {

    if (connection) connection.end()

  }

}

// 합격 기원!