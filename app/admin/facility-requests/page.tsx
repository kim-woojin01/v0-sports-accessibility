"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft, FileText, Search, CheckCircle2, XCircle, Clock, Eye, Trash2, MessageSquare } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import Image from "next/image"

interface FacilityRequest {
  id: number
  request_type: 'user' | 'facility_manager'
  facility_name: string
  request_category: string | null
  content: string
  attachment_url: string | null
  business_registration_url: string | null
  representative_name: string | null
  phone: string | null
  operating_hours: any
  accessibility_features: string[] | null
  facility_images: string[] | null
  introduction: string | null
  status: '대기중' | '승인' | '반려'
  user_id: number
  admin_comment: string | null
  created_at: string
  updated_at: string
  user_name: string | null
  user_email: string | null
}

export default function AdminFacilityRequestsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [requests, setRequests] = useState<FacilityRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<FacilityRequest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [selectedRequest, setSelectedRequest] = useState<FacilityRequest | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<'대기중' | '승인' | '반려'>('대기중')
  const [adminComment, setAdminComment] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const checkAdmin = async () => {
      const userStr = localStorage.getItem("user")
      if (!userStr) {
        router.push("/signin")
        return
      }

      try {
        const user = JSON.parse(userStr)
        if (user.idEmail === "admin") {
          setIsAdmin(true)
          const uid = user.id.toString()
          setUserId(uid)
          await loadRequests(uid)
        } else {
          router.push("/")
        }
      } catch (error) {
        console.error("사용자 정보 파싱 오류:", error)
        router.push("/signin")
      } finally {
        setIsLoading(false)
      }
    }

    checkAdmin()
  }, [router])

  const loadRequests = async (uid: string) => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (typeFilter !== "all") params.append("requestType", typeFilter)

      const response = await fetch(`/api/facility-requests?${params.toString()}`, {
        headers: {
          "x-user-id": uid,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("요청 목록 조회 실패:", response.status, errorData)
        throw new Error(errorData.message || `요청 목록 조회 실패 (${response.status})`)
      }

      const data = await response.json()
      setRequests(data.requests || [])
      setFilteredRequests(data.requests || [])
    } catch (error) {
      console.error("요청 목록 로드 오류:", error)
      setRequests([])
      setFilteredRequests([])
    }
  }

  useEffect(() => {
    if (userId) {
      loadRequests(userId)
    }
  }, [statusFilter, typeFilter, userId])

  useEffect(() => {
    if (searchTerm) {
      const filtered = requests.filter(
        (req) =>
          req.facility_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (req.user_name && req.user_name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredRequests(filtered)
    } else {
      setFilteredRequests(requests)
    }
  }, [searchTerm, requests])

  const handleViewDetail = async (request: FacilityRequest) => {
    if (!userId) return

    try {
      const response = await fetch(`/api/facility-requests/${request.id}`, {
        headers: {
          "x-user-id": userId,
        },
      })

      if (!response.ok) {
        throw new Error("요청 상세 조회 실패")
      }

      const data = await response.json()
      setSelectedRequest(data.request)
      setNewStatus(data.request.status)
      setAdminComment(data.request.admin_comment || "")
      setIsDetailDialogOpen(true)
    } catch (error) {
      console.error("요청 상세 로드 오류:", error)
      alert("요청 상세 정보를 불러올 수 없습니다.")
    }
  }

  const handleUpdateStatus = async () => {
    if (!userId || !selectedRequest) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/facility-requests/${selectedRequest.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({
          status: newStatus,
          adminComment: adminComment || null,
        }),
      })

      if (!response.ok) {
        throw new Error("상태 업데이트 실패")
      }

      alert("요청 상태가 업데이트되었습니다.")
      setIsStatusDialogOpen(false)
      setIsDetailDialogOpen(false)
      if (userId) await loadRequests(userId)
    } catch (error) {
      console.error("상태 업데이트 오류:", error)
      alert("상태 업데이트 중 오류가 발생했습니다.")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (requestId: number) => {
    if (!userId) return
    if (!confirm("정말 이 요청을 삭제하시겠습니까?")) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/facility-requests/${requestId}`, {
        method: "DELETE",
        headers: {
          "x-user-id": userId,
        },
      })

      if (!response.ok) {
        throw new Error("요청 삭제 실패")
      }

      alert("요청이 삭제되었습니다.")
      if (userId) await loadRequests(userId)
    } catch (error) {
      console.error("요청 삭제 오류:", error)
      alert("요청 삭제 중 오류가 발생했습니다.")
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "승인":
        return <Badge className="bg-green-500">승인</Badge>
      case "반려":
        return <Badge className="bg-red-500">반려</Badge>
      default:
        return <Badge className="bg-yellow-500">대기중</Badge>
    }
  }

  const getTypeLabel = (type: string) => {
    return type === "user" ? "일반 사용자" : "시설관리자"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gradient-to-br from-purple-50 via-purple-100 to-pink-100">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            관리자 대시보드로 돌아가기
          </Button>
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold">시설 정보 수정 요청 관리</h1>
          </div>
        </div>

        {/* 필터 및 검색 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="시설명, 내용, 작성자로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="상태 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 상태</SelectItem>
                  <SelectItem value="대기중">대기중</SelectItem>
                  <SelectItem value="승인">승인</SelectItem>
                  <SelectItem value="반려">반려</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="유형 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 유형</SelectItem>
                  <SelectItem value="user">일반 사용자</SelectItem>
                  <SelectItem value="facility_manager">시설관리자</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 요청 목록 */}
        <div className="grid gap-4">
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                요청이 없습니다.
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{request.facility_name}</h3>
                        {getStatusBadge(request.status)}
                        <Badge variant="outline">{getTypeLabel(request.request_type)}</Badge>
                        {request.request_category && (
                          <Badge variant="secondary">{request.request_category}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {request.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>작성자: {request.user_name || request.user_email || "알 수 없음"}</span>
                        <span>•</span>
                        <span>{new Date(request.created_at).toLocaleString("ko-KR")}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetail(request)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        상세보기
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(request.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        삭제
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* 상세 보기 다이얼로그 */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedRequest?.facility_name}</DialogTitle>
              <DialogDescription>
                요청 상세 정보 및 관리
              </DialogDescription>
            </DialogHeader>

            {selectedRequest && (
              <div className="space-y-6">
                {/* 기본 정보 */}
                <div>
                  <h3 className="font-semibold mb-2">기본 정보</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">요청 유형:</span>{" "}
                      {getTypeLabel(selectedRequest.request_type)}
                    </div>
                    <div>
                      <span className="text-muted-foreground">상태:</span>{" "}
                      {getStatusBadge(selectedRequest.status)}
                    </div>
                    {selectedRequest.request_category && (
                      <div>
                        <span className="text-muted-foreground">카테고리:</span>{" "}
                        {selectedRequest.request_category}
                      </div>
                    )}
                    {selectedRequest.phone && (
                      <div>
                        <span className="text-muted-foreground">전화번호:</span>{" "}
                        {selectedRequest.phone}
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">작성자:</span>{" "}
                      {selectedRequest.user_name || selectedRequest.user_email || "알 수 없음"}
                    </div>
                    <div>
                      <span className="text-muted-foreground">작성일:</span>{" "}
                      {new Date(selectedRequest.created_at).toLocaleString("ko-KR")}
                    </div>
                  </div>
                </div>

                {/* 내용 */}
                <div>
                  <h3 className="font-semibold mb-2">상세 내용</h3>
                  <p className="text-sm whitespace-pre-wrap bg-slate-50 p-4 rounded-lg">
                    {selectedRequest.content}
                  </p>
                </div>

                {/* 시설관리자 전용 정보 */}
                {selectedRequest.request_type === "facility_manager" && (
                  <>
                    {selectedRequest.representative_name && (
                      <div>
                        <h3 className="font-semibold mb-2">대표자명</h3>
                        <p className="text-sm">{selectedRequest.representative_name}</p>
                      </div>
                    )}

                    {selectedRequest.operating_hours && (
                      <div>
                        <h3 className="font-semibold mb-2">운영 시간</h3>
                        <div className="text-sm space-y-1">
                          {Object.entries(selectedRequest.operating_hours).map(([day, hours]: [string, any]) => (
                            <div key={day} className="flex items-center gap-2">
                              <span className="w-20">{day}:</span>
                              {hours.closed ? (
                                <span className="text-muted-foreground">휴무</span>
                              ) : (
                                <span>{hours.open} ~ {hours.close}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedRequest.accessibility_features && selectedRequest.accessibility_features.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">접근성 정보</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedRequest.accessibility_features.map((feature, idx) => (
                            <Badge key={idx} variant="secondary">{feature}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedRequest.introduction && (
                      <div>
                        <h3 className="font-semibold mb-2">시설 소개</h3>
                        <p className="text-sm whitespace-pre-wrap bg-slate-50 p-4 rounded-lg">
                          {selectedRequest.introduction}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* 첨부 파일 */}
                {(selectedRequest.attachment_url || selectedRequest.business_registration_url || selectedRequest.facility_images) && (
                  <div>
                    <h3 className="font-semibold mb-2">첨부 파일</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedRequest.attachment_url && (
                        <div className="relative aspect-video rounded-lg overflow-hidden border">
                          <Image
                            src={selectedRequest.attachment_url}
                            alt="첨부 사진"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      {selectedRequest.business_registration_url && (
                        <div className="relative aspect-video rounded-lg overflow-hidden border">
                          <Image
                            src={selectedRequest.business_registration_url}
                            alt="사업자 등록증"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      {selectedRequest.facility_images && selectedRequest.facility_images.map((url, idx) => (
                        <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border">
                          <Image
                            src={url}
                            alt={`시설 사진 ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 관리자 코멘트 */}
                {selectedRequest.admin_comment && (
                  <div>
                    <h3 className="font-semibold mb-2">관리자 코멘트</h3>
                    <p className="text-sm whitespace-pre-wrap bg-purple-50 p-4 rounded-lg">
                      {selectedRequest.admin_comment}
                    </p>
                  </div>
                )}

                {/* 상태 변경 */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-4">상태 변경</h3>
                  <div className="space-y-4">
                    <Select value={newStatus} onValueChange={(value: any) => setNewStatus(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="대기중">대기중</SelectItem>
                        <SelectItem value="승인">승인</SelectItem>
                        <SelectItem value="반려">반려</SelectItem>
                      </SelectContent>
                    </Select>
                    <div>
                      <label className="text-sm font-medium mb-2 block">관리자 코멘트</label>
                      <Textarea
                        value={adminComment}
                        onChange={(e) => setAdminComment(e.target.value)}
                        placeholder="상태 변경 사유나 코멘트를 입력하세요..."
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                닫기
              </Button>
              <Button
                onClick={handleUpdateStatus}
                disabled={isUpdating}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    업데이트 중...
                  </>
                ) : (
                  "상태 업데이트"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

