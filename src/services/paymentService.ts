import { apiClient } from "../../api/apiClient"

export interface CreatePaymentRequest {
  packageId: string;
  amount?: number;
}

export interface PaymentResponse {
  message: string;
  bank: string;
  paymentId: string;
  transactionContent: string;
  amount: number;
  qrCodeUrl: string;
  status: string;
}

export const createPayment = async (data: CreatePaymentRequest): Promise<PaymentResponse> => {
  return apiClient("/payments/create", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export const getPaymentStatus = async (paymentId: string) => {
  return apiClient(`/payments/${paymentId}`)
}
