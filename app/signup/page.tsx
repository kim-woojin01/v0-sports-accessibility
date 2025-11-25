"use client"
import { Button } from "@/components/ui/button"
import type React from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Lock, User, Phone, Calendar, Check } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
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

// 유효성 검사 함수들
const isValidIdOrEmail = (value: string): boolean => {
  if (value.length === 0 || value.length > 50) return false
  // 이메일 형식 또는 일반 ID 형식 (영문, 숫자, 일부 특수문자)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const idRegex = /^[a-zA-Z0-9._-]+$/
  return emailRegex.test(value) || idRegex.test(value)
}

const isValidPhone = (value: string): boolean => {
  // 010-0000-0000 형식
  const phoneRegex = /^010-\d{4}-\d{4}$/
  return phoneRegex.test(value)
}

export default function SignUpPage() {
  const router = useRouter()
  
  // 필수 항목 상태
  const [idEmail, setIdEmail] = useState("")
  const [isIdChecked, setIsIdChecked] = useState(false)
  const [idMessage, setIdMessage] = useState("")
  const [idAvailable, setIdAvailable] = useState(false)
  
  const [password, setPassword] = useState("")
  const [passwordCheck, setPasswordCheck] = useState("")
  const [passwordMatchMessage, setPasswordMatchMessage] = useState("")
  const [passwordMatch, setPasswordMatch] = useState(false)
  
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [birthYear, setBirthYear] = useState("")
  const [birthMonth, setBirthMonth] = useState("")
  const [birthDay, setBirthDay] = useState("")
  
  // 선택 항목 상태
  const [disabilityType, setDisabilityType] = useState("")
  const [exercisePurposes, setExercisePurposes] = useState<string[]>([])
  
  // 프로필 사진 상태
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string>("")
  const [profileImageUrl, setProfileImageUrl] = useState<string>("")
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [imageSelectionMode, setImageSelectionMode] = useState<"upload" | "sample">("upload")
  const [selectedSampleImage, setSelectedSampleImage] = useState<string>("")
  
  // 샘플 이미지 목록
  const sampleImages = [
    "/placeholder-user.jpg",
    "/placeholder.jpg",
    "/placeholder.svg",
  ]
  
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ID/이메일 중복 확인
  const handleCheckId = async () => {
    if (!idEmail) {
      setIdMessage("아이디 또는 이메일을 입력해주세요.")
      setIdAvailable(false)
      setIsIdChecked(false)
      return
    }
    
    if (!isValidIdOrEmail(idEmail)) {
      setIdMessage("올바른 ID 또는 이메일 형식이 아닙니다.")
      setIdAvailable(false)
      setIsIdChecked(false)
      return
    }
    
    if (idEmail.length > 50) {
      setIdMessage("ID 또는 이메일은 최대 50자까지 입력 가능합니다.")
      setIdAvailable(false)
      setIsIdChecked(false)
      return
    }

    try {
      const response = await fetch('/api/auth/check-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idEmail }),
      })
      
      const data = await response.json()
      
      if (data.exists) {
        setIdMessage("이미 사용 중인 ID 또는 이메일입니다.")
        setIdAvailable(false)
      } else {
        setIdMessage("사용 가능한 ID 또는 이메일입니다!")
        setIdAvailable(true)
      }
      setIsIdChecked(true)
    } catch (error) {
      console.error('ID 확인 중 오류:', error)
      setIdMessage("확인 중 오류가 발생했습니다. 다시 시도해주세요.")
      setIdAvailable(false)
      setIsIdChecked(false)
    }
  }

  // 비밀번호 확인
  const handlePasswordCheck = (checkValue: string) => {
    setPasswordCheck(checkValue)
    if (checkValue && password) {
      if (checkValue === password) {
        setPasswordMatchMessage("비밀번호가 일치합니다.")
        setPasswordMatch(true)
      } else {
        setPasswordMatchMessage("비밀번호가 일치하지 않습니다.")
        setPasswordMatch(false)
      }
    } else {
      setPasswordMatchMessage("")
      setPasswordMatch(false)
    }
  }

  // 비밀번호 변경 시 재확인
  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (passwordCheck && value !== passwordCheck) {
      setPasswordMatchMessage("비밀번호가 일치하지 않습니다.")
      setPasswordMatch(false)
    } else if (passwordCheck && value === passwordCheck) {
      setPasswordMatchMessage("비밀번호가 일치합니다.")
      setPasswordMatch(true)
    }
  }

  // 전화번호 입력 처리 (숫자만, 010-0000-0000 형식)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "")
    if (value.length <= 11) {
      let formatted = value
      if (value.length > 3 && value.startsWith('010')) {
        formatted = value.replace(/^(\d{3})(\d{4})(\d{4})$/, `$1-$2-$3`)
      } else if (value.length > 3) {
        formatted = value.replace(/^(\d{3})(\d{3,4})(\d{0,4})$/, (match, p1, p2, p3) => {
          if (p3) return `${p1}-${p2}-${p3}`
          if (p2) return `${p1}-${p2}`
          return p1
        })
      }
      setPhone(formatted)
    }
  }

  // 이름 입력 (최대 30자)
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.length <= 30) {
      setName(value)
    }
  }

  // ID/이메일 입력 (최대 50자)
  const handleIdEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.length <= 50) {
      setIdEmail(value)
      setIsIdChecked(false)
      setIdMessage("")
    }
  }

  // 비밀번호 입력 (최대 30자)
  const handlePasswordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.length <= 30) {
      handlePasswordChange(value)
    }
  }

  // 비밀번호 확인 입력 (최대 30자)
  const handlePasswordCheckInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.length <= 30) {
      handlePasswordCheck(value)
    }
  }

  // 운동 목적 변경
  const handlePurposeChange = (value: string) => {
    setExercisePurposes((prev) => 
      prev.includes(value) 
        ? prev.filter((item) => item !== value) 
        : [...prev, value]
    )
  }

  // 샘플 이미지 선택 핸들러
  const handleSampleImageSelect = (imageUrl: string) => {
    setSelectedSampleImage(imageUrl)
    setProfileImageUrl(imageUrl)
    setProfileImage(null)
    setProfileImagePreview("")
  }

  // 이미지 선택 핸들러
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.')
      return
    }

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.')
      return
    }

    setProfileImage(file)

    // 미리보기 생성
    const reader = new FileReader()
    reader.onloadend = () => {
      setProfileImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // 서버에 업로드
    setIsUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/profile', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || '이미지 업로드에 실패했습니다.')
        setProfileImage(null)
        setProfileImagePreview("")
        return
      }

      setProfileImageUrl(data.url)
    } catch (error) {
      console.error('이미지 업로드 오류:', error)
      alert('이미지 업로드 중 오류가 발생했습니다.')
      setProfileImage(null)
      setProfileImagePreview("")
    } finally {
      setIsUploadingImage(false)
    }
  }

  // 생년월일 유효성 검사
  const isValidDate = (year: string, month: string, day: string): boolean => {
    if (!year || !month || !day) return false
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return (
      date.getFullYear() === parseInt(year) &&
      date.getMonth() === parseInt(month) - 1 &&
      date.getDate() === parseInt(day)
    )
  }

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    // 필수 항목 검증
    if (!idEmail || !isValidIdOrEmail(idEmail)) {
      setErrorMessage("필수 항목을 입력해 주세요.")
      return
    }

    if (!isIdChecked || !idAvailable) {
      setErrorMessage("ID 또는 이메일 중복 확인을 해주세요.")
      return
    }

    if (!password || password.length === 0 || password.length > 30) {
      setErrorMessage("필수 항목을 입력해 주세요.")
      return
    }

    if (!passwordCheck || !passwordMatch) {
      setErrorMessage("비밀번호가 일치하지 않습니다.")
      return
    }

    if (!name || name.length === 0 || name.length > 30) {
      setErrorMessage("필수 항목을 입력해 주세요.")
      return
    }

    if (!phone || !isValidPhone(phone)) {
      setErrorMessage("필수 항목을 입력해 주세요.")
      return
    }

    if (!birthYear || !birthMonth || !birthDay || !isValidDate(birthYear, birthMonth, birthDay)) {
      setErrorMessage("필수 항목을 입력해 주세요.")
      return
    }

    // 프로필 이미지가 선택되었지만 업로드가 완료되지 않은 경우 (업로드 모드일 때만)
    if (imageSelectionMode === "upload" && profileImage && !profileImageUrl) {
      setErrorMessage("프로필 이미지 업로드를 완료해주세요.")
      return
    }

    setIsSubmitting(true)

    try {
      const birthDate = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idEmail,
          password,
          name,
          phone,
          birthDate,
          disabilityType: disabilityType || null,
          exercisePurposes: exercisePurposes.length > 0 ? exercisePurposes : null,
          profileImageUrl: profileImageUrl || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrorMessage(data.message || "회원가입 중 오류가 발생했습니다.")
        setIsSubmitting(false)
        return
      }

      // 회원가입 성공
      setShowSuccessModal(true)
      setIsSubmitting(false)
    } catch (error) {
      console.error('회원가입 오류:', error)
      setErrorMessage("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.")
      setIsSubmitting(false)
    }
  }

  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 py-12 pt-24">
      <div className="w-full max-w-xl space-y-8 bg-white p-8 rounded-2xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">회원가입</h2>
          <p className="mt-2 text-sm text-muted-foreground"> *은 필수 항목이므로 꼭 입력 해주세요.</p>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errorMessage}
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {/* ID/이메일 */}
          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <Input
                  placeholder="아이디 / 이메일 *"
                  className="pl-10"
                  value={idEmail}
                  onChange={handleIdEmailChange}
                  maxLength={50}
                  aria-label="아이디 또는 이메일 입력"
                />
              </div>
              <Button type="button" variant="outline" onClick={handleCheckId}>
                중복확인
              </Button>
            </div>
            {idMessage && (
              <p className={`text-xs ${idAvailable ? "text-green-600" : "text-red-600"}`}>
                {idMessage}
              </p>
            )}
          </div>

          {/* 비밀번호 */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <Input
              type="password"
              placeholder="비밀번호 *"
              className="pl-10"
              value={password}
              onChange={handlePasswordInput}
              maxLength={30}
              aria-label="비밀번호 입력"
            />
          </div>

          {/* 비밀번호 확인 */}
          <div className="relative flex flex-col gap-1">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <Input
              type="password"
              placeholder="비밀번호 확인 *"
              className="pl-10"
              value={passwordCheck}
              onChange={handlePasswordCheckInput}
              maxLength={30}
              aria-label="비밀번호 확인 입력"
            />
            {passwordMatchMessage && (
              <p className={`text-xs ml-0 ${passwordMatch ? "text-green-600" : "text-red-600"}`}>
                {passwordMatchMessage}
              </p>
            )}
          </div>

          {/* 이름 */}
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="이름 *"
              className="pl-10"
              value={name}
              onChange={handleNameChange}
              maxLength={30}
              aria-label="이름 입력"
            />
          </div>

          {/* 전화번호 */}
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="전화번호 (010-0000-0000) *"
              className="pl-10"
              value={phone}
              onChange={handlePhoneChange}
              maxLength={13}
              aria-label="전화번호 입력"
            />
          </div>

          {/* 생년월일 */}
          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Select value={birthYear} onValueChange={setBirthYear}>
                <SelectTrigger>
                  <SelectValue placeholder="년" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={birthMonth} onValueChange={setBirthMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="월" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m} value={m.toString()}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={birthDay} onValueChange={setBirthDay}>
                <SelectTrigger>
                  <SelectValue placeholder="일" />
                </SelectTrigger>
                <SelectContent>
                  {days.map((d) => (
                    <SelectItem key={d} value={d.toString()}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">생년월일 *</p>
          </div>

          {/* 프로필 사진 */}
          <div className="flex flex-col gap-2">
            <Label>프로필 사진 (선택사항)</Label>
            
            {/* 업로드/샘플 선택 모드 토글 */}
            <div className="flex gap-2 mb-2">
              <Button
                type="button"
                variant={imageSelectionMode === "upload" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setImageSelectionMode("upload")
                  setSelectedSampleImage("")
                  setProfileImageUrl("")
                  setProfileImage(null)
                  setProfileImagePreview("")
                }}
              >
                파일 업로드
              </Button>
              <Button
                type="button"
                variant={imageSelectionMode === "sample" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setImageSelectionMode("sample")
                  setProfileImage(null)
                  setProfileImagePreview("")
                  setProfileImageUrl("")
                }}
              >
                샘플 선택
              </Button>
            </div>

            {imageSelectionMode === "upload" ? (
              // 파일 업로드 UI
              <div className="flex items-center gap-4">
                {profileImagePreview ? (
                  <div className="relative">
                    <img 
                      src={profileImagePreview} 
                      alt="프로필 미리보기" 
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                    />
                    {isUploadingImage && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                        <span className="text-white text-xs">업로드 중...</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400" aria-hidden="true" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    disabled={isUploadingImage}
                    className="cursor-pointer"
                    aria-label="프로필 사진 선택"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    이미지 파일만 가능 (최대 5MB)
                  </p>
                </div>
              </div>
            ) : (
              // 샘플 이미지 선택 UI
              <div>
                <div className="grid grid-cols-3 gap-3">
                  {sampleImages.map((imageUrl) => (
                    <button
                      key={imageUrl}
                      type="button"
                      onClick={() => handleSampleImageSelect(imageUrl)}
                      className={`relative w-full aspect-square rounded-full overflow-hidden border-2 transition-all ${
                        selectedSampleImage === imageUrl
                          ? "border-purple-600 ring-2 ring-purple-300"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      aria-label={`프로필 샘플 이미지 선택: ${imageUrl}`}
                    >
                      <img
                        src={imageUrl}
                        alt="프로필 샘플"
                        className="w-full h-full object-cover"
                      />
                      {selectedSampleImage === imageUrl && (
                        <div className="absolute inset-0 flex items-center justify-center bg-purple-600 bg-opacity-30">
                          <Check className="w-6 h-6 text-white" aria-hidden="true" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                {selectedSampleImage && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    선택된 샘플 이미지
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="border-t my-6"></div>

          <h3 className="font-semibold text-sm">추가 사항</h3>

          {/* 장애 유형 선택 */}
          <Select value={disabilityType} onValueChange={setDisabilityType}>
            <SelectTrigger>
              <SelectValue placeholder="장애 유형 선택 (시각, 청각, 지체, 지적, 언어 등)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="visual">시각 장애</SelectItem>
              <SelectItem value="hearing">청각 장애</SelectItem>
              <SelectItem value="physical">지체 장애</SelectItem>
              <SelectItem value="intellectual">지적 장애</SelectItem>
              <SelectItem value="language">언어 장애</SelectItem>
              <SelectItem value="none">해당 없음</SelectItem>
            </SelectContent>
          </Select>

          {/* 운동 목적 (중복 선택 가능) */}
          <div className="space-y-2">
            <Label>운동 목적 (중복 선택 가능)</Label>
            <div className="grid grid-cols-2 gap-2">
              {["재활", "유산소", "근력", "재활 운동", "체중 감량", "스포츠 운동"].map((purpose) => (
                <div key={purpose} className="flex items-center space-x-2">
                  <Checkbox
                    id={purpose}
                    checked={exercisePurposes.includes(purpose)}
                    onCheckedChange={() => handlePurposeChange(purpose)}
                  />
                  <Label htmlFor={purpose} className="text-sm font-normal cursor-pointer">
                    {purpose}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-muted-foreground">또는</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" type="button">
              구글
            </Button>
            <Button variant="outline" type="button">
              페이스북
            </Button>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-700 text-lg font-semibold rounded-lg mt-6"
            disabled={isSubmitting}
          >
            {isSubmitting ? "처리 중..." : "회원가입"}
          </Button>
        </form>
      </div>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>회원가입 완료</DialogTitle>
            <DialogDescription>회원가입이 완료되었습니다!</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => {
              setShowSuccessModal(false)
              router.push("/signin")
            }}>확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}