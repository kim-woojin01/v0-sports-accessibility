/**
 * Railway DB의 모든 테이블 구조 확인
 */

const mysql = require("mysql2/promise")

const connectionUrl = 'mysql://root:lRzqwghWSchqdRyErESveHwVyKYUfhME@nozomi.proxy.rlwy.net:51173/railway';

function parseConnectionString(url) {
  const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) {
    throw new Error('Invalid MySQL connection string');
  }
  
  return {
    host: match[3],
    port: parseInt(match[4], 10),
    user: match[1],
    password: match[2],
    database: match[5],
  };
}

const dbConfig = parseConnectionString(connectionUrl);

async function checkAllTables() {
  let connection

  try {
    console.log("🔌 Railway MySQL에 연결 중...")
    connection = await mysql.createConnection(dbConfig)
    console.log("✅ 연결 성공!\n")

    // facility_usage 테이블 구조 확인
    console.log("🔍 facility_usage 테이블 구조:")
    const [usageColumns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'facility_usage'
      ORDER BY ORDINAL_POSITION
    `, [dbConfig.database])
    usageColumns.forEach((col) => {
      console.log(`   - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'YES' ? '(NULL 가능)' : '(NOT NULL)'}`)
    })
    console.log()

    // facility_requests 테이블 구조 확인
    console.log("🔍 facility_requests 테이블 구조:")
    const [requestColumns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'facility_requests'
      ORDER BY ORDINAL_POSITION
    `, [dbConfig.database])
    requestColumns.forEach((col) => {
      console.log(`   - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'YES' ? '(NULL 가능)' : '(NOT NULL)'}`)
    })
    console.log()

    // facility_reviews 테이블 구조 확인
    console.log("🔍 facility_reviews 테이블 구조:")
    const [reviewColumns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'facility_reviews'
      ORDER BY ORDINAL_POSITION
    `, [dbConfig.database])
    reviewColumns.forEach((col) => {
      console.log(`   - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'YES' ? '(NULL 가능)' : '(NOT NULL)'}`)
    })
    console.log()

    // 현재 데이터 수 확인
    const [usageCount] = await connection.execute(`SELECT COUNT(*) as count FROM facility_usage`)
    const [requestCount] = await connection.execute(`SELECT COUNT(*) as count FROM facility_requests`)
    const [reviewCount] = await connection.execute(`SELECT COUNT(*) as count FROM facility_reviews`)
    const [userCount] = await connection.execute(`SELECT COUNT(*) as count FROM users`)

    console.log("📊 현재 데이터 수:")
    console.log(`   - users: ${userCount[0].count}명`)
    console.log(`   - facility_usage: ${usageCount[0].count}개`)
    console.log(`   - facility_requests: ${requestCount[0].count}개`)
    console.log(`   - facility_reviews: ${reviewCount[0].count}개`)

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

checkAllTables()





