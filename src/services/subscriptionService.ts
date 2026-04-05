import { apiClient } from "../../api/apiClient"

export const getSubscriptions = () => {
  return apiClient("/ad-subscription-packages")
}

export const getMySubscriptions = () => {
  return apiClient("/account-subscriptions/my-subscriptions")
}

export const filterSubscriptions = (params: { title?: string; status?: string; sortPrice?: string }) => {
  const query = new URLSearchParams()
  if (params.title) query.append("title", params.title)
  if (params.status && params.status !== "Status") query.append("status", params.status)
  if (params.sortPrice) query.append("sortPrice", params.sortPrice)
  return apiClient(`/ad-subscription-packages/filter?${query.toString()}`)
}

export const getSubscriptionById = (id: string) => {
  return apiClient(`/ad-subscription-packages/${id}`)
}

export const createSubscription = (data: any) => {
  return apiClient("/ad-subscription-packages", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export const updateSubscription = (id: string, data: any) => {
  return apiClient(`/ad-subscription-packages/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export const deleteSubscription = (id: string) => {
  return apiClient(`/ad-subscription-packages/${id}`, {
    method: "DELETE",
  })
}

export const activateSubscription = (id: string) => {
  return apiClient(`/ad-subscription-packages/${id}/activate`, {
    method: "PUT",
  })
}

export const deactivateSubscription = (id: string) => {
  return apiClient(`/ad-subscription-packages/${id}/deactivate`, {
    method: "PUT",
  })
}

/** Multipart upload — backend: ImportPackagesExcelForm.File */
export const importSubscriptionPackages = (file: File) => {
  const formData = new FormData()
  formData.append("File", file)
  return apiClient("/ad-subscription-packages/import", {
    method: "POST",
    body: formData,
  })
}

export const exportSubscriptionPackages = () => {
  return apiClient("/ad-subscription-packages/export", { parseAs: "blob" })
}