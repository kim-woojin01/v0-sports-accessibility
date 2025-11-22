import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/src/lib/db'
import bcrypt from 'bcryptjs'

export async function PUT(request: NextRequest) {
  try {
    const { userId, idEmail, name, disabilityType, exercisePurposes } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { message: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    // ID/이메일 중복 확인 (다른 사용자가 사용 중인지)
    if (idEmail) {
      const existingUsers = await query(
        'SELECT id FROM users WHERE user_id_email = ? AND id != ?',
        [idEmail, userId]
      )

      if (existingUsers.length > 0) {
        return NextResponse.json(
          { message: '이미 사용 중인 ID 또는 이메일입니다.' },
          { status: 400 }
        )
      }
    }

    // 운동 목적을 JSON 문자열로 변환
    const exercisePurposesJson = exercisePurposes && exercisePurposes.length > 0
      ? JSON.stringify(exercisePurposes)
      : null

    // 프로필 업데이트
    await query(
      `UPDATE users 
       SET user_id_email = ?, name = ?, disability_type = ?, exercise_purposes = ?
       WHERE id = ?`,
      [
        idEmail,
        name,
        disabilityType || null,
        exercisePurposesJson,
        userId,
      ]
    )

    return NextResponse.json({
      message: '프로필이 수정되었습니다.',
    })
  } catch (error) {
    console.error('프로필 수정 오류:', error)
    return NextResponse.json(
      { message: '프로필 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}