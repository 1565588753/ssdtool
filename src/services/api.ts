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

// 管理员 API
export const adminAPI = {
  // 用户管理
  getUsers: () =>
    fetchAPI<{ success: boolean; users: any[] }>('/api/admin/users'),
  
  updateUserRole: (id: string, role: string) =>
    fetchAPI<{ success: boolean }>(`/api/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),
  
  deleteUser: (id: string) =>
    fetchAPI<{ success: boolean }>(`/api/admin/users/${id}`, {
      method: 'DELETE',
    }),
  
  // 固件管理
  getFirmware: () =>
    fetchAPI<{ success: boolean; firmware: any[] }>('/api/admin/firmware'),
  
  updateFirmwareStatus: (id: string, status: string) =>
    fetchAPI<{ success: boolean }>(`/api/admin/firmware/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  
  deleteFirmware: (id: string) =>
    fetchAPI<{ success: boolean }>(`/api/admin/firmware/${id}`, {
      method: 'DELETE',
    }),
  
  // 分类管理
  getCategories: () =>
    fetchAPI<{ success: boolean; categories: any[]; categoryTree: any[] }>('/api/admin/categories'),
  
  createCategory: (data: { name: string; parentId?: string; orderIndex?: number }) =>
    fetchAPI<{ success: boolean; id: string }>('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateCategory: (id: string, data: { name?: string; parentId?: string; orderIndex?: number }) =>
    fetchAPI<{ success: boolean }>(`/api/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  deleteCategory: (id: string) =>
    fetchAPI<{ success: boolean }>(`/api/admin/categories/${id}`, {
      method: 'DELETE',
    }),
  
  // 仪表盘
  getDashboard: () =>
    fetchAPI<{ success: boolean; dashboard: any }>('/api/admin/dashboard'),
  
  // 系统配置
  getConfig: () =>
    fetchAPI<{ success: boolean; config: any }>('/api/admin/config'),
  
  updateConfig: (data: { siteSettings?: any; moduleSettings?: any; quotaSettings?: any }) =>
    fetchAPI<{ success: boolean }>('/api/admin/config', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// 固件上传 API
export const uploadFirmwareAPI = {
  upload: (formData: FormData) =>
    fetch(`${API_BASE_URL}/api/firmware/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'x-user-id': localStorage.getItem('userId') || '',
      },
    }).then(response => response.json()),
};

// 公共统计 API
export const statsAPI = {
  getPublicStats: () =>
    fetchAPI<{ success: boolean; stats: any }>('/api/stats'),
};

export default {
  auth: authAPI,
  firmware: firmwareAPI,
  category: categoryAPI,
  donation: donationAPI,
  config: configAPI,
  admin: adminAPI,
  uploadFirmware: uploadFirmwareAPI,
  stats: statsAPI,
};
