import { Card, CardContent } from "@/components/ui/card"
import { Accessibility, Users, Zap, Database, BarChart3, Shield, Cloud, MapPin, MessageSquare, Sparkles } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Intro Section - 큰 배경 이미지 */}
      <section className="relative py-32 bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            SportsAccess 서비스 소개
          </h1>
          <p className="text-xl md:text-2xl font-medium mb-8 leading-relaxed">
            "누구나, 언제든, 편안하게 땀 흘릴 권리가 있습니다."
          </p>
          <p className="text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
            SportsAccess는 장벽 없는 스포츠 환경을 만들어갑니다.
          </p>
          <p className="text-base md:text-lg mt-6 leading-relaxed max-w-3xl mx-auto opacity-90">
          <br/> 
            우리는 건강을 위해 운동을 하려 할 때, 종종 보이지 않는 장벽에 부딪힙니다.
          <br/>
            "휠체어로 들어갈 수 있을까?", "지금 사람이 너무 많아서 위험하진 않을까?"
          <br/>  
            SportsAccess는 이러한 정보의 비대칭을 해결하기 위해 시작되었습니다.
          <br/>
          <br/>
            신체적 조건이나 환경에 구애받지 않고 누구나 자신에게 맞는 체육 시설을 찾을 수 있도록 돕는 것,
          <br/>
            그것이 우리가 기술로 풀고자 하는 문제입니다.
          </p>
        </div>
      </section>

      {/* 2. For Whom Section - 가로 3단 카드 */}
      <section className="py-20 bg-white">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            누구를 위한 서비스인가요?
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            우리의 기술은 가장 필요한 곳에서 빛을 발합니다.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {/* 카드 1 */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <Accessibility className="w-8 h-8 text-purple-600" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold">① 이동 약자 & 휠체어 사용자</h3>
                
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">현실적인 고민:</p>
                  <p>입구의 턱, 엘리베이터 유무를 몰라 헛걸음하는 경우가 많습니다.</p>
                  <p className="font-semibold text-foreground mt-3">이렇게 해결합니다:</p>
                  <p>전국 체육 시설의 장애인 편의시설 정보(경사로, 승강기, 장애인 화장실 등)를 사전에 명확하게 시각화하여 제공합니다.</p>
                </div>
              </CardContent>
            </Card>

            {/* 카드 2 */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-pink-600" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold">② 액티브 시니어</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">현실적인 고민:</p>
                  <p>복잡한 예약 시스템과 작은 글씨 때문에 디지털 정보 접근이 어렵습니다.</p>
                  <p className="font-semibold text-foreground mt-3">이렇게 해결합니다:</p>
                  <p>직관적인 UI, 큰 텍스트, 그리고 웹 접근성 표준을 준수하여 디지털 기기가 낯선 어르신들도 내 주변 운동 시설을 쉽게 찾을 수 있습니다.</p>
                </div>
              </CardContent>
            </Card>

            {/* 카드 3 */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <Zap className="w-8 h-8 text-blue-600" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold">③ 효율을 추구하는 현대인</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">현실적인 고민:</p>
                  <p>"지금 헬스장에 사람이 많을까?" 퇴근 후 소중한 시간을 낭비하고 싶지 않습니다.</p>
                  <p className="font-semibold text-foreground mt-3">이렇게 해결합니다:</p>
                  <p>데이터 기반의 혼잡도 분석 정보를 통해, 가장 쾌적하게 운동할 수 있는 골든타임을 알려드립니다.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 3. How It Works Section - 4개 박스 그리드 */}
      <section className="py-20 bg-slate-50">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            기술 및 데이터 프로세스
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            SportsAccess는 신뢰할 수 있는 데이터와 안전한 기술 위에서 움직입니다.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {/* 박스 1 */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Database className="w-6 h-6 text-purple-600" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold">💻 공공 데이터 파이프라인</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  국민체육진흥공단(KSPO) 및 공공데이터포털의 Open API를 활용하여 전국 10,000여 개의 체육 시설 정보를 실시간으로 동기화합니다. 신뢰할 수 있는 공공 데이터를 기반으로 폐업이나 정보 변경 사항을 신속하게 반영합니다.
                </p>
              </CardContent>
            </Card>

            {/* 박스 2 */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-pink-100 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-pink-600" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold">📊 혼잡도 분석 알고리즘</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                   단순히 현재 인원을 보여주는 것을 넘어, 과거의 요일별/시간대별 이용객 데이터를 머신러닝 및 통계적 기법으로 분석합니다. 이를 통해 사용자는 '가장 여유로운 시간'을 미리 예측하고 계획할 수 있습니다.
                </p>
              </CardContent>
            </Card>

            {/* 박스 3 */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-600" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold">♿ 웹 표준 접근성 구현</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                '기술로 허무는 디지털 장벽'을 실천합니다. KWCAG(한국형 웹 콘텐츠 접근성 지침)을 준수하여 시맨틱 마크업으로 개발되었으며, 스크린 리더 사용자를 위한 대체 텍스트 제공과 완벽한 키보드 네비게이션을 지원합니다.
                </p>
              </CardContent>
            </Card>

            {/* 박스 4 */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <Cloud className="w-6 h-6 text-green-600" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold">☁️ 보안 클라우드 인프라</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Railway DB 기반의 클라우드 환경에서 운영됩니다. HTTPS 암호화 통신을 통해 사용자의 위치 정보와 데이터를 안전하게 보호하며, 트래픽 변화에도 유연하게 대응합니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 4. Roadmap Section - 수직 타임라인 */}
      <section className="py-20 bg-white">
        <div className="container max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            앞으로의 계획
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            SportsAccess는 멈추지 않고 계속 진화합니다.
          </p>
          
          <div className="relative">
            {/* 타임라인 라인 */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-pink-500"></div>

            {/* Phase 1 */}
            <div className="relative pl-20 pb-12">
              <div className="absolute left-6 w-4 h-4 rounded-full bg-purple-600 border-4 border-white shadow-lg"></div>
              <Card className="p-6">
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="w-5 h-5 text-purple-600" aria-hidden="true" />
                    <h3 className="text-xl font-bold">과정 1. 정보의 시각화</h3>
                    <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded"> 기본적인 기능 입니다 </span>
                  </div>
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                    <li>전국 체육 시설 위치 기반 검색 서비스 런칭</li>
                    <li>장애인 편의시설 정보(BF인증 등) 연동 및 시각화</li>
                    <li>시간대별 예상 혼잡도 제공</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Phase 2 */}
            <div className="relative pl-20 pb-12">
              <div className="absolute left-6 w-4 h-4 rounded-full bg-pink-500 border-4 border-white shadow-lg"></div>
              <Card className="p-6">
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <MessageSquare className="w-5 h-5 text-pink-600" aria-hidden="true" />
                    <h3 className="text-xl font-bold">과정 2. 참여와 공유</h3>
                    <span className="text-sm bg-pink-100 text-pink-700 px-2 py-1 rounded"> 진행 중인 서비스입니다 </span>
                  </div>
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                    <li>사용자 제보 기능: "엘리베이터가 고장 났어요", "새로 생겼어요"</li>
                    <li>포토 리뷰 및 커뮤니티 기능 오픈</li>
                    <li>시설별 실시간 주차 현황 연동</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Phase 3 */}
            <div className="relative pl-20">
              <div className="absolute left-6 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-lg"></div>
              <Card className="p-6">
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="w-5 h-5 text-blue-600" aria-hidden="true" />
                    <h3 className="text-xl font-bold">과정 3. 개인화 및 지능화</h3>
                    <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded"> 장기적인 목표입니다</span>
                  </div>
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                    <li>AI 기반 맞춤형 시설 추천 (사용자 신체 조건 및 선호 종목 분석)</li>
                    <li>AI 기반 맞춤형 운동 프로그램 (사용자 신체 조건 및 선호 종목 분석)</li>
                    <li>음성 인식 검색 기능 도입 (보조 기술 강화)</li>
                    <li>예약 및 결제 시스템 통합</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}