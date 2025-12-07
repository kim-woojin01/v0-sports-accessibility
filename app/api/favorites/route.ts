import { NextRequest, NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

// Railway DB 설정 (51173 포트 - 통합 DB)
// Vercel 환경 변수: RAILWAY_HOST, RAILWAY_PORT, RAILWAY_USER, RAILWAY_PASSWORD, RAILWAY_DATABASE
// createConnection에서는 connectTimeout만 지원됨
const dbConfig = {
  host: process.env.RAILWAY_HOST || process.env.RAILWAY_REVIEWS_HOST || 'nozomi.proxy.rlwy.net',
  port: Number(process.env.RAILWAY_PORT || process.env.RAILWAY_REVIEWS_PORT) || 51173,
  user: process.env.RAILWAY_USER || process.env.RAILWAY_REVIEWS_USER || 'root',
  password: process.env.RAILWAY_PASSWORD || process.env.RAILWAY_REVIEWS_PASSWORD || 'lRzqwghWSchqdRyErESveHwVyKYUfhME',
  database: process.env.RAILWAY_DATABASE || process.env.RAILWAY_REVIEWS_DATABASE || 'railway',
  connectTimeout: 10000,
}

// DB 연결 정보 확인 함수
function logDbConnection() {
  const config = {
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.user,
    // password는 로그에 출력하지 않음
  }
  console.log('🔌 Railway DB 연결 정보:', config)
  return config
}

// GET: 사용자의 즐겨찾기 시설 목록 조회
export async function GET(request: NextRequest) {
  let connection
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { message: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    console.log('즐겨찾기 조회 요청 - user_id:', userId)
    logDbConnection()
    
    connection = await mysql.createConnection(dbConfig)
    console.log('✅ Railway DB 연결 성공 (facility_favorites 테이블이 있는 DB)')
    
    // 테이블 존재 확인
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'facility_favorites'"
    )
    if ((tables as any[]).length === 0) {
      console.error('❌ facility_favorites 테이블이 존재하지 않습니다!')
      return NextResponse.json(
        { message: '즐겨찾기 테이블을 찾을 수 없습니다.' },
        { status: 500 }
      )
    }
    console.log('✅ facility_favorites 테이블 확인 완료')
    
    const [favorites] = await connection.execute(
      'SELECT facility_id FROM facility_favorites WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    )

    const facilityIds = (favorites as any[]).map((f) => Number(f.facility_id))
    console.log('✅ 즐겨찾기 조회 성공 - 개수:', facilityIds.length, 'IDs:', facilityIds)
    
    return NextResponse.json({ favorites: facilityIds })
  } catch (error: any) {
    console.error('즐겨찾기 조회 오류:', error)
    return NextResponse.json(
      { message: '즐겨찾기 조회 중 오류가 발생했습니다.', error: error.message },
      { status: 500 }
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// POST: 즐겨찾기 추가
export async function POST(request: NextRequest) {
  let connection
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { message: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const { facilityId } = await request.json()
    if (!facilityId) {
      return NextResponse.json(
        { message: '시설 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    console.log('즐겨찾기 추가 요청 - user_id:', userId, 'facility_id:', facilityId)
    logDbConnection()
    
    connection = await mysql.createConnection(dbConfig)
    console.log('✅ Railway DB 연결 성공 (facility_favorites 테이블이 있는 DB)')
    
    // 중복 체크
    const [existing] = await connection.execute(
      'SELECT id FROM facility_favorites WHERE user_id = ? AND facility_id = ?',
      [userId, facilityId]
    )

    if ((existing as any[]).length > 0) {
      console.log('즐겨찾기 중복 - 이미 존재함')
      return NextResponse.json(
        { message: '이미 즐겨찾기에 추가된 시설입니다.' },
        { status: 400 }
      )
    }

    const [result] = await connection.execute(
      'INSERT INTO facility_favorites (user_id, facility_id) VALUES (?, ?)',
      [userId, facilityId]
    )

    const insertId = (result as any).insertId
    console.log('✅ INSERT 성공 - insertId:', insertId)
    console.log('📝 Railway DB (nozomi.proxy.rlwy.net:51173)의 facility_favorites 테이블에 저장됨')
    
    return NextResponse.json({ 
      message: '즐겨찾기에 추가되었습니다.',
      id: insertId,
      success: true
    })
  } catch (error: any) {
    console.error('즐겨찾기 추가 오류:', error)
    console.error('오류 상세:', {
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
      message: error.message,
    })
    
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { message: '이미 즐겨찾기에 추가된 시설입니다.', error: 'DUPLICATE_ENTRY' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        message: '즐겨찾기 추가 중 오류가 발생했습니다.', 
        error: error.message || '알 수 없는 오류',
        code: error.code,
      },
      { status: 500 }
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// DELETE: 즐겨찾기 제거
export async function DELETE(request: NextRequest) {
  let connection
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { message: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const facilityId = searchParams.get('facilityId')
    if (!facilityId) {
      return NextResponse.json(
        { message: '시설 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    console.log('즐겨찾기 제거 요청 - user_id:', userId, 'facility_id:', facilityId)
    logDbConnection()
    
    connection = await mysql.createConnection(dbConfig)
    console.log('✅ Railway DB 연결 성공 (facility_favorites 테이블이 있는 DB)')
    
    const [result] = await connection.execute(
      'DELETE FROM facility_favorites WHERE user_id = ? AND facility_id = ?',
      [userId, facilityId]
    )

    const affectedRows = (result as any).affectedRows
    console.log('✅ DELETE 성공 - affectedRows:', affectedRows)
    console.log('📝 Railway DB (nozomi.proxy.rlwy.net:51173)의 facility_favorites 테이블에서 삭제됨')

    if (affectedRows === 0) {
      return NextResponse.json(
        { message: '즐겨찾기에 없는 시설입니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: '즐겨찾기에서 제거되었습니다.' })
  } catch (error: any) {
    console.error('즐겨찾기 제거 오류:', error)
    return NextResponse.json(
      { message: '즐겨찾기 제거 중 오류가 발생했습니다.', error: error.message },
      { status: 500 }
    )
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}
