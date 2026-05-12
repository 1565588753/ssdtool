import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../store';
import { themes } from '../hooks/useTheme';
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
  X
} from 'lucide-react';

type TabType = 'dashboard' | 'profile' | 'downloads' | 'firmware' | 'categories' | 'users' | 'settings';

export default function UserCenter() {
  const navigate = useNavigate();
  const { user, logout, config } = useAppStore();
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
    { id: 'users', icon: Users, label: '用户管理', roles: ['admin'] },
    { id: 'settings', icon: Settings, label: '网站设置', roles: ['admin'] }
  ].filter(item => {
    if (item.roles.includes('all')) return true;
    if (isAdmin) return true;
    if (isMaintainer && item.roles.includes('maintainer')) return true;
    return false;
  });

  return (
    <div className="min-h-screen gradient-bg flex">
      {/* 左侧导航 */}
      <aside className="w-64 glass border-r border-white/10 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--theme-gradient)' }}
            >
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">SSD管理中心</h1>
              <p className="text-xs text-slate-400">控制面板</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'var(--theme-gradient)' }}
            >
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate">{user.nickname}</p>
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
                  <span className="text-slate-400">普通用户</span>
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
                    ? 'bg-white/10 text-white border-l-2'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                style={{ borderLeftColor: isActive ? 'var(--theme-primary-500)' : 'transparent' }}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
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
          {activeTab === 'firmware' && isMaintainer && <FirmwareManage isAdmin={isAdmin} />}
          {activeTab === 'categories' && isAdmin && <CategoryManage />}
          {activeTab === 'users' && isAdmin && <UserManage />}
          {activeTab === 'settings' && isAdmin && <SiteSettings />}
        </div>
      </main>
    </div>
  );
}

// 仪表盘组件
function Dashboard({ isAdmin, isMaintainer, user }: { isAdmin: boolean; isMaintainer: boolean; user: any }) {
  const stats = [
    { label: '总用户数', value: '156', icon: Users },
    { label: '固件总数', value: '89', icon: FileText },
    { label: '下载次数', value: '2,458', icon: Download },
    { label: '捐赠总额', value: '¥1,280', icon: Zap }
  ];

  const pendingFirmware = [
    { id: 1, title: 'SM2258XT 新版工具', author: '张三', date: '2024-01-15' },
    { id: 2, title: 'PS3111 量产工具 v2.1', author: '李四', date: '2024-01-14' }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">仪表盘</h2>

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
            >
              <div className="flex items-center justify-between mb-4">
                <div 
                  className="p-3 rounded-xl"
                  style={{ background: 'var(--theme-gradient)' }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-slate-400 text-sm">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {isMaintainer && pendingFirmware.length > 0 && (
        <div className="glass-card rounded-xl">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-amber-400" />
              待审核固件
            </h3>
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium">
              {pendingFirmware.length} 个待审核
            </span>
          </div>
          <div className="divide-y divide-white/10">
            {pendingFirmware.map(fw => (
              <div key={fw.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div>
                  <p className="font-medium text-white">{fw.title}</p>
                  <p className="text-sm text-slate-400">由 {fw.author} 上传 · {fw.date}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors">
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">快捷操作</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isMaintainer && (
            <button 
              className="p-4 border-2 border-dashed border-white/20 rounded-xl hover:border-white/40 hover:bg-white/5 transition-all flex flex-col items-center gap-2"
            >
              <Plus className="w-8 h-8 text-slate-400" />
              <span className="text-sm text-slate-400">上传固件</span>
            </button>
          )}
          {isAdmin && (
            <>
              <button className="p-4 border-2 border-dashed border-white/20 rounded-xl hover:border-white/40 hover:bg-white/5 transition-all flex flex-col items-center gap-2">
                <FolderTree className="w-8 h-8 text-slate-400" />
                <span className="text-sm text-slate-400">管理分类</span>
              </button>
              <button className="p-4 border-2 border-dashed border-white/20 rounded-xl hover:border-white/40 hover:bg-white/5 transition-all flex flex-col items-center gap-2">
                <Users className="w-8 h-8 text-slate-400" />
                <span className="text-sm text-slate-400">管理用户</span>
              </button>
              <button className="p-4 border-2 border-dashed border-white/20 rounded-xl hover:border-white/40 hover:bg-white/5 transition-all flex flex-col items-center gap-2">
                <Settings className="w-8 h-8 text-slate-400" />
                <span className="text-sm text-slate-400">网站设置</span>
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
      <h2 className="text-2xl font-bold text-white">账户信息</h2>

      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-6 mb-6 pb-6 border-b border-white/10">
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ background: 'var(--theme-gradient)' }}
          >
            <User className="w-12 h-12 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">{user.nickname}</h3>
            <p className="text-slate-400">{user.email}</p>
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
            <label className="block text-sm font-medium text-slate-400 mb-2">昵称</label>
            <input
              type="text"
              defaultValue={user.nickname}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-white/30 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">邮箱</label>
            <input
              type="email"
              defaultValue={user.email}
              disabled
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10 flex justify-end">
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
      <h2 className="text-2xl font-bold text-white">下载记录</h2>

      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">本月下载额度</h3>
          {user.isPremium && (
            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">
              Premium 会员
            </span>
          )}
        </div>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">已使用</span>
            <span className="font-semibold text-white">{2} / {user.isPremium ? 100 : 5}</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ 
                width: `${(2 / (user.isPremium ? 100 : 5)) * 100}%`,
                background: 'var(--theme-gradient)'
              }}
            />
          </div>
        </div>
        <p className="text-sm text-slate-400">
          剩余 <span className="font-semibold" style={{ color: 'var(--theme-primary-400)' }}>{remainingQuota}</span> 次下载额度
        </p>
      </div>

      <div className="glass-card rounded-xl">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">下载历史</h3>
        </div>
        {downloads.length > 0 ? (
          <div className="divide-y divide-white/10">
            {downloads.map(dl => (
              <div key={dl.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ background: 'var(--theme-primary-900)' }}
                  >
                    <FileText className="w-5 h-5" style={{ color: 'var(--theme-primary-400)' }} />
                  </div>
                  <div>
                    <p className="font-medium text-white">{dl.title}</p>
                    <p className="text-sm text-slate-400">{dl.date} · {dl.size}</p>
                  </div>
                </div>
                <button 
                  className="px-4 py-2 rounded-lg transition-colors"
                  style={{ 
                    color: 'var(--theme-primary-400)',
                    background: 'var(--theme-primary-900)'
                  }}
                >
                  重新下载
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            <Download className="w-12 h-12 mx-auto mb-4 text-slate-600" />
            <p>暂无下载记录</p>
          </div>
        )}
      </div>
    </div>
  );
}

// 固件管理组件
function FirmwareManage({ isAdmin }: { isAdmin: boolean }) {
  const [firmwareList] = useState([
    { id: 1, title: 'SM2258XT 开卡工具 v1.2', category: '慧荣 SM2258XT', status: 'approved', downloads: 258 },
    { id: 2, title: 'PS3111 量产工具 v2.5', category: '群联 PS3111', status: 'pending', downloads: 0 },
    { id: 3, title: 'SM2259XT 高级工具 v3.0', category: '慧荣 SM2259XT', status: 'approved', downloads: 890 },
    { id: 4, title: 'MAP1202 开卡程序 v1.0', category: '联芸 MAP1202', status: 'rejected', downloads: 0 }
  ]);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">固件管理</h2>
        <button className="btn-primary px-4 py-3 rounded-xl text-white font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" />
          上传固件
        </button>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">固件名称</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">分类</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">状态</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">下载次数</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {firmwareList.map(fw => (
                <tr key={fw.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-slate-400" />
                      <span className="font-medium text-white">{fw.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{fw.category}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(fw.status)}`}>
                      {getStatusLabel(fw.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{fw.downloads}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      {fw.status === 'pending' && isAdmin && (
                        <>
                          <button className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 分类管理组件
function CategoryManage() {
  const [categories] = useState([
    { id: 'cat-1', name: '慧荣 (SMI)', order: 1, children: [
      { id: 'cat-1-1', name: 'SM2258XT', parent: 'cat-1', order: 1 },
      { id: 'cat-1-2', name: 'SM2259XT', parent: 'cat-1', order: 2 }
    ]},
    { id: 'cat-2', name: '群联 (Phison)', order: 2, children: [
      { id: 'cat-2-1', name: 'PS3111', parent: 'cat-2', order: 1 }
    ]},
    { id: 'cat-3', name: '联芸 (Maxio)', order: 3, children: [
      { id: 'cat-3-1', name: 'MAP1202', parent: 'cat-3', order: 1 }
    ]}
  ]);
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">分类管理</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary px-4 py-3 rounded-xl text-white font-semibold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          添加分类
        </button>
      </div>

      <div className="glass-card rounded-xl p-6">
        <div className="space-y-4">
          {categories.map(cat => (
            <div key={cat.id} className="border border-white/10 rounded-xl overflow-hidden">
              <div className="p-4 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FolderTree className="w-5 h-5" style={{ color: 'var(--theme-primary-400)' }} />
                  <span className="font-semibold text-white">{cat.name}</span>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-slate-400 hover:bg-white/10 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {cat.children && cat.children.length > 0 && (
                <div className="border-t border-white/10">
                  {cat.children.map(child => (
                    <div key={child.id} className="p-4 pl-12 flex items-center justify-between border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400">|—</span>
                        <span className="text-slate-300">{child.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-slate-400 hover:bg-white/10 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">添加分类</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">分类名称</label>
                <input
                  type="text"
                  placeholder="例如：慧荣 SM2258XT"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-white/30 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">上级分类</label>
                <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-white/30 focus:outline-none">
                  <option value="">无（作为一级分类）</option>
                  <option value="cat-1">慧荣 (SMI)</option>
                  <option value="cat-2">群联 (Phison)</option>
                  <option value="cat-3">联芸 (Maxio)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">排序</label>
                <input
                  type="number"
                  defaultValue={0}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-white/30 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 border border-white/20 text-slate-300 rounded-xl hover:bg-white/10 transition-colors"
              >
                取消
              </button>
              <button className="btn-primary flex-1 px-4 py-3 rounded-xl text-white font-semibold">
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
  const [users] = useState([
    { id: 1, email: 'admin@example.com', nickname: '系统管理员', role: 'admin', downloads: 0, isPremium: true },
    { id: 2, email: 'zhang@example.com', nickname: '张三', role: 'maintainer', downloads: 12, isPremium: false },
    { id: 3, email: 'li@example.com', nickname: '李四', role: 'user', downloads: 3, isPremium: false },
    { id: 4, email: 'wang@example.com', nickname: '王五', role: 'user', downloads: 8, isPremium: true }
  ]);

  const getRoleStyle = (role: string) => {
    switch(role) {
      case 'admin': return 'bg-amber-500/20 text-amber-400';
      case 'maintainer': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">用户管理</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="搜索用户..."
            className="pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-white/30 focus:outline-none"
          />
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">用户</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">角色</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">下载次数</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">会员状态</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--theme-gradient)' }}
                      >
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{u.nickname}</p>
                        <p className="text-sm text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      defaultValue={u.role}
                      className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${getRoleStyle(u.role)}`}
                    >
                      <option value="admin">管理员</option>
                      <option value="maintainer">维护者</option>
                      <option value="user">普通用户</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{u.downloads}</td>
                  <td className="px-6 py-4">
                    {u.isPremium ? (
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                        Premium
                      </span>
                    ) : (
                      <span className="text-slate-500 text-sm">普通</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {u.role !== 'admin' && (
                      <button className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 网站设置组件
function SiteSettings() {
  const [activeSection, setActiveSection] = useState<'basic' | 'modules' | 'quota' | 'theme'>('basic');

  const sections = [
    { id: 'basic', icon: Globe, label: '基本设置' },
    { id: 'modules', icon: Zap, label: '模块开关' },
    { id: 'quota', icon: Settings, label: '下载配额' },
    { id: 'theme', icon: Palette, label: '主题配色' }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">网站设置</h2>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="grid md:grid-cols-4 divide-x divide-white/10">
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
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
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
                  <label className="block text-sm font-medium text-slate-400 mb-2">网站名称</label>
                  <input
                    type="text"
                    defaultValue="SSD开卡工具站"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-white/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">网站描述</label>
                  <textarea
                    defaultValue="专业的固态硬盘开卡工具分享平台"
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-white/30 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {activeSection === 'modules' && (
              <div className="space-y-4">
                {[
                  { key: 'hero', label: '英雄区域', description: '首页顶部的大幅宣传区域' },
                  { key: 'hot', label: '热门工具', description: '显示热门固件模块' },
                  { key: 'latest', label: '最新上传', description: '显示最新固件列表' },
                  { key: 'donations', label: '捐赠公示', description: '显示捐赠记录和总额' },
                  { key: 'contributors', label: '贡献榜单', description: '显示贡献者列表' }
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-4 border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
                    <div>
                      <p className="font-medium text-white">{item.label}</p>
                      <p className="text-sm text-slate-400">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'quota' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">免费用户每月下载次数</label>
                  <input
                    type="number"
                    defaultValue={5}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-white/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Premium 用户每月下载次数</label>
                  <input
                    type="number"
                    defaultValue={100}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-white/30 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {activeSection === 'theme' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-4">选择主题</label>
                  <div className="grid grid-cols-5 gap-4">
                    {themes.map((theme) => (
                      <div key={theme.id} className="text-center">
                        <div 
                          className="w-full aspect-square rounded-xl shadow-lg cursor-pointer hover:scale-105 transition-transform"
                          style={{ background: theme.gradient }}
                        />
                        <p className="text-xs text-slate-400 mt-2">{theme.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-6 pt-6 border-t border-white/10">
              <button 
                className="btn-primary px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                保存设置
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
