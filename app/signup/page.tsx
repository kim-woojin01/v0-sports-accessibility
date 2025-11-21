"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Lock, User, Phone, Calendar } from "lucide-react"

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 py-12">
      <div className="w-full max-w-xl space-y-8 bg-white p-8 rounded-2xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Sign up</h2>
          <p className="mt-2 text-sm text-muted-foreground">아이디 형식 어쩌구 안내 문구, * 필수 항목</p>
        </div>

        <form className="mt-8 space-y-4">
          {/* Required Fields */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input placeholder="ID / email *" className="pl-10" required />
            </div>
            <Button type="button" variant="outline">
              중복확인
            </Button>
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
            <Input placeholder="전화번호 *" className="pl-10" required />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input placeholder="생년월일 *" className="pl-10" required />
          </div>

          <div className="border-t my-6"></div>

          <h3 className="font-semibold text-sm">추가 사항</h3>

          {/* Optional Fields for Recommendation */}
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="장애 유형 선택 (시각, 청각, 지체, 지적 등)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="visual">시각 장애</SelectItem>
              <SelectItem value="hearing">청각 장애</SelectItem>
              <SelectItem value="physical">지체 장애</SelectItem>
              <SelectItem value="intellectual">지적 장애</SelectItem>
              <SelectItem value="none">해당 없음</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger>
              <SelectValue placeholder="운동 목적 (재활, 유산소, 근력, 수중 운동 등)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rehab">재활</SelectItem>
              <SelectItem value="cardio">유산소</SelectItem>
              <SelectItem value="strength">근력</SelectItem>
              <SelectItem value="water">수중 운동</SelectItem>
            </SelectContent>
          </Select>

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
    </div>
  )
}
