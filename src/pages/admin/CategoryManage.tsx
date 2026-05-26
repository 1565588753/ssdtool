import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  X,
  FolderTree,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

export default function CategoryManage({ categories, addCategory, updateCategory, deleteCategory }: { categories: any[]; addCategory: (data: any) => void; updateCategory: (id: string, data: any) => void; deleteCategory: (id: string) => void }) {
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