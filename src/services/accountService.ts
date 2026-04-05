import { apiClient } from "../../api/apiClient"

export const getAccounts = (page: number = 1, pageSize: number = 10) => {
  return apiClient(`/admin/accounts?page=${page}&pageSize=${pageSize}`)
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
  if (params.keyword) query.append("keyword", params.keyword)
  if (params.role && params.role !== "Role") query.append("role", params.role.trim())
  if (params.status && params.status !== "Status") query.append("status", params.status)
  
  return apiClient(`/admin/accounts/filter?${query.toString()}`)
}

export const activateAccount = (id: string) => {
  return apiClient(`/admin/accounts/${id}/activate`, { method: "PUT" })
}

export const deactivateAccount = (id: string) => {
  return apiClient(`/admin/accounts/${id}/deactivate`, { method: "PUT" })
}

export type CreateAccountPayload = {
  email: string
  password: string
  name: string
  roleName: string
}

export type UpdateAccountPayload = {
  email?: string
  name?: string
  roleId?: number
  password?: string
}

export const createAccount = (data: CreateAccountPayload) => {
  return apiClient(`/admin/accounts`, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export const updateAccount = (id: string, data: UpdateAccountPayload) => {
  return apiClient(`/admin/accounts/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export const deleteAccount = (id: string) => {
  return apiClient(`/admin/accounts/${id}`, {
    method: "DELETE",
  })
}

export const importAccounts = (file: File) => {
  const formData = new FormData()
  formData.append("file", file)
  return apiClient(`/admin/accounts/import`, { method: "POST", body: formData })
}

export const exportAccounts = () => {
  return apiClient(`/admin/accounts/export`, { parseAs: "blob" })
}