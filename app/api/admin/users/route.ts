import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/src/lib/db'

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

// GET: 모든 회원 목록 조회
export async function GET(request: NextRequest) {
  try {
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

    // 모든 회원 정보 조회 (비밀번호 제외)
    const users = await query(
      `SELECT 
        id,
        user_id_email,
        name,
        phone,
        birth_date,
        disability_type,
        exercise_purposes,
        profile_image_url,
        created_at,
        updated_at
       FROM users
       ORDER BY created_at DESC`
    )

    // exercise_purposes JSON 파싱
    const parsedUsers = users.map((user: any) => {
      let exercisePurposes = []
      if (user.exercise_purposes) {
        try {
          if (typeof user.exercise_purposes === 'string') {
            exercisePurposes = JSON.parse(user.exercise_purposes)
          } else if (Array.isArray(user.exercise_purposes)) {
            exercisePurposes = user.exercise_purposes
          } else if (typeof user.exercise_purposes === 'object') {
            exercisePurposes = Object.values(user.exercise_purposes)
          }
          if (!Array.isArray(exercisePurposes)) {
            exercisePurposes = []
          }
        } catch (e) {
          console.error('exercise_purposes 파싱 오류:', e)
          exercisePurposes = []
        }
      }

      return {
        ...user,
        exercise_purposes: exercisePurposes,
      }
    })

    return NextResponse.json({
      users: parsedUsers,
      total: parsedUsers.length,
    })
  } catch (error) {
    console.error('회원 목록 조회 오류:', error)
    return NextResponse.json(
      { message: '회원 목록 조회 중 오류가 발생했습니다.', users: [] },
      { status: 500 }
    )
  }
}
