"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useInView } from "framer-motion"

const steps = [
  {
    id: 1,
    title: "내 주변 시설 검색하기",
    subtitle: "Search",
    content: [
      "원하는 운동 종목이나 지역명을 검색창에 입력해 보세요.",
      "키워드 검색: \"강남구 수영장\", \"휠체어 농구\" 등 핵심 단어로 검색할 수 있습니다.",
      "지도 탐색: '지도 보기' 버튼을 누르면 현재 내 위치를 중심으로 주변 시설 핀(Pin)이 나타납니다.",
      "💡 팁: 검색창 옆의 [필터] 아이콘을 눌러보세요. '주차 가능', '승강기 보유', '샤워실 있음' 등 원하는 조건만 쏙쏙 골라볼 수 있습니다."
    ]
  },
  {
    id: 2,
    title: "접근성 정보 확인하기",
    subtitle: "Check Accessibility",
    content: [
      "시설 상세 페이지에서 '배리어 프리(Barrier-Free)' 정보를 가장 먼저 확인하세요.",
      "픽토그램: 휠체어 경사로, 장애인 화장실, 전용 주차구역 유무를 알기 쉬운 아이콘으로 표시했습니다.",
      "상세 체크리스트: 출입구의 너비가 충분한지, 점자 블록이 있는지 등 상세한 편의시설 현황을 제공합니다."
    ]
  },
  {
    id: 3,
    title: "스마트한 혼잡도 분석",
    subtitle: "Congestion Insights",
    content: [
      "방문하기 전에 '언제가 가장 쾌적할지' 미리 확인하세요.",
      "혼잡도 신호등: 현재 상태를 3가지 색상으로 알려드립니다.",
      "🟢 여유: 대기 없이 바로 이용 가능",
      "🟡 보통: 약간의 대기가 있을 수 있음",
      "🔴 혼잡: 이용객이 많아 이용이 어려울 수 있음",
      "시간대별 예측 그래프: 요일별, 시간대별 평균 방문자 데이터를 분석하여 붐비는 시간을 피할 수 있도록 도와드립니다."
    ]
  },
  {
    id: 4,
    title: "찜하기 & 마이페이지",
    subtitle: "My Sports",
    content: [
      "마음에 드는 시설을 발견하셨나요?",
      "찜하기: 하트(♥) 버튼을 누르면 나만의 즐겨찾기 목록에 저장됩니다.",
      "리뷰 남기기: 다녀온 시설의 후기를 남겨주세요. 특히 \"경사로가 완만해서 좋았어요\" 같은 생생한 접근성 후기는 다른 이용자에게 큰 힘이 됩니다."
    ]
  }
]

function StepSection({ step, index }: { step: typeof steps[0], index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const isEven = index % 2 === 1 // 0-based index이므로 1, 3이 짝수 번째 (Step 02, 04)

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className={`flex flex-col ${isEven ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 lg:gap-12 items-center py-12 lg:py-20`}
    >
      {/* 텍스트 영역 */}
      <div className="flex-1 space-y-6">
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="absolute -right-4 -bottom-4 text-[120px] lg:text-[180px] font-black text-purple-100/50 leading-none select-none z-0"
            aria-hidden="true"
          >
            {String(step.id).padStart(2, '0')}
          </motion.div>
          <h2 className="relative text-3xl lg:text-4xl font-bold text-slate-900 mb-2 z-10">
            STEP {String(step.id).padStart(2, '0')}. {step.title}
          </h2>
          <p className="relative text-lg lg:text-xl text-purple-600 font-semibold z-10">
            {step.subtitle}
          </p>
        </div>
        <ul className="relative space-y-3 text-slate-700 leading-relaxed z-10">
          {step.content.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-purple-500 mt-1">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 이미지 영역 */}
      <div className="flex-1 w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative w-full aspect-video bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl shadow-lg border-2 border-purple-200/50 flex items-center justify-center"
        >
          <p className="text-slate-500 font-medium text-lg">ScreenShot Area</p>
        </motion.div>
      </div>
    </motion.section>
  )
}

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Intro 섹션 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 lg:mb-24"
        >
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-slate-900">
            SportsAccess 100% 활용 가이드
          </h1>
          <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            "운동, 고민하지 말고 바로 시작하세요." SportsAccess를 통해 <br />내 몸에 딱 맞는 체육 시설을 찾는 가장 쉬운 방법을 안내해 드립니다.
          </p>
        </motion.div>

        {/* Step 섹션들 */}
        <div className="space-y-8 lg:space-y-0">
          {steps.map((step, index) => (
            <StepSection key={step.id} step={step} index={index} />
          ))}
        </div>
      </div>
    </div>
  )
}

