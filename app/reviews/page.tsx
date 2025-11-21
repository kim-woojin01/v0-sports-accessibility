"use client"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin, Star, PenSquare, ChevronLeft, ChevronRight } from "lucide-react"
import { facilities, reviews } from "@/lib/data"
import Image from "next/image"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function ReviewsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredFacilities, setFilteredFacilities] = useState(facilities)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showWriteableOnly, setShowWriteableOnly] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const [pageBlock, setPageBlock] = useState(0)

  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem("user")
    setIsLoggedIn(!!user)
  }, [])

  const handleSearch = () => {
    let results = facilities
    if (searchQuery) {
      results = results.filter((f) => f.name.includes(searchQuery) || f.address.includes(searchQuery))
    }
    setFilteredFacilities(results)
    setCurrentPage(1)
  }

  const handleWriteReviewFilter = () => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 서비스입니다.")
      return
    }
    setShowWriteableOnly(!showWriteableOnly)
    if (!showWriteableOnly) {
      setFilteredFacilities(facilities.filter((f) => f.id === "2"))
    } else {
      setFilteredFacilities(facilities)
    }
    setCurrentPage(1)
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

  const openReviewModal = (facilityId: string) => {
    setSelectedFacilityId(facilityId)
    setIsReviewModalOpen(true)
  }

  const selectedFacilityReviews = reviews.filter((r) => r.facilityId === selectedFacilityId)
  const selectedFacility = facilities.find((f) => f.id === selectedFacilityId)

  return (
    <div className="flex flex-col min-h-screen items-center w-full">
      <div className="bg-slate-50 py-12 border-b w-full">
        <div className="container text-center space-y-4 mx-auto max-w-screen-2xl">
          <h1 className="text-3xl font-bold">시설 리뷰</h1>
          <p className="text-muted-foreground">다른 사용자들의 생생한 이용 후기를 확인해보세요.</p>

          <div className="max-w-2xl mx-auto flex gap-2 mt-8">
            <Button
              variant={showWriteableOnly ? "default" : "outline"}
              className="h-12 px-4 gap-2"
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
              />
            </div>
            <Button className="h-12 px-8 bg-purple-600" onClick={handleSearch}>
              검색
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-12 max-w-5xl mx-auto">
        <div className="grid gap-6">
          {currentFacilities.map((facility) => (
            <div
              key={facility.id}
              className="bg-white rounded-xl border shadow-sm p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow"
            >
              <div className="relative w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
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
                    <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-bold">{facility.rating}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs bg-transparent"
                      onClick={() => openReviewModal(facility.id)}
                    >
                      리뷰 보기
                    </Button>
                    {showWriteableOnly && (
                      <Link href={`/reviews/write/${facility.id}`}>
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                          리뷰 작성
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{facility.description}</p>
                <div className="flex gap-2">
                  {facility.features.slice(0, 4).map((f) => (
                    <span key={f} className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 0 && (
          <div className="flex justify-center items-center mt-12 gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
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
              className="w-8 h-8"
              onClick={handleNextBlock}
              disabled={(pageBlock + 1) * 5 >= totalPages}
            >
              <ChevronRight className="w-4 h-4" />
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
            {selectedFacilityReviews.length > 0 ? (
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
