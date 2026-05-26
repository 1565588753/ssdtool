import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import FirmwareCard from '../components/FirmwareCard';
import { statsAPI } from '../services/api';
import {
  HardDrive,
  ArrowRight,
  Heart,
  Trophy,
  Zap,
  Server,
  ShieldCheck,
  GitBranch
} from 'lucide-react';

export default function Home() {
  const {
    getHotFirmware,
    getLatestFirmware,
    donations,
    contributors,
    config,
    firmware,
    categories,
    user
  } = useAppStore();

  const [publicStats, setPublicStats] = useState({
    totalUsers: 0,
    totalFirmware: 0,
    totalDownloads: 0,
    totalDonations: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const hotFirmware = getHotFirmware();
  const latestFirmware = getLatestFirmware();

  // 获取公共统计数据
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await statsAPI.getPublicStats();
        if (response.success) {
          setPublicStats(response.stats);
        }
      } catch (error) {
        console.error('获取统计数据失败:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  const topLevelCategories = categories.filter(c => !c.parentId).length;

  const stats = [
    { icon: HardDrive, label: '固件总数', value: (loadingStats ? '...' : publicStats.totalFirmware.toString()) },
    { icon: Zap, label: '下载次数', value: (loadingStats ? '...' : publicStats.totalDownloads.toLocaleString()) },
    { icon: ShieldCheck, label: '用户数量', value: (loadingStats ? '...' : publicStats.totalUsers.toString()) },
    { icon: GitBranch, label: '主控品牌', value: topLevelCategories.toString() },
  ];

  // 获取排序后的模块（排除donations和contributors和latest，它们会单独并排显示或不需要）
  const sortedModules = [...config.homeModules]
    .filter(m => m.id !== 'donations' && m.id !== 'contributors' && m.id !== 'latest')
    .sort((a, b) => a.order - b.order);

  // 渲染模块
  const renderModule = (module: any) => {
    if (!module.enabled) return null;

    switch (module.id) {
      case 'hero':
        return (
          <section key="hero" className="relative pt-20 pb-12 overflow-hidden">
            <div className="absolute inset-0 gradient-hero"></div>

            <div className="container mx-auto px-4 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-3xl mx-auto text-center"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card mb-4" style={{ borderColor: 'var(--theme-border)' }}>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: 'var(--theme-accent-400)' }}></span>
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: 'var(--theme-accent-500)' }}></span>
                  </span>
                  <span className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>专业的SSD开卡工具分享平台</span>
                </div>

                <h1 className="font-display text-3xl md:text-5xl font-bold mb-4">
                  <span className="bg-gradient-to-r bg-clip-text text-transparent" style={{ backgroundImage: 'var(--theme-gradient)' }}>
                    {config.siteSettings.name}
                  </span>
                </h1>

                <p className="text-base md:text-lg mb-6 max-w-2xl mx-auto" style={{ color: 'var(--theme-text-secondary)' }}>
                  {config.siteSettings.description}，汇集慧荣、群联、联芸等主流主控开卡工具，助您轻松修复SSD！
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    to="/categories"
                    className="btn-primary px-6 py-3 rounded-xl text-white font-semibold text-base flex items-center gap-2"
                  >
                    浏览固件
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-3 rounded-xl glass-card font-semibold text-base hover:bg-white/10 transition-colors"
                    style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
                  >
                    免费注册
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>
        );

      case 'stats':
        return (
          <section key="stats" className="py-8">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
              >
                {stats.map((stat, index) => (
                  <div key={index} className="glass-card rounded-2xl p-4 text-center" style={{ borderColor: 'var(--theme-border)' }}>
                    <stat.icon className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--theme-accent-400)' }} />
                    <div className="text-xl font-bold mb-1" style={{ color: 'var(--theme-text)' }}>{stat.value}</div>
                    <div className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </section>
        );

      case 'hot':
        return (
          <section key="hot" className="py-12">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-center justify-between mb-6"
              >
                <div>
                  <h2 className="font-display text-2xl font-bold mb-2 flex items-center gap-3" style={{ color: 'var(--theme-text)' }}>
                    <Zap className="w-6 h-6 text-amber-400" />
                    {module.title || '热门固件'}
                  </h2>
                  <p style={{ color: 'var(--theme-text-secondary)' }}>{module.description || '下载量最高的开卡工具'}</p>
                </div>
                <Link
                  to="/categories"
                  className="font-medium flex items-center gap-1 hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--theme-accent-400)' }}
                >
                  查看全部
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {hotFirmware.slice(0, 4).map((firmware, index) => (
                  <FirmwareCard key={firmware.id} firmware={firmware} index={index} />
                ))}
              </div>
            </div>
          </section>
        );

      case 'latest':
        return (
          <section key="latest" className="py-12" style={{ backgroundColor: 'var(--theme-bg-card)', opacity: 0.5 }}>
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-center justify-between mb-6"
              >
                <div>
                  <h2 className="font-display text-2xl font-bold mb-2 flex items-center gap-3" style={{ color: 'var(--theme-text)' }}>
                    <Server className="w-6 h-6" style={{ color: 'var(--theme-primary-400)' }} />
                    {module.title || '最新上传'}
                  </h2>
                  <p style={{ color: 'var(--theme-text-secondary)' }}>{module.description || '最新更新的开卡工具'}</p>
                </div>
                <Link
                  to="/categories"
                  className="font-medium flex items-center gap-1 hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--theme-accent-400)' }}
                >
                  查看全部
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {latestFirmware.slice(0, 4).map((firmware, index) => (
                  <FirmwareCard key={firmware.id} firmware={firmware} index={index} />
                ))}
              </div>
            </div>
          </section>
        );

      case 'donations':
      case 'contributors':
        const donationsModule = config.homeModules.find(m => m.id === 'donations');
        const contributorsModule = config.homeModules.find(m => m.id === 'contributors');
        
        // 如果两个模块都没启用，则不显示
        if (!donationsModule?.enabled && !contributorsModule?.enabled) return null;
        
        return (
          <section key="donations-contributors" className="py-12">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-6">
                {/* 爱心捐赠 */}
                {donationsModule?.enabled && (
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="glass-card rounded-2xl p-6"
                    style={{ borderColor: 'var(--theme-border)' }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(236, 72, 153, 0.2)' }}>
                        <Heart className="w-5 h-5 text-pink-400" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold" style={{ color: 'var(--theme-text)' }}>
                          {donationsModule.title || '爱心捐赠'}
                        </h3>
                        <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
                          {donationsModule.description || '感谢支持网站运营的朋友们'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {donations.slice(0, 4).map((donation) => (
                        <div key={donation.id} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: 'var(--theme-bg-hover)' }}>
                          <span className="text-sm font-medium" style={{ color: 'var(--theme-text)' }}>{donation.userNickname}</span>
                          <span className="text-sm font-semibold" style={{ color: 'var(--theme-accent-400)' }}>¥{donation.amount}</span>
                        </div>
                      ))}
                      {donations.length === 0 && (
                        <div className="text-center py-4" style={{ color: 'var(--theme-text-secondary)' }}>
                          暂无捐赠记录
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* 贡献榜 */}
                {contributorsModule?.enabled && (
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="glass-card rounded-2xl p-6"
                    style={{ borderColor: 'var(--theme-border)' }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)' }}>
                        <Trophy className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold" style={{ color: 'var(--theme-text)' }}>
                          {contributorsModule.title || '贡献榜'}
                        </h3>
                        <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
                          {contributorsModule.description || '感谢分享固件的贡献者们'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {contributors.slice(0, 4).map((contributor, index) => (
                        <div key={contributor.userId} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: 'var(--theme-bg-hover)' }}>
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--theme-gradient)' }}>
                              {index + 1}
                            </div>
                            <span className="text-sm font-medium" style={{ color: 'var(--theme-text)' }}>{contributor.nickname}</span>
                          </div>
                          <span className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>{contributor.firmwareCount} 个固件</span>
                        </div>
                      ))}
                      {contributors.length === 0 && (
                        <div className="text-center py-4" style={{ color: 'var(--theme-text-secondary)' }}>
                          暂无贡献者记录
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </section>
        );

      case 'cta':
        return (
          <section key="cta" className="py-12">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-card rounded-2xl p-8 md:p-10 text-center relative overflow-hidden"
                style={{ borderColor: 'var(--theme-border)' }}
              >
                <div className="absolute inset-0" style={{ 
                  background: 'linear-gradient(90deg, var(--theme-primary-600)20 0%, var(--theme-accent-600)20 100%)' 
                }}></div>
                <div className="relative z-10">
                  <h2 className="font-display text-2xl md:text-3xl font-bold mb-3" style={{ color: 'var(--theme-text)' }}>
                    加入我们的社区
                  </h2>
                  <p className="text-base mb-6 max-w-2xl mx-auto" style={{ color: 'var(--theme-text-secondary)' }}>
                    注册账号，每月可免费下载 {config.quotaSettings.freeQuota} 个固件，支持捐赠以获取更多下载！
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                      to="/register"
                      className="btn-primary px-6 py-3 rounded-xl text-white font-semibold text-base"
                    >
                      立即注册
                    </Link>
                    <div className="flex items-center gap-2" style={{ color: 'var(--theme-text-secondary)' }}>
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span className="text-sm">捐赠更优</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  // 渲染广告位
  const renderAdSlot = (position: string) => {
    const slot = config.adSlots.find(s => s.position === position && s.enabled);
    if (!slot || !slot.content) return null;

    return (
      <div 
        key={slot.id}
        className="container mx-auto px-4 py-4"
        dangerouslySetInnerHTML={{ __html: slot.content }}
      />
    );
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--theme-bg-base)' }}>
      {renderAdSlot('top')}
      
      {sortedModules.map(module => renderModule(module))}
      
      {renderAdSlot('bottom')}

      <footer className="py-8 border-t" style={{ borderColor: 'var(--theme-border)' }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--theme-gradient)' }}>
                <HardDrive className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-base" style={{ color: 'var(--theme-text)' }}>{config.siteSettings.name}</span>
            </div>
            <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
              © 2024 {config.siteSettings.name}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
