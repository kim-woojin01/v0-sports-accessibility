// setup.js
const mysql = require('mysql2');

// Railway의 공개 연결 문자열 (Variables 탭에서 확인)
// 예시: mysql://root:password@containers-us-west-xxx.railway.app:3306/railway
const connectionUrl = 'mysql://root:lRzqwghWSchqdRyErESveHwVyKYUfhME@nozomi.proxy.rlwy.net:51173/railway';

// 연결 문자열 파싱 함수
function parseConnectionString(url) {
  const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) {
    throw new Error('Invalid MySQL connection string');
  }
  
  return {
    host: match[3],
    port: parseInt(match[4], 10),
    user: match[1],
    password: match[2],
    database: match[5],
  };
}

// DB 연결 설정
const config = parseConnectionString(connectionUrl);
const connection = mysql.createConnection(config);

const createTableSQL = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id_email VARCHAR(50) NOT NULL UNIQUE COMMENT 'ID 또는 이메일',
  password VARCHAR(255) NOT NULL COMMENT '비밀번호 (해시된 값)',
  name VARCHAR(30) NOT NULL COMMENT '이름',
  phone VARCHAR(13) NOT NULL COMMENT '전화번호 (010-0000-0000)',
  birth_date DATE NOT NULL COMMENT '생년월일',
  disability_type VARCHAR(50) DEFAULT NULL COMMENT '장애 유형 (선택사항)',
  exercise_purposes JSON DEFAULT NULL COMMENT '운동 목적 (중복 선택 가능, JSON 배열)',
  profile_image_url VARCHAR(255) DEFAULT NULL COMMENT '프로필 사진 URL',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id_email (user_id_email),
  INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS deleted_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  original_user_id INT NOT NULL COMMENT '원본 users 테이블의 id',
  user_id_email VARCHAR(50) NOT NULL COMMENT 'ID 또는 이메일',
  password VARCHAR(255) NOT NULL COMMENT '비밀번호 (해시된 값)',
  name VARCHAR(30) NOT NULL COMMENT '이름',
  phone VARCHAR(13) NOT NULL COMMENT '전화번호 (010-0000-0000)',
  birth_date DATE NOT NULL COMMENT '생년월일',
  disability_type VARCHAR(50) DEFAULT NULL COMMENT '장애 유형 (선택사항)',
  exercise_purposes JSON DEFAULT NULL COMMENT '운동 목적 (중복 선택 가능, JSON 배열)',
  deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '탈퇴 신청 일시',
  scheduled_deletion_date DATETIME NOT NULL COMMENT '실제 삭제 예정 일시 (7일 후)',
  INDEX idx_original_user_id (original_user_id),
  INDEX idx_user_id_email (user_id_email),
  INDEX idx_deleted_at (deleted_at),
  INDEX idx_scheduled_deletion_date (scheduled_deletion_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(20) NOT NULL COMMENT '카테고리 (업데이트/점검/이벤트)',
  title VARCHAR(200) NOT NULL COMMENT '제목',
  content TEXT NOT NULL COMMENT '내용',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '작성일',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_important BOOLEAN DEFAULT FALSE COMMENT '중요 공지 여부',
  INDEX idx_category (category),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS facility_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_type ENUM('user', 'facility_manager') NOT NULL COMMENT '요청자 유형',
  facility_name VARCHAR(200) NOT NULL COMMENT '시설명',
  request_category VARCHAR(20) DEFAULT NULL COMMENT '요청 유형 (정보오류/폐업신고/신규등록/기타) - 사용자용',
  content TEXT NOT NULL COMMENT '상세 내용',
  attachment_url VARCHAR(255) DEFAULT NULL COMMENT '첨부 사진 URL - 사용자용',
  business_registration_url VARCHAR(255) DEFAULT NULL COMMENT '사업자 등록증 URL',
  representative_name VARCHAR(50) DEFAULT NULL COMMENT '대표자명',
  phone VARCHAR(13) DEFAULT NULL COMMENT '전화번호',
  operating_hours JSON DEFAULT NULL COMMENT '운영 시간 (요일별)',
  accessibility_features JSON DEFAULT NULL COMMENT '접근성 정보 (체크리스트)',
  facility_images JSON DEFAULT NULL COMMENT '시설 사진 URL 배열',
  introduction TEXT DEFAULT NULL COMMENT '시설 소개글',
  status VARCHAR(20) DEFAULT '대기중' COMMENT '상태 (대기중/승인/반려)',
  user_id INT NOT NULL COMMENT '작성자 ID',
  admin_comment TEXT DEFAULT NULL COMMENT '관리자 코멘트',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '작성일',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_user_id (user_id),
  INDEX idx_request_type (request_type),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS facility_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  facility_id INT NOT NULL,
  user_id INT NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  rating INT NOT NULL,
  content TEXT NOT NULL,
  tags JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_facility (facility_id),
  INDEX idx_user (user_id)
);

CREATE TABLE IF NOT EXISTS facility_usage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  facility_id INT NOT NULL,
  used_at DATETIME NOT NULL,
  INDEX idx_user (user_id),
  INDEX idx_facility (facility_id)
);
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

CREATE TABLE IF NOT EXISTS facility_favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  facility_id INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_facility (facility_id),
  UNIQUE KEY unique_user_facility (user_id, facility_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;


// 기존 테이블에 필드가 없는 경우를 위한 ALTER TABLE (에러 무시)
const alterTableSQLs = [
  `ALTER TABLE deleted_users 
   ADD COLUMN scheduled_deletion_date DATETIME NOT NULL 
   DEFAULT (DATE_ADD(NOW(), INTERVAL 7 DAY))
   COMMENT '실제 삭제 예정 일시 (7일 후)'`,
  `ALTER TABLE users 
   ADD COLUMN profile_image_url VARCHAR(255) DEFAULT NULL 
   COMMENT '프로필 사진 URL'`
];

// 실행
connection.connect((err) => {
  if (err) {
    console.error('❌ DB 연결 실패:', err);
    console.error('연결 정보:', {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user
    });
    process.exit(1);
  }
  console.log('✅ DB 연결 성공!');

  // 여러 쿼리를 세미콜론으로 구분하여 실행
  const queries = createTableSQL.split(';').filter(q => q.trim().length > 0);
  
  let completedQueries = 0;
  let hasError = false;

  queries.forEach((query, index) => {
    connection.query(query.trim() + ';', (err, results) => {
      if (err) {
        console.error(`❌ 테이블 생성 실패 (쿼리 ${index + 1}):`, err);
        hasError = true;
      } else {
        completedQueries++;
        if (index === 0) {
          console.log('✅ users 테이블이 성공적으로 생성되었습니다!');
        } else if (index === 1) {
          console.log('✅ deleted_users 테이블이 성공적으로 생성되었습니다!');
        } else if (index === 2) {
          console.log('✅ notices 테이블이 성공적으로 생성되었습니다!');
        } else if (index === 3) {
          console.log('✅ facility_requests 테이블이 성공적으로 생성되었습니다!');
        }
      }

      // 모든 쿼리가 완료되면 ALTER TABLE 시도 (필드가 이미 있으면 에러 무시)
      if (completedQueries === queries.length) {
        let alterCompleted = 0;
        alterTableSQLs.forEach((alterSQL, index) => {
          connection.query(alterSQL.trim(), (alterErr, alterResults) => {
            if (alterErr) {
              // 필드가 이미 존재하는 경우는 정상 (에러 무시)
              if (alterErr.code === 'ER_DUP_FIELDNAME') {
                if (index === 0) {
                  console.log('ℹ️  scheduled_deletion_date 필드가 이미 존재합니다.');
                } else if (index === 1) {
                  console.log('ℹ️  profile_image_url 필드가 이미 존재합니다.');
                }
              } else {
                console.warn(`⚠️  ALTER TABLE 경고 (쿼리 ${index + 1}):`, alterErr.message);
              }
            } else {
              if (index === 0) {
                console.log('✅ scheduled_deletion_date 필드가 추가되었습니다!');
              } else if (index === 1) {
                console.log('✅ profile_image_url 필드가 추가되었습니다!');
              }
            }
            
            alterCompleted++;
            if (alterCompleted === alterTableSQLs.length) {
              connection.end();
              if (hasError) {
                process.exit(1);
              } else {
                console.log('✅ 모든 테이블 생성이 완료되었습니다!');
                process.exit(0);
              }
            }
          });
        });
      } else if (hasError && completedQueries === queries.length) {
        connection.end();
        process.exit(1);
      }
    });
  });
});