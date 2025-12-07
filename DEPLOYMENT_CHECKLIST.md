# 배포 체크리스트

## ✅ 완료된 작업

1. ✅ 모든 코드에서 44225 → 51173 포트 변경 완료
2. ✅ 모든 API 라우트의 DB 연결 설정 통일
3. ✅ 연결 안정성 옵션 추가 (connectTimeout, reconnect 등)
4. ✅ 에러 로깅 개선
5. ✅ `src/lib/db.ts`가 RAILWAY_* 변수 지원하도록 수정

## 🔧 Vercel 환경 변수 설정 (필수)

Vercel 대시보드에서 다음 환경 변수를 **반드시 추가**하세요:

```
RAILWAY_HOST=nozomi.proxy.rlwy.net
RAILWAY_PORT=51173
RAILWAY_USER=root
RAILWAY_PASSWORD=lRzqwghWSchqdRyErESveHwVyKYUfhME
RAILWAY_DATABASE=railway
```

**중요**: 
- Production, Preview, Development 모두에 설정
- 환경 변수 추가 후 **반드시 재배포** 필요

## 📋 데이터베이스 테이블 확인

51173 Railway DB에 다음 테이블들이 있어야 합니다:

### 필수 테이블
- ✅ `facility` - 시설 정보
- ✅ `facility_logs` - 시설 이용 로그
- ✅ `accessible_facility` - 접근성 시설 정보
- ✅ `facility_reviews` - 리뷰
- ✅ `facility_usage` - 이용 내역
- ✅ `facility_favorites` - 즐겨찾기
- ✅ `facility_requests` - 시설 요청
- ✅ `users` - 사용자
- ✅ `deleted_users` - 삭제된 사용자 (복구용)
- ✅ `notices` - 공지사항

## 🧪 테스트 항목

배포 후 다음 기능들을 테스트하세요:

1. **시설 검색** (`/search`)
   - 시설 목록이 정상적으로 표시되는지
   - 지도에 마커가 표시되는지
   - 필터링이 작동하는지

2. **리뷰 시스템** (`/reviews`)
   - 리뷰 목록이 표시되는지
   - 리뷰 작성이 가능한지
   - 시설명이 정상적으로 표시되는지

3. **이용 내역** (`/mypage`)
   - 이용 내역이 표시되는지
   - 시설 정보가 정상인지

4. **인증 시스템**
   - 로그인/회원가입이 작동하는지
   - 세션이 유지되는지

## 🔍 문제 해결

### 500 Internal Server Error 발생 시

1. **Vercel 로그 확인**
   - Vercel 대시보드 → 프로젝트 → "Logs" 탭
   - 개선된 에러 로깅으로 상세 정보 확인 가능

2. **환경 변수 확인**
   - 모든 `RAILWAY_*` 변수가 설정되어 있는지
   - 포트 번호가 51173인지
   - 호스트가 `nozomi.proxy.rlwy.net`인지

3. **DB 연결 테스트**
   - 로컬에서 `.env.local`에 동일한 값 설정 후 테스트
   - 로컬에서 작동하면 Vercel 환경 변수 문제

4. **재배포**
   - 환경 변수 변경 후 반드시 재배포

## 📝 참고사항

- 모든 API는 51173 포트의 Railway DB를 사용합니다
- `RAILWAY_*` 변수가 없으면 기본값(51173)을 사용합니다
- 연결 안정성을 위해 timeout 및 reconnect 옵션이 설정되어 있습니다
- 에러 발생 시 상세한 로그가 출력됩니다
