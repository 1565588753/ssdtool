import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../store';
import { useThemeStore } from '../hooks/useTheme';
import ThemeSwitcher from './ThemeSwitcher';
import {
  HardDrive,
  User,
  Menu,
  X,
  LogOut,
  UploadCloud,
  Zap,
  Key
} from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, config } = useAppStore();
  const { applyTheme } = useThemeStore();
  const navigate = useNavigate();

  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-theme">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center neon-border"
              style={{ background: 'var(--theme-gradient)' }}
            >
              <HardDrive className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-xl bg-gradient-to-r" style={{ backgroundImage: 'var(--theme-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {config.siteSettings.name}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-theme-secondary hover:text-theme-main transition-colors">
              首页
            </Link>
            <Link to="/categories" className="text-theme-secondary hover:text-theme-main transition-colors">
              分类浏览
            </Link>
            <Link to="/license-query" className="text-theme-secondary hover:text-theme-main transition-colors flex items-center gap-2">
              <Key className="w-4 h-4" />
              卡密查询
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <ThemeSwitcher />
            
            {isAuthenticated ? (
              <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-theme-card border border-theme">
                <Link
                  to="/user"
                  className="flex items-center gap-3 hover:bg-theme-hover transition-colors text-theme-main rounded-lg px-2 py-1"
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--theme-gradient)' }}
                  >
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">{user?.nickname}</span>
                </Link>
                
                {user?.isPremium && (
                  <div className="flex items-center gap-2 px-2 py-1 rounded-lg" style={{ backgroundColor: 'var(--theme-bg-hover)' }}>
                    <Zap className="w-4 h-4" style={{ color: 'var(--theme-accent-400)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--theme-accent-400)' }}>Premium</span>
                  </div>
                )}
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-theme-hover transition-colors text-red-500"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl hover:bg-theme-hover transition-colors text-theme-secondary hover:text-theme-main"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-white font-semibold"
                  style={{ background: 'var(--theme-gradient)' }}
                >
                  注册
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-theme-hover transition-colors text-theme-main"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 border-t border-theme"
          >
            <div className="flex flex-col gap-3">
              <div className="flex justify-center py-2">
                <ThemeSwitcher />
              </div>
              
              <div className="flex flex-wrap gap-2 px-2">
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex-1 min-w-[120px] px-4 py-3 rounded-xl hover:bg-theme-hover transition-colors text-theme-main text-center font-medium"
                  style={{ backgroundColor: 'var(--theme-bg-card)' }}
                >
                  首页
                </Link>
                <Link
                  to="/categories"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex-1 min-w-[120px] px-4 py-3 rounded-xl hover:bg-theme-hover transition-colors text-theme-main text-center font-medium"
                  style={{ backgroundColor: 'var(--theme-bg-card)' }}
                >
                  分类浏览
                </Link>
              </div>
              
              <Link
                to="/license-query"
                onClick={() => setIsMenuOpen(false)}
                className="mx-2 px-4 py-3 rounded-xl hover:bg-theme-hover transition-colors text-theme-main flex items-center gap-3"
                style={{ backgroundColor: 'var(--theme-bg-card)' }}
              >
                <Key className="w-5 h-5" />
                卡密查询
              </Link>
              
              <div className="border-t border-theme my-2"></div>
              
              {isAuthenticated ? (
                <div className="space-y-2 px-2">
                  <Link
                    to="/user"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-theme-hover transition-colors text-theme-main"
                    style={{ backgroundColor: 'var(--theme-bg-card)' }}
                  >
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--theme-gradient)' }}
                    >
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{user?.nickname}</div>
                      {user?.isPremium && (
                        <div className="text-xs" style={{ color: 'var(--theme-accent-400)' }}>Premium 会员</div>
                      )}
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-theme-hover transition-colors text-red-500 flex items-center gap-3"
                    style={{ backgroundColor: 'var(--theme-bg-card)' }}
                  >
                    <LogOut className="w-5 h-5" />
                    退出登录
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 px-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl hover:bg-theme-hover transition-colors text-theme-main text-center font-medium"
                    style={{ backgroundColor: 'var(--theme-bg-card)' }}
                  >
                    登录
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl text-white text-center font-semibold"
                    style={{ background: 'var(--theme-gradient)' }}
                  >
                    注册
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
