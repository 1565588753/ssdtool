/**
 * 公共统计数据 API 路由
 * 提供首页等需要的公共统计数据
 */
import { Router, type Request, type Response } from 'express';
import pool from '../db.js';

const router = Router();

/**
 * 获取公共统计数据
 * GET /api/stats
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const [userStats] = await pool.execute('SELECT COUNT(*) as count FROM users');
    const [firmwareStats] = await pool.execute('SELECT COUNT(*) as count FROM firmware WHERE status = "approved"');
    const [downloadStats] = await pool.execute('SELECT COUNT(*) as count FROM downloads');
    const [donationTotal] = await pool.execute('SELECT SUM(amount) as total FROM donations');
    
    res.json({
      success: true,
      stats: {
        totalUsers: (userStats as any[])[0].count,
        totalFirmware: (firmwareStats as any[])[0].count,
        totalDownloads: (downloadStats as any[])[0].count,
        totalDonations: (donationTotal as any[])[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('获取公共统计错误:', error);
    res.status(500).json({ success: false, error: '获取统计失败' });
  }
});

export default router;
