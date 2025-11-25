import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/src/lib/db'

export async function GET(request: NextRequest) {
  try {
    // 헤더 또는 쿼리 파라미터에서 userId 가져오기
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

    const users = await query(
      'SELECT id, user_id_email, name, disability_type, exercise_purposes, profile_image_url FROM users WHERE id = ?',
      [userId]
    )

    if (users.length === 0) {
      return NextResponse.json(
        { message: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const user = users[0] as any

    // exercise_purposes 안전하게 파싱
    let exercisePurposes = []
    if (user.exercise_purposes) {
      try {
        // MySQL JSON 타입이 이미 객체로 반환될 수 있음
        if (typeof user.exercise_purposes === 'string') {
          exercisePurposes = JSON.parse(user.exercise_purposes)
        } else if (Array.isArray(user.exercise_purposes)) {
          exercisePurposes = user.exercise_purposes
        } else if (typeof user.exercise_purposes === 'object') {
          // 객체인 경우 배열로 변환 시도
          exercisePurposes = Object.values(user.exercise_purposes)
        }
        
        // 배열이 아닌 경우 빈 배열로 설정
        if (!Array.isArray(exercisePurposes)) {
          console.warn('exercise_purposes가 배열이 아닙니다:', user.exercise_purposes)
          exercisePurposes = []
        }
      } catch (e) {
        console.error('exercise_purposes 파싱 오류:', e, user.exercise_purposes)
        exercisePurposes = []
      }
    }

    return NextResponse.json({
      id: user.id,
      idEmail: user.user_id_email,
      name: user.name,
      disabilityType: user.disability_type || null,
      exercisePurposes: exercisePurposes,
      profileImageUrl: user.profile_image_url || null,
    })
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error)
    return NextResponse.json(
      { message: '사용자 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}