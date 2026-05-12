/**
 * API 服务层
 * 封装所有与后端的 API 通信
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// 通用的 fetch 包装器
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // 如果有用户 ID，从 localStorage 获取
  const userId = localStorage.getItem('userId');
  if (userId) {
    (defaultHeaders as Record<string, string>)['x-user-id'] = userId;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '请求失败');
  }

  return response.json();
}

// 认证 API
export const authAPI = {
  login: (email: string, password: string) =>
    fetchAPI<{ success: boolean; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string, nickname: string) =>
    fetchAPI<{ success: boolean }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, nickname }),
    }),

  logout: () =>
    fetchAPI<{ success: boolean }>('/api/auth/logout', {
      method: 'POST',
    }),

  getUser: () =>
    fetchAPI<{ success: boolean; user: any }>('/api/auth/user'),
};

// 固件 API
export const firmwareAPI = {
  getAll: () =>
    fetchAPI<{ success: boolean; firmware: any[] }>('/api/firmware'),

  getHot: (limit: number = 6) =>
    fetchAPI<{ success: boolean; firmware: any[] }>(
      `/api/firmware/hot?limit=${limit}`
    ),

  getLatest: (limit: number = 6) =>
    fetchAPI<{ success: boolean; firmware: any[] }>(
      `/api/firmware/latest?limit=${limit}`
    ),

  getById: (id: string) =>
    fetchAPI<{ success: boolean; firmware: any }>(`/api/firmware/${id}`),

  getByCategory: (categoryId: string) =>
    fetchAPI<{ success: boolean; firmware: any[] }>(
      `/api/firmware/category/${categoryId}`
    ),

  download: (id: string) =>
    fetchAPI<{ success: boolean; downloadUrl: string }>(
      `/api/firmware/${id}/download`,
      {
        method: 'POST',
      }
    ),
};

// 分类 API
export const categoryAPI = {
  getAll: () =>
    fetchAPI<{ success: boolean; categories: any[] }>('/api/categories'),

  getById: (id: string) =>
    fetchAPI<{ success: boolean; category: any }>(`/api/categories/${id}`),

  getChildren: (id: string) =>
    fetchAPI<{ success: boolean; children: any[] }>(
      `/api/categories/${id}/children`
    ),
};

// 捐赠 API
export const donationAPI = {
  getAll: (limit: number = 20) =>
    fetchAPI<{ success: boolean; donations: any[] }>(
      `/api/donations?limit=${limit}`
    ),

  getStats: () =>
    fetchAPI<{ success: boolean; total: number }>('/api/donations/stats'),

  singleDownload: (firmwareId: string) =>
    fetchAPI<{ success: boolean }>('/api/donations/single-download', {
      method: 'POST',
      body: JSON.stringify({ firmwareId }),
    }),

  upgradePremium: () =>
    fetchAPI<{ success: boolean }>('/api/donations/premium-upgrade', {
      method: 'POST',
    }),

  getUserDownloads: () =>
    fetchAPI<{ success: boolean; downloads: any[] }>('/api/donations/user/downloads'),
};

// 系统配置 API
export const configAPI = {
  get: () =>
    fetchAPI<{
      success: boolean;
      config: {
        siteSettings: any;
        moduleSettings: any;
        quotaSettings: any;
      };
    }>('/api/donations/config'),
};

export default {
  auth: authAPI,
  firmware: firmwareAPI,
  category: categoryAPI,
  donation: donationAPI,
  config: configAPI,
};
