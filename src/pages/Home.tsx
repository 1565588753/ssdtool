import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../store';
import FirmwareCard from '../components/FirmwareCard';
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
    config
  } = useAppStore();

  const hotFirmware = getHotFirmware();
  const latestFirmware = getLatestFirmware();

  const stats = [
    { icon: HardDrive, label: '固件总数', value: '1,280+' },
    { icon: Zap, label: '下载次数', value: '50K+' },
    { icon: ShieldCheck, label: '用户数量', value: '8,500+' },
    { icon: GitBranch, label: '主控品牌', value: '20+' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--theme-bg-base)' }}>
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 gradient-hero"></div>

        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="particle"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: 0.3
              }}
              animate={{
                y: [null, -50],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6" style={{ borderColor: 'var(--theme-border)' }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: 'var(--theme-accent-400)' }}></span>
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: 'var(--theme-accent-500)' }}></span>
              </span>
              <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>专业的SSD开卡工具分享平台</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r bg-clip-text text-transparent" style={{ backgroundImage: 'var(--theme-gradient)' }}>
                {config.siteSettings.name}
              </span>
            </h1>

            <p className="text-xl mb-10 max-w-2xl mx-auto" style={{ color: 'var(--theme-text-secondary)' }}>
              {config.siteSettings.description}，汇集慧荣、群联、联芸等主流主控开卡工具，助您轻松修复SSD！
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/categories"
                className="btn-primary px-8 py-4 rounded-xl text-white font-semibold text-lg flex items-center gap-2"
              >
                浏览固件
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/register"
                className="px-8 py-4 rounded-xl glass-card font-semibold text-lg hover:bg-white/10 transition-colors"
                style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
              >
                免费注册
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <div key={index} className="glass-card rounded-2xl p-6 text-center" style={{ borderColor: 'var(--theme-border)' }}>
                <stat.icon className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--theme-accent-400)' }} />
                <div className="text-2xl font-bold mb-1" style={{ color: 'var(--theme-text)' }}>{stat.value}</div>
                <div className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {config.moduleSettings.showHot && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-between mb-10"
            >
              <div>
                <h2 className="font-display text-2xl font-bold mb-2 flex items-center gap-3" style={{ color: 'var(--theme-text)' }}>
                  <Zap className="w-6 h-6 text-amber-400" />
                  热门固件
                </h2>
                <p style={{ color: 'var(--theme-text-secondary)' }}>下载量最高的开卡工具</p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotFirmware.map((firmware, index) => (
                <FirmwareCard key={firmware.id} firmware={firmware} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {config.moduleSettings.showLatest && (
        <section className="py-20" style={{ backgroundColor: 'var(--theme-bg-card)', opacity: 0.5 }}>
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-between mb-10"
            >
              <div>
                <h2 className="font-display text-2xl font-bold mb-2 flex items-center gap-3" style={{ color: 'var(--theme-text)' }}>
                  <Server className="w-6 h-6" style={{ color: 'var(--theme-primary-400)' }} />
                  最新上传
                </h2>
                <p style={{ color: 'var(--theme-text-secondary)' }}>最新更新的开卡工具</p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestFirmware.map((firmware, index) => (
                <FirmwareCard key={firmware.id} firmware={firmware} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {config.moduleSettings.showDonations && (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="glass-card rounded-2xl p-8"
                style={{ borderColor: 'var(--theme-border)' }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(236, 72, 153, 0.2)' }}>
                    <Heart className="w-6 h-6 text-pink-400" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold" style={{ color: 'var(--theme-text)' }}>爱心捐赠</h3>
                    <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>感谢支持网站运营的朋友们</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {donations.slice(0, 5).map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--theme-bg-hover)' }}>
                      <span className="font-medium" style={{ color: 'var(--theme-text)' }}>{donation.userNickname}</span>
                      <span className="font-semibold" style={{ color: 'var(--theme-accent-400)' }}>¥{donation.amount}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {config.moduleSettings.showContributors && (
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="glass-card rounded-2xl p-8"
                style={{ borderColor: 'var(--theme-border)' }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)' }}>
                    <Trophy className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold" style={{ color: 'var(--theme-text)' }}>贡献榜</h3>
                    <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>感谢分享固件的贡献者们</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {contributors.slice(0, 5).map((contributor, index) => (
                    <div key={contributor.userId} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--theme-bg-hover)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'var(--theme-gradient)' }}>
                          {index + 1}
                        </div>
                        <span className="font-medium" style={{ color: 'var(--theme-text)' }}>{contributor.nickname}</span>
                      </div>
                      <span style={{ color: 'var(--theme-text-secondary)' }}>{contributor.firmwareCount} 个固件</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-8 md:p-12 text-center relative overflow-hidden"
            style={{ borderColor: 'var(--theme-border)' }}
          >
            <div className="absolute inset-0" style={{ 
              background: 'linear-gradient(90deg, var(--theme-primary-600)20 0%, var(--theme-accent-600)20 100%)' 
            }}></div>
            <div className="relative z-10">
              <h2 className="font-display text-2xl md:text-4xl font-bold mb-4" style={{ color: 'var(--theme-text)' }}>
                加入我们的社区
              </h2>
              <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: 'var(--theme-text-secondary)' }}>
                注册账号，每月可免费下载 {config.quotaSettings.freeQuota} 个固件，升级 Premium 更可无限下载！
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="btn-primary px-8 py-4 rounded-xl text-white font-semibold text-lg"
                >
                  立即注册
                </Link>
                <div className="flex items-center gap-2" style={{ color: 'var(--theme-text-secondary)' }}>
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span>Premium 仅需 ¥{config.quotaSettings.premiumPrice}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 border-t" style={{ borderColor: 'var(--theme-border)' }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--theme-gradient)' }}>
                <HardDrive className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg" style={{ color: 'var(--theme-text)' }}>{config.siteSettings.name}</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
              © 2024 {config.siteSettings.name}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
