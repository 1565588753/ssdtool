
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

// 分类类型（支持多层级）
export interface Category {
  id: string;
  name: string;
  parentId?: string; // 父分类ID，为空表示一级分类
  orderIndex: number;
  icon?: string;
  description?: string;
  children?: Category[]; // 子分类
  createdAt: string;
}

// 标签类型
export interface Tag {
  id: string;
  name: string;
  slug: string;
  color?: string;
  description?: string;
  category: string; // 标签分类，如 "颗粒制程"、"固件年份" 等
  createdAt: string;
}

// 固件类型
export interface Firmware {
  id: string;
  title: string;
  description: string;
  version: string;
  categoryId: string;
  categoryName?: string;
  tags: string[]; // 标签ID数组
  uploaderId: string;
  uploaderName?: string;
  filePath: string;
  alistFilePath?: string;
  fileSize: number;
  downloadCount: number;
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
  type: 'premium_upgrade';
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
  premiumPrice: number;
}

export interface Config {
  siteSettings: SiteSettings;
  moduleSettings: ModuleSettings;
  quotaSettings: QuotaSettings;
}

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromEmail: string;
  fromName: string;
}

export interface AlistConfig {
  baseUrl: string;
}
