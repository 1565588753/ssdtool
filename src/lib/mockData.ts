
import { Category, Firmware, Donation, Contributor, Config } from '../../shared/types';

// 模拟分类数据
export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: '慧荣 (SMI)',
    parentId: undefined,
    orderIndex: 1,
    createdAt: new Date().toISOString(),
    children: [
      {
        id: 'cat-1-1',
        name: 'SM2258XT',
        parentId: 'cat-1',
        orderIndex: 1,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'cat-1-2',
        name: 'SM2259XT',
        parentId: 'cat-1',
        orderIndex: 2,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'cat-1-3',
        name: 'SM2263XT',
        parentId: 'cat-1',
        orderIndex: 3,
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'cat-2',
    name: '群联 (Phison)',
    parentId: undefined,
    orderIndex: 2,
    createdAt: new Date().toISOString(),
    children: [
      {
        id: 'cat-2-1',
        name: 'PS3111',
        parentId: 'cat-2',
        orderIndex: 1,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'cat-2-2',
        name: 'PS5013',
        parentId: 'cat-2',
        orderIndex: 2,
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'cat-3',
    name: '联芸 (Maxio)',
    parentId: undefined,
    orderIndex: 3,
    createdAt: new Date().toISOString(),
    children: [
      {
        id: 'cat-3-1',
        name: 'MAP1202',
        parentId: 'cat-3',
        orderIndex: 1,
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'cat-4',
    name: '得一微 (YMC)',
    parentId: undefined,
    orderIndex: 4,
    createdAt: new Date().toISOString(),
  },
];

// 模拟固件数据
export const mockFirmware: Firmware[] = [
  {
    id: 'fw-1',
    title: 'SM2258XT 开卡工具 v1.2',
    description: '慧荣SM2258XT主控固态硬盘开卡工具，支持多种闪存颗粒，修复SSD无法识别问题。',
    version: '1.2',
    categoryId: 'cat-1-1',
    uploaderId: 'user-1',
    uploaderName: '科技达人',
    filePath: '/files/sm2258xt-v1.2.zip',
    fileSize: 15 * 1024 * 1024,
    downloadCount: 2580,
    isPaid: false,
    status: 'approved',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'fw-2',
    title: 'PS3111 量产工具 v2.5',
    description: '群联PS3111主控SSD开卡工具，支持最新固件版本，提供完整的开卡教程。',
    version: '2.5',
    categoryId: 'cat-2-1',
    uploaderId: 'user-2',
    uploaderName: '硬件维修师',
    filePath: '/files/ps3111-v2.5.zip',
    fileSize: 22 * 1024 * 1024,
    downloadCount: 1845,
    isPaid: false,
    status: 'approved',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'fw-3',
    title: 'SM2259XT 高级工具 v3.0',
    description: '专业版SM2259XT开卡工具，支持高级设置和调试功能，适合专业维修人员使用。',
    version: '3.0',
    categoryId: 'cat-1-2',
    uploaderId: 'user-1',
    uploaderName: '科技达人',
    filePath: '/files/sm2259xt-pro-v3.0.zip',
    fileSize: 35 * 1024 * 1024,
    downloadCount: 890,
    isPaid: true,
    price: 19.9,
    status: 'approved',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'fw-4',
    title: 'MAP1202 开卡程序 v1.0',
    description: '联芸MAP1202主控专用开卡工具，操作简单，支持自动检测颗粒。',
    version: '1.0',
    categoryId: 'cat-3-1',
    uploaderId: 'user-2',
    uploaderName: '硬件维修师',
    filePath: '/files/map1202-v1.0.zip',
    fileSize: 12 * 1024 * 1024,
    downloadCount: 654,
    isPaid: false,
    status: 'approved',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'fw-5',
    title: 'PS5013 修复工具 v1.8',
    description: 'PS5013主控SSD修复工具，可解决掉盘、格式化失败等常见问题。',
    version: '1.8',
    categoryId: 'cat-2-2',
    uploaderId: 'user-3',
    uploaderName: 'SSD工程师',
    filePath: '/files/ps5013-fix-v1.8.zip',
    fileSize: 18 * 1024 * 1024,
    downloadCount: 420,
    isPaid: false,
    status: 'approved',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'fw-6',
    title: 'SM2263XT 工具包 v2.1',
    description: 'SM2263XT完整工具包，包含开卡工具、驱动程序和使用说明书。',
    version: '2.1',
    categoryId: 'cat-1-3',
    uploaderId: 'user-1',
    uploaderName: '科技达人',
    filePath: '/files/sm2263xt-package-v2.1.zip',
    fileSize: 45 * 1024 * 1024,
    downloadCount: 310,
    isPaid: false,
    status: 'approved',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// 模拟捐赠数据
export const mockDonations: Donation[] = [
  { id: 'don-1', userNickname: '张*明', amount: 8, type: 'premium_upgrade', createdAt: new Date(Date.now() - 1 * 60 * 1000).toISOString() },
  { id: 'don-2', userNickname: '李*华', amount: 1, type: 'single_download', createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString() },
  { id: 'don-3', userNickname: '王*强', amount: 8, type: 'premium_upgrade', createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
  { id: 'don-4', userNickname: '赵*伟', amount: 1, type: 'single_download', createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString() },
  { id: 'don-5', userNickname: '刘*娜', amount: 8, type: 'premium_upgrade', createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString() },
];

// 模拟贡献者数据
export const mockContributors: Contributor[] = [
  { userId: 'user-1', nickname: '科技达人', avatar: undefined, firmwareCount: 15 },
  { userId: 'user-2', nickname: '硬件维修师', avatar: undefined, firmwareCount: 12 },
  { userId: 'user-3', nickname: 'SSD工程师', avatar: undefined, firmwareCount: 8 },
  { userId: 'user-4', nickname: '数码狂人', avatar: undefined, firmwareCount: 6 },
  { userId: 'user-5', nickname: '维修专家', avatar: undefined, firmwareCount: 5 },
];

// 模拟系统配置
export const mockConfig: Config = {
  siteSettings: {
    name: 'SSD开卡工具站',
    description: '专业的固态硬盘开卡工具分享平台',
  },
  moduleSettings: {
    showHero: true,
    showHot: true,
    showLatest: true,
    showDonations: true,
    showContributors: true,
  },
  quotaSettings: {
    freeQuota: 5,
    premiumQuota: 100,
    singleDownloadPrice: 1,
    premiumPrice: 8,
  },
};
