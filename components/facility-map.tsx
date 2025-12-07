"use client"

import { useEffect, useRef, useState } from "react"
import Script from "next/script"

// 타입 정의 (필요에 따라 확장 가능)
type LatLng = {
  lat: number
  lng: number
}

interface FacilityMapProps {
  facilities: any[]
  center: LatLng
  userLocation?: LatLng | null
  onFacilityClick?: (facility: any) => void
}

export default function FacilityMap({
  facilities = [],
  center,
  userLocation,
  onFacilityClick,
}: FacilityMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<naver.maps.Map | null>(null)
  const markersRef = useRef<naver.maps.Marker[]>([]) // 시설 마커 관리
  const userMarkerRef = useRef<naver.maps.Marker | null>(null) // 내 위치 마커 관리
  const infoWindowRef = useRef<naver.maps.InfoWindow | null>(null) // 정보창 관리

  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID

  // 1. 유효 데이터 필터링
  const validFacilities = Array.isArray(facilities)
    ? facilities.filter(
        (f) => f.lat && f.lng && !isNaN(Number(f.lat)) && !isNaN(Number(f.lng))
      )
    : []

  // 2. 마커 색상 및 아이콘 생성 로직 (Native API용 HTML 문자열)
  const createMarkerContent = (facility: any) => {
    let color = "#10b981" // 기본 초록 (여유)
    
    if (facility.isAccessible) {
      color = "#8b5cf6" // 보라 (접근성)
    } else if (
      facility.real_time_level === "혼잡" ||
      facility.congestion === "crowded"
    ) {
      color = "#ef4444" // 빨강
    } else if (
      facility.real_time_level === "보통" ||
      facility.congestion === "moderate"
    ) {
      color = "#f59e0b" // 주황
    }

    const isAccessible = facility.isAccessible

    return `
      <div style="
        width: 32px; height: 32px; background: ${color};
        border: 3px solid white; border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
        color: white; font-size: 18px; cursor: pointer;
      ">
        ${isAccessible ? "♿" : "🏃"}
      </div>
    `
  }

  // 3. 지도 초기화 함수
  const initMap = () => {
    if (!mapRef.current || !window.naver) return

    // 지도 옵션 설정
    const mapOptions = {
      center: new naver.maps.LatLng(Number(center.lat), Number(center.lng)),
      zoom: 15,
      minZoom: 10,
      scaleControl: false,
      mapDataControl: false,
      logoControlOptions: {
        position: naver.maps.Position.BOTTOM_RIGHT,
      },
    }

    // 지도 생성
    mapInstance.current = new naver.maps.Map(mapRef.current, mapOptions)

    // 지도 클릭 시 정보창 닫기
    naver.maps.Event.addListener(mapInstance.current, "click", () => {
      if (infoWindowRef.current) {
        infoWindowRef.current.close()
        infoWindowRef.current = null
      }
    })
  }

  // 4. 스크립트 로드 완료 시 지도 초기화
  useEffect(() => {
    if (isScriptLoaded) {
      initMap()
    }
  }, [isScriptLoaded])

  // 5. 중심점 변경 시 지도 이동
  useEffect(() => {
    if (mapInstance.current && center) {
      const newCenter = new naver.maps.LatLng(Number(center.lat), Number(center.lng))
      mapInstance.current.panTo(newCenter)
    }
  }, [center, isScriptLoaded])

  // 6. 시설 마커 렌더링 (facilities 변경 시 실행)
  useEffect(() => {
    if (!mapInstance.current || !window.naver) return

    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []

    // 정보창 닫기 (데이터가 바뀌면 닫는 것이 안전)
    if (infoWindowRef.current) {
      infoWindowRef.current.close()
    }

    validFacilities.forEach((facility) => {
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(Number(facility.lat), Number(facility.lng)),
        map: mapInstance.current!,
        title: facility.name,
        icon: {
          content: createMarkerContent(facility),
          size: new naver.maps.Size(32, 32),
          anchor: new naver.maps.Point(16, 16),
        },
      })

      // 마커 클릭 이벤트
      naver.maps.Event.addListener(marker, "click", () => {
        // 부모 컴포넌트로 이벤트 전달
        if (onFacilityClick) onFacilityClick(facility)

        // 정보창 생성 및 표시
        const contentString = `
          <div style="padding:12px; min-width:200px; max-width:300px; background:white; border-radius:8px; box-shadow:0 2px 6px rgba(0,0,0,0.1);">
            <h3 style="margin:0 0 8px 0; font-size:16px; font-weight:bold; color:#1f2937;">${facility.name}</h3>
            ${
              facility.address
                ? `<p style="margin:0 0 8px 0; font-size:12px; color:#6b7280;">📍 ${facility.address}</p>`
                : ""
            }
            ${
              facility.real_time_level
                ? `<div style="margin:0 0 8px 0; font-size:12px; color:#374151;">📊 실시간: ${facility.real_time_level}</div>`
                : ""
            }
             ${
               facility.isAccessible
                 ? `<div style="margin:0 0 8px 0; font-size:12px; color:#8b5cf6;">♿ 접근성 시설</div>`
                 : ""
             }
          </div>
        `

        const newInfoWindow = new naver.maps.InfoWindow({
          content: contentString,
          borderWidth: 0,
          backgroundColor: "transparent",
          anchorSize: new naver.maps.Size(10, 10),
          pixelOffset: new naver.maps.Point(0, -5),
        })

        // 기존 정보창이 있으면 닫기
        if (infoWindowRef.current) {
          infoWindowRef.current.close()
        }

        newInfoWindow.open(mapInstance.current!, marker)
        infoWindowRef.current = newInfoWindow
      })

      markersRef.current.push(marker)
    })
  }, [facilities, isScriptLoaded]) // facilities가 바뀔 때마다 실행

  // 7. 내 위치 마커 렌더링 (userLocation 변경 시 실행)
  useEffect(() => {
    if (!mapInstance.current || !window.naver) return

    // 기존 내 위치 마커 제거
    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null)
    }

    if (userLocation) {
      userMarkerRef.current = new naver.maps.Marker({
        position: new naver.maps.LatLng(Number(userLocation.lat), Number(userLocation.lng)),
        map: mapInstance.current!,
        title: "내 위치",
        icon: {
          content: `
            <div style="
              width: 20px; height: 20px; background: #8b5cf6;
              border: 3px solid white; border-radius: 50%;
              box-shadow: 0 0 5px rgba(0,0,0,0.3);
            "></div>
          `,
          anchor: new naver.maps.Point(10, 10),
        },
      })
    }
  }, [userLocation, isScriptLoaded])

  if (!clientId) {
    return (
      <div className="flex items-center justify-center w-full h-[400px] bg-slate-100 text-slate-500 rounded-2xl">
        <p>네이버 지도 Client ID가 설정되지 않았습니다.</p>
      </div>
    )
  }

  return (
    <>
      {/* 
        ✅ 핵심 수정 사항: 
        react-naver-maps 대신 Next.js Script 태그를 사용하여 URL 파라미터를 'ncpKeyId'로 직접 지정합니다.
      */}
      <Script
        strategy="afterInteractive"
        src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`}
        onReady={() => {
          setIsScriptLoaded(true)
        }}
      />
      
      {/* 지도가 렌더링될 DOM 엘리먼트 */}
      <div ref={mapRef} className="w-full h-full min-h-[400px]" />
    </>
  )
}