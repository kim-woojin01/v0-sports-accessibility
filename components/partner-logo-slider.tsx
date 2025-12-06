"use client"

// 제휴사 로고 데이터
const partnerLogos = [
  { src: "/logo1.png", alt: "제휴사 1", name: "Partner 1" },
  { src: "/logo2.png", alt: "제휴사 2", name: "Partner 2" },
  { src: "/logo3.png", alt: "제휴사 3", name: "Partner 3" },
  { src: "/logo4.png", alt: "제휴사 4", name: "Partner 4" },
  { src: "/logo5.png", alt: "제휴사 5", name: "Partner 5" },
  { src: "/logo6.png", alt: "제휴사 6", name: "Partner 6" },
  { src: "/logo7.png", alt: "제휴사 7", name: "Partner 7" },
  { src: "/logo8.png", alt: "제휴사 8", name: "Partner 8" },
  { src: "/logo9.png", alt: "제휴사 9", name: "Partner 9" },
  { src: "/logo10.png", alt: "제휴사 10", name: "Partner 10" },
  { src: "/logo11.png", alt: "제휴사 11", name: "Partner 11" },
  { src: "/logo12.png", alt: "제휴사 12", name: "Partner 12" },
  { src: "/logo13.png", alt: "제휴사 13", name: "Partner 13" },
  { src: "/logo14.png", alt: "제휴사 14", name: "Partner 14" },
  { src: "/logo15.png", alt: "제휴사 15", name: "Partner 15" },
  { src: "/logo16.png", alt: "제휴사 16", name: "Partner 16" },
  { src: "/logo17.png", alt: "제휴사 17", name: "Partner 17" },
  { src: "/logo18.png", alt: "제휴사 18", name: "Partner 18" },
]

export function PartnerLogoSlider() {
  // 무한 스크롤을 위해 로고 리스트를 2번 복제 (정확히 50% 이동하기 위해)
  const duplicatedLogos = [...partnerLogos, ...partnerLogos]

  return (
    <section 
      className="w-full bg-muted/30 border-y border-border py-8 overflow-hidden"
      aria-label="제휴사 로고"
    >
      <div className="relative w-full overflow-hidden">
        {/* 무한 스크롤 애니메이션 컨테이너 */}
        <div className="flex animate-marquee">
          {duplicatedLogos.map((logo, index) => (
            <div
              key={`logo-${index}`}
              className="flex-shrink-0 mx-8 flex items-center justify-center py-4"
            >
              <div className="relative w-32 h-16 md:w-40 md:h-20 transition-all duration-300 hover:scale-125 bg-transparent z-10">
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="w-full h-full object-contain opacity-50 hover:opacity-100 transition-all duration-300"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder-logo.png"
                    console.error(`Failed to load image: ${logo.src}`)
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
