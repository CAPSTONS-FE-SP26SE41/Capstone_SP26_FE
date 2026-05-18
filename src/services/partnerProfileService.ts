import { apiClient } from "../../api/apiClient"

export interface PartnerProfileData {
  id: string
  accountId: string
  businessName: string
  businessAddress: string
  businessPhone: string
  businessEmail: string
  businessLicenseUrl: string
  businessAvatarUrl: string
  createdAt: string
  updatedAt: string | null
}

export interface UpdatePartnerProfileData {
  businessName?: string
  businessAddress?: string
  businessPhone?: string
  businessEmail?: string
}

/**
 * [Partner] Lấy thông tin hồ sơ doanh nghiệp của mình
 */
export const getMyPartnerProfile = async (): Promise<PartnerProfileData> => {
  return apiClient("/partner-profile/my")
}

/**
 * [Partner] Cập nhật thông tin doanh nghiệp
 */
export const updateMyPartnerProfile = async (data: UpdatePartnerProfileData): Promise<PartnerProfileData> => {
  return apiClient("/partner-profile/my", {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

/**
 * [Partner] Cập nhật logo/ảnh đại diện doanh nghiệp
 */
export const updatePartnerAvatar = async (avatarFile: File): Promise<PartnerProfileData> => {
  const formData = new FormData()
  formData.append("avatarFile", avatarFile)

  return apiClient("/partner-profile/avatar", {
    method: "PATCH",
    body: formData,
  })
}
