-- ============================================
-- 리뷰 시스템을 위한 DB 테이블 생성 스크립트
-- Railway MySQL에서 실행하세요
-- ============================================

-- 1. facility_reviews 테이블 (리뷰 데이터 저장)
CREATE TABLE IF NOT EXISTS facility_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  facility_id INT NOT NULL,
  user_id INT NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  rating INT NOT NULL COMMENT '평점 (1-5)',
  content TEXT NOT NULL,
  tags TEXT NULL COMMENT 'JSON 형식의 태그 배열',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_facility (facility_id),
  INDEX idx_user (user_id),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (facility_id) REFERENCES facility(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. facility_usage 테이블 (사용자의 시설 이용 내역)
CREATE TABLE IF NOT EXISTS facility_usage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  facility_id INT NOT NULL,
  used_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_facility (facility_id),
  INDEX idx_used_at (used_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (facility_id) REFERENCES facility(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 테이블 확인 쿼리
-- ============================================
-- SELECT * FROM facility_reviews LIMIT 10;
-- SELECT * FROM facility_usage LIMIT 10;

-- ============================================
-- 테이블 삭제 (필요시 사용)
-- ============================================
-- DROP TABLE IF EXISTS facility_usage;
-- DROP TABLE IF EXISTS facility_reviews;

