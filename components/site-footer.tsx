import Link from "next/link"
import {
  SiYoutube,
  SiInstagram,
  SiNaver,
  SiFacebook,
  SiTiktok,
  SiKakaotalk,
} from "react-icons/si"

export function SiteFooter() {
  return (
    <footer className="bg-background border-t py-12 w-full">
      <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-screen-2xl mx-auto px-4">
        <div className="space-y-4 text-center md:text-left">
          <h3 className="text-lg font-bold">국민체육진흥공단</h3>
          <p className="text-sm text-muted-foreground">
            <Link href="https://www.kspo.or.kr/kspo/main/main.do">https://www.kspo.or.kr/kspo/main/main.do</Link>
          </p>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start" role="list" aria-label="소셜 미디어 링크">
            <Link
              href="https://www.youtube.com/channel/UC8dtm6cdDJ0oLpVK9AQoS1Q"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="YouTube (스포츠정보채널)"
            >
              <SiYoutube className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link
              href="https://www.youtube.com/user/kspo97"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="YouTube (KSPO)"
            >
              <SiYoutube className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link
              href="https://www.instagram.com/kspo.tiger/#"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Instagram"
            >
              <SiInstagram className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link
              href="https://blog.naver.com/kspo2011"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Naver Blog"
            >
              <SiNaver className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link
              href="https://www.facebook.com/kspof/"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Facebook"
            >
              <SiFacebook className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link
              href="https://www.tiktok.com/@kspo88"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="TikTok"
            >
              <SiTiktok className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link
              href="https://pf.kakao.com/_cBusb"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="KakaoTalk"
            >
              <SiKakaotalk className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="text-center md:text-left">
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

        <div className="text-center md:text-left">
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

        <div className="text-center md:text-left">
          <h4 className="font-semibold mb-4">서비스 및 정책</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/about">서비스 소개</Link>
            </li>
            <li>
              <Link href="/accessibility-policy">웹 접근성 정책</Link>
            </li>
            <li>
              <Link href="/privacy-policy">개인정보처리방침</Link>
            </li>
            <li>
              <Link href="/terms-of-service">이용약관</Link>
            </li>
            <li>
              <Link href="/team">팀 소개</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="container mt-12 pt-8 border-t text-center max-w-screen-2xl mx-auto px-4">
        <div className="w-full h-12 gradient-primary flex items-center justify-center text-white text-sm">
          © Copyright 2025 SportsAccess. All rights reserved
        </div>
      </div>
    </footer>
  )
}