"use client"

import { useState, useEffect, useRef } from "react"

interface TimePickerProps {
  value?: { hour: number; minute: number }
  onChange?: (time: { hour: number; minute: number }) => void
  defaultHour?: number
  defaultMinute?: number
  className?: string
}

export function TimePicker({
  value,
  onChange,
  defaultHour = 12,
  defaultMinute = 0,
  className = "",
}: TimePickerProps) {
  const [selectedHour, setSelectedHour] = useState(value?.hour ?? defaultHour)
  const [selectedMinute, setSelectedMinute] = useState(value?.minute ?? defaultMinute)

  const hourScrollRef = useRef<HTMLDivElement>(null)
  const minuteScrollRef = useRef<HTMLDivElement>(null)
  const hourScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const minuteScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const ITEM_HEIGHT = 48
  const VISIBLE_ITEMS = 4 // 화면에 보이는 항목 수
  const COLUMN_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS // 192px
  const HOURS = Array.from({ length: 24 }, (_, i) => i) // 00~23
  const MINUTES = [0, 10, 20, 30, 40, 50] // 10분 단위

  // value prop이 변경되면 내부 상태 및 스크롤 위치 업데이트
  useEffect(() => {
    if (value) {
      setSelectedHour(value.hour)
      setSelectedMinute(value.minute)
      
      // 스크롤 위치도 업데이트
      setTimeout(() => {
        if (hourScrollRef.current) {
          hourScrollRef.current.scrollTop = value.hour * ITEM_HEIGHT
        }
        if (minuteScrollRef.current) {
          const minuteIndex = MINUTES.indexOf(value.minute)
          if (minuteIndex !== -1) {
            minuteScrollRef.current.scrollTop = minuteIndex * ITEM_HEIGHT
          }
        }
      }, 0)
    }
  }, [value])

  // 초기 스크롤 위치 설정 (컴포넌트 마운트 시)
  useEffect(() => {
    const initializeScroll = () => {
      if (hourScrollRef.current && hourScrollRef.current.scrollTop === 0) {
        hourScrollRef.current.scrollTop = selectedHour * ITEM_HEIGHT
      }
      if (minuteScrollRef.current && minuteScrollRef.current.scrollTop === 0) {
        const minuteIndex = MINUTES.indexOf(selectedMinute)
        if (minuteIndex !== -1) {
          minuteScrollRef.current.scrollTop = minuteIndex * ITEM_HEIGHT
        }
      }
    }

    // DOM이 준비된 후 실행
    const timer = setTimeout(initializeScroll, 100)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 선택된 값 변경 시 onChange 호출
  useEffect(() => {
    if (onChange) {
      onChange({ hour: selectedHour, minute: selectedMinute })
    }
  }, [selectedHour, selectedMinute, onChange])

  const handleHourScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop
    const selectedIndex = Math.round(scrollTop / ITEM_HEIGHT)
    const clampedIndex = Math.max(0, Math.min(23, selectedIndex))

    if (clampedIndex !== selectedHour) {
      setSelectedHour(clampedIndex)
    }

    // 스크롤이 멈추면 가장 가까운 항목으로 스냅
    if (hourScrollTimeoutRef.current) {
      clearTimeout(hourScrollTimeoutRef.current)
    }
    hourScrollTimeoutRef.current = setTimeout(() => {
      if (hourScrollRef.current) {
        const currentScroll = hourScrollRef.current.scrollTop
        const nearestIndex = Math.round(currentScroll / ITEM_HEIGHT)
        const finalIndex = Math.max(0, Math.min(23, nearestIndex))
        hourScrollRef.current.scrollTo({
          top: finalIndex * ITEM_HEIGHT,
          behavior: "smooth",
        })
        setSelectedHour(finalIndex)
      }
    }, 150)
  }

  const handleMinuteScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop
    const selectedIndex = Math.round(scrollTop / ITEM_HEIGHT)
    const clampedIndex = Math.max(0, Math.min(5, selectedIndex))
    const newMinute = MINUTES[clampedIndex]

    if (newMinute !== undefined && newMinute !== selectedMinute) {
      setSelectedMinute(newMinute)
    }

    // 스크롤이 멈추면 가장 가까운 항목으로 스냅
    if (minuteScrollTimeoutRef.current) {
      clearTimeout(minuteScrollTimeoutRef.current)
    }
    minuteScrollTimeoutRef.current = setTimeout(() => {
      if (minuteScrollRef.current) {
        const currentScroll = minuteScrollRef.current.scrollTop
        const nearestIndex = Math.round(currentScroll / ITEM_HEIGHT)
        const finalIndex = Math.max(0, Math.min(5, nearestIndex))
        minuteScrollRef.current.scrollTo({
          top: finalIndex * ITEM_HEIGHT,
          behavior: "smooth",
        })
        setSelectedMinute(MINUTES[finalIndex])
      }
    }, 150)
  }

  const handleHourClick = (hour: number) => {
    setSelectedHour(hour)
    if (hourScrollRef.current) {
      hourScrollRef.current.scrollTo({
        top: hour * ITEM_HEIGHT,
        behavior: "smooth",
      })
    }
  }

  const handleMinuteClick = (minute: number) => {
    setSelectedMinute(minute)
    const minuteIndex = MINUTES.indexOf(minute)
    if (minuteScrollRef.current && minuteIndex !== -1) {
      minuteScrollRef.current.scrollTo({
        top: minuteIndex * ITEM_HEIGHT,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {/* 시간 선택 컬럼 */}
      <div className="relative overflow-hidden" style={{ width: '64px', height: COLUMN_HEIGHT }}>
        {/* 선택 영역 표시선 (가운데 강조) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div 
            className="w-full bg-gray-100/50 border-y border-gray-300 rounded-sm"
            style={{ height: ITEM_HEIGHT }}
          />
        </div>

        {/* 시간 스크롤 컨테이너 */}
        <div
          ref={hourScrollRef}
          className="h-full overflow-y-scroll hide-scrollbar"
          style={{
            scrollBehavior: 'smooth',
            scrollSnapType: 'y mandatory',
            WebkitOverflowScrolling: 'touch',
          }}
          onScroll={handleHourScroll}
        >
          {/* 상단 패딩 (가운데 정렬을 위한 여백) */}
          <div style={{ height: (COLUMN_HEIGHT - ITEM_HEIGHT) / 2 }} />

          {/* 시간 항목들 */}
          {HOURS.map((hour) => {
            const isSelected = hour === selectedHour
            return (
              <div
                key={hour}
                className="flex items-center justify-center cursor-pointer transition-all select-none touch-manipulation"
                style={{
                  height: ITEM_HEIGHT,
                  scrollSnapAlign: 'center',
                  scrollSnapStop: 'always',
                  color: isSelected ? '#1f2937' : '#9ca3af',
                  fontWeight: isSelected ? '700' : '400',
                  fontSize: isSelected ? '18px' : '16px',
                  lineHeight: '1',
                }}
                onClick={() => handleHourClick(hour)}
              >
                {hour.toString().padStart(2, '0')}
              </div>
            )
          })}

          {/* 하단 패딩 (가운데 정렬을 위한 여백) */}
          <div style={{ height: (COLUMN_HEIGHT - ITEM_HEIGHT) / 2 }} />
        </div>
      </div>

      {/* 구분자 */}
      <span className="text-xl font-bold text-gray-700" style={{ lineHeight: COLUMN_HEIGHT }}>
        :
      </span>

      {/* 분 선택 컬럼 */}
      <div className="relative overflow-hidden" style={{ width: '64px', height: COLUMN_HEIGHT }}>
        {/* 선택 영역 표시선 (가운데 강조) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div 
            className="w-full bg-gray-100/50 border-y border-gray-300 rounded-sm"
            style={{ height: ITEM_HEIGHT }}
          />
        </div>

        {/* 분 스크롤 컨테이너 */}
        <div
          ref={minuteScrollRef}
          className="h-full overflow-y-scroll hide-scrollbar"
          style={{
            scrollBehavior: 'smooth',
            scrollSnapType: 'y mandatory',
            WebkitOverflowScrolling: 'touch',
          }}
          onScroll={handleMinuteScroll}
        >
          {/* 상단 패딩 (가운데 정렬을 위한 여백) */}
          <div style={{ height: (COLUMN_HEIGHT - ITEM_HEIGHT) / 2 }} />

          {/* 분 항목들 */}
          {MINUTES.map((minute) => {
            const isSelected = minute === selectedMinute
            return (
              <div
                key={minute}
                className="flex items-center justify-center cursor-pointer transition-all select-none touch-manipulation"
                style={{
                  height: ITEM_HEIGHT,
                  scrollSnapAlign: 'center',
                  scrollSnapStop: 'always',
                  color: isSelected ? '#1f2937' : '#9ca3af',
                  fontWeight: isSelected ? '700' : '400',
                  fontSize: isSelected ? '18px' : '16px',
                  lineHeight: '1',
                }}
                onClick={() => handleMinuteClick(minute)}
              >
                {minute.toString().padStart(2, '0')}
              </div>
            )
          })}

          {/* 하단 패딩 (가운데 정렬을 위한 여백) */}
          <div style={{ height: (COLUMN_HEIGHT - ITEM_HEIGHT) / 2 }} />
        </div>
      </div>
    </div>
  )
}

export default TimePicker

