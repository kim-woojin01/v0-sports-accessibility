"use client"

import { useEffect, useState, use } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, MapPin, Phone, Clock, TreePine, User, Bell, Lock, CircleUser, Building2, TrendingUp, Circle } from "lucide-react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import LoadingSpinner from "@/components/loading-spinner"

type Facility = {
  id: number | string
  name: string
  address?: string
  image?: string
  phone?: string
  hours?: string
  rating?: number
  real_time_level?: "여유" | "보통" | "혼잡"
}

type ReviewData = {
  id: number
  facilityId: number
  rating: number
  content: string
  tags: string[]
}

export default function WriteReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const reviewId = searchParams.get("reviewId")

  const [facility, setFacility] = useState<Facility | null>(null)
  const [isFacilityLoading, setIsFacilityLoading] = useState(true)
  const [reviewCount, setReviewCount] = useState(0)
  const [accessibilityScore, setAccessibilityScore] = useState(0)

  const [rating, setRating] = useState(0)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [facilityUsageId, setFacilityUsageId] = useState<number | null>(null)

  useEffect(() => {
    const loadFacility = async () => {
      setIsFacilityLoading(true)
      try {
        // 이용 내역 ID 확인 (쿼리 파라미터에서)
        const usageId = searchParams.get("usageId")
        if (usageId) {
          setFacilityUsageId(Number(usageId))
        }

        const res = await fetch("/api/facilities")
        if (!res.ok) throw new Error("시설 조회 실패")
        const data = await res.json()
        const found = data.find((f: any) => String(f.id) === String(id))
        if (found) {
          setFacility({
            id: found.id,
            name: found.name,
            address: found.address ?? "",
            image: found.image ?? "/placeholder.svg",
            phone: found.phone ?? "",
            hours: found.hours ?? "",
            rating: found.rating ?? 0,
            real_time_level: found.real_time_level,
          })

          // 리뷰 수 조회
          try {
            const reviewRes = await fetch(`/api/reviews?facilityId=${found.id}`)
            if (reviewRes.ok) {
              const reviews = await reviewRes.json()
              setReviewCount(reviews.length)
              // 접근성 점수 계산 (리뷰 평균 평점)
              if (reviews.length > 0) {
                const avgRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
                setAccessibilityScore(Number(avgRating.toFixed(1)))
              } else {
                setAccessibilityScore(0)
              }
            }
          } catch (e) {
            console.error("리뷰 수 조회 오류:", e)
          }
        } else {
          setFacility(null)
        }
      } catch (e) {
        console.error("리뷰 작성 페이지 시설 로드 오류:", e)
        setFacility(null)
      } finally {
        setIsFacilityLoading(false)
      }
    }

    loadFacility()
  }, [id])

  useEffect(() => {
    const loadReview = async () => {
      if (!reviewId) return
      try {
        console.log("리뷰 로드 시작 - reviewId:", reviewId)
        const res = await fetch(`/api/reviews/${reviewId}`)
        console.log("리뷰 API 응답 상태:", res.status, res.statusText)
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          console.error("리뷰 조회 실패:", errorData)
          throw new Error(errorData.error || "리뷰 조회 실패")
        }
        
        const data: ReviewData = await res.json()
        console.log("리뷰 데이터 로드 성공:", data)
        setRating(data.rating)
        setContent(data.content)
        setSelectedTags(data.tags || [])
      } catch (e: any) {
        console.error("기존 리뷰 로드 오류:", e)
        alert("리뷰를 불러오는 중 오류가 발생했습니다: " + (e.message || String(e)))
      }
    }

    loadReview()
  }, [reviewId])

  if (isFacilityLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner message="시설 정보를 불러오는 중입니다..." />
      </div>
    )
  }

  if (!facility) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">시설을 찾을 수 없습니다.</p>
        </div>
      </div>
    )
  }

  const reviewTags = {
    style: [
      { text: "진입로 평탄해요", icon: TreePine },
      { text: "안내 표지판 있어요", icon: User },
      { text: "보드라운 바닥재", icon: Bell },
      { text: "보조기구 빌려줘요", icon: Lock },
    ],
    service: [
      { text: "휠체어 출입", icon: CircleUser },
      { text: "장애인 화장실", icon: Building2 },
      { text: "경사로 설치되어 있어요", icon: TrendingUp },
      { text: "점자 안내 필요해요", icon: Circle },
    ],
  }

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      if (selectedTags.length >= 5) {
        alert("최대 5개까지 선택할 수 있습니다.")
        return
      }
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleSubmit = async () => {
    const userStr = localStorage.getItem("user")
    if (!userStr) {
      alert("로그인이 필요한 서비스입니다.")
      router.push("/signin")
      return
    }

    const user = JSON.parse(userStr)

    if (!rating || selectedTags.length === 0 || !content.trim()) {
      alert("별점, 태그, 내용을 모두 입력해주세요.")
      return
    }

    setIsSubmitting(true)
    try {
      const body = {
        facilityId: Number(id),
        userId: user.id,
        userName: user.name || user.idEmail || "사용자",
        rating,
        content,
        tags: selectedTags,
        facilityUsageId: facilityUsageId || undefined, // 이용 내역 ID 전달
      }

      const url = reviewId ? `/api/reviews/${reviewId}` : "/api/reviews"
      const method = reviewId ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        console.error("리뷰 저장 실패:", err)
        alert("리뷰 저장에 실패했습니다: " + (err.error || err.detail || "알 수 없는 오류"))
        return
      }

      const result = await res.json()
      console.log("리뷰 저장 성공:", result)

      if (reviewId) {
        alert("리뷰가 수정되었습니다!")
        // 마이페이지로 이동하고 새로고침하여 최신 데이터 로드
        router.push("/mypage")
        router.refresh()
      } else {
        alert("리뷰가 등록되었습니다!")
        router.push("/mypage")
        router.refresh()
      }
    } catch (e) {
      console.error("리뷰 저장 오류:", e)
      alert("리뷰 저장 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen py-12">
      <div className="container max-w-3xl w-full">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Facility Info Header */}
        <div className="p-6 border-b">
          <div className="flex gap-6 mb-4">
            <div className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
              <Image src={facility.image || "/placeholder.svg"} alt={facility.name} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{facility.name}</h1>
              <div className="flex items-center gap-4 text-sm mb-2">
                {facility.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">{facility.rating}</span>
                    <span className="text-muted-foreground">점 ({reviewCount}개 후기)</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm mb-2">
                {accessibilityScore > 0 && (
                  <div className="text-muted-foreground">접근성 {accessibilityScore}</div>
                )}
                {facility.real_time_level && (
                  <div className="flex items-center gap-1">
                    <CircleUser className="w-4 h-4" />
                    <span className="text-muted-foreground">휠체어 지원</span>
                  </div>
                )}
                {facility.real_time_level && (
                  <div className="text-muted-foreground">혼잡도 {facility.real_time_level === "여유" ? "4.4" : facility.real_time_level === "보통" ? "3.5" : "2.1"}</div>
                )}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <MapPin className="w-4 h-4" />
                {facility.address}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Phone className="w-4 h-4" />
                {facility.phone}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Clock className="w-4 h-4" />
                {facility.hours}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Star Rating */}
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">이 시설은 어떠셨나요?</h3>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`transition-transform hover:scale-110 ${rating >= star ? "text-amber-400" : "text-gray-200"}`}
                >
                  <Star className="w-10 h-10 fill-current" />
                </button>
              ))}
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              {rating > 0 ? `${rating}점` : "별점을 선택해주세요"}
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">어떤 점이 좋았나요?</h3>
              <span className="text-xs bg-slate-800 text-white px-2 py-0.5 rounded-full">필수</span>
            </div>
            <p className="text-sm text-muted-foreground">이 곳에 어울리는 키워드를 골라주세요 (1개~5개)</p>

            {/* 스타일 카테고리 */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-700 mb-2">스타일</div>
              <div className="grid grid-cols-2 gap-3">
                {reviewTags.style.map((tag) => {
                  const Icon = tag.icon
                  return (
                    <button
                      key={tag.text}
                      onClick={() => toggleTag(tag.text)}
                      className={`p-3 rounded-lg text-sm font-medium text-left transition-colors border flex items-center gap-2 ${
                        selectedTags.includes(tag.text)
                          ? "bg-pink-50 border-pink-200 text-pink-700"
                          : "bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tag.text}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 시술/서비스 카테고리 */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-700 mb-2">시술/서비스</div>
              <div className="grid grid-cols-2 gap-3">
                {reviewTags.service.map((tag) => {
                  const Icon = tag.icon
                  return (
                    <button
                      key={tag.text}
                      onClick={() => toggleTag(tag.text)}
                      className={`p-3 rounded-lg text-sm font-medium text-left transition-colors border flex items-center gap-2 ${
                        selectedTags.includes(tag.text)
                          ? "bg-pink-50 border-pink-200 text-pink-700"
                          : "bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tag.text}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Text Review */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">자세한 후기를 남겨주세요</h3>
            <Textarea
              placeholder="시설을 이용하며 느낀 점을 자유롭게 작성해주세요. (접근성, 청결 상태, 안전성 등)"
              className="min-h-[150px] resize-none p-4"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full h-12 text-lg bg-gradient-to-r from-pink-500 to-purple-600"
            disabled={isSubmitting || rating === 0 || selectedTags.length === 0 || !content.trim()}
          >
            {isSubmitting ? "저장 중..." : reviewId ? "리뷰 수정하기" : "리뷰 제출하기"}
          </Button>
        </div>
        </div>
      </div>
    </div>
  )
}
