const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const apiClient = async (
  endpoint: string,
  options: RequestInit = {}
) => {

  // lấy token từ localStorage (ưu tiên theo vai trò nếu cần)
  const partnerToken = localStorage.getItem("partner_token")
  const adminToken = localStorage.getItem("admin_token")
  const staffToken = localStorage.getItem("staff_token")
  
  const token = partnerToken || adminToken || staffToken

  if (!token && endpoint !== "/auth/login") {
     console.warn(`[apiClient] No token found for ${endpoint}`)
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(errorText || "API Error")
  }

  const contentType = res.headers.get("content-type")

  if (contentType && contentType.includes("application/json")) {
    return res.json()
  }

  return res.text()
}