import { motion } from 'framer-motion';
import { useAppStore } from '../store';
import { Heart, Shield, Download, Zap, Gift, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Donate() {
  const { user, isAuthenticated } = useAppStore();
  const isDonor = isAuthenticated && user?.isPremium;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--theme-bg-base)' }}>
      <div className="container mx-auto px-4 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm mb-8 hover:opacity-80 transition-opacity"
          style={{ color: 'var(--theme-text-secondary)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'var(--theme-gradient)' }}>
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--theme-text)' }}>
              支持我们
            </h1>
            <p className="text-base max-w-2xl mx-auto" style={{ color: 'var(--theme-text-secondary)' }}>
              您的每一份支持都是我们持续更新和维护网站的动力
            </p>
          </div>

          {isDonor ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-card rounded-2xl p-8 md:p-12 text-center max-w-lg mx-auto"
              style={{ borderColor: 'var(--theme-border)' }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)' }}>
                <Gift className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-4" style={{ color: 'var(--theme-text)' }}>
                感谢您的支持！
              </h2>
              <p className="text-base mb-6" style={{ color: 'var(--theme-text-secondary)' }}>
                您已是 Premium 会员，感谢您对网站的支持与贡献！您的赞助帮助我们持续提供优质的 SSD 开卡工具，让更多维修人员受益。
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/categories"
                  className="btn-primary px-6 py-3 rounded-xl text-white font-semibold text-base"
                >
                  浏览固件
                </Link>
                <Link
                  to="/user"
                  className="px-6 py-3 rounded-xl glass-card font-semibold text-base hover:bg-white/10 transition-colors"
                  style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
                >
                  用户中心
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="glass-card rounded-2xl p-6 md:p-8" style={{ borderColor: 'var(--theme-border)' }}>
                  <h2 className="font-display text-xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--theme-text)' }}>
                    <Heart className="w-5 h-5 text-pink-400" />
                    扫码捐赠
                  </h2>
                  <div className="aspect-square max-w-xs mx-auto rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--theme-bg-card)' }}>
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center p-4">
                        <div className="w-48 h-48 mx-auto mb-3 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'white' }}>
                          <div className="grid grid-cols-8 gap-0.5">
                            {Array.from({ length: 64 }).map((_, i) => (
                              <div
                                key={i}
                                className="w-4 h-4"
                                style={{
                                  backgroundColor: Math.random() > 0.5 ? '#000' : '#fff',
                                  opacity: 0.8,
                                }}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm font-medium" style={{ color: 'var(--theme-text-secondary)' }}>
                          请使用微信/支付宝扫码捐赠
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-xs mt-4" style={{ color: 'var(--theme-text-muted)' }}>
                    请上传您的收款二维码图片替换此区域
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="space-y-6"
              >
                <div className="glass-card rounded-2xl p-6" style={{ borderColor: 'var(--theme-border)' }}>
                  <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--theme-text)' }}>
                    <Shield className="w-5 h-5" style={{ color: 'var(--theme-accent-400)' }} />
                    捐赠款项用途
                  </h2>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: 'var(--theme-accent-400)' }} />
                      <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>服务器与带宽费用，确保网站稳定快速访问</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: 'var(--theme-accent-400)' }} />
                      <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>持续收集和整理各品牌 SSD 开卡工具</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: 'var(--theme-accent-400)' }} />
                      <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>网站功能开发与维护，优化用户体验</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: 'var(--theme-accent-400)' }} />
                      <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>购买正版工具授权，为维修人员提供更多资源</span>
                    </li>
                  </ul>
                </div>

                <div className="glass-card rounded-2xl p-6" style={{ borderColor: 'var(--theme-border)' }}>
                  <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--theme-text)' }}>
                    <Zap className="w-5 h-5 text-amber-400" />
                    捐赠福利
                  </h2>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: 'var(--theme-gradient)' }}>1</div>
                      <div>
                        <span className="text-sm font-medium" style={{ color: 'var(--theme-text)' }}>升级 Premium 会员</span>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--theme-text-secondary)' }}>捐赠满 8 元即可升级，享受每月 100 次下载额度</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: 'var(--theme-gradient)' }}>2</div>
                      <div>
                        <span className="text-sm font-medium" style={{ color: 'var(--theme-text)' }}>更多下载次数</span>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--theme-text-secondary)' }}>免费用户每月 5 次，Premium 会员每月 100 次</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: 'var(--theme-gradient)' }}>3</div>
                      <div>
                        <span className="text-sm font-medium" style={{ color: 'var(--theme-text)' }}>优先获取新工具</span>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--theme-text-secondary)' }}>第一时间获取最新上传的固件和开卡工具</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: 'var(--theme-gradient)' }}>4</div>
                      <div>
                        <span className="text-sm font-medium" style={{ color: 'var(--theme-text)' }}>支持网站发展</span>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--theme-text-secondary)' }}>您的每一份支持都直接用于网站运营和工具收集</p>
                      </div>
                    </li>
                  </ul>
                </div>

                {!isAuthenticated && (
                  <div className="glass-card rounded-2xl p-6 text-center" style={{ borderColor: 'var(--theme-border)' }}>
                    <p className="text-sm mb-4" style={{ color: 'var(--theme-text-secondary)' }}>
                      登录后捐赠可自动升级为 Premium 会员
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <Link
                        to="/login"
                        className="px-5 py-2.5 rounded-xl glass-card font-medium text-sm hover:bg-white/10 transition-colors"
                        style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text)' }}
                      >
                        登录
                      </Link>
                      <Link
                        to="/register"
                        className="btn-primary px-5 py-2.5 rounded-xl text-white font-semibold text-sm"
                      >
                        注册
                      </Link>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}