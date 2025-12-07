"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Upload, X, User, Building2, ChevronRight, ChevronLeft } from "lucide-react"
import LottieLoader from "@/components/loading-animation"

type UserType = "user" | "facility_manager" | null

// 운영 시간 타입
interface OperatingHours {
  [key: string]: { open: string; close: string; closed: boolean }
}

export default function FacilityRequestPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userType, setUserType] = useState<UserType>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // 사용자용 폼 상태
  const [facilityName, setFacilityName] = useState("")
  const [requestCategory, setRequestCategory] = useState("")
  const [content, setContent] = useState("")
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const [attachmentPreview, setAttachmentPreview] = useState("")
  const [attachmentUrl, setAttachmentUrl] = useState("")
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false)

  // 시설관리자용 폼 상태
  const [currentStep, setCurrentStep] = useState(1)
  const [businessRegistrationFile, setBusinessRegistrationFile] = useState<File | null>(null)
  const [businessRegistrationPreview, setBusinessRegistrationPreview] = useState("")
  const [businessRegistrationUrl, setBusinessRegistrationUrl] = useState("")
  const [isUploadingBusiness, setIsUploadingBusiness] = useState(false)
  const [representativeName, setRepresentativeName] = useState("")
  const [facilityPhone, setFacilityPhone] = useState("")
  const [operatingHours, setOperatingHours] = useState<OperatingHours>({
    월요일: { open: "09:00", close: "18:00", closed: false },
    화요일: { open: "09:00", close: "18:00", closed: false },
    수요일: { open: "09:00", close: "18:00", closed: false },
    목요일: { open: "09:00", close: "18:00", closed: false },
    금요일: { open: "09:00", close: "18:00", closed: false },
    토요일: { open: "09:00", close: "18:00", closed: false },
    일요일: { open: "09:00", close: "18:00", closed: true },
  })
  const [accessibilityFeatures, setAccessibilityFeatures] = useState<string[]>([])
  const [facilityImages, setFacilityImages] = useState<string[]>([])
  const [facilityImageFiles, setFacilityImageFiles] = useState<File[]>([])
  const [isUploadingFacilityImages, setIsUploadingFacilityImages] = useState(false)
  const [introduction, setIntroduction] = useState("")

  const accessibilityOptions = [
    "엘리베이터 있음",
    "휠체어 경사로",
    "장애인 화장실",
    "장애인 전용 주차구역",
    "주차장 보유",
    "샤워실 완비",
    "점자 블록",
    "음성 안내",
    "수화 통역 서비스",
    "안내견 동반 입장 가능",
  ]

  useEffect(() => {
    const checkAuth = async () => {
      const userStr = localStorage.getItem("user")
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
        setUserId(user.id.toString())
        setIsLoggedIn(true)
      } catch (error) {
        console.error("인증 확인 오류:", error)
        router.push("/signin")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  // 파일 업로드 핸들러 (사용자용 첨부 사진)
  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 5MB 이하여야 합니다.")
      return
    }

    setAttachmentFile(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      setAttachmentPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    setIsUploadingAttachment(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "facility")

      const response = await fetch("/api/upload/facility", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "업로드 실패")
      }

      setAttachmentUrl(data.url)
    } catch (error: any) {
      alert(error.message || "파일 업로드 중 오류가 발생했습니다.")
      setAttachmentFile(null)
      setAttachmentPreview("")
    } finally {
      setIsUploadingAttachment(false)
    }
  }

  // 사업자 등록증 업로드
  const handleBusinessRegistrationUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("파일 크기는 10MB 이하여야 합니다.")
      return
    }

    setBusinessRegistrationFile(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      setBusinessRegistrationPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    setIsUploadingBusiness(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", "business")

      const response = await fetch("/api/upload/facility", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "업로드 실패")
      }

      setBusinessRegistrationUrl(data.url)
    } catch (error: any) {
      alert(error.message || "파일 업로드 중 오류가 발생했습니다.")
      setBusinessRegistrationFile(null)
      setBusinessRegistrationPreview("")
    } finally {
      setIsUploadingBusiness(false)
    }
  }

  // 시설 사진 업로드 (다중)
  const handleFacilityImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const imageFiles = files.filter((file) => file.type.startsWith("image/"))
    if (imageFiles.length !== files.length) {
      alert("이미지 파일만 업로드 가능합니다.")
      return
    }

    const oversizedFiles = imageFiles.filter((file) => file.size > 5 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      alert("파일 크기는 각각 5MB 이하여야 합니다.")
      return
    }

    setFacilityImageFiles((prev) => [...prev, ...imageFiles])
    setIsUploadingFacilityImages(true)

    try {
      const uploadPromises = imageFiles.map(async (file) => {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("type", "facility")

        const response = await fetch("/api/upload/facility", {
          method: "POST",
          body: formData,
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.message || "업로드 실패")
        }

        return data.url
      })

      const urls = await Promise.all(uploadPromises)
      setFacilityImages((prev) => [...prev, ...urls])
    } catch (error: any) {
      alert(error.message || "파일 업로드 중 오류가 발생했습니다.")
    } finally {
      setIsUploadingFacilityImages(false)
    }
  }

  // 접근성 기능 체크박스 핸들러
  const handleAccessibilityToggle = (feature: string) => {
    setAccessibilityFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    )
  }

  // 운영 시간 변경 핸들러
  const handleOperatingHoursChange = (
    day: string,
    field: "open" | "close" | "closed",
    value: string | boolean
  ) => {
    setOperatingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }))
  }

  // 사용자용 폼 제출
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/facility-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId || "",
        },
        body: JSON.stringify({
          requestType: "user",
          facilityName,
          requestCategory,
          content,
          attachmentUrl,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "요청 제출 실패")
      }

      setShowSuccess(true)
      // 폼 초기화
      setFacilityName("")
      setRequestCategory("")
      setContent("")
      setAttachmentFile(null)
      setAttachmentPreview("")
      setAttachmentUrl("")
    } catch (error: any) {
      alert(error.message || "요청 제출 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // 시설관리자용 폼 제출
  const handleFacilityManagerSubmit = async () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1)
      return
    }

    // 최종 제출
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/facility-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId || "",
        },
        body: JSON.stringify({
          requestType: "facility_manager",
          facilityName,
          content: introduction || "시설 정보 등록 요청",
          businessRegistrationUrl,
          representativeName,
          phone: facilityPhone,
          operatingHours,
          accessibilityFeatures,
          facilityImages,
          introduction,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "요청 제출 실패")
      }

      setShowSuccess(true)
      // 폼 초기화
      setCurrentStep(1)
      setBusinessRegistrationFile(null)
      setBusinessRegistrationPreview("")
      setBusinessRegistrationUrl("")
      setRepresentativeName("")
      setFacilityPhone("")
      setOperatingHours({
        월요일: { open: "09:00", close: "18:00", closed: false },
        화요일: { open: "09:00", close: "18:00", closed: false },
        수요일: { open: "09:00", close: "18:00", closed: false },
        목요일: { open: "09:00", close: "18:00", closed: false },
        금요일: { open: "09:00", close: "18:00", closed: false },
        토요일: { open: "09:00", close: "18:00", closed: false },
        일요일: { open: "09:00", close: "18:00", closed: true },
      })
      setAccessibilityFeatures([])
      setFacilityImages([])
      setFacilityImageFiles([])
      setIntroduction("")
    } catch (error: any) {
      alert(error.message || "요청 제출 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // 단계별 유효성 검사
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(businessRegistrationUrl && representativeName)
      case 2:
        return !!(facilityName && facilityPhone)
      case 3:
        return true // 접근성 정보는 선택사항
      case 4:
        return true // 사진과 소개글도 선택사항
      default:
        return false
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LottieLoader />
      </div>
    )
  }

  if (!isLoggedIn) {
    return null
  }

  // 사용자 유형 선택 화면
  if (!userType) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-purple-100 to-pink-100">
        <div className="min-h-screen pt-24 pb-12 px-4">
          <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">시설 정보 수정 요청</h1>
            <p className="text-lg text-muted-foreground">
              회원님이 <span className="font-semibold text-purple-600">누구인지 </span>알려주세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className="cursor-pointer h-full hover:border-purple-500 transition-colors"
                onClick={() => setUserType("user")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setUserType("user")
                  }
                }}
                aria-label="일반 사용자로 신청하기"
              >
                <CardHeader className="text-center">
                  <User className="w-16 h-16 mx-auto mb-4 text-purple-600" />
                  <CardTitle>일반 사용자</CardTitle>
                  <CardDescription>
                    잘못된 시설 정보를 발견하셨나요?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">
                    간단한 제보로 정확한 정보를 제공해주세요
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className="cursor-pointer h-full hover:border-purple-500 transition-colors"
                onClick={() => setUserType("facility_manager")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setUserType("facility_manager")
                  }
                }}
                aria-label="시설관리자로 신청하기"
              >
                <CardHeader className="text-center">
                  <Building2 className="w-16 h-16 mx-auto mb-4 text-purple-600" />
                  <CardTitle>시설관리자</CardTitle>
                  <CardDescription>
                    공식 정보 등록 & 비즈니스 인증
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">
                    시설 정보를 정확하게 업데이트하여<br />
                    이용자들에게 알리세요
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          </div>
        </div>
      </div>
    )
  }

  // 성공 화면
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-purple-100 to-pink-100">
        <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-6"
            >
              <CheckCircle2 className="w-24 h-24 mx-auto text-green-500" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold mb-4"
            >
              소중한 제보 감사합니다!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-muted-foreground mb-8"
            >
              검토 후 반영하겠습니다.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex gap-4 justify-center"
            >
              <Button
                onClick={() => {
                  setShowSuccess(false)
                  setUserType(null)
                }}
                className="bg-purple-600 hover:bg-purple-700"
              >
                새 요청 작성하기
              </Button>
              <Button
                onClick={() => {
                  router.push("/")
                }}
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-50"
              >
                홈으로 가기
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  }

  // 사용자용 폼
  if (userType === "user") {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">시설 정보 수정 요청</h1>
            <p className="text-muted-foreground">
              잘못된 정보를 발견하셨거나 새로운 시설을 등록하고 싶으시다면 알려주세요.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>제보하기</CardTitle>
              <CardDescription>
                정확한 정보 제공을 위해 가능한 한 구체적으로 작성해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUserSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="facilityName">
                    시설명 <span className="text-red-500" aria-label="필수 항목">*</span>
                  </Label>
                  <Input
                    id="facilityName"
                    value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)}
                    placeholder="예: 서울시 강남구 체육센터"
                    required
                    className="focus:ring-2 focus:ring-purple-500"
                    aria-required="true"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requestCategory">
                    요청 유형 <span className="text-red-500" aria-label="필수 항목">*</span>
                  </Label>
                  <Select value={requestCategory} onValueChange={setRequestCategory} required>
                    <SelectTrigger
                      id="requestCategory"
                      className="focus:ring-2 focus:ring-purple-500"
                      aria-required="true"
                    >
                      <SelectValue placeholder="요청 유형을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="정보오류">정보오류</SelectItem>
                      <SelectItem value="폐업신고">폐업신고</SelectItem>
                      <SelectItem value="신규등록">신규등록</SelectItem>
                      <SelectItem value="기타">기타</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">
                    상세 내용 <span className="text-red-500" aria-label="필수 항목">*</span>
                  </Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="구체적으로 어떤 정보가 변경되었나요?"
                    rows={6}
                    required
                    className="focus:ring-2 focus:ring-purple-500"
                    aria-required="true"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attachment">첨부 사진 (선택사항)</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    {attachmentPreview ? (
                      <div className="relative">
                        <img
                          src={attachmentPreview}
                          alt="첨부 사진 미리보기"
                          className="max-h-48 mx-auto rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setAttachmentFile(null)
                            setAttachmentPreview("")
                            setAttachmentUrl("")
                          }}
                          aria-label="첨부 사진 제거"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <label
                        htmlFor="attachment"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">
                          클릭하여 사진 업로드
                        </span>
                        <input
                          id="attachment"
                          type="file"
                          accept="image/*"
                          onChange={handleAttachmentUpload}
                          className="hidden"
                          aria-label="첨부 사진 업로드"
                        />
                      </label>
                    )}
                    {isUploadingAttachment && (
                      <div className="mt-2">
                        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setUserType(null)}
                    className="flex-1"
                  >
                    뒤로 가기
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        제출 중...
                      </>
                    ) : (
                      "제출하기"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // 시설관리자용 위자드 폼
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-pink-100">
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">공식 정보 등록 & 비즈니스 인증</h1>
          <p className="text-muted-foreground">
            시설 정보를 정확하게 업데이트하고 매력을 어필하세요
          </p>
        </div>

        {/* 진행 단계 표시 */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step === currentStep
                      ? "bg-purple-600 text-white"
                      : step < currentStep
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                  aria-label={`단계 ${step}`}
                >
                  {step < currentStep ? <CheckCircle2 className="w-6 h-6" /> : step}
                </div>
                {step < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step < currentStep ? "bg-green-500" : "bg-gray-200"
                    }`}
                    aria-hidden="true"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>본인 인증</span>
            <span>기본 정보</span>
            <span>접근성 정보</span>
            <span>사진/소개</span>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <AnimatePresence mode="wait">
              {/* Step 1: 본인 인증 */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold mb-2">본인 인증</h2>
                    <p className="text-muted-foreground">
                      시설의 공식 관리자임을 인증하기 위해 사업자 등록증을 업로드해주세요.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessRegistration">
                      사업자 등록증 <span className="text-red-500" aria-label="필수 항목">*</span>
                    </Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      {businessRegistrationPreview ? (
                        <div className="relative">
                          <img
                            src={businessRegistrationPreview}
                            alt="사업자 등록증 미리보기"
                            className="max-h-64 mx-auto rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              setBusinessRegistrationFile(null)
                              setBusinessRegistrationPreview("")
                              setBusinessRegistrationUrl("")
                            }}
                            aria-label="사업자 등록증 제거"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <label
                          htmlFor="businessRegistration"
                          className="cursor-pointer flex flex-col items-center"
                        >
                          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">
                            클릭하여 사업자 등록증 업로드
                          </span>
                          <input
                            id="businessRegistration"
                            type="file"
                            accept="image/*"
                            onChange={handleBusinessRegistrationUpload}
                            className="hidden"
                            aria-required="true"
                            aria-label="사업자 등록증 업로드"
                          />
                        </label>
                      )}
                      {isUploadingBusiness && (
                        <div className="mt-2">
                          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="representativeName">
                      대표자명 <span className="text-red-500" aria-label="필수 항목">*</span>
                    </Label>
                    <Input
                      id="representativeName"
                      value={representativeName}
                      onChange={(e) => setRepresentativeName(e.target.value)}
                      placeholder="대표자명을 입력하세요"
                      required
                      className="focus:ring-2 focus:ring-purple-500"
                      aria-required="true"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 2: 기본 정보 */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold mb-2">기본 정보</h2>
                    <p className="text-muted-foreground">
                      시설의 기본 정보를 입력해주세요.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="facilityNameStep2">
                      시설명 <span className="text-red-500" aria-label="필수 항목">*</span>
                    </Label>
                    <Input
                      id="facilityNameStep2"
                      value={facilityName}
                      onChange={(e) => setFacilityName(e.target.value)}
                      placeholder="예: 서울시 강남구 체육센터"
                      required
                      className="focus:ring-2 focus:ring-purple-500"
                      aria-required="true"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="facilityPhone">
                      전화번호 <span className="text-red-500" aria-label="필수 항목">*</span>
                    </Label>
                    <Input
                      id="facilityPhone"
                      value={facilityPhone}
                      onChange={(e) => setFacilityPhone(e.target.value)}
                      placeholder="010-0000-0000"
                      required
                      className="focus:ring-2 focus:ring-purple-500"
                      aria-required="true"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label>운영 시간</Label>
                    <div className="space-y-3">
                      {Object.entries(operatingHours).map(([day, hours]) => (
                        <div key={day} className="flex items-center gap-4">
                          <div className="w-20 text-sm font-medium">{day}</div>
                          <Checkbox
                            id={`closed-${day}`}
                            checked={hours.closed}
                            onCheckedChange={(checked) =>
                              handleOperatingHoursChange(day, "closed", checked as boolean)
                            }
                            aria-label={`${day} 휴무일 설정`}
                          />
                          <Label htmlFor={`closed-${day}`} className="text-sm">
                            휴무
                          </Label>
                          {!hours.closed && (
                            <>
                              <Input
                                type="time"
                                value={hours.open}
                                onChange={(e) =>
                                  handleOperatingHoursChange(day, "open", e.target.value)
                                }
                                className="w-32"
                                aria-label={`${day} 오픈 시간`}
                              />
                              <span className="text-muted-foreground">~</span>
                              <Input
                                type="time"
                                value={hours.close}
                                onChange={(e) =>
                                  handleOperatingHoursChange(day, "close", e.target.value)
                                }
                                className="w-32"
                                aria-label={`${day} 마감 시간`}
                              />
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: 접근성 정보 */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold mb-2">접근성 정보</h2>
                    <p className="text-muted-foreground">
                      시설의 접근성 편의시설을 선택해주세요. (선택사항)
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {accessibilityOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`accessibility-${option}`}
                          checked={accessibilityFeatures.includes(option)}
                          onCheckedChange={() => handleAccessibilityToggle(option)}
                          aria-label={option}
                        />
                        <Label
                          htmlFor={`accessibility-${option}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 4: 사진/소개 */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold mb-2">사진 및 소개</h2>
                    <p className="text-muted-foreground">
                      시설 사진과 소개글을 등록해주세요. (선택사항)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="facilityImages">시설 사진</Label>
                    <div className="border-2 border-dashed rounded-lg p-6">
                      <label
                        htmlFor="facilityImages"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">
                          클릭하여 사진 업로드 (여러 장 선택 가능)
                        </span>
                        <input
                          id="facilityImages"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFacilityImagesUpload}
                          className="hidden"
                          aria-label="시설 사진 업로드"
                        />
                      </label>
                      {isUploadingFacilityImages && (
                        <div className="mt-2">
                          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                        </div>
                      )}
                      {facilityImages.length > 0 && (
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          {facilityImages.map((url, index) => (
                            <div key={index} className="relative">
                              <img
                                src={url}
                                alt={`시설 사진 ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute top-1 right-1"
                                onClick={() => {
                                  setFacilityImages((prev) => prev.filter((_, i) => i !== index))
                                  setFacilityImageFiles((prev) => prev.filter((_, i) => i !== index))
                                }}
                                aria-label={`사진 ${index + 1} 제거`}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="introduction">시설 소개글</Label>
                    <Textarea
                      id="introduction"
                      value={introduction}
                      onChange={(e) => setIntroduction(e.target.value)}
                      placeholder="시설에 대한 소개글을 작성해주세요"
                      rows={6}
                      className="focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 네비게이션 버튼 */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  if (currentStep === 1) {
                    setUserType(null)
                  } else {
                    setCurrentStep((prev) => prev - 1)
                  }
                }}
                disabled={isSubmitting}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                {currentStep === 1 ? "뒤로 가기" : "이전"}
              </Button>
              <Button
                onClick={handleFacilityManagerSubmit}
                disabled={isSubmitting || (currentStep < 4 && !isStepValid(currentStep))}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    제출 중...
                  </>
                ) : currentStep === 4 ? (
                  "제출하기"
                ) : (
                  <>
                    다음
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}

