import { NextResponse } from "next/server"
import mysql from "mysql2/promise"

// Railway DB 설정 (실제 이용 내역 데이터가 저장된 DB)
// setup.js와 동일한 DB 사용
const dbConfig = {
  host: process.env.RAILWAY_REVIEWS_HOST || "nozomi.proxy.rlwy.net",
  port: Number(process.env.RAILWAY_REVIEWS_PORT) || 51173,
  user: process.env.RAILWAY_REVIEWS_USER || "root",
  password: process.env.RAILWAY_REVIEWS_PASSWORD,
  database: process.env.RAILWAY_REVIEWS_DATABASE || "railway",
}

if (!dbConfig.password) {
  throw new Error('RAILWAY_REVIEWS_PASSWORD environment variable is required')
}

// 시설 정보 조회용 DB (별도 연결)
const facilityDbConfig = {
  host: process.env.RAILWAY_HOST || "caboose.proxy.rlwy.net",
  port: Number(process.env.RAILWAY_PORT) || 44225,
  user: process.env.RAILWAY_USER || "root",
  password: process.env.RAILWAY_PASSWORD,
  database: process.env.RAILWAY_DATABASE || "railway",
}

if (!facilityDbConfig.password) {
  throw new Error('RAILWAY_PASSWORD environment variable is required')
}

// GET /api/usage?userId=1
// - 사용자가 실제 이용한 시설 목록
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "userId 필요" }, { status: 400 })
  }

  let connection: mysql.Connection | undefined
  let facilityConnection: mysql.Connection | undefined

  try {
    const numericUserId = Number(userId)
    if (!numericUserId || isNaN(numericUserId)) {
      console.error("유효하지 않은 userId:", userId)
      return NextResponse.json({ error: "유효하지 않은 userId" }, { status: 400 })
    }

    console.log("이용 내역 조회 시작 - userId:", numericUserId)
    connection = await mysql.createConnection(dbConfig)
    facilityConnection = await mysql.createConnection(facilityDbConfig)

    // 테이블이 없을 수 있으니 안전하게 처리
    try {
      // 이용 내역 조회 (Railway DB) - 리뷰가 작성되지 않은 이용 내역만
      const [usageRows] = await connection.execute(
        `
        SELECT 
          u.id AS usage_id,
          u.facility_id,
          u.used_at,
          DATE_FORMAT(u.used_at, '%Y-%m-%d') AS used_date,
          DATE_FORMAT(u.used_at, '%H:%i') AS used_time
        FROM facility_usage u
        LEFT JOIN facility_reviews r ON u.id = r.facility_usage_id
        WHERE u.user_id = ? AND r.id IS NULL
        ORDER BY u.used_at DESC
        `,
        [numericUserId],
      )

      console.log("이용 내역 조회 결과:", (usageRows as any[]).length, "개")

      // 시설 정보 조회 (API DB)
      const facilityIds = [...new Set((usageRows as any[]).map((u) => u.facility_id))]
      console.log("조회된 시설 ID 목록:", facilityIds)
      let facilityMap = new Map<number, any>()

      if (facilityIds.length > 0) {
        const placeholders = facilityIds.map(() => "?").join(",")
        const [facilities] = await facilityConnection.execute(
          `SELECT id, name, address, capacity, latitude AS lat, longitude AS lng FROM facility WHERE id IN (${placeholders})`,
          facilityIds,
        )

        console.log("시설 정보 조회 결과:", (facilities as any[]).length, "개")
        facilities.forEach((f: any) => {
          facilityMap.set(f.id, f)
        })
      }

      // 이용 내역과 시설 정보 결합
      const rows = (usageRows as any[]).map((u) => {
        const facility = facilityMap.get(u.facility_id)
        return {
          id: facility?.id || u.facility_id,
          usage_id: u.usage_id, // 이용 내역 ID 추가
          name: facility?.name || `시설 ID: ${u.facility_id}`,
          address: facility?.address || "",
          image: "/placeholder.svg", // image 컬럼이 없으므로 기본값 사용
          capacity: facility?.capacity || 0,
          lat: facility?.lat || null,
          lng: facility?.lng || null,
          used_date: u.used_date,
          used_time: u.used_time,
          used_at: u.used_at, // 전체 날짜/시간 정보
        }
      })

      return NextResponse.json(rows, { status: 200 })
    } catch (tableError: any) {
      // 테이블이 없으면 빈 배열 반환
      if (tableError.code === "ER_NO_SUCH_TABLE") {
        console.warn("facility_usage 테이블이 없습니다. 빈 배열을 반환합니다.")
        return NextResponse.json([], { status: 200 })
      }
      throw tableError
    }
  } catch (error) {
    console.error("이용 내역 조회 오류:", error)
    // 에러가 발생해도 빈 배열 반환 (UI 크래시 방지)
    return NextResponse.json([], { status: 200 })
  } finally {
    if (connection) await connection.end()
    if (facilityConnection) await facilityConnection.end()
  }
}





