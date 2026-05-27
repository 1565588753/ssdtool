/**
 * 固件管理 API 路由
 * 处理固件的查询、下载、上传等
 */
import { Router, type Request, type Response } from 'express';
import { firmwareDB, categoryDB, downloadDB, userDB, configDB } from '../dboperations.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { verifyToken } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../files'));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

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
    const authHeader = req.headers.authorization;
    let userId = req.headers['x-user-id'] as string;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload = verifyToken(token);
      if (payload) {
        userId = payload.userId;
      }
    }

    if (!userId) {
      res.status(401).json({
        success: false,
        error: '请先登录'
      });
      return;
    }

    // 获取用户信息
    const user = await userDB.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: '用户不存在'
      });
      return;
    }

    // 获取固件信息
    const firmware = await firmwareDB.findById(id);
    if (!firmware) {
      res.status(404).json({
        success: false,
        error: '固件不存在'
      });
      return;
    }

    // 检查下载额度
    const config = await configDB.get('quota_settings');
    const maxQuota = user.is_premium ? config.premiumQuota : config.freeQuota;

    if (user.downloads_used >= maxQuota) {
      res.status(400).json({
        success: false,
        error: '下载额度已用完，请升级 Premium 或等待下月重置'
      });
      return;
    }

    // 创建下载记录
    await downloadDB.create({
      userId,
      firmwareId: id,
      firmwareTitle: firmware.title
    });

    // 更新固件下载次数
    await firmwareDB.incrementDownloadCount(id);

    // 更新用户下载次数
    await userDB.updateDownloadsUsed(userId, user.downloads_used + 1);

    res.json({
      success: true,
      message: '下载成功',
      downloadUrl: firmware.file_path
    });
  } catch (error) {
    console.error('下载固件错误:', error);
    res.status(500).json({
      success: false,
      error: '下载失败'
    });
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
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: '请先登录'
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

    // 获取上传者信息
    const user = await userDB.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: '用户不存在'
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
 * 获取固件实际文件 - 支持挂载站重定向
 * GET /api/firmware/:id/file
 */
router.get('/:id/file', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const firmware = await firmwareDB.findById(id);
    if (!firmware) {
      res.status(404).json({ success: false, error: '固件不存在' });
      return;
    }

    // 检查是否配置了挂载站域名
    const storageSettings = await configDB.get('storage_settings');
    if (storageSettings && storageSettings.mountDomain) {
      const fileName = path.basename(firmware.file_path);
      const redirectUrl = `${storageSettings.mountDomain.replace(/\/$/, '')}/${fileName}`;
      res.redirect(302, redirectUrl);
      return;
    }

    // 兜底：直接从服务器提供文件
    const filePath = firmware.file_path;
    const fileName = path.basename(filePath);
    const fullPath = path.join(__dirname, '../../files', fileName);

    if (!fs.existsSync(fullPath)) {
      res.status(404).json({ success: false, error: '文件不存在' });
      return;
    }

    const ext = path.extname(fileName);
    const downloadName = encodeURIComponent(firmware.title + ext);

    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${downloadName}`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.sendFile(fullPath);
  } catch (error) {
    console.error('获取固件文件错误:', error);
    res.status(500).json({ success: false, error: '获取文件失败' });
  }
});

export default router;
