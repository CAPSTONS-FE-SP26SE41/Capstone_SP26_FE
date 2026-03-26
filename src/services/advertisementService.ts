import { apiClient } from "../../api/apiClient"

export interface CreateAdRequest {
  poiId: string;
  title: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  startDate: string;
  endDate: string;
}

export const getMyAdvertisements = async () => {
  return apiClient("/advertisements/my-ads")
}

export const createAdvertisement = async (data: CreateAdRequest) => {
  return apiClient("/advertisements", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export const getPendingAdvertisements = async () => {
  return apiClient("/advertisements/pending")
}

export const approveAdvertisement = async (id: string) => {
  return apiClient(`/advertisements/${id}/approve`, {
    method: "POST",
  })
}

export const rejectAdvertisement = async (id: string, reason?: string) => {
  return apiClient(`/advertisements/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  })
}