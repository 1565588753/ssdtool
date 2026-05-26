import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store';
import FirmwareCard from '../components/FirmwareCard';
import { Search, Folder, ChevronRight, ChevronDown, X } from 'lucide-react';

export default function Categories() {
  const { 
    categories, 
    firmware, 
    tags,
    selectedCategory, 
    setSelectedCategory, 
    searchQuery, 
    setSearchQuery,
    selectedTags,
    setSelectedTags
  } = useAppStore();
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

    if (selectedTags.length > 0) {
      result = result.filter(f => 
        selectedTags.some(tagId => f.tags?.includes(tagId))
      );
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

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedTags([]);
    setSearchQuery('');
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
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors`}
                style={{ 
                  backgroundColor: isSelected ? 'var(--theme-primary-500)/20' : 'transparent',
                  color: isSelected ? 'var(--theme-primary-400)' : 'var(--theme-text-secondary)'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'var(--theme-bg-hover)';
                    e.currentTarget.style.color = 'var(--theme-text)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--theme-text-secondary)';
                  }
                }}
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

  // 按分类分组标签
  const tagsByCategory = tags.reduce((acc, tag) => {
    if (!acc[tag.category]) {
      acc[tag.category] = [];
    }
    acc[tag.category].push(tag);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--theme-bg-base)' }}>
      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card rounded-2xl p-6"
              style={{ borderColor: 'var(--theme-border)' }}
            >
              <h2 className="font-display text-lg font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>分类</h2>
              <div className="space-y-1">
                {renderCategoryTree(null)}
              </div>
            </motion.div>

            {Object.keys(tagsByCategory).length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card rounded-2xl p-6"
                style={{ borderColor: 'var(--theme-border)' }}
              >
                <h2 className="font-display text-lg font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>标签筛选</h2>
                <div className="space-y-4">
                  {Object.entries(tagsByCategory).map(([category, categoryTags]) => (
                    <div key={category}>
                      <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>{category}</h3>
                      <div className="flex flex-wrap gap-2">
                        {categoryTags.map(tag => {
                          const isSelected = selectedTags.includes(tag.id);
                          return (
                            <button
                              key={tag.id}
                              onClick={() => toggleTag(tag.id)}
                              className={`px-3 py-1 rounded-full text-sm transition-all`}
                              style={{ 
                                backgroundColor: isSelected ? (tag.color ? `${tag.color}30` : 'var(--theme-primary-500)/20') : 'var(--theme-bg-card)',
                                border: isSelected ? `1px solid ${tag.color || 'var(--theme-primary-500)'}` : '1px solid var(--theme-border)',
                                color: isSelected ? (tag.color || 'var(--theme-primary-400)') : 'var(--theme-text-secondary)'
                              }}
                            >
                              {tag.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {(selectedCategory || selectedTags.length > 0 || searchQuery) && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={clearFilters}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border transition-all hover:bg-white/5"
                style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-secondary)' }}
              >
                <X className="w-4 h-4" />
                清除筛选
              </motion.button>
            )}
          </div>

          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--theme-text-secondary)' }} />
                <input
                  type="text"
                  placeholder="搜索固件..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none"
                  style={{ 
                    backgroundColor: 'var(--theme-bg-card)',
                    border: '1px solid var(--theme-border)',
                    color: 'var(--theme-text)'
                  }}
                />
              </div>
            </motion.div>

            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--theme-text)' }}>
                  {selectedCategory
                    ? categories.find(c => c.id === selectedCategory)?.name || '全部固件'
                    : '全部固件'}
                </h1>
                <span style={{ color: 'var(--theme-text-secondary)' }}>{filteredFirmware.length} 个结果</span>
              </div>
            </div>

            {filteredFirmware.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <Folder className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--theme-bg-hover)' }} />
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--theme-text)' }}>没有找到固件</h3>
                <p style={{ color: 'var(--theme-text-secondary)' }}>尝试更换搜索关键词或选择其他分类</p>
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
