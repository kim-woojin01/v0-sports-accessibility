"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, Settings, LogOut, Save, X, Bell, BellOff, Edit2, Check, User, Star, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface UserProfile {
  id: number
  idEmail: string
  name: string
  disabilityType: string | null
  exercisePurposes: string[]
  profileImageUrl: string | null
}

export default function MyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [highlightFavorites, setHighlightFavorites] = useState(false)
  const [highlightReviews, setHighlightReviews] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  
  // 계정 탈퇴 비밀번호 입력 상태 추가
  const [deleteAccountPassword, setDeleteAccountPassword] = useState("")
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  // 비밀번호 변경 관련 상태 추가
  const [currentPassword, setCurrentPassword] = useState("")
  const [currentPasswordMessage, setCurrentPasswordMessage] = useState("")
  const [currentPasswordValid, setCurrentPasswordValid] = useState(false)
  const [isCheckingCurrentPassword, setIsCheckingCurrentPassword] = useState(false)
  
  const [newPassword, setNewPassword] = useState("")
  const [newPasswordCheck, setNewPasswordCheck] = useState("")
  const [newPasswordMatchMessage, setNewPasswordMatchMessage] = useState("")
  const [newPasswordMatch, setNewPasswordMatch] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false)

  const [isAlarmEditing, setIsAlarmEditing] = useState(false)
  const [isAlarmOn, setIsAlarmOn] = useState(false)
  const [favoriteFacilities, setFavoriteFacilities] = useState<number[]>([])
  const [allFacilities, setAllFacilities] = useState<any[]>([]) // Railway DB에서 가져온 시설 목록
  const [usageHistory, setUsageHistory] = useState<any[]>([]) // 이용 내역 (facility_usage 테이블)
  const [myReviews, setMyReviews] = useState<any[]>([]) // 작성한 리뷰 (facility_reviews 테이블)
  const [isLoadingUsage, setIsLoadingUsage] = useState(false)
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [editingReview, setEditingReview] = useState<any | null>(null) // 수정 중인 리뷰
  const [editReviewRating, setEditReviewRating] = useState(0)
  const [editReviewContent, setEditReviewContent] = useState("")
  const [editReviewTags, setEditReviewTags] = useState<string[]>([])
  const [isSavingReview, setIsSavingReview] = useState(false)
  const [isDeletingReview, setIsDeletingReview] = useState<number | null>(null)
  const [preferredTime, setPreferredTime] = useState({
    day: "월요일",
    startTime: "14:00",
    endTime: "16:00",
  })
  
  // 페이지네이션 상태
  const [usageCurrentPage, setUsageCurrentPage] = useState(1)
  const [reviewsCurrentPage, setReviewsCurrentPage] = useState(1)
  const itemsPerPage = 5
  
  // 탭 상태
  const [activeTab, setActiveTab] = useState("history")

  // 프로필 사진 상태
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string>("")
  const [profileImageUrl, setProfileImageUrl] = useState<string>("")
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const [profile, setProfile] = useState<UserProfile>({
    id: 0,
    idEmail: "",
    name: "",
    disabilityType: null,
    exercisePurposes: [],
    profileImageUrl: null,
  })

  const [originalProfile, setOriginalProfile] = useState<UserProfile>({
    id: 0,
    idEmail: "",
    name: "",
    disabilityType: null,
    exercisePurposes: [],
    profileImageUrl: null,
  })

  // 사용자 정보 로드
  useEffect(() => {
    const loadUserProfile = async () => {
      const userStr = localStorage.getItem("user")
      console.log("마이페이지 - localStorage user:", userStr) // 디버깅
      
      if (!userStr) {
        if (confirm("로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?")) {
          router.push("/signin")
        } else {
          router.push("/")
        }
        return
      }

      try {
        const user = JSON.parse(userStr)
        console.log("마이페이지 - 파싱된 사용자:", user) // 디버깅
        
        // 사용자 정보가 제대로 있는지 확인
        if (!user || !user.id) {
          console.error("마이페이지 - 사용자 정보가 올바르지 않습니다:", user)
          router.push("/signin")
          return
        }

        // DB에서 최신 사용자 정보 가져오기
        try {
          const response = await fetch(`/api/auth/user?userId=${user.id}`, {
            method: 'GET',
            headers: {
              'x-user-id': user.id.toString()
            }
          })

          if (response.ok) {
            const dbUser = await response.json()
            console.log("마이페이지 - DB에서 가져온 사용자:", dbUser)
            
            // DB에서 가져온 최신 정보로 프로필 설정
            const profileData = {
              id: dbUser.id,
              idEmail: dbUser.idEmail || "",
              name: dbUser.name || "",
              disabilityType: dbUser.disabilityType || null,
              exercisePurposes: Array.isArray(dbUser.exercisePurposes) 
                ? dbUser.exercisePurposes 
                : [],
              profileImageUrl: dbUser.profileImageUrl || null,
            }

            // 프로필 이미지 미리보기 설정
            setProfileImagePreview(dbUser.profileImageUrl || "")

            // localStorage도 최신 정보로 업데이트
            const updatedUser = {
              id: profileData.id,
              idEmail: profileData.idEmail,
              name: profileData.name,
              disabilityType: profileData.disabilityType,
              exercisePurposes: profileData.exercisePurposes,
              profileImageUrl: profileData.profileImageUrl,
            }
            localStorage.setItem('user', JSON.stringify(updatedUser))
            localStorage.setItem('userName', profileData.name)

            console.log("마이페이지 - 설정할 프로필:", profileData) // 디버깅
            console.log("마이페이지 - DB에서 가져온 사용자:", dbUser)
            console.log("마이페이지 - exercisePurposes:", dbUser.exercisePurposes)
            console.log("마이페이지 - exercisePurposes 타입:", typeof dbUser.exercisePurposes)
            console.log("마이페이지 - exercisePurposes isArray:", Array.isArray(dbUser.exercisePurposes))
            
            setProfile(profileData)
            setOriginalProfile(profileData)
            setIsLoggedIn(true)
          } else {
            // API 호출 실패 시 localStorage 데이터 사용 (fallback)
            console.warn("마이페이지 - API 호출 실패, localStorage 데이터 사용")
        const profileData = {
          id: user.id,
          idEmail: user.idEmail || "",
          name: user.name || "",
          disabilityType: user.disabilityType || null,
          exercisePurposes: Array.isArray(user.exercisePurposes) 
            ? user.exercisePurposes 
            : [],
              profileImageUrl: user.profileImageUrl || null,
            }
            setProfileImagePreview(user.profileImageUrl || "")

            setProfile(profileData)
            setOriginalProfile(profileData)
            setIsLoggedIn(true)
          }
        } catch (apiError) {
          // API 호출 중 오류 발생 시 localStorage 데이터 사용 (fallback)
          console.error("마이페이지 - API 호출 오류:", apiError)
          const profileData = {
            id: user.id,
            idEmail: user.idEmail || "",
            name: user.name || "",
            disabilityType: user.disabilityType || null,
            exercisePurposes: Array.isArray(user.exercisePurposes) 
              ? user.exercisePurposes 
              : [],
            profileImageUrl: user.profileImageUrl || null,
          }
          setProfileImagePreview(user.profileImageUrl || "")

        setProfile(profileData)
        setOriginalProfile(profileData)
        setIsLoggedIn(true)
        }
      } catch (error) {
        console.error("마이페이지 - 사용자 정보 로드 오류:", error)
        console.error("마이페이지 - 파싱 실패한 userStr:", userStr)
        router.push("/signin")
      } finally {
        setIsLoading(false)
      }
    }

    loadUserProfile()
  }, [router])

  // 시설 목록 및 즐겨찾기 로드 함수
  const loadFacilitiesAndFavorites = async () => {
    if (!isLoggedIn || !profile.id) {
      setAllFacilities([])
      setFavoriteFacilities([])
      return
    }

    try {
      // 시설 목록 로드 (Railway DB에서)
      const facilitiesRes = await fetch('/api/facilities')
      if (facilitiesRes.ok) {
        const facilitiesData = await facilitiesRes.json()
        setAllFacilities(facilitiesData)
        console.log('마이페이지 - 시설 목록 로드 성공:', facilitiesData.length, '개')
      } else {
        const errorText = await facilitiesRes.text()
        console.error('마이페이지 - 시설 목록 로드 실패:', facilitiesRes.status, facilitiesRes.statusText, errorText)
      }

      // 즐겨찾기 로드 (facility_favorites 테이블에서)
      const favoritesRes = await fetch('/api/favorites', {
        headers: {
          'x-user-id': profile.id.toString(),
        },
      })
      if (favoritesRes.ok) {
        const favoritesData = await favoritesRes.json()
        const facilityIds = (favoritesData.favorites || []).map((id: any) => Number(id))
        setFavoriteFacilities(facilityIds)
        console.log('마이페이지 - 즐겨찾기 로드 성공:', facilityIds)
      } else {
        const errorText = await favoritesRes.text()
        console.error('마이페이지 - 즐겨찾기 로드 실패:', favoritesRes.status, favoritesRes.statusText, errorText)
        setFavoriteFacilities([])
      }
    } catch (e) {
      console.error('마이페이지 - 시설/즐겨찾기 로드 오류:', e)
      setAllFacilities([])
      setFavoriteFacilities([])
    }
  }

  // 시설 목록 및 즐겨찾기 로드
  useEffect(() => {
    loadFacilitiesAndFavorites()
  }, [isLoggedIn, profile.id])

  // 이용 내역 로드 (facility_usage 테이블)
  const loadUsageHistory = async () => {
    if (!isLoggedIn || !profile.id) {
      setUsageHistory([])
      return
    }

    setIsLoadingUsage(true)
    try {
      // 모든 이용 내역 조회 (리뷰 작성 여부와 관계없이)
      const res = await fetch(`/api/usage?userId=${profile.id}&all=true`)
      if (res.ok) {
        const data = await res.json()
        setUsageHistory(data)
        console.log('마이페이지 - 이용 내역 로드 성공:', data.length, '개')
      } else {
        const errorText = await res.text()
        console.error('마이페이지 - 이용 내역 로드 실패:', res.status, res.statusText, errorText)
        setUsageHistory([])
      }
    } catch (e) {
      console.error('마이페이지 - 이용 내역 로드 오류:', e)
      setUsageHistory([])
    } finally {
      setIsLoadingUsage(false)
    }
  }

  // 작성한 리뷰 로드 (facility_reviews 테이블)
  const loadMyReviews = async () => {
    if (!isLoggedIn || !profile.id) {
      setMyReviews([])
      return
    }

    setIsLoadingReviews(true)
    try {
      const res = await fetch(`/api/reviews?userId=${profile.id}`)
      if (res.ok) {
        const data = await res.json()
        setMyReviews(data)
        console.log('마이페이지 - 작성한 리뷰 로드 성공:', data.length, '개')
      } else {
        const errorText = await res.text()
        console.error('마이페이지 - 작성한 리뷰 로드 실패:', res.status, res.statusText, errorText)
        setMyReviews([])
      }
    } catch (e) {
      console.error('마이페이지 - 작성한 리뷰 로드 오류:', e)
      setMyReviews([])
    } finally {
      setIsLoadingReviews(false)
    }
  }

  // 이용 내역 및 리뷰 로드
  useEffect(() => {
    if (isLoggedIn && profile.id) {
      loadUsageHistory()
      loadMyReviews()
    }
  }, [isLoggedIn, profile.id])

  // URL 파라미터에서 하이라이트 확인
  useEffect(() => {
    const highlightParam = searchParams.get('highlight')
    if (highlightParam === 'favorites') {
      setHighlightFavorites(true)
      setActiveTab("alarm")
    } else if (highlightParam === 'reviews') {
      setHighlightReviews(true)
      setActiveTab("reviews")
    } else if (window.location.hash === '#my-reviews') {
      setActiveTab("reviews")
    }
  }, [searchParams])

  // 페이지 클릭 시 하이라이트 제거
  useEffect(() => {
    const handleClick = () => {
      if (highlightFavorites || highlightReviews) {
        setHighlightFavorites(false)
        setHighlightReviews(false)
        const newParams = new URLSearchParams(searchParams.toString())
        newParams.delete('highlight')
        const hash = window.location.hash
        router.replace(`/mypage${hash}${newParams.toString() ? `?${newParams.toString()}` : ''}`, { scroll: false })
      }
    }

    if (highlightFavorites || highlightReviews) {
      const timer = setTimeout(() => {
        document.addEventListener('click', handleClick, { once: true })
      }, 100)
      return () => {
        clearTimeout(timer)
        document.removeEventListener('click', handleClick)
      }
    }
  }, [highlightFavorites, highlightReviews, searchParams, router])

  // 리뷰 수정 시작
  const handleEditReview = (review: any) => {
    setEditingReview(review)
    setEditReviewRating(review.rating)
    setEditReviewContent(review.content)
    setEditReviewTags(review.tags || [])
  }

  // 리뷰 수정 취소
  const handleCancelEditReview = () => {
    setEditingReview(null)
    setEditReviewRating(0)
    setEditReviewContent("")
    setEditReviewTags([])
  }

  // 리뷰 수정 저장
  const handleSaveReview = async () => {
    if (!editingReview || !profile.id) {
      return
    }

    if (!editReviewRating || !editReviewContent.trim()) {
      alert("평점과 내용을 입력해주세요.")
      return
    }

    setIsSavingReview(true)
    try {
      const res = await fetch(`/api/reviews/${editingReview.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: editReviewRating,
          content: editReviewContent,
          tags: editReviewTags,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        alert("리뷰가 수정되었습니다.")
        handleCancelEditReview()
        // 리뷰 목록 다시 로드
        loadMyReviews()
      } else {
        alert(data.error || "리뷰 수정에 실패했습니다.")
      }
    } catch (e) {
      console.error('리뷰 수정 오류:', e)
      alert("리뷰 수정 중 오류가 발생했습니다.")
    } finally {
      setIsSavingReview(false)
    }
  }

  // 리뷰 삭제
  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm("정말 이 리뷰를 삭제하시겠습니까?")) {
      return
    }

    setIsDeletingReview(reviewId)
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (res.ok) {
        alert("리뷰가 삭제되었습니다.")
        // 리뷰 목록 다시 로드
        loadMyReviews()
        // 이용 내역도 다시 로드 (리뷰 작성 여부 업데이트)
        loadUsageHistory()
      } else {
        alert(data.error || "리뷰 삭제에 실패했습니다.")
      }
    } catch (e) {
      console.error('리뷰 삭제 오류:', e)
      alert("리뷰 삭제 중 오류가 발생했습니다.")
    } finally {
      setIsDeletingReview(null)
    }
  }

  // 리뷰 태그 옵션
  const reviewTagOptions = [
    "직원들이 친절했어요",
    "시설이 청결했어요",
    "진입로 평탄해요",
    "운동 기구 상태가 좋았어요",
    "이용 요금이 합리적이에요",
    "접근성이 좋았어요",
    "주차장이 넓었어요",
  ]

  // 즐겨찾기 토글 함수 (검색 페이지와 동일한 로직)
  const toggleFavorite = async (facilityId: number) => {
    if (!isLoggedIn || !profile.id) {
      alert('로그인 가입 후 서비스 이용이 가능합니다.')
      return
    }

    try {
      const isFavorite = favoriteFacilities.includes(facilityId)
      console.log('마이페이지 - 즐겨찾기 토글 - user_id:', profile.id, 'facility_id:', facilityId, 'isFavorite:', isFavorite)

      if (isFavorite) {
        // 즐겨찾기 제거
        console.log('마이페이지 - 즐겨찾기 제거 요청 전송...')
        const res = await fetch(`/api/favorites?facilityId=${facilityId}`, {
          method: 'DELETE',
          headers: {
            'x-user-id': profile.id.toString(),
          },
        })
        
        let data: any = {}
        try {
          const text = await res.text()
          if (text) {
            data = JSON.parse(text)
          }
        } catch (e) {
          console.error('마이페이지 - 즐겨찾기 제거 응답 JSON 파싱 실패:', e)
          data = { message: '서버 응답을 파싱할 수 없습니다.' }
        }
        console.log('마이페이지 - 즐겨찾기 제거 응답:', res.status, res.statusText, data)
        
        if (res.ok) {
          setFavoriteFacilities(favoriteFacilities.filter(id => id !== facilityId))
          console.log('마이페이지 - 즐겨찾기 제거 성공 - UI 업데이트 완료')
          // DB에서 다시 로드하여 확인
          setTimeout(() => {
            loadFacilitiesAndFavorites()
          }, 500)
        } else {
          console.error('마이페이지 - 즐겨찾기 제거 실패:', data)
          alert(data.message || data.error || `즐겨찾기 제거에 실패했습니다. (${res.status})`)
        }
      } else {
        // 즐겨찾기 추가
        console.log('마이페이지 - 즐겨찾기 추가 요청 전송...')
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': profile.id.toString(),
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
          console.error('마이페이지 - 즐겨찾기 추가 응답 JSON 파싱 실패:', e)
          data = { message: '서버 응답을 파싱할 수 없습니다.' }
        }
        console.log('마이페이지 - 즐겨찾기 추가 응답:', res.status, res.statusText, data)
        
        if (res.ok) {
          setFavoriteFacilities([...favoriteFacilities, facilityId])
          console.log('마이페이지 - 즐겨찾기 추가 성공 - UI 업데이트 완료')
          // DB에서 다시 로드하여 확인
          setTimeout(() => {
            loadFacilitiesAndFavorites()
          }, 500)
        } else {
          console.error('마이페이지 - 즐겨찾기 추가 실패:', data)
          alert(data.message || data.error || `즐겨찾기 추가에 실패했습니다. (${res.status})`)
        }
      }
    } catch (e) {
      console.error('마이페이지 - 즐겨찾기 토글 오류:', e)
      alert('즐겨찾기 처리 중 오류가 발생했습니다.')
    }
  }


  if (isLoading) {
    return (
      <div className="container py-12 max-w-5xl mx-auto pt-24">
        <div className="text-center">로딩 중...</div>
      </div>
    )
  }

  if (!isLoggedIn) return null

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile.id,
          idEmail: profile.idEmail,
          name: profile.name,
          disabilityType: profile.disabilityType,
          exercisePurposes: profile.exercisePurposes,
          profileImageUrl: profileImageUrl || profile.profileImageUrl || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || "프로필 수정에 실패했습니다.")
        return
      }

      // 로컬 스토리지 업데이트
      const finalProfileImageUrl = profileImageUrl || profile.profileImageUrl || null
      const updatedUser = {
        id: profile.id,
        idEmail: profile.idEmail,
        name: profile.name,
        disabilityType: profile.disabilityType,
        exercisePurposes: profile.exercisePurposes,
        profileImageUrl: finalProfileImageUrl,
      }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      localStorage.setItem('userName', profile.name)

      // 프로필 상태 업데이트
      setProfile((prev) => ({ ...prev, profileImageUrl: finalProfileImageUrl }))
      setOriginalProfile({ ...profile, profileImageUrl: finalProfileImageUrl })
      setProfileImageUrl("")
      setProfileImage(null)
      setIsEditing(false)
      alert("프로필이 수정되었습니다.")
      window.location.reload()
    } catch (error) {
      console.error('프로필 수정 오류:', error)
      alert("프로필 수정 중 오류가 발생했습니다.")
    }
  }

  const handleCancelEdit = () => {
    setProfile({ ...originalProfile })
    setIsEditing(false)
  }

  // 현재 비밀번호 확인 함수
  const handleVerifyCurrentPassword = async () => {
    if (!currentPassword) {
      setCurrentPasswordMessage("비밀번호를 입력해주세요.")
      setCurrentPasswordValid(false)
      return
    }

    setIsCheckingCurrentPassword(true)
    try {
      const userStr = localStorage.getItem("user")
      if (!userStr) {
        setCurrentPasswordMessage("로그인이 필요합니다.")
        setCurrentPasswordValid(false)
        setIsCheckingCurrentPassword(false)
        return
      }

      const user = JSON.parse(userStr)
      const response = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          password: currentPassword,
        }),
      })

      const data = await response.json()

      if (data.isValid) {
        setCurrentPasswordMessage("비밀번호가 일치합니다.")
        setCurrentPasswordValid(true)
      } else {
        setCurrentPasswordMessage("비밀번호가 일치하지 않습니다.")
        setCurrentPasswordValid(false)
      }
    } catch (error) {
      console.error('비밀번호 확인 오류:', error)
      setCurrentPasswordMessage("비밀번호 확인 중 오류가 발생했습니다.")
      setCurrentPasswordValid(false)
    } finally {
      setIsCheckingCurrentPassword(false)
    }
  }

  // 현재 비밀번호 입력 변경 시
  const handleCurrentPasswordChange = (value: string) => {
    setCurrentPassword(value)
    setCurrentPasswordMessage("")
    setCurrentPasswordValid(false)
  }

  // 새 비밀번호 확인
  const handleNewPasswordCheck = (checkValue: string) => {
    setNewPasswordCheck(checkValue)
    if (checkValue && newPassword) {
      if (checkValue === newPassword) {
        setNewPasswordMatchMessage("비밀번호가 일치합니다.")
        setNewPasswordMatch(true)
      } else {
        setNewPasswordMatchMessage("일치하지 않습니다.")
        setNewPasswordMatch(false)
      }
    } else {
      setNewPasswordMatchMessage("")
      setNewPasswordMatch(false)
    }
  }

  // 새 비밀번호 변경 시
  const handleNewPasswordChange = (value: string) => {
    if (value.length <= 30) {
      setNewPassword(value)
      // 새 비밀번호 확인과 재확인
      if (newPasswordCheck && value !== newPasswordCheck) {
        setNewPasswordMatchMessage("일치하지 않습니다.")
        setNewPasswordMatch(false)
      } else if (newPasswordCheck && value === newPasswordCheck) {
        setNewPasswordMatchMessage("비밀번호가 일치합니다.")
        setNewPasswordMatch(true)
      }
    }
  }

  const handlePurposeChange = (value: string) => {
    setProfile((prev) => ({
      ...prev,
      exercisePurposes: prev.exercisePurposes.includes(value)
        ? prev.exercisePurposes.filter((p) => p !== value)
        : [...prev.exercisePurposes, value],
    }))
  }

  // 이미지 선택 핸들러
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.')
      return
    }

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.')
      return
    }

    setProfileImage(file)

    // 미리보기 생성
    const reader = new FileReader()
    reader.onloadend = () => {
      setProfileImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // 서버에 업로드
    setIsUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/profile', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || '이미지 업로드에 실패했습니다.')
        setProfileImage(null)
        setProfileImagePreview(profile.profileImageUrl || "")
        return
      }

      setProfileImageUrl(data.url)
      setProfile((prev) => ({
        ...prev,
        profileImageUrl: data.url,
      }))
    } catch (error) {
      console.error('이미지 업로드 오류:', error)
      alert('이미지 업로드 중 오류가 발생했습니다.')
      setProfileImage(null)
      setProfileImagePreview(profile.profileImageUrl || "")
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleChangePassword = async () => {
    // 유효성 검증
    if (!currentPasswordValid) {
      alert("현재 비밀번호를 확인해주세요.")
      return
    }

    if (!newPassword || newPassword.length === 0 || newPassword.length > 30) {
      alert("새 비밀번호를 입력해주세요. (최대 30자)")
      return
    }

    if (!newPasswordMatch) {
      alert("새 비밀번호가 일치하지 않습니다.")
      return
    }

    setIsChangingPassword(true)

    try {
      const userStr = localStorage.getItem("user")
      if (!userStr) {
        alert("로그인이 필요합니다.")
        setIsChangingPassword(false)
        return
      }

      const user = JSON.parse(userStr)
      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          currentPassword: currentPassword,
          newPassword: newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || "비밀번호 변경에 실패했습니다.")
        setIsChangingPassword(false)
        return
      }

      // 성공
      setShowPasswordModal(true)
      // 입력 필드 초기화
      setCurrentPassword("")
      setCurrentPasswordMessage("")
      setCurrentPasswordValid(false)
      setNewPassword("")
      setNewPasswordCheck("")
      setNewPasswordMatchMessage("")
      setNewPasswordMatch(false)
      setIsChangingPassword(false)
    } catch (error) {
      console.error('비밀번호 변경 오류:', error)
      alert("비밀번호 변경 중 오류가 발생했습니다.")
      setIsChangingPassword(false)
    }
  }

  const handleDeleteAccount = () => {
    // 비밀번호 입력 모달 표시
    setShowDeleteConfirmModal(true)
  }

  const confirmDeleteAccount = async () => {
    if (!deleteAccountPassword) {
      alert("비밀번호를 입력해주세요.")
      return
    }

    setIsDeletingAccount(true)
    
    try {
      const userStr = localStorage.getItem("user")
      if (!userStr) {
        alert("로그인이 필요합니다.")
        setIsDeletingAccount(false)
        return
      }

      const user = JSON.parse(userStr)
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          password: deleteAccountPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || "계정 탈퇴에 실패했습니다.")
        setIsDeletingAccount(false)
        setDeleteAccountPassword("")
        return
      }

      // 성공 - localStorage 정리
    localStorage.removeItem("user")
    localStorage.removeItem("userName")
    localStorage.removeItem("userId")
      setShowDeleteConfirmModal(false)
      setDeleteAccountPassword("")
    setShowDeleteSuccessModal(true)
      setIsDeletingAccount(false)
    } catch (error) {
      console.error('계정 탈퇴 오류:', error)
      alert("계정 탈퇴 중 오류가 발생했습니다.")
      setIsDeletingAccount(false)
    }
  }

  const toggleAlarm = () => {
    const newState = !isAlarmOn
    setIsAlarmOn(newState)
    if (newState) {
      setTimeout(() => {
        alert(`[알람 기능] 설정되었습니다. 아래와 같이 알람이 전송될 예정입니다.

[예시 알람] 현재 16시 노원구 장애인스포츠센터 시설의 혼잡도가 적어 이용이 편리합니다.`)
      }, 2000)
    }
  }

  const handleSaveAlarmSettings = () => {
    setIsAlarmEditing(false)
    alert("시설 즐겨찾기 정보가 저장되었습니다.")
  }

  const disabilityTypeOptions = [
    { value: "visual", label: "시각 장애" },
    { value: "hearing", label: "청각 장애" },
    { value: "physical", label: "지체 장애" },
    { value: "intellectual", label: "지적 장애" },
    { value: "language", label: "언어 장애" },
    { value: "none", label: "해당 없음" },
  ]

  const exercisePurposeOptions = ["재활", "유산소", "근력", "재활 운동", "체중 감량", "스포츠 운동"]

  return (
    <div className="container py-12 max-w-5xl mx-auto pt-24">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar / Profile Summary */}
        <div className="w-full md:w-1/3 space-y-6">
          <Card className="text-center pt-6">
            <div className="flex justify-center mb-4">
              <Avatar className="w-24 h-24">
                <AvatarImage 
                  src={profileImagePreview || profile.profileImageUrl || "/placeholder.svg"} 
                  alt={`${profile.name} 프로필 사진`} 
                />
                <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
            <CardHeader>
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="이름"
                    maxLength={30}
                  />
                  <Input
                    value={profile.idEmail}
                    onChange={(e) => setProfile({ ...profile, idEmail: e.target.value })}
                    placeholder="ID / email"
                    maxLength={50}
                  />
                  <div className="space-y-2 mt-4">
                    <Label>프로필 사진 변경</Label>
                    <div className="flex items-center gap-4">
                      {profileImagePreview ? (
                        <img 
                          src={profileImagePreview} 
                          alt="프로필 미리보기" 
                          className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-10 h-10 text-gray-400" aria-hidden="true" />
                        </div>
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        disabled={isUploadingImage}
                        className="cursor-pointer"
                        aria-label="프로필 사진 선택"
                      />
                    </div>
                    {isUploadingImage && (
                      <p className="text-xs text-muted-foreground">업로드 중...</p>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <CardTitle>{profile.name || "이름 없음"}</CardTitle>
                  <CardDescription>{profile.idEmail || "이메일 없음"}</CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent className="space-y-4 text-left">
              <div className="text-sm">
                <span className="font-semibold block mb-1">장애 유형</span>
                {isEditing ? (
                  <Select
                    value={profile.disabilityType || ""}
                    onValueChange={(val) => setProfile({ ...profile, disabilityType: val || null })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="장애 유형 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {disabilityTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-2 bg-slate-100 rounded">
                    {profile.disabilityType
                      ? disabilityTypeOptions.find((opt) => opt.value === profile.disabilityType)?.label || profile.disabilityType
                      : "선택 안 함"}
                  </div>
                )}
              </div>
              <div className="text-sm">
                <span className="font-semibold block mb-1">운동 목적</span>
                {isEditing ? (
                  <div className="space-y-2">
                    {exercisePurposeOptions.map((purpose) => (
                      <div key={purpose} className="flex items-center space-x-2">
                        <Checkbox
                          id={purpose}
                          checked={profile.exercisePurposes.includes(purpose)}
                          onCheckedChange={() => handlePurposeChange(purpose)}
                        />
                        <Label htmlFor={purpose} className="text-sm font-normal cursor-pointer">
                          {purpose}
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    {profile.exercisePurposes.length > 0 ? (
                      profile.exercisePurposes.map((purpose) => (
                        <span key={purpose} className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs">
                          {purpose}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-xs">선택 안 함</span>
                    )}
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="flex gap-2 mt-4">
                  <Button className="flex-1 bg-purple-600" onClick={handleSaveProfile}>
                    <Save className="w-4 h-4 mr-2" /> 저장
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={handleCancelEdit}>
                    <X className="w-4 h-4 mr-2" /> 취소
                  </Button>
                </div>
              ) : (
                <Button variant="outline" className="w-full mt-4 bg-transparent" onClick={() => setIsEditing(true)}>
                  <Settings className="w-4 h-4 mr-2" /> 프로필 수정
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content - 나머지 탭 내용은 기존과 동일 */}
        <div className="w-full md:w-2/3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="history">나의 이용 내역</TabsTrigger>
              <TabsTrigger 
                value="alarm"
                className={highlightFavorites ? 'ring-2 ring-yellow-300 rounded bg-yellow-50/50' : ''}
              >
                시설 알람 예약
              </TabsTrigger>
              <TabsTrigger 
                value="reviews"
                className={highlightReviews ? 'ring-2 ring-yellow-300 rounded bg-yellow-50/50' : ''}
              >
                작성한 리뷰
              </TabsTrigger>
              <TabsTrigger value="settings">계정 설정</TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="space-y-4">
              <h2 className="text-xl font-bold mb-4">최근 이용한 시설</h2>
              {isLoadingUsage ? (
                <div className="text-center py-12 text-muted-foreground">
                  이용 내역을 불러오는 중...
                </div>
              ) : usageHistory.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  이용 내역이 없습니다.
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {usageHistory
                      .slice((usageCurrentPage - 1) * itemsPerPage, usageCurrentPage * itemsPerPage)
                      .map((usage) => (
                        <Card key={usage.usage_id || usage.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-1">{usage.name}</h3>
                                <p className="text-sm text-muted-foreground mb-2">{usage.address}</p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {usage.used_date}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {usage.used_time}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                {usage.has_review && (
                                  <>
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                      리뷰 작성됨
                                    </span>
                                    {usage.review_count > 0 && (
                                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                        총 {usage.review_count}개 작성
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                  {usageHistory.length > itemsPerPage && (
                    <div className="flex justify-center items-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUsageCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={usageCurrentPage === 1}
                      >
                        이전
                      </Button>
                      {Array.from({ length: Math.ceil(usageHistory.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={usageCurrentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setUsageCurrentPage(page)}
                          className={usageCurrentPage === page ? "bg-purple-600 hover:bg-purple-700" : ""}
                        >
                          {page}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUsageCurrentPage(prev => Math.min(Math.ceil(usageHistory.length / itemsPerPage), prev + 1))}
                        disabled={usageCurrentPage === Math.ceil(usageHistory.length / itemsPerPage)}
                      >
                        다음
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="alarm" className="space-y-4">
              {/* 알람 설정 내용은 기존과 동일 */}
              <Card className={`transition-all duration-500 ${
                highlightFavorites ? 'ring-4 ring-yellow-300 ring-offset-2 bg-yellow-50/50' : ''
              }`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="w-5 h-5 text-purple-600" />
                    시설 알람 예약 & 즐겨찾기
                  </CardTitle>
                  <CardDescription>자주 가는 시설의 혼잡도 알림을 받아보세요.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2 text-sm">즐겨찾기 시설</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                      {allFacilities.length === 0 ? (
                        <div className="text-sm text-muted-foreground text-center py-2">
                          시설 정보를 불러오는 중...
                        </div>
                      ) : (
                        allFacilities.map((facility) => {
                          const facilityId = Number(facility.id)
                          const isFavorite = favoriteFacilities.includes(facilityId)
                          return (
                            <div key={facility.id} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                disabled={!isAlarmEditing}
                                checked={isFavorite}
                                onChange={(e) => {
                                  if (isAlarmEditing) {
                                    toggleFavorite(facilityId)
                                  }
                                }}
                                className="rounded border-gray-300 text-purple-600"
                              />
                              <span className="text-sm truncate">{facility.name || `시설 ${facility.id}`}</span>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 text-sm">자주 가는 시간대</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        disabled={!isAlarmEditing}
                        value={preferredTime.day}
                        onValueChange={(val) => setPreferredTime({ ...preferredTime, day: val })}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="요일" />
                        </SelectTrigger>
                        <SelectContent>
                          {["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"].map((day) => (
                            <SelectItem key={day} value={day}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-1">
                        <Select
                          disabled={!isAlarmEditing}
                          value={preferredTime.startTime}
                          onValueChange={(val) => setPreferredTime({ ...preferredTime, startTime: val })}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="시작" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                              <SelectItem key={h} value={`${h}:00`}>{`${h}:00`}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-xs">~</span>
                        <Select
                          disabled={!isAlarmEditing}
                          value={preferredTime.endTime}
                          onValueChange={(val) => setPreferredTime({ ...preferredTime, endTime: val })}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="종료" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                              <SelectItem key={h} value={`${h}:00`}>{`${h}:00`}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <Button
                      variant={isAlarmOn ? "default" : "outline"}
                      size="sm"
                      className={isAlarmOn ? "bg-purple-600 hover:bg-purple-700" : ""}
                      onClick={toggleAlarm}
                    >
                      {isAlarmOn ? (
                        <>
                          <Bell className="w-4 h-4 mr-1" /> ON
                        </>
                      ) : (
                        <>
                          <BellOff className="w-4 h-4 mr-1" /> OFF
                        </>
                      )}
                    </Button>

                    {isAlarmEditing ? (
                      <Button size="sm" onClick={handleSaveAlarmSettings} className="bg-blue-600 hover:bg-blue-700">
                        <Check className="w-4 h-4 mr-1" /> 완료
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => setIsAlarmEditing(true)}>
                        <Edit2 className="w-4 h-4 mr-1" /> 수정
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4" id="my-reviews">
              <div className={`transition-all duration-500 ${
                highlightReviews ? 'ring-4 ring-yellow-300 ring-offset-2 rounded-lg p-4 bg-yellow-50/50' : ''
              }`}>
                <h2 className="text-xl font-bold mb-4">작성한 리뷰</h2>
                {isLoadingReviews ? (
                  <div className="text-center py-12 text-muted-foreground">
                    리뷰를 불러오는 중...
                  </div>
                ) : myReviews.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    작성한 리뷰가 없습니다.
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                    {myReviews
                      .slice((reviewsCurrentPage - 1) * itemsPerPage, reviewsCurrentPage * itemsPerPage)
                      .map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{review.facilityName}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{review.facilityAddress}</p>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-muted-foreground">{review.date}</span>
                            </div>
                            <p className="text-sm mb-2">{review.content}</p>
                            {review.tags && review.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {review.tags.map((tag: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditReview(review)}
                            disabled={isDeletingReview === review.id}
                          >
                            수정
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteReview(review.id)}
                            disabled={isDeletingReview === review.id}
                          >
                            {isDeletingReview === review.id ? "삭제 중..." : "삭제"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                      ))}
                  </div>
                  {myReviews.length > itemsPerPage && (
                    <div className="flex justify-center items-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReviewsCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={reviewsCurrentPage === 1}
                      >
                        이전
                      </Button>
                      {Array.from({ length: Math.ceil(myReviews.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={reviewsCurrentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setReviewsCurrentPage(page)}
                          className={reviewsCurrentPage === page ? "bg-purple-600 hover:bg-purple-700" : ""}
                        >
                          {page}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReviewsCurrentPage(prev => Math.min(Math.ceil(myReviews.length / itemsPerPage), prev + 1))}
                        disabled={reviewsCurrentPage === Math.ceil(myReviews.length / itemsPerPage)}
                      >
                        다음
                      </Button>
                    </div>
                  )}
                    </>
                  )}
                </div>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>계정 보안</CardTitle>
                  <CardDescription>비밀번호 및 개인정보를 관리합니다.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 현재 비밀번호 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">현재 비밀번호</label>
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => handleCurrentPasswordChange(e.target.value)}
                        onBlur={handleVerifyCurrentPassword}
                        disabled={isCheckingCurrentPassword}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleVerifyCurrentPassword}
                        disabled={isCheckingCurrentPassword || !currentPassword}
                      >
                        {isCheckingCurrentPassword ? "확인 중..." : "확인"}
                      </Button>
                    </div>
                    {currentPasswordMessage && (
                      <p className={`text-xs ${currentPasswordValid ? "text-green-600" : "text-red-600"}`}>
                        {currentPasswordMessage}
                      </p>
                    )}
                  </div>

                  {/* 새 비밀번호 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">새 비밀번호</label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => handleNewPasswordChange(e.target.value)}
                      maxLength={30}
                      placeholder="최대 30자까지 입력 가능"
                    />
                  </div>

                  {/* 새 비밀번호 확인 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">새 비밀번호 확인</label>
                    <Input
                      type="password"
                      value={newPasswordCheck}
                      onChange={(e) => handleNewPasswordCheck(e.target.value)}
                      maxLength={30}
                    />
                    {newPasswordMatchMessage && (
                      <p className={`text-xs ${newPasswordMatch ? "text-green-600" : "text-red-600"}`}>
                        {newPasswordMatchMessage}
                      </p>
                    )}
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleChangePassword}
                    disabled={isChangingPassword || !currentPasswordValid || !newPasswordMatch}
                  >
                    {isChangingPassword ? "변경 중..." : "비밀번호 변경"}
                  </Button>

                  <div className="pt-8 border-t">
                    <Button variant="destructive" className="w-full" onClick={handleDeleteAccount}>
                      <LogOut className="w-4 h-4 mr-2" /> 계정 탈퇴
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modals - 기존과 동일 */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>알림</DialogTitle>
            <DialogDescription>비밀번호 변경이 완료되었습니다!</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowPasswordModal(false)}>확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

            {/* 계정 탈퇴 확인 모달 */}
      <Dialog open={showDeleteConfirmModal} onOpenChange={setShowDeleteConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>계정 탈퇴</DialogTitle>
            <DialogDescription>
              계정 탈퇴를 진행하시겠습니까?
              <br />
              <br />
              <span className="font-semibold text-amber-600">
                ⚠️ 중요: 7일 내에 다시 로그인하시면 계정이 복구됩니다.
              </span>
              <br />
              <br />
              계정 탈퇴를 확인하려면 비밀번호를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">비밀번호</label>
              <Input
                type="password"
                value={deleteAccountPassword}
                onChange={(e) => setDeleteAccountPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                disabled={isDeletingAccount}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && deleteAccountPassword && !isDeletingAccount) {
                    confirmDeleteAccount()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteConfirmModal(false)
                setDeleteAccountPassword("")
              }}
              disabled={isDeletingAccount}
            >
              취소
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteAccount}
              disabled={isDeletingAccount || !deleteAccountPassword}
            >
              {isDeletingAccount ? "처리 중..." : "탈퇴하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteSuccessModal} onOpenChange={setShowDeleteSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>알림</DialogTitle>
            <DialogDescription>
              계정 탈퇴 신청이 완료되었습니다.
              <br />
              <br />
              <span className="font-semibold text-blue-600">
                💡 7일 내에 다시 로그인하시면 계정이 자동으로 복구됩니다.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowDeleteSuccessModal(false)
                router.push("/")
              }}
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 리뷰 수정 모달 */}
      <Dialog open={!!editingReview} onOpenChange={(open) => !open && handleCancelEditReview()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>리뷰 수정</DialogTitle>
            <DialogDescription>
              {editingReview?.facilityName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* 평점 */}
            <div>
              <Label className="text-sm font-medium mb-2 block">평점</Label>
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setEditReviewRating(i + 1)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        i < editReviewRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-sm text-muted-foreground ml-2">
                  {editReviewRating > 0 ? `${editReviewRating}점` : "평점을 선택해주세요"}
                </span>
              </div>
            </div>

            {/* 내용 */}
            <div>
              <Label htmlFor="review-content" className="text-sm font-medium mb-2 block">
                리뷰 내용
              </Label>
              <Textarea
                id="review-content"
                value={editReviewContent}
                onChange={(e) => setEditReviewContent(e.target.value)}
                placeholder="리뷰를 작성해주세요..."
                rows={5}
                className="resize-none"
              />
            </div>

            {/* 태그 */}
            <div>
              <Label className="text-sm font-medium mb-2 block">태그 선택</Label>
              <div className="flex flex-wrap gap-2">
                {reviewTagOptions.map((tag) => {
                  const isSelected = editReviewTags.includes(tag)
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setEditReviewTags(editReviewTags.filter((t) => t !== tag))
                        } else {
                          setEditReviewTags([...editReviewTags, tag])
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        isSelected
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {tag}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelEditReview}
              disabled={isSavingReview}
            >
              취소
            </Button>
            <Button
              onClick={handleSaveReview}
              disabled={isSavingReview || !editReviewRating || !editReviewContent.trim()}
            >
              {isSavingReview ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}