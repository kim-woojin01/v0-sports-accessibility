"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState("")

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "article1",
        "article2",
        "article3",
        "article4",
        "article5",
        "article6",
        "article7",
        "article8",
        "article9",
        "article10",
        "article11",
        "article12"
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
    { id: "article1", title: "제1조 (개인정보의 처리목적)" },
    { id: "article2", title: "제2조 (개인정보의 처리 및 보유기간)" },
    { id: "article3", title: "제3조 (처리하는 개인정보 항목)" },
    { id: "article4", title: "제4조 (개인정보의 제3자 제공)" },
    { id: "article5", title: "제5조 (개인정보처리의 위탁)" },
    { id: "article6", title: "제6조 (정보주체와 법정대리인의 권리·의무 및 행사 방법)" },
    { id: "article7", title: "제7조 (개인정보의 파기)" },
    { id: "article8", title: "제8조 (개인정보의 안전성 확보조치)" },
    { id: "article9", title: "제9조 (개인정보 자동 수집 장치의 설치·운영 및 거부에 관한 사항)" },
    { id: "article10", title: "제10조 (개인정보 보호책임자)" },
    { id: "article11", title: "제11조 (권익침해 구제 방법)" },
    { id: "article12", title: "제12조 (개인정보 처리방침의 변경)" },
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
              <CardTitle className="text-3xl font-bold">개인정보 처리방침</CardTitle>
              <p className="text-base text-muted-foreground mt-2">
                (Privacy Policy)
              </p>
              <p className="text-base text-muted-foreground mt-1">
                최종 업데이트: 2025년 11월 18일
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* 서문 */}
              <div className="space-y-3 text-base text-muted-foreground leading-relaxed">
                <p>
                  SportsAccess (이하 "회사")는 「개인정보 보호법」 제30조에 따라 정보주체(회원)의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.
                </p>
              </div>

              {/* 제1조 */}
              <section id="article1" className="space-y-6">
                <h2 className="text-3xl font-bold">제1조 (개인정보의 처리목적)</h2>
                <div className="space-y-3 text-base text-muted-foreground leading-relaxed">
                  <p className="ml-4">
                    회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-8">
                    <li>
                      <strong>홈페이지 회원 가입 및 관리</strong>: 회원 가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원 자격 유지·관리, 서비스 부정이용 방지, 각종 고지·통지
                    </li>
                    <li>
                      <strong>재화 또는 서비스 제공</strong>: 위치 기반 체육 시설 정보 제공, 맞춤형 서비스 제공, 혼잡도 분석 데이터 제공
                    </li>
                    <li>
                      <strong>고충 처리</strong>: 민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락·통지, 처리 결과 통보
                    </li>
                  </ul>
                </div>
              </section>

                            {/* 제2조 */}
                            <section id="article2" className="space-y-6">
                <h2 className="text-3xl font-bold">제2조 (개인정보의 처리 및 보유기간)</h2>
                <div className="space-y-3 text-base text-muted-foreground leading-relaxed">
                  <p className="ml-4">
                    ① 회사는 법령에 따른 개인정보 보유·이용 기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용 기간 내에서 개인정보를 처리·보유합니다.
                  </p>
                  <p className="ml-4">
                    ② 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-8">
                    <li>
                      <strong>홈페이지 회원 가입 및 관리</strong>: 회원 탈퇴 신청일로부터 7일 후까지
                      <ul className="list-none space-y-1 ml-4 mt-2">
                        <li className="text-sm">
                          <strong>보유 사유</strong>: 회원의 실수로 인한 탈퇴 방지 및 계정 복구 기회 제공
                        </li>
                        <li className="text-sm">
                          <strong>보존 기간</strong>: 탈퇴 신청일로부터 7일 (해당 기간 내 로그인 시 계정이 복구되며, 기간 경과 시 지체 없이 영구 파기)
                        </li>
                      </ul>
                    </li>
                    <li>
                      <strong>재화 또는 서비스 제공</strong>: 재화·서비스 공급 완료 및 요금 결제·정산 완료 시까지
                    </li>
                  </ul>
                  <div className="ml-4 mt-4">
                    <p className="font-semibold text-foreground mb-2">관계 법령에 의한 정보 보유 사유</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>통신비밀보호법에 따른 접속 로그, 접속 IP 정보: 3개월</li>
                      <li>전자상거래 등에서의 소비자 보호에 관한 법률에 따른 표시/광고에 관한 기록: 6개월</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 제3조 */}
              <section id="article3" className="space-y-6">
                <h2 className="text-3xl font-bold">제3조 (처리하는 개인정보 항목)</h2>
                <div className="space-y-3 text-base text-muted-foreground leading-relaxed">
                  <p className="ml-4">
                    회사는 다음의 개인정보 항목을 처리하고 있습니다.
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-8">
                    <li>
                      <strong>회원 가입 및 관리 (필수항목)</strong>: 이메일 주소, 비밀번호, 닉네임
                    </li>
                    <li>
                      <strong>인터넷 서비스 이용 과정에서 자동으로 생성되어 수집되는 항목</strong>: IP주소, 쿠키(Cookie), MAC 주소, 서비스 이용 기록, 방문 기록, 기기 정보
                    </li>
                    <li>
                      <strong>위치기반서비스 이용 시</strong>: GPS 위치 정보 (위도, 경도)
                    </li>
                  </ul>
                  <p className="ml-4 mt-3">
                    위치 정보는 사용자 단말기에서 1회성으로 활용되며 서버에 영구 저장되지 않습니다.
                  </p>
                </div>
              </section>

              {/* 제4조 */}
              <section id="article4" className="space-y-6">
                <h2 className="text-3xl font-bold">제4조 (개인정보의 제3자 제공)</h2>
                <div className="space-y-3 text-base text-muted-foreground leading-relaxed">
                  <p className="ml-4">
                    회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 「개인정보 보호법」 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다. 회사는 현재 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.
                  </p>
                </div>
              </section>

              {/* 제5조 */}
              <section id="article5" className="space-y-6">
                <h2 className="text-3xl font-bold">제5조 (개인정보처리의 위탁)</h2>
                <div className="space-y-3 text-base text-muted-foreground leading-relaxed">
                  <p className="ml-4">
                    ① 회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-8">
                    <li>
                      <strong>위탁받는 자 (수탁자)</strong>: Vercel Inc., Railway DB Service, AWS (Amazon Web Services)
                    </li>
                    <li>
                      <strong>위탁하는 업무의 내용</strong>: 클라우드 서버 인프라 운영 및 데이터 보관
                    </li>
                  </ul>
                </div>
              </section>

              {/* 제6조 */}
              <section id="article6" className="space-y-6">
                <h2 className="text-3xl font-bold">제6조 (정보주체와 법정대리인의 권리·의무 및 행사 방법)</h2>
                <div className="space-y-3 text-base text-muted-foreground leading-relaxed">
                  <p className="ml-4">
                    ① 정보주체는 회사에 대해 언제든지 개인정보 열람·정정·삭제·처리정지 요구 등의 권리를 행사할 수 있습니다.
                  </p>
                  <p className="ml-4">
                    ② 권리 행사는 회사에 대해 서면, 전자우편 등을 통하여 하실 수 있으며 회사는 이에 대해 지체 없이 조치하겠습니다.
                  </p>
                  <p className="ml-4">
                    ③ 정보주체는 회원 탈퇴 기능을 통하여 언제든지 개인정보 수집 및 이용 동의를 철회할 수 있습니다.
                  </p>
                </div>
              </section>

              {/* 제7조 */}
              <section id="article7" className="space-y-6">
                <h2 className="text-3xl font-bold">제7조 (개인정보의 파기)</h2>
                <div className="space-y-3 text-base text-muted-foreground leading-relaxed">
                  <p className="ml-4">
                    ① 회사는 개인정보 보유 기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.
                  </p>
                  <p className="ml-4">
                    ② 파기 절차 및 방법은 다음과 같습니다.
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-8">
                    <li>
                      <strong>파기 절차</strong>: 회사는 파기 사유가 발생한 개인정보를 선정하고, 개인정보 보호책임자의 승인을 받아 개인정보를 파기합니다.
                    </li>
                    <li>
                      <strong>파기 방법</strong>: 전자적 파일 형태로 기록·저장된 개인정보는 기록을 재생할 수 없도록 로우레벨 포맷(Low-Level Format) 등의 기술적 방법을 이용하여 파기합니다.
                    </li>
                  </ul>
                </div>
              </section>

              {/* 제8조 */}
              <section id="article8" className="space-y-6">
                <h2 className="text-3xl font-bold">제8조 (개인정보의 안전성 확보조치)</h2>
                <div className="space-y-3 text-base text-muted-foreground leading-relaxed">
                  <p className="ml-4">
                    회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-8">
                    <li>
                      <strong>관리적 조치</strong>: 내부관리계획 수립·시행, 정기적인 자체 감사 실시
                    </li>
                    <li>
                      <strong>기술적 조치</strong>:
                      <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                        <li>
                          <strong>비밀번호 암호화</strong>: 회원의 비밀번호는 일방향 암호화(Hashing) 되어 저장 및 관리되고 있어, 본인만이 알 수 있습니다.
                        </li>
                        <li>
                          <strong>해킹 등에 대비한 기술적 대책</strong>: 해킹이나 컴퓨터 바이러스 등에 의한 개인정보 유출 및 훼손을 막기 위하여 보안 프로그램을 설치하고 주기적인 갱신·점검을 하며, SSL(Secure Socket Layer)을 이용하여 데이터를 암호화하여 전송합니다.
                        </li>
                        <li>
                          <strong>접속기록의 보관</strong>: 접속 기록이 위변조 및 도난, 분실되지 않도록 안전하게 보관합니다.
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
              </section>

              {/* 제9조 */}
              <section id="article9" className="space-y-6">
                <h2 className="text-3xl font-bold">제9조 (개인정보 자동 수집 장치의 설치·운영 및 거부에 관한 사항)</h2>
                <div className="space-y-3 text-base text-muted-foreground leading-relaxed">
                  <p className="ml-4">
                    ① 회사는 이용자에게 개별적인 맞춤 서비스를 제공하기 위해 이용 정보를 저장하고 수시로 불러오는 '쿠키(cookie)'를 사용합니다.
                  </p>
                  <p className="ml-4">
                    ② 쿠키는 웹사이트를 운영하는데 이용되는 서버(http)가 이용자의 컴퓨터 브라우저에게 보내는 소량의 정보이며 이용자들의 PC 컴퓨터 내의 하드디스크에 저장되기도 합니다.
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-8">
                    <li>
                      <strong>쿠키의 사용 목적</strong>: 이용자의 접속 빈도나 방문 시간 등을 분석하여 서비스 개편의 척도로 활용합니다.
                    </li>
                    <li>
                      <strong>쿠키의 설치·운영 및 거부</strong>: 웹 브라우저 상단의 도구&gt;인터넷 옵션&gt;개인정보 메뉴의 옵션 설정을 통해 쿠키 저장을 거부할 수 있습니다.
                    </li>
                  </ul>
                  <p className="ml-4">
                    쿠키 저장을 거부할 경우 맞춤형 서비스 이용에 어려움이 발생할 수 있습니다.
                  </p>
                </div>
              </section>

              {/* 제10조 */}
              <section id="article10" className="space-y-6">
                <h2 className="text-3xl font-bold">제10조 (개인정보 보호책임자)</h2>
                <div className="space-y-3 text-base text-muted-foreground leading-relaxed">
                  <p className="ml-4">
                    회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만 처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
                  </p>
                  <div className="ml-8 bg-slate-50 p-4 rounded-lg space-y-2">
                    <p>
                      <strong className="text-foreground">성명</strong>: 김우진
                    </p>
                    <p>
                      <strong className="text-foreground">직책</strong>: SportsAccess 개발 총괄 / CPO
                    </p>
                    <p>
                      <strong className="text-foreground">연락처</strong>:{" "}
                      <a href="mailto:kjwelf@naver.com" className="text-primary hover:underline">
                        kjwelf@naver.com
                      </a>
                    </p>
                  </div>
                </div>
              </section>

              {/* 제11조 */}
              <section id="article11" className="space-y-6">
                <h2 className="text-3xl font-bold">제11조 (권익침해 구제 방법)</h2>
                <div className="space-y-3 text-base text-muted-foreground leading-relaxed">
                  <p className="ml-4">
                    정보주체는 개인정보침해로 인한 구제를 받기 위하여 개인정보분쟁조정위원회, 한국인터넷진흥원 개인정보침해신고센터 등에 분쟁 해결이나 상담을 신청할 수 있습니다.
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-8">
                  <li>
                      <strong>개인정보침해신고센터</strong> (
                      <Link href="https://privacy.kisa.or.kr" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                        privacy.kisa.or.kr
                      </Link>
                      {" "}/ 국번없이 118)
                    </li>
                    <li>
                      <strong>대검찰청 사이버수사과</strong> (
                      <Link href="https://www.spo.go.kr" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                        www.spo.go.kr
                      </Link>
                      {" "}/ 국번없이 1301)
                    </li>
                    <li>
                      <strong>경찰청 사이버수사국</strong> (
                      <Link href="https://police.go.kr" target="_blank" rel="noreferrer" className="text-primary hover-underline">
                        police.go.kr
                      </Link>
                      {" "}/ 국번없이 182)
                    </li>
                  </ul>
                </div>
              </section>

              {/* 제12조 */}
              <section id="article12" className="space-y-6">
                <h2 className="text-3xl font-bold">제12조 (개인정보 처리방침의 변경)</h2>
                <div className="space-y-3 text-base text-muted-foreground leading-relaxed">
                  <p className="ml-4">
                    이 개인정보 처리방침은 2025년 11월 18일부터 적용됩니다.
                  </p>
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}