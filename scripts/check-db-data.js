/**
 * Railway DB의 실제 데이터 확인 스크립트
 */

const mysql = require("mysql2/promise")
const fs = require("fs")
const path = require("path")

// .env.local 파일에서 환경 변수 읽기
try {
  const envPath = path.join(process.cwd(), ".env.local")
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, "utf8")
    envFile.split("\n").forEach((line) => {
      const match = line.match(/^([^=:#]+)=(.*)$/)
      if (match) {
        const key = match[1].trim()
        const value = match[2].trim().replace(/^["']|["']$/g, "")
        if (key && value) {
          process.env[key] = value
        }
      }
    })
  }
} catch (e) {
  console.warn("⚠️  .env.local 파일을 읽을 수 없습니다. 기본값을 사용합니다.")
}

// Railway DB 연결 설정 (API 라우트와 동일)
const dbConfig = {
  host: process.env.RAILWAY_HOST || "caboose.proxy.rlwy.net",
  port: Number(process.env.RAILWAY_PORT) || 44225,
  user: process.env.RAILWAY_USER || "root",
  password:
    process.env.RAILWAY_PASSWORD ||
    "OYtPVGecIvjzArpQfMWwRNyyXnEfsXaD",
  database: process.env.RAILWAY_DATABASE || "railway",
}

async function checkDBData() {
  let connection

  try {
    console.log("🔌 Railway MySQL에 연결 중...")
    connection = await mysql.createConnection(dbConfig)
    console.log("✅ 연결 성공!\n")

    // 1. 시설 확인
    console.log("📋 시설 테이블 확인:")
    const [facilities] = await connection.execute(`SELECT COUNT(*) as count FROM facility`)
    console.log(`   - 시설 수: ${facilities[0].count}개`)
    const [facilitySample] = await connection.execute(`SELECT id, name FROM facility LIMIT 5`)
    facilitySample.forEach((f) => {
      console.log(`   - ID: ${f.id}, 이름: ${f.name}`)
    })
    console.log()

    // 2. 사용자 확인
    console.log("👤 사용자 테이블 확인:")
    const [users] = await connection.execute(`SELECT COUNT(*) as count FROM users`)
    console.log(`   - 사용자 수: ${users[0].count}명`)
    const [userSample] = await connection.execute(`SELECT id, name, user_id_email FROM users LIMIT 5`)
    userSample.forEach((u) => {
      console.log(`   - ID: ${u.id}, 이름: ${u.name}, 이메일: ${u.user_id_email}`)
    })
    console.log()

    // 3. 이용 내역 확인
    console.log("📝 이용 내역 테이블 확인:")
    const [usage] = await connection.execute(`SELECT COUNT(*) as count FROM facility_usage`)
    console.log(`   - 이용 내역 수: ${usage[0].count}개`)
    const [usageSample] = await connection.execute(`
      SELECT u.id, u.user_id, u.facility_id, f.name as facility_name, u.used_at
      FROM facility_usage u
      LEFT JOIN facility f ON u.facility_id = f.id
      ORDER BY u.used_at DESC
      LIMIT 5
    `)
    usageSample.forEach((u) => {
      console.log(`   - 사용자 ID: ${u.user_id}, 시설: ${u.facility_name || `ID ${u.facility_id}`}, 이용일: ${u.used_at}`)
    })
    console.log()

    // 4. 리뷰 확인
    console.log("⭐ 리뷰 테이블 확인:")
    const [reviews] = await connection.execute(`SELECT COUNT(*) as count FROM facility_reviews`)
    console.log(`   - 리뷰 수: ${reviews[0].count}개`)
    
    if (reviews[0].count > 0) {
      const [reviewSample] = await connection.execute(`
        SELECT 
          r.id,
          r.facility_id,
          f.name as facility_name,
          r.user_id,
          r.user_name,
          r.rating,
          LEFT(r.content, 50) as content_preview,
          r.tags,
          r.created_at
        FROM facility_reviews r
        LEFT JOIN facility f ON r.facility_id = f.id
        ORDER BY r.created_at DESC
        LIMIT 10
      `)
      console.log("   최근 리뷰:")
      reviewSample.forEach((r) => {
        console.log(`   - ID: ${r.id}, 시설: ${r.facility_name || `ID ${r.facility_id}`}, 작성자: ${r.user_name}, 평점: ${r.rating}점`)
        console.log(`     내용: ${r.content_preview}...`)
        console.log(`     작성일: ${r.created_at}`)
      })
    } else {
      console.log("   ⚠️  리뷰가 없습니다!")
    }
    console.log()

    // 5. 테이블 구조 확인
    console.log("🔍 facility_reviews 테이블 구조:")
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'facility_reviews'
      ORDER BY ORDINAL_POSITION
    `, [dbConfig.database])
    columns.forEach((col) => {
      console.log(`   - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'YES' ? '(NULL 가능)' : '(NOT NULL)'}`)
    })

  } catch (error) {
    console.error("\n❌ 오류 발생:")
    console.error(error.message)
    if (error.code) {
      console.error(`   Error Code: ${error.code}`)
    }
    if (error.sql) {
      console.error(`   SQL: ${error.sql}`)
    }
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
      console.log("\n🔌 연결 종료")
    }
  }
}

checkDBData()



