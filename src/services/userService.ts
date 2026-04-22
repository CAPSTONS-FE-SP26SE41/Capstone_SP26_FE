import { apiClient } from "../../api/apiClient"

export const getUsers = () => {
  return apiClient("/user/all")
}

export const getUserById = (id: string) => {
  return apiClient(`/user/${id}`)
}

export const updateUser = (formData: FormData) => {
  return apiClient("/user/update", {
    method: "PUT",
    body: formData,
  })
}