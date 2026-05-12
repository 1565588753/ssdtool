import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../store';
import {
  ArrowLeft,
  Download,
  HardDrive,
  Calendar,
  Eye,
  Heart,
  CheckCircle,
  Info,
  ShieldAlert,
  Zap
} from 'lucide-react';

export default function FirmwareDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getFirmwareById, user, downloadFirmware, sponsorDownload } = useAppStore();
  const [downloading, setDownloading] = useState(false);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const firmware = getFirmwareById(id || '');

  if (!firmware) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
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
    if (!user) {
      setShowSponsorModal(true);
      return;
    }

    setDownloading(true);
    try {
      const success = await downloadFirmware(firmware.id);
      if (success) {
        setDownloadSuccess(true);
        setTimeout(() => {
          setDownloadSuccess(false);
        }, 3000);
      }
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleSponsorDownload = async () => {
    setDownloading(true);
    try {
      const success = await sponsorDownload(firmware.id, 1);
      if (success) {
        setShowSponsorModal(false);
        setDownloadSuccess(true);
        setTimeout(() => {
          setDownloadSuccess(false);
        }, 3000);
      }
    } catch (err) {
      console.error('Sponsor download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  const getQuotaInfo = () => {
    if (!user) return null;
    const remaining = user.isPremium ? 100 : Math.max(0, user.monthlyQuota - user.monthlyDownloads);
    const total = user.isPremium ? 100 : 5;
    return { remaining, total };
  };

  const quotaInfo = getQuotaInfo();

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto px-4 py-20">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-8"
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center flex-shrink-0">
                  <HardDrive className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="font-display text-2xl font-bold mb-2">{firmware.name}</h1>
                  <p className="text-slate-400">{firmware.description}</p>
                </div>
                {firmware.isPaid && (
                  <div className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-sm font-medium">
                    ¥{firmware.price}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-white/5">
                  <div className="text-xs text-slate-500 mb-1">版本</div>
                  <div className="font-semibold">{firmware.version}</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5">
                  <div className="text-xs text-slate-500 mb-1">大小</div>
                  <div className="font-semibold">{firmware.fileSize}</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5">
                  <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    浏览
                  </div>
                  <div className="font-semibold">{firmware.views.toLocaleString()}</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5">
                  <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    下载
                  </div>
                  <div className="font-semibold">{firmware.downloads.toLocaleString()}</div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6 mb-6">
                <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-accent-400" />
                  详细信息
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-400">
                      更新时间: {new Date(firmware.uploadDate).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 mb-2">主控厂商</div>
                    <div className="inline-flex px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 text-sm">
                      {firmware.vendor}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 mb-2">适配型号</div>
                    <div className="flex flex-wrap gap-2">
                      {firmware.supportedModels.map((model, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full bg-white/5 text-slate-300 text-sm"
                        >
                          {model}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {firmware.notes && (
                <div className="border-t border-white/10 pt-6">
                  <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-400" />
                    注意事项
                  </h2>
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <p className="text-slate-300 text-sm leading-relaxed">{firmware.notes}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-6 sticky top-24"
            >
              <h3 className="font-display text-lg font-semibold mb-4">下载固件</h3>

              {user && quotaInfo && (
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-400">本月下载次数</span>
                    <span className={quotaInfo.remaining === 0 ? 'text-red-400' : 'text-accent-400'}>
                      {quotaInfo.remaining} / {quotaInfo.total}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all"
                      style={{ width: `${((quotaInfo.total - quotaInfo.remaining) / quotaInfo.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {downloadSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
                  <div className="font-semibold mb-2">下载成功！</div>
                  <p className="text-slate-400 text-sm">正在准备下载文件...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleDownload}
                    disabled={downloading || (user && quotaInfo?.remaining === 0)}
                    className="btn-primary w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloading ? (
                      '下载中...'
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        {firmware.isPaid ? `购买并下载 ¥${firmware.price}` : '立即下载'}
                      </>
                    )}
                  </button>

                  {user && quotaInfo?.remaining === 0 && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm">
                      <div className="flex items-start gap-2">
                        <Zap className="w-5 h-5 text-amber-400 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-amber-400 mb-1">本月额度已用完</div>
                          <p className="text-slate-400 text-xs">
                            升级 Premium 可获得更多下载次数
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!user && (
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-slate-400 text-sm text-center mb-4">
                        或赞助 1 元立即下载
                      </p>
                      <button
                        onClick={() => setShowSponsorModal(true)}
                        className="w-full py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                      >
                        <Heart className="w-5 h-5" />
                        赞助下载 ¥1
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <ShieldAlert className="w-5 h-5 text-slate-500" />
                  <span>请确保固件与您的设备型号匹配</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {showSponsorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSponsorModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-8 w-full max-w-md relative z-10"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-600 to-red-500 flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">赞助下载</h3>
              <p className="text-slate-400">
                感谢您的支持，您的赞助将帮助我们持续维护和更新固件资源
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 rounded-xl bg-white/5 flex items-center justify-between">
                <div>
                  <div className="font-semibold">单次下载</div>
                  <div className="text-sm text-slate-400">可下载当前固件</div>
                </div>
                <div className="text-2xl font-bold text-accent-400">¥1</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSponsorModal(false)}
                className="flex-1 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSponsorDownload}
                disabled={downloading}
                className="flex-1 py-3 rounded-xl btn-primary text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloading ? '处理中...' : '确认赞助'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
