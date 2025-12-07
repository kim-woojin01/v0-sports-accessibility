-- ============================================
-- 리뷰 시스템 샘플 데이터 삽입 SQL
-- Railway MySQL에서 실행하세요
-- ============================================

-- 주의: 실제 시설 ID와 사용자 ID를 확인한 후 실행하세요
-- 먼저 다음 쿼리로 ID를 확인:
-- SELECT id, name FROM facility LIMIT 5;
-- SELECT id, name, user_id_email FROM users LIMIT 5;

-- ============================================
-- 1. 샘플 이용 내역 삽입
-- ============================================
-- 사용자 ID와 시설 ID를 실제 값으로 변경하세요
-- 예시: user_id = 1, facility_id = 1

INSERT INTO facility_usage (user_id, facility_id, used_at)
VALUES 
  (1, 1, DATE_SUB(NOW(), INTERVAL 7 DAY)),   -- 7일 전
  (1, 1, DATE_SUB(NOW(), INTERVAL 14 DAY)),  -- 14일 전
  (1, 2, DATE_SUB(NOW(), INTERVAL 30 DAY));  -- 30일 전

-- ============================================
-- 2. 샘플 리뷰 삽입
-- ============================================
-- 사용자 ID와 시설 ID를 실제 값으로 변경하세요

INSERT INTO facility_reviews 
  (facility_id, user_id, user_name, rating, content, tags, created_at)
VALUES 
  (
    1,  -- facility_id (실제 시설 ID로 변경)
    1,  -- user_id (실제 사용자 ID로 변경)
    '김철수',
    5,
    '시설이 매우 깨끗하고 직원분들이 친절해서 좋았습니다. 휠체어 이동도 편리했어요. 접근성 시설이 잘 갖춰져 있어서 이용하기 편했습니다.',
    '["진입로 평탄해요", "휠체어 출입", "안내 표지판 있어요", "장애인 화장실"]',
    DATE_SUB(NOW(), INTERVAL 3 DAY)
  ),
  (
    1,  -- facility_id
    1,  -- user_id
    '이영희',
    4,
    '수영장 물이 따뜻해서 좋았는데 주차장이 조금 좁네요. 하지만 접근성은 좋아요!',
    '["보드라운 바닥재", "경사로 설치되어 있어요", "보조기구 빌려줘요"]',
    DATE_SUB(NOW(), INTERVAL 6 DAY)
  ),
  (
    2,  -- facility_id (다른 시설)
    1,  -- user_id
    '박민수',
    5,
    '점자 안내가 잘 되어 있어서 시각 장애인도 이용하기 편리합니다. 직원분들도 친절하세요.',
    '["점자 안내 필요해요", "안내 표지판 있어요", "장애인 화장실"]',
    DATE_SUB(NOW(), INTERVAL 9 DAY)
  ),
  (
    2,  -- facility_id
    1,  -- user_id
    '최지은',
    4,
    '전반적으로 좋은 시설이에요. 다만 엘리베이터가 조금 느린 편이네요.',
    '["진입로 평탄해요", "휠체어 출입", "보드라운 바닥재"]',
    DATE_SUB(NOW(), INTERVAL 12 DAY)
  );

-- ============================================
-- 데이터 확인 쿼리
-- ============================================

-- 이용 내역 확인
SELECT 
  u.id,
  u.user_id,
  u.facility_id,
  f.name AS facility_name,
  u.used_at
FROM facility_usage u
JOIN facility f ON u.facility_id = f.id
WHERE u.user_id = 1  -- 실제 사용자 ID로 변경
ORDER BY u.used_at DESC;

-- 리뷰 확인
SELECT 
  r.id,
  r.facility_id,
  f.name AS facility_name,
  r.user_name,
  r.rating,
  r.content,
  r.tags,
  r.created_at
FROM facility_reviews r
JOIN facility f ON r.facility_id = f.id
ORDER BY r.created_at DESC;

-- 특정 사용자의 리뷰 확인
SELECT 
  r.id,
  r.facility_id,
  f.name AS facility_name,
  r.rating,
  r.content,
  r.tags,
  r.created_at
FROM facility_reviews r
JOIN facility f ON r.facility_id = f.id
WHERE r.user_id = 1  -- 실제 사용자 ID로 변경
ORDER BY r.created_at DESC;

-- ============================================
-- 데이터 삭제 (필요시 사용)
-- ============================================

-- DELETE FROM facility_reviews WHERE user_id = 1;
-- DELETE FROM facility_usage WHERE user_id = 1;









