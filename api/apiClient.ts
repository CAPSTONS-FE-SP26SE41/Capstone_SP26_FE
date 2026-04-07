


export type ApiClientOptions = RequestInit & {
  /** Override automatic JSON/text parsing (e.g. file downloads). */
  parseAs?: "json" | "text" | "blob"
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5131/api";


export const apiClient = async (
  endpoint: string,
  options: ApiClientOptions = {}
) => {
  const { parseAs, ...fetchOptions } = options

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

  const hasBody =
    fetchOptions.body !== undefined &&
    fetchOptions.body !== null &&
    fetchOptions.body !== ""
  const isFormData =
    typeof FormData !== "undefined" && fetchOptions.body instanceof FormData

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers: {
      ...(hasBody && !isFormData ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...fetchOptions.headers,
    },
  })

  if (!res.ok) {
    const errorText = await res.text()
    const err = new Error(errorText || "API Error")
    ;(err as any).status = res.status
    throw err
  }

  if (parseAs === "blob") {
    return res.blob()
  }
  if (parseAs === "text") {
    return res.text()
  }
  if (parseAs === "json") {
    return res.json()
  }

  const contentType = res.headers.get("content-type")

  if (contentType && contentType.includes("application/json")) {
    return res.json()
  }

  return res.text()
}