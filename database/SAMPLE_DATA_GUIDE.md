# 샘플 데이터 삽입 가이드

리뷰 시스템의 전체 기능을 테스트하기 위한 샘플 데이터를 삽입하는 방법입니다.

## 방법 1: Node.js 스크립트 사용 (권장)

가장 간단하고 안전한 방법입니다.

```bash
npm run insert-sample-data
```

또는

```bash
node scripts/insert-sample-data.js
```

이 스크립트는:
- ✅ 기존 시설과 사용자를 자동으로 찾습니다
- ✅ 시설이 없으면 경고 메시지를 표시합니다
- ✅ 사용자가 없으면 샘플 사용자를 생성합니다
- ✅ 중복 데이터를 방지합니다
- ✅ 삽입된 데이터를 확인합니다

## 방법 2: Railway MySQL 콘솔에서 직접 실행

1. **Railway 대시보드 접속**
   - MySQL 서비스 → "Query" 탭

2. **실제 ID 확인**
   ```sql
   -- 시설 ID 확인
   SELECT id, name FROM facility LIMIT 5;
   
   -- 사용자 ID 확인
   SELECT id, name, user_id_email FROM users LIMIT 5;
   ```

3. **SQL 파일 수정**
   - `database/INSERT_SAMPLE_DATA.sql` 파일 열기
   - `user_id`와 `facility_id`를 실제 값으로 변경

4. **SQL 실행**
   - 수정된 SQL을 Railway MySQL 콘솔에 붙여넣고 실행

## 삽입되는 데이터

### 1. 이용 내역 (facility_usage)
- 사용자가 최근 7일, 14일, 30일 전에 시설을 이용한 기록
- 리뷰 작성하기 버튼 필터링에 사용됨

### 2. 리뷰 (facility_reviews)
- 다양한 평점 (4점, 5점)
- 다양한 태그 조합
- 실제적인 리뷰 내용
- 최근 3일, 6일, 9일, 12일 전에 작성된 리뷰

## 테스트 시나리오

### 시나리오 1: 리뷰 페이지 확인
1. `/reviews` 페이지 접속
2. 시설 목록 확인
3. "리뷰 보기" 클릭 → 리뷰 모달 확인
4. 검색 기능 테스트

### 시나리오 2: 리뷰 작성하기 필터
1. 로그인 (스크립트에서 생성된 사용자 또는 기존 사용자)
2. `/reviews` 페이지 접속
3. "리뷰 작성하기" 버튼 클릭
4. 이용한 시설만 필터링되어 표시되는지 확인

### 시나리오 3: 리뷰 작성
1. 로그인
2. `/reviews/write/[facility_id]` 페이지 접속
3. 별점, 태그, 내용 입력
4. 리뷰 제출
5. 마이페이지에서 작성한 리뷰 확인

### 시나리오 4: 마이페이지
1. 로그인
2. `/mypage` 페이지 접속
3. "나의 이용 내역" 탭 확인
4. "작성한 리뷰" 탭 확인
5. 리뷰 수정/삭제 기능 테스트

## 데이터 확인 쿼리

### 이용 내역 확인
```sql
SELECT 
  u.id,
  u.user_id,
  u.facility_id,
  f.name AS facility_name,
  DATE_FORMAT(u.used_at, '%Y-%m-%d %H:%i') AS used_at
FROM facility_usage u
JOIN facility f ON u.facility_id = f.id
WHERE u.user_id = 1  -- 실제 사용자 ID로 변경
ORDER BY u.used_at DESC;
```

### 리뷰 확인
```sql
SELECT 
  r.id,
  r.facility_id,
  f.name AS facility_name,
  r.user_name,
  r.rating,
  LEFT(r.content, 50) AS content_preview,
  r.tags,
  DATE_FORMAT(r.created_at, '%Y-%m-%d') AS created_at
FROM facility_reviews r
JOIN facility f ON r.facility_id = f.id
ORDER BY r.created_at DESC
LIMIT 10;
```

### 특정 사용자의 리뷰
```sql
SELECT 
  r.id,
  r.facility_id,
  f.name AS facility_name,
  r.rating,
  r.content,
  r.tags,
  DATE_FORMAT(r.created_at, '%Y-%m-%d') AS created_at
FROM facility_reviews r
JOIN facility f ON r.facility_id = f.id
WHERE r.user_id = 1  -- 실제 사용자 ID로 변경
ORDER BY r.created_at DESC;
```

## 문제 해결

### "시설이 없습니다" 오류
- 먼저 시설 데이터가 Railway DB에 있는지 확인
- `/api/facilities` API가 정상 작동하는지 확인

### "사용자가 없습니다" 오류
- 스크립트가 자동으로 샘플 사용자를 생성합니다
- 또는 회원가입을 통해 사용자를 먼저 생성하세요

### 중복 데이터
- 스크립트는 중복을 자동으로 방지합니다
- 수동으로 삽입한 경우, DELETE 쿼리로 삭제 후 다시 실행

### 데이터 삭제
```sql
-- 특정 사용자의 모든 데이터 삭제
DELETE FROM facility_reviews WHERE user_id = 1;
DELETE FROM facility_usage WHERE user_id = 1;

-- 모든 샘플 데이터 삭제
DELETE FROM facility_reviews;
DELETE FROM facility_usage;
```

