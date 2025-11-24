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
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-8 max-w-screen-2xl mx-auto">
        <div className="space-y-4">
          <h3 className="text-lg font-bold">국민체육진흥공단</h3>
          <p className="text-sm text-muted-foreground">
            <Link href="https://www.kspo.or.kr/kspo/main/main.do">https://www.kspo.or.kr/kspo/main/main.do</Link>
          </p>
          <div className="flex flex-wrap gap-3">
            <Link 
              href="https://www.youtube.com/channel/UC8dtm6cdDJ0oLpVK9AQoS1Q" 
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="YouTube (스포츠정보채널)"
            >
              <SiYoutube className="h-5 w-5" />
            </Link>
            <Link 
              href="https://www.youtube.com/user/kspo97" 
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="YouTube (KSPO)"
            >
              <SiYoutube className="h-5 w-5" />
            </Link>
            <Link 
              href="https://www.instagram.com/kspo.tiger/#" 
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Instagram"
            >
              <SiInstagram className="h-5 w-5" />
            </Link>
            <Link 
              href="https://blog.naver.com/kspo2011" 
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Naver Blog"
            >
              <SiNaver className="h-5 w-5" />
            </Link>
            <Link 
              href="https://www.facebook.com/kspof/" 
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Facebook"
            >
              <SiFacebook className="h-5 w-5" />
            </Link>
            <Link 
              href="https://www.tiktok.com/@kspo88" 
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="TikTok"
            >
              <SiTiktok className="h-5 w-5" />
            </Link>
            <Link 
              href="https://pf.kakao.com/_cBusb" 
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="KakaoTalk"
            >
              <SiKakaotalk className="h-5 w-5" />
            </Link>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Platform</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="#">How it Works</Link>
            </li>
            <li>
              <Link href="#">Checkout</Link>
            </li>
            <li>
              <Link href="#">Fraud</Link>
            </li>
            <li>
              <Link href="#">Protection</Link>
            </li>
            <li>
              <Link href="#">Payments</Link>
            </li>
            <li>
              <Link href="#">Accounts</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Learn</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="#">Resources</Link>
            </li>
            <li>
              <Link href="#">Blog</Link>
            </li>
            <li>
              <Link href="#">FAQs</Link>
            </li>
            <li>
              <Link href="#">ThinkShop</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4">About</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="#">Careers</Link>
            </li>
            <li>
              <Link href="#">Team</Link>
            </li>
            <li>
              <Link href="#">Partners</Link>
            </li>
            <li>
              <Link href="#">Contact Us</Link>
            </li>
            <li>
              <Link href="#">News & Press</Link>
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