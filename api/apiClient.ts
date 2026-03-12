const BASE_URL = "https://localhost:7176/api"

export const apiClient = async (
  endpoint: string,
  options: RequestInit = {}
) => {

  const token = localStorage.getItem("admin_token")

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...options.headers,
    },
  })

  if (!res.ok) {
    throw new Error("API Error")
  }

  const contentType = res.headers.get("content-type")

  if (contentType && contentType.includes("application/json")) {
    return res.json()
  }


  return res.text()
}