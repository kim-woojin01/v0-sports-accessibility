# Vercel 환경 변수 설정 가이드

Vercel에 배포된 앱에서 Railway 데이터베이스 연결을 위해 다음 환경 변수를 설정해야 합니다.

## 필수 환경 변수

Vercel 대시보드에서 다음 환경 변수를 설정하세요:

### Railway 데이터베이스 연결 정보 (51173 포트)

```
RAILWAY_HOST=nozomi.proxy.rlwy.net
RAILWAY_PORT=51173
RAILWAY_USER=root
RAILWAY_PASSWORD=lRzqwghWSchqdRyErESveHwVyKYUfhME
RAILWAY_DATABASE=railway
```

### 추가 환경 변수 (선택사항)

리뷰 시스템용 별도 연결이 필요한 경우:

```
RAILWAY_REVIEWS_HOST=nozomi.proxy.rlwy.net
RAILWAY_REVIEWS_PORT=51173
RAILWAY_REVIEWS_USER=root
RAILWAY_REVIEWS_PASSWORD=lRzqwghWSchqdRyErESveHwVyKYUfhME
RAILWAY_REVIEWS_DATABASE=railway
```

## Vercel에서 환경 변수 설정 방법

1. **Vercel 대시보드 접속**
   - https://vercel.com 접속
   - 프로젝트 선택

2. **Settings 메뉴 클릭**
   - 프로젝트 페이지에서 "Settings" 탭 클릭

3. **Environment Variables 섹션**
   - 왼쪽 메뉴에서 "Environment Variables" 클릭

4. **환경 변수 추가**
   - 각 환경 변수를 하나씩 추가:
     - Key: `RAILWAY_HOST`
     - Value: `nozomi.proxy.rlwy.net`
     - Environment: Production, Preview, Development 모두 선택
   - "Save" 클릭

5. **모든 환경 변수 추가 완료 후**
   - **중요**: 환경 변수를 추가/수정한 후에는 **재배포(Redepoly)**가 필요합니다!
   - "Deployments" 탭에서 최신 배포를 선택하고 "Redeploy" 클릭

## 환경 변수 확인

환경 변수가 제대로 설정되었는지 확인하려면:

1. Vercel 대시보드 → 프로젝트 → Settings → Environment Variables
2. 모든 변수가 Production, Preview, Development에 설정되어 있는지 확인
3. 변수 값이 정확한지 확인 (특히 포트 번호: 51173)

## 문제 해결

### 500 Internal Server Error 발생 시

1. **Vercel 로그 확인**
   - Vercel 대시보드 → 프로젝트 → "Logs" 탭
   - 에러 메시지 확인 (개선된 에러 로깅으로 더 자세한 정보 확인 가능)

2. **환경 변수 확인**
   - 모든 필수 환경 변수가 설정되어 있는지 확인
   - 변수 이름에 오타가 없는지 확인 (대소문자 구분)
   - 포트 번호가 51173인지 확인

3. **재배포**
   - 환경 변수를 수정한 경우 반드시 재배포 필요
   - "Deployments" → 최신 배포 → "Redeploy"

4. **DB 연결 테스트**
   - 로컬에서 `.env.local` 파일에 동일한 값 설정 후 테스트
   - 로컬에서 작동하면 Vercel 환경 변수 문제일 가능성 높음

## 참고사항

- 환경 변수는 코드에 커밋하지 마세요 (보안상 위험)
- `.env.local` 파일은 `.gitignore`에 포함되어 있어야 합니다
- Vercel에서는 환경 변수를 대시보드에서만 설정해야 합니다
- 환경 변수 변경 후에는 반드시 재배포가 필요합니다
