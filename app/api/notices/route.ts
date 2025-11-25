import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/src/lib/db'

export async function GET(request: NextRequest) {
  try {
    const notices = await query(
      `SELECT id, category, title, content, created_at, is_important 
       FROM notices 
       ORDER BY is_important DESC, created_at DESC`
    )

    return NextResponse.json({
      notices: notices || [],
    })
  } catch (error) {
    console.error('공지사항 조회 오류:', error)
    return NextResponse.json(
      { message: '공지사항 조회 중 오류가 발생했습니다.', notices: [] },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { category, title, content, isImportant } = await request.json()

    // 필수 필드 검증
    if (!category || !title || !content) {
      return NextResponse.json(
        { message: '카테고리, 제목, 내용을 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    // 관리자 권한 확인
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

    // 사용자 정보 조회
    const users = await query(
      'SELECT user_id_email FROM users WHERE id = ?',
      [userId]
    )

    if (users.length === 0) {
      return NextResponse.json(
        { message: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const user = users[0] as any

    // 관리자 계정 확인 (user_id_email이 'admin'인지 확인)
    if (user.user_id_email !== 'admin') {
      return NextResponse.json(
        { message: '관리자만 공지사항을 추가할 수 있습니다.' },
        { status: 403 }
      )
    }

    // 카테고리 유효성 검증
    const validCategories = ['업데이트', '점검', '이벤트']
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { message: '유효하지 않은 카테고리입니다.' },
        { status: 400 }
      )
    }

    // 공지사항 추가
    const result = await query(
      `INSERT INTO notices (category, title, content, is_important) 
       VALUES (?, ?, ?, ?)`,
      [category, title, content, isImportant || false]
    )

    return NextResponse.json({
      message: '공지사항이 추가되었습니다.',
      noticeId: (result as any).insertId,
    })
  } catch (error) {
    console.error('공지사항 추가 오류:', error)
    return NextResponse.json(
      { message: '공지사항 추가 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 관리자 권한 확인 헬퍼 함수
async function checkAdminPermission(userId: string | null) {
  if (!userId) {
    return { isAdmin: false, message: '인증이 필요합니다.', status: 401 }
  }

  const users = await query(
    'SELECT user_id_email FROM users WHERE id = ?',
    [userId]
  )

  if (users.length === 0) {
    return { isAdmin: false, message: '사용자를 찾을 수 없습니다.', status: 404 }
  }

  const user = users[0] as any

  if (user.user_id_email !== 'admin') {
    return { isAdmin: false, message: '관리자만 이 작업을 수행할 수 있습니다.', status: 403 }
  }

  return { isAdmin: true }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, category, title, content, isImportant } = await request.json()

    // 필수 필드 검증
    if (!id || !category || !title || !content) {
      return NextResponse.json(
        { message: 'ID, 카테고리, 제목, 내용을 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    // 관리자 권한 확인
    const userIdFromHeader = request.headers.get('x-user-id')
    const { searchParams } = new URL(request.url)
    const userIdFromQuery = searchParams.get('userId')
    const userId = userIdFromHeader || userIdFromQuery

    const adminCheck = await checkAdminPermission(userId)
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { message: adminCheck.message },
        { status: adminCheck.status }
      )
    }

    // 카테고리 유효성 검증
    const validCategories = ['업데이트', '점검', '이벤트']
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { message: '유효하지 않은 카테고리입니다.' },
        { status: 400 }
      )
    }

    // 공지사항 존재 확인
    const existingNotices = await query(
      'SELECT id FROM notices WHERE id = ?',
      [id]
    )

    if (existingNotices.length === 0) {
      return NextResponse.json(
        { message: '공지사항을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 공지사항 수정
    await query(
      `UPDATE notices 
       SET category = ?, title = ?, content = ?, is_important = ? 
       WHERE id = ?`,
      [category, title, content, isImportant || false, id]
    )

    return NextResponse.json({
      message: '공지사항이 수정되었습니다.',
    })
  } catch (error) {
    console.error('공지사항 수정 오류:', error)
    return NextResponse.json(
      { message: '공지사항 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const noticeId = searchParams.get('id')

    if (!noticeId) {
      return NextResponse.json(
        { message: '공지사항 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 관리자 권한 확인
    const userIdFromHeader = request.headers.get('x-user-id')
    const userIdFromQuery = searchParams.get('userId')
    const userId = userIdFromHeader || userIdFromQuery

    const adminCheck = await checkAdminPermission(userId)
    if (!adminCheck.isAdmin) {
      return NextResponse.json(
        { message: adminCheck.message },
        { status: adminCheck.status }
      )
    }

    // 공지사항 존재 확인
    const existingNotices = await query(
      'SELECT id FROM notices WHERE id = ?',
      [noticeId]
    )

    if (existingNotices.length === 0) {
      return NextResponse.json(
        { message: '공지사항을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 공지사항 삭제
    await query('DELETE FROM notices WHERE id = ?', [noticeId])

    return NextResponse.json({
      message: '공지사항이 삭제되었습니다.',
    })
  } catch (error) {
    console.error('공지사항 삭제 오류:', error)
    return NextResponse.json(
      { message: '공지사항 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

