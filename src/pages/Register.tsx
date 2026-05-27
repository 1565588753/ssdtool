import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store';
import { authAPI } from '../services/api';
import SliderCaptcha from '../components/SliderCaptcha';
import {
  Mail,
  Lock,
  User,
  CheckCircle,
  HardDrive,
  Eye,
  EyeOff,
  ShieldCheck,
  X
} from 'lucide-react';

const CODE_COOLDOWN = 120;
const CODE_TIMER_KEY = 'registerCodeTimerEnd';

function getRemainingSeconds(): number {
  try {
    const end = parseInt(localStorage.getItem(CODE_TIMER_KEY) || '0', 10);
    if (!end) return 0;
    const remaining = Math.max(0, Math.ceil((end - Date.now()) / 1000));
    if (remaining <= 0) {
      localStorage.removeItem(CODE_TIMER_KEY);
      return 0;
    }
    return remaining;
  } catch {
    return 0;
  }
}

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAppStore();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [formData, setFormData] = useState({
    email: '',
    nickname: '',
    password: '',
    confirmPassword: '',
    code: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(getRemainingSeconds);
  const [sliderVerified, setSliderVerified] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const remaining = getRemainingSeconds();
    if (remaining > 0) {
      setCountdown(remaining);
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            clearInterval(timerRef.current);
            localStorage.removeItem(CODE_TIMER_KEY);
            return 0;
          }
          localStorage.setItem(CODE_TIMER_KEY, String(Date.now() + next * 1000));
          return next;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCountdown = useCallback(() => {
    const end = Date.now() + CODE_COOLDOWN * 1000;
    localStorage.setItem(CODE_TIMER_KEY, String(end));
    setCountdown(CODE_COOLDOWN);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(timerRef.current);
          localStorage.removeItem(CODE_TIMER_KEY);
          return 0;
        }
        localStorage.setItem(CODE_TIMER_KEY, String(Date.now() + next * 1000));
        return next;
      });
    }, 1000);
  }, []);

  const handleSendCode = async () => {
    if (!formData.email) {
      setError('请先输入邮箱地址');
      return;
    }
    if (countdown > 0) return;
    setError('');
    try {
      const res = await authAPI.sendCode(formData.email, 'register');
      if (res.success) {
        startCountdown();
        setSentEmail(formData.email);
        setShowCodeModal(true);
      } else {
        setError((res as any).error || '发送验证码失败');
      }
    } catch (err: any) {
      setError(err.message || '发送验证码失败');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!sliderVerified) {
      setError('请先完成滑块验证');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (formData.password.length < 6) {
      setError('密码长度至少6位');
      return;
    }

    if (!formData.code) {
      setError('请输入验证码');
      return;
    }

    setLoading(true);
    try {
      const success = await register(
        formData.email,
        formData.password,
        formData.nickname,
        formData.code
      );
      if (success) {
        localStorage.removeItem(CODE_TIMER_KEY);
        setStep('success');
      } else {
        setError('注册失败，请稍后重试');
      }
    } catch (err) {
      setError('注册失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-4">注册成功！</h1>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            您的账号已创建成功，现在可以登录使用了。
          </p>
          <Link
            to="/login"
            className="btn-primary inline-flex items-center gap-2 px-8 py-3 rounded-xl text-white font-semibold"
          >
            立即登录
          </Link>
        </motion.div>
      </div>
    );
  }

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
          <h1 className="font-display text-3xl font-bold mb-2">创建账号</h1>
          <p className="text-slate-400">加入我们的社区，获取更多开卡工具</p>
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
              <div className="relative flex gap-2">
                <div className="relative flex-1">
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
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={countdown > 0}
                  className="px-4 py-3 rounded-xl text-white font-semibold text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'var(--theme-gradient)' }}
                >
                  {countdown > 0 ? `${countdown}s` : '获取验证码'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                验证码
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500/50 transition-all"
                  placeholder="请输入验证码"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                昵称
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500/50 transition-all"
                  placeholder="请输入您的昵称"
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
                  placeholder="请设置您的密码（至少6位）"
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

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                确认密码
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500/50 transition-all"
                  placeholder="请再次输入密码"
                />
              </div>
            </div>

            <SliderCaptcha onVerified={() => setSliderVerified(true)} />

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '注册中...' : '注册'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              已有账号？
              <Link to="/login" className="text-accent-400 hover:text-accent-300 font-medium ml-1">
                立即登录
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

      <AnimatePresence>
        {showCodeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCodeModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-card rounded-2xl p-8 max-w-sm w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowCodeModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-accent-500/20 flex items-center justify-center">
                  <Mail className="w-7 h-7 text-accent-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  验证码已发送
                </h3>
                <p className="text-slate-300 text-sm mb-1">
                  验证码已发送至
                </p>
                <p className="text-accent-400 font-medium text-sm mb-4">
                  {sentEmail}
                </p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  有效期30分钟，如果没有收到请检查垃圾信箱
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}