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
  expiresAt?: string;
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
  accountEmail: string;
  createdAt?: string;
}

export const getPaymentHistory = async (page: number = 1, pageSize: number = 10) => {
  return apiClient(`/payments/history?page=${page}&pageSize=${pageSize}`);
}

export interface TransactionPagedResponse {
  items: PaymentHistoryItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export const getAllTransactions = async (
  page: number = 1,
  pageSize: number = 15,
  status?: string,
  sortOrder?: string
): Promise<TransactionPagedResponse> => {
  const params = new URLSearchParams()
  params.append("page", page.toString())
  params.append("pageSize", pageSize.toString())
  if (status) params.append("status", status)
  if (sortOrder) params.append("sortOrder", sortOrder)
  return apiClient(`/payments/admin/all-transactions?${params.toString()}`)
}