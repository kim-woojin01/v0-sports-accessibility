"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"

export default function TermsOfServicePage() {
  const [activeSection, setActiveSection] = useState("")

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "chapter1",
        "chapter2",
        "chapter3",
        "chapter4",
        "chapter5",
        "supplementary"
      ]

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // 초기 실행

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const yOffset = -80 // 헤더 높이 고려
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: "smooth" })
    }
  }

  const tableOfContents = [
    { id: "chapter1", title: "제1장 총칙" },
    { id: "chapter2", title: "제2장 이용계약의 체결" },
    { id: "chapter3", title: "제3장 계약 당사자의 의무" },
    { id: "chapter4", title: "제4장 서비스의 이용" },
    { id: "chapter5", title: "제5장 손해배상 및 면책" },
    { id: "supplementary", title: "부칙" },
  ]

  return (
    <div className="container py-12 max-w-6xl mx-auto pt-24">
      <div className="flex gap-8">
        {/* 왼쪽 고정 목차 */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold">목차</CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  {tableOfContents.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`block w-full text-left text-sm py-2 px-3 rounded-md transition-colors ${
                        activeSection === item.id
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      {item.title}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* 오른쪽 본문 */}
        <div className="flex-1 min-w-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold">서비스 이용약관</CardTitle>
              <p className="text-base text-muted-foreground mt-2">
                (Terms of Service)
              </p>
              <p className="text-base text-muted-foreground mt-1">
                최종 업데이트: 2025년 11월 20일
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* 제1장 총칙 */}
              <section id="chapter1" className="space-y-6">
                <h2 className="text-3xl font-bold">제1장 총칙</h2>

                {/* 제1조 */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold text-foreground">제1조 (목적)</h3>
                  <p className="text-base text-muted-foreground leading-relaxed ml-4">
                    본 약관은 SportsAccess(이하 "회사"라 함)가 제공하는 체육 시설 정보 제공 및 관련 제반 서비스(이하 "서비스"라 함)의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
                  </p>
                </div>

                {/* 제2조 */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold text-foreground">제2조 (정의)</h3>
                  <p className="text-base text-muted-foreground leading-relaxed ml-4 mb-3">
                    본 약관에서 사용하는 용어의 정의는 다음과 같습니다.
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-8 text-base text-muted-foreground">
                    <li>
                      <strong>"서비스"</strong>라 함은 구현되는 단말기(PC, 휴대형 단말기 등 각종 유무선 장치를 포함)와 상관없이 회원이 이용할 수 있는 SportsAccess의 모든 제반 서비스를 의미합니다.
                    </li>
                    <li>
                      <strong>"회원"</strong>이라 함은 회사의 서비스에 접속하여 본 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 고객을 말합니다.
                    </li>
                    <li>
                      <strong>"게시물"</strong>이라 함은 회원이 서비스를 이용함에 있어 서비스상에 게시한 부호·문자·음성·음향·화상·동영상 등의 정보 형태의 글, 사진, 동영상 및 각종 파일과 링크 등을 의미합니다.
                    </li>
                    <li>
                      <strong>"공공데이터"</strong>라 함은 회사가 국민체육진흥공단 등 공공기관으로부터 제공받아 가공하여 서비스하는 체육 시설 정보를 의미합니다.
                    </li>
                  </ul>
                </div>

                {/* 제3조 */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold text-foreground">제3조 (약관의 게시와 개정)</h3>
                  <ul className="list-disc list-inside space-y-2 ml-8 text-base text-muted-foreground">
                    <li>
                      회사는 본 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면 또는 연결 화면(Footer)에 게시합니다.
                    </li>
                    <li>
                      회사는 「약관의 규제에 관한 법률」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.
                    </li>
                  </ul>
                </div>
              </section>

              {/* 제2장 이용계약의 체결 */}
              <section id="chapter2" className="space-y-6">
                <h2 className="text-3xl font-bold">제2장 이용계약의 체결</h2>

                {/* 제4조 */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold text-foreground">제4조 (이용계약의 성립)</h3>
                  <ul className="list-disc list-inside space-y-2 ml-8 text-base text-muted-foreground">
                    <li>
                      이용계약은 회원이 되고자 하는 자(이하 "가입신청자")가 약관의 내용에 대하여 동의를 한 다음 회원가입 신청을 하고 회사가 이러한 신청에 대하여 승낙함으로써 체결됩니다.
                    </li>
                    <li>
                      회사는 가입신청자의 신청에 대하여 서비스 이용을 승낙함을 원칙으로 합니다. 다만, 실명이 아니거나 타인의 정보를 도용한 경우 승낙을 하지 않거나 사후에 이용계약을 해지할 수 있습니다.
                    </li>
                  </ul>
                </div>

                {/* 제5조 */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold text-foreground">제5조 (개인정보보호 의무)</h3>
                  <p className="text-base text-muted-foreground leading-relaxed ml-4">
                    회사는 「개인정보보호법」 등 관계 법령이 정하는 바에 따라 회원의 개인정보를 보호하기 위해 노력합니다. 개인정보의 보호 및 사용에 대해서는 관련 법령 및 회사의 개인정보처리방침이 적용됩니다.
                  </p>
                </div>
              </section>

              {/* 제3장 계약 당사자의 의무 */}
              <section id="chapter3" className="space-y-6">
                <h2 className="text-3xl font-bold">제3장 계약 당사자의 의무</h2>

                {/* 제6조 */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold text-foreground">제6조 (회사의 의무)</h3>
                  <ul className="list-disc list-inside space-y-2 ml-8 text-base text-muted-foreground">
                    <li>
                      회사는 관련 법령과 본 약관이 금지하거나 미풍양속에 반하는 행위를 하지 않으며, 계속적이고 안정적으로 서비스를 제공하기 위하여 최선을 다하여 노력합니다.
                    </li>
                    <li>
                      회사는 회원이 안전하게 서비스를 이용할 수 있도록 개인정보 보호를 위한 보안 시스템을 갖추어야 합니다.
                    </li>
                    <li>
                      회사는 서비스 이용과 관련하여 회원으로부터 제기된 의견이나 불만이 정당하다고 인정할 경우에는 이를 처리하여야 합니다.
                    </li>
                  </ul>
                </div>

                {/* 제7조 */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold text-foreground">제7조 (회원의 의무)</h3>
                  <p className="text-base text-muted-foreground leading-relaxed ml-4 mb-3">
                    회원은 다음 행위를 하여서는 안 됩니다.
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-8 text-base text-muted-foreground">
                    <li>신청 또는 변경 시 허위 내용의 등록</li>
                    <li>타인의 정보 도용</li>
                    <li>회사가 게시한 정보의 변경</li>
                    <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                    <li>회사 및 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                    <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                    <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
                  </ul>
                </div>
              </section>

              {/* 제4장 서비스의 이용 */}
              <section id="chapter4" className="space-y-6">
                <h2 className="text-3xl font-bold">제4장 서비스의 이용</h2>

                {/* 제8조 */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold text-foreground">제8조 (서비스의 제공 및 변경)</h3>
                  <ul className="list-disc list-inside space-y-2 ml-8 text-base text-muted-foreground">
                    <li>
                      서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다.
                    </li>
                    <li>
                      회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신두절 또는 운영상 상당한 이유가 있는 경우 서비스의 제공을 일시적으로 중단할 수 있습니다.
                    </li>
                    <li>
                      회사가 제공하는 서비스 내의 체육 시설 정보는 국민체육진흥공단의 공공데이터 API를 기반으로 하므로, 원천 데이터의 변경이나 오류로 인해 실제 정보와 차이가 발생할 수 있습니다.
                    </li>
                  </ul>
                </div>

                {/* 제9조 */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold text-foreground">제9조 (위치기반서비스의 내용)</h3>
                  <ul className="list-disc list-inside space-y-2 ml-8 text-base text-muted-foreground">
                    <li>
                      회사는 위치정보사업자로부터 위치정보를 전달받아 회원의 현재 위치를 기반으로 주변 체육 시설 검색 및 길 찾기 서비스를 제공합니다.
                    </li>
                    <li>
                      회원의 위치 정보는 해당 서비스 제공 즉시 파기되며 별도로 저장되지 않습니다.
                    </li>
                  </ul>
                </div>

                {/* 제10조 */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold text-foreground">제10조 (저작권의 귀속 및 이용제한)</h3>
                  <ul className="list-disc list-inside space-y-2 ml-8 text-base text-muted-foreground">
                    <li>
                      회사가 작성한 저작물에 대한 저작권 및 기타 지적재산권은 회사에 귀속됩니다.
                    </li>
                    <li>
                      회원은 서비스를 이용함으로써 얻은 정보 중 회사에 지적재산권이 귀속된 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리 목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.
                    </li>
                    <li>
                      회원이 서비스 내에 게시한 게시물의 저작권은 해당 게시물의 저작자에게 귀속됩니다.
                    </li>
                  </ul>
                </div>
              </section>

              {/* 제5장 손해배상 및 면책 */}
              <section id="chapter5" className="space-y-6">
                <h2 className="text-3xl font-bold">제5장 손해배상 및 면책</h2>

                {/* 제11조 */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold text-foreground">제11조 (책임제한)</h3>
                  <ul className="list-disc list-inside space-y-2 ml-8 text-base text-muted-foreground">
                    <li>
                      회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.
                    </li>
                    <li>
                      회사는 공공기관이 제공하는 데이터 자체의 오류나 누락으로 인해 발생한 손해에 대해서는 책임을 지지 않습니다. (예: 시스템상 영업 중으로 표시되었으나 실제로는 휴관인 경우 등)
                    </li>
                    <li>
                      회사는 회원이 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않으며, 그 밖의 서비스를 통하여 얻은 자료로 인한 손해에 관하여 책임을 지지 않습니다.
                    </li>
                  </ul>
                </div>

                {/* 제12조 */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold text-foreground">제12조 (관할법원)</h3>
                  <p className="text-base text-muted-foreground leading-relaxed ml-4">
                    서비스 이용과 관련하여 회사와 회원 사이에 분쟁이 발생한 경우, 회사의 본사 소재지를 관할하는 법원을 전속 관할법원으로 합니다.
                  </p>
                </div>
              </section>

              {/* 부칙 */}
              <section id="supplementary" className="space-y-6">
                <h2 className="text-3xl font-bold">부칙</h2>
                <p className="text-base text-muted-foreground leading-relaxed">
                  본 약관은 2025년 11월 20일부터 시행합니다.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}