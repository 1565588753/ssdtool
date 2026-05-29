import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminAPI } from '../../services/api';
import {
  Users,
  FileText,
  Download,
  Zap,
  Plus,
  FolderTree,
  Tag,
  Settings
} from 'lucide-react';

export default function Dashboard({ isAdmin, isMaintainer, onNavigate }: { isAdmin: boolean; isMaintainer: boolean; onNavigate?: (tab: string) => void }) {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalFirmware: 0,
    totalDownloads: 0,
    totalDonations: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchDashboardData = async () => {
      try {
        const response = await adminAPI.getDashboard();
        if (response.success) {
          setDashboardData(response.dashboard);
        }
      } catch (error) {
        console.error('获取仪表盘数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin || isMaintainer) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }

    const safetyTimeout = setTimeout(() => setLoading(false), 8000);

    return () => {
      clearTimeout(safetyTimeout);
      abortController.abort();
    };
  }, [isAdmin, isMaintainer]);

  const stats = [
    { label: '总用户数', value: loading ? '...' : dashboardData.totalUsers.toString(), icon: Users },
    { label: '固件总数', value: loading ? '...' : dashboardData.totalFirmware.toString(), icon: FileText },
    { label: '下载次数', value: loading ? '...' : dashboardData.totalDownloads.toLocaleString(), icon: Download },
    { label: '捐赠总额', value: loading ? '...' : `¥${dashboardData.totalDonations}`, icon: Zap }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>仪表盘</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-xl p-6 hover:border-white/20 transition-all"
              style={{ borderColor: 'var(--theme-border)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="p-3 rounded-xl"
                  style={{ background: 'var(--theme-gradient)' }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold mb-1" style={{ color: 'var(--theme-text)' }}>{stat.value}</p>
              <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="glass-card rounded-xl p-6" style={{ borderColor: 'var(--theme-border)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>快捷操作</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isMaintainer && (
            <button
              onClick={() => onNavigate?.('firmware')}
              className="p-4 border-2 border-dashed rounded-xl hover:border-white/40 hover:bg-white/5 transition-all flex flex-col items-center gap-2"
              style={{ borderColor: 'var(--theme-border)' }}
            >
              <Plus className="w-8 h-8" style={{ color: 'var(--theme-text-secondary)' }} />
              <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>上传固件</span>
            </button>
          )}
          {isAdmin && (
            <>
              <button onClick={() => onNavigate?.('categories')} className="p-4 border-2 border-dashed rounded-xl hover:border-white/40 hover:bg-white/5 transition-all flex flex-col items-center gap-2" style={{ borderColor: 'var(--theme-border)' }}>
                <FolderTree className="w-8 h-8" style={{ color: 'var(--theme-text-secondary)' }} />
                <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>管理分类</span>
              </button>
              <button onClick={() => onNavigate?.('tags')} className="p-4 border-2 border-dashed rounded-xl hover:border-white/40 hover:bg-white/5 transition-all flex flex-col items-center gap-2" style={{ borderColor: 'var(--theme-border)' }}>
                <Tag className="w-8 h-8" style={{ color: 'var(--theme-text-secondary)' }} />
                <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>管理标签</span>
              </button>
              <button onClick={() => onNavigate?.('settings')} className="p-4 border-2 border-dashed rounded-xl hover:border-white/40 hover:bg-white/5 transition-all flex flex-col items-center gap-2" style={{ borderColor: 'var(--theme-border)' }}>
                <Settings className="w-8 h-8" style={{ color: 'var(--theme-text-secondary)' }} />
                <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>网站设置</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}