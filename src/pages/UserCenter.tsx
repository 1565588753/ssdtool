import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../store';
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
  LogOut,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Save,
  Palette,
  Globe,
  Zap,
  Search,
  ChevronRight,
  X
} from 'lucide-react';

type TabType = 'dashboard' | 'profile' | 'downloads' | 'firmware' | 'categories' | 'users' | 'settings';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  primaryColor: string;
  secondaryColor: string;
  showHero: boolean;
  showHot: boolean;
  showLatest: boolean;
  showDonations: boolean;
  showContributors: boolean;
  freeQuota: number;
  premiumQuota: number;
}

export default function UserCenter() {
  const navigate = useNavigate();
  const { user, logout, config, loadInitialData } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'SSD开卡工具站',
    siteDescription: '专业的固态硬盘开卡工具分享平台',
    primaryColor: '#1e40af',
    secondaryColor: '#3b82f6',
    showHero: true,
    showHot: true,
    showLatest: true,
    showDonations: true,
    showContributors: true,
    freeQuota: 5,
    premiumQuota: 100
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  if (!user) {
    navigate('/login');
    return null;
  }

  const isAdmin = user.role === 'admin';
  const isMaintainer = user.role === 'maintainer' || isAdmin;

  const handleSaveSettings = () => {
    alert('设置已保存！（实际项目中会调用 API）');
  };

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
    <div className="min-h-screen bg-gray-100 flex">
      {/* 左侧导航 */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        {/* Logo 区域 */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800">SSD管理后台</h1>
              <p className="text-xs text-gray-500">控制面板</p>
            </div>
          </div>
        </div>

        {/* 用户信息 */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">{user.nickname}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                {isAdmin ? (
                  <>
                    <Crown className="w-3 h-3 text-yellow-500" />
                    <span className="text-yellow-600">管理员</span>
                  </>
                ) : isMaintainer ? (
                  <>
                    <Shield className="w-3 h-3 text-blue-500" />
                    <span className="text-blue-600">维护者</span>
                  </>
                ) : (
                  '普通用户'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* 退出登录 */}
        <div className="p-4 border-t">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">退出登录</span>
          </button>
        </div>
      </aside>

      {/* 右侧内容区 */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* 仪表盘 */}
          {activeTab === 'dashboard' && (
            <Dashboard isAdmin={isAdmin} isMaintainer={isMaintainer} user={user} />
          )}

          {/* 账户信息 */}
          {activeTab === 'profile' && <Profile user={user} />}

          {/* 下载记录 */}
          {activeTab === 'downloads' && <Downloads user={user} config={config} />}

          {/* 固件管理 */}
          {activeTab === 'firmware' && isMaintainer && <FirmwareManage isAdmin={isAdmin} />}

          {/* 分类管理 */}
          {activeTab === 'categories' && isAdmin && <CategoryManage />}

          {/* 用户管理 */}
          {activeTab === 'users' && isAdmin && <UserManage />}

          {/* 网站设置 */}
          {activeTab === 'settings' && isAdmin && (
            <SiteSettings settings={settings} setSettings={setSettings} onSave={handleSaveSettings} />
          )}
        </div>
      </main>
    </div>
  );
}

// 仪表盘组件
function Dashboard({ isAdmin, isMaintainer, user }: { isAdmin: boolean; isMaintainer: boolean; user: any }) {
  const stats = [
    { label: '总用户数', value: '156', icon: Users, color: 'blue' },
    { label: '固件总数', value: '89', icon: FileText, color: 'green' },
    { label: '下载次数', value: '2,458', icon: Download, color: 'purple' },
    { label: '捐赠总额', value: '¥1,280', icon: Zap, color: 'yellow' }
  ];

  const pendingFirmware = [
    { id: 1, title: 'SM2258XT 新版工具', author: '张三', date: '2024-01-15' },
    { id: 2, title: 'PS3111 量产工具 v2.1', author: '李四', date: '2024-01-14' }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">仪表盘</h2>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            purple: 'bg-purple-100 text-purple-600',
            yellow: 'bg-yellow-100 text-yellow-600'
          };
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</p>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* 待审核固件（维护者/管理员可见） */}
      {isMaintainer && pendingFirmware.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-orange-500" />
              待审核固件
            </h3>
            <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
              {pendingFirmware.length} 个待审核
            </span>
          </div>
          <div className="divide-y">
            {pendingFirmware.map(fw => (
              <div key={fw.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-800">{fw.title}</p>
                  <p className="text-sm text-gray-500">由 {fw.author} 上传 · {fw.date}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors">
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 快捷操作 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">快捷操作</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {isMaintainer && (
            <>
              <button className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-2">
                <Plus className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-600">上传固件</span>
              </button>
              <button
                onClick={() => {}}
                className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all flex flex-col items-center gap-2"
              >
                <FolderTree className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-600">管理分类</span>
              </button>
            </>
          )}
          {isAdmin && (
            <>
              <button className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all flex flex-col items-center gap-2">
                <Users className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-600">管理用户</span>
              </button>
              <button className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all flex flex-col items-center gap-2">
                <Palette className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-600">网站设置</span>
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
      <h2 className="text-2xl font-bold text-gray-800">账户信息</h2>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-6 mb-6 pb-6 border-b">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <User className="w-12 h-12 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">{user.nickname}</h3>
            <p className="text-gray-500">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              {user.role === 'admin' && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium flex items-center gap-1">
                  <Crown className="w-4 h-4" />
                  管理员
                </span>
              )}
              {user.role === 'maintainer' && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  维护者
                </span>
              )}
              {user.isPremium && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  Premium 会员
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">昵称</label>
            <input
              type="text"
              defaultValue={user.nickname}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
            <input
              type="email"
              defaultValue={user.email}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
        </div>

        <div className="mt-6 pt-6 border-t flex justify-end">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
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
    : Math.max(0, user.downloadQuota - user.downloadsUsed);
  const totalQuota = user.isPremium ? 100 : config.quotaSettings.freeQuota;
  const usagePercent = ((user.downloadQuota - remainingQuota) / totalQuota) * 100;

  const downloads = [
    { id: 1, title: 'SM2258XT 开卡工具 v1.2', date: '2024-01-15', size: '15 MB' },
    { id: 2, title: 'PS3111 量产工具 v2.5', date: '2024-01-14', size: '22 MB' }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">下载记录</h2>

      {/* 下载额度卡片 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">本月下载额度</h3>
          {user.isPremium && (
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              Premium 会员
            </span>
          )}
        </div>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">已使用</span>
            <span className="font-semibold text-gray-800">
              {user.downloadQuota - remainingQuota} / {totalQuota}
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>
        <p className="text-sm text-gray-500">
          剩余 <span className="font-semibold text-blue-600">{remainingQuota}</span> 次下载额度
        </p>
      </div>

      {/* 下载历史 */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">下载历史</h3>
        </div>
        {downloads.length > 0 ? (
          <div className="divide-y">
            {downloads.map(dl => (
              <div key={dl.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{dl.title}</p>
                    <p className="text-sm text-gray-500">{dl.date} · {dl.size}</p>
                  </div>
                </div>
                <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  重新下载
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <Download className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>暂无下载记录</p>
          </div>
        )}
      </div>
    </div>
  );
}

// 固件管理组件
function FirmwareManage({ isAdmin }: { isAdmin: boolean }) {
  const [firmwareList, setFirmwareList] = useState([
    { id: 1, title: 'SM2258XT 开卡工具 v1.2', category: '慧荣 SM2258XT', status: 'approved', downloads: 258 },
    { id: 2, title: 'PS3111 量产工具 v2.5', category: '群联 PS3111', status: 'pending', downloads: 0 },
    { id: 3, title: 'SM2259XT 高级工具 v3.0', category: '慧荣 SM2259XT', status: 'approved', downloads: 890 },
    { id: 4, title: 'MAP1202 开卡程序 v1.0', category: '联芸 MAP1202', status: 'rejected', downloads: 0 }
  ]);

  const statusColors: Record<string, string> = {
    approved: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    rejected: 'bg-red-100 text-red-700'
  };

  const statusLabels: Record<string, string> = {
    approved: '已通过',
    pending: '待审核',
    rejected: '已拒绝'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">固件管理</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          上传固件
        </button>
      </div>

      {/* 固件列表 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">固件名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">分类</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">下载次数</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {firmwareList.map(fw => (
              <tr key={fw.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-800">{fw.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{fw.category}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[fw.status]}`}>
                    {statusLabels[fw.status]}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{fw.downloads}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    {fw.status === 'pending' && isAdmin && (
                      <>
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
  );
}

// 分类管理组件
function CategoryManage() {
  const [categories, setCategories] = useState([
    { id: 'cat-1', name: '慧荣 (SMI)', parent: null, order: 1, children: [
      { id: 'cat-1-1', name: 'SM2258XT', parent: 'cat-1', order: 1 },
      { id: 'cat-1-2', name: 'SM2259XT', parent: 'cat-1', order: 2 }
    ]},
    { id: 'cat-2', name: '群联 (Phison)', parent: null, order: 2, children: [
      { id: 'cat-2-1', name: 'PS3111', parent: 'cat-2', order: 1 }
    ]},
    { id: 'cat-3', name: '联芸 (Maxio)', parent: null, order: 3, children: [
      { id: 'cat-3-1', name: 'MAP1202', parent: 'cat-3', order: 1 }
    ]}
  ]);
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">分类管理</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          添加分类
        </button>
      </div>

      {/* 分类树 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="space-y-4">
          {categories.map(cat => (
            <div key={cat.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-4 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FolderTree className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-800">{cat.name}</span>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {cat.children && cat.children.length > 0 && (
                <div className="border-t">
                  {cat.children.map(child => (
                    <div key={child.id} className="p-4 pl-12 flex items-center justify-between border-b last:border-b-0 hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{child.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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

      {/* 添加分类弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">添加分类</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">分类名称</label>
                <input
                  type="text"
                  placeholder="例如：慧荣 SM2258XT"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">上级分类</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">无（作为一级分类）</option>
                  <option value="cat-1">慧荣 (SMI)</option>
                  <option value="cat-2">群联 (Phison)</option>
                  <option value="cat-3">联芸 (Maxio)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">排序</label>
                <input
                  type="number"
                  defaultValue={0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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

  const roleColors: Record<string, string> = {
    admin: 'bg-yellow-100 text-yellow-700',
    maintainer: 'bg-blue-100 text-blue-700',
    user: 'bg-gray-100 text-gray-700'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">用户管理</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索用户..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 用户列表 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">角色</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">下载次数</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">会员状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{u.nickname}</p>
                      <p className="text-sm text-gray-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <select
                    defaultValue={u.role}
                    className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${roleColors[u.role]}`}
                  >
                    <option value="admin">管理员</option>
                    <option value="maintainer">维护者</option>
                    <option value="user">普通用户</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-gray-600">{u.downloads}</td>
                <td className="px-6 py-4">
                  {u.isPremium ? (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      Premium
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">普通</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 网站设置组件
function SiteSettings({
  settings,
  setSettings,
  onSave
}: {
  settings: SiteSettings;
  setSettings: (s: SiteSettings) => void;
  onSave: () => void;
}) {
  const [activeSection, setActiveSection] = useState<'basic' | 'modules' | 'quota' | 'theme'>('basic');

  const sections = [
    { id: 'basic', icon: Globe, label: '基本设置' },
    { id: 'modules', icon: Zap, label: '模块开关' },
    { id: 'quota', icon: Settings, label: '下载配额' },
    { id: 'theme', icon: Palette, label: '主题配色' }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">网站设置</h2>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="grid md:grid-cols-4 divide-x">
          {/* 左侧导航 */}
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
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{section.label}</span>
                </button>
              );
            })}
          </div>

          {/* 右侧内容 */}
          <div className="md:col-span-3 p-6">
            {/* 基本设置 */}
            {activeSection === 'basic' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">网站名称</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">网站描述</label>
                  <textarea
                    value={settings.siteDescription}
                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* 模块开关 */}
            {activeSection === 'modules' && (
              <div className="space-y-4">
                {[
                  { key: 'showHero', label: '英雄区域', description: '首页顶部的大幅宣传区域' },
                  { key: 'showHot', label: '热门工具', description: '显示热门固件模块' },
                  { key: 'showLatest', label: '最新上传', description: '显示最新固件模块' },
                  { key: 'showDonations', label: '捐赠公示', description: '显示捐赠记录和总额' },
                  { key: 'showContributors', label: '贡献榜单', description: '显示贡献者列表' }
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-800">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings[item.key as keyof SiteSettings] as boolean}
                        onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            )}

            {/* 下载配额 */}
            {activeSection === 'quota' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">免费用户每月下载次数</label>
                  <input
                    type="number"
                    value={settings.freeQuota}
                    onChange={(e) => setSettings({ ...settings, freeQuota: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Premium 用户每月下载次数</label>
                  <input
                    type="number"
                    value={settings.premiumQuota}
                    onChange={(e) => setSettings({ ...settings, premiumQuota: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* 主题配色 */}
            {activeSection === 'theme' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">主色调</label>
                  <div className="flex gap-4">
                    <input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      className="w-16 h-12 border rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">辅助色调</label>
                  <div className="flex gap-4">
                    <input
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                      className="w-16 h-12 border rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.secondaryColor}
                      onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* 实时预览 */}
                <div className="p-6 bg-gray-100 rounded-xl">
                  <p className="text-sm font-medium text-gray-700 mb-4">实时预览</p>
                  <div
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: settings.primaryColor + '20' }}
                  >
                    <button
                      className="px-4 py-2 text-white rounded-lg mr-2"
                      style={{ backgroundColor: settings.primaryColor }}
                    >
                      主按钮
                    </button>
                    <button
                      className="px-4 py-2 text-white rounded-lg"
                      style={{ backgroundColor: settings.secondaryColor }}
                    >
                      次按钮
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 保存按钮 */}
            <div className="flex justify-end mt-6 pt-6 border-t">
              <button
                onClick={onSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
