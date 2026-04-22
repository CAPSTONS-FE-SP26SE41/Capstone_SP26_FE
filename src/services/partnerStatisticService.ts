import { apiClient } from "../../api/apiClient";

export interface PoiStatusStats {
  active: number;
  pending: number;
  rejected: number;
  inactive: number;
}

export interface PoiTypeStats {
  type: string;
  count: number;
}

export interface AdStatusStats {
  active: number;
  pendingApproval: number;
  paused: number;
  expired: number;
  rejected: number;
}

export interface PoiAdInteractionStats {
  poiId: string;
  poiName: string;
  totalSaveCount: number;
}

export interface PartnerDashboardStats {
  poiStatusStats: PoiStatusStats;
  poiTypeStats: PoiTypeStats[];
  totalPromotionSaveCount: number;
  adStatusStats: AdStatusStats;
  topInteractedPois: PoiAdInteractionStats[];
}

export const getPartnerDashboardStats = async (): Promise<PartnerDashboardStats> => {
  return apiClient("/partner/dashboard/stats");
};
