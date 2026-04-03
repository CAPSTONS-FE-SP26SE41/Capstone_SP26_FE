const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const apiClient = async (
  endpoint: string,
  options: RequestInit = {}
) => {

  const currentRole = localStorage.getItem("role")?.toLowerCase();
  let token = null;

  if (currentRole === "admin" || currentRole === "superadmin") {
    token = localStorage.getItem("admin_token");
  } else if (currentRole === "partner") {
    token = localStorage.getItem("partner_token");
  } else if (currentRole === "manager") {
    token = localStorage.getItem("manager_token");
  }

  // Fallback if role-based selection fails
  if (!token) {
    token = localStorage.getItem("admin_token") || 
            localStorage.getItem("partner_token") || 
            localStorage.getItem("manager_token");
  }


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