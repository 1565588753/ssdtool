import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import path from 'path';

// 加载环境变量
dotenv.config();

// 数据库文件路径
const dbPath = path.join(process.cwd(), 'data', 'ssd_tool_db.sqlite');

// 确保数据目录存在
import fs from 'fs';
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 创建数据库连接
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// 模拟 mysql2 接口的包装器
const pool = {
  async execute(sql: string, params?: any[]): Promise<[any[], any]> {
    try {
      const stmt = db.prepare(sql);
      let result;
      
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        result = params ? stmt.all(...params) : stmt.all();
      } else {
        const info = params ? stmt.run(...params) : stmt.run();
        result = [{ insertId: info.lastInsertRowid, affectedRows: info.changes }];
      }
      
      return [result, []];
    } catch (error) {
      console.error('SQLite execute error:', error);
      throw error;
    }
  },
  
  async query(sql: string): Promise<[any[], any]> {
    try {
      const stmt = db.prepare(sql);
      const result = stmt.all();
      return [result, []];
    } catch (error) {
      console.error('SQLite query error:', error);
      throw error;
    }
  },
  
  async getConnection() {
    return {
      release: () => {},
      execute: pool.execute,
      query: pool.query
    };
  }
};

// 初始化数据库
function initDatabase() {
  console.log('🔧 Initializing SQLite database...');
  
  // 用户表
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nickname TEXT NOT NULL,
      avatar_url TEXT,
      role TEXT DEFAULT 'user',
      download_quota INTEGER DEFAULT 5,
      downloads_used INTEGER DEFAULT 0,
      quota_reset_date TEXT,
      is_premium INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // 分类表
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      parent_id TEXT,
      order_index INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // 固件表
  db.exec(`
    CREATE TABLE IF NOT EXISTS firmware (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      version TEXT,
      category_id TEXT,
      uploader_id TEXT,
      uploader_name TEXT,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      download_count INTEGER DEFAULT 0,
      is_paid INTEGER DEFAULT 0,
      price DECIMAL,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // 下载记录表
  db.exec(`
    CREATE TABLE IF NOT EXISTS downloads (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      firmware_id TEXT,
      firmware_title TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // 捐赠记录表
  db.exec(`
    CREATE TABLE IF NOT EXISTS donations (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_nickname TEXT NOT NULL,
      amount DECIMAL NOT NULL,
      type TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // 系统配置表
  db.exec(`
    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // 卡密表
  db.exec(`
    CREATE TABLE IF NOT EXISTS license_keys (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      firmware_id TEXT NOT NULL,
      firmware_title TEXT NOT NULL,
      user_email TEXT,
      is_used INTEGER DEFAULT 0,
      used_at TEXT,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // 用户固件下载记录表
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_firmware_downloads (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      firmware_id TEXT NOT NULL,
      download_count INTEGER DEFAULT 1,
      first_download_at TEXT DEFAULT CURRENT_TIMESTAMP,
      last_download_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, firmware_id)
    )
  `);
  
  console.log('✅ SQLite database tables created');
  
  // 插入初始数据（如果不存在）
  seedData();
}

// 插入初始数据
function seedData() {
  // 检查是否已有用户
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
  if (userCount.count === 0) {
    console.log('🌱 Seeding initial data...');
    
    // 插入管理员用户
    db.prepare(`
      INSERT OR IGNORE INTO users (id, email, password, nickname, role, download_quota, is_premium)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      'user-001',
      'admin@example.com',
      '$2a$10$8K1p/a0dL1LXMIgZ6.ydI.tS8y3AqrN7K8h3.3K3K3K3K3K3K3K3K',
      '系统管理员',
      'admin',
      9999,
      1
    );
    
    // 插入配置
    db.prepare(`
      INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)
    `).run('site_settings', JSON.stringify({ name: 'SSD开卡工具站', description: '专业的固态硬盘开卡工具分享平台' }));
    
    db.prepare(`
      INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)
    `).run('module_settings', JSON.stringify({ showHero: true, showHot: true, showLatest: true, showDonations: true, showContributors: true }));
    
    db.prepare(`
      INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)
    `).run('quota_settings', JSON.stringify({ freeQuota: 5, premiumQuota: 100, singleDownloadPrice: 1, premiumPrice: 8 }));
    
    // 插入分类
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
    
    const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (id, name, parent_id, order_index) VALUES (?, ?, ?, ?)');
    for (const cat of categories) {
      insertCategory.run(cat[0], cat[1], cat[2], cat[3]);
    }
    
    // 插入固件
    const firmware = [
      ['fw-1', 'SM2258XT 开卡工具 v1.2', '慧荣SM2258XT主控固态硬盘开卡工具，支持多种闪存颗粒，修复SSD无法识别问题。', '1.2', 'cat-1-1', 'user-001', '系统管理员', '/files/sm2258xt-v1.2.zip', 15728640, 2580, 0, null, 'approved'],
      ['fw-2', 'PS3111 量产工具 v2.5', '群联PS3111主控SSD开卡工具，支持最新固件版本，提供完整的开卡教程。', '2.5', 'cat-2-1', 'user-001', '系统管理员', '/files/ps3111-v2.5.zip', 23068672, 1845, 0, null, 'approved'],
      ['fw-3', 'SM2259XT 高级工具 v3.0', '专业版SM2259XT开卡工具，支持高级设置和调试功能，适合专业维修人员使用。', '3.0', 'cat-1-2', 'user-001', '系统管理员', '/files/sm2259xt-pro-v3.0.zip', 36700160, 890, 1, 19.9, 'approved'],
      ['fw-4', 'MAP1202 开卡程序 v1.0', '联芸MAP1202主控专用开卡工具，操作简单，支持自动检测颗粒。', '1.0', 'cat-3-1', 'user-001', '系统管理员', '/files/map1202-v1.0.zip', 12582912, 654, 0, null, 'approved']
    ];
    
    const insertFirmware = db.prepare(`
      INSERT OR IGNORE INTO firmware (id, title, description, version, category_id, uploader_id, uploader_name, file_path, file_size, download_count, is_paid, price, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const fw of firmware) {
      insertFirmware.run(fw[0], fw[1], fw[2], fw[3], fw[4], fw[5], fw[6], fw[7], fw[8], fw[9], fw[10], fw[11], fw[12]);
    }
    
    // 插入捐赠
    const donations = [
      ['don-1', null, '张*明', 8, 'premium_upgrade', new Date(Date.now() - 60000).toISOString()],
      ['don-2', null, '李*华', 1, 'single_download', new Date(Date.now() - 180000).toISOString()],
      ['don-3', null, '王*强', 8, 'premium_upgrade', new Date(Date.now() - 300000).toISOString()]
    ];
    
    const insertDonation = db.prepare('INSERT OR IGNORE INTO donations (id, user_id, user_nickname, amount, type, created_at) VALUES (?, ?, ?, ?, ?, ?)');
    for (const don of donations) {
      insertDonation.run(don[0], don[1], don[2], don[3], don[4], don[5]);
    }
    
    console.log('✅ Initial data seeded');
  }
}

// 测试数据库连接
export async function testConnection() {
  try {
    const result = db.prepare('SELECT 1 as test').get();
    console.log('✅ SQLite database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ SQLite database connection failed:', error);
    return false;
  }
}

// 获取连接
export async function getConnection() {
  return pool.getConnection();
}

// 初始化数据库
initDatabase();

export default pool;
