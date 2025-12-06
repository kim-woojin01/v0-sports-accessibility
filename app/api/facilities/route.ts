import { NextResponse } from "next/server"
import mysql from "mysql2/promise"

// --- DB 연결 설정: 기본값을 Railway 설정으로 고정 ---
const dbConfig = {
  host: process.env.RAILWAY_HOST || "caboose.proxy.rlwy.net",
  port: Number(process.env.RAILWAY_PORT) || 44225,
  user: process.env.RAILWAY_USER || "root",
  password:
    process.env.RAILWAY_PASSWORD ||
    "OYtPVGecIvjzArpQfMWwRNyyXnEfsXaD",
  database: process.env.RAILWAY_DATABASE || "railway",
}

// --- 혼잡도 계산 헬퍼 함수 ---
function calculateCongestion(attendance: number, capacity: number) {
  const safe_attendance = Math.max(0, attendance)
  const safeCapacity = capacity > 0 ? capacity : 1

  const percent = Math.min(100, Math.round((safe_attendance / safeCapacity) * 100))

  let level: "여유" | "보통" | "혼잡"
  if (percent <= 30) {
    level = "여유"
  } else if (percent <= 70) {
    level = "보통"
  } else {
    level = "혼잡"
  }

  return {
    current_people: safe_attendance,
    real_time_percent: percent,
    real_time_level: level,
  }
}

export async function GET() {
  let connection: mysql.Connection | undefined

  try {
    connection = await mysql.createConnection(dbConfig)

    const [rows] = await connection.execute(`
      SELECT 
        f.id, 
        f.name, 
        f.capacity,
        f.address,
        f.latitude AS lat,
        f.longitude AS lng,
        SUM(
          CASE 
            WHEN fl.log_type = 'ENTRY' THEN 1 
            WHEN fl.log_type = 'EXIT' THEN -1
            ELSE 0 
          END
        ) AS current_attendance
      FROM facility f
      LEFT JOIN facility_logs fl ON f.id = fl.facility_id
      GROUP BY 
        f.id, 
        f.name, 
        f.capacity, 
        f.address,
        f.latitude, 
        f.longitude
      ORDER BY f.id;
    `)

    const facilitiesWithCongestion = (rows as any[]).map((facility) => {
      const { current_attendance, capacity, ...rest } = facility
      const safeCapacity = Number(capacity) > 0 ? Number(capacity) : 1

      const congestionData = calculateCongestion(
        current_attendance === null ? 0 : Number(current_attendance),
        safeCapacity,
      )

      return {
        ...rest,
        capacity: safeCapacity,
        ...congestionData,
      }
    })

    return NextResponse.json(facilitiesWithCongestion, { status: 200 })
  } catch (error) {
    console.error("DB 조회 오류:", error)
    // 디버깅을 위해 에러 내용을 그대로 내려줌
    return NextResponse.json(
      {
        error: "DB 조회 실패",
        detail: (error as Error).message ?? String(error),
      },
      { status: 500 },
    )
  } finally {
    if (connection) await connection.end()
  }
}


