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
            {isAuthenticated && (user?.role === 'maintainer' || user?.role === 'admin') ? (
              <button className="text-theme-secondary hover:text-theme-main transition-colors flex items-center gap-2">
                <UploadCloud className="w-4 h-4" />
                上传固件
              </button>
            ) : null}
            {isAuthenticated && (
              <Link to="/user" className="text-theme-secondary hover:text-theme-main transition-colors">
                用户中心
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <ThemeSwitcher />
            
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-theme-card hover:bg-theme-hover transition-colors border border-theme"
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--theme-gradient)' }}
                  >
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-theme-main">{user?.nickname}</span>
                </button>

                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 top-full mt-2 w-48 glass-card rounded-xl p-2 shadow-xl border border-theme"
                  >
                    <Link
                      to="/user"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-theme-hover transition-colors text-theme-main"
                    >
                      <User className="w-4 h-4" />
                      用户中心
                    </Link>
                    {user?.isPremium && (
                      <div className="flex items-center gap-3 px-3 py-2 text-theme-primary text-sm">
                        <Zap className="w-4 h-4" />
                        Premium
                      </div>
                    )}
                    <hr className="border-theme my-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-theme-hover transition-colors text-red-500"
                    >
                      <LogOut className="w-4 h-4" />
                      退出登录
                    </button>
                  </motion.div>
                )}
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
                  className="btn-primary px-4 py-2 rounded-xl text-white font-semibold"
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
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden pb-4"
          >
            <div className="flex flex-col gap-2">
              <div className="flex justify-center mb-4">
                <ThemeSwitcher />
              </div>
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-3 rounded-xl hover:bg-theme-hover transition-colors text-theme-main"
              >
                首页
              </Link>
              <Link
                to="/categories"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-3 rounded-xl hover:bg-theme-hover transition-colors text-theme-main"
              >
                分类浏览
              </Link>
              <Link
                to="/license-query"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-3 rounded-xl hover:bg-theme-hover transition-colors text-theme-main flex items-center gap-2"
              >
                <Key className="w-4 h-4" />
                卡密查询
              </Link>
              <hr className="border-theme" />
              {isAuthenticated ? (
                <>
                  <Link
                    to="/user"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-3 rounded-xl hover:bg-theme-hover transition-colors text-theme-main"
                  >
                    用户中心
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-left px-4 py-3 rounded-xl hover:bg-theme-hover transition-colors text-red-500"
                  >
                    退出登录
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-3 rounded-xl hover:bg-theme-hover transition-colors text-theme-main"
                  >
                    登录
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="btn-primary px-4 py-3 rounded-xl text-white font-semibold text-center"
                  >
                    注册
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
