import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  X
} from 'lucide-react';

export default function TagManage({ tags, addTag, updateTag, deleteTag }: { tags: any[]; addTag: (data: any) => void; updateTag: (id: string, data: any) => void; deleteTag: (id: string) => void }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTag, setNewTag] = useState({ name: '', slug: '', category: '', color: '', description: '' });

  const handleAddTag = () => {
    addTag(newTag);
    setShowAddModal(false);
    setNewTag({ name: '', slug: '', category: '', color: '', description: '' });
  };

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