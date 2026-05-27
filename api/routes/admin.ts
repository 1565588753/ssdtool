/**
 * 管理员 API 路由
 * 处理用户管理、固件审核、配置管理等管理员功能
 */
import { Router, type Request, type Response } from 'express';
import pool from '../db.js';
import { userDB, firmwareDB, configDB, categoryDB } from '../dboperations.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifyToken, extractUserId } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// 中间件：检查管理员权限
async function adminMiddleware(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  let userId = req.headers['x-user-id'] as string;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (payload) {
      userId = payload.userId;
      (req as any).userId = payload.userId;
    }
  }

  if (!userId) {
    res.status(401).json({ success: false, error: '请先登录' });
    return;
  }

  try {
    const [rows] = await pool.execute('SELECT role FROM users WHERE id = ?', [userId]);
    const user = (rows as any[])[0];

    if (!user || user.role !== 'admin') {
      res.status(403).json({ success: false, error: '权限不足，需要管理员权限' });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, error: '权限验证失败' });
  }
}

// 应用中间件到所有路由
router.use(adminMiddleware);

/**
 * 获取所有用户列表
 * GET /api/admin/users
 */
router.get('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute('SELECT * FROM users ORDER BY created_at DESC');
    const users = rows as any[];
    
    res.json({
      success: true,
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
        avatar: user.avatar_url,
        downloadQuota: user.download_quota,
        downloadsUsed: user.downloads_used,
        quotaResetDate: user.quota_reset_date,
        isPremium: Boolean(user.is_premium),
        createdAt: user.created_at
      }))
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ success: false, error: '获取用户列表失败' });
  }
});

/**
 * 创建用户
 * POST /api/admin/users
 */
router.post('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, nickname, role } = req.body;

    if (!email || !password || !nickname) {
      res.status(400).json({ success: false, error: '邮箱、密码和昵称为必填项' });
      return;
    }

    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `user-${Date.now()}`;

    await pool.execute(
      'INSERT INTO users (id, email, password, nickname, role, download_quota, is_premium) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, email, hashedPassword, nickname, role || 'user', 5, 0]
    );

    res.json({
      success: true,
      user: {
        id: userId,
        email,
        nickname,
        role: role || 'user',
        avatar: null,
        downloadQuota: 5,
        downloadsUsed: 0,
        quotaResetDate: null,
        isPremium: false,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY' || error.message?.includes('UNIQUE constraint') || error.message?.includes('Duplicate entry')) {
      res.status(400).json({ success: false, error: '该邮箱已被注册' });
      return;
    }
    console.error('创建用户错误:', error);
    res.status(500).json({ success: false, error: '创建用户失败' });
  }
});

/**
 * 更新用户信息
 * PUT /api/admin/users/:id
 */
router.put('/users/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { email, password, nickname, role, downloadQuota, isPremium } = req.body;

    const updates: string[] = [];
    const params: any[] = [];

    if (email !== undefined) {
      updates.push('email = ?');
      params.push(email);
    }
    if (password !== undefined && password !== '') {
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      params.push(hashedPassword);
    }
    if (nickname !== undefined) {
      updates.push('nickname = ?');
      params.push(nickname);
    }
    if (role !== undefined) {
      updates.push('role = ?');
      params.push(role);
    }
    if (downloadQuota !== undefined) {
      updates.push('download_quota = ?');
      params.push(downloadQuota);
    }
    if (isPremium !== undefined) {
      updates.push('is_premium = ?');
      params.push(isPremium ? 1 : 0);
    }

    if (updates.length === 0) {
      res.status(400).json({ success: false, error: '没有需要更新的字段' });
      return;
    }

    params.push(id);
    await pool.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ success: true, message: '用户信息更新成功' });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY' || error.message?.includes('UNIQUE constraint') || error.message?.includes('Duplicate entry')) {
      res.status(400).json({ success: false, error: '该邮箱已被其他用户使用' });
      return;
    }
    console.error('更新用户错误:', error);
    res.status(500).json({ success: false, error: '更新用户失败' });
  }
});

/**
 * 更新用户角色
 * PUT /api/admin/users/:id/role
 */
router.put('/users/:id/role', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'maintainer', 'user'].includes(role)) {
      res.status(400).json({ success: false, error: '无效的角色' });
      return;
    }

    await pool.execute('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    res.json({ success: true, message: '角色更新成功' });
  } catch (error) {
    console.error('更新用户角色错误:', error);
    res.status(500).json({ success: false, error: '更新角色失败' });
  }
});

/**
 * 删除用户
 * DELETE /api/admin/users/:id
 */
router.delete('/users/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = extractUserId(req);

    if (id === userId) {
      res.status(400).json({ success: false, error: '不能删除自己' });
      return;
    }

    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true, message: '用户删除成功' });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({ success: false, error: '删除用户失败' });
  }
});

/**
 * 获取所有固件（包括待审核）
 * GET /api/admin/firmware
 */
router.get('/firmware', async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute('SELECT * FROM firmware ORDER BY created_at DESC');
    const firmwareList = rows as any[];
    
    res.json({
      success: true,
      firmware: firmwareList.map(fw => ({
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
    res.status(500).json({ success: false, error: '获取固件列表失败' });
  }
});

/**
 * 更新固件
 * PUT /api/admin/firmware/:id
 */
router.put('/firmware/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, version, categoryId, isPaid, price } = req.body;

    const updates: string[] = [];
    const params: any[] = [];

    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (version !== undefined) {
      updates.push('version = ?');
      params.push(version);
    }
    if (categoryId !== undefined) {
      updates.push('category_id = ?');
      params.push(categoryId);
    }
    if (isPaid !== undefined) {
      updates.push('is_paid = ?');
      params.push(isPaid ? 1 : 0);
    }
    if (price !== undefined) {
      updates.push('price = ?');
      params.push(price);
    }
    if (updates.length === 0) {
      res.status(400).json({ success: false, error: '没有需要更新的字段' });
      return;
    }

    params.push(id);
    await pool.execute(
      `UPDATE firmware SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ success: true, message: '固件更新成功' });
  } catch (error) {
    console.error('更新固件错误:', error);
    res.status(500).json({ success: false, error: '更新固件失败' });
  }
});

/**
 * 删除固件
 * DELETE /api/admin/firmware/:id
 */
router.delete('/firmware/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute('SELECT file_path FROM firmware WHERE id = ?', [id]);
    const firmware = (rows as any[])[0];

    if (firmware && firmware.file_path) {
      const filePath = firmware.file_path.replace('/uploads/', '');
      const fullPath = path.join(__dirname, '../../files', filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    await pool.execute('DELETE FROM firmware WHERE id = ?', [id]);
    res.json({ success: true, message: '固件删除成功' });
  } catch (error) {
    console.error('删除固件错误:', error);
    res.status(500).json({ success: false, error: '删除固件失败' });
  }
});

/**
 * 创建分类
 * POST /api/admin/categories
 */
router.post('/categories', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, parentId, orderIndex } = req.body;

    if (!name) {
      res.status(400).json({ success: false, error: '分类名称不能为空' });
      return;
    }

    const id = `cat-${Date.now()}`;
    const [result] = await pool.execute(
      'INSERT INTO categories (id, name, parent_id, order_index) VALUES (?, ?, ?, ?)',
      [id, name, parentId || null, orderIndex || 0]
    );
    
    res.json({ success: true, message: '分类创建成功', id });
  } catch (error) {
    console.error('创建分类错误:', error);
    res.status(500).json({ success: false, error: '创建分类失败' });
  }
});

/**
 * 更新分类
 * PUT /api/admin/categories/:id
 */
router.put('/categories/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, parentId, orderIndex } = req.body;

    await pool.execute(
      'UPDATE categories SET name = ?, parent_id = ?, order_index = ? WHERE id = ?',
      [name, parentId || null, orderIndex || 0, id]
    );

    res.json({ success: true, message: '分类更新成功' });
  } catch (error) {
    console.error('更新分类错误:', error);
    res.status(500).json({ success: false, error: '更新分类失败' });
  }
});

/**
 * 删除分类
 * DELETE /api/admin/categories/:id
 */
router.delete('/categories/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const [firmware] = await pool.execute(
      'SELECT COUNT(*) as count FROM firmware WHERE category_id = ?',
      [id]
    );
    const hasFirmware = (firmware as any[])[0].count > 0;
    
    if (hasFirmware) {
      res.status(400).json({ 
        success: false, 
        error: '该分类下存在固件，无法删除' 
      });
      return;
    }

    await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ success: true, message: '分类删除成功' });
  } catch (error) {
    console.error('删除分类错误:', error);
    res.status(500).json({ success: false, error: '删除分类失败' });
  }
});

/**
 * 获取所有分类（包括层级关系）
 * GET /api/admin/categories
 */
router.get('/categories', async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute('SELECT * FROM categories ORDER BY order_index ASC, created_at DESC');
    const categories = (rows as any[]).map(cat => ({
      id: cat.id,
      name: cat.name,
      parentId: cat.parent_id,
      orderIndex: cat.order_index,
      createdAt: cat.created_at
    }));
    
    const categoryTree = buildCategoryTree(categories);
    
    res.json({
      success: true,
      categories,
      categoryTree
    });
  } catch (error) {
    console.error('获取分类列表错误:', error);
    res.status(500).json({ success: false, error: '获取分类列表失败' });
  }
});

/**
 * 构建分类树形结构
 */
function buildCategoryTree(categories: any[]): any[] {
  const categoryMap = new Map();
  const roots: any[] = [];

  categories.forEach(cat => {
    categoryMap.set(cat.id, {
      ...cat,
      children: []
    });
  });

  categories.forEach(cat => {
    const category = categoryMap.get(cat.id);
    if (cat.parentId) {
      const parent = categoryMap.get(cat.parentId);
      if (parent) {
        parent.children.push(category);
      }
    } else {
      roots.push(category);
    }
  });

  return roots;
}

/**
 * 获取仪表盘统计
 * GET /api/admin/dashboard
 */
router.get('/dashboard', async (req: Request, res: Response): Promise<void> => {
  try {
    const [userStats] = await pool.execute('SELECT COUNT(*) as count FROM users');
    const [firmwareStats] = await pool.execute('SELECT COUNT(*) as count FROM firmware');
    const [downloadStats] = await pool.execute('SELECT COUNT(*) as count FROM downloads');
    const [donationTotal] = await pool.execute('SELECT SUM(amount) as total FROM donations');
    
    const dashboard = {
      totalUsers: (userStats as any[])[0].count,
      totalFirmware: (firmwareStats as any[])[0].count,
      totalDownloads: (downloadStats as any[])[0].count,
      totalDonations: (donationTotal as any[])[0]?.total || 0
    };
    
    res.json({
      success: true,
      dashboard
    });
  } catch (error) {
    console.error('获取仪表盘统计错误:', error);
    res.status(500).json({ success: false, error: '获取统计失败' });
  }
});

/**
 * 获取系统配置
 * GET /api/admin/config
 */
router.get('/config', async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute('SELECT * FROM config');
    
    const config = {};
    (rows as any[]).forEach(row => {
      config[row.key] = JSON.parse(row.value);
    });
    
    res.json({ success: true, config });
  } catch (error) {
    console.error('获取配置错误:', error);
    res.status(500).json({ success: false, error: '获取配置失败' });
  }
});

/**
 * 更新系统配置
 * PUT /api/admin/config
 */
router.put('/config', async (req: Request, res: Response): Promise<void> => {
  try {
    const { siteSettings, moduleSettings, quotaSettings } = req.body;

    if (siteSettings) {
      await pool.execute(
        "INSERT INTO config (`key`, value) VALUES ('site_settings', ?) ON DUPLICATE KEY UPDATE value = ?",
        [JSON.stringify(siteSettings), JSON.stringify(siteSettings)]
      );
    }

    if (moduleSettings) {
      await pool.execute(
        "INSERT INTO config (`key`, value) VALUES ('module_settings', ?) ON DUPLICATE KEY UPDATE value = ?",
        [JSON.stringify(moduleSettings), JSON.stringify(moduleSettings)]
      );
    }

    if (quotaSettings) {
      await pool.execute(
        "INSERT INTO config (`key`, value) VALUES ('quota_settings', ?) ON DUPLICATE KEY UPDATE value = ?",
        [JSON.stringify(quotaSettings), JSON.stringify(quotaSettings)]
      );
    }

    res.json({ success: true, message: '配置更新成功' });
  } catch (error) {
    console.error('更新配置错误:', error);
    res.status(500).json({ success: false, error: '更新配置失败' });
  }
});

// 获取SMTP配置
router.get('/smtp-config', async (req: Request, res: Response): Promise<void> => {
  try {
    const config = await configDB.get('smtp_settings');
    res.json({ success: true, config: config || { host: '', port: 587, user: '', pass: '', fromEmail: '', fromName: '' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新SMTP配置
router.put('/smtp-config', async (req: Request, res: Response): Promise<void> => {
  try {
    const { host, port, user, pass, fromEmail, fromName } = req.body;
    await configDB.set('smtp_settings', { host, port, user, pass, fromEmail, fromName });
    res.json({ success: true, message: 'SMTP配置已更新' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取文件存储配置
router.get('/storage-config', async (req: Request, res: Response): Promise<void> => {
  try {
    const config = await configDB.get('storage_settings');
    res.json({ success: true, config: config || { mountDomain: '' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 更新文件存储配置
router.put('/storage-config', async (req: Request, res: Response): Promise<void> => {
  try {
    const { mountDomain } = req.body;
    await configDB.set('storage_settings', { mountDomain });
    res.json({ success: true, message: '文件存储配置已更新' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;