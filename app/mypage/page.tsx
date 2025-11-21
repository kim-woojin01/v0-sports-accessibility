"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { userProfile, facilities } from "@/lib/data"
import { Calendar, Clock, Settings, LogOut, Save, X, Bell, BellOff, Edit2, Check } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function MyPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false)

  const [isAlarmEditing, setIsAlarmEditing] = useState(false)
  const [isAlarmOn, setIsAlarmOn] = useState(false)
  const [favoriteFacilities, setFavoriteFacilities] = useState<string[]>([])
  const [preferredTime, setPreferredTime] = useState({
    day: "월요일",
    startTime: "14:00",
    endTime: "16:00",
  })

  const [profile, setProfile] = useState({
    name: userProfile.name,
    email: userProfile.email,
    disabilityType: userProfile.disabilityType,
    exercisePurpose: userProfile.exercisePurpose[0], // Simplified for single select demo
  })

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) {
      if (confirm("로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?")) {
        router.push("/signin")
      } else {
        router.push("/")
      }
    } else {
      setIsLoggedIn(true)
    }
  }, [router])

  if (!isLoggedIn) return null

  const handleSaveProfile = () => {
    // Mock API call
    alert("프로필이 수정되었습니다.")
    localStorage.setItem("userName", profile.name)
    // Force reload to update header (in real app use context)
    window.location.reload()
    setIsEditing(false)
  }

  const handleChangePassword = () => {
    // Mock API call
    setShowPasswordModal(true)
  }

  const handleDeleteAccount = () => {
    setShowDeleteConfirmModal(true)
  }

  const confirmDeleteAccount = () => {
    setShowDeleteConfirmModal(false)
    // Mock API call to delete account
    localStorage.removeItem("user")
    localStorage.removeItem("userName")
    setShowDeleteSuccessModal(true)
  }

  const toggleAlarm = () => {
    const newState = !isAlarmOn
    setIsAlarmOn(newState)
    if (newState) {
      // Mock trigger alarm
      setTimeout(() => {
        alert(`[알람 기능] 설정되었습니다. 아래와 같이 알람이 전송될 예정입니다.

[예시 알람] 현재 16시 노원구 장애인스포츠센터 시설의 혼잡도가 적어 이용이 편리합니다.`)
      }, 2000)
    }
  }

  const handleSaveAlarmSettings = () => {
    setIsAlarmEditing(false)
    alert("알람 설정이 저장되었습니다.")
  }

  return (
    <div className="container py-12 max-w-5xl mx-auto pt-24">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar / Profile Summary */}
        <div className="w-full md:w-1/3 space-y-6">
          <Card className="text-center pt-6">
            <div className="flex justify-center mb-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>HG</AvatarFallback>
              </Avatar>
            </div>
            <CardHeader>
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="이름"
                  />
                  <Input
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="이메일"
                  />
                </div>
              ) : (
                <>
                  <CardTitle>{profile.name}</CardTitle>
                  <CardDescription>{profile.email}</CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent className="space-y-4 text-left">
              <div className="text-sm">
                <span className="font-semibold block mb-1">장애 유형</span>
                {isEditing ? (
                  <Select
                    value={profile.disabilityType}
                    onValueChange={(val) => setProfile({ ...profile, disabilityType: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="장애 유형 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="시각 장애">시각 장애</SelectItem>
                      <SelectItem value="청각 장애">청각 장애</SelectItem>
                      <SelectItem value="지체 장애">지체 장애</SelectItem>
                      <SelectItem value="지적 장애">지적 장애</SelectItem>
                      <SelectItem value="해당 사항 없음">해당 사항 없음</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-2 bg-slate-100 rounded">{profile.disabilityType}</div>
                )}
              </div>
              <div className="text-sm">
                <span className="font-semibold block mb-1">운동 목적</span>
                {isEditing ? (
                  <Select
                    value={profile.exercisePurpose}
                    onValueChange={(val) => setProfile({ ...profile, exercisePurpose: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="운동 목적 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="재활">재활</SelectItem>
                      <SelectItem value="유산소">유산소</SelectItem>
                      <SelectItem value="근력 운동">근력 운동</SelectItem>
                      <SelectItem value="체중 감량">체중 감량</SelectItem>
                      <SelectItem value="근력 운동">근력 운동</SelectItem>
                      <SelectItem value="재활 운동">재활 운동</SelectItem>
                      <SelectItem value="스포츠 운동">스포츠 운동</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs">
                      {profile.exercisePurpose}
                    </span>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="flex gap-2 mt-4">
                  <Button className="flex-1 bg-purple-600" onClick={handleSaveProfile}>
                    <Save className="w-4 h-4 mr-2" /> 저장
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setIsEditing(false)}>
                    <X className="w-4 h-4 mr-2" /> 취소
                  </Button>
                </div>
              ) : (
                <Button variant="outline" className="w-full mt-4 bg-transparent" onClick={() => setIsEditing(true)}>
                  <Settings className="w-4 h-4 mr-2" /> 프로필 수정
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="w-full md:w-2/3">
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="history">나의 이용 내역</TabsTrigger>
              <TabsTrigger value="alarm">시설 알람 예약</TabsTrigger>
              <TabsTrigger value="reviews">작성한 리뷰</TabsTrigger>
              <TabsTrigger value="settings">계정 설정</TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="space-y-4">
              <h2 className="text-xl font-bold mb-4">최근 이용한 시설</h2>
              {userProfile.history.map((item, index) => {
                const facility = facilities.find((f) => f.id === item.facilityId)
                if (!facility) return null

                return (
                  <Card key={index} className="overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      <div className="w-full sm:w-32 h-32 bg-slate-200 relative flex-shrink-0">
                        {/* Mock Image */}
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs">
                          Image
                        </div>
                      </div>
                      <div className="flex-1 p-3 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-base">{facility.name}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-1">{facility.address}</p>
                          <div className="flex gap-3 mt-2 text-xs">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{item.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{item.time}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end mt-2">
                          {item.hasReview ? (
                            <Button disabled variant="secondary" size="sm" className="h-7 text-xs">
                              리뷰 작성 완료
                            </Button>
                          ) : (
                            <Link href={`/reviews/write/${facility.id}`}>
                              <Button size="sm" className="bg-purple-600 hover:bg-purple-700 h-7 text-xs">
                                리뷰 작성하기
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </TabsContent>

            <TabsContent value="alarm" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="w-5 h-5 text-purple-600" />
                    시설 알람 예약
                  </CardTitle>
                  <CardDescription>자주 가는 시설의 혼잡도 알림을 받아보세요.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Favorites Section */}
                  <div>
                    <h4 className="font-medium mb-2 text-sm">즐겨찾기 시설</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                      {facilities.map((facility) => (
                        <div key={facility.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            disabled={!isAlarmEditing}
                            checked={favoriteFacilities.includes(facility.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFavoriteFacilities([...favoriteFacilities, facility.id])
                              } else {
                                setFavoriteFacilities(favoriteFacilities.filter((id) => id !== facility.id))
                              }
                            }}
                            className="rounded border-gray-300 text-purple-600"
                          />
                          <span className="text-sm truncate">{facility.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Time Settings */}
                  <div>
                    <h4 className="font-medium mb-2 text-sm">자주 가는 시간대</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        disabled={!isAlarmEditing}
                        value={preferredTime.day}
                        onValueChange={(val) => setPreferredTime({ ...preferredTime, day: val })}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="요일" />
                        </SelectTrigger>
                        <SelectContent>
                          {["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"].map((day) => (
                            <SelectItem key={day} value={day}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-1">
                        <Select
                          disabled={!isAlarmEditing}
                          value={preferredTime.startTime}
                          onValueChange={(val) => setPreferredTime({ ...preferredTime, startTime: val })}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="시작" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                              <SelectItem key={h} value={`${h}:00`}>{`${h}:00`}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-xs">~</span>
                        <Select
                          disabled={!isAlarmEditing}
                          value={preferredTime.endTime}
                          onValueChange={(val) => setPreferredTime({ ...preferredTime, endTime: val })}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="종료" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                              <SelectItem key={h} value={`${h}:00`}>{`${h}:00`}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <Button
                      variant={isAlarmOn ? "default" : "outline"}
                      size="sm"
                      className={isAlarmOn ? "bg-purple-600 hover:bg-purple-700" : ""}
                      onClick={toggleAlarm}
                    >
                      {isAlarmOn ? (
                        <>
                          <Bell className="w-4 h-4 mr-1" /> ON
                        </>
                      ) : (
                        <>
                          <BellOff className="w-4 h-4 mr-1" /> OFF
                        </>
                      )}
                    </Button>

                    {isAlarmEditing ? (
                      <Button size="sm" onClick={handleSaveAlarmSettings} className="bg-blue-600 hover:bg-blue-700">
                        <Check className="w-4 h-4 mr-1" /> 완료
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => setIsAlarmEditing(true)}>
                        <Edit2 className="w-4 h-4 mr-1" /> 수정
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <div className="text-center py-12 text-muted-foreground">작성한 리뷰가 없습니다.</div>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>계정 보안</CardTitle>
                  <CardDescription>비밀번호 및 개인정보를 관리합니다.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">현재 비밀번호</label>
                    <Input type="password" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">새 비밀번호</label>
                    <Input type="password" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">새 비밀번호 확인</label>
                    <Input type="password" />
                  </div>
                  <Button className="w-full" onClick={handleChangePassword}>
                    비밀번호 변경
                  </Button>

                  <div className="pt-8 border-t">
                    <Button variant="destructive" className="w-full" onClick={handleDeleteAccount}>
                      <LogOut className="w-4 h-4 mr-2" /> 계정 탈퇴
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Password Change Success Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>알림</DialogTitle>
            <DialogDescription>비밀번호 변경이 완료되었습니다!</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowPasswordModal(false)}>확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Account Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirmModal} onOpenChange={setShowDeleteConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>계정 탈퇴</DialogTitle>
            <DialogDescription>정말로 탈퇴 하시겠습니까?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirmModal(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={confirmDeleteAccount}>
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Account Delete Success Modal */}
      <Dialog open={showDeleteSuccessModal} onOpenChange={setShowDeleteSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>알림</DialogTitle>
            <DialogDescription>계정이 탈퇴 되었습니다!</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowDeleteSuccessModal(false)
                router.push("/")
              }}
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
