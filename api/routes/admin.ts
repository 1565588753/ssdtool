/**
 * 管理员 API 路由
 * 处理用户管理、固件审核、配置管理等管理员功能
 */
import { Router, type Request, type Response } from 'express';
import pool from '../db.js';
import { getUseMockData, userDB, firmwareDB, configDB } from '../dboperations.js';

const router = Router();

// 中间件：检查管理员权限
async function adminMiddleware(req: Request, res: Response, next: Function) {
  const userId = req.headers['x-user-id'] as string;
  
  if (!userId) {
    res.status(401).json({ success: false, error: '请先登录' });
    return;
  }

  try {
    let user;
    if (getUseMockData()) {
      user = await userDB.findById(userId);
    } else {
      const [rows] = await pool.execute('SELECT role FROM users WHERE id = ?', [userId]);
      user = (rows as any[])[0];
    }
    
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
    let users;
    if (getUseMockData()) {
      users = await userDB.findAll();
    } else {
      const [rows] = await pool.execute(
        'SELECT * FROM users ORDER BY created_at DESC'
      );
      users = rows as any[];
    }
    
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

    if (getUseMockData()) {
      const user = (await userDB.findAll()).find(u => u.id === id);
      if (user) {
        user.role = role;
      }
    } else {
      await pool.execute(
        'UPDATE users SET role = ? WHERE id = ?',
        [role, id]
      );
    }

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
    const userId = req.headers['x-user-id'] as string;

    if (id === userId) {
      res.status(400).json({ success: false, error: '不能删除自己' });
      return;
    }

    if (getUseMockData()) {
      await userDB.delete(id);
    } else {
      await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    }

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
    let firmwareList;
    if (getUseMockData()) {
      // 从 mock 数据获取所有固件（不筛选状态）
      const allFirmware = [];
      // dboperations 里的 mockFirmware 就是完整列表
      const { default: dbops } = await import('../dboperations.js');
      // 直接访问 mockFirmware 不太方便，我们从 dboperations 里获取所有状态的固件
      // 让我们自己构造一个包含所有状态的列表
      const { mockFirmware } = await import('../dboperations.js');
      firmwareList = mockFirmware;
    } else {
      const [rows] = await pool.execute(
        'SELECT * FROM firmware ORDER BY created_at DESC'
      );
      firmwareList = rows as any[];
    }
    
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
    // 如果上面的方法失败，使用简单的 mock
    if (getUseMockData()) {
      const { mockFirmware } = await import('../dboperations.js');
      res.json({
        success: true,
        firmware: mockFirmware.map(fw => ({
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
    } else {
      res.status(500).json({ success: false, error: '获取固件列表失败' });
    }
  }
});

/**
 * 审核固件
 * PUT /api/admin/firmware/:id/status
 */
router.put('/firmware/:id/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      res.status(400).json({ success: false, error: '无效的状态' });
      return;
    }

    if (getUseMockData()) {
      await firmwareDB.updateStatus(id, status);
    } else {
      await pool.execute(
        'UPDATE firmware SET status = ? WHERE id = ?',
        [status, id]
      );
    }

    res.json({ success: true, message: '固件状态更新成功' });
  } catch (error) {
    console.error('更新固件状态错误:', error);
    res.status(500).json({ success: false, error: '更新固件状态失败' });
  }
});

/**
 * 删除固件
 * DELETE /api/admin/firmware/:id
 */
router.delete('/firmware/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (getUseMockData()) {
      await firmwareDB.delete(id);
    } else {
      await pool.execute('DELETE FROM firmware WHERE id = ?', [id]);
    }
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

    let insertId;
    if (getUseMockData()) {
      // Mock 模式下简单处理
      const newCategory = {
        id: `cat-${Date.now()}`,
        name,
        parent_id: parentId || null,
        order_index: orderIndex || 0,
        created_at: new Date().toISOString()
      };
      insertId = newCategory.id;
    } else {
      const [result] = await pool.execute(
        'INSERT INTO categories (name, parent_id, order_index) VALUES (?, ?, ?)',
        [name, parentId || null, orderIndex || 0]
      );
      insertId = (result as any).insertId;
    }

    res.json({ success: true, message: '分类创建成功', id: insertId });
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

    if (getUseMockData()) {
      // Mock 模式下不做实际更新
    } else {
      await pool.execute(
        'UPDATE categories SET name = ?, parent_id = ?, order_index = ? WHERE id = ?',
        [name, parentId || null, orderIndex || 0, id]
      );
    }

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
    
    let hasFirmware = false;
    if (getUseMockData()) {
      // Mock 模式下检查是否有固件
      const { mockFirmware } = await import('../dboperations.js');
      hasFirmware = mockFirmware.some(f => f.category_id === id);
    } else {
      const [firmware] = await pool.execute(
        'SELECT COUNT(*) as count FROM firmware WHERE category_id = ?',
        [id]
      );
      hasFirmware = (firmware as any[])[0].count > 0;
    }
    
    if (hasFirmware) {
      res.status(400).json({ 
        success: false, 
        error: '该分类下存在固件，无法删除' 
      });
      return;
    }

    if (getUseMockData()) {
      // Mock 模式下简单处理
    } else {
      await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
    }
    
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
    let categories;
    if (getUseMockData()) {
      const { mockCategories } = await import('../dboperations.js');
      categories = mockCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        parentId: cat.parent_id,
        orderIndex: cat.order_index,
        createdAt: new Date().toISOString()
      }));
    } else {
      const [rows] = await pool.execute(
        'SELECT * FROM categories ORDER BY order_index ASC, created_at DESC'
      );
      
      categories = (rows as any[]).map(cat => ({
        id: cat.id,
        name: cat.name,
        parentId: cat.parent_id,
        orderIndex: cat.order_index,
        createdAt: cat.created_at
      }));
    }
    
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
    let dashboard;
    if (getUseMockData()) {
      const { mockUsers, mockFirmware, mockDonations } = await import('../dboperations.js');
      dashboard = {
        totalUsers: mockUsers.length,
        totalFirmware: mockFirmware.length,
        totalDownloads: mockFirmware.reduce((sum, f) => sum + f.download_count, 0),
        totalDonations: mockDonations.reduce((sum, d) => sum + d.amount, 0),
        pendingFirmware: mockFirmware.filter(f => f.status === 'pending').length
      };
    } else {
      const [userStats] = await pool.execute('SELECT COUNT(*) as count FROM users');
      const [firmwareStats] = await pool.execute('SELECT COUNT(*) as count FROM firmware');
      const [downloadStats] = await pool.execute('SELECT COUNT(*) as count FROM downloads');
      const [donationTotal] = await pool.execute('SELECT SUM(amount) as total FROM donations');
      const [pendingStats] = await pool.execute('SELECT COUNT(*) as count FROM firmware WHERE status = "pending"');
      
      dashboard = {
        totalUsers: (userStats as any[])[0].count,
        totalFirmware: (firmwareStats as any[])[0].count,
        totalDownloads: (downloadStats as any[])[0].count,
        totalDonations: (donationTotal as any[])[0]?.total || 0,
        pendingFirmware: (pendingStats as any[])[0].count
      };
    }
    
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
    let config;
    if (getUseMockData()) {
      const { mockConfigs } = await import('../dboperations.js');
      config = {
        site_settings: JSON.parse(mockConfigs.site_settings),
        module_settings: JSON.parse(mockConfigs.module_settings),
        quota_settings: JSON.parse(mockConfigs.quota_settings)
      };
    } else {
      const [rows] = await pool.execute('SELECT * FROM config');
      
      config = {};
      (rows as any[]).forEach(row => {
        config[row.key] = JSON.parse(row.value);
      });
    }
    
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

    if (getUseMockData()) {
      await configDB.update('site_settings', siteSettings || {});
      await configDB.update('module_settings', moduleSettings || {});
      await configDB.update('quota_settings', quotaSettings || {});
    } else {
      if (siteSettings) {
        await pool.execute(
          'INSERT INTO config (`key`, value) VALUES ("site_settings", ?) ON DUPLICATE KEY UPDATE value = ?',
          [JSON.stringify(siteSettings), JSON.stringify(siteSettings)]
        );
      }

      if (moduleSettings) {
        await pool.execute(
          'INSERT INTO config (`key`, value) VALUES ("module_settings", ?) ON DUPLICATE KEY UPDATE value = ?',
          [JSON.stringify(moduleSettings), JSON.stringify(moduleSettings)]
        );
      }

      if (quotaSettings) {
        await pool.execute(
          'INSERT INTO config (`key`, value) VALUES ("quota_settings", ?) ON DUPLICATE KEY UPDATE value = ?',
          [JSON.stringify(quotaSettings), JSON.stringify(quotaSettings)]
        );
      }
    }

    res.json({ success: true, message: '配置更新成功' });
  } catch (error) {
    console.error('更新配置错误:', error);
    res.status(500).json({ success: false, error: '更新配置失败' });
  }
});

export default router;
