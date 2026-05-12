import { useState } from 'react';
import { Palette, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { themes, useThemeStore } from '../hooks/useTheme';

export default function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentTheme, setTheme } = useThemeStore();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2 text-slate-300 hover:text-white"
        title="切换主题"
      >
        <Palette className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-72 glass-card rounded-xl p-4 shadow-2xl z-50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">选择主题配色</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-3">
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
                      className="w-10 h-10 rounded-xl shadow-lg transition-transform group-hover:scale-110"
                      style={{ background: theme.gradient }}
                    />
                    {currentTheme === theme.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                          <Check className="w-3 h-3 text-slate-900 font-bold" />
                        </div>
                      </motion.div>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-2 text-center">{theme.name}</p>
                </button>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-slate-500 text-center">
                主题偏好会自动保存
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
