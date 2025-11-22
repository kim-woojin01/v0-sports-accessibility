import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/src/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { message: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const users = await query(
      'SELECT id, user_id_email, name, disability_type, exercise_purposes FROM users WHERE id = ?',
      [userId]
    )

    if (users.length === 0) {
      return NextResponse.json(
        { message: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const user = users[0] as any

    return NextResponse.json({
      id: user.id,
      idEmail: user.user_id_email,
      name: user.name,
      disabilityType: user.disability_type || null,
      exercisePurposes: user.exercise_purposes 
        ? JSON.parse(user.exercise_purposes) 
        : [],
    })
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error)
    return NextResponse.json(
      { message: '사용자 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}