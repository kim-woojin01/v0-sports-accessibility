import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/src/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { idEmail, password } = await request.json()

    if (!idEmail || !password) {
      return NextResponse.json(
        { message: 'ID/이메일과 비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 사용자 조회
    const users = await query(
      'SELECT id, user_id_email, password, name, disability_type, exercise_purposes FROM users WHERE user_id_email = ?',
      [idEmail]
    )

    if (users.length === 0) {
      return NextResponse.json(
        { message: 'ID/이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      )
    }

    const user = users[0] as any

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'ID/이메일 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      )
    }

    // 비밀번호 제외하고 사용자 정보 반환
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
        message: '로그인 성공',
        user: {
          id: userWithoutPassword.id,
          idEmail: userWithoutPassword.user_id_email,
          name: userWithoutPassword.name,
          disabilityType: userWithoutPassword.disability_type,
          exercisePurposes: (() => {
            if (!userWithoutPassword.exercise_purposes) {
              return []
            }
            try {
              const parsed = JSON.parse(userWithoutPassword.exercise_purposes)
              return Array.isArray(parsed) ? parsed : []
            } catch (e) {
              // JSON 파싱 실패 시 빈 배열 반환
              console.warn('exercise_purposes 파싱 실패, 빈 배열 반환:', userWithoutPassword.exercise_purposes)
              return []
            }
          })(),
        },
      })
  } catch (error) {
    console.error('로그인 오류:', error)
    return NextResponse.json(
      { message: '로그인 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}