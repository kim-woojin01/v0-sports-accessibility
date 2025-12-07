/**
 * facility_reviews 테이블 구조 확인
 */

const mysql = require("mysql2/promise")

const railwayDbConfig = {
  host: "nozomi.proxy.rlwy.net",
  port: 51173,
  user: "root",
  password: "lRzqwghWSchqdRyErESveHwVyKYUfhME",
  database: "railway",
}

async function checkTable() {
  let connection

  try {
    connection = await mysql.createConnection(railwayDbConfig)
    
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'railway' AND TABLE_NAME = 'facility_reviews'
      ORDER BY ORDINAL_POSITION
    `)

    console.log("facility_reviews 테이블 구조:")
    columns.forEach((col) => {
      console.log(`   - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'YES' ? '(NULL 가능)' : '(NOT NULL)'}`)
    })

  } catch (error) {
    console.error("오류:", error.message)
  } finally {
    if (connection) await connection.end()
  }
}

checkTable()






