"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Menu, X, Shield } from "lucide-react"

export function SiteHeader() {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userName, setUserName] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)

  // localStorage 변경 감지 및 사용자 정보 로드
  const loadUserInfo = () => {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setIsLoggedIn(true)
        // name 필드 확인
        setUserName(user.name || "")
        // 관리자 여부 확인
        setIsAdmin(user.idEmail === "admin")
        console.log("헤더 - 로드된 사용자:", user.name) // 디버깅
      } catch (e) {
        console.error("헤더 - 파싱 오류:", e)
        const storedName = localStorage.getItem("userName")
        if (storedName) {
          setUserName(storedName)
          setIsLoggedIn(true)
        } else {
          setIsLoggedIn(false)
          setUserName("")
        }
        setIsAdmin(false)
      }
    } else {
      setIsLoggedIn(false)
      setUserName("")
      setIsAdmin(false)
    }
  }

  useEffect(() => {
    loadUserInfo()

    // 같은 탭에서 localStorage 변경 감지를 위한 커스텀 이벤트
    const handleCustomStorageChange = () => {
      loadUserInfo()
    }
    window.addEventListener('storage', handleCustomStorageChange)
    
    // 주기적으로 확인 (같은 탭에서는 storage 이벤트가 발생하지 않음)
    const interval = setInterval(() => {
      loadUserInfo()
    }, 1000)

    return () => {
      window.removeEventListener('storage', handleCustomStorageChange)
      clearInterval(interval)
    }
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("userName")
    localStorage.removeItem("userId")
    setIsLoggedIn(false)
    setUserName("")
    setIsAdmin(false)
    window.location.href = "/"
  }

  const navItems = [
    { name: "Home", label: "홈", href: "/" },
    { name: "Search", label: "검색", href: "/search" },
    { name: "Reviews", label: "리뷰", href: "/reviews" },
    { name: "Mypage", label: "마이페이지", href: "/mypage" },
  ]

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between relative max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-8 pl-6">
          <Link href="/" className="flex items-center space-x-2" aria-label="SportsAccess 홈으로 이동">
            <span className="text-xl font-bold tracking-tight">
              Sports<span className="text-primary">Access</span>
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex gap-16 absolute left-1/2 transform -translate-x-1/2" aria-label="메인 내비게이션">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary relative py-2 ${
                pathname === item.href ? "text-purple-600" : "text-muted-foreground"
              }`}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
              {pathname === item.href && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-purple-600 rounded-full" aria-hidden="true" />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              {/* 관리자 버튼 - "관리자님 환영합니다!" 왼쪽에 배치 */}
              {isAdmin && (
                <Link href="/admin">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-purple-600 text-purple-600 hover:bg-purple-50 flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    관리자
                  </Button>
                </Link>
              )}
              <Link href="/mypage" className="text-sm font-medium hover:underline">
                {userName || "사용자"}님 환영합니다!
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                로그아웃
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/signin">
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-purple-700 text-white hover:bg-purple-800 hover:text-white"
                >
                  로그인
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-pink-500 hover:bg-pink-600 text-white">
                  회원 가입
                </Button>
              </Link>
            </div>
          )}
        </div>

        <button 
          className="md:hidden" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t p-4 space-y-4 bg-background" role="menu" aria-label="메인 내비게이션">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="pt-4 border-t">
            {isLoggedIn ? (
              <div className="flex flex-col gap-2">
                {/* 모바일에서도 관리자 버튼 표시 */}
                {isAdmin && (
                  <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-purple-600 text-purple-600 hover:bg-purple-50 flex items-center justify-center gap-2"
                    >
                      <Shield className="w-4 h-4" />
                      관리자
                    </Button>
                  </Link>
                )}
                <span className="text-sm font-medium">{userName || "사용자"}님 환영합니다!</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  로그아웃
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/signin" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-purple-700">로그인</Button>
                </Link>
                <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-pink-500">회원 가입</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}