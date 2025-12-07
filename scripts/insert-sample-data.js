/**
 * Railway MySQL에 리뷰 시스템 샘플 데이터 삽입 스크립트
 * 
 * 사용법:
 *   node scripts/insert-sample-data.js
 * 
 * 또는 npm script로 실행:
 *   npm run insert-sample-data
 * 
 * 이 스크립트는:
 * - 실제 시설과 사용자 데이터를 조회
 * - 정확한 관계를 유지하면서 샘플 데이터 삽입
 * - 리뷰 작성, 리뷰 기록 등 모든 기능이 작동하도록 데이터 생성
 */

const mysql = require("mysql2/promise")
const bcrypt = require("bcryptjs")
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
// API 라우트와 동일한 DB 사용 (app/api/facilities/route.ts 참고)
const dbConfig = {
  host: process.env.RAILWAY_HOST || "caboose.proxy.rlwy.net",
  port: Number(process.env.RAILWAY_PORT) || 51173,
  user: process.env.RAILWAY_USER || "root",
  password:
    process.env.RAILWAY_PASSWORD ||
    "OYtPVGecIvjzArpQfMWwRNyyXnEfsXaD",
  database: process.env.RAILWAY_DATABASE || "railway",
}

// 샘플 리뷰 템플릿 (실제 데이터로 교체됨)
const reviewTemplates = [
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
  {
    rating: 4,
    content: "시설은 좋은데 주차 공간이 부족해요. 하지만 내부 시설은 깨끗하고 접근성이 좋습니다.",
    tags: ["진입로 평탄해요", "안내 표지판 있어요", "보드라운 바닥재"],
  },
]

async function insertSampleData() {
  let connection

  try {
    console.log("🔌 Railway MySQL에 연결 중...")
    connection = await mysql.createConnection(dbConfig)
    console.log("✅ 연결 성공!\n")

    // 1. 기존 시설 조회
    console.log("📋 시설 목록 조회 중...")
    const [facilities] = await connection.execute(`
      SELECT id, name FROM facility ORDER BY id LIMIT 5
    `)

    if (facilities.length === 0) {
      console.log("⚠️  시설이 없습니다. 먼저 시설 데이터를 추가해주세요.")
      return
    }

    console.log(`✅ ${facilities.length}개의 시설을 찾았습니다:`)
    facilities.forEach((f) => {
      console.log(`   - ID: ${f.id}, 이름: ${f.name}`)
    })
    console.log()

    // 2. 기존 사용자 조회 (기존 Railway DB의 실제 사용자만 사용)
    console.log("👤 기존 사용자 조회 중...")
    const [users] = await connection.execute(`
      SELECT id, name, user_id_email FROM users ORDER BY id LIMIT 10
    `)

    if (users.length === 0) {
      console.log("⚠️  사용자가 없습니다. 먼저 회원가입을 통해 사용자를 생성해주세요.")
      console.log("   이 스크립트는 기존 Railway DB의 실제 데이터를 기준으로 작동합니다.")
      return
    }

    // 기존 사용자만 사용 (새 사용자 생성하지 않음)
    const targetUsers = users.map((u) => ({
      id: u.id,
      name: u.name || u.user_id_email,
      email: u.user_id_email,
      password: null, // 기존 사용자는 비밀번호 모름
    }))
    console.log(`✅ ${targetUsers.length}명의 기존 사용자를 찾았습니다:`)
    targetUsers.forEach((u) => {
      console.log(`   - ID: ${u.id}, 이름: ${u.name}, 이메일: ${u.email}`)
    })
    console.log()

    const mainUser = targetUsers[0] // 메인 사용자 (이용 내역과 리뷰 작성용)

    // 3. 샘플 이용 내역 삽입 (메인 사용자용)
    console.log("📝 샘플 이용 내역 삽입 중...")
    
    // 메인 사용자가 여러 시설을 이용한 내역 생성
    const maxUsageCount = Math.min(5, facilities.length) // 최대 5개 시설
    
    for (let i = 0; i < maxUsageCount; i++) {
      const facilityId = facilities[i].id
      const facilityName = facilities[i].name
      
      // 기존 이용 내역 확인
      const [existing] = await connection.execute(
        `SELECT id FROM facility_usage WHERE user_id = ? AND facility_id = ?`,
        [mainUser.id, facilityId],
      )

      if (existing.length === 0) {
        // 다양한 날짜로 이용 내역 생성 (최근 1주일 ~ 2개월 전)
        const daysAgo = (i + 1) * 7 + Math.floor(Math.random() * 7) // 7일, 14일, 21일, 28일, 35일 전 등
        const usedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
        
        await connection.execute(
          `
          INSERT INTO facility_usage (user_id, facility_id, used_at)
          VALUES (?, ?, ?)
          `,
          [mainUser.id, facilityId, usedAt],
        )
        console.log(`   ✅ ${facilityName} 이용 내역 추가 (${daysAgo}일 전: ${usedAt.toLocaleDateString('ko-KR')})`)
      } else {
        console.log(`   ℹ️  ${facilityName} 이용 내역이 이미 존재합니다.`)
      }
    }
    console.log()

    // 4. 샘플 리뷰 삽입
    console.log("⭐ 샘플 리뷰 삽입 중...")

    let insertedReviews = 0

    // 메인 사용자가 이용한 시설에 대한 리뷰 생성
    const [myUsage] = await connection.execute(
      `SELECT DISTINCT facility_id FROM facility_usage WHERE user_id = ?`,
      [mainUser.id],
    )

    for (const usage of myUsage) {
      const facilityId = usage.facility_id
      const facility = facilities.find((f) => f.id === facilityId)
      if (!facility) continue

      // 기존 리뷰 확인
      const [existing] = await connection.execute(
        `SELECT id FROM facility_reviews WHERE user_id = ? AND facility_id = ?`,
        [mainUser.id, facilityId],
      )

      if (existing.length === 0) {
        // 랜덤 리뷰 템플릿 선택
        const template = reviewTemplates[insertedReviews % reviewTemplates.length]
        const daysAgo = (insertedReviews + 1) * 2 + Math.floor(Math.random() * 3) // 2일, 4일, 6일 전 등
        
        await connection.execute(
          `
          INSERT INTO facility_reviews 
            (facility_id, user_id, user_name, rating, content, tags, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
          [
            facilityId,
            mainUser.id,
            mainUser.name,
            template.rating,
            template.content,
            JSON.stringify(template.tags),
            new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
          ],
        )
        console.log(`   ✅ ${facility.name} 리뷰 추가 (${template.rating}점, ${mainUser.name}, ${daysAgo}일 전)`)
        insertedReviews++
      }
    }

    // 다른 사용자들의 리뷰도 추가 (다양한 리뷰를 위해)
    if (targetUsers.length > 1) {
      for (let i = 1; i < Math.min(targetUsers.length, 3); i++) {
        const otherUser = targetUsers[i]
        
        // 각 사용자가 2-3개 시설에 리뷰 작성
        const reviewCount = 2 + Math.floor(Math.random() * 2)
        for (let j = 0; j < reviewCount && j < facilities.length; j++) {
          const facilityId = facilities[j].id
          const facility = facilities[j]

          // 기존 리뷰 확인
          const [existing] = await connection.execute(
            `SELECT id FROM facility_reviews WHERE user_id = ? AND facility_id = ?`,
            [otherUser.id, facilityId],
          )

          if (existing.length === 0) {
            const template = reviewTemplates[(i + j) % reviewTemplates.length]
            const daysAgo = (i + j + 1) * 3 + Math.floor(Math.random() * 5)
            
            await connection.execute(
              `
              INSERT INTO facility_reviews 
                (facility_id, user_id, user_name, rating, content, tags, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)
              `,
              [
                facilityId,
                otherUser.id,
                otherUser.name,
                template.rating,
                template.content,
                JSON.stringify(template.tags),
                new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
              ],
            )
            console.log(`   ✅ ${facility.name} 리뷰 추가 (${template.rating}점, ${otherUser.name}, ${daysAgo}일 전)`)
          }
        }
      }
    }

    if (insertedReviews === 0) {
      console.log("   ℹ️  새로운 리뷰가 없습니다. (이미 존재하거나 이용 내역이 없음)")
    }
    console.log()

    // 5. 결과 확인
    console.log("🔍 삽입된 데이터 확인 중...\n")

    const [usageResult] = await connection.execute(
      `SELECT COUNT(*) as count FROM facility_usage WHERE user_id = ?`,
      [mainUser.id],
    )
    console.log(`📊 ${mainUser.name}님의 이용 내역: ${usageResult[0].count}개`)

    const [reviewCount] = await connection.execute(
      `SELECT COUNT(*) as count FROM facility_reviews`,
    )
    console.log(`⭐ 전체 리뷰: ${reviewCount[0].count}개`)

    const [myReviewCount] = await connection.execute(
      `SELECT COUNT(*) as count FROM facility_reviews WHERE user_id = ?`,
      [mainUser.id],
    )
    console.log(`📝 ${mainUser.name}님의 리뷰: ${myReviewCount[0].count}개`)

    // 각 시설별 리뷰 수 확인
    const [facilityReviews] = await connection.execute(`
      SELECT 
        f.id,
        f.name,
        COUNT(r.id) as review_count,
        AVG(r.rating) as avg_rating
      FROM facility f
      LEFT JOIN facility_reviews r ON f.id = r.facility_id
      GROUP BY f.id, f.name
      HAVING review_count > 0
      ORDER BY review_count DESC
      LIMIT 5
    `)
    
    if (facilityReviews.length > 0) {
      console.log(`\n📈 시설별 리뷰 현황:`)
      facilityReviews.forEach((fr) => {
        console.log(`   - ${fr.name}: ${fr.review_count}개 리뷰, 평균 ${Number(fr.avg_rating).toFixed(1)}점`)
      })
    }
    console.log()

    console.log("🎉 샘플 데이터 삽입이 완료되었습니다!")
    console.log("\n📌 테스트 방법:")
    console.log(`   1. 로그인: ${mainUser.email} (기존 Railway DB 사용자)`)
    console.log(`   2. 리뷰 페이지(/reviews)에서 리뷰 확인`)
    console.log(`   3. "리뷰 작성하기" 버튼 클릭 → 이용한 시설만 표시되는지 확인`)
    console.log(`   4. 마이페이지(/mypage)에서 이용 내역 및 작성한 리뷰 확인`)
    console.log(`   5. 리뷰 작성 페이지에서 새 리뷰 작성 테스트`)
    console.log(`   6. 리뷰 수정/삭제 기능 테스트`)
    console.log("\n💡 참고: 이 스크립트는 기존 Railway DB의 실제 데이터를 기준으로 작동합니다.")
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

// 스크립트 실행
insertSampleData()

