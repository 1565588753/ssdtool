import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Category, Firmware, Donation, Contributor, Config, Download, Tag } from '../../shared/types';
import { authAPI, firmwareAPI, categoryAPI, donationAPI, adminAPI } from '../services/api';

// 广告类型定义
export interface AdSlot {
  id: string;
  name: string;
  enabled: boolean;
  content: string;
  position: string;
}

// 首页模块配置
export interface HomeModule {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
  title: string;
  description: string;
}

// 扩展配置类型
export interface ExtendedConfig extends Config {
  moduleOrder: string[];
  adSlots: AdSlot[];
  homeModules: HomeModule[];
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
isAuthReady: boolean;
  token?: string;
  setUser: (user: User | null) => void;
  setAuthReady: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, nickname: string, code: string) => Promise<boolean>;
  logout: () => void;

  categories: Category[];
  firmware: Firmware[];
  tags: Tag[];
  donations: Donation[];
  contributors: Contributor[];
  config: ExtendedConfig;
  downloads: Download[];

  getFirmwareById: (id: string) => Firmware | undefined;
  getFirmwareByCategory: (categoryId: string) => Firmware[];
  getFirmwareByTags: (tagIds: string[]) => Firmware[];
  getHotFirmware: () => Firmware[];
  getLatestFirmware: () => Firmware[];
  downloadFirmware: (firmwareId: string) => Promise<boolean>;

  // 分类管理
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'children'>) => void;
  batchAddCategories: (categories: { name: string; parentId: string }[]) => Promise<{ success: boolean; error?: string }>;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // 标签管理
  addTag: (tag: Omit<Tag, 'id' | 'createdAt'>) => void;
  updateTag: (id: string, tag: Partial<Tag>) => void;
  deleteTag: (id: string) => void;

  // 固件管理
  updateFirmware: (id: string, firmware: Partial<Firmware>) => void;
  deleteFirmware: (id: string) => void;

  // 配置管理
  updateSiteSettings: (settings: Partial<ExtendedConfig['siteSettings']>) => void;
  updateModuleSettings: (settings: Partial<ExtendedConfig['moduleSettings']>) => void;
  updateQuotaSettings: (settings: Partial<ExtendedConfig['quotaSettings']>) => void;
  updateModuleOrder: (order: string[]) => void;
  updateHomeModule: (id: string, module: Partial<HomeModule>) => void;
  updateAdSlot: (id: string, slot: Partial<AdSlot>) => void;
  addAdSlot: (slot: Omit<AdSlot, 'id'>) => void;
  deleteAdSlot: (id: string) => void;

  selectedCategory: string | null;
  setSelectedCategory: (id: string | null | ((prev: string | null) => string | null)) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[] | ((prev: string[]) => string[])) => void;
  searchQuery: string;
  setSearchQuery: (query: string | ((prev: string) => string)) => void;

  // 数据加载
  loadInitialData: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const defaultConfig: ExtendedConfig = {
  siteSettings: {
    name: 'SSD开卡工具站',
description: '专业的固态硬盘开卡工具分享平台',
    copyright: ''
  },
  moduleSettings: {
    showHero: true,
    showHot: true,
    showLatest: true,
    showDonations: true,
    showContributors: true
  },
  quotaSettings: {
    freeQuota: 5,
    premiumQuota: 100,
    premiumPrice: 8
  },
  moduleOrder: ['hero', 'stats', 'hot', 'latest', 'donations', 'contributors', 'cta'],
  adSlots: [],
  homeModules: [
    { id: 'hero', name: '首页横幅', enabled: true, order: 1, title: '首页横幅', description: '网站标题和描述' },
    { id: 'stats', name: '数据统计', enabled: true, order: 2, title: '数据统计', description: '展示网站数据' },
    { id: 'hot', name: '热门固件', enabled: true, order: 3, title: '热门固件', description: '下载量最高的开卡工具' },
    { id: 'latest', name: '最新上传', enabled: true, order: 4, title: '最新上传', description: '最新更新的开卡工具' },
    { id: 'donations', name: '爱心捐赠', enabled: true, order: 5, title: '爱心捐赠', description: '感谢支持网站运营的朋友们' },
    { id: 'contributors', name: '贡献榜', enabled: true, order: 6, title: '贡献榜', description: '感谢分享固件的贡献者们' },
    { id: 'cta', name: '行动号召', enabled: true, order: 7, title: '加入社区', description: '注册账号即可下载固件' },
  ]
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
isAuthReady: false,
      token: undefined,
      categories: [],
      firmware: [],
      tags: [],
      donations: [],
      contributors: [],
      config: defaultConfig,
      downloads: [],
      selectedCategory: null,
      selectedTags: [],
      searchQuery: '',
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

setAuthReady: () => set({ isAuthReady: true }),

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login(email, password);
          if (response.success && response.user) {
            localStorage.setItem('userId', response.user.id);
            if (response.token) {
              localStorage.setItem('authToken', response.token);
            }
            const userData: User = {
              id: response.user.id,
              email: response.user.email,
              nickname: response.user.nickname,
              avatar: response.user.avatar,
              role: response.user.role,
              downloadQuota: response.user.downloadQuota,
              downloadsUsed: response.user.downloadsUsed,
              quotaResetDate: response.user.quotaResetDate,
              isPremium: response.user.isPremium,
              createdAt: response.user.createdAt
            };
set({ user: userData, isAuthenticated: true, isAuthReady: true, token: response.token, isLoading: false });
            return true;
          }
          set({ error: '邮箱或密码错误', isLoading: false });
          return false;
        } catch (error: any) {
          console.error('登录失败:', error);
          set({ error: error.message || '登录失败，请检查网络连接', isLoading: false });
          return false;
        }
      },

      register: async (email, password, nickname, code) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register(email, password, nickname, code);
          set({ isLoading: false });
          return response.success;
        } catch (error: any) {
          console.error('注册失败:', error);
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      logout: () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('authToken');
        // Clear persisted storage and reset all state
        useAppStore.persist.clearStorage();
        set({
          user: null,
          isAuthenticated: false,
          token: undefined,
          categories: [],
          firmware: [],
          tags: [],
          donations: [],
          contributors: [],
          config: defaultConfig,
          downloads: [],
          selectedCategory: null,
          selectedTags: [],
          searchQuery: '',
          isLoading: false,
          error: null,
        });
      },

      getFirmwareById: (id) => get().firmware.find(fw => fw.id === id),

      getFirmwareByCategory: (categoryId) => {
        const state = get();
        let firmwareList = state.firmware.filter(fw => fw.categoryId === categoryId);
        const getChildIds = (pid: string): string[] => {
          const children: string[] = [];
          state.categories.forEach(cat => {
            if (cat.parentId === pid) {
              children.push(cat.id);
              children.push(...getChildIds(cat.id));
            }
          });
          return children;
        };
        const childIds = getChildIds(categoryId);
        childIds.forEach(cid => {
          firmwareList = firmwareList.concat(state.firmware.filter(fw => fw.categoryId === cid));
        });
        return firmwareList;
      },

      getFirmwareByTags: (tagIds) => {
        const state = get();
        if (tagIds.length === 0) return state.firmware;
        return state.firmware.filter(fw => 
          tagIds.some(tagId => fw.tags?.includes(tagId))
        );
      },

      getHotFirmware: () => [...get().firmware].sort((a, b) => b.downloadCount - a.downloadCount).slice(0, 6),

      getLatestFirmware: () => [...get().firmware].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6),

      downloadFirmware: async (firmwareId) => {
        const state = get();
        if (!state.user) return false;

        try {
          const response = await firmwareAPI.download(firmwareId);
          if (response.success) {
            const fw = state.getFirmwareById(firmwareId);
            set({
              user: {
                ...state.user,
                downloadsUsed: state.user.downloadsUsed + 1
              },
              downloads: [
                ...state.downloads,
                {
                  id: `dl-${Date.now()}`,
                  userId: state.user.id,
                  firmwareId,
                  firmwareTitle: fw?.title,
                  createdAt: new Date().toISOString()
                }
              ],
              firmware: state.firmware.map(fw =>
                fw.id === firmwareId ? { ...fw, downloadCount: fw.downloadCount + 1 } : fw
              )
            });

            const link = document.createElement('a');
            link.href = `/api/firmware/${firmwareId}/file`;
            link.download = '';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            return true;
          }
          return false;
        } catch (error: any) {
          console.error('下载失败:', error);
          return false;
        }
      },

      // 分类管理
      addCategory: (category) => {
        const newCategory: Category = {
          ...category,
          id: `cat-${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        set((state) => ({
          categories: [...state.categories, newCategory]
        }));
      },

      batchAddCategories: async (names) => {
        set({ isLoading: true });
        try {
          const parentId = names[0]?.parentId || '';
          if (!parentId) return { success: false, error: '请选择上级分类' };
          const response = await adminAPI.batchCreateCategories({ parentId, names: names.map(n => n.name) });
          if (response.success) {
            const newCategories: Category[] = response.categories.map(c => ({
              id: c.id,
              name: c.name,
              parentId,
              orderIndex: 0,
              icon: '',
              description: '',
              children: [],
              createdAt: new Date().toISOString()
            }));
            set((state) => ({
              categories: [...state.categories, ...newCategories]
            }));
            return { success: true };
          }
          return { success: false, error: response.message || '创建失败' };
        } catch (error: any) {
          console.error('批量创建分类失败:', error);
          return { success: false, error: error.message || '创建失败' };
        } finally {
          set({ isLoading: false });
        }
      },

      updateCategory: (id, category) => {
        set((state) => ({
          categories: state.categories.map(cat =>
            cat.id === id ? { ...cat, ...category } : cat
          )
        }));
      },

      deleteCategory: (id) => {
        // 扁平化数据时，删除一个分类需要删除所有以该ID为parentId的子分类
        set((state) => {
          const idsToDelete = new Set<string>([id]);
          
          // 找出所有需要删除的分类ID（包括所有后代分类）
          let found = true;
          while (found) {
            found = false;
            state.categories.forEach(cat => {
              if (cat.parentId && idsToDelete.has(cat.parentId) && !idsToDelete.has(cat.id)) {
                idsToDelete.add(cat.id);
                found = true;
              }
            });
          }
          
          return {
            categories: state.categories.filter(cat => !idsToDelete.has(cat.id))
          };
        });
      },

      // 标签管理
      addTag: (tag) => {
        const newTag: Tag = {
          ...tag,
          id: `tag-${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        set((state) => ({
          tags: [...state.tags, newTag]
        }));
      },

      updateTag: (id, tag) => {
        set((state) => ({
          tags: state.tags.map(t =>
            t.id === id ? { ...t, ...tag } : t
          )
        }));
      },

      deleteTag: (id) => {
        set((state) => ({
          tags: state.tags.filter(t => t.id !== id)
        }));
      },

      // 固件管理
      updateFirmware: (id, firmware) => {
        set((state) => ({
          firmware: state.firmware.map(fw =>
            fw.id === id ? { ...fw, ...firmware } : fw
          )
        }));
      },

      deleteFirmware: (id) => {
        set((state) => ({
          firmware: state.firmware.filter(fw => fw.id !== id)
        }));
      },

      // 配置管理
      updateSiteSettings: (settings) => {
        set((state) => ({
          config: {
            ...state.config,
            siteSettings: { ...state.config.siteSettings, ...settings }
          }
        }));
      },

      updateModuleSettings: (settings) => {
        set((state) => ({
          config: {
            ...state.config,
            moduleSettings: { ...state.config.moduleSettings, ...settings }
          }
        }));
      },

      updateQuotaSettings: (settings) => {
        set((state) => ({
          config: {
            ...state.config,
            quotaSettings: { ...state.config.quotaSettings, ...settings }
          }
        }));
      },

      updateModuleOrder: (order) => {
        set((state) => ({
          config: { ...state.config, moduleOrder: order }
        }));
      },

      updateHomeModule: (id, module) => {
        set((state) => ({
          config: {
            ...state.config,
            homeModules: state.config.homeModules.map(m =>
              m.id === id ? { ...m, ...module } : m
            )
          }
        }));
      },

      updateAdSlot: (id, slot) => {
        set((state) => ({
          config: {
            ...state.config,
            adSlots: state.config.adSlots.map(s =>
              s.id === id ? { ...s, ...slot } : s
            )
          }
        }));
      },

      addAdSlot: (slot) => {
        set((state) => ({
          config: {
            ...state.config,
            adSlots: [...state.config.adSlots, { ...slot, id: `ad-${Date.now()}` }]
          }
        }));
      },

      deleteAdSlot: (id) => {
        set((state) => ({
          config: {
            ...state.config,
            adSlots: state.config.adSlots.filter(s => s.id !== id)
          }
        }));
      },

      setSelectedCategory: (id) => set((state) => ({ 
        selectedCategory: typeof id === 'function' ? id(state.selectedCategory) : id 
      })),

      setSelectedTags: (tags) => set((state) => ({ 
        selectedTags: typeof tags === 'function' ? tags(state.selectedTags) : tags 
      })),

      setSearchQuery: (query) => set((state) => ({ 
        searchQuery: typeof query === 'function' ? query(state.searchQuery) : query 
      })),

      loadInitialData: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const [categoriesRes, firmwareRes, donationsRes] = await Promise.all([
            categoryAPI.getAll().catch(() => ({ success: false, categories: [] })),
            firmwareAPI.getAll().catch(() => ({ success: false, firmware: [] })),
            donationAPI.getAll().catch(() => ({ success: false, donations: [] }))
          ]);

          if (categoriesRes.success) {
            const categories = categoriesRes.categories.map((c: any) => ({
              id: c.id,
              name: c.name,
              parentId: c.parentId,
              orderIndex: c.orderIndex,
              icon: c.icon,
              description: c.description,
              children: c.children || [],
              createdAt: c.createdAt
            }));
            set({ categories });
          }

          if (firmwareRes.success) {
            const firmware = firmwareRes.firmware.map((f: any) => ({
              id: f.id,
              title: f.title,
              description: f.description,
              version: f.version,
              categoryId: f.categoryId,
              categoryName: f.categoryName,
              tags: f.tags || [],
              uploaderId: f.uploaderId,
              uploaderName: f.uploaderName,
              filePath: f.filePath,
              fileSize: f.fileSize,
              downloadCount: f.downloadCount,
              status: f.status,
              createdAt: f.createdAt,
              updatedAt: f.updatedAt
            }));
            set({ firmware });
          }

          if (donationsRes.success) {
            const donations = donationsRes.donations.map((d: any) => ({
              id: d.id,
              userId: d.userId,
              userNickname: d.userNickname,
              amount: d.amount,
              type: d.type,
              createdAt: d.createdAt
            }));
            set({ donations });
          }

          set({ isLoading: false });
        } catch (error: any) {
          console.error('加载数据失败:', error);
          set({ error: error.message, isLoading: false });
        }
      }
    }),
    {
      name: 'ssd-tool-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        categories: state.categories,
        firmware: state.firmware,
        tags: state.tags,
        donations: state.donations,
        contributors: state.contributors,
        config: state.config
      }),
      merge: (persistedState: unknown, currentState: AppState) => {
        const typed = persistedState as Partial<AppState> | null;
        if (typed?.config?.homeModules && typed.config.homeModules.length === 0) {
          return {
            ...currentState,
            ...(typed || {}),
            config: {
              ...currentState.config,
              ...(typed?.config || {}),
              homeModules: currentState.config.homeModules,
              moduleOrder: currentState.config.moduleOrder,
            },
          };
        }
        return { ...currentState, ...(typed || {}) };
      },
    }
  )
);
