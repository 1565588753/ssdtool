/**
 * 用户认证 API 路由
 * 处理用户注册、登录、登出等
 */
import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import pool from '../db.js';
import { userDB, verificationCodeDB, configDB } from '../dboperations.js';

const router = Router();

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
    if (!email || !type) {
      res.status(400).json({ success: false, error: '邮箱和验证码类型不能为空' });
      return;
    }

    // 检查60秒内是否已发送
    const lastCode = await verificationCodeDB.findLatestByEmail(email, type);
    if (lastCode) {
      const lastTime = new Date(lastCode.created_at).getTime();
      const now = Date.now();
      if (now - lastTime < 60000) {
        const remaining = Math.ceil((60000 - (now - lastTime)) / 1000);
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

    if (password.length < 6) {
      res.status(400).json({ success: false, error: '密码长度至少6位' });
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

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar_url,
        role: user.role,
        downloadQuota: user.download_quota,
        downloadsUsed: user.downloads_used,
        quotaResetDate: user.quota_reset_date,
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

// 获取当前用户信息
router.get('/user', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.headers['x-user-id'] as string;
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
        avatar: user.avatar_url,
        role: user.role,
        downloadQuota: user.download_quota,
        downloadsUsed: user.downloads_used,
        quotaResetDate: user.quota_reset_date,
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

export default router;