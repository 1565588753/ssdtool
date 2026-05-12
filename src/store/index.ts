import { create } from 'zustand';
import { User, Category, Firmware, Donation, Contributor, Config, Download } from '../../shared/types';
import { mockCategories, mockFirmware, mockDonations, mockContributors, mockConfig } from '../lib/mockData';

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

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    set({ user: mockUser, isAuthenticated: true });
    return true;
  },

  register: async (email, password, nickname) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newUser: User = {
      ...mockUser,
      email,
      nickname,
      id: `user-${Date.now()}`
    };
    set({ user: newUser, isAuthenticated: true });
    return true;
  },

  logout: () => set({ user: null, isAuthenticated: false }),

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
    const quota = state.user.isPremium ? state.config.quotaSettings.premiumQuota : state.config.quotaSettings.freeQuota;
    if (state.user.downloadsUsed >= quota) return false;
    await new Promise(resolve => setTimeout(resolve, 500));
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
  },

  upgradeToPremium: async () => {
    const state = get();
    if (!state.user) return false;
    await new Promise(resolve => setTimeout(resolve, 1000));
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
  },

  singleDownloadPayment: async (firmwareId) => {
    const state = get();
    await new Promise(resolve => setTimeout(resolve, 1000));
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
  },

  setSelectedCategory: (id) => set({ selectedCategory: id }),
  setSearchQuery: (query) => set({ searchQuery: query })
}));
