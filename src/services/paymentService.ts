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

export const getPartnerTransactions = async (page: number = 1, pageSize: number = 10) => {
  return apiClient(`/payments/partner/transactions?page=${page}&pageSize=${pageSize}`)
}

export interface PaymentHistoryItem {
  paymentId: string;
  subscriptionId: string;
  packageId: string;
  packageTitle: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  transactionContent: string;
  transactionDate: string;
  accountNumber: string;
  subAccount: any;
  amountIn: number;
  accumulated: number;
  gateway: string;
  code: any;
  paidAt: string;
  accountId: string;
}

export const getPaymentHistory = async (page: number = 1, pageSize: number = 10) => {
  return apiClient(`/payments/history?page=${page}&pageSize=${pageSize}`);
}