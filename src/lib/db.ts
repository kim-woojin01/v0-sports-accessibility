import mysql from 'mysql2/promise';

// MySQL 연결 문자열 파싱
function parseConnectionString(url: string) {
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

// DB 설정 가져오기 (RAILWAY_* 변수 우선, DATABASE_URL 대체)
function getDbConfig() {
  // RAILWAY_* 환경 변수가 있으면 사용
  if (process.env.RAILWAY_HOST || process.env.RAILWAY_REVIEWS_HOST) {
    return {
      host: process.env.RAILWAY_HOST || process.env.RAILWAY_REVIEWS_HOST || 'nozomi.proxy.rlwy.net',
      port: Number(process.env.RAILWAY_PORT || process.env.RAILWAY_REVIEWS_PORT) || 51173,
      user: process.env.RAILWAY_USER || process.env.RAILWAY_REVIEWS_USER || 'root',
      password: process.env.RAILWAY_PASSWORD || process.env.RAILWAY_REVIEWS_PASSWORD || 'lRzqwghWSchqdRyErESveHwVyKYUfhME',
      database: process.env.RAILWAY_DATABASE || process.env.RAILWAY_REVIEWS_DATABASE || 'railway',
    };
  }
  
  // DATABASE_URL이 있으면 파싱하여 사용
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    return parseConnectionString(databaseUrl);
  }
  
  // 기본값 사용 (51173 Railway)
  return {
    host: 'nozomi.proxy.rlwy.net',
    port: 51173,
    user: 'root',
    password: 'lRzqwghWSchqdRyErESveHwVyKYUfhME',
    database: 'railway',
  };
}

// 연결 풀 생성
let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    const config = getDbConfig();
    
    pool = mysql.createPool({
      ...config,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
    
    console.log('✅ DB 연결 풀 생성:', {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
    });
  }

  return pool;
}

// 연결 풀 종료
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// 간단한 쿼리 실행 헬퍼
export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<T[]> {
  const connection = await getPool().getConnection();
  try {
    const [rows] = await connection.execute(sql, params);
    return rows as T[];
  } finally {
    connection.release();
  }
}

