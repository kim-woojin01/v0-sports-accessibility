/**
 * API 엔드포인트를 직접 테스트하는 스크립트
 */

const mysql = require("mysql2/promise")

// Railway DB (실제 이용 내역 데이터)
const railwayDbConfig = {
  host: "nozomi.proxy.rlwy.net",
  port: 51173,
  user: "root",
  password: "lRzqwghWSchqdRyErESveHwVyKYUfhME",
  database: "railway",
}

// API DB (시설 정보)
const apiDbConfig = {
  host: "caboose.proxy.rlwy.net",
  port: 51173,
  user: "root",
  password: "OYtPVGecIvjzArpQfMWwRNyyXnEfsXaD",
  database: "railway",
}

async function testAPIDirect() {
  let railwayConnection
  let apiConnection

  try {
    console.log("🔌 Railway DB 연결 중...")
    railwayConnection = await mysql.createConnection(railwayDbConfig)
    console.log("✅ Railway DB 연결 성공!\n")

    console.log("🔌 API DB 연결 중...")
    apiConnection = await mysql.createConnection(apiDbConfig)
    console.log("✅ API DB 연결 성공!\n")

    const testUserId = 1
    console.log(`📝 사용자 ID ${testUserId}의 이용 내역 조회 (API 로직과 동일):\n`)

    // 1. Railway DB에서 이용 내역 조회
    const [usageRows] = await railwayConnection.execute(
      `
      SELECT 
        u.facility_id,
        DATE_FORMAT(u.used_at, '%Y-%m-%d') AS used_date,
        DATE_FORMAT(u.used_at, '%H:%i') AS used_time
      FROM facility_usage u
      WHERE u.user_id = ?
      ORDER BY u.used_at DESC
      `,
      [testUserId],
    )

    console.log(`✅ Railway DB에서 조회된 이용 내역: ${usageRows.length}개`)
    usageRows.forEach((u) => {
      console.log(`   - 시설 ID: ${u.facility_id}, 이용일: ${u.used_date} ${u.used_time}`)
    })
    console.log()

    if (usageRows.length === 0) {
      console.log("⚠️  이용 내역이 없습니다. facility_usage 테이블을 확인하세요.")
      return
    }

    // 2. 시설 정보 조회
    const facilityIds = [...new Set(usageRows.map((u) => u.facility_id))]
    console.log(`🏢 조회할 시설 ID 목록: ${facilityIds.join(", ")}\n`)

    if (facilityIds.length > 0) {
      const placeholders = facilityIds.map(() => "?").join(",")
      const [facilities] = await apiConnection.execute(
        `SELECT id, name, address, capacity, latitude AS lat, longitude AS lng FROM facility WHERE id IN (${placeholders})`,
        facilityIds,
      )

      console.log(`✅ API DB에서 조회된 시설 정보: ${facilities.length}개`)
      facilities.forEach((f) => {
        console.log(`   - ID: ${f.id}, 이름: ${f.name}`)
      })
      console.log()

      // 3. 데이터 결합
      const facilityMap = new Map()
      facilities.forEach((f) => {
        facilityMap.set(f.id, f)
      })

      const rows = usageRows.map((u) => {
        const facility = facilityMap.get(u.facility_id)
        return {
          id: facility?.id || u.facility_id,
          name: facility?.name || `시설 ID: ${u.facility_id}`,
          address: facility?.address || "",
          image: "/placeholder.svg",
          capacity: facility?.capacity || 0,
          lat: facility?.lat || null,
          lng: facility?.lng || null,
          used_date: u.used_date,
          used_time: u.used_time,
        }
      })

      console.log(`📊 최종 반환 데이터: ${rows.length}개\n`)
      rows.forEach((r) => {
        console.log(`   - ${r.name} (ID: ${r.id})`)
        console.log(`     주소: ${r.address}`)
        console.log(`     이용일: ${r.used_date} ${r.used_time}\n`)
      })
    }

  } catch (error) {
    console.error("\n❌ 오류 발생:")
    console.error(error.message)
    if (error.code) {
      console.error(`   Error Code: ${error.code}`)
    }
    if (error.sql) {
      console.error(`   SQL: ${error.sql}`)
    }
  } finally {
    if (railwayConnection) await railwayConnection.end()
    if (apiConnection) await apiConnection.end()
  }
}

testAPIDirect()

