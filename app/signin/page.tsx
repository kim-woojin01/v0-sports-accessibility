"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Lock } from "lucide-react"

export default function SignInPage() {
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock login
    localStorage.setItem("user", "true")
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 py-12">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Sign In</h2>
          <p className="mt-2 text-sm text-muted-foreground">Welcome back! Please enter your details.</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input type="text" placeholder="ID / email" className="pl-10 h-12" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input type="password" placeholder="Password" className="pl-10 h-12" required />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-700 text-lg font-semibold rounded-lg"
          >
            Sign In
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
