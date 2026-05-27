import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminAPI } from '../../services/api';
import { useAppStore } from '../../store';
import { User, Plus, Edit, Trash2, X } from 'lucide-react';

export default function UserManage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [addForm, setAddForm] = useState({ email: '', password: '', nickname: '', role: 'user' });
  const [editForm, setEditForm] = useState({ email: '', password: '', nickname: '', role: 'user', downloadQuota: 5, isPremium: false });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const config = useAppStore((s) => s.config);
  const premiumQuota = config?.quotaSettings?.premiumQuota || 100;
  const freeQuota = config?.quotaSettings?.freeQuota || 5;

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const getRoleStyle = (role: string) => {
    switch(role) {
      case 'admin': return 'bg-amber-500/20 text-amber-400';
      case 'maintainer': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('确定要删除这个用户吗？')) return;
    try {
      await adminAPI.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      showToast('用户已删除', 'success');
    } catch {
      showToast('删除失败，请重试', 'error');
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch {
      showToast('更新角色失败，请重试', 'error');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.email || !addForm.password || !addForm.nickname) {
      showToast('请填写所有必填字段', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const response = await adminAPI.createUser(addForm);
      if (response.success) {
        setUsers(prev => [response.user, ...prev]);
        setShowAddModal(false);
        setAddForm({ email: '', password: '', nickname: '', role: 'user' });
        showToast('用户创建成功', 'success');
      }
    } catch (error: any) {
      showToast(error.message || '创建用户失败', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.email || !editForm.nickname) {
      showToast('邮箱和昵称为必填项', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const updateData: any = {
        email: editForm.email,
        nickname: editForm.nickname,
        role: editForm.role,
        downloadQuota: editForm.downloadQuota,
        isPremium: editForm.isPremium,
      };
      if (editForm.password) {
        updateData.password = editForm.password;
      }
      await adminAPI.updateUser(editingUser.id, updateData);
      setUsers(prev => prev.map(u => u.id === editingUser.id ? {
        ...u,
        email: editForm.email,
        nickname: editForm.nickname,
        role: editForm.role,
        downloadQuota: editForm.downloadQuota,
        isPremium: editForm.isPremium,
      } : u));
      setShowEditModal(false);
      setEditingUser(null);
      showToast('用户信息更新成功', 'success');
    } catch (error: any) {
      showToast(error.message || '更新用户失败', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (u: any) => {
    setEditingUser(u);
    setEditForm({
      email: u.email,
      password: '',
      nickname: u.nickname,
      role: u.role,
      downloadQuota: u.downloadQuota,
      isPremium: u.isPremium,
    });
    setShowEditModal(true);
  };

  const inputStyle = {
    backgroundColor: 'var(--theme-bg-card)',
    border: '1px solid var(--theme-border)',
    color: 'var(--theme-text)',
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-xl shadow-lg ${
          toast.type === 'success' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>用户管理</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary px-4 py-3 rounded-xl text-white font-semibold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          添加用户
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
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text-secondary)' }}>用户</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text-secondary)' }}>角色</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--theme-text-secondary)' }}>下载额度</th>
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
                          <p className="text-xs" style={{ color: 'var(--theme-text-secondary)', opacity: 0.6 }}>UID: {u.id}</p>
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
                    <td className="px-6 py-4" style={{ color: 'var(--theme-text-secondary)' }}>
                      {u.downloadsUsed} / {u.downloadQuota}
                    </td>
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
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-xl p-6 w-full max-w-md"
            style={{ borderColor: 'var(--theme-border)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{ color: 'var(--theme-text)' }}>添加用户</h3>
              <button onClick={() => setShowAddModal(false)} className="hover:text-white transition-colors" style={{ color: 'var(--theme-text-secondary)' }}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>邮箱 *</label>
                <input type="email" required value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>密码 *</label>
                <input type="password" required value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>昵称 *</label>
                <input type="text" required value={addForm.nickname} onChange={(e) => setAddForm({ ...addForm, nickname: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>角色</label>
                <select value={addForm.role} onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none" style={inputStyle}>
                  <option value="user">普通用户</option>
                  <option value="maintainer">维护者</option>
                  <option value="admin">管理员</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 border rounded-xl hover:bg-white/10 transition-colors"
                  style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-secondary)' }}>取消</button>
                <button type="submit" disabled={submitting}
                  className="btn-primary flex-1 px-4 py-3 rounded-xl text-white font-semibold disabled:opacity-50">
                  {submitting ? '创建中...' : '创建用户'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            style={{ borderColor: 'var(--theme-border)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{ color: 'var(--theme-text)' }}>编辑用户</h3>
              <button onClick={() => { setShowEditModal(false); setEditingUser(null); }}
                className="hover:text-white transition-colors" style={{ color: 'var(--theme-text-secondary)' }}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>UID（不可修改）</label>
                <input type="text" disabled value={editingUser.id}
                  className="w-full px-4 py-3 rounded-xl cursor-not-allowed opacity-60"
                  style={{ backgroundColor: 'var(--theme-bg-card)', border: '1px solid var(--theme-border)', color: 'var(--theme-text-secondary)' }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>邮箱 *</label>
                <input type="email" required value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>新密码（留空则不修改）</label>
                <input type="password" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="留空则不修改密码" className="w-full px-4 py-3 rounded-xl focus:outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>昵称 *</label>
                <input type="text" required value={editForm.nickname} onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>角色</label>
                <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none" style={inputStyle}>
                  <option value="user">普通用户</option>
                  <option value="maintainer">维护者</option>
                  <option value="admin">管理员</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>下载额度</label>
                <input type="number" value={editForm.downloadQuota} onChange={(e) => setEditForm({ ...editForm, downloadQuota: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none" style={inputStyle} />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium" style={{ color: 'var(--theme-text-secondary)' }}>Premium 会员</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={editForm.isPremium}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setEditForm({ ...editForm, isPremium: checked, downloadQuota: checked ? premiumQuota : freeQuota });
                    }} className="sr-only peer" />
                  <div className="w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                    style={{ backgroundColor: 'var(--theme-bg-card)' }}></div>
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowEditModal(false); setEditingUser(null); }}
                  className="flex-1 px-4 py-3 border rounded-xl hover:bg-white/10 transition-colors"
                  style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-secondary)' }}>取消</button>
                <button type="submit" disabled={submitting}
                  className="btn-primary flex-1 px-4 py-3 rounded-xl text-white font-semibold disabled:opacity-50">
                  {submitting ? '保存中...' : '保存修改'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}