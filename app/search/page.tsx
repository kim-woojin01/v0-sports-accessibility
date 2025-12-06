"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
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
  Heart,
} from "lucide-react"
import Link from "next/link"
import LoadingSpinner from "@/components/loading-spinner"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

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

// ✅ API 응답 + 기존 UI에 맞춘 Facility 타입
type CongestionCode = "crowded" | "moderate" | "leisure"

interface Facility {
  id: number | string
  name: string
  address?: string
  image?: string
  rating?: number
  phone?: string
  hours?: string
  congestion?: CongestionCode
  features?: string[]
  description?: string
  lat?: number
  lng?: number
  province?: string
  district?: string
  capacity?: number
  real_time_level?: "여유" | "보통" | "혼잡"
  real_time_percent?: number
  current_people?: number
  predicted_level?: "crowded" | "moderate" | "leisure"
  homepage?: string
}

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 }

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

// 주소에서 시/도, 시/군/구를 유추하는 헬퍼
function detectRegionFromAddress(address?: string): { province?: string; district?: string } {
  if (!address) return {}

  for (const [province, districts] of Object.entries(regionData)) {
    if (address.includes(province)) {
      let detectedDistrict: string | undefined
      for (const district of districts) {
        if (address.includes(district)) {
          detectedDistrict = district
          break
        }
      }
      return { province, district: detectedDistrict }
    }
  }

  return {}
}

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isRegionOpen, setIsRegionOpen] = useState(false)
  const [isDateOpen, setIsDateOpen] = useState(false)
  const [isFacilityOpen, setIsFacilityOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  // ✅ DB에서 가져온 전체 시설 리스트
  const [facilitiesData, setFacilitiesData] = useState<Facility[]>([])
  // ✅ 현재 필터/검색 결과
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [highlightCongestion, setHighlightCongestion] = useState(false)
  const [highlightSearch, setHighlightSearch] = useState(false)
  const [favoriteFacilities, setFavoriteFacilities] = useState<number[]>([])
  
  // 리뷰 모달 관련 상태
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [selectedFacilityReviews, setSelectedFacilityReviews] = useState<any[]>([])
  const [isReviewsLoading, setIsReviewsLoading] = useState(false)

  const [selectedProvince, setSelectedProvince] = useState<string | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)

  const [selectedDate, setSelectedDate] = useState("이용날짜/시간")
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null)
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedHour, setSelectedHour] = useState(12)
  const [selectedMinute, setSelectedMinute] = useState(0)
  const [selectedAmPm, setSelectedAmPm] = useState("PM")
  const [tempSelectedDate, setTempSelectedDate] = useState<Date | null>(null)

  // URL에서 페이지 번호 읽기
  const pageFromUrl = searchParams.get('page') ? Number(searchParams.get('page')) : 1
  const [currentPage, setCurrentPage] = useState(pageFromUrl)
  const itemsPerPage = 5
  const [pageBlock, setPageBlock] = useState(Math.floor((pageFromUrl - 1) / 5)) // 0 for 1-5, 1 for 6-10
  // ✅ 초기 지도 중심: 기본값 → 데이터 로드 후 useEffect에서 첫 시설로 이동
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const locationWatchId = useRef<number | null>(null)
  const hasCenteredOnUser = useRef(false)
  const isInitialLoad = useRef(true) // 초기 로드 여부 추적

  useEffect(() => {
    // URL 파라미터에서 혼잡도 하이라이트 확인
    const showCongestion = searchParams.get('highlight') === 'congestion'
    const showSearch = searchParams.get('highlight') === 'search'
    if (showCongestion) {
      setHighlightCongestion(true)
    } else {
      setHighlightCongestion(false)
    }
    if (showSearch) {
      setHighlightSearch(true)
    } else {
      setHighlightSearch(false)
    }
    
    // URL에서 페이지 번호 읽기
    const pageFromUrl = searchParams.get('page') ? Number(searchParams.get('page')) : 1
    if (pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl)
      setPageBlock(Math.floor((pageFromUrl - 1) / 5))
    }
  }, [searchParams, currentPage])

  // 즐겨찾기 목록 로드 함수
  const loadFavorites = async () => {
    if (!isLoggedIn) {
      setFavoriteFacilities([])
      return
    }

    const userStr = localStorage.getItem("user")
    if (!userStr) {
      setFavoriteFacilities([])
      return
    }

    try {
      const user = JSON.parse(userStr)
      if (!user || !user.id) {
        setFavoriteFacilities([])
        return
      }

      console.log('즐겨찾기 목록 로드 요청 - user_id:', user.id)
      const res = await fetch('/api/favorites', {
        headers: {
          'x-user-id': user.id.toString(),
        },
      })
      
      if (res.ok) {
        const data = await res.json()
        const facilityIds = (data.favorites || []).map((id: any) => Number(id))
        setFavoriteFacilities(facilityIds)
        console.log('즐겨찾기 로드 성공:', facilityIds)
      } else {
        const errorData = await res.json().catch(() => ({}))
        console.error('즐겨찾기 로드 실패:', res.status, res.statusText, errorData)
        setFavoriteFacilities([])
      }
    } catch (e) {
      console.error('즐겨찾기 로드 오류:', e)
      setFavoriteFacilities([])
    }
  }

  // 즐겨찾기 목록 로드
  useEffect(() => {
    if (isLoggedIn) {
      loadFavorites()
    }
  }, [isLoggedIn])

  // 페이지 클릭 시 하이라이트 제거
  useEffect(() => {
    const handleClick = () => {
      if (highlightCongestion || highlightSearch) {
        setHighlightCongestion(false)
        setHighlightSearch(false)
        const newParams = new URLSearchParams(searchParams.toString())
        newParams.delete('highlight')
        router.replace(`/search?${newParams.toString()}`, { scroll: false })
      }
    }

    if (highlightCongestion || highlightSearch) {
      // 약간의 지연 후 클릭 이벤트 리스너 추가 (초기 하이라이트 표시 후)
      const timer = setTimeout(() => {
        document.addEventListener('click', handleClick, { once: true })
      }, 100)
      return () => {
        clearTimeout(timer)
        document.removeEventListener('click', handleClick)
      }
    }
  }, [highlightCongestion, highlightSearch, searchParams, router])

  // 즐겨찾기 토글
  const toggleFavorite = async (facilityId: number) => {
    if (!isLoggedIn) {
      alert('로그인 가입 후 서비스 이용이 가능합니다.')
      return
    }

    const userStr = localStorage.getItem("user")
    if (!userStr) {
      alert('로그인 가입 후 서비스 이용이 가능합니다.')
      return
    }

    try {
      const user = JSON.parse(userStr)
      if (!user || !user.id) {
        alert('사용자 정보를 찾을 수 없습니다.')
        return
      }

      const isFavorite = favoriteFacilities.includes(facilityId)
      console.log('즐겨찾기 토글 - user_id:', user.id, 'facility_id:', facilityId, 'isFavorite:', isFavorite)

      if (isFavorite) {
        // 즐겨찾기 제거
        console.log('즐겨찾기 제거 요청 전송...')
        const res = await fetch(`/api/favorites?facilityId=${facilityId}`, {
          method: 'DELETE',
          headers: {
            'x-user-id': user.id.toString(),
          },
        })
        
        let data: any = {}
        try {
          const text = await res.text()
          if (text) {
            data = JSON.parse(text)
          }
        } catch (e) {
          console.error('응답 파싱 오류:', e)
          data = { message: '서버 응답을 파싱할 수 없습니다.' }
        }
        
        console.log('즐겨찾기 제거 응답:', res.status, res.statusText, data)
        
        if (res.ok) {
          setFavoriteFacilities(favoriteFacilities.filter(id => id !== facilityId))
          console.log('즐겨찾기 제거 성공 - UI 업데이트 완료')
          // DB에서 다시 로드하여 확인
          setTimeout(() => {
            loadFavorites()
          }, 500)
        } else {
          console.error('즐겨찾기 제거 실패:', {
            status: res.status,
            statusText: res.statusText,
            data: data,
          })
          alert(data.message || data.error || `즐겨찾기 제거에 실패했습니다. (${res.status})`)
        }
      } else {
        // 즐겨찾기 추가
        console.log('즐겨찾기 추가 요청 전송...')
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id.toString(),
          },
          body: JSON.stringify({ facilityId }),
        })
        
        let data: any = {}
        try {
          const text = await res.text()
          if (text) {
            data = JSON.parse(text)
          }
        } catch (e) {
          console.error('응답 파싱 오류:', e)
          data = { message: '서버 응답을 파싱할 수 없습니다.' }
        }
        
        console.log('즐겨찾기 추가 응답:', res.status, res.statusText, data)
        
        if (res.ok) {
          setFavoriteFacilities([...favoriteFacilities, facilityId])
          console.log('즐겨찾기 추가 성공 - UI 업데이트 완료')
          // DB에서 다시 로드하여 확인
          setTimeout(() => {
            loadFavorites()
          }, 500)
        } else {
          console.error('즐겨찾기 추가 실패:', {
            status: res.status,
            statusText: res.statusText,
            data: data,
          })
          alert(data.message || data.error || `즐겨찾기 추가에 실패했습니다. (${res.status})`)
        }
      }
    } catch (e) {
      console.error('즐겨찾기 토글 오류:', e)
      alert('즐겨찾기 처리 중 오류가 발생했습니다.')
    }
  }

  const loadData = useCallback(async (targetDateTime: Date | null = null) => {
    setIsLoading(true)
    try {
      // 시설 목록 조회 (datetime 파라미터 포함)
      const params = targetDateTime ? `?datetime=${encodeURIComponent(targetDateTime.toISOString())}` : ""
      const res = await fetch(`/api/facilities${params}`)
      if (!res.ok) {
        console.error("시설 데이터 요청 실패:", res.status, res.statusText)
        setFacilitiesData([])
        setFilteredFacilities([])
        return
      }

      const data = await res.json()

      // 전체 리뷰 조회 (시설별 평점 계산용)
      const reviewsRes = await fetch("/api/reviews")
      const allReviews = reviewsRes.ok ? await reviewsRes.json() : []

      // 시설별 리뷰 통계 계산
      const reviewStats = new Map<number, { count: number; avgRating: number; sum: number }>()
      allReviews.forEach((review: any) => {
        const facilityId = Number(review.facilityId)
        if (!reviewStats.has(facilityId)) {
          reviewStats.set(facilityId, { count: 0, avgRating: 0, sum: 0 })
        }
        const stats = reviewStats.get(facilityId)!
        stats.count++
        stats.sum = (stats.sum || 0) + review.rating
        stats.avgRating = stats.sum / stats.count
      })

      // ✅ API 응답을 화면에서 쓰기 좋은 형태로 매핑
      const mapped: Facility[] = data.map((item: any) => {
        const { province, district } = detectRegionFromAddress(item.address ?? "")
        let congestion: CongestionCode | undefined
        if (item.real_time_level === "혼잡") congestion = "crowded"
        else if (item.real_time_level === "보통") congestion = "moderate"
        else if (item.real_time_level === "여유") congestion = "leisure"

        const rawLat = item.lat ?? item.latitude
        const rawLng = item.lng ?? item.longitude
        const latNum =
          rawLat !== null && rawLat !== undefined && !Number.isNaN(Number(rawLat))
            ? Number(rawLat)
            : undefined
        const lngNum =
          rawLng !== null && rawLng !== undefined && !Number.isNaN(Number(rawLng))
            ? Number(rawLng)
            : undefined

        // 위치 디버그 로그
        console.debug("시설 위치 디버그:", item.name, rawLat, rawLng, latNum, lngNum)

        // 리뷰 통계에서 평점 가져오기
        const stats = reviewStats.get(Number(item.id))

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
          phone: item.phone ?? "",
          hours: item.hours ?? "",
          features: item.features ?? [],
          description: item.description ?? "",
          lat: latNum,
          lng: lngNum,
          province,
          district,
          capacity: item.capacity,
          real_time_level: item.real_time_level,
          real_time_percent: item.real_time_percent,
          current_people: item.current_people,
          congestion,
          predicted_level: item.predicted_level,
          homepage: item.homepage,
        }
      })

      setFacilitiesData(mapped)
      setFilteredFacilities(mapped)

      // 초기 로드가 아닐 때만 지도 중심 변경 (초기 로드 시에는 사용자 위치 유지)
      if (!isInitialLoad.current && mapped.length > 0 && mapped[0].lat && mapped[0].lng) {
        setMapCenter({ lat: mapped[0].lat, lng: mapped[0].lng })
      }
      
      // 초기 로드 완료 표시
      if (isInitialLoad.current) {
        isInitialLoad.current = false
      }
    } catch (e) {
      console.error("데이터 로드 오류:", e)
      setFacilitiesData([])
      setFilteredFacilities([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const user = localStorage.getItem("user")
    setIsLoggedIn(!!user)
    loadData(selectedDateTime)
  }, [loadData])

  // selectedDateTime 변경 시 데이터 다시 로드
  useEffect(() => {
    if (selectedDateTime !== null) {
      loadData(selectedDateTime)
    }
  }, [selectedDateTime, loadData])

  const handleSearch = () => {
    let results = facilitiesData

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().replace(/\s+/g, "")
      results = results.filter((f) => {
        const name = f.name.toLowerCase().replace(/\s+/g, "")
        const address = (f.address ?? "").toLowerCase().replace(/\s+/g, "")
        const features = (f.features ?? []).map((feat) => feat.toLowerCase())

        return (
          name.includes(query) ||
          address.includes(query) ||
          features.some((feat) => feat.includes(query))
        )
      })
    }

    if (selectedProvince) {
      results = results.filter((f) => f.province === selectedProvince)
      if (selectedDistrict) {
        results = results.filter((f) => f.district === selectedDistrict)
      }
    }

    if (selectedFacilities.length > 0) {
      results = results.filter((f) =>
        selectedFacilities.every((sf) => (f.features ?? []).includes(sf)),
      )
    }

    setFilteredFacilities(results)
    const firstResult = results[0]

    if (firstResult?.lat && firstResult?.lng) {
      setMapCenter({ lat: firstResult.lat, lng: firstResult.lng })
    } else {
      setMapCenter(DEFAULT_CENTER)
    }
    // 검색 시 첫 페이지로 이동하고 URL 업데이트
    setCurrentPage(1)
    setPageBlock(0)
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.set('page', '1')
    router.replace(`/search?${newParams.toString()}`, { scroll: false })
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
      const selected = new Date(tempSelectedDate)
      const normalizedHour = selectedHour % 12
      const hour24 = normalizedHour + (selectedAmPm === "PM" ? 12 : 0)
      selected.setHours(hour24, selectedMinute, 0, 0)
      const formattedDate = `${selected.getFullYear()}년 ${selected.getMonth() + 1}월 ${selected.getDate()}일 ${selectedHour}:${selectedMinute.toString().padStart(2, "0")} ${selectedAmPm}`
      setSelectedDate(formattedDate)
      setSelectedDateTime(selected)
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

  const hasVisited = (facilityId: string | number) => {
    return String(facilityId) === "2"
  }

  useEffect(() => {
    if (!navigator.geolocation) {
      return
    }

    // 처음 페이지 로드 시 사용자 위치를 즉시 가져와서 지도 중심 설정
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
        hasCenteredOnUser.current = true
      },
      () => {
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )

    // 이후 위치 변경을 감지하기 위해 watchPosition 사용
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setUserLocation(coords)
      },
      () => {
        // 위치 감지 실패 시 무시
      },
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 15000 },
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
    // URL에 페이지 번호 저장
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.set('page', page.toString())
    router.replace(`/search?${newParams.toString()}`, { scroll: false })
  }

  const handleNextBlock = () => {
    if ((pageBlock + 1) * 5 < totalPages) {
      const newPage = (pageBlock + 1) * 5 + 1
      setPageBlock(pageBlock + 1)
      setCurrentPage(newPage)
      // URL에 페이지 번호 저장
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.set('page', newPage.toString())
      router.replace(`/search?${newParams.toString()}`, { scroll: false })
    }
  }

  const handlePrevBlock = () => {
    if (pageBlock > 0) {
      const newPage = (pageBlock - 1) * 5 + 1
      setPageBlock(pageBlock - 1)
      setCurrentPage(newPage)
      // URL에 페이지 번호 저장
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.set('page', newPage.toString())
      router.replace(`/search?${newParams.toString()}`, { scroll: false })
    }
  }

  // 리뷰 모달 열기 함수
  const openReviewModal = async (facilityId: number | string) => {
    const numericId = Number(facilityId)
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

  const selectedFacility = facilitiesData.find((f) => String(f.id) === String(selectedFacilityId))

  return (
    <div className={`flex flex-col min-h-screen items-center w-full relative ${isReviewModalOpen ? 'overflow-hidden' : ''}`}>
      {/* Map Section */}
      <div className={`relative w-full h-[500px] rounded-2xl overflow-hidden shadow-lg bg-slate-100 mt-20 transition-all duration-300 ${
        isReviewModalOpen ? 'opacity-50 z-0' : 'opacity-100 z-10'
      }`}>
        <FacilityMap facilities={currentFacilities} center={mapCenter} userLocation={userLocation} />
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

      <div className="h-12"></div> {/* 지도와 검색 필터 사이 여백 */}

      {/* Search Filter Bar */}
      <div className={`sticky top-20 z-40 bg-white border-b shadow-sm w-full transition-all duration-300 ${
        isReviewModalOpen ? 'opacity-50' : 'opacity-100'
      }`}>
        <div className="container py-4 mx-auto max-w-screen-2xl">
          <div className={`flex flex-col lg:flex-row gap-4 items-center justify-center transition-all duration-500 ${
            highlightSearch ? 'ring-4 ring-yellow-300 ring-offset-2 rounded-lg p-4 bg-yellow-50/50' : ''
          }`}>
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
                    {["S", "M", "T", "W", "T", "F", "S"].map((d, index) => (
                      <div key={`day-${index}-${d}`} className="text-muted-foreground">
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
      <div className={`container py-12 max-w-7xl mx-auto transition-all duration-300 ${
        isReviewModalOpen ? 'opacity-50' : 'opacity-100'
      }`}>
        {isLoading ? (
          <LoadingSpinner message="시설 목록을 불러오는 중입니다..." />
        ) : (
          <div className="space-y-6">
            {currentFacilities.map((facility) => {
              const isFavorite = favoriteFacilities.includes(Number(facility.id))
              return (
              <div
                key={facility.id}
                className={`relative bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow ${isFavorite ? 'border-yellow-100 border-2' : ''}`}
              >
                {/* 즐겨찾기 버튼 - 카드 테두리 왼쪽 밖, 위쪽에 위치 */}
                <div className="absolute -left-12 top-2 z-10">
                  <button
                    onClick={() => toggleFavorite(Number(facility.id))}
                    className={`p-2 rounded-full transition-colors ${
                      isFavorite 
                        ? 'bg-yellow-400/50 text-red-600/70' 
                        : 'bg-gray-100/50 text-gray-400/70 hover:bg-gray-200/50'
                    }`}
                    aria-label={isFavorite ? '즐겨찾기 제거' : '즐겨찾기 추가'}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <div className="flex flex-col md:flex-row overflow-hidden">
                  <div className="relative w-full md:w-72 h-48 md:h-auto overflow-hidden rounded-t-xl md:rounded-t-none md:rounded-l-xl">
                    <Image src={facility.image || "/placeholder.svg"} alt={facility.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="w-4 h-4 text-primary" />
                            <h3 
                              className="font-bold text-xl cursor-pointer hover:text-primary transition-colors"
                              onClick={() => {
                                if (facility.lat && facility.lng) {
                                  setMapCenter({ lat: facility.lat, lng: facility.lng })
                                }
                              }}
                            >
                              {facility.name}
                            </h3>
                          </div>
                          <p className="text-muted-foreground text-sm mb-3">{facility.address}</p>
                        </div>
                        <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-amber-500 mb-1">
                          <Star className="w-5 h-5 fill-current" />
                          <span className="font-bold text-lg">{facility.rating}</span>
                        </div>
                        <button
                          onClick={() => openReviewModal(facility.id)}
                          className="text-xs text-muted-foreground underline cursor-pointer hover:text-primary transition-colors"
                        >
                          리뷰 보기
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-4 text-sm text-muted-foreground">
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
                        {(facility.features ?? []).slice(0, 3).map((feature) => (
                          <span key={feature} className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600">
                            {feature}
                          </span>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Congestion Indicator */}
                      {selectedDate !== "이용날짜/시간" ? (
                        <div className={`flex flex-col items-end transition-all duration-500 ${highlightCongestion ? 'ring-4 ring-yellow-300 ring-offset-2 rounded-lg p-2 bg-yellow-50/50' : ''}`}>
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
                        <div className={`flex flex-col items-end transition-all duration-500 ${highlightCongestion ? 'ring-4 ring-yellow-300 ring-offset-2 rounded-lg p-2 bg-yellow-50/50' : ''}`}>
                          <span className="text-xs text-muted-foreground mb-1">예측 혼잡도</span>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                            <span className="text-xs">이용 예정 시간 입력</span>
                          </div>
                        </div>
                      )}

                      {/* Real-time Congestion */}
                      <div className={`ml-4 pl-4 border-l flex flex-col items-end transition-all duration-500 ${highlightCongestion ? 'ring-4 ring-yellow-400 ring-offset-2 rounded-lg p-2 bg-yellow-50' : ''}`}>
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
            )
          })}
          </div>
        )}

        {!isLoading && totalPages > 0 && (
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

      {/* 리뷰 모달 */}
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
                        {review.userName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{review.userName || '익명'}</div>
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
                    {review.tags && review.tags.map((tag: string) => (
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

