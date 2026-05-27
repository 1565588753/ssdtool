import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../store';
import SliderCaptcha from '../components/SliderCaptcha';
import {
  Mail,
  Lock,
  LogIn,
  HardDrive,
  Eye,
  EyeOff
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAppStore();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sliderVerified, setSliderVerified] = useState(false);
  const [sliderKey, setSliderKey] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!sliderVerified) {
      setError('请先完成滑块验证');
      return;
    }

    setLoading(true);
    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        navigate('/');
      } else {
        setError('邮箱或密码错误');
        setSliderVerified(false);
        setSliderKey((k) => k + 1);
      }
    } catch (err) {
      setError('登录失败，请稍后重试');
      setSliderVerified(false);
      setSliderKey((k) => k + 1);
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
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center">
              <HardDrive className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-2xl">SSD开卡工具</span>
          </Link>
          <h1 className="font-display text-3xl font-bold mb-2">欢迎回来</h1>
          <p className="text-slate-400">登录您的账号继续使用</p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                邮箱地址
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500/50 transition-all"
                  placeholder="请输入您的邮箱"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500/50 transition-all"
                  placeholder="请输入您的密码"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-accent-500 focus:ring-accent-500"
                />
                <span className="text-sm text-slate-400">记住我</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-accent-400 hover:text-accent-300">
                忘记密码？
              </Link>
            </div>

            <SliderCaptcha key={sliderKey} onVerified={() => setSliderVerified(true)} />

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                '登录中...'
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  登录
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              还没有账号？
              <Link to="/register" className="text-accent-400 hover:text-accent-300 font-medium ml-1">
                立即注册
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="text-slate-500 hover:text-slate-400 text-sm">
            ← 返回首页
          </Link>
        </div>
      </motion.div>
    </div>
  );
}