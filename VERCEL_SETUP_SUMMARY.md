# Vercel 배포 설정 완료 요약

## ✅ 완료된 작업

### 1. 코드 수정 완료
- ✅ 모든 API 라우트의 DB 연결 설정을 51173 포트로 통일
- ✅ 연결 안정성 옵션 추가 (timeout, reconnect)
- ✅ 에러 로깅 개선 (상세한 디버깅 정보)
- ✅ `src/lib/db.ts`가 `RAILWAY_*` 환경 변수 지원하도록 수정
- ✅ 모든 API가 동일한 DB 설정을 사용하도록 통일

### 2. 수정된 파일 목록
- `app/api/facilities/route.ts` - 시설 데이터 조회
- `app/api/reviews/route.ts` - 리뷰 시스템
- `app/api/reviews/[id]/route.ts` - 개별 리뷰
- `app/api/usage/route.ts` - 이용 내역
- `app/api/favorites/route.ts` - 즐겨찾기
- `app/api/facility-requests/route.ts` - 시설 요청
- `app/api/facility-requests/[id]/route.ts` - 개별 요청
- `src/lib/db.ts` - 인증 시스템용 DB 연결

## 🔧 Vercel에 추가해야 할 환경 변수

**Vercel 대시보드 → Settings → Environment Variables**에서 다음 변수들을 추가하세요:

```
RAILWAY_HOST=nozomi.proxy.rlwy.net
RAILWAY_PORT=51173
RAILWAY_USER=root
RAILWAY_PASSWORD=lRzqwghWSchqdRyErESveHwVyKYUfhME
RAILWAY_DATABASE=railway
```

**⚠️ 중요 사항:**
1. 각 변수 추가 시 **Production, Preview, Development 모두 선택**
2. 환경 변수 추가 후 **반드시 재배포** 필요
3. 기존 `MYSQL_*` 변수는 그대로 두어도 됩니다 (사용하지 않음)

## 📊 데이터베이스 구조

51173 Railway DB에 다음 테이블들이 있어야 합니다:

### 시설 관련
- `facility` - 일반 시설 정보
- `accessible_facility` - 접근성 시설 정보
- `facility_logs` - 시설 이용 로그 (혼잡도 계산용)

### 사용자 관련
- `users` - 사용자 정보
- `deleted_users` - 삭제된 사용자 (7일 복구 가능)

### 기능 관련
- `facility_reviews` - 리뷰
- `facility_usage` - 이용 내역
- `facility_favorites` - 즐겨찾기
- `facility_requests` - 시설 요청
- `notices` - 공지사항

## 🚀 배포 후 확인 사항

### 1. 환경 변수 확인
- Vercel 대시보드에서 모든 `RAILWAY_*` 변수가 설정되어 있는지 확인
- 포트 번호가 **51173**인지 확인
- 호스트가 **nozomi.proxy.rlwy.net**인지 확인

### 2. 기능 테스트
- ✅ 시설 검색 페이지 (`/search`) - 시설 목록 표시 확인
- ✅ 리뷰 페이지 (`/reviews`) - 리뷰 목록 표시 확인
- ✅ 마이페이지 (`/mypage`) - 이용 내역 표시 확인
- ✅ 로그인/회원가입 - 인증 시스템 작동 확인

### 3. 에러 확인
- Vercel 로그에서 에러 메시지 확인
- 개선된 에러 로깅으로 상세한 디버깅 정보 확인 가능

## 🔍 문제 해결

### 500 Internal Server Error 발생 시

1. **Vercel 로그 확인**
   ```
   Vercel 대시보드 → 프로젝트 → Logs 탭
   ```
   - DB 연결 실패 원인 확인
   - 에러 코드 및 메시지 확인
   - 사용된 DB 설정 정보 확인

2. **환경 변수 재확인**
   - 모든 `RAILWAY_*` 변수가 설정되어 있는지
   - 변수 이름에 오타가 없는지 (대소문자 구분)
   - 포트 번호가 51173인지

3. **재배포**
   - 환경 변수 변경 후 반드시 재배포
   - Deployments → 최신 배포 → Redeploy

## 📝 기술적 개선 사항

### 연결 안정성
- `connectTimeout: 10000` - 연결 타임아웃 10초
- `reconnect: true` - 자동 재연결
- `timeout: 10000` - 쿼리 타임아웃 10초

### 에러 핸들링
- 상세한 에러 로깅 (호스트, 포트, 데이터베이스 정보 포함)
- DB 연결 실패 시 명확한 에러 메시지
- 연결 종료 시 안전한 처리

### 환경 변수 지원
- `RAILWAY_*` 변수 우선 사용
- `RAILWAY_REVIEWS_*` 변수 대체 지원
- 기본값 제공 (개발 환경용)

## ✅ 최종 확인

배포 전 확인 사항:
- [ ] Vercel에 모든 `RAILWAY_*` 환경 변수 추가 완료
- [ ] 환경 변수가 Production, Preview, Development에 모두 설정됨
- [ ] 51173 Railway DB에 모든 테이블이 존재함
- [ ] 로컬에서 `.env.local`에 동일한 값으로 테스트 완료
- [ ] 재배포 완료

배포 후 확인 사항:
- [ ] 시설 검색 페이지가 정상 작동함
- [ ] 리뷰 시스템이 정상 작동함
- [ ] 이용 내역이 정상 표시됨
- [ ] 로그인/회원가입이 정상 작동함
- [ ] Vercel 로그에 에러가 없음

---

**모든 설정이 완료되면 Vercel에서 재배포하세요!** 🚀

