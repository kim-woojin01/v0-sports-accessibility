"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { userProfile, facilities } from "@/lib/data"
import { Calendar, Clock, Settings, LogOut } from "lucide-react"
import Link from "next/link"

export default function MyPage() {
  return (
    <div className="container py-12 max-w-5xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar / Profile Summary */}
        <div className="w-full md:w-1/3 space-y-6">
          <Card className="text-center pt-6">
            <div className="flex justify-center mb-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>HG</AvatarFallback>
              </Avatar>
            </div>
            <CardHeader>
              <CardTitle>{userProfile.name}</CardTitle>
              <CardDescription>{userProfile.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-left">
              <div className="text-sm">
                <span className="font-semibold block mb-1">장애 유형</span>
                <div className="p-2 bg-slate-100 rounded">{userProfile.disabilityType}</div>
              </div>
              <div className="text-sm">
                <span className="font-semibold block mb-1">운동 목적</span>
                <div className="flex gap-2 flex-wrap">
                  {userProfile.exercisePurpose.map((p) => (
                    <span key={p} className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4 bg-transparent">
                <Settings className="w-4 h-4 mr-2" /> 프로필 수정
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="w-full md:w-2/3">
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="history">나의 이용 내역</TabsTrigger>
              <TabsTrigger value="reviews">작성한 리뷰</TabsTrigger>
              <TabsTrigger value="settings">계정 설정</TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="space-y-4">
              <h2 className="text-xl font-bold mb-4">최근 이용한 시설</h2>
              {userProfile.history.map((item, index) => {
                const facility = facilities.find((f) => f.id === item.facilityId)
                if (!facility) return null

                return (
                  <Card key={index} className="overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      <div className="w-full sm:w-40 h-32 bg-slate-200 relative">
                        {/* Mock Image */}
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                          Image
                        </div>
                      </div>
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-lg">{facility.name}</h3>
                          <p className="text-sm text-muted-foreground">{facility.address}</p>
                          <div className="flex gap-4 mt-2 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{item.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{item.time}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end mt-4">
                          {item.hasReview ? (
                            <Button disabled variant="secondary" size="sm">
                              리뷰 작성 완료
                            </Button>
                          ) : (
                            <Link href={`/reviews/write/${facility.id}`}>
                              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                                리뷰 작성하기
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </TabsContent>

            <TabsContent value="reviews">
              <div className="text-center py-12 text-muted-foreground">작성한 리뷰가 없습니다.</div>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>계정 보안</CardTitle>
                  <CardDescription>비밀번호 및 개인정보를 관리합니다.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">현재 비밀번호</label>
                    <Input type="password" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">새 비밀번호</label>
                    <Input type="password" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">새 비밀번호 확인</label>
                    <Input type="password" />
                  </div>
                  <Button className="w-full">비밀번호 변경</Button>

                  <div className="pt-8 border-t">
                    <Button variant="destructive" className="w-full">
                      <LogOut className="w-4 h-4 mr-2" /> 계정 탈퇴
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
