/**
 * 44225 Railway에서 51173 Railway로 모든 테이블과 데이터 마이그레이션
 * 
 * 사용법:
 *   node scripts/migrate-44225-to-51173.js
 */

const mysql = require("mysql2/promise")
const mysql2 = require("mysql2") // escape 함수 사용을 위해
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

// 44225 Railway (소스 DB)
const sourceDbConfig = {
  host: "caboose.proxy.rlwy.net",
  port: 44225,
  user: "root",
  password: "OYtPVGecIvjzArpQfMWwRNyyXnEfsXaD",
  database: "railway",
}

// 51173 Railway (타겟 DB)
const targetDbConfig = {
  host: "nozomi.proxy.rlwy.net",
  port: 51173,
  user: "root",
  password: "lRzqwghWSchqdRyErESveHwVyKYUfhME",
  database: "railway",
}

// 테이블 목록 (시설 관련 테이블들)
// 참고: 마이그레이션 순서는 migrateAll 함수에서 처리됨

async function getCreateTableSQL(connection, tableName) {
  const [rows] = await connection.execute(`SHOW CREATE TABLE ${tableName}`)
  return rows[0]["Create Table"]
}

async function migrateTable(sourceConn, targetConn, tableName) {
  console.log(`\n📋 ${tableName} 테이블 마이그레이션 시작...`)

  // 1. 테이블 구조 가져오기
  console.log(`   🔍 테이블 구조 확인 중...`)
  const createTableSQL = await getCreateTableSQL(sourceConn, tableName)
  
  // 2. 타겟 DB에 테이블 생성 (Foreign key 제약 비활성화 후 DROP)
  console.log(`   📝 타겟 DB에 테이블 생성 중...`)
  try {
    // Foreign key 체크 비활성화
    await targetConn.execute(`SET FOREIGN_KEY_CHECKS = 0`)
    await targetConn.execute(`DROP TABLE IF EXISTS ${tableName}`)
    await targetConn.execute(createTableSQL)
    await targetConn.execute(`SET FOREIGN_KEY_CHECKS = 1`)
  } catch (dropError) {
    // Foreign key 체크 복구
    await targetConn.execute(`SET FOREIGN_KEY_CHECKS = 1`).catch(() => {})
    throw dropError
  }
  console.log(`   ✅ 테이블 생성 완료`)

  // 3. 데이터 개수 확인
  const [countRows] = await sourceConn.execute(`SELECT COUNT(*) as count FROM ${tableName}`)
  const totalRows = countRows[0].count
  console.log(`   📊 총 ${totalRows}개 행 발견`)

  if (totalRows === 0) {
    console.log(`   ⏭️  데이터가 없어 건너뜁니다.`)
    return
  }

  // 4. 데이터 읽기 및 삽입 (배치 처리)
  const BATCH_SIZE = 100
  let offset = 0
  let insertedCount = 0

  // 컬럼 정보 가져오기
  const [columnInfo] = await sourceConn.execute(`DESCRIBE ${tableName}`)
  const columns = columnInfo.map((col) => col.Field)
  const columnNames = columns.join(", ")

  while (offset < totalRows) {
    const [rows] = await sourceConn.execute(
      `SELECT * FROM ${tableName} LIMIT ? OFFSET ?`,
      [BATCH_SIZE, offset]
    )

    if (rows.length === 0) break

    // 순차 삽입 - 각 행을 하나씩 처리 (안정적)
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex]
      
      try {
        // 첫 번째 행의 데이터 확인
        if (insertedCount === 0 && offset === 0 && rowIndex === 0) {
          console.log(`   🔍 첫 번째 행 데이터 확인 중...`)
          console.log(`   컬럼 수: ${columns.length}, 실제 데이터 키:`, Object.keys(row).length)
          console.log(`   첫 행 샘플:`, Object.keys(row).slice(0, 5).map(k => `${k}: ${typeof row[k]}`).join(", "))
        }
        
        // 값 배열 준비 (파라미터 바인딩용)
        const values = []
        for (const col of columns) {
          let value = row[col]
          
          // NULL, undefined 처리
          if (value === null || value === undefined) {
            values.push(null)
          }
          // Date 객체는 문자열로 변환
          else if (value instanceof Date) {
            values.push(value.toISOString().slice(0, 19).replace('T', ' '))
          }
          // Buffer 객체 처리
          else if (Buffer.isBuffer(value)) {
            values.push(value)
          }
          // 숫자, 문자열, 불린은 그대로
          else {
            values.push(value)
          }
        }
        
        // mysql2의 format을 사용하여 SQL 생성 (더 안전한 방식)
        const columnNamesEscaped = columns.map(col => mysql2.escapeId(col)).join(", ")
        const valuesEscaped = values.map(val => {
          if (val === null || val === undefined) return "NULL"
          if (val instanceof Date) return mysql2.escape(val.toISOString().slice(0, 19).replace('T', ' '))
          if (Buffer.isBuffer(val)) return `0x${val.toString('hex')}`
          if (typeof val === 'number') return val
          if (typeof val === 'string') return mysql2.escape(val)
          return mysql2.escape(String(val))
        }).join(", ")
        
        const insertSQL = `INSERT INTO ${mysql2.escapeId(tableName)} (${columnNamesEscaped}) VALUES (${valuesEscaped})`
        
        // 포맷된 SQL 직접 실행 (파라미터 없이)
        await targetConn.query(insertSQL)
        insertedCount++
        
        // 첫 번째 행 성공 시 확인
        if (insertedCount === 1 && offset === 0) {
          console.log(`   ✅ 첫 번째 행 삽입 성공! 계속 진행...`)
        }
      } catch (rowError) {
        console.error(`   ⚠️  행 삽입 실패 (행 ${offset + rowIndex + 1}):`, rowError.message)
        // 첫 번째 행의 오류만 상세 출력
        if (insertedCount === 0 && offset === 0 && rowIndex === 0) {
          console.error(`   문제가 있는 데이터:`)
          console.error(`   컬럼:`, columns)
          console.error(`   데이터 샘플:`, JSON.stringify(row, null, 2).substring(0, 500))
          console.error(`   값 타입들:`, values.map((v, i) => `${columns[i]}: ${typeof v}`).join(", "))
          console.error(`   오류 상세:`, rowError.message)
          console.error(`   오류 코드:`, rowError.code)
          console.error(`   오류 스택:`, rowError.stack?.substring(0, 300))
        }
        // 계속 진행
      }
    }

    offset += BATCH_SIZE
    
    // 진행 상황 출력 (1000행마다 또는 배치 완료 시)
    if (insertedCount > 0 && (insertedCount % 1000 === 0 || offset >= totalRows)) {
      console.log(`   📥 ${insertedCount}/${totalRows} 행 삽입 완료...`)
    }
  }

  console.log(`   ✅ ${tableName} 테이블 마이그레이션 완료 (${insertedCount}개 행)`)
  
  // 실제 삽입된 행 수 확인
  const [verifyCount] = await targetConn.execute(`SELECT COUNT(*) as count FROM ${tableName}`)
  const actualCount = verifyCount[0].count
  if (actualCount !== insertedCount) {
    console.log(`   ⚠️  경고: 삽입된 행 수(${insertedCount})와 실제 행 수(${actualCount})가 다릅니다.`)
  }
}

async function migrateAll() {
  let sourceConn = null
  let targetConn = null

  try {
    console.log("🚀 마이그레이션 시작\n")
    console.log("=".repeat(60))

    // 소스 DB 연결
    console.log("\n🔌 44225 Railway (소스 DB) 연결 중...")
    console.log(`   Host: ${sourceDbConfig.host}:${sourceDbConfig.port}`)
    sourceConn = await mysql.createConnection(sourceDbConfig)
    console.log("   ✅ 연결 성공!")

    // 타겟 DB 연결
    console.log("\n🔌 51173 Railway (타겟 DB) 연결 중...")
    console.log(`   Host: ${targetDbConfig.host}:${targetDbConfig.port}`)
    targetConn = await mysql.createConnection(targetDbConfig)
    console.log("   ✅ 연결 성공!")

    // 테이블 목록 확인
    console.log("\n📋 마이그레이션할 테이블 목록:")
    const allTables = ["facility", "facility_logs", "accessible_facilities", "accessibility_facilities_logs"]
    for (const table of allTables) {
      const [exists] = await sourceConn.execute(
        `SELECT COUNT(*) as count FROM information_schema.TABLES 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
        [sourceDbConfig.database, table]
      )
      if (exists[0].count > 0) {
        const [countRows] = await sourceConn.execute(`SELECT COUNT(*) as count FROM ${table}`)
        console.log(`   ✓ ${table} (${countRows[0].count}개 행)`)
      } else {
        console.log(`   ✗ ${table} (존재하지 않음)`)
      }
    }

    // 각 테이블 마이그레이션
    // 1단계: 먼저 부모 테이블들 생성 (facility, accessible_facilities)
    const parentTables = ["facility", "accessible_facilities"]
    for (const tableName of parentTables) {
      try {
        const [exists] = await sourceConn.execute(
          `SELECT COUNT(*) as count FROM information_schema.TABLES 
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
          [sourceDbConfig.database, tableName]
        )

        if (exists[0].count === 0) {
          console.log(`\n⚠️  ${tableName} 테이블이 소스 DB에 없어 건너뜁니다.`)
          continue
        }

        await migrateTable(sourceConn, targetConn, tableName)
      } catch (error) {
        console.error(`\n❌ ${tableName} 테이블 마이그레이션 실패:`)
        console.error(`   ${error.message}`)
        // 계속 진행
      }
    }

    // 2단계: 자식 테이블들 생성 (facility_logs, accessibility_facilities_logs)
    const childTables = ["facility_logs", "accessibility_facilities_logs"]
    for (const tableName of childTables) {
      try {
        const [exists] = await sourceConn.execute(
          `SELECT COUNT(*) as count FROM information_schema.TABLES 
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
          [sourceDbConfig.database, tableName]
        )

        if (exists[0].count === 0) {
          console.log(`\n⚠️  ${tableName} 테이블이 소스 DB에 없어 건너뜁니다.`)
          continue
        }

        await migrateTable(sourceConn, targetConn, tableName)
      } catch (error) {
        console.error(`\n❌ ${tableName} 테이블 마이그레이션 실패:`)
        console.error(`   ${error.message}`)
        // 계속 진행
      }
    }

    console.log("\n" + "=".repeat(60))
    console.log("\n🎉 마이그레이션 완료!")
    console.log("\n✅ 모든 테이블과 데이터가 51173 Railway로 성공적으로 마이그레이션되었습니다.")

  } catch (error) {
    console.error("\n❌ 마이그레이션 중 오류 발생:")
    console.error(error.message)
    if (error.code) {
      console.error(`   Error Code: ${error.code}`)
    }
    process.exit(1)
  } finally {
    if (sourceConn) {
      await sourceConn.end()
      console.log("\n🔌 소스 DB 연결 종료")
    }
    if (targetConn) {
      await targetConn.end()
      console.log("🔌 타겟 DB 연결 종료")
    }
  }
}

// 스크립트 실행
migrateAll().catch((error) => {
  console.error("❌ 치명적 오류:", error)
  process.exit(1)
})



