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
  
      let isAccountRestored = false // 계정 복구 여부 플래그
  
      // 사용자 조회 (먼저 users 테이블에서 확인)
      let users = await query(
      'SELECT id, user_id_email, password, name, disability_type, exercise_purposes, profile_image_url FROM users WHERE user_id_email = ?',
        [idEmail]
      )
  
      // users 테이블에 없으면 deleted_users에서 복구 가능한 계정 확인
      if (users.length === 0) {
        const deletedUsers = await query(
          `SELECT original_user_id, user_id_email, password, name, disability_type, exercise_purposes, scheduled_deletion_date
           FROM deleted_users 
           WHERE user_id_email = ? AND scheduled_deletion_date > NOW()`,
          [idEmail]
        )
  
        if (deletedUsers.length > 0) {
          const deletedUser = deletedUsers[0] as any
          
          // 비밀번호 확인
          const isPasswordValid = await bcrypt.compare(password, deletedUser.password)
          
          if (isPasswordValid) {
            // 계정 복구: deleted_users에서 users로 복원
            await query(
              `INSERT INTO users 
               (id, user_id_email, password, name, phone, birth_date, disability_type, exercise_purposes)
               SELECT original_user_id, user_id_email, password, name, phone, birth_date, disability_type, exercise_purposes
               FROM deleted_users
               WHERE original_user_id = ?`,
              [deletedUser.original_user_id]
            )
  
            // deleted_users에서 삭제
            await query(
              'DELETE FROM deleted_users WHERE original_user_id = ?',
              [deletedUser.original_user_id]
            )
  
            // 복구된 사용자 정보 조회
            users = await query(
            'SELECT id, user_id_email, password, name, disability_type, exercise_purposes, profile_image_url FROM users WHERE user_id_email = ?',
              [idEmail]
            )
            
            // 계정 복구 플래그 설정
            isAccountRestored = true
          }
        }
      }
  
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
        isAccountRestored: isAccountRestored, // 계정 복구 여부
        user: {
          id: userWithoutPassword.id,
          idEmail: userWithoutPassword.user_id_email,
          name: userWithoutPassword.name,
          disabilityType: userWithoutPassword.disability_type,
        profileImageUrl: userWithoutPassword.profile_image_url || null,
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