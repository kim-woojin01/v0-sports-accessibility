/**
 * Railway DB에 리뷰 데이터 삽입 (실제 시설 ID 사용)
 * API가 사용하는 실제 시설 ID를 확인하여 삽입
 */

const mysql = require("mysql2/promise")

// API가 사용하는 DB (시설 정보가 있는 DB)
const apiDbConfig = {
  host: "caboose.proxy.rlwy.net",
  port: 44225,
  user: "root",
  password: "OYtPVGecIvjzArpQfMWwRNyyXnEfsXaD",
  database: "railway",
}

// Railway 인터페이스 DB (리뷰를 저장하는 DB)
const railwayDbConfig = {
  host: "nozomi.proxy.rlwy.net",
  port: 51173,
  user: "root",
  password: "lRzqwghWSchqdRyErESveHwVyKYUfhME",
  database: "railway",
}

async function insertReviewsWithFacilityIds() {
  let apiConnection
  let railwayConnection

  try {
    console.log("🔌 API DB에 연결 중... (시설 정보 조회용)")
    apiConnection = await mysql.createConnection(apiDbConfig)
    console.log("✅ API DB 연결 성공!\n")

    console.log("🔌 Railway DB에 연결 중... (리뷰 저장용)")
    railwayConnection = await mysql.createConnection(railwayDbConfig)
    console.log("✅ Railway DB 연결 성공!\n")

    // 1. API DB에서 실제 시설 ID 조회
    console.log("📋 실제 시설 ID 조회 중...")
    const [facilities] = await apiConnection.execute(`SELECT id, name FROM facility ORDER BY id LIMIT 10`)
    console.log(`✅ ${facilities.length}개의 시설을 찾았습니다:`)
    facilities.forEach((f) => {
      console.log(`   - ID: ${f.id}, 이름: ${f.name}`)
    })
    console.log()

    // 2. Railway DB에서 사용자 조회
    console.log("👤 Railway DB 사용자 조회 중...")
    const [users] = await railwayConnection.execute(`SELECT id, name, user_id_email FROM users ORDER BY id LIMIT 5`)
    console.log(`✅ ${users.length}명의 사용자를 찾았습니다:`)
    users.forEach((u) => {
      console.log(`   - ID: ${u.id}, 이름: ${u.name || u.user_id_email}`)
    })
    console.log()

    // 3. 기존 리뷰 확인
    const [reviewCount] = await railwayConnection.execute(`SELECT COUNT(*) as count FROM facility_reviews`)
    console.log(`📊 기존 리뷰 수: ${reviewCount[0].count}개\n`)

    // 4. 리뷰 삽입 (실제 시설 ID 사용)
    console.log("⭐ 리뷰 삽입 중... (실제 시설 ID 사용)\n")

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
      const facilityCount = Math.min(3, facilities.length)

      for (let j = 0; j < facilityCount; j++) {
        const facility = facilities[j]
        const reviewTemplate = sampleReviews[(i * facilityCount + j) % sampleReviews.length]
        const daysAgo = (i * facilityCount + j) * 2 + 1

        await railwayConnection.execute(
          `
          INSERT INTO facility_reviews 
            (facility_id, user_id, user_name, rating, content, tags, created_at)
          VALUES (?, ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY))
          `,
          [
            facility.id, // 실제 시설 ID 사용
            user.id,
            user.name || user.user_id_email,
            reviewTemplate.rating,
            reviewTemplate.content,
            JSON.stringify(reviewTemplate.tags),
            daysAgo,
          ],
        )

        insertedCount++
        console.log(`   ✅ [${insertedCount}] ${facility.name} (ID: ${facility.id}) - ${user.name || user.user_id_email} (${reviewTemplate.rating}점, ${daysAgo}일 전)`)
      }
    }

    console.log(`\n✅ 총 ${insertedCount}개의 리뷰가 삽입되었습니다!`)

    // 5. 최종 확인
    const [finalCount] = await railwayConnection.execute(`SELECT COUNT(*) as count FROM facility_reviews`)
    console.log(`\n📊 최종 리뷰 수: ${finalCount[0].count}개`)

    const [sampleData] = await railwayConnection.execute(`
      SELECT 
        r.id,
        r.facility_id,
        r.user_name,
        r.rating,
        LEFT(r.content, 40) as content_preview,
        r.created_at
      FROM facility_reviews r
      ORDER BY r.created_at DESC
      LIMIT 10
    `)

    console.log("\n📝 삽입된 리뷰 목록:")
    sampleData.forEach((r) => {
      console.log(`   - ID: ${r.id}, 시설 ID: ${r.facility_id}, 작성자: ${r.user_name} (${r.rating}점)`)
      console.log(`     내용: ${r.content_preview}...`)
      console.log(`     작성일: ${r.created_at}\n`)
    })

    console.log("🎉 완료!")
    console.log("\n✅ Railway 인터페이스에서 새로고침(Refresh) 버튼을 클릭하면 데이터가 보일 것입니다.")
    console.log("✅ 페이지에서도 리뷰가 정상적으로 표시될 것입니다.")

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
    if (apiConnection) {
      await apiConnection.end()
    }
    if (railwayConnection) {
      await railwayConnection.end()
    }
    console.log("\n🔌 연결 종료")
  }
}

insertReviewsWithFacilityIds()






