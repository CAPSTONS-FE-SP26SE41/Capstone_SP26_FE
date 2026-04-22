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

export const inactivateMyAdvertisement = async (id: string) => {
  return apiClient(`/advertisements/my-ads/${id}/inactivate`, {
    method: "PATCH",
  })
}

export const activateMyAdvertisement = async (id: string) => {
  return apiClient(`/advertisements/my-ads/${id}/activate`, {
    method: "PATCH",
  })
}

export const createAdvertisement = async (data: any, imageFile?: File | null, videoFile?: File | null) => {
  const formData = new FormData()
  formData.append('PoiId', data.poiId)
  formData.append('Title', data.title)
  formData.append('Content', data.content)
  formData.append('StartDate', data.startDate)
  formData.append('EndDate', data.endDate)
  
  if (imageFile) formData.append('ImageFile', imageFile)
  if (videoFile) formData.append('VideoFile', videoFile)

  if (data.promotion) {
    if (data.promotion.title) formData.append('Promotion.Title', data.promotion.title)
    if (data.promotion.description) formData.append('Promotion.Description', data.promotion.description)
    if (data.promotion.terms) formData.append('Promotion.Terms', data.promotion.terms)
  }

  return apiClient("/advertisements", {
    method: "POST",
    body: formData,
  })
}

export const updateAdvertisement = async (id: string, data: any, imageFile?: File | null, videoFile?: File | null) => {
  const formData = new FormData()
  if (data.title) formData.append('Title', data.title)
  if (data.content) formData.append('Content', data.content)
  if (data.startDate) formData.append('StartDate', data.startDate)
  if (data.endDate) formData.append('EndDate', data.endDate)
  
  if (imageFile) formData.append('ImageFile', imageFile)
  if (videoFile) formData.append('VideoFile', videoFile)

  if (data.promotion) {
    if (data.promotion.title) formData.append('Promotion.Title', data.promotion.title)
    if (data.promotion.description) formData.append('Promotion.Description', data.promotion.description)
    if (data.promotion.terms) formData.append('Promotion.Terms', data.promotion.terms)
  }

  return apiClient(`/advertisements/${id}`, {
    method: "PUT",
    body: formData,
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

export const getManagerAccounts = async () => {
  return apiClient("/manager/accounts")
}

export const getManagerAccountAdvertisements = async (accountId: string) => {
  return apiClient(`/manager/accounts/${accountId}/advertisements`)
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
