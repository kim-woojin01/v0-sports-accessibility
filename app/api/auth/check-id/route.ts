import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/src/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { idEmail } = await request.json()

    if (!idEmail) {
      return NextResponse.json(
        { message: 'ID 또는 이메일을 입력해주세요.' },
        { status: 400 }
      )
    }

    const results = await query(
      'SELECT id FROM users WHERE user_id_email = ?',
      [idEmail]
    )

    return NextResponse.json({ exists: results.length > 0 })
  } catch (error) {
    console.error('ID 확인 오류:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}