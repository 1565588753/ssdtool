import { create } from 'zustand';
import { User, Category, Firmware, Donation, Contributor, Config, Download } from '../../shared/types';
import { mockCategories, mockFirmware, mockDonations, mockContributors, mockConfig } from '../lib/mockData';
import { authAPI, firmwareAPI, categoryAPI, donationAPI } from '../services/api';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, nickname: string) => Promise<boolean>;
  logout: () => void;

  categories: Category[];
  firmware: Firmware[];
  donations: Donation[];
  contributors: Contributor[];
  config: Config;
  downloads: Download[];

  getFirmwareById: (id: string) => Firmware | undefined;
  getFirmwareByCategory: (categoryId: string) => Firmware[];
  getHotFirmware: () => Firmware[];
  getLatestFirmware: () => Firmware[];
  downloadFirmware: (firmwareId: string) => Promise<boolean>;
  upgradeToPremium: () => Promise<boolean>;
  singleDownloadPayment: (firmwareId: string) => Promise<boolean>;

  selectedCategory: string | null;
  setSelectedCategory: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

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

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  categories: mockCategories,
  firmware: mockFirmware,
  donations: mockDonations,
  contributors: mockContributors,
  config: mockConfig,
  downloads: [],
  selectedCategory: null,
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

  setSelectedCategory: (id) => set({ selectedCategory: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  loadInitialData: async () => {
    set({ isLoading: true, error: null });
    try {
      // 尝试从 API 加载数据
      const [categoriesRes, firmwareRes, donationsRes, configRes] = await Promise.all([
        categoryAPI.getAll().catch(() => ({ success: false, categories: mockCategories })),
        firmwareAPI.getAll().catch(() => ({ success: false, firmware: mockFirmware })),
        donationAPI.getAll().catch(() => ({ success: false, donations: mockDonations })),
        Promise.resolve({ success: false, config: mockConfig })
      ]);

      if (categoriesRes.success) {
        // 转换分类数据格式
        const categories = categoriesRes.categories.map((c: any) => ({
          id: c.id,
          name: c.name,
          parentId: c.parentId,
          orderIndex: c.orderIndex,
          children: c.children || [],
          createdAt: c.createdAt
        }));
        set({ categories });
      }

      if (firmwareRes.success) {
        // 转换固件数据格式
        const firmware = firmwareRes.firmware.map((f: any) => ({
          id: f.id,
          title: f.title,
          description: f.description,
          version: f.version,
          categoryId: f.categoryId,
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
}));
