import pool from './db.js';

export const userDB = {
  async findByEmail(email: string) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return (rows as any[])[0];
  },
  async findById(id: string) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    return (rows as any[])[0];
  },
  async create(user: {
    email: string;
    password: string;
    nickname: string;
    role?: string;
  }) {
    const userId = `user-${Date.now()}`;
    const [result] = await pool.execute(
      'INSERT INTO users (id, email, password, nickname, role, download_quota, is_premium) VALUES (?, ?, ?, ?, ?, 5, 0)',
      [userId, user.email, user.password, user.nickname, user.role || 'user']
    );
    return result;
  },
  async updateDownloadsUsed(id: string, downloadsUsed: number) {
    await pool.execute('UPDATE users SET downloads_used = ? WHERE id = ?', [downloadsUsed, id]);
  },
  async upgradeToPremium(id: string, quota: number) {
    await pool.execute('UPDATE users SET is_premium = 1, download_quota = ? WHERE id = ?', [quota, id]);
  },
  async findAll() {
    const [rows] = await pool.execute('SELECT * FROM users ORDER BY created_at DESC');
    return rows as any[];
  },
  async delete(id: string) {
    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    return result;
  },
  async updateLastDownloadAt(id: string) {
    await pool.execute('UPDATE users SET last_download_at = NOW() WHERE id = ?', [id]);
  }
};

export const categoryDB = {
  async findAll() {
    const [rows] = await pool.execute('SELECT * FROM categories ORDER BY order_index');
    return rows as any[];
  },
  async findById(id: string) {
    const [rows] = await pool.execute('SELECT * FROM categories WHERE id = ?', [id]);
    return (rows as any[])[0];
  },
  async findChildren(parentId: string) {
    const [rows] = await pool.execute('SELECT * FROM categories WHERE parent_id = ? ORDER BY order_index', [parentId]);
    return rows as any[];
  }
};

export const firmwareDB = {
  async findAll() {
    const [rows] = await pool.execute('SELECT * FROM firmware ORDER BY created_at DESC');
    return rows as any[];
  },
  async findById(id: string) {
    const [rows] = await pool.execute('SELECT * FROM firmware WHERE id = ?', [id]);
    return (rows as any[])[0];
  },
  async findByCategory(categoryId: string) {
    const [rows] = await pool.execute('SELECT * FROM firmware WHERE category_id = ? ORDER BY created_at DESC', [categoryId]);
    return rows as any[];
  },
  async findHot(limit: number = 6) {
    const [rows] = await pool.query(`SELECT * FROM firmware ORDER BY download_count DESC LIMIT ${Number(limit)}`);
    return rows as any[];
  },
  async findLatest(limit: number = 6) {
    const [rows] = await pool.query(`SELECT * FROM firmware ORDER BY created_at DESC LIMIT ${Number(limit)}`);
    return rows as any[];
  },
  async incrementDownloadCount(id: string) {
    await pool.execute('UPDATE firmware SET download_count = download_count + 1 WHERE id = ?', [id]);
  },
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
    status?: string;
  }) {
    const id = `fw-${Date.now()}`;
    const [result] = await pool.execute(
      'INSERT INTO firmware (id, title, description, version, category_id, uploader_id, uploader_name, file_path, file_size, is_paid, price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        firmware.title,
        firmware.description,
        firmware.version,
        firmware.categoryId,
        firmware.uploaderId,
        firmware.uploaderName,
        firmware.filePath,
        firmware.fileSize,
        firmware.isPaid || false,
        firmware.price || null,
        firmware.status || 'approved'
      ]
    );
    return { insertId: id };
  },
  async delete(id: string) {
    const [result] = await pool.execute('DELETE FROM firmware WHERE id = ?', [id]);
    return result;
  }
};

export const downloadDB = {
  async create(download: {
    userId: string;
    firmwareId: string;
    firmwareTitle?: string;
  }) {
    const id = `dl-${Date.now()}`;
    const [result] = await pool.execute(
      'INSERT INTO downloads (id, user_id, firmware_id, firmware_title) VALUES (?, ?, ?, ?)',
      [id, download.userId, download.firmwareId, download.firmwareTitle || null]
    );
    return result;
  },
  async findByUser(userId: string) {
    const [rows] = await pool.execute('SELECT * FROM downloads WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    return rows as any[];
  }
};

export const donationDB = {
  async create(donation: {
    userId?: string;
    userNickname: string;
    amount: number;
    type: string;
  }) {
    const id = `don-${Date.now()}`;
    const [result] = await pool.execute(
      'INSERT INTO donations (id, user_id, user_nickname, amount, type) VALUES (?, ?, ?, ?, ?)',
      [id, donation.userId || null, donation.userNickname, donation.amount, donation.type]
    );
    return result;
  },
  async findAll(limit: number = 20) {
    const [rows] = await pool.query(`SELECT * FROM donations ORDER BY created_at DESC LIMIT ${Number(limit)}`);
    return rows as any[];
  },
  async getTotalAmount() {
    const [rows] = await pool.execute('SELECT SUM(amount) as total FROM donations');
    return (rows as any[])[0]?.total || 0;
  }
};

export const configDB = {
  async get(key: string) {
    const [rows] = await pool.execute('SELECT value FROM config WHERE `key` = ?', [key]);
    const row = (rows as any[])[0];
    return row ? JSON.parse(row.value) : null;
  },
  async set(key: string, value: object) {
    const jsonValue = JSON.stringify(value);
    await pool.execute(
      "INSERT INTO config (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?",
      [key, jsonValue, jsonValue]
    );
  },
  async update(key: string, value: object) {
    await pool.execute('UPDATE config SET value = ? WHERE `key` = ?', [JSON.stringify(value), key]);
  }
};

export const userFirmwareDownloadDB = {
  async findByUserAndFirmware(userId: string, firmwareId: string) {
    const [rows] = await pool.execute('SELECT * FROM user_firmware_downloads WHERE user_id = ? AND firmware_id = ?', [userId, firmwareId]);
    return (rows as any[])[0];
  },
  async create(data: {
    userId: string;
    firmwareId: string;
  }) {
    const id = `ufd-${Date.now()}`;
    const [result] = await pool.execute(
      'INSERT INTO user_firmware_downloads (id, user_id, firmware_id, download_count) VALUES (?, ?, ?, 1)',
      [id, data.userId, data.firmwareId]
    );
    return result;
  },
  async incrementDownloadCount(userId: string, firmwareId: string) {
    await pool.execute(
      'UPDATE user_firmware_downloads SET download_count = download_count + 1, last_download_at = NOW(3) WHERE user_id = ? AND firmware_id = ?',
      [userId, firmwareId]
    );
  },
  async findRecentDownloads(userId: string, days: number = 30) {
    // SQLite 兼容的日期计算 - 在JS中计算日期
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffIso = cutoffDate.toISOString();
    
    const [rows] = await pool.execute(
      'SELECT * FROM user_firmware_downloads WHERE user_id = ? AND last_download_at > ?',
      [userId, cutoffIso]
    );
    return rows as any[];
  }
};

export const downloadTokenDB = {
  async create(data: { firmwareId: string; userId: string; token: string; expiresAt: string }) {
    const id = `tok-${Date.now()}`;
    await pool.execute(
      'INSERT INTO download_tokens (id, firmware_id, user_id, token, expires_at, used) VALUES (?, ?, ?, ?, ?, 0)',
      [id, data.firmwareId, data.userId, data.token, data.expiresAt]
    );
    return id;
  },
  async findByToken(token: string) {
    const [rows] = await pool.execute('SELECT * FROM download_tokens WHERE token = ?', [token]);
    return (rows as any[])[0];
  },
  async markAsUsed(token: string) {
    await pool.execute('UPDATE download_tokens SET used = 1 WHERE token = ?', [token]);
  },
  async cleanupExpired() {
    await pool.execute('DELETE FROM download_tokens WHERE expires_at < NOW()');
  }
};

export const verificationCodeDB = {
  async create(data: { email: string; code: string; type: string; expiresAt: Date }) {
    const [result] = await pool.execute(
      'INSERT INTO verification_codes (email, code, type, expires_at) VALUES (?, ?, ?, ?)',
      [data.email, data.code, data.type, data.expiresAt]
    );
    return result;
  },
  async findByEmailAndCode(email: string, code: string, type: string) {
    const [rows] = await pool.execute(
      'SELECT * FROM verification_codes WHERE email = ? AND code = ? AND type = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [email, code, type]
    );
    return (rows as any[])[0];
  },
  async findLatestByEmail(email: string, type: string) {
    const [rows] = await pool.execute(
      'SELECT * FROM verification_codes WHERE email = ? AND type = ? ORDER BY created_at DESC LIMIT 1',
      [email, type]
    );
    return (rows as any[])[0];
  },
  async deleteByEmail(email: string, type: string) {
    await pool.execute('DELETE FROM verification_codes WHERE email = ? AND type = ?', [email, type]);
  },
  async deleteExpired() {
    await pool.execute('DELETE FROM verification_codes WHERE expires_at < NOW()');
  }
};

export default {
  userDB,
  categoryDB,
  firmwareDB,
  downloadDB,
  donationDB,
  configDB,
  downloadTokenDB,
  verificationCodeDB,
  userFirmwareDownloadDB
};
