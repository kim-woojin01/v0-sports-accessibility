import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/src/lib/db'
import bcrypt from 'bcryptjs'

export async function PUT(request: NextRequest) {
  try {
    const { userId, currentPassword, newPassword } = await request.json()

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { message: '모든 필드를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 새 비밀번호 길이 검증 (최대 30자)
    if (newPassword.length === 0 || newPassword.length > 30) {
      return NextResponse.json(
        { message: '새 비밀번호는 1자 이상 30자 이하여야 합니다.' },
        { status: 400 }
      )
    }

    // 사용자 조회
    const users = await query(
      'SELECT id, password FROM users WHERE id = ?',
      [userId]
    )

    if (users.length === 0) {
      return NextResponse.json(
        { message: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const user = users[0] as any

    // 현재 비밀번호 확인
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { message: '현재 비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      )
    }

    // 새 비밀번호 해시화
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    // 비밀번호 업데이트
    await query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedNewPassword, userId]
    )

    return NextResponse.json({
      message: '비밀번호가 성공적으로 변경되었습니다.',
    })
  } catch (error) {
    console.error('비밀번호 변경 오류:', error)
    return NextResponse.json(
      { message: '비밀번호 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}