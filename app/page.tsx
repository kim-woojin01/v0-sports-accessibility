"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Search, Users, Info, Star, Phone, Clock } from "lucide-react"
import { PartnerLogoSlider } from "@/components/partner-logo-slider"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { useRef, useState, useEffect } from "react"

// 애니메이션 variants
const fadeInUp = {
  hidden: { 
    opacity: 0, 
    y: 60 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] // 부드러운 easing (애플 스타일)
    }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
}

// 스크롤 방향에 따른 카드 애니메이션 variants
const createCardVariants = (scrollDirection: 'down' | 'up') => ({
  hidden: { 
    opacity: 0, 
    y: scrollDirection === 'down' ? -40 : 40 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94] // 더 부드러운 easing
    }
  }
})

// 패럴랙스 이미지 컴포넌트 (개선된 버전)
function ParallaxImage({ 
  src, 
  alt, 
  className, 
  speed = 0.5,
  springConfig = { stiffness: 50, damping: 20, mass: 1 }
}: { 
  src: string
  alt: string
  className?: string
  speed?: number
  springConfig?: { stiffness: number; damping: number; mass: number }
}) {
  const ref = useRef<HTMLDivElement>(null)
  
  // 요소가 뷰포트에 들어올 때부터 나갈 때까지 추적
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  // 스프링을 사용한 부드러운 변환 (물리적 무게감과 지연 효과)
  const smoothProgress = useSpring(scrollYProgress, springConfig)
  
  // 패럴랙스 효과: 스크롤보다 느리게 움직임 (더 강한 효과)
  const y = useTransform(smoothProgress, [0, 1], [50 * speed, -150 * speed])
  
  // 스케일 효과도 추가 (깊이감)
  const scale = useTransform(smoothProgress, [0, 0.5, 1], [0.95, 1, 0.95])

  return (
    <motion.div
      ref={ref}
      style={{ y, scale }}
      className={className}
    >
      <Image src={src} alt={alt} fill className="object-cover" />
    </motion.div>
  )
}

export default function Home() {
  // 스크롤 방향 감지
  const [scrollDirection, setScrollDirection] = useState<'down' | 'up'>('down')
  const lastScrollY = useRef(0)
  
  // 스크롤 방향 감지 useEffect
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY.current) {
        setScrollDirection('down')
      } else if (currentScrollY < lastScrollY.current) {
        setScrollDirection('up')
      }
      lastScrollY.current = currentScrollY
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  // 전체 페이지 스크롤 추적
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // Hero 섹션용 스크롤 추적
  const heroSectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroSectionRef,
    offset: ["start end", "end start"]
  })
  
  const heroCardY = useTransform(
    useSpring(heroScrollProgress, { stiffness: 50, damping: 20, mass: 1 }),
    [0, 1],
    [60, -80]
  )

  // 서비스 카드 섹션용 스크롤 추적
  const cardsSectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress: cardsScrollProgress } = useScroll({
    target: cardsSectionRef,
    offset: ["start end", "end start"]
  })
  
  const card1Y = useTransform(
    useSpring(cardsScrollProgress, { stiffness: 50, damping: 20, mass: 1 }),
    [0, 1],
    [40, -60]
  )
  
  const card2Y = useTransform(
    useSpring(cardsScrollProgress, { stiffness: 50, damping: 20, mass: 1 }),
    [0, 1],
    [60, -40]
  )
  
  const card3Y = useTransform(
    useSpring(cardsScrollProgress, { stiffness: 50, damping: 20, mass: 1 }),
    [0, 1],
    [50, -50]
  )
  
  const card4Y = useTransform(
    useSpring(cardsScrollProgress, { stiffness: 50, damping: 20, mass: 1 }),
    [0, 1],
    [70, -30]
  )

  // Map 섹션용 스크롤 추적
  const mapSectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress: mapScrollProgress } = useScroll({
    target: mapSectionRef,
    offset: ["start end", "end start"]
  })
  
  const mapY = useTransform(
    useSpring(mapScrollProgress, { stiffness: 50, damping: 20, mass: 1 }),
    [0, 1],
    [80, -120]
  )
  
  const mapTextY = useTransform(
    useSpring(mapScrollProgress, { stiffness: 50, damping: 20, mass: 1 }),
    [0, 1],
    [40, -40]
  )

  // CTA 섹션용 스크롤 추적
  const ctaSectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress: ctaScrollProgress } = useScroll({
    target: ctaSectionRef,
    offset: ["start end", "end start"]
  })
  
  const ctaTextY = useTransform(
    useSpring(ctaScrollProgress, { stiffness: 50, damping: 20, mass: 1 }),
    [0, 1],
    [50, -50]
  )
  
  const ctaImage1Y = useTransform(
    useSpring(ctaScrollProgress, { stiffness: 50, damping: 20, mass: 1 }),
    [0, 1],
    [60, -100]
  )
  
  const ctaImage2Y = useTransform(
    useSpring(ctaScrollProgress, { stiffness: 50, damping: 20, mass: 1 }),
    [0, 1],
    [100, -80]
  )

  return (
    <div ref={containerRef} className="flex flex-col min-h-screen w-full">
      {/* Hero Section */}
      <section ref={heroSectionRef} className="pt-16 md:pt-24 pb-16 md:pb-24 bg-gradient-to-b from-white to-pink-50/50 w-full">
        {/* 서비스 소개 섹션 */}
        <div className="container px-4 max-w-screen-2xl mx-auto">
          <motion.div 
            className="relative py-16 md:py-20 bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 text-white rounded-2xl overflow-hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            style={{ y: heroCardY }}
          >
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="container relative z-10 text-center max-w-4xl mx-auto px-4">
              <motion.h2 
                className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 leading-tight"
                variants={fadeInUp}
              >
                SportsAccess 서비스 소개
              </motion.h2>
              <motion.p 
                className="text-lg md:text-xl font-medium mb-4 md:mb-6 leading-relaxed"
                variants={fadeInUp}
              >
                "누구나, 언제든, 편안하게 땀 흘릴 권리가 있습니다."
              </motion.p>
              <motion.p 
                className="text-base md:text-lg leading-relaxed max-w-3xl mx-auto mb-4"
                variants={fadeInUp}
              >
                SportsAccess는 장벽 없는 스포츠 환경을 만들어갑니다.
              </motion.p>
              <motion.p 
                className="text-sm md:text-base leading-relaxed max-w-3xl mx-auto opacity-90"
                variants={fadeInUp}
              >
                우리는 건강을 위해 운동을 하려 할 때, 종종 보이지 않는 장벽에 부딪힙니다.
                <br className="hidden md:block" />
                "휠체어로 들어갈 수 있을까?", "지금 사람이 너무 많아서 위험하진 않을까?"
                <br className="hidden md:block" />
                SportsAccess는 이러한 정보의 비대칭을 해결하기 위해 시작되었습니다.
                <br className="hidden md:block" />
                <br />
                신체적 조건이나 환경에 구애받지 않고 누구나 자신에게 맞는 체육 시설을 찾을 수 있도록 돕는 것,
                <br className="hidden md:block" />
                그것이 우리가 기술로 풀고자 하는 문제입니다.
              </motion.p>
            </div>
          </motion.div>
        </div>

        {/* Service Cards - 모바일 1열, 태블릿 2열, 데스크톱 가로 스크롤 */}
        <div ref={cardsSectionRef} className="container mt-8 md:mt-16 px-4 pt-8 md:pt-12 pb-8 md:pb-12 max-w-screen-2xl mx-auto">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:gap-8 lg:overflow-x-auto lg:pt-4 lg:pb-12 lg:min-w-max lg:justify-center gap-6 md:gap-8 lg:scrollbar-hide"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            variants={staggerContainer}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* Card 1 */}
            <motion.div 
              className="w-full lg:w-80 h-auto lg:h-80 bg-white p-6 md:p-8 rounded-2xl shadow-sm border hover:shadow-md transition-shadow flex flex-col justify-between"
              variants={createCardVariants(scrollDirection)}
              style={{ y: card1Y }}
            >
              <div>
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center mb-4 md:mb-6 text-pink-600">
                  <Search className="w-6 h-6 md:w-7 md:h-7" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-lg md:text-xl mb-3 md:mb-4">체육시설 검색 서비스</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  지역, 시설명 등을 입력하면 장애인 편의시설 정보 (경사로, 주차장, 화장실)까지 여러 조건을 어렵지 않게 한 번에 확인할 수 있습니다.
                  <br />
                  <br />
                  이러한 편의시설 필터 기능을 통해
                  <br />
                  나에게 맞는 시설을 빠르게 찾아보세요!
                </p>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div 
              className="w-full lg:w-80 h-auto lg:h-80 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-pink-200 hover:shadow-md transition-shadow flex flex-col justify-between lg:mt-12"
              variants={createCardVariants(scrollDirection)}
              style={{ y: card2Y }}
            >
              <div>
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center mb-4 md:mb-6 text-purple-600">
                  <div className="w-6 h-6 md:w-7 md:h-7 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs">
                    ★
                  </div>
                </div>
                <h3 className="font-bold text-lg md:text-xl mb-3 md:mb-4">접근성 평가 & 점수 제공</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  시설별 장애인 편의시설 여부, 길턱, 이동 동선 등 접근성 요소를 분석해 종합 점수와 리뷰를 제공합니다.
                  <br />
                  <br />
                  객관적인 데이터를 기반으로 더 쉬운 시설 선택을 도와드리겠습니다!
                </p>
              </div>
            </motion.div>

            {/* Card 3 */}
            <motion.div 
              className="w-full lg:w-80 h-auto lg:h-80 bg-white p-6 md:p-8 rounded-2xl shadow-sm border hover:shadow-md transition-shadow flex flex-col justify-between"
              variants={createCardVariants(scrollDirection)}
              style={{ y: card3Y }}
            >
              <div>
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mb-4 md:mb-6 text-blue-600">
                  <Users className="w-6 h-6 md:w-7 md:h-7" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-lg md:text-xl mb-3 md:mb-4">혼잡도 분석 서비스</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  공공데이터 기반으로 시간대·요일별 과거의 혼잡도 데이터를 적용시켜 분석합니다.
                  <br />
                  <br />
                  실시간 혼잡도를 반영한 여유 / 보통 / 혼잡 상태를 색상으로 시각화해 쾌적한 시설 이용에 도움을 드리겠습니다!
                </p>
              </div>
            </motion.div>

            {/* Card 4 */}
            <motion.div 
              className="w-full lg:w-80 h-auto lg:h-80 bg-white p-6 md:p-8 rounded-2xl shadow-sm border hover:shadow-md transition-shadow flex flex-col justify-between lg:mt-12"
              variants={createCardVariants(scrollDirection)}
              style={{ y: card4Y }}
            >
              <div>
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mb-4 md:mb-6 text-purple-800">
                  <Info className="w-6 h-6 md:w-7 md:h-7" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-lg md:text-xl mb-3 md:mb-4">시설 상세 정보 제공</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  운영 시간, 이용 요금, 시설 규모 등 이용에 필요한 모든 정보를 한 화면에 제공합니다.
                  <br />
                  <br />
                  장애인 편의시설, 공공 편의시설 체크리스트도 함께 모두 다 제공합니다.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Map Feature Section */}
      <section ref={mapSectionRef} className="py-12 md:py-20 bg-white w-full">
        <div className="container flex flex-col lg:flex-row items-center gap-8 md:gap-12 px-4 max-w-screen-2xl mx-auto">
          <motion.div 
            className="flex-1 relative h-[300px] md:h-[400px] w-full rounded-2xl overflow-hidden shadow-lg bg-slate-100 order-2 lg:order-1"
            style={{ y: mapY }}
          >
            <Image src="/homepage_map.png" alt="체육 시설 지도 화면 - 주변 체육 시설 위치를 지도로 표시" fill className="object-cover" />
          </motion.div>
          <motion.div 
            className="flex-1 space-y-4 md:space-y-6 order-1 lg:order-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            style={{ y: mapTextY }}
          >
            <motion.h2 
              className="text-2xl md:text-3xl font-bold leading-tight"
              variants={fadeInUp}
            >
              접근성 정보, 장애인 편의시설 여부,
              <br />
              시간대별 혼잡도를 한눈에 확인!
            </motion.h2>
            <motion.div 
              className="w-full h-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full max-w-[430px]"
              variants={fadeInUp}
            ></motion.div>
            <motion.p 
              className="text-muted-foreground text-base md:text-lg"
              variants={fadeInUp}
            >
              지도 위에서 내 주변 체육시설을 직관적으로 확인하세요.              
              <br />
              현재 위치를 기반으로 가장 가까운 접근성 높은 시설을 추천해드립니다.
            </motion.p>

            {/* Example Card */}
            <motion.div 
              className="bg-white p-4 rounded-xl border shadow-lg max-w-md mt-6 md:mt-8"
              variants={fadeInUp}
            >
              <div className="flex gap-4">
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <Image src="/modern-gym-interior.png" alt="호암체육관 내부 전경" fill className="object-cover" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-bold text-sm md:text-base">호암체육관</h4>
                  <p className="text-xs text-muted-foreground">충북 충주시 중원대로 3306 호암체육관</p>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-3 h-3 md:w-4 md:h-4 fill-current" aria-hidden="true" />
                    <span className="font-bold text-xs md:text-sm">5.0</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" aria-hidden="true" />
                      <span>043-830-9225</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" aria-hidden="true" />
                      <span>영업시간</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="text-xs font-medium">혼잡</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaSectionRef} className="py-12 md:py-20 bg-slate-50 w-full">
        <div className="container flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12 px-4 max-w-screen-2xl mx-auto">
          <motion.div 
            className="flex-1 space-y-4 md:space-y-6 lg:pl-12 xl:pl-20 order-2 lg:order-1"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            style={{ y: ctaTextY }}
          >
            <motion.h2 
              className="text-3xl md:text-4xl font-bold"
              variants={fadeInUp}
            >
              지금 바로 체육 시설을
              <br />
              검색해보세요!
            </motion.h2>
            <motion.div 
              className="w-full h-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full max-w-[325px]"
              variants={fadeInUp}
            ></motion.div>
            <motion.p 
              className="text-muted-foreground text-sm md:text-base"
              variants={fadeInUp}
            >
              지역·접근성·혼잡도 정보를 바탕으로 나에게 꼭 맞는
              <br />
              체육시설을 찾아보세요.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <Link href="/search?highlight=search">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6 md:px-8 mt-4 w-full md:w-auto">
                  시설 검색하기
                </Button>
              </Link>
            </motion.div>
          </motion.div>
          <motion.div 
            className="flex-1 flex flex-col md:flex-row justify-center gap-4 md:gap-8 order-1 lg:order-2 w-full"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.div 
              className="relative w-full md:w-64 h-48 md:h-64 mx-auto md:mx-0"
              style={{ y: ctaImage1Y }}
            >
              <Image src="/image1.png" alt="체육 시설 혼잡도 분석 차트 - 시간대별 이용 현황을 시각화한 그래프" fill className="object-contain" />
            </motion.div>
            <motion.div 
              className="relative w-full md:w-64 h-60 md:h-80 mx-auto md:mx-0 md:mt-12"
              style={{ y: ctaImage2Y }}
            >
              <Image src="/image2.png" alt="SportsAccess 모바일 앱 화면 - 스마트폰에서 체육 시설 정보를 확인하는 모습" fill className="object-contain" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Partner Logo Slider - 홈 화면에만 표시 */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <PartnerLogoSlider />
      </motion.div>
    </div>
  )
}

// 베포 커밋용 최종
