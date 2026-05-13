/**
 * 卡密管理 API 路由
 * 处理卡密查询、验证、下载等
 */
import { Router, type Request, type Response } from 'express';
import { licenseKeyDB, firmwareDB, userFirmwareDownloadDB, userDB } from '../dboperations.js';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

const router = Router();

/**
 * 生成加密下载链接
 * POST /api/license/download-link
 */
router.post('/download-link', async (req: Request, res: Response): Promise<void> => {
  try {
    const { firmwareId, licenseKey } = req.body;
    const userId = req.headers['x-user-id'] as string;

    if (!firmwareId) {
      res.status(400).json({
        success: false,
        error: '缺少固件ID'
      });
      return;
    }

    // 获取固件信息
    const firmware = await firmwareDB.findById(firmwareId);
    if (!firmware) {
      res.status(404).json({
        success: false,
        error: '固件不存在'
      });
      return;
    }

    // 如果是付费固件，需要验证卡密
    if (firmware.is_paid) {
      if (!licenseKey) {
        res.status(400).json({
          success: false,
          error: '付费固件需要卡密'
        });
        return;
      }

      // 验证卡密
      const keyRecord = await licenseKeyDB.findByKey(licenseKey);
      if (!keyRecord) {
        res.status(400).json({
          success: false,
          error: '卡密无效'
        });
        return;
      }

      if (keyRecord.firmware_id !== firmwareId) {
        res.status(400).json({
          success: false,
          error: '卡密与固件不匹配'
        });
        return;
      }

      if (new Date(keyRecord.expires_at) < new Date()) {
        res.status(400).json({
          success: false,
          error: '卡密已过期'
        });
        return;
      }
    }

    // 生成加密下载令牌（有效期10分钟）
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10分钟后过期

    // 存储令牌（可以使用Redis，这里简化为内存存储）
    downloadTokens.set(token, {
      firmwareId,
      userId,
      expiresAt
    });

    res.json({
      success: true,
      downloadUrl: `/api/license/download/${token}`,
      expiresAt
    });
  } catch (error) {
    console.error('生成下载链接错误:', error);
    res.status(500).json({
      success: false,
      error: '生成下载链接失败'
    });
  }
});

// 内存存储下载令牌（生产环境应使用Redis）
const downloadTokens = new Map<string, { firmwareId: string; userId?: string; expiresAt: Date }>();

/**
 * 验证卡密
 * POST /api/license/verify
 */
router.post('/verify', async (req: Request, res: Response): Promise<void> => {
  try {
    const { licenseKey, firmwareId } = req.body;

    if (!licenseKey) {
      res.status(400).json({
        success: false,
        error: '请输入卡密'
      });
      return;
    }

    const keyRecord = await licenseKeyDB.findByKey(licenseKey);

    if (!keyRecord) {
      res.status(400).json({
        success: false,
        error: '卡密无效'
      });
      return;
    }

    // 如果指定了固件ID，检查是否匹配
    if (firmwareId && keyRecord.firmware_id !== firmwareId) {
      res.status(400).json({
        success: false,
        error: '卡密与固件不匹配'
      });
      return;
    }

    // 检查是否过期
    if (new Date(keyRecord.expires_at) < new Date()) {
      res.status(400).json({
        success: false,
        error: '卡密已过期'
      });
      return;
    }

    res.json({
      success: true,
      license: {
        id: keyRecord.id,
        firmwareId: keyRecord.firmware_id,
        firmwareTitle: keyRecord.firmware_title,
        isUsed: keyRecord.is_used,
        expiresAt: keyRecord.expires_at
      }
    });
  } catch (error) {
    console.error('验证卡密错误:', error);
    res.status(500).json({
      success: false,
      error: '验证卡密失败'
    });
  }
});

/**
 * 使用卡密下载固件
 * POST /api/license/download-with-key
 */
router.post('/download-with-key', async (req: Request, res: Response): Promise<void> => {
  try {
    const { licenseKey, email } = req.body;

    if (!licenseKey || !email) {
      res.status(400).json({
        success: false,
        error: '请输入卡密和邮箱'
      });
      return;
    }

    const keyRecord = await licenseKeyDB.findByKey(licenseKey);

    if (!keyRecord) {
      res.status(400).json({
        success: false,
        error: '卡密无效'
      });
      return;
    }

    if (new Date(keyRecord.expires_at) < new Date()) {
      res.status(400).json({
        success: false,
        error: '卡密已过期'
      });
      return;
    }

    // 获取固件信息
    const firmware = await firmwareDB.findById(keyRecord.firmware_id);
    if (!firmware) {
      res.status(404).json({
        success: false,
        error: '固件不存在'
      });
      return;
    }

    // 生成加密下载令牌
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    downloadTokens.set(token, {
      firmwareId: keyRecord.firmware_id,
      expiresAt
    });

    res.json({
      success: true,
      firmware: {
        id: firmware.id,
        title: firmware.title,
        version: firmware.version
      },
      downloadUrl: `/api/license/download/${token}`,
      expiresAt
    });
  } catch (error) {
    console.error('卡密下载错误:', error);
    res.status(500).json({
      success: false,
      error: '下载失败'
    });
  }
});

/**
 * 实际下载文件
 * GET /api/license/download/:token
 */
router.get('/download/:token', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    const tokenData = downloadTokens.get(token);
    if (!tokenData) {
      res.status(404).json({
        success: false,
        error: '下载链接无效或已过期'
      });
      return;
    }

    if (new Date() > tokenData.expiresAt) {
      downloadTokens.delete(token);
      res.status(400).json({
        success: false,
        error: '下载链接已过期'
      });
      return;
    }

    // 获取固件信息
    const firmware = await firmwareDB.findById(tokenData.firmwareId);
    if (!firmware) {
      res.status(404).json({
        success: false,
        error: '固件不存在'
      });
      return;
    }

    // 检查文件是否存在
    const filePath = path.join('/workspace/files', firmware.file_path);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        success: false,
        error: '文件不存在'
      });
      return;
    }

    // 删除已使用的令牌
    downloadTokens.delete(token);

    // 更新下载次数
    await firmwareDB.incrementDownloadCount(firmware.id);

    // 发送文件
    res.setHeader('Content-Disposition', `attachment; filename="${firmware.title}.zip"`);
    res.setHeader('Content-Type', 'application/zip');
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error('下载文件错误:', error);
    res.status(500).json({
      success: false,
      error: '下载失败'
    });
  }
});

export default router;