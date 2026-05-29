import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useAppStore } from '../store';
import {
  ArrowLeft,
  Download,
  HardDrive,
  Calendar,
  Heart,
  CheckCircle,
  ShieldAlert,
  Zap,
  User
} from 'lucide-react';

export default function FirmwareDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getFirmwareById, user, downloadFirmware, config } = useAppStore();
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const loginTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const firmware = getFirmwareById(id || '');

  useEffect(() => {
    return () => {
      if (loginTimerRef.current) {
        clearTimeout(loginTimerRef.current);
      }
    };
  }, []);

  if (!firmware) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Helmet>
          <title>固件不存在 - SSD开卡工具站</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold mb-4">固件不存在</h1>
          <Link to="/" className="text-accent-400 hover:text-accent-300">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  const handleDownload = async () => {
    setDownloadError('');

    if (!user) {
      setShowLoginModal(true);
      loginTimerRef.current = setTimeout(() => {
        navigate('/login');
      }, 3000);
      return;
    }

    if (user.role === 'admin') {
      setDownloading(true);
      try {
        const result = await downloadFirmware(firmware.id);
        if (result.success) {
          setDownloadSuccess(true);
          setTimeout(() => setDownloadSuccess(false), 3000);
        } else {
          setDownloadError(result.error || '下载失败，请稍后重试');
        }
      } catch (err) {
        console.error('Download failed:', err);
        setDownloadError('下载失败，请稍后重试');
      } finally {
        setDownloading(false);
      }
      return;
    }

    if (quotaInfo && quotaInfo.remaining <= 0) {
      setDownloadError('本月下载额度已用完');
      return;
    }

    setDownloading(true);
    try {
      const result = await downloadFirmware(firmware.id);
      if (result.success) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
      } else {
        setDownloadError(result.error || '下载失败，请稍后重试');
      }
    } catch (err) {
      console.error('Download failed:', err);
      setDownloadError('下载失败，请稍后重试');
    } finally {
      setDownloading(false);
    }
  };

  const getQuotaInfo = () => {
    if (!user) return null;
    const maxQuota = user.isPremium ? config.quotaSettings.premiumQuota : config.quotaSettings.freeQuota;
    const remaining = Math.max(0, maxQuota - user.downloadsUsed);
    return { remaining, total: maxQuota };
  };

  const quotaInfo = getQuotaInfo();

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getDownloadButtonContent = () => {
    if (!user) {
      return {
        text: '登录后免费下载',
        disabled: false,
      };
    }
    
    if (user.role === 'admin') {
      return {
        text: '管理员下载（无限制）',
        disabled: false,
      };
    }
    
    if (quotaInfo && quotaInfo.remaining <= 0) {
      return {
        text: '本月额度已用完',
        disabled: true,
      };
    }
    
    return {
      text: '免费下载',
      disabled: false,
    };
  };

  const downloadInfo = getDownloadButtonContent();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--theme-bg-base)' }}>
      <Helmet>
        <title>{firmware.title} - SSD开卡工具站</title>
        <meta name="description" content={`${firmware.title} - ${firmware.description?.slice(0, 150) || ''}，版本 ${firmware.version}，${firmware.downloadCount} 次下载`} />
        <meta property="og:title" content={`${firmware.title} - SSD开卡工具站`} />
        <meta property="og:description" content={firmware.description?.slice(0, 200) || `${firmware.title} 固件下载`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://ssdtool.cc/firmware/${firmware.id}`} />
        <link rel="canonical" href={`https://ssdtool.cc/firmware/${firmware.id}`} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": firmware.title,
          "description": firmware.description,
          "version": firmware.version,
          "applicationCategory": "Utility",
          "operatingSystem": "Windows",
          "fileSize": firmware.fileSize,
          "downloadUrl": `https://ssdtool.cc/firmware/${firmware.id}`,
          "dateModified": firmware.updatedAt,
          "author": {
            "@type": "Person",
            "name": firmware.uploaderName || "管理员"
          }
        })}</script>
      </Helmet>
      <div className="container mx-auto px-4 py-20">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-8 transition-colors"
          style={{ color: 'var(--theme-text-secondary)' }}
        >
          <ArrowLeft className="w-5 h-5" />
          返回
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-8"
              style={{ 
                backgroundColor: 'var(--theme-bg-card)', 
                borderWidth: '1px',
                borderColor: 'var(--theme-border)'
              }}
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--theme-gradient)' }}>
                  <HardDrive className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--theme-text)' }}>{firmware.title}</h1>
                  <p style={{ color: 'var(--theme-text-secondary)' }}>{firmware.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--theme-bg-hover)' }}>
                  <div className="text-xs mb-1" style={{ color: 'var(--theme-text-muted)' }}>版本</div>
                  <div className="font-semibold" style={{ color: 'var(--theme-text)' }}>{firmware.version}</div>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--theme-bg-hover)' }}>
                  <div className="text-xs mb-1" style={{ color: 'var(--theme-text-muted)' }}>大小</div>
                  <div className="font-semibold" style={{ color: 'var(--theme-text)' }}>{formatFileSize(firmware.fileSize)}</div>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--theme-bg-hover)' }}>
                  <div className="text-xs mb-1 flex items-center gap-1" style={{ color: 'var(--theme-text-muted)' }}>
                    <Download className="w-3 h-3" />
                    下载
                  </div>
                  <div className="font-semibold" style={{ color: 'var(--theme-text)' }}>{firmware.downloadCount.toLocaleString()}</div>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--theme-bg-hover)' }}>
                  <div className="text-xs mb-1 flex items-center gap-1" style={{ color: 'var(--theme-text-muted)' }}>
                    <Calendar className="w-3 h-3" />
                    更新
                  </div>
                  <div className="font-semibold" style={{ color: 'var(--theme-text)' }}>{new Date(firmware.updatedAt).toLocaleDateString('zh-CN')}</div>
                </div>
              </div>

              <div className="border-t pt-6 mb-6" style={{ borderColor: 'var(--theme-border)' }}>
                <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--theme-text)' }}>
                  <ShieldAlert className="w-5 h-5" style={{ color: 'var(--theme-accent-400)' }} />
                  详细信息
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4" style={{ color: 'var(--theme-text-muted)' }} />
                    <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                      上传时间: {new Date(firmware.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  {firmware.uploaderName && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>上传者:</span>
                      <span className="inline-flex px-3 py-1 rounded-full text-sm" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: 'var(--theme-accent-400)' }}>
                        {firmware.uploaderName}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl p-6 sticky top-24"
              style={{ 
                backgroundColor: 'var(--theme-bg-card)', 
                borderWidth: '1px',
                borderColor: 'var(--theme-border)'
              }}
            >
              <h3 className="font-display text-lg font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>下载固件</h3>

              {user && quotaInfo && (
                <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)', borderWidth: '1px' }}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span style={{ color: 'var(--theme-text-secondary)' }}>本月下载次数</span>
                    <span 
                      className={quotaInfo.remaining === 0 ? 'text-red-500' : ''}
                      style={{ color: quotaInfo.remaining === 0 ? '#ef4444' : 'var(--theme-accent-400)' }}
                    >
                      {quotaInfo.remaining} / {quotaInfo.total}
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--theme-bg-hover)' }}>
                    <div
                      className="h-full transition-all"
                      style={{ width: `${((quotaInfo.total - quotaInfo.remaining) / quotaInfo.total) * 100}%`, background: 'var(--theme-gradient)' }}
                    />
                  </div>
                </div>
              )}

              {downloadSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--theme-accent-400)' }} />
                  <div className="font-semibold mb-2" style={{ color: 'var(--theme-text)' }}>下载成功！</div>
                  <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>正在准备下载文件...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {downloadError && (
                    <div className="p-3 rounded-lg text-sm text-center bg-red-500/10 text-red-400 border border-red-500/20">
                      {downloadError}
                    </div>
                  )}
                  <button
                    onClick={handleDownload}
                    disabled={downloading || (!!user && quotaInfo?.remaining === 0)}
                    className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      background: (user && quotaInfo?.remaining === 0) ? 'var(--theme-bg-hover)' : 'var(--theme-gradient)',
                      color: (user && quotaInfo?.remaining === 0) ? 'var(--theme-text-secondary)' : 'white'
                    }}
                  >
                    {downloading ? (
                      '下载中...'
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        {downloadInfo.text}
                      </>
                    )}
                  </button>

                  {user && quotaInfo?.remaining === 0 && (
                    <div className="p-4 rounded-xl text-sm" style={{ 
                      backgroundColor: 'rgba(245, 158, 11, 0.1)', 
                      borderWidth: '1px',
                      borderColor: 'rgba(245, 158, 11, 0.2)' 
                    }}>
                      <div className="flex items-start gap-2">
                        <Zap className="w-5 h-5 flex-shrink-0" style={{ color: '#fbbf24' }} />
                        <div>
                          <div className="font-medium mb-1" style={{ color: '#fbbf24' }}>本月额度已用完</div>
                          <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
                            升级 Premium 可获得更多下载次数
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--theme-border)' }}>
                <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                  <ShieldAlert className="w-5 h-5" style={{ color: 'var(--theme-text-muted)' }} />
                  <span>请确保固件与您的设备型号匹配</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
            onClick={() => {
              setShowLoginModal(false);
              if (loginTimerRef.current) clearTimeout(loginTimerRef.current);
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-8 w-full max-w-md relative z-10"
            style={{ 
              backgroundColor: 'var(--theme-bg-card)', 
              borderWidth: '1px',
              borderColor: 'var(--theme-border)'
            }}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--theme-gradient)' }}>
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2" style={{ color: 'var(--theme-text)' }}>需要登录</h3>
              <p style={{ color: 'var(--theme-text-secondary)' }}>
                请先登录后再下载固件
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  if (loginTimerRef.current) clearTimeout(loginTimerRef.current);
                }}
                className="flex-1 py-3 rounded-xl font-semibold hover:opacity-80 transition-colors"
                style={{ 
                  backgroundColor: 'var(--theme-bg-hover)', 
                  color: 'var(--theme-text)'
                }}
              >
                取消
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex-1 py-3 rounded-xl text-white font-semibold transition-colors"
                style={{ background: 'var(--theme-gradient)' }}
              >
                去登录
              </button>
            </div>

            <p className="text-center text-sm mt-4" style={{ color: 'var(--theme-text-muted)' }}>
              3秒后将自动跳转到登录页面
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}