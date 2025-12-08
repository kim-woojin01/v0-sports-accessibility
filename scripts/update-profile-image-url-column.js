/**
 * profile_image_url 컬럼을 TEXT 타입으로 변경하는 스크립트
 * Base64 데이터 URI 저장을 위해 필요합니다.
 * 
 * 사용법:
 *   node scripts/update-profile-image-url-column.js
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

// Railway DB 연결 설정 (51173 포트)
const dbConfig = {
  host: process.env.RAILWAY_HOST || "nozomi.proxy.rlwy.net",
  port: Number(process.env.RAILWAY_PORT) || 51173,
  user: process.env.RAILWAY_USER || "root",
  password: process.env.RAILWAY_PASSWORD || "lRzqwghWSchqdRyErESveHwVyKYUfhME",
  database: process.env.RAILWAY_DATABASE || "railway",
}

async function updateProfileImageUrlColumn() {
  let connection

  try {
    console.log("🔌 Railway MySQL에 연결 중...")
    connection = await mysql.createConnection(dbConfig)
    console.log("✅ 연결 성공!\n")

    // 현재 컬럼 타입 확인
    console.log("📋 profile_image_url 컬럼 타입 확인 중...")
    const [columns] = await connection.execute(
      `SELECT COLUMN_TYPE, CHARACTER_MAXIMUM_LENGTH 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'profile_image_url'`,
      [dbConfig.database]
    )

    if (columns.length === 0) {
      console.log("⚠️  profile_image_url 컬럼이 존재하지 않습니다. 컬럼을 추가합니다...")
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN profile_image_url TEXT DEFAULT NULL COMMENT '프로필 사진 URL (Base64 데이터 URI 지원)'
      `)
      console.log("✅ profile_image_url 컬럼 추가 완료 (TEXT 타입)")
    } else {
      const columnType = columns[0].COLUMN_TYPE
      const maxLength = columns[0].CHARACTER_MAXIMUM_LENGTH
      
      console.log(`현재 컬럼 타입: ${columnType}, 최대 길이: ${maxLength || '무제한'}`)
      
      // VARCHAR(255)이거나 작은 크기면 TEXT로 변경
      if (columnType.includes('varchar') && (maxLength === null || maxLength < 5000)) {
        console.log("📝 profile_image_url 컬럼을 TEXT 타입으로 변경 중...")
        try {
          await connection.execute(`
            ALTER TABLE users 
            MODIFY COLUMN profile_image_url TEXT DEFAULT NULL COMMENT '프로필 사진 URL (Base64 데이터 URI 지원)'
          `)
          console.log("✅ profile_image_url 컬럼을 TEXT 타입으로 변경 완료")
        } catch (error) {
          if (error.code === 'ER_BAD_FIELD_ERROR') {
            console.log("⚠️  컬럼이 존재하지 않습니다. 컬럼을 추가합니다...")
            await connection.execute(`
              ALTER TABLE users 
              ADD COLUMN profile_image_url TEXT DEFAULT NULL COMMENT '프로필 사진 URL (Base64 데이터 URI 지원)'
            `)
            console.log("✅ profile_image_url 컬럼 추가 완료 (TEXT 타입)")
          } else {
            throw error
          }
        }
      } else if (columnType.includes('text')) {
        console.log("ℹ️  profile_image_url 컬럼이 이미 TEXT 타입입니다.")
      } else {
        console.log(`⚠️  현재 컬럼 타입: ${columnType}. TEXT 타입으로 변경을 권장합니다.`)
      }
    }

    // 최종 확인
    console.log("\n📊 최종 컬럼 정보:")
    const [finalColumns] = await connection.execute(
      `SELECT COLUMN_TYPE, CHARACTER_MAXIMUM_LENGTH 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'profile_image_url'`,
      [dbConfig.database]
    )
    if (finalColumns.length > 0) {
      console.log(`   타입: ${finalColumns[0].COLUMN_TYPE}`)
      console.log(`   최대 길이: ${finalColumns[0].CHARACTER_MAXIMUM_LENGTH || '무제한 (TEXT)'}`)
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
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
      console.log("\n🔌 연결 종료")
    }
  }
}

updateProfileImageUrlColumn()
