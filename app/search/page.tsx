"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  MapPin,
  Calendar,
  SlidersHorizontal,
  SearchIcon,
  Star,
  Phone,
  Clock,
  ChevronLeft,
  ChevronRight,
  Crosshair,
} from "lucide-react"
import { facilities } from "@/lib/data"
import Link from "next/link"
import { useRouter } from "next/navigation"

const regionData: Record<string, string[]> = {
  서울특별시: ["강남구", "송파구", "서초구", "강동구", "마포구", "영등포구", "종로구", "중구"],
  경기도: ["수원시", "성남시", "고양시", "용인시", "부천시", "안산시", "안양시"],
  충청북도: ["청주시", "충주시", "제천시"],
  부산광역시: ["해운대구", "수영구", "남구", "동래구"],
}

export default function SearchPage() {
  const router = useRouter()
  const [isRegionOpen, setIsRegionOpen] = useState(false)
  const [isDateOpen, setIsDateOpen] = useState(false)
  const [isFacilityOpen, setIsFacilityOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Mock states for filters
  const [selectedRegion, setSelectedRegion] = useState("지역")
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)

  const [selectedDate, setSelectedDate] = useState("이용날짜/시간")
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredFacilities, setFilteredFacilities] = useState(facilities)

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedHour, setSelectedHour] = useState(12)
  const [selectedMinute, setSelectedMinute] = useState(0)
  const [selectedAmPm, setSelectedAmPm] = useState("PM")
  const [tempSelectedDate, setTempSelectedDate] = useState<Date | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const [pageBlock, setPageBlock] = useState(0) // 0 for 1-5, 1 for 6-10

  useEffect(() => {
    const user = localStorage.getItem("user")
    setIsLoggedIn(!!user)
  }, [])

  const handleSearch = () => {
    let results = facilities

    if (searchQuery) {
      const query = searchQuery.toLowerCase().replace(/\s+/g, "")
      results = results.filter(
        (f) =>
          f.name.toLowerCase().replace(/\s+/g, "").includes(query) ||
          f.address.toLowerCase().replace(/\s+/g, "").includes(query) ||
          f.features.some((feat) => feat.toLowerCase().includes(query)),
      )
    }

    if (selectedRegion !== "지역") {
      const regionFilter = selectedDistrict || selectedCity || selectedRegion
      if (regionFilter && regionFilter !== "지역") {
        results = results.filter((f) => f.address.includes(regionFilter))
      }
    }

    if (selectedFacilities.length > 0) {
      results = results.filter((f) => selectedFacilities.every((sf) => f.features.includes(sf)))
    }

    setFilteredFacilities(results)
    setCurrentPage(1) // Reset to first page
    setIsRegionOpen(false)
    setIsDateOpen(false)
    setIsFacilityOpen(false)
  }

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentDate)
    newDate.setDate(day)
    setTempSelectedDate(newDate)
  }

  const confirmDateSelection = () => {
    if (tempSelectedDate) {
      const formattedDate = `${tempSelectedDate.getFullYear()}년 ${tempSelectedDate.getMonth() + 1}월 ${tempSelectedDate.getDate()}일 ${selectedHour}:${selectedMinute.toString().padStart(2, "0")} ${selectedAmPm}`
      setSelectedDate(formattedDate)
      setIsDateOpen(false)
    }
  }

  const nextMonth = () => {
    const next = new Date(currentDate)
    next.setMonth(next.getMonth() + 1)
    const oneYearLater = new Date()
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1)
    if (next <= oneYearLater) {
      setCurrentDate(next)
    }
  }

  const prevMonth = () => {
    const prev = new Date(currentDate)
    prev.setMonth(prev.getMonth() - 1)
    const today = new Date()
    if (prev >= today || (prev.getMonth() === today.getMonth() && prev.getFullYear() === today.getFullYear())) {
      setCurrentDate(prev)
    }
  }

  const hasVisited = (facilityId: string) => {
    return facilityId === "2"
  }

  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          alert(`현재 위치: 위도 ${position.coords.latitude}, 경도 ${position.coords.longitude}`)
          // In a real app, this would update the map center
        },
        (error) => {
          alert("위치 정보를 가져올 수 없습니다.")
        },
      )
    } else {
      alert("이 브라우저에서는 위치 서비스를 지원하지 않습니다.")
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

  return (
    <div className="flex flex-col min-h-screen items-center w-full">
      {/* Map Section */}
      <div className="relative w-full h-[400px] bg-slate-200">
        <Image src="/map-street-view.jpg" alt="Map" fill className="object-cover" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
            <div className="absolute -top-10 -left-10 bg-white px-3 py-1 rounded-lg shadow-md text-xs font-bold whitespace-nowrap">
              현재 위치
            </div>
          </div>
        </div>
        <Button
          variant="secondary"
          size="icon"
          className="absolute bottom-4 right-4 rounded-full shadow-lg bg-white hover:bg-slate-100"
          onClick={handleMyLocation}
        >
          <Crosshair className="w-6 h-6 text-slate-700" />
        </Button>
      </div>

      {/* Search Filter Bar */}
      <div className="sticky top-16 z-40 bg-white border-b shadow-sm w-full">
        <div className="container py-4 mx-auto max-w-screen-2xl">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-center">
            {/* Facility Name Search */}
            <div className="relative w-full lg:w-64">
              <Input
                placeholder="시설명 검색하기"
                className="pl-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Region Filter */}
            <div className="relative w-full lg:w-auto">
              <Button
                variant="outline"
                className="w-full lg:w-48 justify-between bg-transparent"
                onClick={() => {
                  setIsRegionOpen(!isRegionOpen)
                  setIsDateOpen(false)
                  setIsFacilityOpen(false)
                }}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedDistrict || selectedCity || "지역"}</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${isRegionOpen ? "rotate-90" : ""}`} />
              </Button>

              {isRegionOpen && (
                <div className="absolute top-full left-0 mt-2 w-[600px] bg-white rounded-lg shadow-xl border p-4 z-50 flex gap-4 h-80">
                  <div className="w-1/3 border-r overflow-y-auto">
                    <div className="p-2 font-bold text-sm text-muted-foreground mb-2">시/도 (다중선택 가능)</div>
                    {Object.keys(regionData).map((city) => (
                      <div
                        key={city}
                        className={`p-2 hover:bg-slate-100 cursor-pointer flex items-center gap-2 ${
                          selectedCity === city ? "bg-purple-50 text-purple-700 font-medium" : ""
                        }`}
                        onClick={() => {
                          setSelectedCity(city)
                          setSelectedDistrict(null)
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCity === city}
                          readOnly
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        {city}
                      </div>
                    ))}
                  </div>
                  <div className="w-1/3 border-r overflow-y-auto">
                    <div className="p-2 font-bold text-sm text-muted-foreground mb-2">시/군/구 (다중선택 가능)</div>
                    {selectedCity &&
                      regionData[selectedCity]?.map((district) => (
                        <div
                          key={district}
                          className={`p-2 hover:bg-slate-100 cursor-pointer flex items-center gap-2 ${
                            selectedDistrict === district ? "bg-purple-50 text-purple-700 font-medium" : ""
                          }`}
                          onClick={() => {
                            setSelectedDistrict(district)
                            setSelectedRegion(`${selectedCity} ${district}`)
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedDistrict === district}
                            readOnly
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          {district}
                        </div>
                      ))}
                  </div>
                  <div className="w-1/3 overflow-y-auto">
                    <div className="p-2 font-bold text-sm text-muted-foreground mb-2">선택 지역</div>
                    {selectedCity && selectedDistrict && (
                      <div className="p-2 text-sm">
                        ({selectedCity}){selectedDistrict}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Date/Time Filter */}
            <div className="relative w-full lg:w-auto">
              <Button
                variant="outline"
                className="w-full lg:w-48 justify-between bg-transparent"
                onClick={() => {
                  setIsDateOpen(!isDateOpen)
                  setIsRegionOpen(false)
                  setIsFacilityOpen(false)
                }}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{selectedDate === "이용날짜/시간" ? "이용날짜/시간" : selectedDate.split(" ")[0] + "..."}</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${isDateOpen ? "rotate-90" : ""}`} />
              </Button>

              {isDateOpen && (
                <div className="absolute top-full left-0 mt-2 w-[350px] bg-white rounded-lg shadow-xl border p-4 z-50">
                  <div className="flex justify-between items-center mb-4">
                    <Button variant="ghost" size="sm" onClick={prevMonth}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="text-center font-bold">
                      {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                    </div>
                    <Button variant="ghost" size="sm" onClick={nextMonth}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-7 gap-2 text-center text-sm mb-4">
                    {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
                      <div key={d} className="text-muted-foreground">
                        {d}
                      </div>
                    ))}
                    {Array.from({
                      length: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate(),
                    }).map((_, i) => {
                      const day = i + 1
                      const isSelected =
                        tempSelectedDate?.getDate() === day && tempSelectedDate?.getMonth() === currentDate.getMonth()
                      return (
                        <div
                          key={i}
                          className={`p-2 rounded-full hover:bg-slate-100 cursor-pointer ${
                            isSelected ? "bg-purple-600 text-white hover:bg-purple-700" : ""
                          }`}
                          onClick={() => handleDateClick(day)}
                        >
                          {day}
                        </div>
                      )
                    })}
                  </div>
                  <div className="border-t pt-4 space-y-4">
                    <div className="flex justify-center items-center gap-2">
                      <select
                        className="border rounded p-1"
                        value={selectedAmPm}
                        onChange={(e) => setSelectedAmPm(e.target.value)}
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                      <select
                        className="border rounded p-1"
                        value={selectedHour}
                        onChange={(e) => setSelectedHour(Number(e.target.value))}
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                      <span>:</span>
                      <select
                        className="border rounded p-1"
                        value={selectedMinute}
                        onChange={(e) => setSelectedMinute(Number(e.target.value))}
                      >
                        {[0, 10, 20, 30, 40, 50].map((m) => (
                          <option key={m} value={m}>
                            {m.toString().padStart(2, "0")}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button className="w-full bg-purple-600" onClick={confirmDateSelection}>
                      선택 완료
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Facilities Filter */}
            <div className="relative w-full lg:w-auto">
              <Button
                variant="outline"
                className="w-full lg:w-48 justify-between bg-transparent"
                onClick={() => {
                  setIsFacilityOpen(!isFacilityOpen)
                  setIsRegionOpen(false)
                  setIsDateOpen(false)
                }}
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>편의시설</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${isFacilityOpen ? "rotate-90" : ""}`} />
              </Button>

              {isFacilityOpen && (
                <div className="absolute top-full left-0 mt-2 w-[400px] bg-white rounded-lg shadow-xl border p-4 z-50">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      "엘리베이터",
                      "주차장",
                      "경사로",
                      "점자 안내",
                      "음성 안내",
                      "휠체어 대여",
                      "장애인 전용 화장실",
                      "장애인 전용 주차장",
                    ].map((item) => (
                      <label key={item} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          checked={selectedFacilities.includes(item)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFacilities([...selectedFacilities, item])
                            } else {
                              setSelectedFacilities(selectedFacilities.filter((f) => f !== item))
                            }
                          }}
                        />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search Button */}
            <Button
              className="w-full lg:w-auto bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full p-3"
              onClick={handleSearch}
            >
              <SearchIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="container py-12 max-w-5xl mx-auto">
        <div className="space-y-6">
          {currentFacilities.map((facility) => (
            <div
              key={facility.id}
              className="bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row">
                <div className="relative w-full md:w-72 h-48 md:h-auto">
                  <Image src={facility.image || "/placeholder.svg"} alt={facility.name} fill className="object-cover" />
                </div>
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4 text-primary" />
                          <h3 className="font-bold text-xl">{facility.name}</h3>
                        </div>
                        <p className="text-muted-foreground text-sm mb-3">{facility.address}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-amber-500 mb-1">
                          <Star className="w-5 h-5 fill-current" />
                          <span className="font-bold text-lg">{facility.rating}</span>
                        </div>
                        {isLoggedIn && hasVisited(facility.id) ? (
                          <Link href={`/reviews/write/${facility.id}`}>
                            <Button size="sm" variant="outline" className="text-xs h-7 bg-transparent">
                              리뷰 작성하기
                            </Button>
                          </Link>
                        ) : (
                          <Link href="/reviews">
                            <span className="text-xs text-muted-foreground underline cursor-pointer">리뷰 보기</span>
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{facility.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{facility.hours}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-end mt-6">
                    <div className="flex gap-2">
                      {facility.features.slice(0, 3).map((feature) => (
                        <span key={feature} className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600">
                          {feature}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Congestion Indicator */}
                      {selectedDate !== "이용날짜/시간" ? (
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-muted-foreground mb-1">예측 혼잡도</span>
                          <div className="flex items-center gap-1">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                facility.congestion === "crowded"
                                  ? "bg-red-500"
                                  : facility.congestion === "moderate"
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                              }`}
                            ></div>
                            <span className="text-sm font-medium">
                              {facility.congestion === "crowded"
                                ? "혼잡"
                                : facility.congestion === "moderate"
                                  ? "보통"
                                  : "여유"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-muted-foreground mb-1">예측 혼잡도</span>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                            <span className="text-xs">이용 예정 시간 입력</span>
                          </div>
                        </div>
                      )}

                      {/* Real-time Congestion */}
                      <div className="ml-4 pl-4 border-l flex flex-col items-end">
                        <span className="text-xs text-muted-foreground mb-1">실시간</span>
                        <div className="flex items-center gap-1">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              facility.congestion === "crowded"
                                ? "bg-red-500"
                                : facility.congestion === "moderate"
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            }`}
                          ></div>
                          <span className="text-sm font-medium">
                            {facility.congestion === "crowded"
                              ? "혼잡"
                              : facility.congestion === "moderate"
                                ? "보통"
                                : "여유"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
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
    </div>
  )
}
