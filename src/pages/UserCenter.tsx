import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../store';
import {
  User,
  Mail,
  Calendar,
  Download,
  ShieldCheck,
  CreditCard,
  Settings,
  ArrowLeft,
  Zap,
  Heart,
  Upload,
  Crown
} from 'lucide-react';

export default function UserCenter() {
  const navigate = useNavigate();
  const { user, logout, upgradeToPremium } = useAppStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'downloads' | 'settings'>('overview');
  const [upgrading, setUpgrading] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const success = await upgradeToPremium();
      if (success) {
        // Success - the store will update
      }
    } catch (err) {
      console.error('Upgrade failed:', err);
    } finally {
      setUpgrading(false);
    }
  };

  const remainingQuota = user.isPremium
    ? 100
    : Math.max(0, user.downloadQuota - user.downloadsUsed);
  const totalQuota = user.isPremium ? 100 : 5;
  const usedQuota = totalQuota - remainingQuota;
  const usagePercent = (usedQuota / totalQuota) * 100;

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

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-lg">{user.nickname}</div>
                  <div className="text-sm text-slate-400 flex items-center gap-1">
                    {user.role === 'admin' ? (
                      <span className="flex items-center gap-1 text-amber-400">
                        <Crown className="w-3 h-3" />
                        管理员
                      </span>
                    ) : user.role === 'maintainer' ? (
                      <span className="flex items-center gap-1 text-primary-400">
                        <ShieldCheck className="w-3 h-3" />
                        维护者
                      </span>
                    ) : (
                      '普通用户'
                    )}
                  </div>
                </div>
              </div>

              {user.isPremium && (
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold">
                    <Crown className="w-5 h-5" />
                    Premium 会员
                  </div>
                  <p className="text-sm text-slate-400 mt-1">享受无限下载特权</p>
                </div>
              )}

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <User className="w-5 h-5" />
                  概览
                </button>
                <button
                  onClick={() => setActiveTab('downloads')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    activeTab === 'downloads'
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Download className="w-5 h-5" />
                  下载记录
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  设置
                </button>
              </nav>

              <div className="mt-6 pt-6 border-t border-white/10">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <User className="w-5 h-5" />
                  退出登录
                </button>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="glass-card rounded-2xl p-8">
                  <h2 className="font-display text-xl font-bold mb-6">账户信息</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-slate-500" />
                        <div>
                          <div className="text-sm text-slate-500">昵称</div>
                          <div className="font-medium">{user.nickname}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-slate-500" />
                        <div>
                          <div className="text-sm text-slate-500">邮箱</div>
                          <div className="font-medium">{user.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-slate-500" />
                        <div>
                          <div className="text-sm text-slate-500">注册时间</div>
                          <div className="font-medium">
                            {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-xl font-bold">本月下载额度</h2>
                    {!user.isPremium && (
                      <button
                        onClick={handleUpgrade}
                        disabled={upgrading}
                        className="btn-primary px-4 py-2 rounded-xl text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {upgrading ? '处理中...' : (
                          <>
                            <Zap className="w-4 h-4" />
                            升级 Premium
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400">已使用</span>
                      <span className="font-semibold">
                        {usedQuota} / {totalQuota}
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          usagePercent > 80 ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-primary-500 to-accent-500'
                        }`}
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                  </div>

                  {!user.isPremium && (
                    <p className="text-sm text-slate-400">
                      升级 Premium 仅需 ¥8，即可获得 100 次/月下载额度
                    </p>
                  )}
                </div>

                {!user.isPremium && (
                  <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10" />
                    <div className="relative">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                          <Crown className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-display text-lg font-bold mb-2">升级 Premium 会员</h3>
                          <ul className="text-sm text-slate-400 space-y-1 mb-4">
                            <li className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-accent-400" />
                              100 次/月下载额度
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-accent-400" />
                              优先访问新固件
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-accent-400" />
                              专属会员标识
                            </li>
                          </ul>
                          <div className="flex items-center gap-4">
                            <div className="text-3xl font-bold text-accent-400">¥8</div>
                            <button
                              onClick={handleUpgrade}
                              disabled={upgrading}
                              className="btn-primary px-6 py-2 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {upgrading ? '处理中...' : '立即升级'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'downloads' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-8"
              >
                <h2 className="font-display text-xl font-bold mb-6">下载记录</h2>
                <div className="text-center py-12 text-slate-400">
                  <Download className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                  <p>暂无下载记录</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-8"
              >
                <h2 className="font-display text-xl font-bold mb-6">账户设置</h2>
                <div className="text-center py-12 text-slate-400">
                  <Settings className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                  <p>设置功能开发中...</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
