# Railway MySQL에 테이블 생성하기

## 방법 1: Railway 웹 콘솔 사용 (가장 간단)

1. **Railway 대시보드 접속**
   - https://railway.app 접속
   - 로그인 후 프로젝트 선택

2. **MySQL 서비스 찾기**
   - 프로젝트 내에서 MySQL 서비스 선택
   - 또는 "Data" 탭에서 MySQL 서비스 찾기

3. **Query 탭 열기**
   - MySQL 서비스 페이지에서 "Query" 또는 "MySQL Console" 탭 클릭
   - 또는 "Connect" 버튼 클릭 후 "Query" 선택

4. **SQL 실행**
   - 아래 SQL 코드를 복사하여 붙여넣기
   - "Run" 또는 "Execute" 버튼 클릭

```sql
-- facility_reviews 테이블 생성
CREATE TABLE IF NOT EXISTS facility_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  facility_id INT NOT NULL,
  user_id INT NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  rating INT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_facility (facility_id),
  INDEX idx_user (user_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- facility_usage 테이블 생성
CREATE TABLE IF NOT EXISTS facility_usage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  facility_id INT NOT NULL,
  used_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_facility (facility_id),
  INDEX idx_used_at (used_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

5. **확인**
   - "Success" 메시지 확인
   - 또는 다음 쿼리로 테이블 확인:
   ```sql
   SHOW TABLES;
   DESCRIBE facility_reviews;
   DESCRIBE facility_usage;
   ```

---

## 방법 2: MySQL CLI 사용 (로컬 터미널)

1. **MySQL CLI 설치 확인**
   ```bash
   mysql --version
   ```

2. **Railway MySQL에 연결**
   ```bash
   mysql -h caboose.proxy.rlwy.net -P 44225 -u root -p
   ```
   - 비밀번호 입력: `OYtPVGecIvjzArpQfMWwRNyyXnEfsXaD`

3. **데이터베이스 선택**
   ```sql
   USE railway;
   ```

4. **SQL 파일 실행**
   ```bash
   mysql -h caboose.proxy.rlwy.net -P 44225 -u root -p railway < database/create_review_tables_simple.sql
   ```

---

## 방법 3: Node.js 스크립트로 생성 (프로그래밍 방식)

프로젝트 루트에 `scripts/create-tables.js` 파일을 만들고 실행:

```bash
node scripts/create-tables.js
```

---

## 연결 정보 확인

현재 `.env.local`에 설정된 Railway MySQL 정보:
- **Host**: `caboose.proxy.rlwy.net`
- **Port**: `44225`
- **User**: `root`
- **Password**: `OYtPVGecIvjzArpQfMWwRNyyXnEfsXaD`
- **Database**: `railway`

---

## 테이블 생성 확인

Railway MySQL 콘솔에서 다음 쿼리 실행:

```sql
-- 테이블 목록 확인
SHOW TABLES;

-- facility_reviews 테이블 구조 확인
DESCRIBE facility_reviews;

-- facility_usage 테이블 구조 확인
DESCRIBE facility_usage;
```

---

## 문제 해결

### "Table already exists" 오류
- 테이블이 이미 존재하는 경우
- `CREATE TABLE IF NOT EXISTS`를 사용했으므로 안전하게 무시 가능

### "Access denied" 오류
- 비밀번호가 틀렸거나 권한이 없는 경우
- Railway 대시보드에서 MySQL 서비스의 연결 정보 확인

### "Unknown database" 오류
- `USE railway;` 명령으로 데이터베이스 선택 필요









