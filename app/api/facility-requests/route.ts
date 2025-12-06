import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

// Railway DB 설정
const dbConfig = {
  host: process.env.RAILWAY_HOST || process.env.RAILWAY_REVIEWS_HOST || "nozomi.proxy.rlwy.net",
  port: Number(process.env.RAILWAY_PORT || process.env.RAILWAY_REVIEWS_PORT) || 51173,
  user: process.env.RAILWAY_USER || process.env.RAILWAY_REVIEWS_USER || "root",
  password: process.env.RAILWAY_PASSWORD || process.env.RAILWAY_REVIEWS_PASSWORD,
  database: process.env.RAILWAY_DATABASE || process.env.RAILWAY_REVIEWS_DATABASE || "railway",
}

if (!dbConfig.password) {
  throw new Error('RAILWAY_PASSWORD or RAILWAY_REVIEWS_PASSWORD environment variable is required')
}

// GET: 요청 목록 조회 (관리자용)
export async function GET(request: NextRequest) {
  let connection
  try {
    // 관리자 인증 확인
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { message: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    // 관리자 확인
    connection = await mysql.createConnection(dbConfig)
    const [users] = await connection.execute(
      'SELECT user_id_email FROM users WHERE id = ?',
      [userId]
    )

    if (!Array.isArray(users) || users.length === 0 || (users[0] as any).user_id_email !== 'admin') {
      return NextResponse.json(
        { message: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    // 쿼리 파라미터
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // '대기중', '승인', '반려', null (전체)
    const requestType = searchParams.get('requestType') // 'user', 'facility_manager', null (전체)

    // 요청 목록 조회
    let query = `
      SELECT 
        fr.id,
        fr.request_type,
        fr.facility_name,
        fr.request_category,
        fr.content,
        fr.attachment_url,
        fr.business_registration_url,
        fr.representative_name,
        fr.phone,
        fr.operating_hours,
        fr.accessibility_features,
        fr.facility_images,
        fr.introduction,
        fr.status,
        fr.user_id,
        fr.admin_comment,
        fr.created_at,
        fr.updated_at,
        u.name as user_name,
        u.user_id_email as user_email
      FROM facility_requests fr
      LEFT JOIN users u ON fr.user_id = u.id
      WHERE 1=1
    `
    const params: any[] = []

    if (status) {
      query += ' AND fr.status = ?'
      params.push(status)
    }

    if (requestType) {
      query += ' AND fr.request_type = ?'
      params.push(requestType)
    }

    query += ' ORDER BY fr.created_at DESC'

    const [requests] = await connection.execute(query, params)

    // JSON 필드 파싱
    const parsedRequests = (requests as any[]).map((req) => {
      let operatingHours = null
      let accessibilityFeatures = null
      let facilityImages = null

      try {
        if (req.operating_hours) {
          operatingHours = typeof req.operating_hours === 'string' 
            ? JSON.parse(req.operating_hours) 
            : req.operating_hours
        }
      } catch (e) {
        console.error('operating_hours 파싱 오류:', e)
      }

      try {
        if (req.accessibility_features) {
          accessibilityFeatures = typeof req.accessibility_features === 'string'
            ? JSON.parse(req.accessibility_features)
            : req.accessibility_features
        }
      } catch (e) {
        console.error('accessibility_features 파싱 오류:', e)
      }

      try {
        if (req.facility_images) {
          facilityImages = typeof req.facility_images === 'string'
            ? JSON.parse(req.facility_images)
            : req.facility_images
        }
      } catch (e) {
        console.error('facility_images 파싱 오류:', e)
      }

      return {
        ...req,
        operating_hours: operatingHours,
        accessibility_features: accessibilityFeatures,
        facility_images: facilityImages,
      }
    })

    return NextResponse.json({ requests: parsedRequests })
  } catch (error) {
    console.error('요청 목록 조회 오류:', error)
    return NextResponse.json(
      { message: '요청 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  } finally {
    if (connection) await connection.end()
  }
}

// POST: 새로운 요청 생성
export async function POST(request: NextRequest) {
  let connection
  try {
    const body = await request.json()
    const {
      requestType, // 'user' or 'facility_manager'
      facilityName,
      requestCategory, // 사용자용: 정보오류/폐업신고/신규등록/기타
      content,
      attachmentUrl, // 사용자용 첨부 사진
      
      // 시설관리자용
      businessRegistrationUrl,
      representativeName,
      phone,
      operatingHours,
      accessibilityFeatures,
      facilityImages,
      introduction,
    } = body

    // 필수 필드 검증
    if (!requestType || !facilityName || !content) {
      return NextResponse.json(
        { message: '필수 항목을 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    // 사용자 인증 확인
    const userIdFromHeader = request.headers.get('x-user-id')
    const { searchParams } = new URL(request.url)
    const userIdFromQuery = searchParams.get('userId')
    const userId = userIdFromHeader || userIdFromQuery

    if (!userId) {
      return NextResponse.json(
        { message: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    connection = await mysql.createConnection(dbConfig)

    // 사용자 존재 확인
    const [users] = await connection.execute(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    )

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { message: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // JSON 필드 처리
    const operatingHoursJson = operatingHours ? JSON.stringify(operatingHours) : null
    const accessibilityFeaturesJson = accessibilityFeatures ? JSON.stringify(accessibilityFeatures) : null
    const facilityImagesJson = facilityImages && facilityImages.length > 0 ? JSON.stringify(facilityImages) : null

    // 요청 생성
    const [result] = await connection.execute(
      `INSERT INTO facility_requests (
        request_type, facility_name, request_category, content, attachment_url,
        business_registration_url, representative_name, phone, operating_hours,
        accessibility_features, facility_images, introduction, user_id, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '대기중')`,
      [
        requestType,
        facilityName,
        requestCategory || null,
        content,
        attachmentUrl || null,
        businessRegistrationUrl || null,
        representativeName || null,
        phone || null,
        operatingHoursJson,
        accessibilityFeaturesJson,
        facilityImagesJson,
        introduction || null,
        userId,
      ]
    )

    return NextResponse.json({
      message: '시설 정보 수정 요청이 제출되었습니다.',
      requestId: (result as any).insertId,
    })
  } catch (error) {
    console.error('시설 정보 수정 요청 생성 오류:', error)
    return NextResponse.json(
      { message: '요청 제출 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  } finally {
    if (connection) await connection.end()
  }
}

