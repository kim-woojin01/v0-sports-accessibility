# Vercel 환경 변수 설정 가이드

## ⚠️ 현재 상황

Vercel에 이미 `MYSQL_*` 변수들이 설정되어 있지만, **코드는 `RAILWAY_*` 변수를 사용**합니다.

## ✅ Vercel에 추가해야 할 환경 변수

다음 환경 변수들을 Vercel 대시보드에 **반드시 추가**해야 합니다:

### 필수 환경 변수 (51173 Railway DB)

```
RAILWAY_HOST=nozomi.proxy.rlwy.net
RAILWAY_PORT=51173
RAILWAY_USER=root
RAILWAY_PASSWORD=lRzqwghWSchqdRyErESveHwVyKYUfhME
RAILWAY_DATABASE=railway
```

### 리뷰 시스템용 환경 변수 (선택사항, 동일한 DB 사용)

```
RAILWAY_REVIEWS_HOST=nozomi.proxy.rlwy.net
RAILWAY_REVIEWS_PORT=51173
RAILWAY_REVIEWS_USER=root
RAILWAY_REVIEWS_PASSWORD=lRzqwghWSchqdRyErESveHwVyKYUfhME
RAILWAY_REVIEWS_DATABASE=railway
```

## 📝 설정 방법

1. **Vercel 대시보드 접속**
   - https://vercel.com → 프로젝트 선택

2. **Settings → Environment Variables**

3. **각 변수 추가**
   - Key: `RAILWAY_HOST`
   - Value: `nozomi.proxy.rlwy.net`
   - Environment: **Production, Preview, Development 모두 선택** ✅
   - "Save" 클릭

4. **나머지 변수들도 동일하게 추가**

5. **재배포 필수!**
   - Deployments → 최신 배포 → "Redeploy" 클릭

## 🔍 확인 사항

- ✅ 모든 `RAILWAY_*` 변수가 Production, Preview, Development에 설정되어 있는지
- ✅ 포트 번호가 **51173**인지 확인
- ✅ 호스트가 **nozomi.proxy.rlwy.net**인지 확인
- ✅ 비밀번호가 정확한지 확인 (첫 글자가 소문자 `l`)

## 📌 참고

- 기존 `MYSQL_*` 변수는 그대로 두어도 됩니다 (사용하지 않음)
- `RAILWAY_*` 변수가 우선적으로 사용됩니다
- 환경 변수 변경 후 **반드시 재배포**해야 합니다
