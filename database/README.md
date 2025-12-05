# 데이터베이스 테이블 생성 가이드

## 리뷰 시스템 DB 테이블 생성

이 디렉토리의 SQL 파일을 Railway MySQL에서 실행하여 리뷰 시스템에 필요한 테이블을 생성하세요.

## 사용 방법

### 1. Railway MySQL 콘솔 접속
- Railway 대시보드에서 MySQL 서비스 선택
- "Query" 또는 "MySQL Console" 탭 클릭

### 2. SQL 파일 선택 및 실행

**옵션 1: 외래키 제약조건 포함 (권장)**
- `create_review_tables.sql` 파일 사용
- `facility`와 `users` 테이블이 이미 존재해야 함

**옵션 2: 외래키 제약조건 없음 (간단 버전)**
- `create_review_tables_simple.sql` 파일 사용
- 외래키 제약조건 없이 인덱스만 사용
- 더 유연하지만 데이터 무결성은 애플리케이션 레벨에서 관리 필요

SQL 파일의 내용을 복사하여 Railway MySQL 콘솔에 붙여넣고 실행하세요.

또는 MySQL CLI를 사용하는 경우:
```bash
mysql -h caboose.proxy.rlwy.net -P 44225 -u root -p railway < create_review_tables_simple.sql
```

## 생성되는 테이블

### 1. `facility_reviews` (리뷰 테이블)
- **용도**: 시설에 대한 사용자 리뷰 저장
- **주요 컬럼**:
  - `id`: 리뷰 고유 ID (자동 증가)
  - `facility_id`: 시설 ID (외래키)
  - `user_id`: 사용자 ID (외래키)
  - `user_name`: 작성자 이름
  - `rating`: 평점 (1-5)
  - `content`: 리뷰 내용
  - `tags`: 태그 배열 (JSON 형식)
  - `created_at`: 작성일시
  - `updated_at`: 수정일시

### 2. `facility_usage` (이용 내역 테이블)
- **용도**: 사용자가 실제 이용한 시설 기록
- **주요 컬럼**:
  - `id`: 이용 내역 고유 ID (자동 증가)
  - `user_id`: 사용자 ID (외래키)
  - `facility_id`: 시설 ID (외래키)
  - `used_at`: 이용 일시

## 인덱스
- 성능 최적화를 위해 다음 컬럼에 인덱스가 생성됩니다:
  - `facility_reviews`: `facility_id`, `user_id`, `created_at`
  - `facility_usage`: `user_id`, `facility_id`, `used_at`

## 외래키 제약조건
- `facility_reviews.facility_id` → `facility.id`
- `facility_reviews.user_id` → `users.id`
- `facility_usage.facility_id` → `facility.id`
- `facility_usage.user_id` → `users.id`

**참고**: 외래키 제약조건이 에러를 발생시키는 경우, `FOREIGN KEY` 부분을 제거하고 인덱스만 사용할 수 있습니다.

## 테이블 확인
생성 후 다음 쿼리로 확인하세요:
```sql
SHOW TABLES;
DESCRIBE facility_reviews;
DESCRIBE facility_usage;
```

