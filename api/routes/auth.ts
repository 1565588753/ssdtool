/**
 * 用户认证 API 路由
 * 处理用户注册、登录、登出等
 */
import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import { userDB, verificationCodeDB, configDB } from '../dboperations.js';
import { generateToken, verifyToken, extractUserId } from '../middleware/auth.js';

const router = Router();

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

function createRateLimiter(maxAttempts: number, windowMs: number) {
  const store = new Map<string, RateLimitEntry>();
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key);
    }
  }, 60000);
  return (key: string): boolean => {
    const now = Date.now();
    const entry = store.get(key);
    if (!entry || entry.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    if (entry.count >= maxAttempts) {
      return false;
    }
    entry.count++;
    return true;
  };
}

const loginLimiter = createRateLimiter(5, 15 * 60 * 1000); // 5次/15分钟
const codeLimiter = createRateLimiter(3, 15 * 60 * 1000); // 3次/15分钟

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// 生成6位随机验证码
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 创建Nodemailer transporter
async function createTransporter() {
  const smtpConfig = await configDB.get('smtp_settings');
  if (!smtpConfig) {
    throw new Error('SMTP未配置');
  }
  return nodemailer.createTransport({
    host: smtpConfig.host,
    port: Number(smtpConfig.port),
    secure: Number(smtpConfig.port) === 465,
    auth: {
      user: smtpConfig.user,
      pass: smtpConfig.pass,
    },
  });
}

// 发送验证码
router.post('/send-code', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, type } = req.body;
    if (!email) {
      res.status(400).json({ success: false, error: '邮箱地址不能为空' });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({ success: false, error: '邮箱地址格式不正确' });
      return;
    }

    if (!type || !['register', 'reset_password'].includes(type)) {
      res.status(400).json({ success: false, error: '无效的验证码类型' });
      return;
    }

    const codeKey = `send-code:${email}:${type}`;
    if (!codeLimiter(codeKey)) {
      res.status(429).json({ success: false, error: '发送验证码过于频繁，请15分钟后再试' });
      return;
    }

    const cooldown = type === 'register' ? 120000 : 60000;
    const lastCode = await verificationCodeDB.findLatestByEmail(email, type);
    if (lastCode) {
      const lastTime = new Date(lastCode.created_at).getTime();
      const now = Date.now();
      if (now - lastTime < cooldown) {
        const remaining = Math.ceil((cooldown - (now - lastTime)) / 1000);
        res.status(429).json({ success: false, error: `请${remaining}秒后再试` });
        return;
      }
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await verificationCodeDB.create({ email, code, type, expiresAt });

    const transporter = await createTransporter();
    const smtpConfig = await configDB.get('smtp_settings');

    const subject = type === 'register' ? '注册验证码' : '重置密码验证码';
    const text = `您的${subject}是：${code}，有效期30分钟。`;

    await transporter.sendMail({
      from: `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>`,
      to: email,
      subject: `SSD开卡工具站 - ${subject}`,
      text,
    });

    res.json({ success: true, message: '验证码已发送' });
  } catch (error: any) {
    console.error('发送验证码失败:', error);
    res.status(500).json({ success: false, error: error.message || '发送验证码失败' });
  }
});

// 注册
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, nickname, code } = req.body;
    if (!email || !password || !nickname || !code) {
      res.status(400).json({ success: false, error: '所有字段都是必填的' });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({ success: false, error: '邮箱地址格式不正确' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, error: '密码长度至少6位' });
      return;
    }

    if (nickname.length > 50) {
      res.status(400).json({ success: false, error: '昵称长度不能超过50个字符' });
      return;
    }

    // 验证验证码
    const validCode = await verificationCodeDB.findByEmailAndCode(email, code, 'register');
    if (!validCode) {
      res.status(400).json({ success: false, error: '验证码无效或已过期' });
      return;
    }

    // 检查邮箱是否已注册
    const existingUser = await userDB.findByEmail(email);
    if (existingUser) {
      res.status(400).json({ success: false, error: '该邮箱已被注册' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await userDB.create({ email, password: hashedPassword, nickname });

    // 删除已使用的验证码
    await verificationCodeDB.deleteByEmail(email, 'register');

    res.json({ success: true, message: '注册成功' });
  } catch (error: any) {
    console.error('注册失败:', error);
    res.status(500).json({ success: false, error: error.message || '注册失败' });
  }
});

// 登录
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, error: '邮箱和密码不能为空' });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({ success: false, error: '邮箱地址格式不正确' });
      return;
    }

    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    if (!loginLimiter(ip)) {
      res.status(429).json({ success: false, error: '登录尝试过于频繁，请15分钟后再试' });
      return;
    }

    const user = await userDB.findByEmail(email);
    if (!user) {
      res.status(401).json({ success: false, error: '邮箱或密码错误' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res.status(401).json({ success: false, error: '邮箱或密码错误' });
      return;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
        downloadQuota: user.download_quota,
        downloadsUsed: user.downloads_used,
        isPremium: !!user.is_premium,
        createdAt: user.created_at
      }
    });
  } catch (error: any) {
    console.error('登录失败:', error);
    res.status(500).json({ success: false, error: '登录失败' });
  }
});

// 退出登录
router.post('/logout', (_req: Request, res: Response) => {
  res.json({ success: true });
});

// 获取当前用户信息（通过Authorization头）
router.get('/user', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = extractUserId(req);

    if (!userId) {
      res.status(401).json({ success: false, error: '未登录' });
      return;
    }

    const user = await userDB.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, error: '用户不存在' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
        downloadQuota: user.download_quota,
        downloadsUsed: user.downloads_used,
        isPremium: !!user.is_premium,
        createdAt: user.created_at
      }
    });
  } catch (error: any) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ success: false, error: '获取用户信息失败' });
  }
});

// 重置密码
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, code } = req.body;
    if (!email || !password || !code) {
      res.status(400).json({ success: false, error: '所有字段都是必填的' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, error: '密码长度至少6位' });
      return;
    }

    // 验证验证码
    const validCode = await verificationCodeDB.findByEmailAndCode(email, code, 'reset_password');
    if (!validCode) {
      res.status(400).json({ success: false, error: '验证码无效或已过期' });
      return;
    }

    const user = await userDB.findByEmail(email);
    if (!user) {
      res.status(404).json({ success: false, error: '该邮箱未注册' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.execute('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);

    await verificationCodeDB.deleteByEmail(email, 'reset_password');

    res.json({ success: true, message: '密码重置成功' });
  } catch (error: any) {
    console.error('重置密码失败:', error);
    res.status(500).json({ success: false, error: error.message || '重置密码失败' });
  }
});

// 验证Token并获取用户信息
router.get('/verify', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: '未登录' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload) {
      res.status(401).json({ success: false, error: '登录已过期' });
      return;
    }

    const user = await userDB.findById(payload.userId);
    if (!user) {
      res.status(404).json({ success: false, error: '用户不存在' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
        downloadQuota: user.download_quota,
        downloadsUsed: user.downloads_used,
        isPremium: !!user.is_premium,
        createdAt: user.created_at
      }
    });
  } catch (error: any) {
    console.error('验证Token失败:', error);
    res.status(500).json({ success: false, error: '验证失败' });
  }
});

export default router;