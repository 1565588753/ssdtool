/**
 * 用户认证 API 路由
 * 处理用户注册、登录、登出等
 */
import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import { userDB } from '../dboperations.js';

const router = Router();

/**
 * 用户注册
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, nickname } = req.body;

    // 验证必填字段
    if (!email || !password || !nickname) {
      res.status(400).json({
        success: false,
        error: '邮箱、密码和昵称不能为空'
      });
      return;
    }

    // 检查邮箱是否已存在
    const existingUser = await userDB.findByEmail(email);
    if (existingUser) {
      res.status(400).json({
        success: false,
        error: '该邮箱已被注册'
      });
      return;
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    await userDB.create({
      email,
      password: hashedPassword,
      nickname,
      role: 'user'
    });

    res.status(201).json({
      success: true,
      message: '注册成功'
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      error: '注册失败'
    });
  }
});

/**
 * 用户登录
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 验证必填字段
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: '邮箱和密码不能为空'
      });
      return;
    }

    // 查找用户
    const user = await userDB.findByEmail(email);
    if (!user) {
      res.status(401).json({
        success: false,
        error: '邮箱或密码错误'
      });
      return;
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res.status(401).json({
        success: false,
        error: '邮箱或密码错误'
      });
      return;
    }

    // 返回用户信息（不包含密码）
    const userData = {
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
    };

    res.json({
      success: true,
      user: userData
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      error: '登录失败'
    });
  }
});

/**
 * 用户登出
 * POST /api/auth/logout
 */
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  // 简单的实现，实际项目中可能需要清除 session 或 token
  res.json({
    success: true,
    message: '登出成功'
  });
});

/**
 * 获取用户信息
 * GET /api/auth/user
 */
router.get('/user', async (req: Request, res: Response): Promise<void> => {
  try {
    // 从请求头或session中获取用户ID
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: '未登录'
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

    res.json({
      success: true,
      user: {
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
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      error: '获取用户信息失败'
    });
  }
});

export default router;
