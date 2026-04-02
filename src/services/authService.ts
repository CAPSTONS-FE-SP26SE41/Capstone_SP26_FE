import { apiClient } from "../../api/apiClient"

export const login = async (email: string, password: string) => {

  try {

    const data = await apiClient("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    })

    return data

  } catch (error) {

    throw new Error("Invalid email or password")

  }

}

/** Xóa toàn bộ state đăng nhập trên client (JWT theo role). */
export const clearClientAuth = () => {
  localStorage.removeItem("admin_token")
  localStorage.removeItem("partner_token")
  localStorage.removeItem("manager_token")
  localStorage.removeItem("role")
  localStorage.removeItem("user_name")
  localStorage.removeItem("user_role")
}

/** Gọi BE đăng xuất (session) rồi xóa token trên client. */
export const logout = async () => {
  try {
    await apiClient("/auth/logout", {
      method: "POST",
    })
  } catch (error) {
    console.error("Logout API failed", error)
  }
  clearClientAuth()
}
