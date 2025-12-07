/**
 * Railway DB에 모든 예시 데이터 삽입
 * - facility_usage: 사용자별 이용 내역
 * - facility_requests: 시설 요청 데이터
 * - facility_reviews는 이미 있으므로 확인만
 */

const mysql = require("mysql2/promise")

// API가 사용하는 DB (시설 정보)
const apiDbConfig = {
  host: "caboose.proxy.rlwy.net",
  port: 44225,
  user: "root",
  password: "OYtPVGecIvjzArpQfMWwRNyyXnEfsXaD",
  database: "railway",
}

// Railway 인터페이스 DB (리뷰, 이용 내역, 요청 저장)
const railwayDbConfig = {
  host: "nozomi.proxy.rlwy.net",
  port: 51173,
  user: "root",
  password: "lRzqwghWSchqdRyErESveHwVyKYUfhME",
  database: "railway",
}

async function insertAllSampleData() {
  let apiConnection
  let railwayConnection

  try {
    console.log("🔌 API DB에 연결 중... (시설 정보 조회용)")
    apiConnection = await mysql.createConnection(apiDbConfig)
    console.log("✅ API DB 연결 성공!\n")

    console.log("🔌 Railway DB에 연결 중... (데이터 저장용)")
    railwayConnection = await mysql.createConnection(railwayDbConfig)
    console.log("✅ Railway DB 연결 성공!\n")

    // 1. 시설과 사용자 조회
    console.log("📋 데이터 조회 중...")
    const [facilities] = await apiConnection.execute(`SELECT id, name FROM facility ORDER BY id LIMIT 20`)
    const [users] = await railwayConnection.execute(`SELECT id, name, user_id_email FROM users ORDER BY id`)

    console.log(`   - 시설: ${facilities.length}개`)
    console.log(`   - 사용자: ${users.length}명\n`)

    // 2. facility_usage 데이터 삽입
    console.log("📝 facility_usage 예시 데이터 삽입 중...")
    const [existingUsage] = await railwayConnection.execute(`SELECT COUNT(*) as count FROM facility_usage`)
    
    if (existingUsage[0].count === 0) {
      let usageCount = 0
      
      // 각 사용자마다 여러 시설 이용 내역 생성
      for (const user of users) {
        const facilityCount = Math.min(5, facilities.length)
        
        for (let i = 0; i < facilityCount; i++) {
          const facility = facilities[i]
          const daysAgo = (usageCount % 10) * 3 + 1 // 1일, 4일, 7일, 10일... 전
          
          await railwayConnection.execute(
            `
            INSERT INTO facility_usage (user_id, facility_id, used_at)
            VALUES (?, ?, DATE_SUB(NOW(), INTERVAL ? DAY))
            `,
            [user.id, facility.id, daysAgo],
          )
          
          usageCount++
          console.log(`   ✅ [${usageCount}] ${user.name || user.user_id_email} - ${facility.name} (${daysAgo}일 전)`)
        }
      }
      
      console.log(`\n✅ 총 ${usageCount}개의 이용 내역이 삽입되었습니다!\n`)
    } else {
      console.log(`   ℹ️  이용 내역이 이미 존재합니다. (${existingUsage[0].count}개)\n`)
    }

    // 3. facility_requests 예시 데이터 삽입
    console.log("📋 facility_requests 예시 데이터 삽입 중...")
    const [existingRequests] = await railwayConnection.execute(`SELECT COUNT(*) as count FROM facility_requests`)
    
    if (existingRequests[0].count < 5) {
      const sampleRequests = [
        {
          request_type: 'user',
          facility_name: '새로운 체육관 신청',
          request_category: '신규등록',
          content: '우리 지역에 새로운 체육관이 필요합니다. 접근성 시설을 갖춘 체육관을 신청합니다.',
          user_id: users[0].id,
          status: '대기중',
        },
        {
          request_type: 'user',
          facility_name: '기존 시설 정보 수정 요청',
          request_category: '정보오류',
          content: '시설 주소가 변경되었습니다. 업데이트 부탁드립니다.',
          user_id: users[1]?.id || users[0].id,
          status: '대기중',
        },
        {
          request_type: 'facility_manager',
          facility_name: '스포츠센터 등록',
          request_category: null,
          content: '우리 시설을 등록하고 싶습니다.',
          representative_name: '홍길동',
          phone: '010-1234-5678',
          operating_hours: JSON.stringify({
            월요일: '09:00-22:00',
            화요일: '09:00-22:00',
            수요일: '09:00-22:00',
            목요일: '09:00-22:00',
            금요일: '09:00-22:00',
            토요일: '09:00-18:00',
            일요일: '휴무',
          }),
          accessibility_features: JSON.stringify(['엘리베이터', '장애인 화장실', '경사로']),
          user_id: users[2]?.id || users[0].id,
          status: '대기중',
        },
        {
          request_type: 'user',
          facility_name: '폐업 신고',
          request_category: '폐업신고',
          content: '해당 시설이 폐업했습니다.',
          user_id: users[3]?.id || users[0].id,
          status: '대기중',
        },
        {
          request_type: 'facility_manager',
          facility_name: '수영장 신규 등록',
          request_category: null,
          content: '장애인 전용 수영장을 운영하고 있습니다.',
          representative_name: '김철수',
          phone: '010-9876-5432',
          operating_hours: JSON.stringify({
            월요일: '06:00-21:00',
            화요일: '06:00-21:00',
            수요일: '06:00-21:00',
            목요일: '06:00-21:00',
            금요일: '06:00-21:00',
            토요일: '07:00-20:00',
            일요일: '08:00-18:00',
          }),
          accessibility_features: JSON.stringify(['휠체어 접근', '장애인 탈의실', '보조기구 대여']),
          user_id: users[4]?.id || users[0].id,
          status: '대기중',
        },
      ]

      let requestCount = 0
      for (const request of sampleRequests) {
        await railwayConnection.execute(
          `
          INSERT INTO facility_requests 
            (request_type, facility_name, request_category, content, attachment_url, 
             business_registration_url, representative_name, phone, operating_hours, 
             accessibility_features, facility_images, introduction, status, user_id, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
          `,
          [
            request.request_type,
            request.facility_name,
            request.request_category || null,
            request.content,
            null, // attachment_url
            null, // business_registration_url
            request.representative_name || null,
            request.phone || null,
            request.operating_hours || null,
            request.accessibility_features || null,
            null, // facility_images
            null, // introduction
            request.status || '대기중',
            request.user_id,
          ],
        )
        requestCount++
        console.log(`   ✅ [${requestCount}] ${request.facility_name} (${request.request_type})`)
      }
      
      console.log(`\n✅ 총 ${requestCount}개의 요청이 삽입되었습니다!\n`)
    } else {
      console.log(`   ℹ️  요청이 이미 충분히 존재합니다. (${existingRequests[0].count}개)\n`)
    }

    // 4. 최종 확인
    console.log("🔍 최종 데이터 확인:\n")
    const [finalUsage] = await railwayConnection.execute(`SELECT COUNT(*) as count FROM facility_usage`)
    const [finalRequests] = await railwayConnection.execute(`SELECT COUNT(*) as count FROM facility_requests`)
    const [finalReviews] = await railwayConnection.execute(`SELECT COUNT(*) as count FROM facility_reviews`)

    console.log(`📊 최종 데이터 수:`)
    console.log(`   - facility_usage: ${finalUsage[0].count}개`)
    console.log(`   - facility_requests: ${finalRequests[0].count}개`)
    console.log(`   - facility_reviews: ${finalReviews[0].count}개`)

    // 사용자별 이용 내역 확인
    const [userUsage] = await railwayConnection.execute(`
      SELECT 
        u.user_id,
        us.name as user_name,
        COUNT(*) as usage_count
      FROM facility_usage u
      JOIN users us ON u.user_id = us.id
      GROUP BY u.user_id, us.name
      ORDER BY usage_count DESC
      LIMIT 5
    `)

    if (userUsage.length > 0) {
      console.log(`\n👤 사용자별 이용 내역:`)
      userUsage.forEach((u) => {
        console.log(`   - ${u.user_name}: ${u.usage_count}개`)
      })
    }

    console.log("\n🎉 모든 예시 데이터 삽입이 완료되었습니다!")

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
    if (apiConnection) await apiConnection.end()
    if (railwayConnection) await railwayConnection.end()
    console.log("\n🔌 연결 종료")
  }
}

insertAllSampleData()







