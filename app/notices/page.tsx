"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import LottieLoader from "@/components/loading-animation"

interface Notice {
  id: number
  category: string
  title: string
  content: string
  created_at: string
  is_important: boolean
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await fetch('/api/notices')
        const data = await response.json()
        setNotices(data.notices || [])
      } catch (error) {
        console.error('공지사항 로드 오류:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotices()
  }, [])

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case '업데이트':
        return 'bg-purple-100 text-purple-700 hover:bg-purple-200'
      case '점검':
        return 'bg-orange-100 text-orange-700 hover:bg-orange-200'
      case '이벤트':
        return 'bg-pink-100 text-pink-700 hover:bg-pink-200'
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LottieLoader />
      </div>
    )
  }

  return (
    <div className="container py-12 max-w-4xl mx-auto pt-24 px-4">
      {/* 헤더 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">공지사항</h1>
        <p className="text-lg text-muted-foreground">
          SportsAccess의 새로운 소식과 업데이트를 알려드립니다.
        </p>
      </div>

      {/* 공지사항 리스트 */}
      {notices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">등록된 공지사항이 없습니다.</p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="w-full space-y-4">
          <ul className="space-y-4" role="list" aria-label="공지사항 목록">
            {notices.map((notice) => (
              <li key={notice.id} role="listitem">
                <AccordionItem value={`notice-${notice.id}`} className="border rounded-lg">
                  <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4 w-full text-left">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge 
                            className={getCategoryBadgeColor(notice.category)}
                            aria-label={`카테고리: ${notice.category}`}
                          >
                            {notice.category}
                          </Badge>
                          {notice.is_important && (
                            <Badge className="bg-red-100 text-red-700 hover:bg-red-200" aria-label="중요 공지">
                              중요
                            </Badge>
                          )}
                          <h3 className="font-semibold text-base md:text-lg">
                            {notice.title}
                          </h3>
                        </div>
                        <time 
                          dateTime={notice.created_at} 
                          className="text-sm text-muted-foreground shrink-0"
                        >
                          {formatDate(notice.created_at)}
                        </time>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <CardContent className="px-6 pt-0 pb-6">
                        <div 
                          className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{ __html: notice.content.replace(/\n/g, '<br />') }}
                        />
                      </CardContent>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              </li>
            ))}
          </ul>
        </Accordion>
      )}
    </div>
  )
}

