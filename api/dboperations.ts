import pool from './db.js';
// 模拟用户数据
const mockUsers = [
 { id: 'user-001', email: 'admin@example.com', password: '$2a$10$8K1p/a0dL1LXMIgZ6.ydI.tS8y3AqrN7K8h3.3K3K3K3K3K3K3K3K', nickname: '系统管理员', role: 'admin', download_quota: 9999, downloads_used: 0, is_premium: true },
 { id: 'user-1', email: 'user1@example.com', password: 'hashed', nickname: '科技达人', role: 'user', download_quota: 5, downloads_used: 2, is_premium: false },
 { id: 'user-2', email: 'user2@example.com', password: 'hashed', nickname: '硬件维修师', role: 'user', download_quota: 5, downloads_used: 1, is_premium: true },
];
// 模拟分类数据
const mockCategories = [
 { id: 'cat-1', name: '慧荣 (SMI)', parent_id: null, order_index: 1 },
 { id: 'cat-2', name: '群联 (Phison)', parent_id: null, order_index: 2 },
 { id: 'cat-3', name: '联芸 (Maxio)', parent_id: null, order_index: 3 },
 { id: 'cat-4', name: '得一微 (YMC)', parent_id: null, order_index: 4 },
 { id: 'cat-1-1', name: 'SM2258XT', parent_id: 'cat-1', order_index: 1 },
 { id: 'cat-1-2', name: 'SM2259XT', parent_id: 'cat-1', order_index: 2 },
 { id: 'cat-1-3', name: 'SM2263XT', parent_id: 'cat-1', order_index: 3 },
 { id: 'cat-2-1', name: 'PS3111', parent_id: 'cat-2', order_index: 1 },
 { id: 'cat-2-2', name: 'PS5013', parent_id: 'cat-2', order_index: 2 },
 { id: 'cat-3-1', name: 'MAP1202', parent_id: 'cat-3', order_index: 1 },
];
// 模拟固件数据
const mockFirmware = [
 { id: 'fw-1', title: 'SM2258XT 开卡工具 v1.2', description: '慧荣SM2258XT主控固态硬盘开卡工具，支持多种闪存颗粒，修复SSD无法识别问题。', version: '1.2', category_id: 'cat-1-1', uploader_id: 'user-001', uploader_name: '系统管理员', file_path: '/files/sm2258xt-v1.2.zip', file_size: 15728640, download_count: 2580, is_paid: false, price: null, status: 'approved', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
 { id: 'fw-2', title: 'PS3111 量产工具 v2.5', description: '群联PS3111主控SSD开卡工具，支持最新固件版本，提供完整的开卡教程。', version: '2.5', category_id: 'cat-2-1', uploader_id: 'user-001', uploader_name: '系统管理员', file_path: '/files/ps3111-v2.5.zip', file_size: 23068672, download_count: 1845, is_paid: false, price: null, status: 'approved', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
 { id: 'fw-3', title: 'SM2259XT 高级工具 v3.0', description: '专业版SM2259XT开卡工具，支持高级设置和调试功能，适合专业维修人员使用。', version: '3.0', category_id: 'cat-1-2', uploader_id: 'user-001', uploader_name: '系统管理员', file_path: '/files/sm2259xt-pro-v3.0.zip', file_size: 36700160, download_count: 890, is_paid: true, price: 19.9, status: 'approved', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
 { id: 'fw-4', title: 'MAP1202 开卡程序 v1.0', description: '联芸MAP1202主控专用开卡工具，操作简单，支持自动检测颗粒。', version: '1.0', category_id: 'cat-3-1', uploader_id: 'user-001', uploader_name: '系统管理员', file_path: '/files/map1202-v1.0.zip', file_size: 12582912, download_count: 654, is_paid: false, price: null, status: 'approved', created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
];
// 模拟捐赠数据
const mockDonations = [
 { id: 'don-1', user_id: null, user_nickname: '张*明', amount: 8, type: 'premium_upgrade', created_at: new Date(Date.now() - 1 * 60 * 1000).toISOString() },
 { id: 'don-2', user_id: null, user_nickname: '李*华', amount: 1, type: 'single_download', created_at: new Date(Date.now() - 3 * 60 * 1000).toISOString() },
 { id: 'don-3', user_id: null, user_nickname: '王*强', amount: 8, type: 'premium_upgrade', created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
];
// 模拟系统配置
const mockConfigs = {
 site_settings: JSON.stringify({ name: 'SSD开卡工具站', description: '专业的固态硬盘开卡工具分享平台' }),
 module_settings: JSON.stringify({ showHero: true, showHot: true, showLatest: true, showDonations: true, showContributors: true }),
 quota_settings: JSON.stringify({ freeQuota: 5, premiumQuota: 100, singleDownloadPrice: 1, premiumPrice: 8 }),
};
let useMockData = false;
export function setUseMockData(value: boolean) {
 useMockData = value;
}
export function getUseMockData() {
 return useMockData;
}
export const userDB = {
 async findByEmail(email: string) {
 if (useMockData) {
 return mockUsers.find(u => u.email === email) || null;
 }
 const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
 return (rows as any[])[0];
 },
 async findById(id: string) {
 if (useMockData) {
 return mockUsers.find(u => u.id === id) || null;
 }
 const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
 return (rows as any[])[0];
 },
 async create(user: {
 email: string;
 password: string;
 nickname: string;
 role?: string;
 }) {
 if (useMockData) {
 const newUser = {
 id: `user-${Date.now()}`,
 email: user.email,
 password: user.password,
 nickname: user.nickname,
 role: user.role || 'user',
 download_quota: 5,
 downloads_used: 0,
 is_premium: false,
 };
 mockUsers.push(newUser);
 return newUser;
 }
 const [result] = await pool.execute(`INSERT INTO users (email, nickname, role, download_quota, is_premium) VALUES (?, ?, ?, 5, FALSE)`, [user.email, user.nickname, user.role || 'user']);
 return result;
 },
 async updateDownloadsUsed(id: string, downloadsUsed: number) {
 if (useMockData) {
 const user = mockUsers.find(u => u.id === id);
 if (user) {
 user.downloads_used = downloadsUsed;
 }
 return;
 }
 await pool.execute('UPDATE users SET downloads_used = ? WHERE id = ?', [downloadsUsed, id]);
 },
 async upgradeToPremium(id: string, quota: number) {
 if (useMockData) {
 const user = mockUsers.find(u => u.id === id);
 if (user) {
 user.is_premium = true;
 user.download_quota = quota;
 }
 return;
 }
 await pool.execute('UPDATE users SET is_premium = TRUE, download_quota = ? WHERE id = ?', [quota, id]);
 },
 async findAll() {
 if (useMockData) {
 return mockUsers;
 }
 const [rows] = await pool.execute('SELECT * FROM users ORDER BY created_at DESC');
 return rows as any[];
 },
 async delete(id: string) {
 if (useMockData) {
 const index = mockUsers.findIndex(u => u.id === id);
 if (index !== -1) {
 mockUsers.splice(index, 1);
 }
 return { affectedRows: 1 };
 }
 const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
 return result;
 }
};
export const categoryDB = {
 async findAll() {
 if (useMockData) {
 return mockCategories;
 }
 const [rows] = await pool.execute('SELECT * FROM categories ORDER BY order_index');
 return rows as any[];
 },
 async findById(id: string) {
 if (useMockData) {
 return mockCategories.find(c => c.id === id) || null;
 }
 const [rows] = await pool.execute('SELECT * FROM categories WHERE id = ?', [id]);
 return (rows as any[])[0];
 },
 async findChildren(parentId: string) {
 if (useMockData) {
 return mockCategories.filter(c => c.parent_id === parentId);
 }
 const [rows] = await pool.execute('SELECT * FROM categories WHERE parent_id = ? ORDER BY order_index', [parentId]);
 return rows as any[];
 }
};
export const firmwareDB = {
 async findAll(status: string = 'approved') {
 if (useMockData) {
 return mockFirmware.filter(f => f.status === status);
 }
 const [rows] = await pool.execute('SELECT * FROM firmware WHERE status = ? ORDER BY created_at DESC', [status]);
 return rows as any[];
 },
 async findById(id: string) {
 if (useMockData) {
 return mockFirmware.find(f => f.id === id) || null;
 }
 const [rows] = await pool.execute('SELECT * FROM firmware WHERE id = ?', [id]);
 return (rows as any[])[0];
 },
 async findByCategory(categoryId: string) {
 if (useMockData) {
 return mockFirmware.filter(f => f.category_id === categoryId && f.status === 'approved');
 }
 const [rows] = await pool.execute('SELECT * FROM firmware WHERE category_id = ? AND status = "approved" ORDER BY created_at DESC', [categoryId]);
 return rows as any[];
 },
 async findHot(limit: number = 6) {
 if (useMockData) {
 return [...mockFirmware]
 .filter(f => f.status === 'approved')
 .sort((a, b) => b.download_count - a.download_count)
 .slice(0, limit);
 }
 const [rows] = await pool.query(`SELECT * FROM firmware WHERE status = "approved" ORDER BY download_count DESC LIMIT ${Number(limit)}`);
 return rows as any[];
 },
 async findLatest(limit: number = 6) {
 if (useMockData) {
 return [...mockFirmware]
 .filter(f => f.status === 'approved')
 .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
 .slice(0, limit);
 }
 const [rows] = await pool.query(`SELECT * FROM firmware WHERE status = "approved" ORDER BY created_at DESC LIMIT ${Number(limit)}`);
 return rows as any[];
 },
 async incrementDownloadCount(id: string) {
 if (useMockData) {
 const firmware = mockFirmware.find(f => f.id === id);
 if (firmware) {
 firmware.download_count++;
 }
 return;
 }
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
 }) {
 if (useMockData) {
 const newFirmware = {
 id: `fw-${Date.now()}`,
 title: firmware.title,
 description: firmware.description,
 version: firmware.version,
 category_id: firmware.categoryId,
 uploader_id: firmware.uploaderId,
 uploader_name: firmware.uploaderName,
 file_path: firmware.filePath,
 file_size: firmware.fileSize,
 download_count: 0,
 is_paid: firmware.isPaid || false,
 price: firmware.price || null,
 status: 'approved',
 created_at: new Date().toISOString(),
 updated_at: new Date().toISOString(),
 };
 mockFirmware.push(newFirmware);
 return { insertId: newFirmware.id };
 }
 const [result] = await pool.execute(`INSERT INTO firmware (title, description, version, category_id, uploader_id, uploader_name, file_path, file_size, is_paid, price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved')`, [
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
 ]);
 return result;
 },
 async findPending() {
 if (useMockData) {
 return mockFirmware.filter(f => f.status === 'pending');
 }
 const [rows] = await pool.execute('SELECT * FROM firmware WHERE status = "pending" ORDER BY created_at DESC');
 return rows as any[];
 },
 async updateStatus(id: string, status: string) {
 if (useMockData) {
 const firmware = mockFirmware.find(f => f.id === id);
 if (firmware) {
 firmware.status = status;
 }
 return;
 }
 await pool.execute('UPDATE firmware SET status = ? WHERE id = ?', [status, id]);
 },
 async delete(id: string) {
 if (useMockData) {
 const index = mockFirmware.findIndex(f => f.id === id);
 if (index !== -1) {
 mockFirmware.splice(index, 1);
 }
 return { affectedRows: 1 };
 }
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
 if (useMockData) {
 return { insertId: `download-${Date.now()}` };
 }
 const [result] = await pool.execute(`INSERT INTO downloads (user_id, firmware_id, firmware_title) VALUES (?, ?, ?)`, [download.userId, download.firmwareId, download.firmwareTitle || null]);
 return result;
 },
 async findByUser(userId: string) {
 if (useMockData) {
 return [];
 }
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
 if (useMockData) {
 const newDonation = {
 id: `don-${Date.now()}`,
 user_id: donation.userId || null,
 user_nickname: donation.userNickname,
 amount: donation.amount,
 type: donation.type,
 created_at: new Date().toISOString(),
 };
 mockDonations.push(newDonation);
 return { insertId: newDonation.id };
 }
 const [result] = await pool.execute(`INSERT INTO donations (user_id, user_nickname, amount, type) VALUES (?, ?, ?, ?)`, [donation.userId || null, donation.userNickname, donation.amount, donation.type]);
 return result;
 },
 async findAll(limit: number = 20) {
 if (useMockData) {
 return [...mockDonations].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, limit);
 }
 const [rows] = await pool.query(`SELECT * FROM donations ORDER BY created_at DESC LIMIT ${Number(limit)}`);
 return rows as any[];
 },
 async getTotalAmount() {
 if (useMockData) {
 return mockDonations.reduce((sum, d) => sum + d.amount, 0);
 }
 const [rows] = await pool.execute('SELECT SUM(amount) as total FROM donations');
 return (rows as any[])[0]?.total || 0;
 }
};
export const configDB = {
 async get(key: string) {
 if (useMockData) {
 const value = mockConfigs[key as keyof typeof mockConfigs];
 return value ? JSON.parse(value) : null;
 }
 const [rows] = await pool.execute('SELECT value FROM config WHERE `key` = ?', [key]);
 const row = (rows as any[])[0];
 return row ? JSON.parse(row.value) : null;
 },
 async set(key: string, value: object) {
 if (useMockData) {
 mockConfigs[key as keyof typeof mockConfigs] = JSON.stringify(value);
 return;
 }
 await pool.execute('UPDATE config SET value = ? WHERE `key` = ?', [JSON.stringify(value), key]);
 }
};
let licenseKeys: any[] = [];
export const licenseKeyDB = {
 async create(data: {
 key: string;
 firmwareId: string;
 firmwareTitle: string;
 userEmail?: string;
 expiresAt: Date;
 }) {
 if (useMockData) {
 const newKey = {
 id: `license-${Date.now()}`,
 key: data.key,
 firmware_id: data.firmwareId,
 firmware_title: data.firmwareTitle,
 user_email: data.userEmail || null,
 is_used: false,
 used_at: null,
 expires_at: data.expiresAt,
 created_at: new Date().toISOString(),
 };
 licenseKeys.push(newKey);
 return { insertId: newKey.id };
 }
 const [result] = await pool.execute(`INSERT INTO license_keys (\`key\`, firmware_id, firmware_title, user_email, expires_at) VALUES (?, ?, ?, ?, ?)`, [data.key, data.firmwareId, data.firmwareTitle, data.userEmail || null, data.expiresAt]);
 return result;
 },
 async findByKey(key: string) {
 if (useMockData) {
 return licenseKeys.find(lk => lk.key === key) || null;
 }
 const [rows] = await pool.execute('SELECT * FROM license_keys WHERE `key` = ?', [key]);
 return (rows as any[])[0];
 },
 async markAsUsed(id: string, userEmail: string) {
 if (useMockData) {
 const key = licenseKeys.find(lk => lk.id === id);
 if (key) {
 key.is_used = true;
 key.used_at = new Date().toISOString();
 key.user_email = userEmail;
 }
 return;
 }
 await pool.execute('UPDATE license_keys SET is_used = TRUE, used_at = NOW(), user_email = ? WHERE id = ?', [userEmail, id]);
 },
 async findByUserEmail(email: string) {
 if (useMockData) {
 return licenseKeys.filter(lk => lk.user_email === email);
 }
 const [rows] = await pool.execute('SELECT * FROM license_keys WHERE user_email = ? ORDER BY created_at DESC', [email]);
 return rows as any[];
 },
 async findByFirmwareId(firmwareId: string) {
 if (useMockData) {
 return licenseKeys.filter(lk => lk.firmware_id === firmwareId);
 }
 const [rows] = await pool.execute('SELECT * FROM license_keys WHERE firmware_id = ? ORDER BY created_at DESC', [firmwareId]);
 return rows as any[];
 },
 async deleteExpired() {
 if (useMockData) {
 const now = new Date();
 licenseKeys = licenseKeys.filter(lk => new Date(lk.expires_at) > now);
 return { affectedRows: 0 };
 }
 const [result] = await pool.execute('DELETE FROM license_keys WHERE expires_at < NOW()');
 return result;
 }
};
let ufdRecords: any[] = [];
export const userFirmwareDownloadDB = {
 async findByUserAndFirmware(userId: string, firmwareId: string) {
 if (useMockData) {
 return ufdRecords.find(r => r.user_id === userId && r.firmware_id === firmwareId) || null;
 }
 const [rows] = await pool.execute('SELECT * FROM user_firmware_downloads WHERE user_id = ? AND firmware_id = ?', [userId, firmwareId]);
 return (rows as any[])[0];
 },
 async create(data: {
 userId: string;
 firmwareId: string;
 }) {
 if (useMockData) {
 const newRecord = {
 id: `ufd-${Date.now()}`,
 user_id: data.userId,
 firmware_id: data.firmwareId,
 download_count: 1,
 first_download_at: new Date().toISOString(),
 last_download_at: new Date().toISOString(),
 };
 ufdRecords.push(newRecord);
 return { insertId: newRecord.id };
 }
 const [result] = await pool.execute(`INSERT INTO user_firmware_downloads (user_id, firmware_id, download_count) VALUES (?, ?, 1)`, [data.userId, data.firmwareId]);
 return result;
 },
 async incrementDownloadCount(userId: string, firmwareId: string) {
 if (useMockData) {
 const record = ufdRecords.find(r => r.user_id === userId && r.firmware_id === firmwareId);
 if (record) {
 record.download_count++;
 record.last_download_at = new Date().toISOString();
 }
 return;
 }
 await pool.execute(`UPDATE user_firmware_downloads SET download_count = download_count + 1, last_download_at = NOW() WHERE user_id = ? AND firmware_id = ?`, [userId, firmwareId]);
 },
 async findRecentDownloads(userId: string, days: number = 30) {
 if (useMockData) {
 return [];
 }
 const [rows] = await pool.execute(`SELECT * FROM user_firmware_downloads WHERE user_id = ? AND last_download_at > DATE_SUB(NOW(), INTERVAL ? DAY)`, [userId, days]);
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