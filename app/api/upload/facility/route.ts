import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'business' or 'facility'

    if (!file) {
      return NextResponse.json(
        { message: '파일이 없습니다.' },
        { status: 400 }
      )
    }

    // 파일 타입 검증 (이미지만 허용)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { message: '이미지 파일만 업로드 가능합니다.' },
        { status: 400 }
      )
    }

    // 파일 크기 제한 (Vercel에서는 Base64 인코딩 시 약 33% 증가하므로 더 작게 제한)
    // business: 5MB, facility: 2MB
    const maxSize = type === 'business' ? 5 * 1024 * 1024 : 2 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: `파일 크기는 ${type === 'business' ? '5MB' : '2MB'} 이하여야 합니다.` },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Vercel 환경 확인 (서버리스 환경에서는 파일 시스템 사용 불가)
    const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'
    
    if (isVercel) {
      // Vercel 환경: Base64로 인코딩하여 데이터 URI 반환
      const base64 = buffer.toString('base64')
      const mimeType = file.type || 'image/jpeg'
      const dataUrl = `data:${mimeType};base64,${base64}`
      
      return NextResponse.json({
        message: '파일 업로드 성공',
        url: dataUrl,
      })
    } else {
      // 로컬 환경: 파일 시스템에 저장
      const timestamp = Date.now()
      const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filename = `${timestamp}_${originalName}`

      // 업로드 디렉토리 생성
      const subDir = type === 'business' ? 'business' : 'facilities'
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'facility', subDir)
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }

      // 파일 저장
      const filepath = join(uploadDir, filename)
      await writeFile(filepath, buffer)

      // URL 반환
      const url = `/uploads/facility/${subDir}/${filename}`

      return NextResponse.json({
        message: '파일 업로드 성공',
        url: url,
      })
    }
  } catch (error) {
    console.error('파일 업로드 오류:', error)
    return NextResponse.json(
      { message: '파일 업로드 중 오류가 발생했습니다.', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
