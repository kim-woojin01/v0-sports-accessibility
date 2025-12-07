"use client"

import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  message?: string
  className?: string
}

export default function LoadingSpinner({ message = "정보를 불러오는 중입니다...", className = "" }: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[400px] space-y-4 ${className}`}>
      <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
      <p className="text-muted-foreground text-lg">{message}</p>
    </div>
  )
}





