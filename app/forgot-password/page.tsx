"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, ArrowLeft } from "lucide-react"
import { useState } from "react"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1)

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2)
  }

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault()
    alert("비밀번호가 재설정되었습니다.")
    window.location.href = "/signin"
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 py-12">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">비밀번호 찾기</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {step === 1 ? "가입하신 이메일로 인증 코드를 보내드립니다." : "새로운 비밀번호를 설정해주세요."}
          </p>
        </div>

        {step === 1 ? (
          <form className="mt-8 space-y-6" onSubmit={handleSendCode}>
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input type="email" placeholder="Email Address" className="pl-10 h-12" required />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-700 text-lg font-semibold rounded-lg"
            >
              인증 코드 보내기
            </Button>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div className="space-y-4">
              <Input type="text" placeholder="인증 코드 6자리" className="h-12 text-center tracking-widest" required />
              <Input type="password" placeholder="새 비밀번호" className="h-12" required />
              <Input type="password" placeholder="새 비밀번호 확인" className="h-12" required />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-700 text-lg font-semibold rounded-lg"
            >
              비밀번호 재설정
            </Button>
          </form>
        )}

        <div className="text-center mt-4">
          <Link
            href="/signin"
            className="flex items-center justify-center text-sm font-medium text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> 로그인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}
