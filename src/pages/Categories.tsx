import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store';
import FirmwareCard from '../components/FirmwareCard';
import { Search, Folder, ChevronRight, ChevronDown } from 'lucide-react';

export default function Categories() {
  const { categories, firmware, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery } = useAppStore();
  const [expandedCategories, setExpandedCategories] = useState<string[]>(categories.filter(c => !c.parentId).map(c => c.id));

  const getFilteredFirmware = () => {
    let result = [...firmware];

    if (selectedCategory) {
      const getChildCategories = (catId: string): string[] => {
        const children = categories.filter(c => c.parentId === catId);
        let ids = [catId];
        children.forEach(c => {
          ids = [...ids, ...getChildCategories(c.id)];
        });
        return ids;
      };
      const categoryIds = getChildCategories(selectedCategory);
      result = result.filter(f => categoryIds.includes(f.categoryId));
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(f =>
        f.title.toLowerCase().includes(query) ||
        f.description.toLowerCase().includes(query)
      );
    }

    return result;
  };

  const filteredFirmware = getFilteredFirmware();

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const renderCategoryTree = (parentId: string | null, level: number = 0) => {
    const children = categories.filter(c => c.parentId === parentId);
    if (children.length === 0) return null;

    return (
      <div className={level > 0 ? 'ml-4' : ''}>
        {children.map(category => {
          const hasChildren = categories.some(c => c.parentId === category.id);
          const isExpanded = expandedCategories.includes(category.id);
          const isSelected = selectedCategory === category.id;

          return (
            <div key={category.id}>
              <button
                onClick={() => {
                  if (hasChildren) {
                    toggleCategory(category.id);
                  }
                  setSelectedCategory(isSelected ? null : category.id);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                  isSelected
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {hasChildren ? (
                  isExpanded ? (
                    <ChevronDown className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                  )
                ) : (
                  <Folder className="w-4 h-4 flex-shrink-0" />
                )}
                <span className="text-sm truncate">{category.name}</span>
              </button>
              {hasChildren && isExpanded && renderCategoryTree(category.id, level + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card rounded-2xl p-6 sticky top-24"
            >
              <h2 className="font-display text-lg font-semibold mb-4">分类</h2>
              <div className="space-y-1">
                {renderCategoryTree(null)}
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索固件..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500/50 transition-all"
                />
              </div>
            </motion.div>

            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h1 className="font-display text-2xl font-bold">
                  {selectedCategory
                    ? categories.find(c => c.id === selectedCategory)?.name || '全部固件'
                    : '全部固件'}
                </h1>
                <span className="text-slate-400">{filteredFirmware.length} 个结果</span>
              </div>
            </div>

            {filteredFirmware.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <Folder className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                <h3 className="text-lg font-semibold mb-2">没有找到固件</h3>
                <p className="text-slate-400">尝试更换搜索关键词或选择其他分类</p>
              </motion.div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredFirmware.map((fw, index) => (
                  <FirmwareCard key={fw.id} firmware={fw} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
