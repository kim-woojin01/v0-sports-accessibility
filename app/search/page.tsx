"use client"

import { useState } from "react"
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
} from "lucide-react"
import { facilities } from "@/lib/data"
import Link from "next/link"

export default function SearchPage() {
  const [isRegionOpen, setIsRegionOpen] = useState(false)
  const [isDateOpen, setIsDateOpen] = useState(false)
  const [isFacilityOpen, setIsFacilityOpen] = useState(false)

  // Mock states for filters
  const [selectedRegion, setSelectedRegion] = useState("지역")
  const [selectedDate, setSelectedDate] = useState("이용날짜/시간")
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Map Section */}
      <div className="relative w-full h-[400px] bg-slate-200">
        <Image src="/map-street-view.jpg" alt="Map" fill className="object-cover" />
        {/* User Location Marker Mock */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
            <div className="absolute -top-10 -left-10 bg-white px-3 py-1 rounded-lg shadow-md text-xs font-bold whitespace-nowrap">
              현재 위치
            </div>
          </div>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="sticky top-16 z-40 bg-white border-b shadow-sm">
        <div className="container py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-center">
            {/* Facility Name Search */}
            <div className="relative w-full lg:w-64">
              <Input placeholder="시설명 검색하기" className="pl-4" />
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
                  <span>{selectedRegion}</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${isRegionOpen ? "rotate-90" : ""}`} />
              </Button>

              {isRegionOpen && (
                <div className="absolute top-full left-0 mt-2 w-[600px] bg-white rounded-lg shadow-xl border p-4 z-50 flex gap-4 h-64">
                  <div className="w-1/3 border-r overflow-y-auto">
                    <div className="p-2 hover:bg-slate-100 cursor-pointer font-medium text-primary">서울특별시</div>
                    <div className="p-2 hover:bg-slate-100 cursor-pointer">경기도</div>
                    <div className="p-2 hover:bg-slate-100 cursor-pointer">충청북도</div>
                  </div>
                  <div className="w-1/3 border-r overflow-y-auto">
                    <div className="p-2 hover:bg-slate-100 cursor-pointer">강남구</div>
                    <div className="p-2 hover:bg-slate-100 cursor-pointer font-medium text-primary">송파구</div>
                    <div className="p-2 hover:bg-slate-100 cursor-pointer">서초구</div>
                  </div>
                  <div className="w-1/3 overflow-y-auto">
                    <div className="p-2 text-sm text-muted-foreground">잠실동</div>
                    <div className="p-2 text-sm text-muted-foreground">방이동</div>
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
                  <span>{selectedDate}</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${isDateOpen ? "rotate-90" : ""}`} />
              </Button>

              {isDateOpen && (
                <div className="absolute top-full left-0 mt-2 w-[350px] bg-white rounded-lg shadow-xl border p-4 z-50">
                  <div className="text-center font-bold mb-4">2025년 11월</div>
                  <div className="grid grid-cols-7 gap-2 text-center text-sm mb-4">
                    <div className="text-muted-foreground">S</div>
                    <div className="text-muted-foreground">M</div>
                    <div className="text-muted-foreground">T</div>
                    <div className="text-muted-foreground">W</div>
                    <div className="text-muted-foreground">T</div>
                    <div className="text-muted-foreground">F</div>
                    <div className="text-muted-foreground">S</div>
                    {/* Mock Calendar Days */}
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div
                        key={i}
                        className={`p-2 rounded-full hover:bg-slate-100 cursor-pointer ${i === 15 ? "bg-primary text-white hover:bg-primary" : ""}`}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <Button variant="ghost" size="sm">
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="font-bold">12 : 00 PM</span>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
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
                        <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search Button */}
            <Button className="w-full lg:w-auto bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full p-3">
              <SearchIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="container py-12 max-w-5xl">
        <div className="space-y-6">
          {facilities.map((facility) => (
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
                        {/* Review Button Logic: Mocked as if user visited facility 2 */}
                        {facility.id === "2" ? (
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

                      {/* Real-time Congestion (Always shown below or next to predictive) */}
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

        {/* Pagination */}
        <div className="flex justify-center mt-12 gap-2">
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="default" size="icon" className="w-8 h-8 bg-purple-600 rounded-full">
            1
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
            2
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
            3
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
            4
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
            5
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
