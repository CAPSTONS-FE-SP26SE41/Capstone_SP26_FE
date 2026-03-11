import { apiClient } from "../../api/apiClient"

export const login = (email: string, password: string) => {
  return apiClient("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  })
}