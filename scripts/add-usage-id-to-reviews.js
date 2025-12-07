/**
 * facility_reviews 테이블에 facility_usage_id 컬럼 추가
 */

const mysql = require("mysql2/promise")

const railwayDbConfig = {
  host: "nozomi.proxy.rlwy.net",
  port: 51173,
  user: "root",
  password: "lRzqwghWSchqdRyErESveHwVyKYUfhME",
  database: "railway",
}

async function addColumn() {
  let connection

  try {
    connection = await mysql.createConnection(railwayDbConfig)
    
    // 컬럼이 이미 있는지 확인
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'railway' 
        AND TABLE_NAME = 'facility_reviews' 
        AND COLUMN_NAME = 'facility_usage_id'
    `)

    if (columns.length === 0) {
      console.log("facility_usage_id 컬럼 추가 중...")
      await connection.execute(`
        ALTER TABLE facility_reviews
        ADD COLUMN facility_usage_id INT NULL,
        ADD INDEX idx_facility_usage_id (facility_usage_id)
      `)
      console.log("✅ facility_usage_id 컬럼 추가 완료!")
    } else {
      console.log("ℹ️  facility_usage_id 컬럼이 이미 존재합니다.")
    }

  } catch (error) {
    console.error("오류:", error.message)
    if (error.code) {
      console.error(`   Error Code: ${error.code}`)
    }
  } finally {
    if (connection) await connection.end()
  }
}

addColumn()







