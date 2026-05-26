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
  Home,
  FolderOpen
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
    <>
      {/* 桌面端布局 */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 glass border-b border-theme">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16">
            {/* Logo区域 */}
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

            {/* 导航按钮 */}
            <div className="flex-1 flex items-center justify-center gap-6">
              <Link to="/" className="text-theme-secondary hover:text-theme-main transition-colors flex items-center gap-2">
                <Home className="w-4 h-4" />
                首页
              </Link>
              <Link to="/categories" className="text-theme-secondary hover:text-theme-main transition-colors flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                分类浏览
              </Link>
            </div>

            {/* 用户区域 */}
            <div className="flex items-center gap-4">
              <ThemeSwitcher />
              
              {isAuthenticated ? (
                <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-theme-card border border-theme">
                  <div 
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--theme-gradient)' }}
                  >
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--theme-text)' }}>{user?.nickname}</span>
                  
                  <Link to="/user" className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-theme-hover transition-colors text-theme-secondary hover:text-theme-main text-xs">
                    <User className="w-3 h-3" />
                    用户中心
                  </Link>
                  
                  {user?.isPremium && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ backgroundColor: 'var(--theme-bg-hover)' }}>
                      <Zap className="w-3 h-3" style={{ color: 'var(--theme-accent-400)' }} />
                      <span className="text-xs font-medium" style={{ color: 'var(--theme-accent-400)' }}>Premium</span>
                    </div>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-theme-hover transition-colors text-red-500"
                  >
                    <LogOut className="w-3.5 h-3.5" />
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
          </div>
        </div>
      </nav>

      {/* 移动端布局 */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-theme">
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
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-theme-hover transition-colors text-theme-main flex items-center gap-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              <span className="text-sm font-medium">{isMenuOpen ? '关闭' : '菜单'}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 移动端菜单 */}
      {isMenuOpen && (
        <>
          {/* 遮罩层 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
            className="md:hidden fixed inset-0 bg-black/50 z-50"
          />
          {/* 侧边菜单 */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="md:hidden fixed right-0 top-0 bottom-0 w-72 bg-theme-card border-l border-theme z-50"
            style={{ backgroundColor: 'var(--theme-bg-card)' }}
          >
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--theme-border)' }}>
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--theme-gradient)' }}
                >
                  <HardDrive className="w-5 h-5 text-white" />
                </div>
                <span className="font-display font-bold text-lg" style={{ color: 'var(--theme-text)' }}>
                  {config.siteSettings.name}
                </span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-theme-hover transition-colors text-theme-main"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex flex-col gap-1 p-4">
              <div className="flex justify-center py-2">
                <ThemeSwitcher />
              </div>
              
              <div className="h-px my-2" style={{ backgroundColor: 'var(--theme-border)' }}></div>
              
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-theme-hover transition-colors text-theme-main"
                style={{ backgroundColor: 'transparent' }}
              >
                <Home className="w-5 h-5" />
                首页
              </Link>
              
              <Link
                to="/categories"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-theme-hover transition-colors text-theme-main"
                style={{ backgroundColor: 'transparent' }}
              >
                <FolderOpen className="w-5 h-5" />
                分类浏览
              </Link>
              
              <div className="h-px my-2" style={{ backgroundColor: 'var(--theme-border)' }}></div>
              
              {isAuthenticated ? (
                <>
                  <Link
                    to="/user"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-theme-hover transition-colors text-theme-main"
                    style={{ backgroundColor: 'transparent' }}
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
                    style={{ backgroundColor: 'transparent' }}
                  >
                    <LogOut className="w-5 h-5" />
                    退出登录
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl hover:bg-theme-hover transition-colors text-theme-main font-medium"
                    style={{ backgroundColor: 'transparent' }}
                  >
                    登录
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-semibold mt-2"
                    style={{ background: 'var(--theme-gradient)' }}
                  >
                    注册
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </>
  );
}
