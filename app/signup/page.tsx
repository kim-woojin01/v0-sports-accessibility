"use client"
import { Button } from "@/components/ui/button"
import type React from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Lock, User, Phone, Calendar } from "lucide-react"
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
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Sign up</h2>
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
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="ID / email *"
                  className="pl-10"
                  value={idEmail}
                  onChange={handleIdEmailChange}
                  maxLength={50}
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
            <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Password *"
              className="pl-10"
              value={password}
              onChange={handlePasswordInput}
              maxLength={30}
            />
          </div>

          {/* 비밀번호 확인 */}
          <div className="relative flex flex-col gap-1">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="password"
              placeholder="password check *"
              className="pl-10"
              value={passwordCheck}
              onChange={handlePasswordCheckInput}
              maxLength={30}
            />
            {passwordMatchMessage && (
              <p className={`text-xs ml-0 ${passwordMatch ? "text-green-600" : "text-red-600"}`}>
                {passwordMatchMessage}
              </p>
            )}
          </div>

          {/* 이름 */}
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="이름 *"
              className="pl-10"
              value={name}
              onChange={handleNameChange}
              maxLength={30}
            />
          </div>

          {/* 전화번호 */}
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="전화번호 (010-0000-0000) *"
              className="pl-10"
              value={phone}
              onChange={handlePhoneChange}
              maxLength={13}
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
              <span className="bg-white px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" type="button">
              Google
            </Button>
            <Button variant="outline" type="button">
              Facebook
            </Button>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-700 text-lg font-semibold rounded-lg mt-6"
            disabled={isSubmitting}
          >
            {isSubmitting ? "처리 중..." : "Sign up"}
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