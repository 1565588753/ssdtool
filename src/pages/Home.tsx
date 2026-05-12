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
    <div className="min-h-screen gradient-bg">
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500"></span>
              </span>
              <span className="text-sm text-slate-300">专业的SSD开卡工具分享平台</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent">
                {config.siteSettings.name}
              </span>
            </h1>

            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
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
                className="px-8 py-4 rounded-xl glass-card text-white font-semibold text-lg hover:bg-white/10 transition-colors"
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
              <div key={index} className="glass-card rounded-2xl p-6 text-center">
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-accent-400" />
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
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
                <h2 className="font-display text-2xl font-bold mb-2 flex items-center gap-3">
                  <Zap className="w-6 h-6 text-amber-400" />
                  热门固件
                </h2>
                <p className="text-slate-400">下载量最高的开卡工具</p>
              </div>
              <Link
                to="/categories"
                className="text-accent-400 hover:text-accent-300 font-medium flex items-center gap-1"
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
        <section className="py-20 bg-black/20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-between mb-10"
            >
              <div>
                <h2 className="font-display text-2xl font-bold mb-2 flex items-center gap-3">
                  <Server className="w-6 h-6 text-primary-400" />
                  最新上传
                </h2>
                <p className="text-slate-400">最新更新的开卡工具</p>
              </div>
              <Link
                to="/categories"
                className="text-accent-400 hover:text-accent-300 font-medium flex items-center gap-1"
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
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-pink-400" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold">爱心捐赠</h3>
                    <p className="text-sm text-slate-400">感谢支持网站运营的朋友们</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {donations.slice(0, 5).map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <span className="font-medium">{donation.userNickname}</span>
                      <span className="text-accent-400 font-semibold">¥{donation.amount}</span>
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
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold">贡献榜</h3>
                    <p className="text-sm text-slate-400">感谢分享固件的贡献者们</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {contributors.slice(0, 5).map((contributor, index) => (
                    <div key={contributor.userId} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium">{contributor.nickname}</span>
                      </div>
                      <span className="text-slate-400">{contributor.firmwareCount} 个固件</span>
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
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-accent-600/20"></div>
            <div className="relative z-10">
              <h2 className="font-display text-2xl md:text-4xl font-bold mb-4">
                加入我们的社区
              </h2>
              <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
                注册账号，每月可免费下载 {config.quotaSettings.freeQuota} 个固件，升级 Premium 更可无限下载！
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="btn-primary px-8 py-4 rounded-xl text-white font-semibold text-lg"
                >
                  立即注册
                </Link>
                <div className="flex items-center gap-2 text-slate-400">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span>Premium 仅需 ¥{config.quotaSettings.premiumPrice}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg">{config.siteSettings.name}</span>
            </div>
            <p className="text-slate-500 text-sm">
              © 2024 {config.siteSettings.name}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
