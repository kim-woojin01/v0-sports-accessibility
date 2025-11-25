"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Users, Search, Phone, Calendar, ArrowLeft } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface UserData {
  id: number
  user_id_email: string
  name: string
  phone: string
  birth_date: string
  disability_type: string | null
  exercise_purposes: string[]
  profile_image_url: string | null
  created_at: string
  updated_at: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [users, setUsers] = useState<UserData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const checkAdmin = async () => {
      const userStr = localStorage.getItem("user")
      if (!userStr) {
        router.push("/signin")
        return
      }

      try {
        const user = JSON.parse(userStr)
        if (user.idEmail === "admin") {
          setIsAdmin(true)
          const uid = user.id.toString()
          setUserId(uid)
          
          // 회원 목록 로드
          setIsLoadingUsers(true)
          try {
            const response = await fetch(`/api/admin/users?userId=${uid}`, {
              headers: {
                "x-user-id": uid,
              },
            })

            if (!response.ok) {
              throw new Error("회원 목록 조회 실패")
            }

            const data = await response.json()
            setUsers(data.users || [])
            setFilteredUsers(data.users || [])
          } catch (error) {
            console.error("회원 목록 로드 오류:", error)
          } finally {
            setIsLoadingUsers(false)
          }
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

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.user_id_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone.includes(searchTerm)
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchTerm, users])

  const handleUserClick = (user: UserData) => {
    setSelectedUser(user)
    setIsUserDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

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
        {/* 헤더 */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            대시보드로 돌아가기
          </Button>
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold">회원 관리</h1>
          </div>
          <p className="text-muted-foreground">
            등록된 모든 회원 정보를 확인하고 관리할 수 있습니다.
          </p>
        </div>

        {/* 회원 관리 카드 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>회원 목록</CardTitle>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                총 {users.length}명
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* 검색 바 */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="이름, 이메일, 전화번호로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {isLoadingUsers ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              </div>
            ) : (
              <>
                {/* 데스크톱 테이블 뷰 */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">프로필</th>
                        <th className="text-left p-4">ID/이메일</th>
                        <th className="text-left p-4">이름</th>
                        <th className="text-left p-4">전화번호</th>
                        <th className="text-left p-4">생년월일</th>
                        <th className="text-left p-4">장애 유형</th>
                        <th className="text-left p-4">운동 목적</th>
                        <th className="text-left p-4">가입일</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-muted-foreground">
                            {searchTerm ? "검색 결과가 없습니다." : "등록된 회원이 없습니다."}
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr
                            key={user.id}
                            className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => handleUserClick(user)}
                          >
                            <td className="p-4">
                              <Avatar>
                                <AvatarImage src={user.profile_image_url || ""} />
                                <AvatarFallback>
                                  {user.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            </td>
                            <td className="p-4 font-medium">{user.user_id_email}</td>
                            <td className="p-4">{user.name}</td>
                            <td className="p-4">{user.phone}</td>
                            <td className="p-4">
                              {user.birth_date} ({calculateAge(user.birth_date)}세)
                            </td>
                            <td className="p-4">
                              {user.disability_type ? (
                                <Badge variant="outline">{user.disability_type}</Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="p-4">
                              {user.exercise_purposes && user.exercise_purposes.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {user.exercise_purposes.slice(0, 2).map((purpose, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {purpose}
                                    </Badge>
                                  ))}
                                  {user.exercise_purposes.length > 2 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{user.exercise_purposes.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="p-4 text-sm text-muted-foreground">
                              {formatDate(user.created_at)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 모바일 카드 뷰 */}
                <div className="md:hidden space-y-4">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      {searchTerm ? "검색 결과가 없습니다." : "등록된 회원이 없습니다."}
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <Card
                        key={user.id}
                        className="cursor-pointer hover:border-purple-300 transition-colors"
                        onClick={() => handleUserClick(user)}
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <Avatar>
                              <AvatarImage src={user.profile_image_url || ""} />
                              <AvatarFallback>
                                {user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                              <div>
                                <h3 className="font-semibold">{user.name}</h3>
                                <p className="text-sm text-muted-foreground">{user.user_id_email}</p>
                              </div>
                              <div className="flex flex-wrap gap-2 text-sm">
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  <span>{user.phone}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{user.birth_date} ({calculateAge(user.birth_date)}세)</span>
                                </div>
                              </div>
                              {user.disability_type && (
                                <Badge variant="outline">{user.disability_type}</Badge>
                              )}
                              {user.exercise_purposes && user.exercise_purposes.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {user.exercise_purposes.map((purpose, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {purpose}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 회원 상세 정보 다이얼로그 */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>회원 상세 정보</DialogTitle>
            <DialogDescription>
              회원의 전체 정보를 확인할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={selectedUser.profile_image_url || ""} />
                  <AvatarFallback className="text-2xl">
                    {selectedUser.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl font-bold">{selectedUser.name}</h3>
                  <p className="text-muted-foreground">{selectedUser.user_id_email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">전화번호</label>
                  <p className="text-base">{selectedUser.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">생년월일</label>
                  <p className="text-base">
                    {selectedUser.birth_date} ({calculateAge(selectedUser.birth_date)}세)
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">장애 유형</label>
                  <p className="text-base">
                    {selectedUser.disability_type || (
                      <span className="text-muted-foreground">미입력</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">가입일</label>
                  <p className="text-base">{formatDate(selectedUser.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">최종 수정일</label>
                  <p className="text-base">{formatDate(selectedUser.updated_at)}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">운동 목적</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedUser.exercise_purposes && selectedUser.exercise_purposes.length > 0 ? (
                    selectedUser.exercise_purposes.map((purpose, idx) => (
                      <Badge key={idx} variant="secondary">
                        {purpose}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">미입력</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

