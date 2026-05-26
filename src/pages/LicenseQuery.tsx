import { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Download, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { useAppStore } from '@/store';

export default function LicenseQuery() {
  const [licenseKey, setLicenseKey] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    firmware?: {
      id: string;
      title: string;
      version: string;
    };
    downloadUrl?: string;
  } | null>(null);

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!licenseKey.trim()) {
      setResult({
        success: false,
        message: '请输入卡密'
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/license/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ licenseKey: licenseKey.trim() })
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: `卡密有效！固件：${data.license.firmwareTitle}`,
          firmware: {
            id: data.license.firmwareId,
            title: data.license.firmwareTitle,
            version: ''
          }
        });
      } else {
        setResult({
          success: false,
          message: data.error || '卡密验证失败'
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: '网络错误，请稍后重试'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!licenseKey.trim() || !email.trim()) {
      setResult({
        success: false,
        message: '请输入卡密和邮箱'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/license/download-with-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          licenseKey: licenseKey.trim(),
          email: email.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: '验证成功！点击下载按钮开始下载',
          firmware: data.firmware,
          downloadUrl: data.downloadUrl
        });
        
        // 自动触发下载
        window.location.href = data.downloadUrl;
      } else {
        setResult({
          success: false,
          message: data.error || '下载失败'
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: '网络错误，请稍后重试'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--theme-gradient)' }}>
            <Key className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--theme-text)' }}>
            卡密查询与下载
          </h1>
          <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
            输入您的卡密查询固件信息或下载已购买的固件
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-8"
          style={{ borderColor: 'var(--theme-border)' }}
        >
          {/* 查询表单 */}
          <form onSubmit={handleQuery} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>
                卡密
              </label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--theme-text-secondary)' }} />
                <input
                  type="text"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  placeholder="请输入您的卡密"
                  className="w-full pl-12 pr-4 py-4 rounded-xl focus:outline-none"
                  style={{
                    backgroundColor: 'var(--theme-bg-card)',
                    border: '1px solid var(--theme-border)',
                    color: 'var(--theme-text)'
                  }}
                />
              </div>
            </div>

            {/* 下载时需要邮箱 */}
            {result?.success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>
                    邮箱地址
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--theme-text-secondary)' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="请输入购买时使用的邮箱"
                      className="w-full pl-12 pr-4 py-4 rounded-xl focus:outline-none"
                      style={{
                        backgroundColor: 'var(--theme-bg-card)',
                        border: '1px solid var(--theme-border)',
                        color: 'var(--theme-text)'
                      }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={loading}
                  className="w-full py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
                  style={{ background: 'var(--theme-gradient)' }}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      立即下载
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {/* 查询按钮 */}
            {!result?.success && (
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
                style={{ background: 'var(--theme-gradient)' }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Key className="w-5 h-5" />
                    查询卡密
                  </>
                )}
              </button>
            )}
          </form>

          {/* 结果显示 */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-4 rounded-xl flex items-start gap-3 ${
                result.success ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}
            >
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={result.success ? 'text-green-400' : 'text-red-400'}>
                  {result.message}
                </p>
                {result.firmware && (
                  <div className="mt-2 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                    <p>固件名称: {result.firmware.title}</p>
                    {result.firmware.version && (
                      <p>版本: {result.firmware.version}</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* 使用说明 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 p-6 rounded-2xl"
          style={{ backgroundColor: 'var(--theme-bg-card)', border: '1px solid var(--theme-border)' }}
        >
          <h3 className="font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
            使用说明
          </h3>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
            <li>1. 购买付费固件后，系统会发送卡密到您的邮箱</li>
            <li>2. 卡密有效期为30天，请在有效期内使用</li>
            <li>3. 在有效期内可以多次下载同一固件</li>
            <li>4. 下载链接10分钟内有效，请及时下载</li>
            <li>5. 如有问题请联系管理员</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
