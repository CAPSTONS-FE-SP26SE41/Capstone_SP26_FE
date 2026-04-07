import { apiClient } from "../../api/apiClient"

export const getSummary = () =>
  apiClient("/admin/analytics/summary")

export const getRevenue = () =>
  apiClient("/admin/analytics/revenue")

export const getAccountsStatus = () =>
  apiClient("/admin/analytics/accounts-status")

export const getSubscriptionStats = () =>
  apiClient("/admin/analytics/subscription-stats")