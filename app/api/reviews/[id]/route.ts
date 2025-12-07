import { NextResponse } from "next/server"
import mysql from "mysql2/promise"

// Railway DB 설정 (51173 포트 - 통합 DB)
// Vercel 환경 변수: RAILWAY_HOST, RAILWAY_PORT, RAILWAY_USER, RAILWAY_PASSWORD, RAILWAY_DATABASE
// createConnection에서는 connectTimeout만 지원됨
const dbConfig = {
  host: process.env.RAILWAY_HOST || process.env.RAILWAY_REVIEWS_HOST || "nozomi.proxy.rlwy.net",
  port: Number(process.env.RAILWAY_PORT || process.env.RAILWAY_REVIEWS_PORT) || 51173,
  user: process.env.RAILWAY_USER || process.env.RAILWAY_REVIEWS_USER || "root",
  password: process.env.RAILWAY_PASSWORD || process.env.RAILWAY_REVIEWS_PASSWORD || "lRzqwghWSchqdRyErESveHwVyKYUfhME",
  database: process.env.RAILWAY_DATABASE || process.env.RAILWAY_REVIEWS_DATABASE || "railway",
  connectTimeout: 10000,
}

// 단일 리뷰 조회 (선택 사항)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  let connection: mysql.Connection | undefined

  try {
    // Next.js 16에서 params가 Promise일 수 있음
    const resolvedParams = params instanceof Promise ? await params : params
    const reviewId = Number(resolvedParams.id)

    if (!reviewId || isNaN(reviewId)) {
      return NextResponse.json({ error: "유효하지 않은 리뷰 ID" }, { status: 400 })
    }

    console.log("리뷰 조회 시작 - reviewId:", reviewId)
    connection = await mysql.createConnection(dbConfig)

    const [rows] = await connection.execute(
      `
      SELECT
        r.id,
        r.facility_id,
        r.user_id,
        r.user_name,
        r.rating,
        r.content,
        r.tags,
        DATE_FORMAT(r.created_at, '%Y-%m-%d') AS date
      FROM facility_reviews r
      WHERE r.id = ?
      `,
      [reviewId],
    )

    console.log("리뷰 조회 결과:", (rows as any[]).length, "개")

    if ((rows as any[]).length === 0) {
      return NextResponse.json({ error: "리뷰를 찾을 수 없습니다." }, { status: 404 })
    }

    const row: any = (rows as any[])[0]

    return NextResponse.json(
      {
        id: row.id,
        facilityId: row.facility_id,
        userId: row.user_id,
        userName: row.user_name,
        rating: row.rating,
        content: row.content,
        date: row.date,
        tags: row.tags ? (typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags) : [],
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("단일 리뷰 조회 오류:", error)
    console.error("오류 상세:", error.message)
    if (error.code) {
      console.error("오류 코드:", error.code)
    }
    return NextResponse.json(
      { 
        error: "리뷰 조회 실패",
        detail: error.message || String(error)
      },
      { status: 500 }
    )
  } finally {
    if (connection) await connection.end()
  }
}

// 리뷰 수정
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  let connection: mysql.Connection | undefined

  try {
    // Next.js 16에서 params가 Promise일 수 있음
    const resolvedParams = params instanceof Promise ? await params : params
    const reviewId = Number(resolvedParams.id)

    if (!reviewId || isNaN(reviewId)) {
      return NextResponse.json({ error: "유효하지 않은 리뷰 ID" }, { status: 400 })
    }

    const body = await request.json()
    const { rating, content, tags } = body

    if (!rating || !content) {
      return NextResponse.json({ error: "필수 값 누락" }, { status: 400 })
    }

    console.log("리뷰 수정 시작 - reviewId:", reviewId)
    connection = await mysql.createConnection(dbConfig)

    const [result] = await connection.execute(
      `
      UPDATE facility_reviews
      SET rating = ?, content = ?, tags = ?, updated_at = NOW()
      WHERE id = ?
      `,
      [Number(rating), String(content), JSON.stringify(tags ?? []), reviewId],
    )

    // @ts-ignore
    const affectedRows = result.affectedRows
    console.log("리뷰 수정 완료 - 영향받은 행:", affectedRows)

    if (affectedRows === 0) {
      return NextResponse.json({ error: "리뷰를 찾을 수 없습니다." }, { status: 404 })
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error: any) {
    console.error("리뷰 수정 오류:", error)
    console.error("오류 상세:", error.message)
    if (error.code) {
      console.error("오류 코드:", error.code)
    }
    return NextResponse.json(
      { 
        error: "리뷰 수정 실패",
        detail: error.message || String(error)
      },
      { status: 500 }
    )
  } finally {
    if (connection) await connection.end()
  }
}

// 리뷰 삭제
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  let connection: mysql.Connection | undefined

  try {
    // Next.js 16에서 params가 Promise일 수 있음
    const resolvedParams = params instanceof Promise ? await params : params
    const reviewId = Number(resolvedParams.id)

    if (!reviewId || isNaN(reviewId)) {
      return NextResponse.json({ error: "유효하지 않은 리뷰 ID" }, { status: 400 })
    }

    console.log("리뷰 삭제 시작 - reviewId:", reviewId)
    connection = await mysql.createConnection(dbConfig)

    const [result] = await connection.execute(
      `
      DELETE FROM facility_reviews
      WHERE id = ?
      `,
      [reviewId],
    )

    // @ts-ignore
    const affectedRows = result.affectedRows
    console.log("리뷰 삭제 완료 - 영향받은 행:", affectedRows)

    if (affectedRows === 0) {
      return NextResponse.json({ error: "리뷰를 찾을 수 없습니다." }, { status: 404 })
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error: any) {
    console.error("리뷰 삭제 오류:", error)
    console.error("오류 상세:", error.message)
    if (error.code) {
      console.error("오류 코드:", error.code)
    }
    return NextResponse.json(
      { 
        error: "리뷰 삭제 실패",
        detail: error.message || String(error)
      },
      { status: 500 }
    )
  } finally {
    if (connection) await connection.end()
  }
}





