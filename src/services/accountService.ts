import { apiClient } from "../../api/apiClient"

export const getAccounts = (page: number = 1, pageSize: number = 10) => {
  return apiClient(`/auth/all?page=${page}&pageSize=${pageSize}`)
}

export interface FilterAccountParams {
  page?: number
  pageSize?: number
  keyword?: string
  role?: string
  status?: string
}

export const filterAccounts = (params: FilterAccountParams = {}) => {
  const query = new URLSearchParams()
  if (params.page) query.append("page", params.page.toString())
  if (params.pageSize) query.append("pageSize", params.pageSize.toString())
  if (params.keyword) query.append("name", params.keyword)
  if (params.role && params.role !== "Role") query.append("roleName", params.role.trim())
  if (params.status && params.status !== "Status") query.append("status", params.status)
  
  return apiClient(`/admin/accounts/filter?${query.toString()}`)
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