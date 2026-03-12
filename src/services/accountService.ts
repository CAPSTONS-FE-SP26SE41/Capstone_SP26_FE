import { apiClient } from "../../api/apiClient"

export const getAccounts = () => {
  return apiClient("/admin/accounts")
}

export const activateAccount = (id: string) => {
  return apiClient(`/admin/accounts/${id}/activate`, {
    method: "PUT",
  })
}

export const deactivateAccount = (id: string) => {
  return apiClient(`/admin/accounts/${id}/deactivate`, {
    method: "PUT",
  })
}