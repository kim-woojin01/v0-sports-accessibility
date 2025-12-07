"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Users, FileText, Settings, BarChart3, Bell } from "lucide-react"
import LottieLoader from "@/components/loading-animation"
import { motion } from "framer-motion"

interface AdminFeature {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  href: string
  color: string
  comingSoon?: boolean
}

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

  const adminFeatures: AdminFeature[] = [
    {
      id: "users",
      title: "회원 관리",
      description: "등록된 모든 회원 정보를 확인하고 관리할 수 있습니다.",
      icon: <Users className="w-8 h-8" />,
      href: "/admin/users",
      color: "from-purple-500 to-purple-700",
    },
    {
      id: "notices",
      title: "공지사항 관리",
      description: "공지사항을 작성, 수정, 삭제할 수 있습니다.",
      icon: <Bell className="w-8 h-8" />,
      href: "/admin/notices",
      color: "from-blue-500 to-blue-700",
    },
    {
      id: "facility-requests",
      title: "시설 정보 수정 요청",
      description: "사용자들이 제출한 시설 정보 수정 요청을 관리합니다.",
      icon: <FileText className="w-8 h-8" />,
      href: "/admin/facility-requests",
      color: "from-green-500 to-green-700",
    },
    {
      id: "analytics",
      title: "통계 및 분석",
      description: "서비스 이용 통계와 분석 데이터를 확인할 수 있습니다.",
      icon: <BarChart3 className="w-8 h-8" />,
      href: "/admin/analytics",
      color: "from-orange-500 to-orange-700",
      comingSoon: true,
    },
    {
      id: "settings",
      title: "시스템 설정",
      description: "시스템 전반의 설정을 관리할 수 있습니다.",
      icon: <Settings className="w-8 h-8" />,
      href: "/admin/settings",
      color: "from-gray-500 to-gray-700",
      comingSoon: true,
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LottieLoader />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gradient-to-br from-purple-50 via-purple-100 to-pink-100">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-purple-600" />
            <h1 className="text-4xl md:text-5xl font-bold">관리자 대시보드</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            SportsAccess 관리자 전용 페이지입니다. 원하는 기능을 선택하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminFeatures.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`h-full cursor-pointer transition-all hover:shadow-lg ${
                  feature.comingSoon ? "opacity-60" : "hover:border-purple-300"
                }`}
                onClick={() => {
                  if (!feature.comingSoon) {
                    router.push(feature.href)
                  }
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && !feature.comingSoon) {
                    router.push(feature.href)
                  }
                }}
                aria-label={`${feature.title} ${feature.comingSoon ? "(준비 중)" : ""}`}
              >
                <CardHeader>
                  <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  {feature.comingSoon && (
                    <Badge variant="secondary" className="mt-2 w-fit">
                      준비 중
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
