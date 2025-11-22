import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/src/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { idEmail, password, name, phone, birthDate, disabilityType, exercisePurposes } = await request.json()

    // 필수 항목 검증
    if (!idEmail || !password || !name || !phone || !birthDate) {
      return NextResponse.json(
        { message: '필수 항목을 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    // ID/이메일 중복 확인
    const existingUsers = await query(
      'SELECT id FROM users WHERE user_id_email = ?',
      [idEmail]
    )

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { message: '이미 사용 중인 ID 또는 이메일입니다.' },
        { status: 400 }
      )
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10)

    // 운동 목적을 JSON 문자열로 변환
    const exercisePurposesJson = exercisePurposes && exercisePurposes.length > 0
      ? JSON.stringify(exercisePurposes)
      : null

    // 사용자 생성
    const result = await query(
      `INSERT INTO users (user_id_email, password, name, phone, birth_date, disability_type, exercise_purposes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        idEmail,
        hashedPassword,
        name,
        phone,
        birthDate,
        disabilityType || null,
        exercisePurposesJson
      ]
    )

    return NextResponse.json(
      { message: '회원가입이 완료되었습니다.', userId: (result as any).insertId },
      { status: 201 }
    )
  } catch (error) {
    console.error('회원가입 오류:', error)
    return NextResponse.json(
      { message: '회원가입 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}