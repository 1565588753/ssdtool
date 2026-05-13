import pool from './db.js';

// 用户表操作
export const userDB = {
  // 根据邮箱查找用户
  async findByEmail(email: string) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return (rows as any[])[0];
  },

  // 根据ID查找用户
  async findById(id: string) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return (rows as any[])[0];
  },

  // 创建用户
  async create(user: {
    email: string;
    password: string;
    nickname: string;
    role?: string;
  }) {
    const [result] = await pool.execute(
      `INSERT INTO users (email, nickname, role, download_quota, is_premium) 
       VALUES (?, ?, ?, 5, FALSE)`,
      [user.email, user.nickname, user.role || 'user']
    );
    return result;
  },

  // 更新用户下载次数
  async updateDownloadsUsed(id: string, downloadsUsed: number) {
    await pool.execute(
      'UPDATE users SET downloads_used = ? WHERE id = ?',
      [downloadsUsed, id]
    );
  },

  // 升级为Premium用户
  async upgradeToPremium(id: string, quota: number) {
    await pool.execute(
      'UPDATE users SET is_premium = TRUE, download_quota = ? WHERE id = ?',
      [quota, id]
    );
  }
};

// 分类表操作
export const categoryDB = {
  // 获取所有分类
  async findAll() {
    const [rows] = await pool.execute(
      'SELECT * FROM categories ORDER BY order_index'
    );
    return rows as any[];
  },

  // 根据ID查找
  async findById(id: string) {
    const [rows] = await pool.execute(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );
    return (rows as any[])[0];
  },

  // 获取子分类
  async findChildren(parentId: string) {
    const [rows] = await pool.execute(
      'SELECT * FROM categories WHERE parent_id = ? ORDER BY order_index',
      [parentId]
    );
    return rows as any[];
  }
};

// 固件表操作
export const firmwareDB = {
  // 获取所有已审核固件
  async findAll(status: string = 'approved') {
    const [rows] = await pool.execute(
      'SELECT * FROM firmware WHERE status = ? ORDER BY created_at DESC',
      [status]
    );
    return rows as any[];
  },

  // 根据ID查找
  async findById(id: string) {
    const [rows] = await pool.execute(
      'SELECT * FROM firmware WHERE id = ?',
      [id]
    );
    return (rows as any[])[0];
  },

  // 根据分类查找
  async findByCategory(categoryId: string) {
    const [rows] = await pool.execute(
      'SELECT * FROM firmware WHERE category_id = ? AND status = "approved" ORDER BY created_at DESC',
      [categoryId]
    );
    return rows as any[];
  },

  // 获取热门固件
  async findHot(limit: number = 6) {
    const [rows] = await pool.execute(
      'SELECT * FROM firmware WHERE status = "approved" ORDER BY download_count DESC LIMIT ?',
      [limit]
    );
    return rows as any[];
  },

  // 获取最新固件
  async findLatest(limit: number = 6) {
    const [rows] = await pool.execute(
      'SELECT * FROM firmware WHERE status = "approved" ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
    return rows as any[];
  },

  // 更新下载次数
  async incrementDownloadCount(id: string) {
    await pool.execute(
      'UPDATE firmware SET download_count = download_count + 1 WHERE id = ?',
      [id]
    );
  },

  // 创建固件
  async create(firmware: {
    title: string;
    description: string;
    version: string;
    categoryId: string;
    uploaderId: string;
    uploaderName: string;
    filePath: string;
    fileSize: number;
    isPaid?: boolean;
    price?: number;
  }) {
    const [result] = await pool.execute(
      `INSERT INTO firmware (title, description, version, category_id, uploader_id, uploader_name, file_path, file_size, is_paid, price, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved')`,
      [
        firmware.title,
        firmware.description,
        firmware.version,
        firmware.categoryId,
        firmware.uploaderId,
        firmware.uploaderName,
        firmware.filePath,
        firmware.fileSize,
        firmware.isPaid || false,
        firmware.price || null
      ]
    );
    return result;
  }
};

// 下载记录表操作
export const downloadDB = {
  // 创建下载记录
  async create(download: {
    userId: string;
    firmwareId: string;
    firmwareTitle?: string;
  }) {
    const [result] = await pool.execute(
      `INSERT INTO downloads (user_id, firmware_id, firmware_title) VALUES (?, ?, ?)`,
      [download.userId, download.firmwareId, download.firmwareTitle || null]
    );
    return result;
  },

  // 获取用户下载记录
  async findByUser(userId: string) {
    const [rows] = await pool.execute(
      'SELECT * FROM downloads WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows as any[];
  }
};

// 捐赠记录表操作
export const donationDB = {
  // 创建捐赠记录
  async create(donation: {
    userId?: string;
    userNickname: string;
    amount: number;
    type: string;
  }) {
    const [result] = await pool.execute(
      `INSERT INTO donations (user_id, user_nickname, amount, type) VALUES (?, ?, ?, ?)`,
      [donation.userId || null, donation.userNickname, donation.amount, donation.type]
    );
    return result;
  },

  // 获取所有捐赠记录
  async findAll(limit: number = 20) {
    const [rows] = await pool.execute(
      'SELECT * FROM donations ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
    return rows as any[];
  },

  // 获取总捐赠金额
  async getTotalAmount() {
    const [rows] = await pool.execute(
      'SELECT SUM(amount) as total FROM donations'
    );
    return (rows as any[])[0]?.total || 0;
  }
};

// 系统配置表操作
export const configDB = {
  // 获取配置
  async get(key: string) {
    const [rows] = await pool.execute(
      'SELECT value FROM config WHERE `key` = ?',
      [key]
    );
    const row = (rows as any[])[0];
    return row ? JSON.parse(row.value) : null;
  },

  // 更新配置
  async set(key: string, value: object) {
    await pool.execute(
      'UPDATE config SET value = ? WHERE `key` = ?',
      [JSON.stringify(value), key]
    );
  }
};

// 卡密表操作
export const licenseKeyDB = {
  // 创建卡密
  async create(data: {
    key: string;
    firmwareId: string;
    firmwareTitle: string;
    userEmail?: string;
    expiresAt: Date;
  }) {
    const [result] = await pool.execute(
      `INSERT INTO license_keys (\`key\`, firmware_id, firmware_title, user_email, expires_at) 
       VALUES (?, ?, ?, ?, ?)`,
      [data.key, data.firmwareId, data.firmwareTitle, data.userEmail || null, data.expiresAt]
    );
    return result;
  },

  // 根据卡密查找
  async findByKey(key: string) {
    const [rows] = await pool.execute(
      'SELECT * FROM license_keys WHERE `key` = ?',
      [key]
    );
    return (rows as any[])[0];
  },

  // 标记卡密为已使用
  async markAsUsed(id: string, userEmail: string) {
    await pool.execute(
      'UPDATE license_keys SET is_used = TRUE, used_at = NOW(), user_email = ? WHERE id = ?',
      [userEmail, id]
    );
  },

  // 获取用户的所有卡密
  async findByUserEmail(email: string) {
    const [rows] = await pool.execute(
      'SELECT * FROM license_keys WHERE user_email = ? ORDER BY created_at DESC',
      [email]
    );
    return rows as any[];
  },

  // 获取固件的所有卡密
  async findByFirmwareId(firmwareId: string) {
    const [rows] = await pool.execute(
      'SELECT * FROM license_keys WHERE firmware_id = ? ORDER BY created_at DESC',
      [firmwareId]
    );
    return rows as any[];
  },

  // 删除过期卡密
  async deleteExpired() {
    const [result] = await pool.execute(
      'DELETE FROM license_keys WHERE expires_at < NOW()'
    );
    return result;
  }
};

// 用户固件下载记录表操作
export const userFirmwareDownloadDB = {
  // 查找用户的固件下载记录
  async findByUserAndFirmware(userId: string, firmwareId: string) {
    const [rows] = await pool.execute(
      'SELECT * FROM user_firmware_downloads WHERE user_id = ? AND firmware_id = ?',
      [userId, firmwareId]
    );
    return (rows as any[])[0];
  },

  // 创建下载记录
  async create(data: {
    userId: string;
    firmwareId: string;
  }) {
    const [result] = await pool.execute(
      `INSERT INTO user_firmware_downloads (user_id, firmware_id, download_count) 
       VALUES (?, ?, 1)`,
      [data.userId, data.firmwareId]
    );
    return result;
  },

  // 增加下载次数
  async incrementDownloadCount(userId: string, firmwareId: string) {
    await pool.execute(
      `UPDATE user_firmware_downloads 
       SET download_count = download_count + 1, last_download_at = NOW()
       WHERE user_id = ? AND firmware_id = ?`,
      [userId, firmwareId]
    );
  },

  // 获取用户最近30天内的下载记录
  async findRecentDownloads(userId: string, days: number = 30) {
    const [rows] = await pool.execute(
      `SELECT * FROM user_firmware_downloads 
       WHERE user_id = ? AND last_download_at > DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [userId, days]
    );
    return rows as any[];
  }
};

export default {
  userDB,
  categoryDB,
  firmwareDB,
  downloadDB,
  donationDB,
  configDB,
  licenseKeyDB,
  userFirmwareDownloadDB
};
