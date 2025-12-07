/**
 * API 테스트 스크립트 - 이용 내역 조회 확인
 */

const mysql = require("mysql2/promise")

// Railway DB
const railwayDbConfig = {
  host: "nozomi.proxy.rlwy.net",
  port: 51173,
  user: "root",
  password: "lRzqwghWSchqdRyErESveHwVyKYUfhME",
  database: "railway",
}

// API DB
const apiDbConfig = {
  host: "caboose.proxy.rlwy.net",
  port: 44225,
  user: "root",
  password: "OYtPVGecIvjzArpQfMWwRNyyXnEfsXaD",
  database: "railway",
}

async function testAPI() {
  let railwayConnection
  let apiConnection

  try {
    console.log("🔌 Railway DB 연결 중...")
    railwayConnection = await mysql.createConnection(railwayDbConfig)
    console.log("✅ Railway DB 연결 성공!\n")

    console.log("🔌 API DB 연결 중...")
    apiConnection = await mysql.createConnection(apiDbConfig)
    console.log("✅ API DB 연결 성공!\n")

    // 사용자 조회
    const [users] = await railwayConnection.execute(`SELECT id, name, user_id_email FROM users LIMIT 5`)
    console.log("👤 사용자 목록:")
    users.forEach((u) => {
      console.log(`   - ID: ${u.id}, 이름: ${u.name}, 이메일: ${u.user_id_email}`)
    })
    console.log()

    // 첫 번째 사용자의 이용 내역 확인
    const testUserId = users[0].id
    console.log(`📝 사용자 ID ${testUserId}의 이용 내역 확인:\n`)

    const [usageRows] = await railwayConnection.execute(
      `
      SELECT 
        u.id,
        u.facility_id,
        u.used_at,
        DATE_FORMAT(u.used_at, '%Y-%m-%d') AS used_date,
        DATE_FORMAT(u.used_at, '%H:%i') AS used_time
      FROM facility_usage u
      WHERE u.user_id = ?
      ORDER BY u.used_at DESC
      LIMIT 10
      `,
      [testUserId],
    )

    console.log(`✅ 이용 내역 ${usageRows.length}개 발견:`)
    usageRows.forEach((u) => {
      console.log(`   - 시설 ID: ${u.facility_id}, 이용일: ${u.used_date} ${u.used_time}`)
    })
    console.log()

    // 시설 정보 조회
    const facilityIds = [...new Set(usageRows.map((u) => u.facility_id))]
    if (facilityIds.length > 0) {
      const placeholders = facilityIds.map(() => "?").join(",")
      const [facilities] = await apiConnection.execute(
        `SELECT id, name, address FROM facility WHERE id IN (${placeholders})`,
        facilityIds,
      )

      console.log(`🏢 시설 정보:`)
      facilities.forEach((f) => {
        console.log(`   - ID: ${f.id}, 이름: ${f.name}`)
      })
    }

  } catch (error) {
    console.error("\n❌ 오류 발생:")
    console.error(error.message)
    if (error.code) {
      console.error(`   Error Code: ${error.code}`)
    }
  } finally {
    if (railwayConnection) await railwayConnection.end()
    if (apiConnection) await apiConnection.end()
  }
}

testAPI()







