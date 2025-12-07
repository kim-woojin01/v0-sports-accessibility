/**
 * 리뷰 API 테스트 스크립트
 */

const mysql = require("mysql2/promise")

const railwayDbConfig = {
  host: "nozomi.proxy.rlwy.net",
  port: 51173,
  user: "root",
  password: "lRzqwghWSchqdRyErESveHwVyKYUfhME",
  database: "railway",
}

async function testReviewAPI() {
  let connection

  try {
    connection = await mysql.createConnection(railwayDbConfig)
    
    // 리뷰 조회
    const [reviews] = await connection.execute(`
      SELECT id, facility_id, user_id, rating, content
      FROM facility_reviews
      ORDER BY id DESC
      LIMIT 5
    `)

    console.log("최근 리뷰:")
    reviews.forEach((r) => {
      console.log(`   - ID: ${r.id}, 시설 ID: ${r.facility_id}, 사용자 ID: ${r.user_id}, 평점: ${r.rating}`)
    })

    if (reviews.length > 0) {
      const testReviewId = reviews[0].id
      console.log(`\n테스트: 리뷰 ID ${testReviewId} 조회:`)
      
      const [testReview] = await connection.execute(`
        SELECT
          id,
          facility_id,
          user_id,
          user_name,
          rating,
          content,
          tags,
          DATE_FORMAT(created_at, '%Y-%m-%d') AS date
        FROM facility_reviews
        WHERE id = ?
      `, [testReviewId])

      if (testReview.length > 0) {
        console.log("✅ 리뷰 조회 성공")
        console.log(`   - ID: ${testReview[0].id}`)
        console.log(`   - 평점: ${testReview[0].rating}`)
        console.log(`   - 내용: ${testReview[0].content.substring(0, 50)}...`)
      }

      // 수정 테스트
      console.log(`\n테스트: 리뷰 ID ${testReviewId} 수정:`)
      await connection.execute(`
        UPDATE facility_reviews
        SET rating = ?, updated_at = NOW()
        WHERE id = ?
      `, [5, testReviewId])

      const [updated] = await connection.execute(`
        SELECT rating FROM facility_reviews WHERE id = ?
      `, [testReviewId])

      console.log(`✅ 수정 성공 - 평점: ${updated[0].rating}`)
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

testReviewAPI()






