
// 用户类型
export interface User {
  id: string;
  email: string;
  nickname: string;
  avatar?: string;
  role: 'admin' | 'maintainer' | 'user';
  downloadQuota: number;
  downloadsUsed: number;
  quotaResetDate: string;
  isPremium: boolean;
  createdAt: string;
}

// 分类类型
export interface Category {
  id: string;
  name: string;
  parentId?: string;
  orderIndex: number;
  children?: Category[];
  createdAt: string;
}

// 固件类型
export interface Firmware {
  id: string;
  title: string;
  description: string;
  version: string;
  categoryId: string;
  uploaderId: string;
  uploaderName?: string;
  filePath: string;
  fileSize: number;
  downloadCount: number;
  isPaid: boolean;
  price?: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

// 捐赠记录
export interface Donation {
  id: string;
  userId?: string;
  userNickname: string;
  amount: number;
  type: 'single_download' | 'premium_upgrade';
  createdAt: string;
}

// 下载记录
export interface Download {
  id: string;
  userId: string;
  firmwareId: string;
  firmwareTitle?: string;
  createdAt: string;
}

// 贡献者
export interface Contributor {
  userId: string;
  nickname: string;
  avatar?: string;
  firmwareCount: number;
}

// 系统配置
export interface SiteSettings {
  name: string;
  description: string;
}

export interface ModuleSettings {
  showHero: boolean;
  showHot: boolean;
  showLatest: boolean;
  showDonations: boolean;
  showContributors: boolean;
}

export interface QuotaSettings {
  freeQuota: number;
  premiumQuota: number;
  singleDownloadPrice: number;
  premiumPrice: number;
}

export interface Config {
  siteSettings: SiteSettings;
  moduleSettings: ModuleSettings;
  quotaSettings: QuotaSettings;
}
