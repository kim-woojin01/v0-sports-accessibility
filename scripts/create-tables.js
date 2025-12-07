/**
 * Railway MySQL에 리뷰 시스템 테이블 생성 스크립트
 * 
 * 사용법:
 *   node scripts/create-tables.js
 * 
 * 또는 npm script로 실행:
 *   npm run create-tables
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

// Railway DB 연결 설정
const dbConfig = {
  host: process.env.RAILWAY_HOST || "caboose.proxy.rlwy.net",
  port: Number(process.env.RAILWAY_PORT) || 51173,
  user: process.env.RAILWAY_USER || "root",
  password:
    process.env.RAILWAY_PASSWORD ||
    "OYtPVGecIvjzArpQfMWwRNyyXnEfsXaD",
  database: process.env.RAILWAY_DATABASE || "railway",
}

// 테이블 생성 SQL
const createTablesSQL = [
  `
  CREATE TABLE IF NOT EXISTS facility_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    facility_id INT NOT NULL,
    user_id INT NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    rating INT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_facility (facility_id),
    INDEX idx_user (user_id),
    INDEX idx_created_at (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `,
  `
  CREATE TABLE IF NOT EXISTS facility_usage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    facility_id INT NOT NULL,
    used_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_facility (facility_id),
    INDEX idx_used_at (used_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `,
]

async function createTables() {
  let connection

  try {
    console.log("🔌 Railway MySQL에 연결 중...")
    console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`)
    console.log(`   Database: ${dbConfig.database}`)

    connection = await mysql.createConnection(dbConfig)
    console.log("✅ 연결 성공!\n")

    // 테이블 생성
    for (let i = 0; i < createTablesSQL.length; i++) {
      const sql = createTablesSQL[i]
      const tableName = i === 0 ? "facility_reviews" : "facility_usage"

      console.log(`📝 ${tableName} 테이블 생성 중...`)
      await connection.execute(sql)
      console.log(`✅ ${tableName} 테이블 생성 완료!\n`)
    }

    // 테이블 확인
    console.log("🔍 생성된 테이블 확인 중...")
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME IN ('facility_reviews', 'facility_usage')
    `, [dbConfig.database])

    console.log("\n✅ 생성된 테이블:")
    tables.forEach((table) => {
      console.log(`   - ${table.TABLE_NAME}`)
    })

    console.log("\n🎉 모든 테이블이 성공적으로 생성되었습니다!")
  } catch (error) {
    console.error("\n❌ 오류 발생:")
    console.error(error.message)
    if (error.code) {
      console.error(`   Error Code: ${error.code}`)
    }
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
      console.log("\n🔌 연결 종료")
    }
  }
}

// 스크립트 실행
createTables()

