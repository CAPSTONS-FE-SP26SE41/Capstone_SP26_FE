# Environment Variable Setup Plan

## Goal Description
Set up environment variables for the frontend project to manage API configuration and other environment-specific settings. This involves creating `.env` files and updating the Axios client to use these variables instead of hardcoded strings.

## Configuration

### Environment Variables
| Biến | Giá trị | Mô tả |
|------|---------|-------|
| `VITE_API_BASE_URL` | `https://localhost:7176/api` | Backend API Base URL |

### Files Changed

#### [NEW] `.env`
```env
VITE_API_BASE_URL=https://localhost:7176/api
```

#### [MODIFY] `src/lib/axios.ts`
```typescript
export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Đọc từ file .env
  headers: {
    'Content-Type': 'application/json',
  },
});
```

## Verification
1. ✅ File `.env` đã được tạo với biến `VITE_API_BASE_URL`
2. ✅ `axios.ts` sử dụng `import.meta.env.VITE_API_BASE_URL`
3. ✅ URL khớp với Backend API: `https://localhost:7176/api`
