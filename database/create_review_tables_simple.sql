-- ============================================
-- 리뷰 시스템을 위한 DB 테이블 생성 스크립트 (간단 버전)
-- 외래키 제약조건 없이 인덱스만 사용
-- Railway MySQL에서 실행하세요
-- ============================================

-- 1. facility_reviews 테이블 (리뷰 데이터 저장)
CREATE TABLE IF NOT EXISTS facility_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  facility_id INT NOT NULL,
  user_id INT NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  rating INT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT NULL COMMENT 'JSON 형식의 태그 배열',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_facility (facility_id),
  INDEX idx_user (user_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. facility_usage 테이블 (사용자의 시설 이용 내역)
CREATE TABLE IF NOT EXISTS facility_usage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  facility_id INT NOT NULL,
  used_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_facility (facility_id),
  INDEX idx_used_at (used_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 테이블 확인 쿼리
-- ============================================
-- SELECT * FROM facility_reviews LIMIT 10;
-- SELECT * FROM facility_usage LIMIT 10;

-- ============================================
-- 샘플 데이터 삽입 (테스트용)
-- ============================================
-- INSERT INTO facility_usage (user_id, facility_id, used_at) 
-- VALUES (1, 1, NOW());

-- INSERT INTO facility_reviews (facility_id, user_id, user_name, rating, content, tags) 
-- VALUES (1, 1, '테스트 사용자', 5, '좋은 시설이에요!', '["진입로 평탄해요", "휠체어 출입"]');





