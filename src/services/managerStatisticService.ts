import { apiClient } from "../../api/apiClient";

export interface ApprovalRatio {
  totalProcessed: number;
  approvedPercentage: number;
  rejectedPercentage: number;
}

export interface PoiCategoryStat {
  categoryName: string;
  count: number;
  percentage: number;
}

export interface AdStatusBreakdown {
  active: number;
  paused: number;
  expired: number;
  rejected: number;
}

export interface DailyPartnerGrowth {
  date: string;
  newPartners: number;
}

export interface PackageRevenueStat {
  packageName: string;
  totalRevenue: number;
}

export interface ManagerDashboardResponse {
  pendingPois: number;
  pendingAds: number;
  poiApprovalRatio: ApprovalRatio;
  adApprovalRatio: ApprovalRatio;
  topPoiCategories: PoiCategoryStat[];
  adStatusBreakdown: AdStatusBreakdown;
  newPartnersGrowth: DailyPartnerGrowth[];
  packageRevenue: PackageRevenueStat[];
}

export const getManagerDashboardStats = async (
  period: string = "daily",
  startDate?: string,
  endDate?: string
): Promise<ManagerDashboardResponse> => {
  const params = new URLSearchParams();
  if (period) params.append("period", period);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const queryString = params.toString() ? `?${params.toString()}` : "";
  return apiClient(`/manager/dashboard/statistics${queryString}`);
};
