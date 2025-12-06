import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.RAILWAY_HOST || process.env.RAILWAY_REVIEWS_HOST || "nozomi.proxy.rlwy.net",
  port: Number(process.env.RAILWAY_PORT || process.env.RAILWAY_REVIEWS_PORT) || 51173,
  user: process.env.RAILWAY_USER || process.env.RAILWAY_REVIEWS_USER || "root",
  password: process.env.RAILWAY_PASSWORD || process.env.RAILWAY_REVIEWS_PASSWORD || "lRzqwghWSchqdRyErESveHwVyKYUfhME",
  database: process.env.RAILWAY_DATABASE || process.env.RAILWAY_REVIEWS_DATABASE || "railway",
}

// GET: 특정 요청 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let connection
  try {
    const { id } = await params
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { message: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    connection = await mysql.createConnection(dbConfig)

    // 관리자 확인
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

    // 요청 조회
    const [requests] = await connection.execute(
      `SELECT 
        fr.*,
        u.name as user_name,
        u.user_id_email as user_email
      FROM facility_requests fr
      LEFT JOIN users u ON fr.user_id = u.id
      WHERE fr.id = ?`,
      [id]
    )

    if (!Array.isArray(requests) || requests.length === 0) {
      return NextResponse.json(
        { message: '요청을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const req = requests[0] as any

    // JSON 필드 파싱
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

    const parsedRequest = {
      ...req,
      operating_hours: operatingHours,
      accessibility_features: accessibilityFeatures,
      facility_images: facilityImages,
    }

    return NextResponse.json({ request: parsedRequest })
  } catch (error) {
    console.error('요청 조회 오류:', error)
    return NextResponse.json(
      { message: '요청 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  } finally {
    if (connection) await connection.end()
  }
}

// PUT: 요청 상태 변경 및 관리자 코멘트 추가
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let connection
  try {
    const { id } = await params
    const body = await request.json()
    const { status, adminComment } = body
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { message: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    connection = await mysql.createConnection(dbConfig)

    // 관리자 확인
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

    // 상태 검증
    if (status && !['대기중', '승인', '반려'].includes(status)) {
      return NextResponse.json(
        { message: '유효하지 않은 상태입니다.' },
        { status: 400 }
      )
    }

    // 업데이트 쿼리 구성
    const updates: string[] = []
    const updateParams: any[] = []

    if (status) {
      updates.push('status = ?')
      updateParams.push(status)
    }

    if (adminComment !== undefined) {
      updates.push('admin_comment = ?')
      updateParams.push(adminComment || null)
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { message: '변경할 내용이 없습니다.' },
        { status: 400 }
      )
    }

    updateParams.push(id)

    await connection.execute(
      `UPDATE facility_requests 
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = ?`,
      updateParams
    )

    return NextResponse.json({ message: '요청이 업데이트되었습니다.' })
  } catch (error) {
    console.error('요청 업데이트 오류:', error)
    return NextResponse.json(
      { message: '요청 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  } finally {
    if (connection) await connection.end()
  }
}

// DELETE: 요청 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let connection
  try {
    const { id } = await params
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { message: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    connection = await mysql.createConnection(dbConfig)

    // 관리자 확인
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

    await connection.execute('DELETE FROM facility_requests WHERE id = ?', [id])

    return NextResponse.json({ message: '요청이 삭제되었습니다.' })
  } catch (error) {
    console.error('요청 삭제 오류:', error)
    return NextResponse.json(
      { message: '요청 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  } finally {
    if (connection) await connection.end()
  }
}

