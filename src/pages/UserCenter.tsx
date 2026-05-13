import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../store';
import { themes, useThemeStore } from '../hooks/useTheme';
import { adminAPI, uploadFirmwareAPI } from '../services/api';
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
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Save,
  Palette,
  Globe,
  Zap,
  X,
  Tag,
  ChevronDown,
  ChevronRight,
  UploadCloud
} from 'lucide-react';

type TabType = 'dashboard' | 'profile' | 'downloads' | 'firmware' | 'categories' | 'tags' | 'users' | 'settings';

export default function UserCenter() {
  const navigate = useNavigate();
  const { user, logout, config, categories, firmware, tags, addCategory, updateCategory, deleteCategory, addTag, updateTag, deleteTag, updateFirmware, deleteFirmware, updateSiteSettings, updateModuleSettings, updateQuotaSettings } = useAppStore();
  const { setTheme, currentTheme } = useThemeStore();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  if (!user) {
    navigate('/login');
    return null;
  }

  const isAdmin = user.role === 'admin';
  const isMaintainer = user.role === 'maintainer' || isAdmin;

  const menuItems = [
    { id: 'dashboard', icon: BarChart3, label: '仪表盘', roles: ['all'] },
    { id: 'profile', icon: User, label: '账户信息', roles: ['all'] },
    { id: 'downloads', icon: Download, label: '下载记录', roles: ['all'] },
    { id: 'firmware', icon: FileText, label: '固件管理', roles: ['maintainer', 'admin'] },
    { id: 'categories', icon: FolderTree, label: '分类管理', roles: ['admin'] },
    { id: 'tags', icon: Tag, label: '标签管理', roles: ['admin'] },
    { id: 'users', icon: Users, label: '用户管理', roles: ['admin'] },
    { id: 'settings', icon: Settings, label: '网站设置', roles: ['admin'] }
  ].filter(item => {
    if (item.roles.includes('all')) return true;
    if (isAdmin) return true;
    if (isMaintainer && item.roles.includes('maintainer')) return true;
    return false;
  });

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--theme-bg-base)' }}>
      {/* 左侧导航 */}
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
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
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

      {/* 右侧内容区 */}
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

// 仪表盘组件
function Dashboard({ isAdmin, isMaintainer, user }: { isAdmin: boolean; isMaintainer: boolean; user: any }) {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalFirmware: 0,
    totalDownloads: 0,
    totalDonations: 0,
    pendingFirmware: 0
  });
  const [loading, setLoading] = useState(true);
  const [pendingFirmware, setPendingFirmware] = useState<any[]>([]);

  // 从API获取仪表盘数据
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await adminAPI.getDashboard();
        if (response.success) {
          setDashboardData(response.dashboard);
        }

        // 获取待审核固件
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
                        alert('审核通过！');
                      } catch (error) {
                        alert('审核失败，请重试');
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
                        alert('已拒绝');
                      } catch (error) {
                        alert('操作失败，请重试');
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

// 账户信息组件
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

// 下载记录组件
function Downloads({ user, config }: { user: any; config: any }) {
  const remainingQuota = user.isPremium
    ? 100
    : Math.max(0, 5 - 2);
  
  const downloads = [
    { id: 1, title: 'SM2258XT 开卡工具 v1.2', date: '2024-01-15', size: '15 MB' },
    { id: 2, title: 'PS3111 量产工具 v2.5', date: '2024-01-14', size: '22 MB' }
  ];

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
            <span className="font-semibold" style={{ color: 'var(--theme-text)' }}>{2} / {user.isPremium ? 100 : 5}</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--theme-bg-card)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ 
                width: `${(2 / (user.isPremium ? 100 : 5)) * 100}%`,
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
        {downloads.length > 0 ? (
          <div className="divide-y" style={{ borderColor: 'var(--theme-border)' }}>
            {downloads.map(dl => (
              <div key={dl.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors" style={{ backgroundColor: 'var(--theme-bg-hover)' }}>
                <div className="flex items-center gap-4">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: 'var(--theme-primary-900)' }}
                  >
                    <FileText className="w-5 h-5" style={{ color: 'var(--theme-primary-400)' }} />
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--theme-text)' }}>{dl.title}</p>
                    <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>{dl.date} · {dl.size}</p>
                  </div>
                </div>
                <button 
                  className="px-4 py-2 rounded-lg transition-colors"
                  style={{ 
                    color: 'var(--theme-primary-400)',
                    backgroundColor: 'var(--theme-primary-900)'
                  }}
                >
                  重新下载
                </button>
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

// 固件管理组件
function FirmwareManage({ isAdmin, isMaintainer, firmware: storeFirmware, categories, updateFirmware, deleteFirmware }: { isAdmin: boolean; isMaintainer: boolean; firmware: any[]; categories: any[]; updateFirmware: (id: string, data: any) => void; deleteFirmware: (id: string) => void }) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    version: '1.0',
    categoryId: '',
    isPaid: false,
    price: 0
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [firmwareList, setFirmwareList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // 从API获取固件列表
  useEffect(() => {
    const fetchFirmware = async () => {
      try {
        const response = await adminAPI.getFirmware();
        if (response.success) {
          setFirmwareList(response.firmware);
        }
      } catch (error) {
        console.error('获取固件列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin || isMaintainer) {
      fetchFirmware();
    }
  }, [isAdmin, refreshKey]);

  // 使用API数据或store数据
  const displayFirmware = firmwareList.length > 0 ? firmwareList : storeFirmware;

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'approved': return 'bg-green-500/20 text-green-400';
      case 'pending': return 'bg-amber-500/20 text-amber-400';
      case 'rejected': return 'bg-red-500/20 text-red-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'approved': return '已通过';
      case 'pending': return '待审核';
      case 'rejected': return '已拒绝';
      default: return status;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmitUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('请选择要上传的固件文件');
      return;
    }
    if (!uploadForm.title || !uploadForm.categoryId) {
      alert('请填写完整的固件信息');
      return;
    }
    
    setUploading(true);
    try {
      // 创建FormData对象
      const formData = new FormData();
      formData.append('firmwareFile', selectedFile);
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('version', uploadForm.version);
      formData.append('categoryId', uploadForm.categoryId);
      formData.append('isPaid', String(uploadForm.isPaid));
      formData.append('price', String(uploadForm.price));

      // 调用API上传
      await uploadFirmwareAPI.upload(formData);
      
      alert('固件上传成功，等待审核');
      setShowUploadModal(false);
      setUploadForm({
        title: '',
        description: '',
        version: '1.0',
        categoryId: '',
        isPaid: false,
        price: 0
      });
      setSelectedFile(null);

      // 刷新固件列表
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('上传固件失败:', error);
      alert('上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>固件管理</h2>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="btn-primary px-4 py-3 rounded-xl text-white font-semibold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          上传固件
        </button>
      </div>

      <div className="glass-card rounded-xl overflow-hidden" style={{ borderColor: 'var(--theme-border)' }}>
        {loading ? (
          <div className="p-12 text-center" style={{ color: 'var(--theme-text-secondary)' }}>
            <p>加载中...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--theme-bg-card)' }}>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text-secondary)' }}>固件名称</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text-secondary)' }}>分类</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text-secondary)' }}>状态</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text-secondary)' }}>下载次数</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text-secondary)' }}>操作</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--theme-border)' }}>
                {displayFirmware.map(fw => (
                  <tr key={fw.id} className="hover:bg-white/5 transition-colors" style={{ backgroundColor: 'var(--theme-bg-hover)' }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5" style={{ color: 'var(--theme-text-secondary)' }} />
                        <span className="font-medium" style={{ color: 'var(--theme-text)' }}>{fw.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4" style={{ color: 'var(--theme-text-secondary)' }}>{fw.categoryName || categories.find(c => c.id === fw.categoryId)?.name || '未知分类'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(fw.status)}`}>
                        {getStatusLabel(fw.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4" style={{ color: 'var(--theme-text-secondary)' }}>{fw.downloadCount}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        {fw.status === 'pending' && isAdmin && (
                          <>
                            <button 
                              onClick={async () => {
                                try {
                                  await adminAPI.updateFirmwareStatus(fw.id, 'approved');
                                  setFirmwareList(prev => prev.map(f => f.id === fw.id ? { ...f, status: 'approved' } : f));
                                  alert('审核通过！');
                                } catch (error) {
                                  alert('审核失败，请重试');
                                }
                              }}
                              className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={async () => {
                                try {
                                  await adminAPI.updateFirmwareStatus(fw.id, 'rejected');
                                  setFirmwareList(prev => prev.map(f => f.id === fw.id ? { ...f, status: 'rejected' } : f));
                                  alert('已拒绝');
                                } catch (error) {
                                  alert('操作失败，请重试');
                                }
                              }}
                              className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={async () => {
                            if (confirm('确定要删除这个固件吗？')) {
                              try {
                                await adminAPI.deleteFirmware(fw.id);
                                setFirmwareList(prev => prev.filter(f => f.id !== fw.id));
                                alert('固件已删除');
                              } catch (error) {
                                alert('删除失败，请重试');
                              }
                            }
                          }}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 上传固件模态框 */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{ borderColor: 'var(--theme-border)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{ color: 'var(--theme-text)' }}>上传固件</h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="hover:text-white transition-colors"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitUpload} className="space-y-4">
              {/* 固件标题 */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>
                  固件标题 *
                </label>
                <input
                  type="text"
                  required
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="例如：SM2258XT 开卡工具 v1.0"
                  className="w-full px-4 py-3 rounded-xl focus:outline-none"
                  style={{
                    backgroundColor: 'var(--theme-bg-card)',
                    border: '1px solid var(--theme-border)',
                    color: 'var(--theme-text)'
                  }}
                />
              </div>

              {/* 分类选择 */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>
                  分类 *
                </label>
                <select
                  required
                  value={uploadForm.categoryId}
                  onChange={(e) => setUploadForm({ ...uploadForm, categoryId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none"
                  style={{
                    backgroundColor: 'var(--theme-bg-card)',
                    border: '1px solid var(--theme-border)',
                    color: 'var(--theme-text)'
                  }}
                >
                  <option value="">请选择分类</option>
                  {categories.filter(c => !c.parentId).map(cat => (
                    <optgroup key={cat.id} label={cat.name}>
                      <option value={cat.id}>{cat.name}</option>
                      {categories.filter(c => c.parentId === cat.id).map(subCat => (
                        <option key={subCat.id} value={subCat.id}>
                          └ {subCat.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* 固件版本 */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>
                  版本号
                </label>
                <input
                  type="text"
                  value={uploadForm.version}
                  onChange={(e) => setUploadForm({ ...uploadForm, version: e.target.value })}
                  placeholder="例如：1.0"
                  className="w-full px-4 py-3 rounded-xl focus:outline-none"
                  style={{
                    backgroundColor: 'var(--theme-bg-card)',
                    border: '1px solid var(--theme-border)',
                    color: 'var(--theme-text)'
                  }}
                />
              </div>

              {/* 固件描述 */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>
                  固件描述
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="请输入固件的详细描述..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none resize-none"
                  style={{
                    backgroundColor: 'var(--theme-bg-card)',
                    border: '1px solid var(--theme-border)',
                    color: 'var(--theme-text)'
                  }}
                />
              </div>

              {/* 文件上传 */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>
                  固件文件 *
                </label>
                <div 
                  className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all hover:border-opacity-70"
                  style={{ borderColor: 'var(--theme-border)' }}
                  onClick={() => document.getElementById('firmwareFile')?.click()}
                >
                  <input
                    id="firmwareFile"
                    type="file"
                    required
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".zip,.rar,.7z,.exe,.iso,.bin"
                  />
                  {selectedFile ? (
                    <div>
                      <FileText className="w-12 h-12 mx-auto mb-2" style={{ color: 'var(--theme-primary-400)' }} />
                      <p style={{ color: 'var(--theme-text)' }}>{selectedFile.name}</p>
                      <p style={{ color: 'var(--theme-text-secondary)' }} className="text-sm">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <UploadCloud className="w-12 h-12 mx-auto mb-2" style={{ color: 'var(--theme-text-secondary)' }} />
                      <p style={{ color: 'var(--theme-text-secondary)' }}>点击选择文件或拖拽到此处</p>
                      <p style={{ color: 'var(--theme-text-secondary)' }} className="text-sm mt-1">
                        支持 .zip, .rar, .7z, .exe, .iso, .bin 格式
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 高级收费固件选项 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    id="isPaid"
                    type="checkbox"
                    checked={uploadForm.isPaid}
                    onChange={(e) => setUploadForm({ ...uploadForm, isPaid: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isPaid" className="text-sm font-medium" style={{ color: 'var(--theme-text)' }}>
                    高级收费固件
                  </label>
                </div>

                {uploadForm.isPaid && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>
                      价格（元）
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={uploadForm.price}
                      onChange={(e) => setUploadForm({ ...uploadForm, price: parseFloat(e.target.value) || 0 })}
                      placeholder="例如：9.99"
                      className="w-full px-4 py-3 rounded-xl focus:outline-none"
                      style={{
                        backgroundColor: 'var(--theme-bg-card)',
                        border: '1px solid var(--theme-border)',
                        color: 'var(--theme-text)'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* 提交按钮 */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-3 border rounded-xl hover:bg-white/10 transition-colors"
                  style={{
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text-secondary)'
                  }}
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn-primary flex-1 px-4 py-3 rounded-xl text-white font-semibold disabled:opacity-50"
                >
                  {uploading ? '上传中...' : '上传固件'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// 分类管理组件
function CategoryManage({ categories, addCategory, updateCategory, deleteCategory }: { categories: any[]; addCategory: (data: any) => void; updateCategory: (id: string, data: any) => void; deleteCategory: (id: string) => void }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(categories.map(c => c.id));
  const [newCategory, setNewCategory] = useState({ name: '', parentId: null as string | null, orderIndex: 0, icon: '', description: '' });

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleAddCategory = () => {
    addCategory(newCategory);
    setShowAddModal(false);
    setNewCategory({ name: '', parentId: null, orderIndex: 0, icon: '', description: '' });
  };

  // 将扁平化数据转换为树形结构用于显示
  const buildTree = (flatCategories: any[]) => {
    const topLevel = flatCategories.filter(c => !c.parentId);
    const getChildren = (parentId: string) => flatCategories.filter(c => c.parentId === parentId);
    
    return topLevel.map(cat => ({
      ...cat,
      children: getChildren(cat.id)
    }));
  };

  const treeCategories = buildTree(categories);

  const renderCategoryItem = (cat: any, level: number = 0) => {
    const hasChildren = cat.children && cat.children.length > 0;
    const isExpanded = expandedCategories.includes(cat.id);

    return (
      <div key={cat.id}>
        <div 
          className="border rounded-xl overflow-hidden mb-2"
          style={{ 
            borderColor: 'var(--theme-border)',
            marginLeft: level * 20
          }}
        >
          <div className="p-4 flex items-center justify-between" style={{ backgroundColor: 'var(--theme-bg-card)' }}>
            <div className="flex items-center gap-3">
              <button onClick={() => toggleCategory(cat.id)} className="p-1 hover:bg-white/10 rounded">
                {hasChildren ? (
                  isExpanded ? 
                    <ChevronDown className="w-5 h-5" style={{ color: 'var(--theme-text-secondary)' }} /> : 
                    <ChevronRight className="w-5 h-5" style={{ color: 'var(--theme-text-secondary)' }} />
                ) : (
                  <FolderTree className="w-5 h-5" style={{ color: 'var(--theme-primary-400)' }} />
                )}
              </button>
              <span className="font-semibold" style={{ color: 'var(--theme-text)' }}>{cat.name}</span>
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors" style={{ color: 'var(--theme-text-secondary)' }}>
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => deleteCategory(cat.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          {hasChildren && isExpanded && (
            <div className="border-t" style={{ borderColor: 'var(--theme-border)' }}>
              {cat.children.map((child: any) => renderCategoryItem(child, level + 1))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>分类管理</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary px-4 py-3 rounded-xl text-white font-semibold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          添加分类
        </button>
      </div>

      <div className="glass-card rounded-xl p-6" style={{ borderColor: 'var(--theme-border)' }}>
        <div className="space-y-4">
          {treeCategories.map(cat => renderCategoryItem(cat))}
          {treeCategories.length === 0 && (
            <div className="text-center py-8" style={{ color: 'var(--theme-text-secondary)' }}>
              暂无分类，点击上方按钮添加
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-xl p-6 w-full max-w-md"
            style={{ borderColor: 'var(--theme-border)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--theme-text)' }}>添加分类</h3>
              <button onClick={() => setShowAddModal(false)} className="hover:text-white" style={{ color: 'var(--theme-text-secondary)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>分类名称</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="例如：慧荣 SM2258XT"
                  className="w-full px-4 py-3 rounded-xl focus:outline-none"
                  style={{ 
                    backgroundColor: 'var(--theme-bg-card)',
                    border: '1px solid var(--theme-border)',
                    color: 'var(--theme-text)'
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>上级分类</label>
                <select 
                  value={newCategory.parentId || ''}
                  onChange={(e) => setNewCategory({ ...newCategory, parentId: e.target.value || null })}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none"
                  style={{ 
                    backgroundColor: 'var(--theme-bg-card)',
                    border: '1px solid var(--theme-border)',
                    color: 'var(--theme-text)'
                  }}
                >
                  <option value="">无（作为一级分类）</option>
                  {categories.filter(c => !c.parentId).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>排序</label>
                <input
                  type="number"
                  value={newCategory.orderIndex}
                  onChange={(e) => setNewCategory({ ...newCategory, orderIndex: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none"
                  style={{ 
                    backgroundColor: 'var(--theme-bg-card)',
                    border: '1px solid var(--theme-border)',
                    color: 'var(--theme-text)'
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>描述</label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="分类描述"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none"
                  style={{ 
                    backgroundColor: 'var(--theme-bg-card)',
                    border: '1px solid var(--theme-border)',
                    color: 'var(--theme-text)'
                  }}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 border rounded-xl hover:bg-white/10 transition-colors"
                style={{ 
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text-secondary)'
                }}
              >
                取消
              </button>
              <button onClick={handleAddCategory} className="btn-primary flex-1 px-4 py-3 rounded-xl text-white font-semibold">
                添加
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// 标签管理组件
function TagManage({ tags, addTag, updateTag, deleteTag }: { tags: any[]; addTag: (data: any) => void; updateTag: (id: string, data: any) => void; deleteTag: (id: string) => void }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTag, setNewTag] = useState({ name: '', slug: '', category: '', color: '', description: '' });

  const handleAddTag = () => {
    addTag(newTag);
    setShowAddModal(false);
    setNewTag({ name: '', slug: '', category: '', color: '', description: '' });
  };

  // 按分类分组标签
  const tagsByCategory = tags.reduce((acc, tag) => {
    if (!acc[tag.category]) {
      acc[tag.category] = [];
    }
    acc[tag.category].push(tag);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>标签管理</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary px-4 py-3 rounded-xl text-white font-semibold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          添加标签
        </button>
      </div>

      <div className="space-y-6">
        {Object.entries(tagsByCategory).map(([category, categoryTags]) => (
          <div key={category} className="glass-card rounded-xl p-6" style={{ borderColor: 'var(--theme-border)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>{category}</h3>
            <div className="flex flex-wrap gap-3">
              {(categoryTags as any[]).map(tag => (
                <div key={tag.id} className="flex items-center gap-2 px-4 py-2 rounded-full border" style={{ 
                  backgroundColor: tag.color ? `${tag.color}20` : 'var(--theme-bg-card)',
                  borderColor: 'var(--theme-border)'
                }}>
                  {tag.color && <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />}
                  <span style={{ color: tag.color || 'var(--theme-text)' }}>{tag.name}</span>
                  <button onClick={() => deleteTag(tag.id)} className="p-1 hover:bg-white/10 rounded-full">
                    <X className="w-3 h-3" style={{ color: 'var(--theme-text-secondary)' }} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-xl p-6 w-full max-w-md"
            style={{ borderColor: 'var(--theme-border)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--theme-text)' }}>添加标签</h3>
              <button onClick={() => setShowAddModal(false)} className="hover:text-white" style={{ color: 'var(--theme-text-secondary)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>标签名称</label>
                <input
                  type="text"
                  value={newTag.name}
                  onChange={(e) => setNewTag({ ...newTag, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="例如：TLC"
                  className="w-full px-4 py-3 rounded-xl focus:outline-none"
                  style={{ 
                    backgroundColor: 'var(--theme-bg-card)',
                    border: '1px solid var(--theme-border)',
                    color: 'var(--theme-text)'
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>标签分类</label>
                <select 
                  value={newTag.category}
                  onChange={(e) => setNewTag({ ...newTag, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none"
                  style={{ 
                    backgroundColor: 'var(--theme-bg-card)',
                    border: '1px solid var(--theme-border)',
                    color: 'var(--theme-text)'
                  }}
                >
                  <option value="">选择分类</option>
                  <option value="颗粒类型">颗粒类型</option>
                  <option value="颗粒制程">颗粒制程</option>
                  <option value="固件年份">固件年份</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>标签颜色</label>
                <input
                  type="color"
                  value={newTag.color || '#3b82f6'}
                  onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                  className="w-full h-10 rounded-xl cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>描述</label>
                <textarea
                  value={newTag.description}
                  onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
                  placeholder="标签描述"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none"
                  style={{ 
                    backgroundColor: 'var(--theme-bg-card)',
                    border: '1px solid var(--theme-border)',
                    color: 'var(--theme-text)'
                  }}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 border rounded-xl hover:bg-white/10 transition-colors"
                style={{ 
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text-secondary)'
                }}
              >
                取消
              </button>
              <button onClick={handleAddTag} className="btn-primary flex-1 px-4 py-3 rounded-xl text-white font-semibold">
                添加
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// 用户管理组件
function UserManage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 从API获取用户列表
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await adminAPI.getUsers();
        if (response.success) {
          setUsers(response.users);
        }
      } catch (error) {
        console.error('获取用户列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const getRoleStyle = (role: string) => {
    switch(role) {
      case 'admin': return 'bg-amber-500/20 text-amber-400';
      case 'maintainer': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  // 删除用户
  const handleDeleteUser = async (userId: string) => {
    if (confirm('确定要删除这个用户吗？')) {
      try {
        await adminAPI.deleteUser(userId);
        setUsers(users.filter(u => u.id !== userId));
        alert('用户已删除');
      } catch (error) {
        alert('删除失败，请重试');
      }
    }
  };

  // 更新用户角色
  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      alert('更新角色失败，请重试');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>用户管理</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="搜索用户..."
            className="pl-10 pr-4 py-3 rounded-xl focus:outline-none"
            style={{ 
              backgroundColor: 'var(--theme-bg-card)',
              border: '1px solid var(--theme-border)',
              color: 'var(--theme-text)'
            }}
          />
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden" style={{ borderColor: 'var(--theme-border)' }}>
        {loading ? (
          <div className="p-12 text-center" style={{ color: 'var(--theme-text-secondary)' }}>
            <p>加载中...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--theme-bg-card)' }}>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text-secondary)' }}>用户</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text-secondary)' }}>角色</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text-secondary)' }}>下载次数</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text-secondary)' }}>会员状态</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text-secondary)' }}>操作</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--theme-border)' }}>
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors" style={{ backgroundColor: 'var(--theme-bg-hover)' }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ background: 'var(--theme-gradient)' }}
                        >
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: 'var(--theme-text)' }}>{u.nickname}</p>
                          <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${getRoleStyle(u.role)}`}
                      >
                        <option value="admin">管理员</option>
                        <option value="maintainer">维护者</option>
                        <option value="user">普通用户</option>
                      </select>
                    </td>
                    <td className="px-6 py-4" style={{ color: 'var(--theme-text-secondary)' }}>{u.downloadsUsed}</td>
                    <td className="px-6 py-4">
                      {u.isPremium ? (
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                          Premium
                        </span>
                      ) : (
                        <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>普通</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {u.role !== 'admin' && (
                        <button 
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// 网站设置组件
function SiteSettings({ setTheme, currentTheme }: { setTheme: (themeId: string) => void; currentTheme: string }) {
  const { config, updateSiteSettings, updateHomeModule, updateModuleOrder, updateAdSlot, addAdSlot, deleteAdSlot, updateModuleSettings, updateQuotaSettings } = useAppStore();
  const [activeSection, setActiveSection] = useState<'basic' | 'modules' | 'ads' | 'homeText' | 'quota' | 'theme'>('basic');

  const sections = [
    { id: 'basic', icon: Globe, label: '基本设置' },
    { id: 'modules', icon: Zap, label: '模块管理' },
    { id: 'ads', icon: Settings, label: '广告位管理' },
    { id: 'homeText', icon: FileText, label: '首页文本' },
    { id: 'quota', icon: Users, label: '下载配额' },
    { id: 'theme', icon: Palette, label: '主题配色' }
  ];

  // 拖拽排序状态
  const [draggedModuleId, setDraggedModuleId] = useState<string | null>(null);

  const sortedModules = [...config.homeModules].sort((a, b) => a.order - b.order);

  const handleDragStart = (id: string) => {
    setDraggedModuleId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (!draggedModuleId || draggedModuleId === targetId) return;

    const updatedModules = [...sortedModules];
    const draggedIndex = updatedModules.findIndex(m => m.id === draggedModuleId);
    const targetIndex = updatedModules.findIndex(m => m.id === targetId);
    
    const [draggedModule] = updatedModules.splice(draggedIndex, 1);
    updatedModules.splice(targetIndex, 0, draggedModule);

    // 更新顺序
    updatedModules.forEach((module, index) => {
      updateHomeModule(module.id, { order: index + 1 });
    });
    
    updateModuleOrder(updatedModules.map(m => m.id));
    setDraggedModuleId(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>网站设置</h2>

      <div className="glass-card rounded-xl overflow-hidden" style={{ borderColor: 'var(--theme-border)' }}>
        <div className="grid md:grid-cols-4 divide-x" style={{ borderColor: 'var(--theme-border)' }}>
          <div className="p-4 space-y-1">
            {sections.map(section => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'text-white'
                      : 'hover:text-white'
                  }`}
                  style={{ 
                    backgroundColor: isActive ? 'var(--theme-bg-hover)' : 'transparent',
                    color: isActive ? 'var(--theme-text)' : 'var(--theme-text-secondary)'
                  }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{section.label}</span>
                </button>
              );
            })}
          </div>

          <div className="md:col-span-3 p-6">
            {activeSection === 'basic' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>网站名称</label>
                  <input
                    type="text"
                    value={config.siteSettings.name}
                    onChange={(e) => updateSiteSettings({ name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none"
                    style={{ 
                      backgroundColor: 'var(--theme-bg-card)',
                      border: '1px solid var(--theme-border)',
                      color: 'var(--theme-text)'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>网站描述</label>
                  <textarea
                    value={config.siteSettings.description}
                    onChange={(e) => updateSiteSettings({ description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none"
                    style={{ 
                      backgroundColor: 'var(--theme-bg-card)',
                      border: '1px solid var(--theme-border)',
                      color: 'var(--theme-text)'
                    }}
                  />
                </div>
              </div>
            )}

            {activeSection === 'modules' && (
              <div className="space-y-4">
                <p className="text-sm mb-4" style={{ color: 'var(--theme-text-secondary)' }}>拖拽排序模块，启用/禁用模块</p>
                {sortedModules.map((module) => (
                  <div
                    key={module.id}
                    draggable
                    onDragStart={() => handleDragStart(module.id)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(module.id)}
                    className={`p-4 border rounded-xl hover:bg-white/5 transition-colors ${
                      draggedModuleId === module.id ? 'opacity-50' : ''
                    }`}
                    style={{ 
                      borderColor: 'var(--theme-border)', 
                      backgroundColor: 'var(--theme-bg-hover)',
                      cursor: 'move'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-gray-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="9" cy="6" r="1" />
                            <circle cx="15" cy="6" r="1" />
                            <circle cx="9" cy="12" r="1" />
                            <circle cx="15" cy="12" r="1" />
                            <circle cx="9" cy="18" r="1" />
                            <circle cx="15" cy="18" r="1" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: 'var(--theme-text)' }}>{module.name}</p>
                          {module.title && (
                            <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>{module.title}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={module.enabled} 
                            onChange={(e) => updateHomeModule(module.id, { enabled: e.target.checked })}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" style={{ backgroundColor: 'var(--theme-bg-card)' }}></div>
                        </label>
                      </div>
                    </div>
                    {(module.id === 'hot' || module.id === 'latest' || module.id === 'donations' || module.id === 'contributors') && (
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--theme-text-secondary)' }}>自定义标题</label>
                          <input
                            type="text"
                            value={module.title}
                            onChange={(e) => updateHomeModule(module.id, { title: e.target.value })}
                            placeholder="标题"
                            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                            style={{ 
                              backgroundColor: 'var(--theme-bg-card)',
                              border: '1px solid var(--theme-border)',
                              color: 'var(--theme-text)'
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--theme-text-secondary)' }}>自定义描述</label>
                          <input
                            type="text"
                            value={module.description}
                            onChange={(e) => updateHomeModule(module.id, { description: e.target.value })}
                            placeholder="描述"
                            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                            style={{ 
                              backgroundColor: 'var(--theme-bg-card)',
                              border: '1px solid var(--theme-border)',
                              color: 'var(--theme-text)'
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'ads' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>管理广告位内容和位置</p>
                  <button 
                    onClick={() => addAdSlot({ name: '新广告位', enabled: false, content: '', position: 'custom' })}
                    className="btn-primary px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    添加广告位
                  </button>
                </div>
                {config.adSlots.map((slot) => (
                  <div key={slot.id} className="p-4 border rounded-xl hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-hover)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium" style={{ color: 'var(--theme-text)' }}>{slot.name}</p>
                        <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>位置: {slot.position}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={slot.enabled} 
                            onChange={(e) => updateAdSlot(slot.id, { enabled: e.target.checked })}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" style={{ backgroundColor: 'var(--theme-bg-card)' }}></div>
                        </label>
                        <button onClick={() => deleteAdSlot(slot.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--theme-text-secondary)' }}>广告名称</label>
                        <input
                          type="text"
                          value={slot.name}
                          onChange={(e) => updateAdSlot(slot.id, { name: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                          style={{ 
                            backgroundColor: 'var(--theme-bg-card)',
                            border: '1px solid var(--theme-border)',
                            color: 'var(--theme-text)'
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--theme-text-secondary)' }}>位置</label>
                        <input
                          type="text"
                          value={slot.position}
                          onChange={(e) => updateAdSlot(slot.id, { position: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                          style={{ 
                            backgroundColor: 'var(--theme-bg-card)',
                            border: '1px solid var(--theme-border)',
                            color: 'var(--theme-text)'
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--theme-text-secondary)' }}>广告内容</label>
                        <textarea
                          value={slot.content}
                          onChange={(e) => updateAdSlot(slot.id, { content: e.target.value })}
                          rows={3}
                          placeholder="支持 HTML 内容"
                          className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                          style={{ 
                            backgroundColor: 'var(--theme-bg-card)',
                            border: '1px solid var(--theme-border)',
                            color: 'var(--theme-text)'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'homeText' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>首页标题</label>
                  <input
                    type="text"
                    value={config.siteSettings.name}
                    onChange={(e) => updateSiteSettings({ name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none"
                    style={{ 
                      backgroundColor: 'var(--theme-bg-card)',
                      border: '1px solid var(--theme-border)',
                      color: 'var(--theme-text)'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>首页副标题</label>
                  <textarea
                    value={config.siteSettings.description}
                    onChange={(e) => updateSiteSettings({ description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none"
                    style={{ 
                      backgroundColor: 'var(--theme-bg-card)',
                      border: '1px solid var(--theme-border)',
                      color: 'var(--theme-text)'
                    }}
                  />
                </div>
              </div>
            )}

            {activeSection === 'quota' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>免费用户每月下载次数</label>
                  <input
                    type="number"
                    value={config.quotaSettings.freeQuota}
                    onChange={(e) => updateQuotaSettings({ freeQuota: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none"
                    style={{ 
                      backgroundColor: 'var(--theme-bg-card)',
                      border: '1px solid var(--theme-border)',
                      color: 'var(--theme-text)'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>Premium 用户每月下载次数</label>
                  <input
                    type="number"
                    value={config.quotaSettings.premiumQuota}
                    onChange={(e) => updateQuotaSettings({ premiumQuota: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none"
                    style={{ 
                      backgroundColor: 'var(--theme-bg-card)',
                      border: '1px solid var(--theme-border)',
                      color: 'var(--theme-text)'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>Premium 价格</label>
                  <input
                    type="number"
                    value={config.quotaSettings.premiumPrice}
                    onChange={(e) => updateQuotaSettings({ premiumPrice: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none"
                    style={{ 
                      backgroundColor: 'var(--theme-bg-card)',
                      border: '1px solid var(--theme-border)',
                      color: 'var(--theme-text)'
                    }}
                  />
                </div>
              </div>
            )}

            {activeSection === 'theme' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-4" style={{ color: 'var(--theme-text-secondary)' }}>选择主题</label>
                  <div className="grid grid-cols-4 gap-4">
                    {themes.map((theme) => {
                      const isActive = currentTheme === theme.id;
                      return (
                        <div key={theme.id} className="text-center cursor-pointer" onClick={() => setTheme(theme.id)}>
                          <div 
                            className="w-full aspect-square rounded-xl shadow-lg hover:scale-105 transition-transform border-2 flex items-center justify-center"
                            style={{ 
                              background: theme.gradient,
                              borderColor: isActive ? theme.primary[500] : 'transparent'
                            }}
                          >
                            {isActive && <CheckCircle className="w-6 h-6 text-white drop-shadow-lg" />}
                          </div>
                          <p className="text-xs mt-2" style={{ color: 'var(--theme-text-secondary)' }}>{theme.name}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
