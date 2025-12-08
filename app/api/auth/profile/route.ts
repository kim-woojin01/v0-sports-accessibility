import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/src/lib/db'
import bcrypt from 'bcryptjs'

export async function PUT(request: NextRequest) {
  try {
    const { userId, idEmail, name, disabilityType, exercisePurposes, profileImageUrl } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { message: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    // Base64 데이터 URI인 경우 길이 확인 및 컬럼 크기 체크
    if (profileImageUrl && profileImageUrl.startsWith('data:')) {
      if (profileImageUrl.length > 2000000) { // 약 2MB
        return NextResponse.json(
          { message: '이미지가 너무 큽니다. 2MB 이하의 이미지를 사용해주세요.' },
          { status: 400 }
        )
      }
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
    try {
      await query(
        `UPDATE users 
         SET user_id_email = ?, name = ?, disability_type = ?, exercise_purposes = ?, profile_image_url = ?
         WHERE id = ?`,
        [
          idEmail,
          name,
          disabilityType || null,
          exercisePurposesJson,
          profileImageUrl || null,
          userId,
        ]
      )

      return NextResponse.json({
        message: '프로필이 수정되었습니다.',
      })
    } catch (updateError: any) {
      // 데이터베이스 컬럼 크기 오류 체크
      if (updateError.code === 'ER_DATA_TOO_LONG' || updateError.message?.includes('Data too long')) {
        console.error('프로필 이미지 URL이 너무 깁니다. 데이터베이스 컬럼을 TEXT로 변경해야 합니다.')
        return NextResponse.json(
          { 
            message: '이미지가 너무 큽니다. 더 작은 이미지를 사용하거나 관리자에게 문의하세요.',
            error: 'DATA_TOO_LONG',
            hint: '데이터베이스 컬럼을 TEXT 타입으로 변경해야 할 수 있습니다.'
          },
          { status: 500 }
        )
      }
      throw updateError
    }
  } catch (error: any) {
    console.error('프로필 수정 오류:', error)
    return NextResponse.json(
      { 
        message: '프로필 수정 중 오류가 발생했습니다.',
        error: error?.message || String(error),
        code: error?.code
      },
      { status: 500 }
    )
  }
}