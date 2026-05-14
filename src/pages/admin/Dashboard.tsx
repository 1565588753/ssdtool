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
  Settings,
  XCircle,
  CheckCircle
} from 'lucide-react';

export default function Dashboard({ isAdmin, isMaintainer, user }: { isAdmin: boolean; isMaintainer: boolean; user: any }) {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalFirmware: 0,
    totalDownloads: 0,
    totalDonations: 0,
    pendingFirmware: 0
  });
  const [loading, setLoading] = useState(true);
  const [pendingFirmware, setPendingFirmware] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await adminAPI.getDashboard();
        if (response.success) {
          setDashboardData(response.dashboard);
        }

        const firmwareResponse = await adminAPI.getFirmware();
        if (firmwareResponse.success) {
          const pending = firmwareResponse.firmware.filter((fw: any) => fw.status === 'pending');
          setPendingFirmware(pending);
        }
      } catch (error) {
        console.error('获取仪表盘数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin || isMaintainer) {
      fetchDashboardData();
    }
  }, [isAdmin, isMaintainer]);

  const stats = [
    { label: '总用户数', value: loading ? '...' : dashboardData.totalUsers.toString(), icon: Users },
    { label: '固件总数', value: loading ? '...' : dashboardData.totalFirmware.toString(), icon: FileText },
    { label: '下载次数', value: loading ? '...' : dashboardData.totalDownloads.toLocaleString(), icon: Download },
    { label: '捐赠总额', value: loading ? '...' : `¥${dashboardData.totalDonations}`, icon: Zap }
  ];

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-xl shadow-lg ${
          toast.type === 'success' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
        }`}>
          {toast.message}
        </div>
      )}

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

      {isMaintainer && pendingFirmware.length > 0 && (
        <div className="glass-card rounded-xl" style={{ borderColor: 'var(--theme-border)' }}>
          <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--theme-border)' }}>
            <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--theme-text)' }}>
              <XCircle className="w-5 h-5 text-amber-400" />
              待审核固件
            </h3>
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium">
              {pendingFirmware.length} 个待审核
            </span>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--theme-border)' }}>
            {pendingFirmware.map(fw => (
              <div key={fw.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors" style={{ backgroundColor: 'var(--theme-bg-hover)' }}>
                <div>
                  <p className="font-medium" style={{ color: 'var(--theme-text)' }}>{fw.title}</p>
                  <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>由 {fw.uploaderName} 上传 · {new Date(fw.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      try {
                        await adminAPI.updateFirmwareStatus(fw.id, 'approved');
                        setPendingFirmware(prev => prev.filter(f => f.id !== fw.id));
                        showToast('审核通过！', 'success');
                      } catch {
                        showToast('审核失败，请重试', 'error');
                      }
                    }}
                    className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await adminAPI.updateFirmwareStatus(fw.id, 'rejected');
                        setPendingFirmware(prev => prev.filter(f => f.id !== fw.id));
                        showToast('已拒绝', 'success');
                      } catch {
                        showToast('操作失败，请重试', 'error');
                      }
                    }}
                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass-card rounded-xl p-6" style={{ borderColor: 'var(--theme-border)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>快捷操作</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isMaintainer && (
            <button
              className="p-4 border-2 border-dashed rounded-xl hover:border-white/40 hover:bg-white/5 transition-all flex flex-col items-center gap-2"
              style={{ borderColor: 'var(--theme-border)' }}
            >
              <Plus className="w-8 h-8" style={{ color: 'var(--theme-text-secondary)' }} />
              <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>上传固件</span>
            </button>
          )}
          {isAdmin && (
            <>
              <button className="p-4 border-2 border-dashed rounded-xl hover:border-white/40 hover:bg-white/5 transition-all flex flex-col items-center gap-2" style={{ borderColor: 'var(--theme-border)' }}>
                <FolderTree className="w-8 h-8" style={{ color: 'var(--theme-text-secondary)' }} />
                <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>管理分类</span>
              </button>
              <button className="p-4 border-2 border-dashed rounded-xl hover:border-white/40 hover:bg-white/5 transition-all flex flex-col items-center gap-2" style={{ borderColor: 'var(--theme-border)' }}>
                <Tag className="w-8 h-8" style={{ color: 'var(--theme-text-secondary)' }} />
                <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>管理标签</span>
              </button>
              <button className="p-4 border-2 border-dashed rounded-xl hover:border-white/40 hover:bg-white/5 transition-all flex flex-col items-center gap-2" style={{ borderColor: 'var(--theme-border)' }}>
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