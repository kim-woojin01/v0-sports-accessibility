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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id_email (user_id_email),
  INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

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

  connection.query(createTableSQL, (err, results) => {
    if (err) {
      console.error('❌ 테이블 생성 실패:', err);
      connection.end();
      process.exit(1);
    } else {
      console.log('✅ users 테이블이 성공적으로 생성되었습니다!');
      connection.end();
      process.exit(0);
    }
  });
});