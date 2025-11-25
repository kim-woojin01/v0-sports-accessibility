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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 팀원 카드 예시 - 추후 정보 추가 예정 */}
        <Card className="text-center">
          <CardHeader>
            <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl text-gray-400">👤</span>
            </div>
            <CardTitle>팀원 이름</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              역할 및 담당 업무
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              소개 내용은 추후 추가 예정입니다.
            </p>
          </CardContent>
        </Card>

        {/* 추가 팀원 카드들도 동일한 구조로 추가 가능 */}
      </div>

      <div className="mt-12 text-center">
        <p className="text-muted-foreground">
          팀원 정보는 추후 업데이트될 예정입니다.
        </p>
      </div>
    </div>
  )
}