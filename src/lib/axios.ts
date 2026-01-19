// src/lib/axios.ts
import axios from 'axios';

// 1. Tạo instance (bản sao) của axios với cấu hình mặc định
export const axiosClient = axios.create({
  baseURL: 'https://api.domain-backend-cua-ban.com/api/v1', // <-- Thay link API thật vào đây
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Cấu hình Interceptor (Bộ đón lõng)
// Tác dụng: Tự động gắn Token vào mọi request gửi đi (nếu có đăng nhập)
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken'); // Lấy token từ bộ nhớ trình duyệt
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. Xử lý lỗi chung (Optional)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Ví dụ: Nếu lỗi 401 (Hết hạn token) thì tự logout
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);