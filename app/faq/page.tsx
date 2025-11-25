"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

const FAQ_DATA = [
  {
    id: 1,
    question: "SportsAccess는 어떤 서비스인가요?",
    answer: "SportsAccess는 누구나 신체적 조건에 구애받지 않고 운동을 즐길 수 있도록 돕는 '배리어 프리(Barrier-Free)' 스포츠 시설 정보 플랫폼입니다. 내 주변의 체육 시설 위치뿐만 아니라 휠체어 접근 가능 여부, 장애인 화장실 유무 등 상세한 접근성 정보를 제공하며, 공공데이터를 기반으로 한 혼잡도 분석 서비스를 통해 가장 쾌적한 운동 시간을 추천해 드립니다."
  },
  {
    id: 2,
    question: "접근성 정보(장애인 편의시설)는 믿을 수 있나요?",
    answer: "네, 제공되는 접근성 정보는 국민체육진흥공단 및 공공데이터포털의 공식 API를 기반으로 하며, '장애물 없는 생활환경(BF)' 인증 여부 등을 반영하고 있습니다. 다만, 시설의 개보수나 현장 상황에 따라 실제 정보와 다소 차이가 있을 수 있으므로, 방문 전 해당 시설에 전화로 확인하는 것을 권장해 드립니다."
  },
  {
    id: 3,
    question: "혼잡도 정보는 어떻게 계산되나요?",
    answer: "혼잡도 정보는 해당 시설의 과거 시간대별/요일별 이용객 데이터와 실시간 데이터를 종합적으로 분석하여 산출됩니다. 이를 통해 '여유', '보통', '혼잡' 3단계로 상태를 표시합니다. 단, 날씨나 행사 등 변수에 따라 실제 상황과 다를 수 있으니 참고용으로 활용해 주시기 바랍니다."
  },
  {
    id: 4,
    question: "시설 예약이나 결제도 가능한가요?",
    answer: "현재 버전에서는 시설 정보 검색 및 혼잡도 조회 기능만 제공하고 있습니다. 예약 및 결제 기능은 추후 업데이트를 통해 제공될 예정이며, 현재는 각 시설의 상세 페이지에 안내된 전화번호나 홈페이지 링크를 통해 직접 예약하셔야 합니다."
  },
  {
    id: 5,
    question: "제가 찾는 체육관이 검색되지 않아요.",
    answer: "SportsAccess는 공공 체육 시설 데이터를 우선적으로 제공하고 있어, 일부 사설 체육관이나 신규 오픈한 시설은 검색되지 않을 수 있습니다. 찾으시는 시설이 공공 체육 시설임에도 검색되지 않는다면, '고객 지원 > 시설 정보 수정 요청'을 통해 제보해 주시면 빠르게 업데이트하겠습니다."
  },
  {
    id: 6,
    question: "회원가입을 해야만 이용할 수 있나요?",
    answer: "아니요, 시설 검색 및 상세 정보 조회는 로그인 없이도 자유롭게 이용하실 수 있습니다. 단, 자주 가는 시설을 '찜'하거나 리뷰 작성 기능을 이용하시려면 회원가입이 필요합니다."
  },
  {
    id: 7,
    question: "위치 정보를 꼭 켜야 하나요?",
    answer: "'내 주변 시설 찾기' 및 '길 찾기' 기능을 이용하기 위해서는 위치 정보 제공 동의가 필요합니다. 위치 정보를 켜지 않으셔도 지역명 검색이나 지도 이동을 통해 시설을 찾아보실 수 있습니다. 사용자의 위치 정보는 검색 목적으로만 일시적으로 사용되며 절대 서버에 저장되지 않습니다."
  },
  {
    id: 8,
    question: "휠체어 대여가 가능한 시설만 따로 볼 수 있나요?",
    answer: "네, 검색 필터에서 '장애인 편의시설' 옵션을 선택하시면 휠체어 대여 가능 여부, 장애인 전용 주차장, 승강기 유무 등 원하는 조건에 맞는 시설만 모아서 보실 수 있습니다."
  },
  {
    id: 9,
    question: "잘못된 시설 정보가 있어요. 어떻게 수정하나요?",
    answer: "시설의 폐업, 운영 시간 변경, 편의시설 정보 오류 등을 발견하셨다면 '고객 지원 > 시설 정보 수정 요청'을 이용해 주세요. 검토 후 신속하게 데이터를 수정하여 더 정확한 서비스를 만들겠습니다."
  },
  {
    id: 10,
    question: "모바일 앱은 없나요?",
    answer: "현재는 웹사이트(Web) 형태로 서비스를 제공하고 있습니다. 하지만 스마트폰이나 태블릿의 브라우저로 접속하셔도 앱처럼 편리하게 이용하실 수 있습니다. 추후 정식 모바일 앱 출시도 계획하고 있습니다."
  },
  {
    id: 11,
    question: "시설 운영자입니다. 저희 체육관을 등록할 수 있나요?",
    answer: "현재 SportsAccess는 공공데이터를 기반으로 운영되지만, 민간 체육 시설의 등록도 환영합니다. '고객 지원 > 제휴 및 입점 문의'를 통해 시설 정보와 사업자 등록증을 보내주시면, 검토 후 등록 절차를 안내해 드립니다."
  },
  {
    id: 12,
    question: "시설 이용 후기나 별점을 남길 수 있나요?",
    answer: "네, 로그인을 하시면 다녀오신 시설에 대해 별점과 후기를 남기실 수 있습니다. 특히 장애인 편의시설에 대한 생생한 후기는 다른 이용자들에게 큰 도움이 되니 많은 참여 부탁드립니다."
  },
  {
    id: 13,
    question: "아이디나 비밀번호를 잊어버렸어요.",
    answer: "로그인 화면 하단의 '아이디/비밀번호 찾기'를 클릭해 주세요. 가입 시 입력한 이메일 주소로 인증을 진행하시면 아이디 확인 및 비밀번호 재설정이 가능합니다."
  },
  {
    id: 14,
    question: "안내견(보조견) 동반 입장이 가능한가요?",
    answer: "「장애인복지법」에 따라 공공 체육 시설은 안내견의 출입을 정당한 사유 없이 거부할 수 없습니다. 다만, 사설 체육관이나 특정 구역(수영장 물 내부 등)은 제한될 수 있으므로, 방문 전 시설 상세 페이지의 전화번호로 확인하시는 것을 권장합니다."
  },
  {
    id: 15,
    question: "자주 가는 시설을 따로 저장해두고 싶어요.",
    answer: "시설 상세 화면이나 지도 상에서 '하트(찜하기)' 아이콘을 누르시면 '마이페이지 > 찜한 시설' 목록에 저장됩니다. 이 기능은 회원가입 후 로그인 상태에서만 이용 가능합니다."
  },
  {
    id: 16,
    question: "장애인 주차 구역 요금 할인 정보가 있나요?",
    answer: "시설 상세 정보의 '주차 안내' 란에서 주차장 유무와 장애인 전용 주차 구역 수를 확인하실 수 있습니다. 공영 주차장의 경우 보통 50% 이상 할인이 적용되나, 사설 주차장은 규정이 다를 수 있으니 현장 확인이 필요합니다."
  }
]

// 물방울 위치를 랜덤하게 생성하는 함수
const generateBubblePositions = (count: number) => {
  const positions = []
  for (let i = 0; i < count; i++) {
    positions.push({
      x: Math.random() * 80 + 10, // 10% ~ 90%
      y: Math.random() * 70 + 15, // 15% ~ 85%
      size: Math.random() * 40 + 80, // 80px ~ 120px
      delay: Math.random() * 2, // 0 ~ 2초
    })
  }
  return positions
}

export default function FAQPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const bubblePositions = generateBubblePositions(FAQ_DATA.length)

  return (
    <div className="min-h-screen relative overflow-hidden pt-24 pb-12 px-4">
      {/* 보라색 그라데이션 배경 */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-purple-100 to-pink-100 -z-10" />
      
      {/* 제목 */}
      <div className="text-center mb-12 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
          자주 묻는 질문
        </h1>
        <p className="text-lg text-muted-foreground">
          SportsAccess에 대해 궁금하신 점을 확인해보세요
        </p>
      </div>

      {/* 물방울 컨테이너 */}
      <div className="relative max-w-7xl mx-auto min-h-[600px]">
        <AnimatePresence mode="wait">
          {selectedId === null ? (
            // 물방울 그리드 뷰
            <motion.div
              key="bubbles"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
            >
              {FAQ_DATA.map((faq, index) => {
                const position = bubblePositions[index]
                return (
                  <motion.div
                    key={faq.id}
                    layoutId={`faq-${faq.id}`}
                    className="relative cursor-pointer"
                    onClick={() => setSelectedId(faq.id)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: [0, -10, 0],
                    }}
                    transition={{
                      y: {
                        duration: 3,
                        repeat: Infinity,
                        delay: position.delay,
                        ease: "easeInOut",
                      },
                      layout: { duration: 0.5, ease: "easeInOut" },
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-shadow p-6 md:p-8 flex items-center justify-center min-h-[120px] md:min-h-[140px] border-2 border-purple-200/50">
                      <p className="text-sm md:text-base font-semibold text-center text-slate-800 leading-tight">
                        {faq.question}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          ) : (
            // 확장된 카드 뷰
            <motion.div
              key={`expanded-${selectedId}`}
              layoutId={`faq-${selectedId}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto"
            >
              <motion.div
                className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-10 border-2 border-purple-200/50"
                layout
              >
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 pr-4">
                    {FAQ_DATA.find((faq) => faq.id === selectedId)?.question}
                  </h2>
                  <motion.button
                    onClick={() => setSelectedId(null)}
                    className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700 flex items-center justify-center transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="닫기"
                  >
                    <X className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
                  </motion.button>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-base md:text-lg text-slate-700 leading-relaxed whitespace-pre-line"
                >
                  <p className="mb-4">
                    <strong className="text-purple-700">A:</strong>{" "}
                    {FAQ_DATA.find((faq) => faq.id === selectedId)?.answer}
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 뒤로 가기 힌트 (확장된 상태일 때) */}
      {selectedId !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-muted-foreground">
            다른 질문을 보시려면 닫기 버튼을 눌러주세요
          </p>
        </motion.div>
      )}
    </div>
  )
}

