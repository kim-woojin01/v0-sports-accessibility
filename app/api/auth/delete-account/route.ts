import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/src/lib/db'
import bcrypt from 'bcryptjs'

export async function DELETE(request: NextRequest) {
  try {
    const { userId, password } = await request.json()

    if (!userId || !password) {
      return NextResponse.json(
        { message: '사용자 ID와 비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 사용자 정보 조회
    const users = await query(
      'SELECT id, user_id_email, password, name, phone, birth_date, disability_type, exercise_purposes FROM users WHERE id = ?',
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

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: '비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      )
    }

        // 7일 후 날짜 계산
        const scheduledDeletionDate = new Date()
        scheduledDeletionDate.setDate(scheduledDeletionDate.getDate() + 7)
        
        // MySQL DATETIME 형식으로 변환
        const year = scheduledDeletionDate.getFullYear()
        const month = String(scheduledDeletionDate.getMonth() + 1).padStart(2, '0')
        const day = String(scheduledDeletionDate.getDate()).padStart(2, '0')
        const hours = String(scheduledDeletionDate.getHours()).padStart(2, '0')
        const minutes = String(scheduledDeletionDate.getMinutes()).padStart(2, '0')
        const seconds = String(scheduledDeletionDate.getSeconds()).padStart(2, '0')
        const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    
        // deleted_users 테이블로 계정 정보 이동 (실제 삭제는 7일 후)
        await query(
          `INSERT INTO deleted_users 
           (original_user_id, user_id_email, password, name, phone, birth_date, disability_type, exercise_purposes, scheduled_deletion_date)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            user.id,
            user.user_id_email,
            user.password,
            user.name,
            user.phone,
            user.birth_date,
            user.disability_type,
            user.exercise_purposes,
            formattedDate
          ]
        )

    // users 테이블에서 계정 삭제 (7일 내 복구 가능하도록 deleted_users에만 저장)
    await query(
      'DELETE FROM users WHERE id = ?',
      [userId]
    )

    return NextResponse.json({
      message: '계정 탈퇴 신청이 완료되었습니다. 7일 내에 다시 로그인하시면 계정이 복구됩니다.',
    })
} catch (error) {
    console.error('계정 탈퇴 오류:', error)
    console.error('오류 상세:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { 
        message: '계정 탈퇴 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}