import { useState } from 'react';
import { Palette, Check, X, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { themes, useThemeStore } from '../hooks/useTheme';

export default function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentTheme, setTheme } = useThemeStore();
  const currentThemeData = themes.find(t => t.id === currentTheme) || themes[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2 text-theme-secondary hover:text-theme-main border border-theme"
        style={{ backgroundColor: isOpen ? 'var(--theme-bg-hover)' : 'transparent' }}
        title="切换主题"
      >
        <Palette className="w-4 h-4" />
        <span className="text-sm font-medium">主题</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-80 glass-card rounded-xl p-4 shadow-2xl z-50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-theme-main">选择主题配色</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-theme-secondary" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setTheme(theme.id);
                    setIsOpen(false);
                  }}
                  className="group relative"
                  title={theme.name}
                >
                  <div className="relative">
                    <div
                      className="w-12 h-12 rounded-xl shadow-lg transition-transform group-hover:scale-110 border-2"
                      style={{ 
                        background: theme.gradient,
                        borderColor: currentTheme === theme.id ? theme.primary[500] : 'transparent'
                      }}
                    >
                      <div className="flex items-center justify-center h-full">
                        {theme.mode === 'light' ? (
                          <Sun className="w-5 h-5 text-white drop-shadow-md" />
                        ) : (
                          <Moon className="w-5 h-5 text-white drop-shadow-md" />
                        )}
                      </div>
                    </div>
                    {currentTheme === theme.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1"
                      >
                        <div className="w-5 h-5 rounded-full bg-theme-primary-500 flex items-center justify-center border-2 border-white shadow-lg">
                          <Check className="w-3 h-3 text-white font-bold" />
                        </div>
                      </motion.div>
                    )}
                  </div>
                  <p className="text-xs text-theme-secondary mt-2 text-center truncate">{theme.name}</p>
                </button>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-theme">
              <p className="text-xs text-theme-secondary text-center">
                当前主题: {currentThemeData.name}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
