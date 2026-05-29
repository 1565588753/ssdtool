import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../store';
import { authAPI } from '../services/api';
import {
  Mail,
  Lock,
  LogIn,
  Shield
} from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { setUser } = useAppStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authAPI.login(formData.email, formData.password);
      if (res.success && res.token) {
        localStorage.setItem('authToken', res.token);
        const verifyRes = await authAPI.verifyToken();
        if (verifyRes.success && verifyRes.user) {
          if (verifyRes.user.role !== 'admin') {
            localStorage.removeItem('authToken');
            setError('仅管理员可从此入口登录');
            setLoading(false);
            return;
          }
          setUser(verifyRes.user);
          navigate('/user');
          return;
        }
      }
      setError('邮箱或密码错误');
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || '登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-2" style={{ color: 'var(--theme-text)' }}>管理员登录</h1>
          <p className="text-slate-400">网站当前处于维护模式，管理员请登录</p>
        </div>

        <div className="glass-card rounded-2xl p-8" style={{ borderColor: 'var(--theme-border)' }}>
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>
                管理员邮箱
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 rounded-xl placeholder-slate-500 focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: 'var(--theme-bg-card)',
                    border: '1px solid var(--theme-border)',
                    color: 'var(--theme-text)'
                  }}
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 rounded-xl placeholder-slate-500 focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: 'var(--theme-bg-card)',
                    border: '1px solid var(--theme-border)',
                    color: 'var(--theme-text)'
                  }}
                  placeholder="请输入管理员密码"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '登录中...' : (
                <>
                  <LogIn className="w-5 h-5" />
                  管理员登录
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}