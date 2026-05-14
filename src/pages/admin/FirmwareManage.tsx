import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminAPI, uploadFirmwareAPI } from '../../services/api';
import {
  Plus,
  FileText,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  X,
  UploadCloud
} from 'lucide-react';

export default function FirmwareManage({ isAdmin, isMaintainer, firmware: storeFirmware, categories, updateFirmware, deleteFirmware }: { isAdmin: boolean; isMaintainer: boolean; firmware: any[]; categories: any[]; updateFirmware: (id: string, data: any) => void; deleteFirmware: (id: string) => void }) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    version: '1.0',
    categoryId: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [firmwareList, setFirmwareList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await adminAPI.deleteFirmware(deleteConfirm);
      setFirmwareList(prev => prev.filter(f => f.id !== deleteConfirm));
      showToast('固件已删除', 'success');
    } catch {
      showToast('删除失败，请重试', 'error');
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

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
      showToast('请选择要上传的固件文件', 'error');
      return;
    }
    if (!uploadForm.title || !uploadForm.categoryId) {
      showToast('请填写完整的固件信息', 'error');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('firmwareFile', selectedFile);
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('version', uploadForm.version);
      formData.append('categoryId', uploadForm.categoryId);

      await uploadFirmwareAPI.upload(formData);

      showToast('固件上传成功，等待审核', 'success');
      setShowUploadModal(false);
      setUploadForm({
        title: '',
        description: '',
        version: '1.0',
        categoryId: ''
      });
      setSelectedFile(null);

      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('上传固件失败:', error);
      showToast('上传失败，请重试', 'error');
    } finally {
      setUploading(false);
    }
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
                                  showToast('审核通过！', 'success');
                                } catch {
                                  showToast('审核失败，请重试', 'error');
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
                                  showToast('已拒绝', 'success');
                                } catch {
                                  showToast('操作失败，请重试', 'error');
                                }
                              }}
                              className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setDeleteConfirm(fw.id)}
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

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-xl p-6 w-full max-w-md"
            style={{ borderColor: 'var(--theme-border)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--theme-text)' }}>确认删除</h3>
            </div>
            <p className="mb-6" style={{ color: 'var(--theme-text-secondary)' }}>
              确定要删除这个固件吗？此操作不可撤销，固件文件也将被永久删除。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 px-4 py-3 border rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50"
                style={{
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text-secondary)'
                }}
              >
                取消
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 px-4 py-3 rounded-xl text-white font-semibold disabled:opacity-50 bg-red-500 hover:bg-red-600 transition-colors"
              >
                {deleting ? '删除中...' : '确认删除'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}