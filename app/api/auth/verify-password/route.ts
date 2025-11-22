import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/src/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { userId, password } = await request.json()

    if (!userId || !password) {
      return NextResponse.json(
        { message: '사용자 ID와 비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 사용자 조회
    const users = await query(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    )

    if (users.length === 0) {
      return NextResponse.json(
        { message: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const user = users[0] as any

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password)

    return NextResponse.json({
      isValid: isPasswordValid,
    })
  } catch (error) {
    console.error('비밀번호 확인 오류:', error)
    return NextResponse.json(
      { message: '비밀번호 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}