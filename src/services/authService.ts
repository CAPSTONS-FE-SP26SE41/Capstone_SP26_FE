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