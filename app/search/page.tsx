"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import dynamic from "next/dynamic"
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
  Loader2,
} from "lucide-react"
import { facilities, type Facility } from "@/lib/data"
import Link from "next/link"

const FacilityMap = dynamic(() => import("@/components/facility-map"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-200 animate-pulse" />,
})

const regionData: Record<string, string[]> = {
  서울특별시: [
    "종로구",
    "중구",
    "용산구",
    "성동구",
    "광진구",
    "동대문구",
    "중랑구",
    "성북구",
    "강북구",
    "도봉구",
    "노원구",
    "은평구",
    "서대문구",
    "마포구",
    "양천구",
    "강서구",
    "구로구",
    "금천구",
    "영등포구",
    "동작구",
    "관악구",
    "서초구",
    "강남구",
    "송파구",
    "강동구",
  ],
  부산광역시: [
    "중구",
    "서구",
    "동구",
    "영도구",
    "부산진구",
    "동래구",
    "남구",
    "북구",
    "해운대구",
    "사하구",
    "금정구",
    "강서구",
    "연제구",
    "수영구",
    "사상구",
    "기장군",
  ],
  대구광역시: ["중구", "동구", "서구", "남구", "북구", "수성구", "달서구", "달성군", "군위군"],
  인천광역시: ["중구", "동구", "미추홀구", "연수구", "남동구", "부평구", "계양구", "서구", "강화군", "옹진군"],
  광주광역시: ["동구", "서구", "남구", "북구", "광산구"],
  대전광역시: ["동구", "중구", "서구", "유성구", "대덕구"],
  울산광역시: ["중구", "남구", "동구", "북구", "울주군"],
  세종특별자치시: [],
  경기도: [
    "수원시",
    "용인시",
    "고양시",
    "화성시",
    "성남시",
    "부천시",
    "남양주시",
    "안산시",
    "평택시",
    "안양시",
    "시흥시",
    "파주시",
    "김포시",
    "의정부시",
    "광주시",
    "하남시",
    "양주시",
    "광명시",
    "군포시",
    "오산시",
    "이천시",
    "안성시",
    "구리시",
    "포천시",
    "의왕시",
    "양평군",
    "여주시",
    "동두천시",
    "과천시",
    "가평군",
    "연천군",
  ],
  강원특별자치도: [
    "춘천시",
    "원주시",
    "강릉시",
    "동해시",
    "태백시",
    "속초시",
    "삼척시",
    "홍천군",
    "횡성군",
    "영월군",
    "평창군",
    "정선군",
    "철원군",
    "화천군",
    "양구군",
    "인제군",
    "고성군",
    "양양군",
  ],
  충청북도: ["청주시", "충주시", "제천시", "보은군", "옥천군", "영동군", "증평군", "진천군", "괴산군", "음성군", "단양군"],
  충청남도: ["천안시", "공주시", "보령시", "아산시", "서산시", "논산시", "계룡시", "당진시", "금산군", "부여군", "서천군", "청양군", "홍성군", "예산군", "태안군"],
  전북특별자치도: ["전주시", "군산시", "익산시", "정읍시", "남원시", "김제시", "완주군", "진안군", "무주군", "장수군", "임실군", "순창군", "고창군", "부안군"],
  전라남도: [
    "목포시",
    "여수시",
    "순천시",
    "나주시",
    "광양시",
    "담양군",
    "곡성군",
    "구례군",
    "고흥군",
    "보성군",
    "화순군",
    "장흥군",
    "강진군",
    "해남군",
    "영암군",
    "무안군",
    "함평군",
    "영광군",
    "장성군",
    "완도군",
    "진도군",
    "신안군",
  ],
  경상북도: [
    "포항시",
    "경주시",
    "김천시",
    "안동시",
    "구미시",
    "영주시",
    "영천시",
    "상주시",
    "문경시",
    "경산시",
    "의성군",
    "청송군",
    "영양군",
    "영덕군",
    "청도군",
    "고령군",
    "성주군",
    "칠곡군",
    "예천군",
    "봉화군",
    "울진군",
    "울릉군",
  ],
  경상남도: [
    "창원시",
    "진주시",
    "통영시",
    "사천시",
    "김해시",
    "밀양시",
    "거제시",
    "양산시",
    "의령군",
    "함안군",
    "창녕군",
    "고성군",
    "남해군",
    "하동군",
    "산청군",
    "함양군",
    "거창군",
    "합천군",
  ],
  제주특별자치도: ["제주시", "서귀포시"],
}

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 }

export default function SearchPage() {
  const [isRegionOpen, setIsRegionOpen] = useState(false)
  const [isDateOpen, setIsDateOpen] = useState(false)
  const [isFacilityOpen, setIsFacilityOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Mock states for filters
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)

  const [selectedDate, setSelectedDate] = useState("이용날짜/시간")
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>(facilities)

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedHour, setSelectedHour] = useState(12)
  const [selectedMinute, setSelectedMinute] = useState(0)
  const [selectedAmPm, setSelectedAmPm] = useState("PM")
  const [tempSelectedDate, setTempSelectedDate] = useState<Date | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const [pageBlock, setPageBlock] = useState(0) // 0 for 1-5, 1 for 6-10
  const initialCenter =
    facilities.length > 0 ? { lat: facilities[0].lat, lng: facilities[0].lng } : DEFAULT_CENTER
  const [mapCenter, setMapCenter] = useState(initialCenter)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const locationWatchId = useRef<number | null>(null)
  const hasCenteredOnUser = useRef(false)

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

    if (selectedProvince) {
      results = results.filter((f) => f.province === selectedProvince)
      if (selectedDistrict) {
        results = results.filter((f) => f.district === selectedDistrict)
      }
    }

    if (selectedFacilities.length > 0) {
      results = results.filter((f) => selectedFacilities.every((sf) => f.features.includes(sf)))
    }

    setFilteredFacilities(results)
    const firstResult = results[0]
    if (firstResult) {
      setMapCenter({ lat: firstResult.lat, lng: firstResult.lng })
    } else {
      setMapCenter(DEFAULT_CENTER)
    }
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

  useEffect(() => {
    if (!navigator.geolocation) {
      return
    }

    setIsLocating(true)
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setUserLocation(coords)
        setIsLocating(false)

        if (!hasCenteredOnUser.current) {
          setMapCenter(coords)
          hasCenteredOnUser.current = true
        }
      },
      () => {
        setIsLocating(false)
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
    )

    locationWatchId.current = watchId

    return () => {
      if (locationWatchId.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(locationWatchId.current)
      }
    }
  }, [setMapCenter])

  const handleMyLocation = () => {
    if (userLocation) {
      setMapCenter(userLocation)
      return
    }

    if (navigator.geolocation && !isLocating) {
      setIsLocating(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setUserLocation(coords)
          setMapCenter(coords)
          setIsLocating(false)
        },
        () => {
          alert("위치 정보를 가져올 수 없습니다.")
          setIsLocating(false)
        },
        { enableHighAccuracy: true, timeout: 10000 },
      )
    } else if (!navigator.geolocation) {
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
      <div className="relative w-full h-[420px] rounded-2xl overflow-hidden shadow-lg bg-slate-100">
        <FacilityMap facilities={filteredFacilities} center={mapCenter} userLocation={userLocation} />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-md text-sm font-medium text-slate-700">
          {userLocation ? "내 위치 기준으로 지도를 표시하고 있어요." : "검색 결과를 지도 아이콘으로 확인해보세요."}
        </div>
        <Button
          variant="secondary"
          size="icon"
          className="absolute bottom-4 right-4 rounded-full shadow-lg bg-white hover:bg-slate-100"
          onClick={handleMyLocation}
          disabled={isLocating}
          aria-label="현재 위치로 이동"
        >
          {isLocating ? <Loader2 className="w-5 h-5 animate-spin text-slate-700" /> : <Crosshair className="w-6 h-6 text-slate-700" />}
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
                  <span>{selectedDistrict || selectedProvince || "지역"}</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${isRegionOpen ? "rotate-90" : ""}`} />
              </Button>

              {isRegionOpen && (
                <div className="absolute top-full left-0 mt-2 w-[600px] bg-white rounded-lg shadow-xl border p-4 z-50 flex gap-4 h-80">
                  <div className="w-1/3 border-r overflow-y-auto">
                    <div className="p-2 font-bold text-sm text-muted-foreground mb-2">시/도 (다중선택 가능)</div>
                    {Object.keys(regionData).map((province) => {
                      const isSelectedProvince = selectedProvince === province
                      return (
                        <div
                          key={province}
                          className={`p-2 hover:bg-slate-100 cursor-pointer flex items-center gap-2 ${
                            isSelectedProvince ? "bg-purple-50 text-purple-700 font-medium" : ""
                          }`}
                          onClick={() => {
                            if (isSelectedProvince) {
                              setSelectedProvince(null)
                              setSelectedDistrict(null)
                            } else {
                              setSelectedProvince(province)
                              setSelectedDistrict(null)
                            }
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelectedProvince}
                            readOnly
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          {province}
                        </div>
                      )
                    })}
                  </div>
                  <div className="w-1/3 border-r overflow-y-auto">
                    <div className="p-2 font-bold text-sm text-muted-foreground mb-2">시/군/구 (다중선택 가능)</div>
                    {selectedProvince &&
                      regionData[selectedProvince]?.map((district) => {
                        const isSelectedDistrict = selectedDistrict === district
                        return (
                          <div
                            key={district}
                            className={`p-2 hover:bg-slate-100 cursor-pointer flex items-center gap-2 ${
                              isSelectedDistrict ? "bg-purple-50 text-purple-700 font-medium" : ""
                            }`}
                            onClick={() => {
                              if (isSelectedDistrict) {
                                setSelectedDistrict(null)
                              } else {
                                setSelectedDistrict(district)
                              }
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelectedDistrict}
                              readOnly
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            {district}
                          </div>
                        )
                      })}
                  </div>
                  <div className="w-1/3 overflow-y-auto">
                    <div className="p-2 font-bold text-sm text-muted-foreground mb-2">선택 지역</div>
                    {selectedProvince && (
                      <div className="p-2 text-sm">
                        {selectedProvince}
                        {selectedDistrict ? ` ${selectedDistrict}` : ""}
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

