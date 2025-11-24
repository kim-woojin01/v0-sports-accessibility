import Link from "next/link"
import { Facebook, Twitter, Instagram } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="bg-background border-t py-12 w-full">
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-8 max-w-screen-2xl mx-auto">
        <div className="space-y-4">
          <h3 className="text-lg font-bold">국민체육진흥공단</h3>
          <p className="text-sm text-muted-foreground">
            <Link href="https://www.kspo.or.kr/kspo/main/main.do">https://www.kspo.or.kr/kspo/main/main.do</Link>
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <Facebook className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <Instagram className="h-5 w-5" />
            </Link>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-4">서비스</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/search">시설 검색</Link>
            </li>
            <li>
              <Link href="/mypage">찜한 시설</Link>
            </li>
            <li>
              <Link href="#">접근성 등급 안내</Link>
            </li>
            <li>
              <Link href="#">혼잡도 분석</Link>
            </li>
            <li>
              <Link href="/mypage">작성한 리뷰 관리</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">고객 지원</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="#">공지사항</Link>
            </li>
            <li>
              <Link href="#">자주 묻는 질문</Link>
            </li>
            <li>
              <Link href="#">시설 정보 수정 요청</Link>
            </li>
            <li>
              <Link href="#">이용 가이드</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">서비스 및 정책</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="#">서비스 소개</Link>
            </li>
            <li>
              <Link href="#">웹 접근성 정책</Link>
            </li>
            <li>
              <Link href="#">개인정보처리방침</Link>
            </li>
            <li>
              <Link href="#">이용약관</Link>
            </li>
            <li>
              <Link href="#">팀 소개</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="container mt-12 pt-8 border-t text-center max-w-screen-2xl mx-auto">
        <div className="w-full h-12 gradient-primary flex items-center justify-center text-white text-sm">
          © Copyright ar-shakir. All right reserved
        </div>
      </div>
    </footer>
  )
}