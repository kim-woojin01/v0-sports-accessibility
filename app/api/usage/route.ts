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
      // 전체 이용 내역 조회 (리뷰 작성 여부와 관계없이)
      // all 파라미터가 있으면 전체 조회, 없으면 리뷰가 없는 것만 조회
      const { searchParams } = new URL(request.url)
      const all = searchParams.get("all") === "true"
      
      // 먼저 이용 내역 조회
      let usageQuery = `
        SELECT 
          u.id AS usage_id,
          u.facility_id,
          u.used_at,
          DATE_FORMAT(u.used_at, '%Y-%m-%d') AS used_date,
          DATE_FORMAT(u.used_at, '%H:%i') AS used_time
        FROM facility_usage u
        WHERE u.user_id = ?
        ORDER BY u.used_at DESC
      `
      
      const [usageRows] = await connection.execute(usageQuery, [numericUserId])
      
      // 각 이용 내역에 대해 리뷰 작성 여부 확인
      const usageIds = (usageRows as any[]).map((u) => u.usage_id)
      let reviewMap = new Map<number, boolean>()
      
      // 시설별 리뷰 작성 횟수 조회 (facility_id와 user_id 기준)
      let facilityReviewCountMap = new Map<number, number>()
      
      if (usageIds.length > 0) {
        // 모든 이용 내역에 대한 리뷰 존재 여부 확인
        const placeholders = usageIds.map(() => "?").join(",")
        const [reviews] = await connection.execute(
          `SELECT DISTINCT facility_usage_id 
           FROM facility_reviews 
           WHERE facility_usage_id IN (${placeholders}) AND facility_usage_id IS NOT NULL`,
          usageIds
        )
        
        // 리뷰가 있는 이용 내역 ID를 Map에 저장
        ;(reviews as any[]).forEach((r) => {
          if (r.facility_usage_id) {
            reviewMap.set(r.facility_usage_id, true)
          }
        })
        
        // 시설별 리뷰 작성 횟수 조회 (동일 시설에 여러 날짜에 작성된 리뷰 개수)
        const facilityIds = [...new Set((usageRows as any[]).map((u) => u.facility_id))]
        if (facilityIds.length > 0) {
          const facilityPlaceholders = facilityIds.map(() => "?").join(",")
          const [facilityReviews] = await connection.execute(
            `SELECT facility_id, COUNT(*) as review_count
             FROM facility_reviews
             WHERE facility_id IN (${facilityPlaceholders}) AND user_id = ?
             GROUP BY facility_id`,
            [...facilityIds, numericUserId]
          )
          
          ;(facilityReviews as any[]).forEach((fr) => {
            facilityReviewCountMap.set(fr.facility_id, fr.review_count)
          })
        }
        
        // all=false일 때는 리뷰가 없는 이용 내역만 필터링
        if (!all) {
          const reviewedUsageIds = new Set(Array.from(reviewMap.keys()))
          const filteredUsageRows = (usageRows as any[]).filter((u) => !reviewedUsageIds.has(u.usage_id))
          
          // 필터링된 결과를 usageRows에 반영
          usageRows.length = 0
          usageRows.push(...filteredUsageRows)
        }
      }

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
        const hasReview = reviewMap.get(u.usage_id) || false
        const reviewCount = facilityReviewCountMap.get(u.facility_id) || 0
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
          has_review: hasReview, // 리뷰 작성 여부 (정확한 매칭)
          review_count: reviewCount, // 시설별 리뷰 작성 횟수
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





