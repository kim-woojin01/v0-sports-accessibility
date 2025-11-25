"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Pencil, Trash2 } from "lucide-react"

interface Notice {
  id: number
  category: string
  title: string
  content: string
  created_at: string
  is_important: boolean
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null)
  
  // 공지사항 추가 폼 상태
  const [newNotice, setNewNotice] = useState({
    category: '',
    title: '',
    content: '',
    isImportant: false,
  })
  
  // 공지사항 수정 폼 상태
  const [editNotice, setEditNotice] = useState({
    category: '',
    title: '',
    content: '',
    isImportant: false,
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // localStorage에서 사용자 정보 확인
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        if (user.idEmail === 'admin') {
          setIsAdmin(true)
        }
      } catch (e) {
        console.error('사용자 정보 파싱 오류:', e)
      }
    }

    const fetchNotices = async () => {
      try {
        const response = await fetch('/api/notices')
        const data = await response.json()
        setNotices(data.notices || [])
      } catch (error) {
        console.error('공지사항 로드 오류:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotices()
  }, [])

  const handleAddNotice = async () => {
    if (!newNotice.category || !newNotice.title || !newNotice.content) {
      alert('모든 필드를 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        alert('로그인이 필요합니다.')
        return
      }

      const user = JSON.parse(userStr)

      const response = await fetch(`/api/notices?userId=${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: newNotice.category,
          title: newNotice.title,
          content: newNotice.content,
          isImportant: newNotice.isImportant,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || '공지사항 추가 중 오류가 발생했습니다.')
        return
      }

      // 성공 시 폼 초기화 및 목록 새로고침
      setNewNotice({
        category: '',
        title: '',
        content: '',
        isImportant: false,
      })
      setIsDialogOpen(false)
      await refreshNotices()
      alert('공지사항이 추가되었습니다.')
    } catch (error) {
      console.error('공지사항 추가 오류:', error)
      alert('공지사항 추가 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditNotice = (notice: Notice) => {
    setSelectedNotice(notice)
    setEditNotice({
      category: notice.category,
      title: notice.title,
      content: notice.content,
      isImportant: notice.is_important,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateNotice = async () => {
    if (!selectedNotice || !editNotice.category || !editNotice.title || !editNotice.content) {
      alert('모든 필드를 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        alert('로그인이 필요합니다.')
        return
      }

      const user = JSON.parse(userStr)

      const response = await fetch(`/api/notices?userId=${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedNotice.id,
          category: editNotice.category,
          title: editNotice.title,
          content: editNotice.content,
          isImportant: editNotice.isImportant,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || '공지사항 수정 중 오류가 발생했습니다.')
        return
      }

      setIsEditDialogOpen(false)
      setSelectedNotice(null)
      await refreshNotices()
      alert('공지사항이 수정되었습니다.')
    } catch (error) {
      console.error('공지사항 수정 오류:', error)
      alert('공지사항 수정 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteNotice = async (noticeId: number) => {
    setIsSubmitting(true)
    try {
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        alert('로그인이 필요합니다.')
        return
      }

      const user = JSON.parse(userStr)

      const response = await fetch(`/api/notices?id=${noticeId}&userId=${user.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || '공지사항 삭제 중 오류가 발생했습니다.')
        return
      }

      setIsDeleteDialogOpen(false)
      setSelectedNotice(null)
      await refreshNotices()
      alert('공지사항이 삭제되었습니다.')
    } catch (error) {
      console.error('공지사항 삭제 오류:', error)
      alert('공지사항 삭제 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const refreshNotices = async () => {
    try {
      const response = await fetch('/api/notices')
      const data = await response.json()
      setNotices(data.notices || [])
    } catch (error) {
      console.error('공지사항 새로고침 오류:', error)
    }
  }

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case '업데이트':
        return 'bg-purple-100 text-purple-700 hover:bg-purple-200'
      case '점검':
        return 'bg-orange-100 text-orange-700 hover:bg-orange-200'
      case '이벤트':
        return 'bg-pink-100 text-pink-700 hover:bg-pink-200'
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="container py-12 max-w-4xl mx-auto pt-24 px-4">
        <div className="text-center">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="container py-12 max-w-4xl mx-auto pt-24 px-4">
      {/* 헤더 */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1"></div>
          <h1 className="text-4xl md:text-5xl font-bold flex-1 text-slate-900">공지사항</h1>
          <div className="flex-1 flex justify-end">
            {isAdmin && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    공지사항 추가
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>공지사항 추가</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="category">카테고리 *</Label>
                      <Select
                        value={newNotice.category}
                        onValueChange={(value) =>
                          setNewNotice({ ...newNotice, category: value })
                        }
                      >
                        <SelectTrigger id="category" aria-label="카테고리 선택">
                          <SelectValue placeholder="카테고리를 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="업데이트">업데이트</SelectItem>
                          <SelectItem value="점검">점검</SelectItem>
                          <SelectItem value="이벤트">이벤트</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="title">제목 *</Label>
                      <Input
                        id="title"
                        value={newNotice.title}
                        onChange={(e) =>
                          setNewNotice({ ...newNotice, title: e.target.value })
                        }
                        placeholder="공지사항 제목을 입력하세요"
                        aria-label="공지사항 제목"
                      />
                    </div>
                    <div>
                      <Label htmlFor="content">내용 *</Label>
                      <Textarea
                        id="content"
                        value={newNotice.content}
                        onChange={(e) =>
                          setNewNotice({ ...newNotice, content: e.target.value })
                        }
                        placeholder="공지사항 내용을 입력하세요"
                        rows={10}
                        aria-label="공지사항 내용"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isImportant"
                        checked={newNotice.isImportant}
                        onCheckedChange={(checked) =>
                          setNewNotice({ ...newNotice, isImportant: checked === true })
                        }
                        aria-label="중요 공지로 설정"
                      />
                      <Label
                        htmlFor="isImportant"
                        className="text-sm font-normal cursor-pointer"
                      >
                        중요 공지로 설정
                      </Label>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        취소
                      </Button>
                      <Button
                        onClick={handleAddNotice}
                        disabled={isSubmitting}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {isSubmitting ? '추가 중...' : '추가'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
        <p className="text-lg text-muted-foreground">
          SportsAccess의 새로운 소식과 업데이트를 알려드립니다.
        </p>
      </div>

      {/* 공지사항 리스트 */}
      {notices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">등록된 공지사항이 없습니다.</p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="w-full space-y-4">
          <ul className="space-y-4" role="list" aria-label="공지사항 목록">
            {notices.map((notice) => (
              <li key={notice.id} role="listitem">
                <AccordionItem value={`notice-${notice.id}`} className="border rounded-lg">
                  <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4 w-full text-left">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge 
                            className={getCategoryBadgeColor(notice.category)}
                            aria-label={`카테고리: ${notice.category}`}
                          >
                            {notice.category}
                          </Badge>
                          {notice.is_important && (
                            <Badge className="bg-red-100 text-red-700 hover:bg-red-200" aria-label="중요 공지">
                              중요
                            </Badge>
                          )}
                          <h3 className="font-semibold text-base md:text-lg">
                            {notice.title}
                          </h3>
                        </div>
                        <time 
                          dateTime={notice.created_at} 
                          className="text-sm text-muted-foreground shrink-0"
                        >
                          {formatDate(notice.created_at)}
                        </time>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <CardContent className="px-6 pt-0 pb-6">
                        <div 
                          className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap mb-4"
                          dangerouslySetInnerHTML={{ __html: notice.content.replace(/\n/g, '<br />') }}
                        />
                        {isAdmin && (
                          <div className="flex gap-2 justify-end mt-4 pt-4 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditNotice(notice)
                              }}
                              aria-label={`${notice.title} 수정`}
                            >
                              <Pencil className="h-4 w-4 mr-2" aria-hidden="true" />
                              수정
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedNotice(notice)
                                setIsDeleteDialogOpen(true)
                              }}
                              aria-label={`${notice.title} 삭제`}
                            >
                              <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                              삭제
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              </li>
            ))}
          </ul>
        </Accordion>
      )}

      {/* 수정 Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>공지사항 수정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="edit-category">카테고리 *</Label>
              <Select
                value={editNotice.category}
                onValueChange={(value) =>
                  setEditNotice({ ...editNotice, category: value })
                }
              >
                <SelectTrigger id="edit-category" aria-label="카테고리 선택">
                  <SelectValue placeholder="카테고리를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="업데이트">업데이트</SelectItem>
                  <SelectItem value="점검">점검</SelectItem>
                  <SelectItem value="이벤트">이벤트</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-title">제목 *</Label>
              <Input
                id="edit-title"
                value={editNotice.title}
                onChange={(e) =>
                  setEditNotice({ ...editNotice, title: e.target.value })
                }
                placeholder="공지사항 제목을 입력하세요"
                aria-label="공지사항 제목"
              />
            </div>
            <div>
              <Label htmlFor="edit-content">내용 *</Label>
              <Textarea
                id="edit-content"
                value={editNotice.content}
                onChange={(e) =>
                  setEditNotice({ ...editNotice, content: e.target.value })
                }
                placeholder="공지사항 내용을 입력하세요"
                rows={10}
                aria-label="공지사항 내용"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-isImportant"
                checked={editNotice.isImportant}
                onCheckedChange={(checked) =>
                  setEditNotice({ ...editNotice, isImportant: checked === true })
                }
                aria-label="중요 공지로 설정"
              />
              <Label
                htmlFor="edit-isImportant"
                className="text-sm font-normal cursor-pointer"
              >
                중요 공지로 설정
              </Label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setSelectedNotice(null)
                }}
              >
                취소
              </Button>
              <Button
                onClick={handleUpdateNotice}
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? '수정 중...' : '수정'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>공지사항 삭제</DialogTitle>
            <DialogDescription>
              정말로 이 공지사항을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
            {selectedNotice && (
              <div className="mt-2 p-2 bg-muted rounded">
                <strong>{selectedNotice.title}</strong>
              </div>
            )}
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setSelectedNotice(null)
              }}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedNotice) {
                  handleDeleteNotice(selectedNotice.id)
                }
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? '삭제 중...' : '삭제'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

