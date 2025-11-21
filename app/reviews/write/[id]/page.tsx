"use client"

import { useState, use } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { facilities } from "@/lib/data"
import { Star, MapPin, Phone, Clock } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function WriteReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const facility = facilities.find((f) => f.id === id)
  const [rating, setRating] = useState(0)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  if (!facility) return <div>Facility not found</div>

  const reviewTags = [
    "진입로 평탄해요",
    "휠체어 출입",
    "안내 표지판 있어요",
    "장애인 화장실",
    "보드라운 바닥재",
    "경사로 설치되어 있어요",
    "보조기구 빌려줘요",
    "점자 안내 필요해요",
  ]

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleSubmit = () => {
    alert("리뷰가 등록되었습니다!")
    router.push("/mypage")
  }

  return (
    <div className="container py-12 max-w-3xl">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Facility Info Header */}
        <div className="p-6 border-b flex gap-6">
          <div className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
            <Image src={facility.image || "/placeholder.svg"} alt={facility.name} fill className="object-cover" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">{facility.name}</h1>
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

            <div className="grid grid-cols-2 gap-3">
              {reviewTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`p-3 rounded-lg text-sm font-medium text-left transition-colors border ${
                    selectedTags.includes(tag)
                      ? "bg-pink-50 border-pink-200 text-pink-700"
                      : "bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {/* Mock Icons based on text content could go here */}
                  <span className="mr-2">👍</span> {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Text Review */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">자세한 후기를 남겨주세요</h3>
            <Textarea
              placeholder="시설을 이용하며 느낀 점을 자유롭게 작성해주세요. (접근성, 청결 상태, 안전성 등)"
              className="min-h-[150px] resize-none p-4"
            />
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full h-12 text-lg bg-gradient-to-r from-pink-500 to-purple-600"
            disabled={rating === 0 || selectedTags.length === 0}
          >
            리뷰 제출하기
          </Button>
        </div>
      </div>
    </div>
  )
}
