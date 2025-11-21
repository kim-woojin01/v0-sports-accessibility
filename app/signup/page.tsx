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

export default function SignUpPage() {
  const router = useRouter()
  const [id, setId] = useState("")
  const [isIdChecked, setIsIdChecked] = useState(false)
  const [idMessage, setIdMessage] = useState("")
  const [idAvailable, setIdAvailable] = useState(false)

  const [phone, setPhone] = useState("")
  const [birthYear, setBirthYear] = useState("")
  const [birthMonth, setBirthMonth] = useState("")
  const [birthDay, setBirthDay] = useState("")

  const [exercisePurposes, setExercisePurposes] = useState<string[]>([])
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // Mock existing IDs
  const existingIds = ["testuser", "admin", "user123"]

  const handleCheckId = () => {
    if (!id) {
      setIdMessage("아이디를 입력해주세요.")
      setIdAvailable(false)
      return
    }
    if (existingIds.includes(id)) {
      setIdMessage("중복 아이디입니다.")
      setIdAvailable(false)
    } else {
      setIdMessage("사용 가능한 아이디입니다!")
      setIdAvailable(true)
    }
    setIsIdChecked(true)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "")
    if (value.length <= 11) {
      setPhone(value.replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, `$1-$2-$3`))
    }
  }

  const handlePurposeChange = (value: string) => {
    setExercisePurposes((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isIdChecked || !idAvailable) {
      alert("아이디 중복 확인을 해주세요.")
      return
    }
    setShowSuccessModal(true)
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

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {/* Required Fields */}
          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="ID / email *"
                  className="pl-10"
                  required
                  value={id}
                  onChange={(e) => {
                    setId(e.target.value)
                    setIsIdChecked(false)
                    setIdMessage("")
                  }}
                />
              </div>
              <Button type="button" variant="outline" onClick={handleCheckId}>
                중복확인
              </Button>
            </div>
            {idMessage && <p className={`text-xs ${idAvailable ? "text-green-600" : "text-red-600"}`}>{idMessage}</p>}
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input type="password" placeholder="Password *" className="pl-10" required />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input type="password" placeholder="password check *" className="pl-10" required />
          </div>

          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input placeholder="이름 *" className="pl-10" required />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="전화번호 (010-0000-0000) *"
              className="pl-10"
              required
              value={phone}
              onChange={handlePhoneChange}
            />
          </div>

          <div className="flex gap-2">
            <div className="relative w-full">
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-muted-foreground z-10" />
              <div className="flex gap-2 pl-10">
                <Select value={birthYear} onValueChange={setBirthYear} required>
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
                <Select value={birthMonth} onValueChange={setBirthMonth} required>
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
                <Select value={birthDay} onValueChange={setBirthDay} required>
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
                  <p className="mt-2 text-sm text-muted-foreground"> 생년월일 *</p>

                </Select>
              </div>
            </div>
          </div>

          <div className="border-t my-6"></div>

          <h3 className="font-semibold text-sm">추가 사항</h3>

          {/* Optional Fields for Recommendation */}
          <Select>
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
          >
            Sign up
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
            <Button onClick={() => router.push("/signin")}>확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
