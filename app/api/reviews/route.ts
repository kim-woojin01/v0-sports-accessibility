import { NextResponse } from "next/server"
import mysql from "mysql2/promise"

// Railway DB 설정 (51173 포트 - 통합 DB)
// Vercel 환경 변수: RAILWAY_HOST, RAILWAY_PORT, RAILWAY_USER, RAILWAY_PASSWORD, RAILWAY_DATABASE
const dbConfig = {
  host: process.env.RAILWAY_HOST || process.env.RAILWAY_REVIEWS_HOST || "nozomi.proxy.rlwy.net",
  port: Number(process.env.RAILWAY_PORT || process.env.RAILWAY_REVIEWS_PORT) || 51173,
  user: process.env.RAILWAY_USER || process.env.RAILWAY_REVIEWS_USER || "root",
  password: process.env.RAILWAY_PASSWORD || process.env.RAILWAY_REVIEWS_PASSWORD || "lRzqwghWSchqdRyErESveHwVyKYUfhME",
  database: process.env.RAILWAY_DATABASE || process.env.RAILWAY_REVIEWS_DATABASE || "railway",
  connectTimeout: 10000,
  acquireTimeout: 10000,
  timeout: 10000,
  reconnect: true,
}

// 시설 정보 조회용 DB (동일한 DB 사용)
const facilityDbConfig = {
  host: process.env.RAILWAY_HOST || "nozomi.proxy.rlwy.net",
  port: Number(process.env.RAILWAY_PORT) || 51173,
  user: process.env.RAILWAY_USER || "root",
  password: process.env.RAILWAY_PASSWORD || "lRzqwghWSchqdRyErESveHwVyKYUfhME",
  database: process.env.RAILWAY_DATABASE || "railway",
  connectTimeout: 10000,
  acquireTimeout: 10000,
  timeout: 10000,
  reconnect: true,
}

// GET /api/reviews
// - 전체 리뷰
// - ?facilityId=1 → 해당 시설 리뷰만
// - ?userId=3 → 특정 유저의 리뷰만
// - ?search=서울 or 시설명 → 시설명/주소 기준 검색
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const facilityId = searchParams.get("facilityId")
  const userId = searchParams.get("userId")
  const search = searchParams.get("search")

  let connection: mysql.Connection | undefined
  let facilityConnection: mysql.Connection | undefined

  try {
    connection = await mysql.createConnection(dbConfig)
    facilityConnection = await mysql.createConnection(facilityDbConfig)

    const where: string[] = []
    const params: any[] = []

    if (facilityId) {
      where.push("r.facility_id = ?")
      params.push(Number(facilityId))
    }
    if (userId) {
      where.push("r.user_id = ?")
      params.push(Number(userId))
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : ""

    // 리뷰 데이터 조회 (Railway DB)
    const [rows] = await connection.execute(
      `
      SELECT
        r.id,
        r.facility_id,
        r.user_id,
        r.user_name,
        r.rating,
        r.content,
        r.tags,
        DATE_FORMAT(r.created_at, '%Y-%m-%d') AS date
      FROM facility_reviews r
      ${whereSql}
      ORDER BY r.created_at DESC
      `,
      params,
    )

    // 시설 정보 조회 (API DB에서 시설명 매칭)
    const facilityIds = [...new Set((rows as any[]).map((r) => r.facility_id))]
    let facilityMap = new Map<number, { name: string; address: string }>()

    if (facilityIds.length > 0) {
      const placeholders = facilityIds.map(() => "?").join(",")
      const [facilities] = await facilityConnection.execute(
        `SELECT id, name, address FROM facility WHERE id IN (${placeholders})`,
        facilityIds,
      )

      facilities.forEach((f: any) => {
        facilityMap.set(f.id, { name: f.name, address: f.address || "" })
      })
    }

    // 검색 필터 적용 (시설명 기준)
    let filteredRows = rows as any[]
    if (search) {
      filteredRows = filteredRows.filter((r) => {
        const facility = facilityMap.get(r.facility_id)
        if (!facility) return false
        return (
          facility.name.toLowerCase().includes(search.toLowerCase()) ||
          facility.address.toLowerCase().includes(search.toLowerCase())
        )
      })
    }

    // tags 는 JSON 문자열로 저장했다고 가정
    const mapped = filteredRows.map((row) => {
      const facility = facilityMap.get(row.facility_id)
      return {
        id: row.id,
        facilityId: row.facility_id,
        userId: row.user_id,
        userName: row.user_name,
        rating: row.rating,
        content: row.content,
        date: row.date,
        tags: row.tags ? (typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags) : [],
        facilityName: facility?.name || `시설 ID: ${row.facility_id}`,
        facilityAddress: facility?.address || "",
      }
    })

    return NextResponse.json(mapped, { status: 200 })
  } catch (error) {
    console.error("리뷰 조회 오류:", error)
    // 테이블이 없거나 오류가 발생해도 빈 배열 반환 (UI 크래시 방지)
    return NextResponse.json([], { status: 200 })
  } finally {
    if (connection) await connection.end()
    if (facilityConnection) await facilityConnection.end()
  }
}

// POST /api/reviews  (리뷰 작성)
export async function POST(request: Request) {
  let connection: mysql.Connection | undefined

  try {
    const body = await request.json()
    const { facilityId, userId, userName, rating, content, tags, facilityUsageId } = body

    if (!facilityId || !userId || !userName || !rating || !content) {
      return NextResponse.json({ error: "필수 값 누락" }, { status: 400 })
    }

    // facility_usage_id는 필수 (이용 내역 기반 리뷰만 허용)
    if (!facilityUsageId) {
      return NextResponse.json(
        { error: "이용 내역 정보가 필요합니다. 리뷰 작성하기 버튼을 통해 이용한 시설에 대해서만 리뷰를 작성할 수 있습니다." },
        { status: 400 }
      )
    }

    connection = await mysql.createConnection(dbConfig)

    // facility_usage_id가 제공된 경우, 해당 이용 내역에 대한 리뷰가 이미 있는지 확인
    const [existingReviews] = await connection.execute(
      `
      SELECT id FROM facility_reviews
      WHERE facility_usage_id = ?
      `,
      [Number(facilityUsageId)],
    )

    if ((existingReviews as any[]).length > 0) {
      return NextResponse.json({ error: "이미 해당 이용 내역에 대한 리뷰가 작성되었습니다." }, { status: 400 })
    }

    // 이용 내역이 해당 사용자의 것인지 확인 및 날짜 정보 가져오기
    const [usageCheck] = await connection.execute(
      `
      SELECT id, used_at, DATE_FORMAT(used_at, '%Y-%m-%d') AS used_date
      FROM facility_usage
      WHERE id = ? AND user_id = ? AND facility_id = ?
      `,
      [Number(facilityUsageId), Number(userId), Number(facilityId)],
    )

    if ((usageCheck as any[]).length === 0) {
      return NextResponse.json({ error: "유효하지 않은 이용 내역입니다." }, { status: 400 })
    }

    const usage = (usageCheck as any[])[0]
    const usedDate = usage.used_date

    // 동일한 날짜, 동일한 시설, 동일한 사용자에 대한 리뷰가 이미 있는지 확인
    // 같은 날짜에 같은 시설을 여러 번 이용했을 수 있으므로, 모든 이용 내역을 확인
    const [duplicateReviews] = await connection.execute(
      `
      SELECT r.id, DATE_FORMAT(u.used_at, '%Y-%m-%d') AS review_date
      FROM facility_reviews r
      INNER JOIN facility_usage u ON r.facility_usage_id = u.id
      WHERE r.user_id = ?
        AND r.facility_id = ?
        AND DATE_FORMAT(u.used_at, '%Y-%m-%d') = ?
      LIMIT 1
      `,
      [Number(userId), Number(facilityId), usedDate],
    )

    if ((duplicateReviews as any[]).length > 0) {
      return NextResponse.json(
        { error: `이미 ${usedDate}에 해당 시설에 대한 리뷰를 작성하셨습니다. 같은 날짜에는 하나의 리뷰만 작성할 수 있습니다.` },
        { status: 400 }
      )
    }

    const [result] = await connection.execute(
      `
      INSERT INTO facility_reviews
        (facility_id, user_id, user_name, rating, content, tags, facility_usage_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        Number(facilityId),
        Number(userId),
        String(userName),
        Number(rating),
        String(content),
        JSON.stringify(tags ?? []),
        facilityUsageId ? Number(facilityUsageId) : null,
      ],
    )

    // @ts-ignore
    const insertId = result.insertId

    return NextResponse.json({ id: insertId }, { status: 201 })
  } catch (error) {
    console.error("리뷰 작성 오류:", error)
    return NextResponse.json({ error: "리뷰 작성 실패" }, { status: 500 })
  } finally {
    if (connection) await connection.end()
  }
}





