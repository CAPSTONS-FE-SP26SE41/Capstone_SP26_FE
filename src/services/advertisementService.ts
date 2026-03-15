import { apiClient } from "../../api/apiClient"

export const getAdvertisements = async () => {
  return apiClient("/advertisements")
}

export const getPendingAdvertisements = async () => {
  return apiClient("/advertisements/pending")
}

export const approveAdvertisement = async (id: string) => {
  return apiClient(`/advertisements/${id}/pending`, {
    method: "POST",
  })
}

export const rejectAdvertisement = async (id: string) => {
  return apiClient(`/advertisements/${id}/reject`, {
    method: "POST",
  })
}