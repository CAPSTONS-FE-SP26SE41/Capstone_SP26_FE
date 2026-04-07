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

export interface AdvertisementDetail {
  adId: string;
  accountId: string;
  packageId: string | null;
  poiId: string;
  title: string;
  content: string;
  imageUrl: string;
  videoUrl: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  promotion: {
    promotionId: string;
    title: string;
    description: string;
    terms: string;
    status: string;
    saveCount: number;
  } | null;
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

// GET /api/advertisements/{id} (public)
export const getAdvertisementById = async (id: string): Promise<AdvertisementDetail | null> => {
  try {
    return await apiClient(`/advertisements/${id}`)
  } catch {
    return null
  }
}

// GET /api/advertisements/active (public)
export const getActiveAdvertisements = async (): Promise<AdvertisementDetail[]> => {
  const data = await apiClient("/advertisements/active")
  return Array.isArray(data) ? data : []
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
