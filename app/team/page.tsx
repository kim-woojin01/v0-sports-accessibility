import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TeamPage() {
  return (
    <div className="container py-12 max-w-6xl mx-auto pt-24 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">팀 소개</h1>
        <p className="text-lg text-muted-foreground">
          SportsAccess 프로젝트에 참여한 팀원들을 소개합니다.
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 max-w-6xl mx-auto">
        {/* 팀원 카드 1 - 김우진 */}
        <Card className="text-center w-full md:w-1/3 flex flex-col">
          <CardHeader className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl text-gray-400">👤</span>
            </div>
            <CardTitle className="mb-2">김우진</CardTitle>
            <p className="text-sm font-semibold text-foreground">
              개발 총괄(Full Stack & 서비스 구조 설계)
            </p>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col pt-6">
            <div className="space-y-3 text-left">
              <p className="text-xs text-muted-foreground leading-relaxed">
                프로젝트 전반의 개발 방향을 총괄하며 주요 기능 구현, 서비스 아키텍처 설계, 개발 흐름 관리 등을 담당하였습니다.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                데이터 처리 구조, 검색·리뷰 기능 통합, 접근성 기반 추천 알고리즘의 핵심 로직을 구축하며 전체적인 서비스 완성도를 높였습니다.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 팀원 카드 2 - 이승우 */}
        <Card className="text-center w-full md:w-1/3 flex flex-col">
          <CardHeader className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl text-gray-400">👤</span>
            </div>
            <CardTitle className="mb-2">이승우</CardTitle>
            <p className="text-sm font-semibold text-foreground">
              메뉴 기능 설계 및 서비스 기능 담당
            </p>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col pt-6">
            <div className="space-y-3 text-left">
              <p className="text-xs text-muted-foreground leading-relaxed">
                상단 메뉴·페이지 이동 구조·검색 조건 UI 등 핵심 메뉴 기능을 설계하고 개선했습니다.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                또한 서비스 기능 전반의 작동 방식과 화면 흐름을 정리하며, Search·Review·Mypage 등 주요 화면의 사용성을 높이는 작업을 주도했습니다.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 팀원 카드 3 - 조경주 */}
        <Card className="text-center w-full md:w-1/3 flex flex-col">
          <CardHeader className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl text-gray-400">👤</span>
            </div>
            <CardTitle className="mb-2">조경주</CardTitle>
            <p className="text-sm font-semibold text-foreground">
              전문 데이터 분석 & 모델 학습 담당
            </p>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col pt-6">
            <div className="space-y-3 text-left">
              <p className="text-xs text-muted-foreground leading-relaxed">
                체육시설 공공데이터 정제, 예측 모델 구성, 혼잡도 기반 데이터 처리 등 핵심 분석 기능을 담당했습니다.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                단순 조회가 아닌 예측 기반 정보(혼잡도·접근성 점수)를 제공하기 위해 모델 설계와 데이터 파이프라인 구축을 맡아 서비스의 전문성을 강화했습니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <p className="text-muted-foreground">
          팀원 정보는 추후 업데이트될 예정입니다.
        </p>
      </div>

      <div className="mt-16 pt-12">
        <div className="max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl text-center">
                🔄 팀 협업 내용(공통 안내 문구)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-muted-foreground leading-relaxed text-center">
                <p>
                  각 팀원은 담당 역할을 기반으로 개발·데이터·UI 전반을 나누어 맡았으며 모든 기능은 지속적으로 공유하며 함께 개선해 나갔습니다.
                  <br />
                  각자의 전문성을 바탕으로 협업하여 SportsAccess 서비스의 전반적인 구성과 완성도를 함께 만들어갔습니다.
                  <br />
                  필요하신 점과 개선, 요청 사항 등이 있으면 편하게 연락 주시면 팀에서 검토 후 반영하겠습니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}