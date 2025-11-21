"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"

export function SiteHeader() {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Mock login state check - in real app this would use auth context
  useEffect(() => {
    const user = localStorage.getItem("user")
    setIsLoggedIn(!!user)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("user")
    setIsLoggedIn(false)
    window.location.href = "/"
  }

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Search", href: "/search" },
    { name: "Reviews", href: "/reviews" },
    { name: "Mypage", href: "/mypage" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight">
              Sports<span className="text-primary">Access</span>
            </span>
          </Link>
          <nav className="hidden md:flex gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <Link href="/mypage" className="text-sm font-medium hover:underline">
                홍길동님 환영합니다!
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
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
                  Sign in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-pink-500 hover:bg-pink-600 text-white">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>

        <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t p-4 space-y-4 bg-background">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="pt-4 border-t">
            {isLoggedIn ? (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">홍길동님 환영합니다!</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/signin" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-purple-700">Sign in</Button>
                </Link>
                <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-pink-500">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
