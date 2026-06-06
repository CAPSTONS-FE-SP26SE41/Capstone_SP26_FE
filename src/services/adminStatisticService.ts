import { apiClient } from "../../api/apiClient";

export interface AccountRoleBreakdown {
  userCount: number;
  partnerCount: number;
  managerCount: number;
  staffCount: number;
}

export interface DailyAccountGrowth {
  date: string;
  newAccounts: number;
}

export interface PackagePopularity {
  packageName: string;
  userCount: number;
}

export interface AdminDashboardResponse {
  totalAccounts: number;
  totalRevenue: number;
  activeSubscriptions: number;
  accountRoles: AccountRoleBreakdown;
  accountGrowth: DailyAccountGrowth[];
  packagePopularity: PackagePopularity[];
}

export const getAdminDashboardStats = async (
  period: string = "daily",
  startDate?: string,
  endDate?: string
): Promise<AdminDashboardResponse> => {
  const params = new URLSearchParams();
  if (period) params.append("period", period);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const queryString = params.toString() ? `?${params.toString()}` : "";
  return apiClient(`/admin/dashboard/statistics${queryString}`);
};
