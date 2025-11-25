import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/src/lib/db'

// POST: 새로운 요청 생성
export async function POST(request: NextRequest) {
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

    // 사용자 존재 확인
    const users = await query(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    )

    if (users.length === 0) {
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
    const result = await query(
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
  }
}

