import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Category, Firmware, Donation, Contributor, Config, Download, Tag } from '../../shared/types';
import { mockCategories, mockFirmware, mockDonations, mockContributors, mockConfig, mockTags } from '../lib/mockData';
import { authAPI, firmwareAPI, categoryAPI, donationAPI } from '../services/api';

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
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, nickname: string) => Promise<boolean>;
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
  upgradeToPremium: () => Promise<boolean>;
  singleDownloadPayment: (firmwareId: string) => Promise<boolean>;

  // 分类管理
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'children'>) => void;
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

const mockUser: User = {
  id: 'user-100',
  email: 'demo@example.com',
  nickname: '演示用户',
  avatar: undefined,
  role: 'user',
  downloadQuota: 5,
  downloadsUsed: 2,
  quotaResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  isPremium: false,
  createdAt: new Date().toISOString()
};

const adminUser: User = {
  id: 'user-001',
  email: 'admin@example.com',
  nickname: '系统管理员',
  avatar: undefined,
  role: 'admin',
  downloadQuota: 9999,
  downloadsUsed: 0,
  quotaResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  isPremium: true,
  createdAt: new Date().toISOString()
};

// 默认首页模块
const defaultHomeModules: HomeModule[] = [
  { id: 'hero', name: '首屏横幅', enabled: true, order: 1, title: '', description: '' },
  { id: 'stats', name: '统计数据', enabled: true, order: 2, title: '', description: '' },
  { id: 'hot', name: '热门固件', enabled: true, order: 3, title: '热门固件', description: '下载量最高的开卡工具' },
  { id: 'latest', name: '最新上传', enabled: true, order: 4, title: '最新上传', description: '最新更新的开卡工具' },
  { id: 'donations', name: '爱心捐赠', enabled: true, order: 5, title: '爱心捐赠', description: '感谢支持网站运营的朋友们' },
  { id: 'contributors', name: '贡献榜', enabled: true, order: 6, title: '贡献榜', description: '感谢分享固件的贡献者们' },
  { id: 'cta', name: '行动号召', enabled: true, order: 7, title: '', description: '' }
];

// 默认广告位
const defaultAdSlots: AdSlot[] = [
  { id: 'ad-top', name: '顶部横幅', enabled: false, content: '', position: 'top' },
  { id: 'ad-sidebar', name: '侧边栏', enabled: false, content: '', position: 'sidebar' },
  { id: 'ad-bottom', name: '底部横幅', enabled: false, content: '', position: 'bottom' }
];

const extendedConfig: ExtendedConfig = {
  ...mockConfig,
  moduleOrder: defaultHomeModules.map(m => m.id),
  homeModules: defaultHomeModules,
  adSlots: defaultAdSlots
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      categories: [],
      firmware: [],
      tags: [],
      donations: [],
      contributors: [],
      config: extendedConfig,
      downloads: [],
      selectedCategory: null,
      selectedTags: [],
      searchQuery: '',
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          // 管理员账号验证（模拟）
          if (email === 'admin@example.com' && password === 'admin123') {
            localStorage.setItem('userId', adminUser.id);
            set({ user: adminUser, isAuthenticated: true, isLoading: false });
            return true;
          }

          // 尝试调用真实 API
          const response = await authAPI.login(email, password);
          if (response.success && response.user) {
            localStorage.setItem('userId', response.user.id);
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
            set({ user: userData, isAuthenticated: true, isLoading: false });
            return true;
          }
          set({ isLoading: false });
          return false;
        } catch (error: any) {
          // 如果 API 调用失败，使用模拟数据
          console.warn('API 调用失败，使用模拟登录:', error.message);
          localStorage.setItem('userId', mockUser.id);
          set({ user: mockUser, isAuthenticated: true, isLoading: false });
          return true;
        }
      },

      register: async (email, password, nickname) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register(email, password, nickname);
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
        set({ user: null, isAuthenticated: false });
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
            // 更新本地状态
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
            return true;
          }
          return false;
        } catch (error: any) {
          console.error('下载失败:', error);
          // 如果 API 调用失败，使用模拟逻辑
          const quota = state.user.isPremium ? state.config.quotaSettings.premiumQuota : state.config.quotaSettings.freeQuota;
          if (state.user.downloadsUsed >= quota) return false;

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
          return true;
        }
      },

      upgradeToPremium: async () => {
        const state = get();
        if (!state.user) return false;

        try {
          const response = await donationAPI.upgradePremium();
          if (response.success) {
            set({
              user: {
                ...state.user,
                isPremium: true,
                downloadQuota: state.config.quotaSettings.premiumQuota
              },
              donations: [
                {
                  id: `don-${Date.now()}`,
                  userId: state.user.id,
                  userNickname: state.user.nickname,
                  amount: state.config.quotaSettings.premiumPrice,
                  type: 'premium_upgrade',
                  createdAt: new Date().toISOString()
                },
                ...state.donations
              ]
            });
            return true;
          }
          return false;
        } catch (error: any) {
          console.error('升级 Premium 失败:', error);
          // 如果 API 调用失败，使用模拟逻辑
          set({
            user: {
              ...state.user,
              isPremium: true,
              downloadQuota: state.config.quotaSettings.premiumQuota
            },
            donations: [
              {
                id: `don-${Date.now()}`,
                userId: state.user.id,
                userNickname: state.user.nickname,
                amount: state.config.quotaSettings.premiumPrice,
                type: 'premium_upgrade',
                createdAt: new Date().toISOString()
              },
              ...state.donations
            ]
          });
          return true;
        }
      },

      singleDownloadPayment: async (firmwareId) => {
        const state = get();
        
        try {
          await donationAPI.singleDownload(firmwareId);
          return true;
        } catch (error: any) {
          console.error('单次下载赞助失败:', error);
          // 如果 API 调用失败，使用模拟逻辑
          const fw = state.getFirmwareById(firmwareId);
          set({
            donations: [
              {
                id: `don-${Date.now()}`,
                userId: state.user?.id,
                userNickname: state.user?.nickname || '游客用户',
                amount: state.config.quotaSettings.singleDownloadPrice,
                type: 'single_download',
                createdAt: new Date().toISOString()
              },
              ...state.donations
            ]
          });
          return true;
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
        const state = get();
        
        try {
          // 检查是否已经有扁平化的分类数据
          const hasValidCategories = state.categories.length > 0 && 
            state.categories.some(c => c.parentId === null);
          
          // 如果没有有效数据，加载模拟数据并扁平化
          if (!hasValidCategories) {
            const flatCategories = mockCategories.flatMap(cat => [
              { ...cat, children: [] },
              ...(cat.children || [])
            ]);
            set({ categories: flatCategories });
          }
          if (state.firmware.length === 0) {
            set({ firmware: mockFirmware });
          }
          if (state.tags.length === 0) {
            set({ tags: mockTags });
          }
          if (state.donations.length === 0) {
            set({ donations: mockDonations });
          }
          if (state.contributors.length === 0) {
            set({ contributors: mockContributors });
          }

          // 尝试从 API 加载数据
          const [categoriesRes, firmwareRes, donationsRes] = await Promise.all([
            categoryAPI.getAll().catch(() => ({ success: false, categories: [] })),
            firmwareAPI.getAll().catch(() => ({ success: false, firmware: [] })),
            donationAPI.getAll().catch(() => ({ success: false, donations: [] }))
          ]);

          if (categoriesRes.success && categoriesRes.categories.length > 0) {
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

          if (firmwareRes.success && firmwareRes.firmware.length > 0) {
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
              isPaid: f.isPaid,
              price: f.price,
              status: f.status,
              createdAt: f.createdAt,
              updatedAt: f.updatedAt
            }));
            set({ firmware });
          }

          if (donationsRes.success && donationsRes.donations.length > 0) {
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
        categories: state.categories,
        firmware: state.firmware,
        tags: state.tags,
        donations: state.donations,
        contributors: state.contributors,
        config: state.config
      })
    }
  )
);
