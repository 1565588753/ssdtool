/**
 * 固件管理 API 路由
 * 处理固件的查询、下载、上传等
 */
import { Router, type Request, type Response } from 'express';
import { firmwareDB, categoryDB, downloadDB, userDB, configDB, downloadTokenDB, userFirmwareDownloadDB } from '../dboperations.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { verifyToken, extractUserId } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

const ALLOWED_EXTENSIONS = ['.zip', '.rar', '.7z', '.bin', '.img', '.gz', '.tar', '.bz2'];
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../files'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = uuidv4() + ext;
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      cb(new Error(`不支持的文件类型: ${ext}，仅支持 ${ALLOWED_EXTENSIONS.join(', ')}`));
      return;
    }
    cb(null, true);
  }
});

/**
 * 获取所有固件
 * GET /api/firmware
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const firmware = await firmwareDB.findAll();
    res.json({
      success: true,
      firmware: firmware.map((fw: any) => ({
        id: fw.id,
        title: fw.title,
        description: fw.description,
        version: fw.version,
        categoryId: fw.category_id,
        uploaderId: fw.uploader_id,
        uploaderName: fw.uploader_name,
        filePath: fw.file_path,
        fileSize: fw.file_size,
        downloadCount: fw.download_count,
        isPaid: Boolean(fw.is_paid),
        price: fw.price,
        status: fw.status,
        createdAt: fw.created_at,
        updatedAt: fw.updated_at
      }))
    });
  } catch (error) {
    console.error('获取固件列表错误:', error);
    res.status(500).json({
      success: false,
      error: '获取固件列表失败'
    });
  }
});

/**
 * 获取热门固件
 * GET /api/firmware/hot
 */
router.get('/hot', async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 6;
    const firmware = await firmwareDB.findHot(limit);
    res.json({
      success: true,
      firmware: firmware.map((fw: any) => ({
        id: fw.id,
        title: fw.title,
        description: fw.description,
        version: fw.version,
        categoryId: fw.category_id,
        uploaderId: fw.uploader_id,
        uploaderName: fw.uploader_name,
        filePath: fw.file_path,
        fileSize: fw.file_size,
        downloadCount: fw.download_count,
        isPaid: Boolean(fw.is_paid),
        price: fw.price,
        status: fw.status,
        createdAt: fw.created_at,
        updatedAt: fw.updated_at
      }))
    });
  } catch (error) {
    console.error('获取热门固件错误:', error);
    res.status(500).json({
      success: false,
      error: '获取热门固件失败'
    });
  }
});

/**
 * 获取最新固件
 * GET /api/firmware/latest
 */
router.get('/latest', async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 6;
    const firmware = await firmwareDB.findLatest(limit);
    res.json({
      success: true,
      firmware: firmware.map((fw: any) => ({
        id: fw.id,
        title: fw.title,
        description: fw.description,
        version: fw.version,
        categoryId: fw.category_id,
        uploaderId: fw.uploader_id,
        uploaderName: fw.uploader_name,
        filePath: fw.file_path,
        fileSize: fw.file_size,
        downloadCount: fw.download_count,
        isPaid: Boolean(fw.is_paid),
        price: fw.price,
        status: fw.status,
        createdAt: fw.created_at,
        updatedAt: fw.updated_at
      }))
    });
  } catch (error) {
    console.error('获取最新固件错误:', error);
    res.status(500).json({
      success: false,
      error: '获取最新固件失败'
    });
  }
});

/**
 * 获取单个固件详情
 * GET /api/firmware/:id
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const firmware = await firmwareDB.findById(id);

    if (!firmware) {
      res.status(404).json({
        success: false,
        error: '固件不存在'
      });
      return;
    }

    res.json({
      success: true,
      firmware: {
        id: firmware.id,
        title: firmware.title,
        description: firmware.description,
        version: firmware.version,
        categoryId: firmware.category_id,
        uploaderId: firmware.uploader_id,
        uploaderName: firmware.uploader_name,
        filePath: firmware.file_path,
        fileSize: firmware.file_size,
        downloadCount: firmware.download_count,
        isPaid: Boolean(firmware.is_paid),
        price: firmware.price,
        status: firmware.status,
        createdAt: firmware.created_at,
        updatedAt: firmware.updated_at
      }
    });
  } catch (error) {
    console.error('获取固件详情错误:', error);
    res.status(500).json({
      success: false,
      error: '获取固件详情失败'
    });
  }
});

/**
 * 下载固件
 * POST /api/firmware/:id/download
 */
router.post('/:id/download', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = extractUserId(req);
    
    if (!userId) {
      res.status(401).json({ success: false, error: '请先登录' });
      return;
    }

    const user = await userDB.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, error: '用户不存在' });
      return;
    }

    const firmware = await firmwareDB.findById(id);
    if (!firmware) {
      res.status(404).json({ success: false, error: '固件不存在' });
      return;
    }

    // 检查30天内免费重下载
    const existingDownload = await userFirmwareDownloadDB.findByUserAndFirmware(userId, id);
    let isFreeRedownload = false;
    if (existingDownload) {
      const lastDownload = new Date(existingDownload.last_download_at).getTime();
      const daysSinceLast = (Date.now() - lastDownload) / (1000 * 60 * 60 * 24);
      isFreeRedownload = daysSinceLast <= 30;
    }

    if (!isFreeRedownload) {
      const config = await configDB.get('quota_settings');
      const maxQuota = user.is_premium ? config.premiumQuota : config.freeQuota;

      if (user.downloads_used >= maxQuota) {
        res.status(400).json({ success: false, error: '下载额度已用完，请升级 Premium 或等待下月重置' });
        return;
      }

      if (!user.is_premium && user.last_download_at) {
        const lastDownload = new Date(user.last_download_at).getTime();
        const diffSeconds = Math.floor((Date.now() - lastDownload) / 1000);
        if (diffSeconds < 60) {
          const remaining = 60 - diffSeconds;
          res.status(429).json({ success: false, error: `操作太频繁，请 ${remaining} 秒后再试`, remainingSeconds: remaining });
          return;
        }
      }
    }

    // 生成一次性token
    const tokenId = `tok-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const rawToken = Buffer.from(tokenId).toString('base64').replace(/=/g, '');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');

    await downloadTokenDB.create({ firmwareId: id, userId, token: rawToken, expiresAt });

    // 更新 user_firmware_downloads
    if (existingDownload) {
      await userFirmwareDownloadDB.incrementDownloadCount(userId, id);
    } else {
      await userFirmwareDownloadDB.create({ userId, firmwareId: id });
    }

    // 记录下载
    await downloadDB.create({ userId, firmwareId: id, firmwareTitle: firmware.title });

    // 更新固件下载次数
    await firmwareDB.incrementDownloadCount(id);

    // 只有首次下载或超过30天才扣配额
    if (!isFreeRedownload) {
      await userDB.updateDownloadsUsed(userId, user.downloads_used + 1);
      await userDB.updateLastDownloadAt(userId);
    }

    const lastRecord = existingDownload || await userFirmwareDownloadDB.findByUserAndFirmware(userId, id);
    const remainingDays = lastRecord ? 30 - Math.floor((Date.now() - new Date(lastRecord.first_download_at).getTime()) / (1000 * 60 * 60 * 24)) : 30;

    res.json({ success: true, message: '下载成功', token: rawToken, expiresAt, isFreeRedownload, remainingDays: Math.max(0, remainingDays) });
  } catch (error) {
    console.error('下载固件错误:', error);
    res.status(500).json({ success: false, error: '下载失败' });
  }
});

/**
 * 获取分类下的固件
 * GET /api/firmware/category/:categoryId
 */
router.get('/category/:categoryId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;

    // 获取该分类及子分类的所有固件
    const categoryIds = [categoryId];
    const children = await categoryDB.findChildren(categoryId);
    
    for (const child of children as any[]) {
      categoryIds.push(child.id);
      const grandchildren = await categoryDB.findChildren(child.id);
      for (const grandchild of grandchildren as any[]) {
        categoryIds.push(grandchild.id);
      }
    }

    let allFirmware: any[] = [];
    for (const catId of categoryIds) {
      const firmware = await firmwareDB.findByCategory(catId);
      allFirmware = allFirmware.concat(firmware);
    }

    // 去重
    const uniqueFirmware = Array.from(new Set(allFirmware.map(f => f.id)))
      .map(id => allFirmware.find(f => f.id === id));

    res.json({
      success: true,
      firmware: uniqueFirmware.map((fw: any) => ({
        id: fw.id,
        title: fw.title,
        description: fw.description,
        version: fw.version,
        categoryId: fw.category_id,
        uploaderId: fw.uploader_id,
        uploaderName: fw.uploader_name,
        filePath: fw.file_path,
        fileSize: fw.file_size,
        downloadCount: fw.download_count,
        isPaid: Boolean(fw.is_paid),
        price: fw.price,
        status: fw.status,
        createdAt: fw.created_at,
        updatedAt: fw.updated_at
      }))
    });
  } catch (error) {
    console.error('获取分类固件错误:', error);
    res.status(500).json({
      success: false,
      error: '获取分类固件失败'
    });
  }
});

/**
 * 上传固件
 * POST /api/firmware/upload
 */
router.post('/upload', upload.single('firmwareFile'), async (req: Request, res: Response): Promise<void> => {
  try {
const userId = extractUserId(req);
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: '请先登录'
      });
      return;
    }

    // 验证上传者角色（仅限管理员和维护者）
    const [userRows] = await pool.execute('SELECT role, nickname FROM users WHERE id = ?', [userId]);
    const user = (userRows as any[])[0];
    if (!user || (user.role !== 'admin' && user.role !== 'maintainer')) {
      res.status(403).json({
        success: false,
        error: '权限不足，仅管理员和维护者可上传固件'
      });
      return;
    }

    const { title, description, version, categoryId, isPaid, price } = req.body;
    
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: '请选择要上传的固件文件'
      });
      return;
    }

    if (!title || !categoryId) {
      res.status(400).json({
        success: false,
        error: '请填写完整的固件信息'
      });
      return;
    }

    // 创建固件记录
    const firmwareData = {
      title,
      description: description || '',
      version: version || '1.0',
      categoryId: categoryId,
      uploaderId: userId,
      uploaderName: user.nickname,
      filePath: `/uploads/${req.file.filename}`,
      fileSize: req.file.size,
      isPaid: isPaid === 'true' || isPaid === true,
      price: price ? parseFloat(price) : 0,
      status: 'approved'
    };

    const result = await firmwareDB.create(firmwareData);
    const id = typeof result === 'object' && result !== null ? (result as any).insertId : result;

    res.json({
      success: true,
      message: '固件上传成功',
      id
    });
  } catch (error) {
    console.error('上传固件错误:', error);
    res.status(500).json({
      success: false,
      error: '上传失败'
    });
  }
});

/**
 * 通过一次性token下载固件
 * GET /api/firmware/:id/dl/:token
 */
router.get('/:id/dl/:token', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, token } = req.params;

    const tokenRecord = await downloadTokenDB.findByToken(token);
    if (!tokenRecord) {
      res.status(404).json({ success: false, error: '下载链接无效或不存在' });
      return;
    }

    if (tokenRecord.used) {
      res.status(410).json({ success: false, error: '下载链接已被使用' });
      return;
    }

    if (new Date(tokenRecord.expires_at) < new Date()) {
      res.status(410).json({ success: false, error: '下载链接已过期' });
      return;
    }

    const firmware = await firmwareDB.findById(id);
    if (!firmware) {
      res.status(404).json({ success: false, error: '固件不存在' });
      return;
    }

    // 标记token已使用
    await downloadTokenDB.markAsUsed(token);

    const fileName = path.basename(firmware.file_path);
    const filesDir = path.join(__dirname, '../../files');
    const filePath = path.join(filesDir, fileName);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ success: false, error: '文件不存在' });
      return;
    }

    const downloadName = `ssdtool${firmware.title}${Date.now()}${path.extname(fileName)}`;
    res.download(filePath, downloadName);
  } catch (error) {
    console.error('token下载错误:', error);
    res.status(500).json({ success: false, error: '下载失败' });
  }
});

export default router;
