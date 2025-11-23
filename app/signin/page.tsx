"use client"

import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Lock } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SignInPage() {
  const router = useRouter()
  const [idEmail, setIdEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idEmail, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrorMessage(data.message || '로그인에 실패했습니다.')
        setIsLoading(false)
        return
      }

      // 로그인 성공 - 사용자 정보 저장
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('userName', data.user.name || '')
        localStorage.setItem('userId', data.user.id?.toString() || '')
        
        // 계정이 복구된 경우 메시지 표시
        if (data.isAccountRestored) {
          alert("계정이 복구 되었습니다. 계정 삭제를 원하시면 '계정삭제'를 다시 진행해주세요.")
        }
        
        // 페이지 새로고침하여 헤더 업데이트
        window.location.href = '/'
      } else {
        setErrorMessage('로그인 정보를 받아오지 못했습니다.')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('로그인 오류:', error)
      setErrorMessage('로그인 중 오류가 발생했습니다.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 py-12">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Sign In</h2>
          <p className="mt-2 text-sm text-muted-foreground">Welcome back! Please enter your details.</p>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errorMessage}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="ID / email"
                className="pl-10 h-12"
                required
                value={idEmail}
                onChange={(e) => setIdEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password"
                className="pl-10 h-12"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-700 text-lg font-semibold rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : 'Sign In'}
          </Button>

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Forgot password?
            </Link>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" type="button" className="h-12 bg-transparent">
              <span className="mr-2">G</span> Google
            </Button>
            <Button variant="outline" type="button" className="h-12 bg-transparent">
              <span className="mr-2">f</span> Facebook
            </Button>
          </div>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Don't have an account? </span>
          <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}