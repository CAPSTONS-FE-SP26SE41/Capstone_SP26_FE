import { apiClient } from "../../api/apiClient"

export interface PartnerRequestResponse {
  id: string
  accountId: string
  accountName: string
  accountEmail: string
  businessName: string
  businessAddress: string
  businessPhone: string
  businessEmail: string
  businessLicenseUrl: string
  status: string
  adminNote: string
  createdAt: string
  reviewedAt: string | null
  reviewedBy: string | null
}

export interface ReviewPartnerRequestPayload {
  isApproved: boolean
  adminNote: string
}

/**
 * Lấy danh sách yêu cầu đăng ký đối tác (PartnerRequest) đang chờ duyệt
 */
export const getPendingPartnerRequests = async (page: number = 1, pageSize: number = 10): Promise<{
  items: PartnerRequestResponse[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}> => {
  return apiClient(`/partner-requests/pending?page=${page}&pageSize=${pageSize}`)
}

/**
 * Phê duyệt hoặc từ chối yêu cầu đăng ký đối tác
 */
export const reviewPartnerRequest = async (id: string, payload: ReviewPartnerRequestPayload): Promise<PartnerRequestResponse> => {
  return apiClient(`/partner-requests/${id}/review`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
}
