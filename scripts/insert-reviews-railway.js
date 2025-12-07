/**
 * Railway DB에 직접 리뷰 데이터 삽입 스크립트
 * setup.js와 동일한 DB 연결 정보 사용
 */

const mysql = require("mysql2/promise")
const fs = require("fs")
const path = require("path")

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

async function insertReviewsRailway() {
  let connection

  try {
    console.log("🔌 Railway MySQL에 연결 중...")
    console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`)
    console.log(`   Database: ${dbConfig.database}`)
    connection = await mysql.createConnection(dbConfig)
    console.log("✅ 연결 성공!\n")

    // 1. 기존 데이터 확인
    console.log("📋 기존 데이터 확인 중...")
    const [facilityCount] = await connection.execute(`SELECT COUNT(*) as count FROM facility`)
    const [userCount] = await connection.execute(`SELECT COUNT(*) as count FROM users`)
    const [reviewCount] = await connection.execute(`SELECT COUNT(*) as count FROM facility_reviews`)
    
    console.log(`   - 시설: ${facilityCount[0].count}개`)
    console.log(`   - 사용자: ${userCount[0].count}명`)
    console.log(`   - 리뷰: ${reviewCount[0].count}개\n`)

    if (facilityCount[0].count === 0) {
      console.log("⚠️  시설이 없습니다. 먼저 시설 데이터를 추가해주세요.")
      return
    }

    if (userCount[0].count === 0) {
      console.log("⚠️  사용자가 없습니다. 먼저 회원가입을 통해 사용자를 생성해주세요.")
      return
    }

    // 2. 시설과 사용자 조회
    const [facilities] = await connection.execute(`SELECT id, name FROM facility ORDER BY id LIMIT 10`)
    const [users] = await connection.execute(`SELECT id, name, user_id_email FROM users ORDER BY id LIMIT 5`)

    console.log(`📋 사용 가능한 시설: ${facilities.length}개`)
    facilities.forEach((f, i) => {
      if (i < 5) console.log(`   - ID: ${f.id}, 이름: ${f.name}`)
    })
    console.log(`👤 사용 가능한 사용자: ${users.length}명`)
    users.forEach((u) => {
      console.log(`   - ID: ${u.id}, 이름: ${u.name || u.user_id_email}`)
    })
    console.log()

    // 3. 기존 리뷰 확인
    if (reviewCount[0].count > 0) {
      console.log("⚠️  기존 리뷰가 있습니다. 삭제하고 새로 삽입할까요?")
      console.log("   (이 스크립트는 기존 리뷰를 삭제하고 새로 삽입합니다)\n")
      console.log("🗑️  기존 리뷰 삭제 중...")
      await connection.execute(`DELETE FROM facility_reviews`)
      console.log("✅ 기존 리뷰 삭제 완료\n")
    }

    // 4. 새로운 리뷰 삽입
    console.log("⭐ 새로운 리뷰 삽입 중...\n")

    const sampleReviews = [
      {
        rating: 5,
        content: "시설이 매우 깨끗하고 직원분들이 친절해서 좋았습니다. 휠체어 이동도 편리했어요. 접근성 시설이 잘 갖춰져 있어서 이용하기 편했습니다.",
        tags: ["진입로 평탄해요", "휠체어 출입", "안내 표지판 있어요", "장애인 화장실"],
      },
      {
        rating: 4,
        content: "수영장 물이 따뜻해서 좋았는데 주차장이 조금 좁네요. 하지만 접근성은 좋아요!",
        tags: ["보드라운 바닥재", "경사로 설치되어 있어요", "보조기구 빌려줘요"],
      },
      {
        rating: 5,
        content: "점자 안내가 잘 되어 있어서 시각 장애인도 이용하기 편리합니다. 직원분들도 친절하세요.",
        tags: ["점자 안내 필요해요", "안내 표지판 있어요", "장애인 화장실"],
      },
      {
        rating: 4,
        content: "전반적으로 좋은 시설이에요. 다만 엘리베이터가 조금 느린 편이네요.",
        tags: ["진입로 평탄해요", "휠체어 출입", "보드라운 바닥재"],
      },
      {
        rating: 5,
        content: "장애인을 위한 시설이 정말 잘 되어 있어요. 휠체어로 이동하기 편하고, 직원분들도 도움을 잘 주셔서 감사했습니다.",
        tags: ["휠체어 출입", "장애인 화장실", "보조기구 빌려줘요", "경사로 설치되어 있어요"],
      },
    ]

    let insertedCount = 0

    // 각 사용자가 여러 시설에 리뷰 작성
    for (let i = 0; i < users.length && i < 3; i++) {
      const user = users[i]
      const reviewCount = Math.min(3, facilities.length)

      for (let j = 0; j < reviewCount; j++) {
        const facility = facilities[j]
        const reviewTemplate = sampleReviews[(i + j) % sampleReviews.length]
        const daysAgo = (i * reviewCount + j) * 2 + 1

        await connection.execute(
          `
          INSERT INTO facility_reviews 
            (facility_id, user_id, user_name, rating, content, tags, created_at)
          VALUES (?, ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY))
          `,
          [
            facility.id,
            user.id,
            user.name || user.user_id_email,
            reviewTemplate.rating,
            reviewTemplate.content,
            JSON.stringify(reviewTemplate.tags),
            daysAgo,
          ],
        )

        insertedCount++
        console.log(`   ✅ [${insertedCount}] ${facility.name} - ${user.name || user.user_id_email} (${reviewTemplate.rating}점, ${daysAgo}일 전)`)
      }
    }

    console.log(`\n✅ 총 ${insertedCount}개의 리뷰가 삽입되었습니다!`)

    // 5. 최종 확인
    const [finalCount] = await connection.execute(`SELECT COUNT(*) as count FROM facility_reviews`)
    console.log(`\n📊 최종 리뷰 수: ${finalCount[0].count}개`)

    const [sampleData] = await connection.execute(`
      SELECT 
        r.id,
        r.facility_id,
        COALESCE(f.name, CONCAT('시설 ID: ', r.facility_id)) as facility_name,
        r.user_name,
        r.rating,
        LEFT(r.content, 30) as content_preview,
        r.created_at
      FROM facility_reviews r
      LEFT JOIN facility f ON r.facility_id = f.id
      ORDER BY r.created_at DESC
      LIMIT 10
    `)

    console.log("\n📝 삽입된 리뷰 목록:")
    sampleData.forEach((r) => {
      console.log(`   - ID: ${r.id}, ${r.facility_name}: ${r.user_name} (${r.rating}점)`)
      console.log(`     내용: ${r.content_preview}...`)
      console.log(`     작성일: ${r.created_at}\n`)
    })

    console.log("🎉 완료! Railway 인터페이스에서 새로고침(Refresh) 버튼을 클릭하면 데이터가 보일 것입니다.")

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

insertReviewsRailway()







