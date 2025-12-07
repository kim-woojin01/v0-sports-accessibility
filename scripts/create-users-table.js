/**
 * Railway MySQL에 users 테이블 생성 스크립트
 * API 라우트와 동일한 DB에 테이블 생성
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

const createUsersTableSQL = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id_email VARCHAR(50) NOT NULL UNIQUE COMMENT 'ID 또는 이메일',
  password VARCHAR(255) NOT NULL COMMENT '비밀번호 (해시된 값)',
  name VARCHAR(30) NOT NULL COMMENT '이름',
  phone VARCHAR(13) NOT NULL COMMENT '전화번호 (010-0000-0000)',
  birth_date DATE NOT NULL COMMENT '생년월일',
  disability_type VARCHAR(50) DEFAULT NULL COMMENT '장애 유형 (선택사항)',
  exercise_purposes JSON DEFAULT NULL COMMENT '운동 목적 (중복 선택 가능, JSON 배열)',
  profile_image_url VARCHAR(255) DEFAULT NULL COMMENT '프로필 사진 URL',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id_email (user_id_email),
  INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`

async function createUsersTable() {
  let connection

  try {
    console.log("🔌 Railway MySQL에 연결 중...")
    connection = await mysql.createConnection(dbConfig)
    console.log("✅ 연결 성공!\n")

    console.log("📝 users 테이블 생성 중...")
    await connection.execute(createUsersTableSQL)
    console.log("✅ users 테이블 생성 완료!\n")

    console.log("🎉 완료되었습니다!")
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

createUsersTable()









