import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { useThemeStore } from '../hooks/useTheme';
import Dashboard from './admin/Dashboard';
import FirmwareManage from './admin/FirmwareManage';
import CategoryManage from './admin/CategoryManage';
import TagManage from './admin/TagManage';
import SiteSettings from './admin/SiteSettings';
import UserManage from './admin/UserManage';
import {
  User,
  Users,
  FolderTree,
  FileText,
  Settings,
  BarChart3,
  Download,
  Shield,
  Crown,
  Save,
  Tag,
  X
} from 'lucide-react';

type TabType = 'dashboard' | 'profile' | 'downloads' | 'firmware' | 'categories' | 'tags' | 'users' | 'settings';

export default function UserCenter() {
  const navigate = useNavigate();
const { user, isAuthReady, logout, config, categories, firmware, tags, addCategory, updateCategory, deleteCategory, addTag, updateTag, deleteTag, updateFirmware, deleteFirmware } = useAppStore();
  const { setTheme, currentTheme } = useThemeStore();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  useEffect(() => {
    if (isAuthReady && !user) {
      navigate('/login');
    }
  }, [user, isAuthReady, navigate]);

  if (!isAuthReady || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--theme-bg-base)' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p style={{ color: 'var(--theme-text-secondary)' }}>加载中...</p>
        </div>
      </div>
    );
  }

  const isAdmin = user.role === 'admin';
  const isMaintainer = user.role === 'maintainer' || isAdmin;

  const tabs = [
    { key: 'dashboard' as TabType, icon: BarChart3, label: '仪表盘', roles: ['maintainer', 'admin'] as const },
    { key: 'profile' as TabType, icon: User, label: '账户信息', roles: ['all'] as const },
    { key: 'downloads' as TabType, icon: Download, label: '下载记录', roles: ['all'] as const },
    { key: 'firmware' as TabType, icon: FileText, label: '固件管理', roles: ['maintainer', 'admin'] as const },
    { key: 'categories' as TabType, icon: FolderTree, label: '分类管理', roles: ['admin'] as const },
    { key: 'tags' as TabType, icon: Tag, label: '标签管理', roles: ['admin'] as const },
    { key: 'users' as TabType, icon: Users, label: '用户管理', roles: ['admin'] as const },
    { key: 'settings' as TabType, icon: Settings, label: '网站设置', roles: ['admin'] as const }
  ].filter(item => {
    if (item.roles.includes('all')) return true;
    if (isAdmin) return true;
    if (isMaintainer && item.roles.includes('maintainer')) return true;
    return false;
  });

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--theme-bg-base)' }}>
      <aside className="w-64 glass border-r flex flex-col" style={{ borderColor: 'var(--theme-border)' }}>
        <div className="p-6 border-b" style={{ borderColor: 'var(--theme-border)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center neon-border"
              style={{ background: 'var(--theme-gradient)' }}
            >
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold" style={{ color: 'var(--theme-text)' }}>SSD管理中心</h1>
              <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>控制面板</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-b" style={{ borderColor: 'var(--theme-border)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'var(--theme-gradient)' }}
            >
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate" style={{ color: 'var(--theme-text)' }}>{user.nickname}</p>
              <p className="text-xs flex items-center gap-1">
                {isAdmin ? (
                  <>
                    <Crown className="w-3 h-3 text-amber-400" />
                    <span className="text-amber-400">管理员</span>
                  </>
                ) : isMaintainer ? (
                  <>
                    <Shield className="w-3 h-3 text-blue-400" />
                    <span className="text-blue-400">维护者</span>
                  </>
                ) : (
                  <span style={{ color: 'var(--theme-text-secondary)' }}>普通用户</span>
                )}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {tabs.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key as TabType)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'text-white border-l-2'
                    : 'hover:text-white'
                }`}
                style={{
                  backgroundColor: isActive ? 'var(--theme-bg-hover)' : 'transparent',
                  color: isActive ? 'var(--theme-text)' : 'var(--theme-text-secondary)',
                  borderLeftColor: isActive ? 'var(--theme-primary-500)' : 'transparent'
                }}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: 'var(--theme-border)' }}>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
          >
            <X className="w-5 h-5" />
            <span className="font-medium">退出登录</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard isAdmin={isAdmin} isMaintainer={isMaintainer} user={user} />
          )}
          {activeTab === 'profile' && <Profile user={user} />}
          {activeTab === 'downloads' && <Downloads user={user} config={config} />}
          {activeTab === 'firmware' && isMaintainer && <FirmwareManage isAdmin={isAdmin} isMaintainer={isMaintainer} firmware={firmware} categories={categories} updateFirmware={updateFirmware} deleteFirmware={deleteFirmware} />}
          {activeTab === 'categories' && isAdmin && <CategoryManage categories={categories} addCategory={addCategory} updateCategory={updateCategory} deleteCategory={deleteCategory} />}
          {activeTab === 'tags' && isAdmin && <TagManage tags={tags} addTag={addTag} updateTag={updateTag} deleteTag={deleteTag} />}
          {activeTab === 'users' && isAdmin && <UserManage />}
          {activeTab === 'settings' && isAdmin && <SiteSettings setTheme={setTheme} currentTheme={currentTheme} />}
        </div>
      </main>
    </div>
  );
}

function Profile({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>账户信息</h2>

      <div className="glass-card rounded-xl p-6" style={{ borderColor: 'var(--theme-border)' }}>
        <div className="flex items-center gap-6 mb-6 pb-6 border-b" style={{ borderColor: 'var(--theme-border)' }}>
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ background: 'var(--theme-gradient)' }}
          >
            <User className="w-12 h-12 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold" style={{ color: 'var(--theme-text)' }}>{user.nickname}</h3>
            <p style={{ color: 'var(--theme-text-secondary)' }}>{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              {user.role === 'admin' && (
                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium flex items-center gap-1">
                  <Crown className="w-4 h-4" />
                  管理员
                </span>
              )}
              {user.role === 'maintainer' && (
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  维护者
                </span>
              )}
              {user.isPremium && (
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">
                  Premium 会员
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>昵称</label>
            <input
              type="text"
              defaultValue={user.nickname}
              className="w-full px-4 py-3 rounded-xl focus:outline-none"
              style={{
                backgroundColor: 'var(--theme-bg-card)',
                border: '1px solid var(--theme-border)',
                color: 'var(--theme-text)'
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>邮箱</label>
            <input
              type="email"
              defaultValue={user.email}
              disabled
              className="w-full px-4 py-3 rounded-xl cursor-not-allowed"
              style={{
                backgroundColor: 'var(--theme-bg-card)',
                border: '1px solid var(--theme-border)',
                color: 'var(--theme-text-secondary)'
              }}
            />
          </div>
        </div>

        <div className="mt-6 pt-6 border-t flex justify-end" style={{ borderColor: 'var(--theme-border)' }}>
          <button
            className="btn-primary px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            保存修改
          </button>
        </div>
      </div>
    </div>
  );
}

function Downloads({ user, config }: { user: any; config: any }) {
  const [downloadRecords, setDownloadRecords] = useState<any[]>([]);
  const [loadingDownloads, setLoadingDownloads] = useState(true);

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        const { donationAPI } = await import('../services/api');
        const res = await donationAPI.getUserDownloads();
        if (res.success) {
          setDownloadRecords(res.downloads);
        }
      } catch (err) {
        console.error('获取下载记录失败:', err);
      } finally {
        setLoadingDownloads(false);
      }
    };
    fetchDownloads();
  }, []);

  const usedCount = user.downloadsUsed || 0;
  const totalQuota = user.isPremium ? config.quotaSettings.premiumQuota : config.quotaSettings.freeQuota;
  const remainingQuota = Math.max(0, totalQuota - usedCount);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>下载记录</h2>

      <div className="glass-card rounded-xl p-6" style={{ borderColor: 'var(--theme-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--theme-text)' }}>本月下载额度</h3>
          {user.isPremium && (
            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">
              Premium 会员
            </span>
          )}
        </div>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span style={{ color: 'var(--theme-text-secondary)' }}>已使用</span>
            <span className="font-semibold" style={{ color: 'var(--theme-text)' }}>{usedCount} / {totalQuota}</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--theme-bg-card)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${totalQuota > 0 ? (usedCount / totalQuota) * 100 : 0}%`,
                background: 'var(--theme-gradient)'
              }}
            />
          </div>
        </div>
        <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
          剩余 <span className="font-semibold" style={{ color: 'var(--theme-primary-400)' }}>{remainingQuota}</span> 次下载额度
        </p>
      </div>

      <div className="glass-card rounded-xl" style={{ borderColor: 'var(--theme-border)' }}>
        <div className="p-6 border-b" style={{ borderColor: 'var(--theme-border)' }}>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--theme-text)' }}>下载历史</h3>
        </div>
        {loadingDownloads ? (
          <div className="p-12 text-center" style={{ color: 'var(--theme-text-secondary)' }}>
            <p>加载中...</p>
          </div>
        ) : downloadRecords.length > 0 ? (
          <div className="divide-y" style={{ borderColor: 'var(--theme-border)' }}>
            {downloadRecords.map(dl => (
              <div key={dl.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors" style={{ backgroundColor: 'var(--theme-bg-hover)' }}>
                <div className="flex items-center gap-4">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: 'var(--theme-primary-900)' }}
                  >
                    <FileText className="w-5 h-5" style={{ color: 'var(--theme-primary-400)' }} />
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--theme-text)' }}>{dl.firmwareTitle || '未知固件'}</p>
                    <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>{new Date(dl.createdAt).toLocaleDateString('zh-CN')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center" style={{ color: 'var(--theme-text-secondary)' }}>
            <Download className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--theme-bg-hover)' }} />
            <p>暂无下载记录</p>
          </div>
        )}
      </div>
    </div>
  );
}