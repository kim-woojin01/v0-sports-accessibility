"use client";

import Lottie from "lottie-react";
import loadingData from "@/public/animations/loading.json";

export default function LottieLoader() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4">
      {/* 애니메이션 크기는 부모 div나 스타일로 조절 가능합니다 */}
      <div className="w-48 h-48">
        <Lottie 
          animationData={loadingData} 
          loop={true} 
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      <p className="mt-4 text-slate-500 font-medium animate-pulse">
        데이터를 불러오고 있습니다...
      </p>
    </div>
  );
}