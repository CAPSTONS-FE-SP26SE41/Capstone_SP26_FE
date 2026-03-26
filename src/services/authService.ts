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

export const logout = () => {
  localStorage.removeItem("admin_token")
  localStorage.removeItem("partner_token")
  localStorage.removeItem("staff_token")
  localStorage.removeItem("role")
  localStorage.removeItem("user_name")
  localStorage.removeItem("user_role")
}