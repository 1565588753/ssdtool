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
    const [result] = await pool.execute(
      'INSERT INTO users (email, password, nickname, role, download_quota, is_premium) VALUES (?, ?, ?, ?, 5, FALSE)',
      [user.email, user.password, user.nickname, user.role || 'user']
    );
    return result;
  },
  async updateDownloadsUsed(id: string, downloadsUsed: number) {
    await pool.execute('UPDATE users SET downloads_used = ? WHERE id = ?', [downloadsUsed, id]);
  },
  async upgradeToPremium(id: string, quota: number) {
    await pool.execute('UPDATE users SET is_premium = TRUE, download_quota = ? WHERE id = ?', [quota, id]);
  },
  async findAll() {
    const [rows] = await pool.execute('SELECT * FROM users ORDER BY created_at DESC');
    return rows as any[];
  },
  async delete(id: string) {
    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    return result;
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
  async findAll(status: string = 'approved') {
    const [rows] = await pool.execute('SELECT * FROM firmware WHERE status = ? ORDER BY created_at DESC', [status]);
    return rows as any[];
  },
  async findById(id: string) {
    const [rows] = await pool.execute('SELECT * FROM firmware WHERE id = ?', [id]);
    return (rows as any[])[0];
  },
  async findByCategory(categoryId: string) {
    const [rows] = await pool.execute("SELECT * FROM firmware WHERE category_id = ? AND status = 'approved' ORDER BY created_at DESC", [categoryId]);
    return rows as any[];
  },
  async findHot(limit: number = 6) {
    const [rows] = await pool.query(`SELECT * FROM firmware WHERE status = 'approved' ORDER BY download_count DESC LIMIT ${Number(limit)}`);
    return rows as any[];
  },
  async findLatest(limit: number = 6) {
    const [rows] = await pool.query(`SELECT * FROM firmware WHERE status = 'approved' ORDER BY created_at DESC LIMIT ${Number(limit)}`);
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
    const [result] = await pool.execute(
      'INSERT INTO firmware (title, description, version, category_id, uploader_id, uploader_name, file_path, file_size, is_paid, price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
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
        firmware.price || null,
        firmware.status || 'pending'
      ]
    );
    return result;
  },
  async findPending() {
    const [rows] = await pool.execute('SELECT * FROM firmware WHERE status = "pending" ORDER BY created_at DESC');
    return rows as any[];
  },
  async updateStatus(id: string, status: string) {
    await pool.execute('UPDATE firmware SET status = ? WHERE id = ?', [status, id]);
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
    const [result] = await pool.execute(
      'INSERT INTO downloads (user_id, firmware_id, firmware_title) VALUES (?, ?, ?)',
      [download.userId, download.firmwareId, download.firmwareTitle || null]
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
    const [result] = await pool.execute(
      'INSERT INTO donations (user_id, user_nickname, amount, type) VALUES (?, ?, ?, ?)',
      [donation.userId || null, donation.userNickname, donation.amount, donation.type]
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
    await pool.execute('UPDATE config SET value = ? WHERE `key` = ?', [JSON.stringify(value), key]);
  },
  async update(key: string, value: object) {
    await pool.execute('UPDATE config SET value = ? WHERE `key` = ?', [JSON.stringify(value), key]);
  }
};

export const licenseKeyDB = {
  async create(data: {
    key: string;
    firmwareId: string;
    firmwareTitle: string;
    userEmail?: string;
    expiresAt: Date;
  }) {
    const [result] = await pool.execute(
      'INSERT INTO license_keys (`key`, firmware_id, firmware_title, user_email, expires_at) VALUES (?, ?, ?, ?, ?)',
      [data.key, data.firmwareId, data.firmwareTitle, data.userEmail || null, data.expiresAt]
    );
    return result;
  },
  async findByKey(key: string) {
    const [rows] = await pool.execute('SELECT * FROM license_keys WHERE `key` = ?', [key]);
    return (rows as any[])[0];
  },
  async markAsUsed(id: string, userEmail: string) {
    await pool.execute('UPDATE license_keys SET is_used = TRUE, used_at = NOW(), user_email = ? WHERE id = ?', [userEmail, id]);
  },
  async findByUserEmail(email: string) {
    const [rows] = await pool.execute('SELECT * FROM license_keys WHERE user_email = ? ORDER BY created_at DESC', [email]);
    return rows as any[];
  },
  async findByFirmwareId(firmwareId: string) {
    const [rows] = await pool.execute('SELECT * FROM license_keys WHERE firmware_id = ? ORDER BY created_at DESC', [firmwareId]);
    return rows as any[];
  },
  async deleteExpired() {
    const [result] = await pool.execute('DELETE FROM license_keys WHERE expires_at < NOW()');
    return result;
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
    const [result] = await pool.execute(
      'INSERT INTO user_firmware_downloads (user_id, firmware_id, download_count) VALUES (?, ?, 1)',
      [data.userId, data.firmwareId]
    );
    return result;
  },
  async incrementDownloadCount(userId: string, firmwareId: string) {
    await pool.execute(
      'UPDATE user_firmware_downloads SET download_count = download_count + 1, last_download_at = NOW() WHERE user_id = ? AND firmware_id = ?',
      [userId, firmwareId]
    );
  },
  async findRecentDownloads(userId: string, days: number = 30) {
    const [rows] = await pool.execute(
      'SELECT * FROM user_firmware_downloads WHERE user_id = ? AND last_download_at > DATE_SUB(NOW(), INTERVAL ? DAY)',
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
