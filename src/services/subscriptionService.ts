import { apiClient } from "../../api/apiClient"

export const getSubscriptions = () => {
  return apiClient("/ad-subscription-packages")
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