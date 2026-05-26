import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../store';
import { Mail, Lock, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { error, isLoading } = useAppStore();
  const [step, setStep] = useState<'email' | 'code' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [localError, setLocalError] = useState('');
  const [sendingCode, setSendingCode] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async () => {
    if (!email) {
      setLocalError('请输入邮箱地址');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLocalError('请输入有效的邮箱地址');
      return;
    }

    setSendingCode(true);
    setLocalError('');
    try {
      const { authAPI } = await import('../services/api');
      const res = await authAPI.sendCode(email, 'reset_password');
      if (res.success) {
        setCountdown(60);
        setStep('code');
      }
    } catch (err: any) {
      setLocalError(err.message || '发送验证码失败');
    } finally {
      setSendingCode(false);
    }
  };

  const handleResetPassword = async () => {
    if (!code) {
      setLocalError('请输入验证码');
      return;
    }
    if (!password) {
      setLocalError('请输入新密码');
      return;
    }
    if (password.length < 6) {
      setLocalError('密码长度至少6位');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('两次密码输入不一致');
      return;
    }

    setLocalError('');
    try {
      const { authAPI } = await import('../services/api');
      const res = await authAPI.resetPassword(email, password, code);
      if (res.success) {
        setStep('success');
      }
    } catch (err: any) {
      setLocalError(err.message || '重置密码失败');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--theme-bg-base)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm mb-6 hover:opacity-80 transition-opacity"
          style={{ color: 'var(--theme-text-secondary)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          返回登录
        </Link>

        <div className="glass-card rounded-2xl p-6 md:p-8" style={{ borderColor: 'var(--theme-border)' }}>
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3" style={{ background: 'var(--theme-gradient)' }}>
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>
              找回密码
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--theme-text-secondary)' }}>
              {step === 'email' && '请输入注册时使用的邮箱地址'}
              {step === 'code' && '请输入邮箱中收到的验证码并设置新密码'}
              {step === 'success' && '密码已重置成功'}
            </p>
          </div>

          {(localError || error) && (
            <div className="mb-4 p-3 rounded-xl text-sm" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              {localError || error}
            </div>
          )}

          {step === 'email' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>邮箱地址</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--theme-text-muted)' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="请输入邮箱"
                    className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none"
                    style={{
                      backgroundColor: 'var(--theme-bg-card)',
                      border: '1px solid var(--theme-border)',
                      color: 'var(--theme-text)',
                    }}
                  />
                </div>
              </div>
              <button
                onClick={handleSendCode}
                disabled={sendingCode}
                className="w-full btn-primary px-6 py-3 rounded-xl text-white font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {sendingCode ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    发送中...
                  </>
                ) : (
                  '发送验证码'
                )}
              </button>
            </div>
          )}

          {step === 'code' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>邮箱</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--theme-text-muted)' }} />
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full pl-10 pr-4 py-3 rounded-xl opacity-60 focus:outline-none"
                    style={{
                      backgroundColor: 'var(--theme-bg-card)',
                      border: '1px solid var(--theme-border)',
                      color: 'var(--theme-text)',
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>验证码</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--theme-text-muted)' }} />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="请输入6位验证码"
                    maxLength={6}
                    className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none"
                    style={{
                      backgroundColor: 'var(--theme-bg-card)',
                      border: '1px solid var(--theme-border)',
                      color: 'var(--theme-text)',
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>新密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--theme-text-muted)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="至少6位密码"
                    className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none"
                    style={{
                      backgroundColor: 'var(--theme-bg-card)',
                      border: '1px solid var(--theme-border)',
                      color: 'var(--theme-text)',
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>确认密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--theme-text-muted)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="再次输入密码"
                    className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none"
                    style={{
                      backgroundColor: 'var(--theme-bg-card)',
                      border: '1px solid var(--theme-border)',
                      color: 'var(--theme-text)',
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="showPassword" className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>显示密码</label>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSendCode}
                  disabled={countdown > 0 || sendingCode}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--theme-bg-card)',
                    border: '1px solid var(--theme-border)',
                    color: 'var(--theme-text)',
                  }}
                >
                  {countdown > 0 ? `${countdown}s 后重发` : '重新发送'}
                </button>
                <button
                  onClick={handleResetPassword}
                  className="flex-1 btn-primary px-4 py-3 rounded-xl text-white font-semibold text-sm"
                >
                  重置密码
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)' }}>
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                您的密码已重置成功，请使用新密码登录
              </p>
              <Link
                to="/login"
                className="inline-block btn-primary px-6 py-3 rounded-xl text-white font-semibold text-base"
              >
                去登录
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}