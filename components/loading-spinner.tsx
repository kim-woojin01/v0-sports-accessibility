"use client"

import Lottie from "lottie-react"
import loadingData from "@/public/animations/loading.json"

interface LoadingSpinnerProps {
  message?: string
  className?: string
}

export default function LoadingSpinner({ message = "정보를 불러오는 중입니다...", className = "" }: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[400px] space-y-4 ${className}`}>
      <div className="w-48 h-48">
        <Lottie 
          animationData={loadingData} 
          loop={true} 
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      <p className="text-muted-foreground text-lg animate-pulse">{message}</p>
    </div>
  )
}








