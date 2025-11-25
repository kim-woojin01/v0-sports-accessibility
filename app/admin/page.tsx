"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Shield } from "lucide-react"

export default function AdminPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdmin = () => {
      const userStr = localStorage.getItem("user")
      if (!userStr) {
        router.push("/signin")
        return
      }

      try {
        const user = JSON.parse(userStr)
        if (user.idEmail === "admin") {
          setIsAdmin(true)
        } else {
          // 관리자가 아니면 홈으로 리다이렉트
          router.push("/")
        }
      } catch (error) {
        console.error("사용자 정보 파싱 오류:", error)
        router.push("/signin")
      } finally {
        setIsLoading(false)
      }
    }

    checkAdmin()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold">관리자 대시보드</h1>
          </div>
          <p className="text-muted-foreground">
            SportsAccess 관리자 전용 페이지입니다.
          </p>
        </div>

        {/* 추후 기능 추가 영역 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 여기에 관리자 기능 카드들을 추가할 예정 */}
          <Card>
            <CardHeader>
              <CardTitle>기능 1</CardTitle>
              <CardDescription>추후 추가 예정</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                관리자 기능이 여기에 추가됩니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

