import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'ssd_user',
  password: process.env.DB_PASSWORD || 'ssd_password_2024',
  database: process.env.DB_NAME || 'ssd_tool',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

async function initDatabase() {
  console.log('🔧 Initializing MySQL database...');

  const conn = await pool.getConnection();
  try {
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        nickname VARCHAR(100) NOT NULL,
        avatar_url VARCHAR(500),
        role VARCHAR(20) DEFAULT 'user',
        download_quota INT DEFAULT 5,
        downloads_used INT DEFAULT 0,
        quota_reset_date DATETIME,
        is_premium TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        parent_id VARCHAR(50),
        order_index INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS firmware (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        version VARCHAR(50),
        category_id VARCHAR(50),
        uploader_id VARCHAR(50),
        uploader_name VARCHAR(100),
        file_path VARCHAR(500) NOT NULL,
        alist_file_path VARCHAR(500) DEFAULT '',
        file_size BIGINT,
        download_count INT DEFAULT 0,
        is_paid TINYINT(1) DEFAULT 0,
        price DECIMAL(10,2),
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS downloads (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50),
        firmware_id VARCHAR(50),
        firmware_title VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS donations (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50),
        user_nickname VARCHAR(100) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS config (
        \`key\` VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS user_firmware_downloads (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        firmware_id VARCHAR(50) NOT NULL,
        download_count INT DEFAULT 1,
        first_download_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_download_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_firmware (user_id, firmware_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS verification_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        code VARCHAR(6) NOT NULL,
        type VARCHAR(20) NOT NULL DEFAULT 'register',
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email_type (email, type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ MySQL database tables created');

    await seedData(conn);
  } finally {
    conn.release();
  }
}

async function seedData(conn: any) {
  const [rows] = await conn.execute('SELECT COUNT(*) as count FROM users');
  if (rows[0].count === 0) {
    console.log('🌱 Seeding initial data...');

    await conn.execute(
      'INSERT IGNORE INTO users (id, email, password, nickname, role, download_quota, is_premium) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['user-001', 'admin@example.com', '$2b$10$Pf7bVvQajvyppQ6BTP7yLOWl1DacVbB2Icovbno4Tns9wG6KhrFxu', '系统管理员', 'admin', 9999, 1]
    );

    await conn.execute(
      'INSERT IGNORE INTO config (`key`, value) VALUES (?, ?)',
      ['site_settings', JSON.stringify({ name: 'SSD开卡工具站', description: '专业的固态硬盘开卡工具分享平台' })]
    );
    await conn.execute(
      'INSERT IGNORE INTO config (`key`, value) VALUES (?, ?)',
      ['module_settings', JSON.stringify({ showHero: true, showHot: true, showLatest: true, showDonations: true, showContributors: true })]
    );
    await conn.execute(
      'INSERT IGNORE INTO config (`key`, value) VALUES (?, ?)',
      ['quota_settings', JSON.stringify({ freeQuota: 5, premiumQuota: 100, premiumPrice: 8 })]
    );
    await conn.execute(
      'INSERT IGNORE INTO config (`key`, value) VALUES (?, ?)',
      ['alist_settings', JSON.stringify({ baseUrl: '' })]
    );

    const categories = [
      ['cat-1', '慧荣 (SMI)', null, 1],
      ['cat-2', '群联 (Phison)', null, 2],
      ['cat-3', '联芸 (Maxio)', null, 3],
      ['cat-4', '得一微 (YMC)', null, 4],
      ['cat-1-1', 'SM2258XT', 'cat-1', 1],
      ['cat-1-2', 'SM2259XT', 'cat-1', 2],
      ['cat-1-3', 'SM2263XT', 'cat-1', 3],
      ['cat-2-1', 'PS3111', 'cat-2', 1],
      ['cat-2-2', 'PS5013', 'cat-2', 2],
      ['cat-3-1', 'MAP1202', 'cat-3', 1]
    ];

    for (const cat of categories) {
      await conn.execute(
        'INSERT IGNORE INTO categories (id, name, parent_id, order_index) VALUES (?, ?, ?, ?)',
        [cat[0], cat[1], cat[2], cat[3]]
      );
    }

    const firmware = [
      ['fw-1', 'SM2258XT 开卡工具 v1.2', '慧荣SM2258XT主控固态硬盘开卡工具，支持多种闪存颗粒，修复SSD无法识别问题。', '1.2', 'cat-1-1', 'user-001', '系统管理员', '/files/sm2258xt-v1.2.zip', 15728640, 2580, 'approved'],
      ['fw-2', 'PS3111 量产工具 v2.5', '群联PS3111主控SSD开卡工具，支持最新固件版本，提供完整的开卡教程。', '2.5', 'cat-2-1', 'user-001', '系统管理员', '/files/ps3111-v2.5.zip', 23068672, 1845, 'approved'],
      ['fw-3', 'SM2259XT 高级工具 v3.0', '专业版SM2259XT开卡工具，支持高级设置和调试功能，适合专业维修人员使用。', '3.0', 'cat-1-2', 'user-001', '系统管理员', '/files/sm2259xt-pro-v3.0.zip', 36700160, 890, 'approved'],
      ['fw-4', 'MAP1202 开卡程序 v1.0', '联芸MAP1202主控专用开卡工具，操作简单，支持自动检测颗粒。', '1.0', 'cat-3-1', 'user-001', '系统管理员', '/files/map1202-v1.0.zip', 12582912, 654, 'approved']
    ];

    for (const fw of firmware) {
      await conn.execute(
        'INSERT IGNORE INTO firmware (id, title, description, version, category_id, uploader_id, uploader_name, file_path, file_size, download_count, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [fw[0], fw[1], fw[2], fw[3], fw[4], fw[5], fw[6], fw[7], fw[8], fw[9], fw[10]]
      );
    }

    console.log('✅ Initial data seeded');
  }
}

export async function testConnection() {
  try {
    const [rows] = await pool.execute('SELECT 1 as test');
    console.log('✅ MySQL database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MySQL database connection failed:', error);
    return false;
  }
}

export async function getConnection() {
  return pool.getConnection();
}

initDatabase();

export default pool;