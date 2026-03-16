const BASE_URL = "https://localhost:7176/api"

export const apiClient = async (
  endpoint: string,
  options: RequestInit = {}
) => {

  // lấy token của admin hoặc staff
  const token =
    localStorage.getItem("admin_token") ||
    localStorage.getItem("staff_token")

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