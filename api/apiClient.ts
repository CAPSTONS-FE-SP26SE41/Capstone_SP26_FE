// Base URL của backend API (vd: http://localhost:5131/api)
// Nếu biến môi trường chưa được set, dùng fallback để không bị fetch ra "undefined/...".
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5131/api"

export const apiClient = async (
  endpoint: string,
  options: RequestInit = {}
) => {

  // Lấy token của admin/staff.
  // Ưu tiên staff_token cho các endpoint /staff/... để tránh trường hợp
  // đang còn admin_token trong localStorage nhưng lại gọi API staff.
  const isStaffEndpoint =
    endpoint.startsWith("/staff/") || endpoint === "/staff"

  const token = isStaffEndpoint
    ? localStorage.getItem("staff_token") || localStorage.getItem("admin_token")
    : localStorage.getItem("admin_token") || localStorage.getItem("staff_token")

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
    const err = new Error(errorText || "API Error")
    ;(err as any).status = res.status
    throw err
  }

  const contentType = res.headers.get("content-type")

  if (contentType && contentType.includes("application/json")) {
    return res.json()
  }

  return res.text()
}