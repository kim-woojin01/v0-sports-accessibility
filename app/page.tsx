import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Search, Users, Info, Star, Phone, Clock } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-white to-pink-50/50">
        <div className="container text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900">Services we offer</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            모두가 편안하게 운동할 수 있는 스마트 체육 환경을 구축합니다. 장애인, 고령층, 임산부 등 누구나 쉽게 접근
            가능한 체육 시설을 찾아보세요.
          </p>
        </div>

        {/* Service Cards Slider (Simplified as Grid for MVP) */}
        <div className="container mt-16 overflow-x-auto pb-8 hide-scrollbar">
          <div className="flex gap-6 min-w-max px-4 lg:justify-center lg:min-w-0">
            {/* Card 1 */}
            <div className="w-80 h-80 bg-white p-8 rounded-2xl shadow-sm border hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center mb-6 text-pink-600">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-xl mb-4">체육시설 검색 서비스</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  지역, 종목, 시설명을 입력하면
                  <br />
                  장애인 편의시설 정보(경사로, 주차장, 화장실)까지 한 번에 확인할 수 있습니다.
                  <br />
                  편의시설 필터를 통해 나에게 맞는 시설을 빠르게 찾을 수 있습니다.
                </p>
              </div>
            </div>

            {/* Card 2 - Staggered Down */}
            <div className="w-80 h-80 bg-white p-8 rounded-2xl shadow-sm border border-pink-200 hover:shadow-md transition-shadow flex flex-col justify-between mt-12">
              <div>
                <div className="w-14 h-14 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center mb-6 text-purple-600">
                  <div className="w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs">
                    ★
                  </div>
                </div>
                <h3 className="font-bold text-xl mb-4">접근성 평가 & 점수 제공</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  시설별 장애인 편의시설 여부, 길턱, 이동 동선 등 접근성 요소를 분석해 종합 점수를 제공합니다.
                  <br />
                  객관적인 데이터를 기반으로 시설 선택을 더 쉽게 도와줍니다.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="w-80 h-80 bg-white p-8 rounded-2xl shadow-sm border hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mb-6 text-blue-600">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-xl mb-4">혼잡도 분석 서비스</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  공공데이터 기반으로 시간대·요일별 혼잡도 패턴을 분석합니다.
                  <br />
                  여유 / 보통 / 혼잡 상태를 색상으로 시각화해 가장 편한 시간에 시설을 이용할 수 있도록 안내합니다.
                </p>
              </div>
            </div>

            {/* Card 4 - Staggered Down */}
            <div className="w-80 h-80 bg-white p-8 rounded-2xl shadow-sm border hover:shadow-md transition-shadow flex flex-col justify-between mt-12">
              <div>
                <div className="w-14 h-14 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mb-6 text-purple-800">
                  <Info className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-xl mb-4">시설 상세 정보 제공</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  운영시간, 주차, 이용 요금표, 시설 규모 등 이용에 필요한 모든 정보를 한 화면에 제공합니다.
                  <br />
                  장애인 편의시설 체크리스트도 함께 제공합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Feature Section */}
      <section className="py-20 bg-white">
        <div className="container flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 relative h-[400px] w-full rounded-2xl overflow-hidden shadow-lg bg-slate-100">
            <Image src="/map-view.png" alt="체육 시설 지도 화면 - 주변 체육 시설 위치를 지도로 표시" fill className="object-cover" />
          </div>
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl font-bold leading-tight">
              접근성 정보, 장애인 편의시설 여부,
              <br />
              시간대별 혼잡도를 한눈에 확인!
            </h2>
            <div className="w-full h-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full max-w-[300px]"></div>
            <p className="text-muted-foreground text-lg">
              지도 위에서 내 주변 체육시설을 직관적으로 확인하세요. 현재 위치를 기반으로 가장 가까운 접근성 높은 시설을
              추천해드립니다.
            </p>

            {/* Example Card */}
            <div className="bg-white p-4 rounded-xl border shadow-lg max-w-md mt-8">
              <div className="flex gap-4">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <Image src="/modern-gym-interior.png" alt="호암체육관 내부 전경" fill className="object-cover" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-bold">호암체육관</h4>
                  <p className="text-xs text-muted-foreground">충북 충주시 중원대로 3306 호암체육관</p>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-bold text-sm">5.0</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      <span>043-830-9225</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>영업시간</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="text-xs font-medium">혼잡</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-50">
        <div className="container flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="flex-1 space-y-6 lg:pl-12 xl:pl-20">
            <h2 className="text-4xl font-bold">
              지금 바로 체육 시설을
              <br />
              검색해보세요!
            </h2>
            <div className="w-full h-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full max-w-[300px]"></div>
            <p className="text-muted-foreground">
              지역·접근성·혼잡도 정보를 바탕으로 나에게 꼭 맞는
              <br />
              체육시설을 찾아보세요.
            </p>
            <Link href="/search">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8 mt-4">
                시설 검색하기
              </Button>
            </Link>
          </div>
          <div className="flex-1 flex justify-center gap-8">
            <div className="relative w-64 h-64">
              <Image src="/analytics-chart-3d.jpg" alt="체육 시설 혼잡도 분석 차트 - 시간대별 이용 현황을 시각화한 그래프" fill className="object-contain" />
            </div>
            <div className="relative w-64 h-80 mt-12">
              <Image src="/mobile-app-review-3d.jpg" alt="SportsAccess 모바일 앱 화면 - 스마트폰에서 체육 시설 정보를 확인하는 모습" fill className="object-contain" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
