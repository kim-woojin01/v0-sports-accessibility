"use client"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin, Star, PenSquare, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import LoadingSpinner from "@/components/loading-spinner"

// 시설 ID에서 숫자 부분만 추출하는 헬퍼 함수
// "accessible-123" -> 123, 123 -> 123
function extractFacilityId(facilityId: number | string): number {
  if (typeof facilityId === 'number') {
    return facilityId
  }
  
  // 문자열인 경우 "accessible-123" 형식에서 숫자 부분 추출
  const match = facilityId.toString().match(/(\d+)$/)
  if (match) {
    return Number(match[1])
  }
  
  // 숫자만 있는 경우
  const num = Number(facilityId)
  return isNaN(num) ? 0 : num
}

// 시설 유형에 맞는 고품질 이미지 URL을 반환하는 함수
function getFacilityImage(facilityName: string, features: string[] = []): string {
  const name = facilityName.toLowerCase()
  const featuresStr = features.join(' ').toLowerCase()

  // 수영장
  if (featuresStr.includes('수영장') || name.includes('수영')) {
    return 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop&q=80'
  }
  
  // 헬스장/체력단련장
  if (featuresStr.includes('헬스장') || name.includes('헬스') || name.includes('체력') || name.includes('피트니스')) {
    return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop&q=80'
  }
  
  // 체육관
  if (name.includes('체육관') || name.includes('체육관')) {
    return 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&h=600&fit=crop&q=80'
  }
  
  // 운동장
  if (name.includes('운동장') || name.includes('경기장') || name.includes('스타디움')) {
    return 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop&q=80'
  }
  
  // 복합시설 (여러 features가 있거나 이름에 복합, 센터가 포함)
  if (features.length > 2 || name.includes('복합') || name.includes('센터') || name.includes('종합')) {
    return 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop&q=80'
  }
  
  // 재활/물리치료
  if (name.includes('재활') || name.includes('물리') || featuresStr.includes('재활')) {
    return 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80'
  }
  
  // 장애인 전용 시설
  if (name.includes('장애인') || featuresStr.includes('장애인')) {
    return 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop&q=80'
  }
  
  // 기본 체육시설 이미지
  return 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&h=600&fit=crop&q=80'
}

type Facility = {
  id: number | string
  name: string
  address?: string
  image?: string
  rating?: number
  description?: string
  features?: string[]
  reviewCount?: number // 리뷰 수 추가
}

type Review = {
  id: number
  facilityId: number
  userId: number
  userName: string
  rating: number
  content: string
  date: string
  tags: string[]
}

export default function ReviewsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showWriteableOnly, setShowWriteableOnly] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const [pageBlock, setPageBlock] = useState(0)

  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [selectedFacilityReviews, setSelectedFacilityReviews] = useState<Review[]>([])
  const [isReviewsLoading, setIsReviewsLoading] = useState(false)
  const [usageHistory, setUsageHistory] = useState<any[]>([]) // 이용 내역 저장

  useEffect(() => {
    const user = localStorage.getItem("user")
    setIsLoggedIn(!!user)

    const loadFacilities = async () => {
      setIsLoading(true)
      try {
        // 시설 목록 조회
        const res = await fetch("/api/facilities")
        if (!res.ok) throw new Error("시설 조회 실패")
        const facilitiesData = await res.json()

        // 전체 리뷰 조회 (시설별 평점 계산용)
        const reviewsRes = await fetch("/api/reviews")
        const allReviews = reviewsRes.ok ? await reviewsRes.json() : []

        // 시설별 리뷰 통계 계산
        const reviewStats = new Map<number, { count: number; avgRating: number; sum: number }>()
        allReviews.forEach((review: any) => {
          const facilityId = extractFacilityId(review.facilityId)
          if (!reviewStats.has(facilityId)) {
            reviewStats.set(facilityId, { count: 0, avgRating: 0, sum: 0 })
          }
          const stats = reviewStats.get(facilityId)!
          stats.count++
          stats.sum = (stats.sum || 0) + review.rating
          stats.avgRating = stats.sum / stats.count
        })

        const mapped: Facility[] = facilitiesData.map((item: any) => {
          const numericFacilityId = extractFacilityId(item.id)
          const stats = reviewStats.get(numericFacilityId)
          // 시설 이미지 결정: DB에 이미지가 있으면 사용, 없으면 유형에 맞는 이미지 할당
          const facilityImage = item.image && item.image !== '/placeholder.svg' && item.image !== ''
            ? item.image
            : getFacilityImage(item.name, item.features || [])
          
          return {
            id: item.id,
            name: item.name,
            address: item.address ?? "",
            image: facilityImage,
            rating: stats ? Number(stats.avgRating.toFixed(1)) : 0,
            description: item.description ?? "",
            features: item.features ?? [],
            reviewCount: stats?.count || 0, // 리뷰 수 추가
          }
        })

        setFacilities(mapped)
        setFilteredFacilities(mapped)
      } catch (e) {
        console.error("리뷰 페이지 시설 로드 오류:", e)
        setFacilities([])
        setFilteredFacilities([])
      } finally {
        setIsLoading(false)
      }
    }

    loadFacilities()
  }, [])

  // URL 쿼리 파라미터에서 facilityId를 읽어서 자동으로 리뷰 모달 열기
  useEffect(() => {
    const facilityIdParam = searchParams.get('facilityId')
    if (facilityIdParam && !isLoading && facilities.length > 0 && !isReviewModalOpen) {
      const numericId = extractFacilityId(facilityIdParam)
      if (numericId && numericId !== 0) {
        // 시설이 로드된 후 모달 열기
        setSelectedFacilityId(numericId)
        setIsReviewModalOpen(true)
        setIsReviewsLoading(true)

        // 리뷰 데이터 로드
        fetch(`/api/reviews?facilityId=${numericId}`)
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data)) {
              setSelectedFacilityReviews(data)
            } else {
              setSelectedFacilityReviews([])
            }
          })
          .catch((e) => {
            console.error("시설 리뷰 로드 오류:", e)
            setSelectedFacilityReviews([])
          })
          .finally(() => {
            setIsReviewsLoading(false)
          })

        // URL에서 쿼리 파라미터 제거
        const newParams = new URLSearchParams(searchParams.toString())
        newParams.delete('facilityId')
        router.replace(`/reviews?${newParams.toString()}`, { scroll: false })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isLoading, facilities, isReviewModalOpen])

  const handleSearch = () => {
    // showWriteableOnly가 true이면 현재 필터링된 시설 기준으로 검색
    let baseResults = showWriteableOnly ? filteredFacilities : facilities
    
    if (searchQuery.trim() !== "") {
      const q = searchQuery.trim().toLowerCase()
      baseResults = baseResults.filter((f) => {
        const name = f.name.toLowerCase()
        const address = (f.address ?? "").toLowerCase()
        return name.includes(q) || address.includes(q)
      })
    }
    setFilteredFacilities(baseResults)
    setCurrentPage(1)
    setPageBlock(0)
  }

  const handleWriteReviewFilter = async () => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 서비스입니다.")
      return
    }

    const userStr = localStorage.getItem("user")
    if (!userStr) {
      alert("로그인 정보를 찾을 수 없습니다.")
      return
    }

    let user
    try {
      user = JSON.parse(userStr)
    } catch (e) {
      console.error("사용자 정보 파싱 오류:", e)
      alert("사용자 정보를 불러올 수 없습니다.")
      return
    }

    if (!user || !user.id) {
      console.error("사용자 ID가 없습니다:", user)
      alert("사용자 정보가 올바르지 않습니다.")
      return
    }

    const userId = Number(user.id)
    if (!userId || isNaN(userId)) {
      console.error("유효하지 않은 사용자 ID:", user.id)
      alert("사용자 ID가 올바르지 않습니다.")
      return
    }

    if (!showWriteableOnly) {
      // 켜는 경우: 내가 이용한 시설만 조회
      console.log("이용 내역 조회 시작 - userId:", userId)
      try {
        const res = await fetch(`/api/usage?userId=${userId}`)
        console.log("이용 내역 API 응답 상태:", res.status, res.statusText)
        const data = await res.json()
        console.log("이용 내역 API 응답 데이터:", data)

        // API가 빈 배열을 반환하거나 에러 객체를 반환할 수 있음
        if (Array.isArray(data)) {
          if (data.length === 0) {
            alert("이용한 시설이 없습니다. 먼저 시설을 이용해주세요.")
            return
          }

          console.log("이용한 시설 개수:", data.length)
          
          if (data.length === 0) {
            alert("리뷰를 작성할 수 있는 이용 내역이 없습니다.")
            setShowWriteableOnly(false)
            setFilteredFacilities(facilities)
            return
          }

          // 이용 내역 저장
          setUsageHistory(data)

          // 이용한 시설 ID 목록 (중복 제거, 숫자로 변환)
          const facilityIds = new Set(data.map((f: any) => Number(f.id)))
          console.log("이용한 시설 ID 목록:", Array.from(facilityIds))
          console.log("전체 시설 개수:", facilities.length)
          console.log("전체 시설 ID 샘플:", facilities.slice(0, 5).map(f => f.id))
          
          // 전체 시설 목록에서 이용한 시설만 필터링
          const results = facilities.filter((f) => {
            const facilityId = Number(f.id)
            const isIncluded = facilityIds.has(facilityId)
            if (!isIncluded) {
              console.log(`시설 ID ${facilityId} (${f.name})는 이용 내역에 없음`)
            }
            return isIncluded
          })
          console.log("필터링된 시설 개수:", results.length)
          console.log("필터링된 시설 목록:", results.map(f => `${f.id}: ${f.name}`))

          if (results.length === 0) {
            alert("이용한 시설이 목록에 없습니다.")
            setShowWriteableOnly(false)
            setFilteredFacilities(facilities)
            return
          }

          // 필터링된 시설로 설정
          setFilteredFacilities(results)
          setShowWriteableOnly(true)
          setCurrentPage(1)
          setPageBlock(0)
          
          // 검색어 초기화 (필터 모드에서는 검색어를 초기화)
          setSearchQuery("")
        } else {
          console.error("이용 내역 조회 실패:", data)
          alert("이용 내역을 불러오는 중 오류가 발생했습니다.")
        }
      } catch (e) {
        console.error("이용 내역 기반 시설 조회 오류:", e)
        alert("이용 내역을 불러오는 중 오류가 발생했습니다.")
      }
    } else {
      // 끄는 경우: 전체 시설로 복원
      setFilteredFacilities(facilities)
      setShowWriteableOnly(false)
      setUsageHistory([]) // 이용 내역 초기화
      setCurrentPage(1)
      setPageBlock(0)
      setSearchQuery("") // 검색어 초기화
    }
  }

  const totalPages = Math.ceil(filteredFacilities.length / itemsPerPage)
  const currentFacilities = filteredFacilities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleNextBlock = () => {
    if ((pageBlock + 1) * 5 < totalPages) {
      setPageBlock(pageBlock + 1)
      setCurrentPage((pageBlock + 1) * 5 + 1)
    }
  }

  const handlePrevBlock = () => {
    if (pageBlock > 0) {
      setPageBlock(pageBlock - 1)
      setCurrentPage((pageBlock - 1) * 5 + 1)
    }
  }

  const openReviewModal = async (facilityId: number | string) => {
    const numericId = extractFacilityId(facilityId)
    if (!numericId || numericId === 0) {
      console.error('유효하지 않은 시설 ID:', facilityId)
      return
    }
    setSelectedFacilityId(numericId)
    setIsReviewModalOpen(true)
    setIsReviewsLoading(true)

    try {
      const res = await fetch(`/api/reviews?facilityId=${numericId}`)
      const data = await res.json()
      
      // API가 빈 배열을 반환하거나 에러 객체를 반환할 수 있음
      if (Array.isArray(data)) {
        setSelectedFacilityReviews(data)
        if (data.length === 0) {
          console.log(`시설 ID ${numericId}에 대한 리뷰가 없습니다.`)
        }
      } else {
        console.error("리뷰 조회 실패:", data)
        setSelectedFacilityReviews([])
      }
    } catch (e) {
      console.error("시설 리뷰 로드 오류:", e)
      setSelectedFacilityReviews([])
    } finally {
      setIsReviewsLoading(false)
    }
  }

  const selectedFacility = facilities.find((f) => String(f.id) === String(selectedFacilityId))

  return (
    <div className="flex flex-col min-h-screen items-center w-full">
      <div className="bg-slate-50 py-12 border-b w-full">
        <div className="container text-center space-y-4 mx-auto max-w-screen-2xl">
          <h1 className="text-3xl font-bold">시설 리뷰</h1>
          <p className="text-muted-foreground">다른 사용자들의 생생한 이용 후기를 확인해보세요.</p>

          <div className="max-w-2xl mx-auto flex gap-2 mt-8">
            <Button
              variant={showWriteableOnly ? "default" : "outline"}
              className={`h-12 px-4 gap-2 ${
                showWriteableOnly 
                  ? 'bg-purple-400 hover:bg-purple-500 text-white' 
                  : 'border-purple-300 text-purple-400 hover:bg-purple-50'
              }`}
              onClick={handleWriteReviewFilter}
            >
              <PenSquare className="w-4 h-4" />
              리뷰 작성하기
            </Button>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="시설명 또는 지역으로 검색"
                className="pl-10 h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch()
                  }
                }}
              />
            </div>
            <Button className="h-12 px-8 bg-purple-600" onClick={handleSearch}>
              검색
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-12 max-w-5xl mx-auto">
        {isLoading ? (
          <LoadingSpinner message="시설 목록을 불러오는 중입니다..." />
        ) : (
          <div className="grid gap-6">
            {currentFacilities.map((facility) => (
            <div
              key={facility.id}
              className="bg-white rounded-xl border shadow-sm p-7 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow min-h-[180px]"
            >
              <div className="relative w-full md:w-48 h-36 rounded-lg overflow-hidden flex-shrink-0">
                <Image src={facility.image || "/placeholder.svg"} alt={facility.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-xl mb-1">{facility.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <MapPin className="w-4 h-4" />
                      {facility.address}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {facility.rating && facility.rating > 0 ? (
                      <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-3 py-1 rounded-full">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-bold">{facility.rating}</span>
                        {facility.reviewCount !== undefined && facility.reviewCount > 0 && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({facility.reviewCount}개 후기)
                          </span>
                        )}
                      </div>
                    ) : null}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs bg-transparent"
                      onClick={() => openReviewModal(facility.id)}
                    >
                      리뷰 보기
                    </Button>
                    {showWriteableOnly && (() => {
                      // 해당 시설의 이용 내역 찾기
                      const usage = usageHistory.find((u: any) => u.id === facility.id)
                      const usageId = usage?.usage_id
                      return (
                        <Link href={`/reviews/write/${facility.id}${usageId ? `?usageId=${usageId}` : ''}`}>
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                            리뷰 작성
                          </Button>
                        </Link>
                      )
                    })()}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{facility.description}</p>
                <div className="flex gap-2">
                  {(facility.features || []).slice(0, 4).map((f) => (
                    <span key={f} className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        {!isLoading && totalPages > 0 && (
          <div className="flex justify-center items-center mt-12 gap-2">
            {/* 맨 처음 버튼 */}
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 border border-gray-300"
              onClick={() => {
                setCurrentPage(1)
                setPageBlock(0)
              }}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              <ChevronLeft className="w-4 h-4 -ml-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 border border-gray-300"
              onClick={handlePrevBlock}
              disabled={pageBlock === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: 5 }, (_, i) => pageBlock * 5 + i + 1)
              .filter((page) => page <= totalPages)
              .map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "ghost"}
                  size="icon"
                  className={`w-8 h-8 ${currentPage === page ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              ))}
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 border border-gray-300"
              onClick={handleNextBlock}
              disabled={(pageBlock + 1) * 5 >= totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            {/* 맨 끝 버튼 */}
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 border border-gray-300"
              onClick={() => {
                setCurrentPage(totalPages)
                setPageBlock(Math.floor((totalPages - 1) / 5))
              }}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
              <ChevronRight className="w-4 h-4 -ml-3" />
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedFacility?.name} 리뷰</DialogTitle>
            <DialogDescription>{selectedFacility?.address}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {isReviewsLoading ? (
              <LoadingSpinner message="리뷰를 불러오는 중입니다..." className="min-h-[200px]" />
            ) : selectedFacilityReviews.length > 0 ? (
              selectedFacilityReviews.map((review) => (
                <div key={review.id} className="border-b pb-6 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">
                        {review.userName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{review.userName}</div>
                        <div className="text-xs text-muted-foreground">{review.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-bold text-sm">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 mb-3">{review.content}</p>
                  <div className="flex flex-wrap gap-2">
                    {review.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">등록된 리뷰가 없습니다.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
