/**
 * 捐赠和用户相关 API 路由
 * 处理捐赠、用户中心等
 */
import { Router, type Request, type Response } from 'express';
import { donationDB, userDB, downloadDB, configDB } from '../dboperations.js';
import { extractUserId } from '../middleware/auth.js';

const router = Router();

/**
 * 获取捐赠记录列表
 * GET /api/donations
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const donations = await donationDB.findAll(limit);
    
    res.json({
      success: true,
      donations: (donations as any[]).map(d => ({
        id: d.id,
        userId: d.user_id,
        userNickname: d.user_nickname,
        amount: d.amount,
        type: d.type,
        createdAt: d.created_at
      }))
    });
  } catch (error) {
    console.error('获取捐赠记录错误:', error);
    // 数据库不可用时返回空数据
    res.json({
      success: true,
      donations: [],
      message: '数据库未连接或查询失败'
    });
  }
});

/**
 * 获取捐赠统计
 * GET /api/donations/stats
 */
router.get('/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const total = await donationDB.getTotalAmount();
    
    res.json({
      success: true,
      total
    });
  } catch (error) {
    console.error('获取捐赠统计错误:', error);
    res.status(500).json({
      success: false,
      error: '获取捐赠统计失败'
    });
  }
});

/**
 * 升级为 Premium 会员
 * POST /api/donations/premium-upgrade
 */
router.post('/premium-upgrade', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = extractUserId(req);

    if (!userId) {
      res.status(401).json({
        success: false,
        error: '请先登录'
      });
      return;
    }

    const user = await userDB.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: '用户不存在'
      });
      return;
    }

    if (user.is_premium) {
      res.status(400).json({
        success: false,
        error: '您已经是 Premium 会员'
      });
      return;
    }

    const config = await configDB.get('quota_settings');

    // 创建捐赠记录
    await donationDB.create({
      userId,
      userNickname: user.nickname,
      amount: config.premiumPrice,
      type: 'premium_upgrade'
    });

    // 升级用户为 Premium
    await userDB.upgradeToPremium(userId, config.premiumQuota);

    res.json({
      success: true,
      message: '升级成功'
    });
  } catch (error) {
    console.error('升级 Premium 错误:', error);
    res.status(500).json({
      success: false,
      error: '升级失败'
    });
  }
});

/**
 * 获取用户下载记录
 * GET /api/user/downloads
 */
router.get('/user/downloads', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = extractUserId(req);

    if (!userId) {
      res.status(401).json({
        success: false,
        error: '请先登录'
      });
      return;
    }

    const downloads = await downloadDB.findByUser(userId);

    res.json({
      success: true,
      downloads: (downloads as any[]).map(d => ({
        id: d.id,
        userId: d.user_id,
        firmwareId: d.firmware_id,
        firmwareTitle: d.firmware_title,
        createdAt: d.created_at
      }))
    });
  } catch (error) {
    console.error('获取下载记录错误:', error);
    res.status(500).json({
      success: false,
      error: '获取下载记录失败'
    });
  }
});

/**
 * 获取系统配置
 * GET /api/config
 */
router.get('/config', async (req: Request, res: Response): Promise<void> => {
  try {
    const siteSettings = await configDB.get('site_settings');
    const moduleSettings = await configDB.get('module_settings');
    const quotaSettings = await configDB.get('quota_settings');

    res.json({
      success: true,
      config: {
        siteSettings,
        moduleSettings,
        quotaSettings
      }
    });
  } catch (error) {
    console.error('获取系统配置错误:', error);
    res.status(500).json({
      success: false,
      error: '获取系统配置失败'
    });
  }
});

export default router;