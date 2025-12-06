/**
 * Railway DB의 실제 테이블 구조 확인
 */

const mysql = require("mysql2/promise")

// setup.js와 동일한 연결 정보 사용
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

async function checkTables() {
  let connection

  try {
    console.log("🔌 Railway MySQL에 연결 중...")
    console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`)
    console.log(`   Database: ${dbConfig.database}`)
    connection = await mysql.createConnection(dbConfig)
    console.log("✅ 연결 성공!\n")

    // 모든 테이블 목록 조회
    console.log("📋 테이블 목록:")
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME
    `, [dbConfig.database])

    tables.forEach((t) => {
      console.log(`   - ${t.TABLE_NAME}`)
    })
    console.log()

    // facility_reviews 테이블 구조 확인
    if (tables.some(t => t.TABLE_NAME === 'facility_reviews')) {
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
      console.log()

      // facility_reviews 데이터 확인
      const [reviewCount] = await connection.execute(`SELECT COUNT(*) as count FROM facility_reviews`)
      console.log(`📊 facility_reviews 데이터 수: ${reviewCount[0].count}개\n`)

      if (reviewCount[0].count > 0) {
        const [sample] = await connection.execute(`SELECT * FROM facility_reviews LIMIT 5`)
        console.log("📝 샘플 데이터:")
        sample.forEach((r) => {
          console.log(`   - ID: ${r.id}, facility_id: ${r.facility_id}, user_id: ${r.user_id}, user_name: ${r.user_name}, rating: ${r.rating}`)
        })
      }
    }

    // users 테이블 확인
    if (tables.some(t => t.TABLE_NAME === 'users')) {
      const [userCount] = await connection.execute(`SELECT COUNT(*) as count FROM users`)
      console.log(`\n👤 users 데이터 수: ${userCount[0].count}명`)
      if (userCount[0].count > 0) {
        const [users] = await connection.execute(`SELECT id, name, user_id_email FROM users LIMIT 5`)
        users.forEach((u) => {
          console.log(`   - ID: ${u.id}, 이름: ${u.name || u.user_id_email}`)
        })
      }
    }

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

checkTables()



