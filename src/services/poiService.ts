import { apiClient } from "../../api/apiClient"

export const getRecommendedPOI = async (limit: number = 10) => {
  return apiClient(`/pois/recommended?limit=${limit}`)
}