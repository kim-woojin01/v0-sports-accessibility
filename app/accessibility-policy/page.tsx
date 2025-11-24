import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function AccessibilityPolicyPage() {
  return (
    <div className="container py-12 max-w-4xl mx-auto pt-24">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">웹 접근성 정책</CardTitle>
          <p className="text-base text-muted-foreground mt-2">
            (Web Accessibility Statement)
          </p>
          <p className="text-base text-muted-foreground mt-1">
            최종 업데이트: 2025년 11월 15일
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* 1. 접근성 준수 선언 */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold">1. 접근성 준수 선언 (Commitment)</h2>
            <div className="space-y-3 text-base text-muted-foreground leading-relaxed">
              <p>
                SportsAccess는 장애인, 고령자, 임산부 등 정보 접근에 어려움을 겪는 분들을 포함하여, 모든 사용자가 신체적·환경적 조건에 구애받지 않고 우리 서비스를 동등하게 이용할 수 있도록 보장하는 것을 최우선 가치로 삼고 있습니다.
              </p>
              <p>
                우리는 '누구나 건강할 권리'를 디지털 환경에서도 실현하기 위해, 웹 표준 기술을 준수하고 보조 기술(스크린 리더 등)과의 호환성을 극대화하여 정보 격차를 해소하고자 끊임없이 노력하고 있습니다.
              </p>
            </div>
          </section>

          {/* 2. 적용 표준 및 지침 */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold">2. 적용 표준 및 지침 (Standards & Guidelines)</h2>
            <div className="space-y-3 text-base text-muted-foreground leading-relaxed">
              <p>
                본 웹사이트는 아래의 국내외 웹 접근성 표준 지침을 준수하여 설계 및 개발되었습니다.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-base">
                <li>
                  <strong>한국형 웹 콘텐츠 접근성 지침 2.2 (KWCAG 2.2)</strong>: 방송통신표준을 기반으로 한 국내 웹 접근성 준수 사항
                </li>
                <li>
                  <strong>W3C WCAG 2.1 (Web Content Accessibility Guidelines)</strong>: 국제 웹 표준 기구 W3C가 권고하는 웹 콘텐츠 접근성 지침 (Level AA 준수 지향)
                </li>
              </ul>
            </div>
          </section>

          {/* 3. 주요 제공 기능 및 기술적 고려사항 */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold">3. 주요 제공 기능 및 기술적 고려사항 (Accessibility Features)</h2>
            <div className="space-y-3 text-base text-muted-foreground leading-relaxed">
              <p>
                사용자의 원활한 이용을 위해 다음과 같은 기술적 조치를 적용하였습니다.
              </p>

              {/* 가. 인식의 용이성 */}
              <div className="ml-4 space-y-3">
                <h3 className="text-2xl font-semibold text-foreground">가. 인식의 용이성 (Perceivable)</h3>
                <ul className="list-disc list-inside space-y-2 ml-4 text-base">
                  <li>
                    <strong>대체 텍스트 제공</strong>: 이미지, 아이콘, 버튼 등 시각적 콘텐츠에 적절한 대체 텍스트(Alt-text)를 제공하여 시각 장애인이 스크린 리더를 통해 정보를 파악할 수 있도록 했습니다.
                  </li>
                  <li>
                    <strong>명확한 명도 대비</strong>: 저시력자 및 고령자를 고려하여 텍스트와 배경 간의 명도 대비를 4.5:1 이상으로 유지하여 가독성을 높였습니다.
                  </li>
                </ul>
              </div>

              {/* 나. 운용의 용이성 */}
              <div className="ml-4 space-y-3">
                <h3 className="text-2xl font-semibold text-foreground">나. 운용의 용이성 (Operable)</h3>
                <ul className="list-disc list-inside space-y-2 ml-4 text-base">
                  <li>
                    <strong>키보드 사용 보장</strong>: 마우스를 정밀하게 조작하기 어려운 사용자를 위해, 키보드(Tab, Enter, 방향키)만으로 모든 메뉴, 검색, 예약 기능을 이용할 수 있도록 구현했습니다.
                  </li>
                  <li>
                    <strong>초점(Focus) 이동의 시각화</strong>: 키보드 이동 시 현재 위치를 명확히 알 수 있도록 포커스 링(Focus Ring)을 시각적으로 강조하였습니다.
                  </li>
                  <li>
                    <strong>반응형 웹 설계</strong>: PC, 태블릿, 모바일 등 다양한 해상도와 기기 환경에 맞춰 최적화된 화면을 제공합니다.
                  </li>
                </ul>
              </div>

              {/* 다. 이해의 용이성 */}
              <div className="ml-4 space-y-3">
                <h3 className="text-2xl font-semibold text-foreground">다. 이해의 용이성 (Understandable)</h3>
                <ul className="list-disc list-inside space-y-2 ml-4 text-base">
                  <li>
                    <strong>논리적인 구조 (Semantic Markup)</strong>: &lt;header&gt;, &lt;main&gt;, &lt;nav&gt;, &lt;article&gt; 등 시맨틱 태그를 사용하여, 보조 기술 사용자가 페이지의 구조를 쉽게 이해하고 탐색할 수 있도록 했습니다.
                  </li>
                  <li>
                    <strong>일관된 내비게이션</strong>: 사이트 내의 모든 페이지에서 예측 가능한 메뉴 구조와 위치를 유지합니다.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 4. 예외 사항 및 한계 */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold">4. 예외 사항 및 한계 (Exceptions)</h2>
            <div className="space-y-3 text-base text-muted-foreground leading-relaxed">
              <p>
                SportsAccess는 웹 접근성을 준수하기 위해 최선을 다하고 있으나, 일부 기능에서는 기술적 한계나 외부 서비스 연동으로 인해 완전한 접근성을 보장하지 못할 수 있습니다.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-base">
                <li>
                  <strong>외부 지도 서비스</strong>: 네이버/카카오/Google 지도 API를 사용하는 지도 화면의 경우, 키보드 접근이나 스크린 리더 음성 지원이 제한적일 수 있습니다.
                </li>
                <li>
                  <strong>사용자 생성 콘텐츠</strong>: 사용자가 직접 등록하는 리뷰 이미지나 텍스트의 경우, 대체 텍스트가 누락되거나 구조화되지 않을 수 있습니다.
                </li>
              </ul>
              <p>
                이러한 문제점을 해결하기 위해 지속적인 모니터링과 업데이트를 진행하고 있습니다. 접근성 문제로 불편을 겪으셨다면 <Link href="#feedback" className="text-primary hover:underline font-medium">문의 및 피드백</Link> 섹션으로 연락 주시기 바랍니다.
              </p>
            </div>
          </section>

          {/* 5. 보조 기술 호환성 */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold">5. 보조 기술 호환성 (Compatibility)</h2>
            <div className="space-y-3 text-base text-muted-foreground leading-relaxed">
              <p>
                본 웹사이트는 다음과 같은 환경에서 테스트되었습니다.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 text-base">
                <li>
                  <strong>브라우저</strong>: Chrome, Edge, Safari, Firefox 최신 버전
                </li>
                <li>
                  <strong>스크린 리더</strong>: NVDA, JAWS, VoiceOver (macOS/iOS), TalkBack (Android)
                </li>
              </ul>
            </div>
          </section>

          {/* 6. 문의 및 피드백 */}
          <section id="feedback" className="space-y-4">
            <h2 className="text-3xl font-bold">6. 문의 및 피드백 (Feedback & Contact)</h2>
            <div className="space-y-3 text-base text-muted-foreground leading-relaxed">
              <p>
                서비스를 이용하시면서 접근성 문제로 불편을 겪으셨거나 개선에 대한 제안이 있으시다면 언제든지 아래 연락처로 말씀해 주십시오. 여러분의 소중한 의견을 반영하여 더 나은 서비스를 만들어 가겠습니다.
              </p>
              <div className="bg-slate-50 p-6 rounded-lg space-y-3 text-base">
                <div>
                  <strong className="text-foreground">이메일:</strong>{" "}
                  <Link href="mailto:accessibility@sportsaccess.com" className="text-primary hover:underline">
                    accessibility@sportsaccess.com
                  </Link>
                </div>
                <div>
                  <strong className="text-foreground">전화:</strong>{" "}
                  <Link href="tel:02-0000-0000" className="text-primary hover:underline">
                    02-0000-0000
                  </Link>
                  {" "}(평일 09:00 ~ 18:00)
                </div>
                <div>
                  <strong className="text-foreground">담당:</strong> SportsAccess 개발팀
                </div>
              </div>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}