"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { facilities } from "@/lib/data"
import { Calendar, Clock, Settings, LogOut, Save, X, Bell, BellOff, Edit2, Check } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface UserProfile {
  id: number
  idEmail: string
  name: string
  disabilityType: string | null
  exercisePurposes: string[]
}

export default function MyPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  
  // 계정 탈퇴 비밀번호 입력 상태 추가
  const [deleteAccountPassword, setDeleteAccountPassword] = useState("")
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  // 비밀번호 변경 관련 상태 추가
  const [currentPassword, setCurrentPassword] = useState("")
  const [currentPasswordMessage, setCurrentPasswordMessage] = useState("")
  const [currentPasswordValid, setCurrentPasswordValid] = useState(false)
  const [isCheckingCurrentPassword, setIsCheckingCurrentPassword] = useState(false)
  
  const [newPassword, setNewPassword] = useState("")
  const [newPasswordCheck, setNewPasswordCheck] = useState("")
  const [newPasswordMatchMessage, setNewPasswordMatchMessage] = useState("")
  const [newPasswordMatch, setNewPasswordMatch] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
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

  const [profile, setProfile] = useState<UserProfile>({
    id: 0,
    idEmail: "",
    name: "",
    disabilityType: null,
    exercisePurposes: [],
  })

  const [originalProfile, setOriginalProfile] = useState<UserProfile>({
    id: 0,
    idEmail: "",
    name: "",
    disabilityType: null,
    exercisePurposes: [],
  })

  // 사용자 정보 로드
  useEffect(() => {
    const loadUserProfile = async () => {
      const userStr = localStorage.getItem("user")
      console.log("마이페이지 - localStorage user:", userStr) // 디버깅
      
      if (!userStr) {
        if (confirm("로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?")) {
          router.push("/signin")
        } else {
          router.push("/")
        }
        return
      }

      try {
        const user = JSON.parse(userStr)
        console.log("마이페이지 - 파싱된 사용자:", user) // 디버깅
        
        // 사용자 정보가 제대로 있는지 확인
        if (!user || !user.id) {
          console.error("마이페이지 - 사용자 정보가 올바르지 않습니다:", user)
          router.push("/signin")
          return
        }

        const profileData = {
          id: user.id,
          idEmail: user.idEmail || "",
          name: user.name || "",
          disabilityType: user.disabilityType || null,
          exercisePurposes: Array.isArray(user.exercisePurposes) 
            ? user.exercisePurposes 
            : [],
        }

        console.log("마이페이지 - 설정할 프로필:", profileData) // 디버깅

        setProfile(profileData)
        setOriginalProfile(profileData)
        setIsLoggedIn(true)
      } catch (error) {
        console.error("마이페이지 - 사용자 정보 로드 오류:", error)
        console.error("마이페이지 - 파싱 실패한 userStr:", userStr)
        router.push("/signin")
      } finally {
        setIsLoading(false)
      }
    }

    loadUserProfile()
  }, [router])

  if (isLoading) {
    return (
      <div className="container py-12 max-w-5xl mx-auto pt-24">
        <div className="text-center">로딩 중...</div>
      </div>
    )
  }

  if (!isLoggedIn) return null

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile.id,
          idEmail: profile.idEmail,
          name: profile.name,
          disabilityType: profile.disabilityType,
          exercisePurposes: profile.exercisePurposes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || "프로필 수정에 실패했습니다.")
        return
      }

      // 로컬 스토리지 업데이트
      const updatedUser = {
        id: profile.id,
        idEmail: profile.idEmail,
        name: profile.name,
        disabilityType: profile.disabilityType,
        exercisePurposes: profile.exercisePurposes,
      }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      localStorage.setItem('userName', profile.name)

      setOriginalProfile({ ...profile })
      setIsEditing(false)
      alert("프로필이 수정되었습니다.")
      window.location.reload()
    } catch (error) {
      console.error('프로필 수정 오류:', error)
      alert("프로필 수정 중 오류가 발생했습니다.")
    }
  }

  const handleCancelEdit = () => {
    setProfile({ ...originalProfile })
    setIsEditing(false)
  }

  // 현재 비밀번호 확인 함수
  const handleVerifyCurrentPassword = async () => {
    if (!currentPassword) {
      setCurrentPasswordMessage("비밀번호를 입력해주세요.")
      setCurrentPasswordValid(false)
      return
    }

    setIsCheckingCurrentPassword(true)
    try {
      const userStr = localStorage.getItem("user")
      if (!userStr) {
        setCurrentPasswordMessage("로그인이 필요합니다.")
        setCurrentPasswordValid(false)
        setIsCheckingCurrentPassword(false)
        return
      }

      const user = JSON.parse(userStr)
      const response = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          password: currentPassword,
        }),
      })

      const data = await response.json()

      if (data.isValid) {
        setCurrentPasswordMessage("비밀번호가 일치합니다.")
        setCurrentPasswordValid(true)
      } else {
        setCurrentPasswordMessage("비밀번호가 일치하지 않습니다.")
        setCurrentPasswordValid(false)
      }
    } catch (error) {
      console.error('비밀번호 확인 오류:', error)
      setCurrentPasswordMessage("비밀번호 확인 중 오류가 발생했습니다.")
      setCurrentPasswordValid(false)
    } finally {
      setIsCheckingCurrentPassword(false)
    }
  }

  // 현재 비밀번호 입력 변경 시
  const handleCurrentPasswordChange = (value: string) => {
    setCurrentPassword(value)
    setCurrentPasswordMessage("")
    setCurrentPasswordValid(false)
  }

  // 새 비밀번호 확인
  const handleNewPasswordCheck = (checkValue: string) => {
    setNewPasswordCheck(checkValue)
    if (checkValue && newPassword) {
      if (checkValue === newPassword) {
        setNewPasswordMatchMessage("비밀번호가 일치합니다.")
        setNewPasswordMatch(true)
      } else {
        setNewPasswordMatchMessage("일치하지 않습니다.")
        setNewPasswordMatch(false)
      }
    } else {
      setNewPasswordMatchMessage("")
      setNewPasswordMatch(false)
    }
  }

  // 새 비밀번호 변경 시
  const handleNewPasswordChange = (value: string) => {
    if (value.length <= 30) {
      setNewPassword(value)
      // 새 비밀번호 확인과 재확인
      if (newPasswordCheck && value !== newPasswordCheck) {
        setNewPasswordMatchMessage("일치하지 않습니다.")
        setNewPasswordMatch(false)
      } else if (newPasswordCheck && value === newPasswordCheck) {
        setNewPasswordMatchMessage("비밀번호가 일치합니다.")
        setNewPasswordMatch(true)
      }
    }
  }

  const handlePurposeChange = (value: string) => {
    setProfile((prev) => ({
      ...prev,
      exercisePurposes: prev.exercisePurposes.includes(value)
        ? prev.exercisePurposes.filter((p) => p !== value)
        : [...prev.exercisePurposes, value],
    }))
  }

  const handleChangePassword = async () => {
    // 유효성 검증
    if (!currentPasswordValid) {
      alert("현재 비밀번호를 확인해주세요.")
      return
    }

    if (!newPassword || newPassword.length === 0 || newPassword.length > 30) {
      alert("새 비밀번호를 입력해주세요. (최대 30자)")
      return
    }

    if (!newPasswordMatch) {
      alert("새 비밀번호가 일치하지 않습니다.")
      return
    }

    setIsChangingPassword(true)

    try {
      const userStr = localStorage.getItem("user")
      if (!userStr) {
        alert("로그인이 필요합니다.")
        setIsChangingPassword(false)
        return
      }

      const user = JSON.parse(userStr)
      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          currentPassword: currentPassword,
          newPassword: newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || "비밀번호 변경에 실패했습니다.")
        setIsChangingPassword(false)
        return
      }

      // 성공
      setShowPasswordModal(true)
      // 입력 필드 초기화
      setCurrentPassword("")
      setCurrentPasswordMessage("")
      setCurrentPasswordValid(false)
      setNewPassword("")
      setNewPasswordCheck("")
      setNewPasswordMatchMessage("")
      setNewPasswordMatch(false)
      setIsChangingPassword(false)
    } catch (error) {
      console.error('비밀번호 변경 오류:', error)
      alert("비밀번호 변경 중 오류가 발생했습니다.")
      setIsChangingPassword(false)
    }
  }

  const handleDeleteAccount = () => {
    // 비밀번호 입력 모달 표시
    setShowDeleteConfirmModal(true)
  }

  const confirmDeleteAccount = async () => {
    if (!deleteAccountPassword) {
      alert("비밀번호를 입력해주세요.")
      return
    }

    setIsDeletingAccount(true)
    
    try {
      const userStr = localStorage.getItem("user")
      if (!userStr) {
        alert("로그인이 필요합니다.")
        setIsDeletingAccount(false)
        return
      }

      const user = JSON.parse(userStr)
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          password: deleteAccountPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || "계정 탈퇴에 실패했습니다.")
        setIsDeletingAccount(false)
        setDeleteAccountPassword("")
        return
      }

      // 성공 - localStorage 정리
      localStorage.removeItem("user")
      localStorage.removeItem("userName")
      localStorage.removeItem("userId")
      setShowDeleteConfirmModal(false)
      setDeleteAccountPassword("")
      setShowDeleteSuccessModal(true)
      setIsDeletingAccount(false)
    } catch (error) {
      console.error('계정 탈퇴 오류:', error)
      alert("계정 탈퇴 중 오류가 발생했습니다.")
      setIsDeletingAccount(false)
    }
  }

  const toggleAlarm = () => {
    const newState = !isAlarmOn
    setIsAlarmOn(newState)
    if (newState) {
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

  const disabilityTypeOptions = [
    { value: "visual", label: "시각 장애" },
    { value: "hearing", label: "청각 장애" },
    { value: "physical", label: "지체 장애" },
    { value: "intellectual", label: "지적 장애" },
    { value: "language", label: "언어 장애" },
    { value: "none", label: "해당 없음" },
  ]

  const exercisePurposeOptions = ["재활", "유산소", "근력", "재활 운동", "체중 감량", "스포츠 운동"]

  return (
    <div className="container py-12 max-w-5xl mx-auto pt-24">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar / Profile Summary */}
        <div className="w-full md:w-1/3 space-y-6">
          <Card className="text-center pt-6">
            <div className="flex justify-center mb-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
            <CardHeader>
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="이름"
                    maxLength={30}
                  />
                  <Input
                    value={profile.idEmail}
                    onChange={(e) => setProfile({ ...profile, idEmail: e.target.value })}
                    placeholder="ID / email"
                    maxLength={50}
                  />
                </div>
              ) : (
                <>
                  <CardTitle>{profile.name || "이름 없음"}</CardTitle>
                  <CardDescription>{profile.idEmail || "이메일 없음"}</CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent className="space-y-4 text-left">
              <div className="text-sm">
                <span className="font-semibold block mb-1">장애 유형</span>
                {isEditing ? (
                  <Select
                    value={profile.disabilityType || ""}
                    onValueChange={(val) => setProfile({ ...profile, disabilityType: val || null })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="장애 유형 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {disabilityTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-2 bg-slate-100 rounded">
                    {profile.disabilityType
                      ? disabilityTypeOptions.find((opt) => opt.value === profile.disabilityType)?.label || profile.disabilityType
                      : "선택 안 함"}
                  </div>
                )}
              </div>
              <div className="text-sm">
                <span className="font-semibold block mb-1">운동 목적</span>
                {isEditing ? (
                  <div className="space-y-2">
                    {exercisePurposeOptions.map((purpose) => (
                      <div key={purpose} className="flex items-center space-x-2">
                        <Checkbox
                          id={purpose}
                          checked={profile.exercisePurposes.includes(purpose)}
                          onCheckedChange={() => handlePurposeChange(purpose)}
                        />
                        <Label htmlFor={purpose} className="text-sm font-normal cursor-pointer">
                          {purpose}
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    {profile.exercisePurposes.length > 0 ? (
                      profile.exercisePurposes.map((purpose) => (
                        <span key={purpose} className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs">
                          {purpose}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-xs">선택 안 함</span>
                    )}
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="flex gap-2 mt-4">
                  <Button className="flex-1 bg-purple-600" onClick={handleSaveProfile}>
                    <Save className="w-4 h-4 mr-2" /> 저장
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={handleCancelEdit}>
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

        {/* Main Content - 나머지 탭 내용은 기존과 동일 */}
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
              <div className="text-center py-12 text-muted-foreground">
                이용 내역이 없습니다.
              </div>
            </TabsContent>

            <TabsContent value="alarm" className="space-y-4">
              {/* 알람 설정 내용은 기존과 동일 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="w-5 h-5 text-purple-600" />
                    시설 알람 예약
                  </CardTitle>
                  <CardDescription>자주 가는 시설의 혼잡도 알림을 받아보세요.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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
                  {/* 현재 비밀번호 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">현재 비밀번호</label>
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => handleCurrentPasswordChange(e.target.value)}
                        onBlur={handleVerifyCurrentPassword}
                        disabled={isCheckingCurrentPassword}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleVerifyCurrentPassword}
                        disabled={isCheckingCurrentPassword || !currentPassword}
                      >
                        {isCheckingCurrentPassword ? "확인 중..." : "확인"}
                      </Button>
                    </div>
                    {currentPasswordMessage && (
                      <p className={`text-xs ${currentPasswordValid ? "text-green-600" : "text-red-600"}`}>
                        {currentPasswordMessage}
                      </p>
                    )}
                  </div>

                  {/* 새 비밀번호 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">새 비밀번호</label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => handleNewPasswordChange(e.target.value)}
                      maxLength={30}
                      placeholder="최대 30자까지 입력 가능"
                    />
                  </div>

                  {/* 새 비밀번호 확인 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">새 비밀번호 확인</label>
                    <Input
                      type="password"
                      value={newPasswordCheck}
                      onChange={(e) => handleNewPasswordCheck(e.target.value)}
                      maxLength={30}
                    />
                    {newPasswordMatchMessage && (
                      <p className={`text-xs ${newPasswordMatch ? "text-green-600" : "text-red-600"}`}>
                        {newPasswordMatchMessage}
                      </p>
                    )}
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleChangePassword}
                    disabled={isChangingPassword || !currentPasswordValid || !newPasswordMatch}
                  >
                    {isChangingPassword ? "변경 중..." : "비밀번호 변경"}
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

      {/* Modals - 기존과 동일 */}
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

            {/* 계정 탈퇴 확인 모달 */}
            <Dialog open={showDeleteConfirmModal} onOpenChange={setShowDeleteConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>계정 탈퇴</DialogTitle>
            <DialogDescription>
              계정 탈퇴를 진행하시겠습니까?
              <br />
              <br />
              <span className="font-semibold text-amber-600">
                ⚠️ 중요: 7일 내에 다시 로그인하시면 계정이 복구됩니다.
              </span>
              <br />
              <br />
              계정 탈퇴를 확인하려면 비밀번호를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">비밀번호</label>
              <Input
                type="password"
                value={deleteAccountPassword}
                onChange={(e) => setDeleteAccountPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                disabled={isDeletingAccount}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && deleteAccountPassword && !isDeletingAccount) {
                    confirmDeleteAccount()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteConfirmModal(false)
                setDeleteAccountPassword("")
              }}
              disabled={isDeletingAccount}
            >
              취소
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteAccount}
              disabled={isDeletingAccount || !deleteAccountPassword}
            >
              {isDeletingAccount ? "처리 중..." : "탈퇴하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteSuccessModal} onOpenChange={setShowDeleteSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>알림</DialogTitle>
            <DialogDescription>
              계정 탈퇴 신청이 완료되었습니다.
              <br />
              <br />
              <span className="font-semibold text-blue-600">
                💡 7일 내에 다시 로그인하시면 계정이 자동으로 복구됩니다.
              </span>
            </DialogDescription>
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