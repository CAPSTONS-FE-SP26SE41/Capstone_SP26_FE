import { apiClient } from "../../api/apiClient"

// ── Enums (match backend Domain.Enums) ──────────────────────────────
export type POIType = "Restaurant" | "Attraction" | "Cafe" | "Hotel" | "Museum" | "Park" | "Shopping" | "StreetFood" | "Landmark" | "Viewpoint" | "Beach" | "CulturalSite" | "HistoricalSite" | "Temple" | "Church" | "Nature" | "Waterfall" | "Market" | "NightMarket" | "Bar" | "Nightlife" | "Resort"
export type POIStatus = "Pending" | "Rejected" | "Active" | "Inactive"

export interface POITypeOption {
  value: POIType
  label: string
}

// ── Response types ──────────────────────────────────────────────────
export interface District {
  id: string
  name: string
}
export interface PartnerPOI {
  id: string
  name: string
  address: string
  approxCost: string

  openHour: string | null
  closeHour: string | null
  is24Hours: boolean
  visitRecommendation: string | null
  googleMapLink: string
  poiImgUrl: string | null
  isIndoor: boolean
  latitude: number
  longitude: number
  type: POIType
  status: POIStatus
  locationId: string
  locationName: string | null
  districtId?: string
  poiPreferences: string[]
}

export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

// ── Request types ───────────────────────────────────────────────────
export interface CreatePartnerPOIPayload {
  Name: string
  Address: string
  ApproxCost: string

  OpenHour: string
  CloseHour: string
  Is24Hours: boolean
  VisitRecommendation?: string
  GoogleMapLink: string
  IsIndoor: boolean
  Type: POIType
  LocationId: string
  DistrictId: string
  PoiPreferences: string[] // Guid[]
}

export interface UpdatePartnerPOIPayload {
  Name?: string
  Address?: string
  ApproxCost?: string

  OpenHour?: string
  CloseHour?: string
  Is24Hours?: boolean
  VisitRecommendation?: string
  GoogleMapLink?: string
  IsIndoor?: boolean
  Type?: POIType
  LocationId?: string
  DistrictId?: string
  PoiPreferences?: string[]
}

// ── Normalizer ──────────────────────────────────────────────────────
function normalizePOI(p: any): PartnerPOI {
  return {
    id: String(p?.Id ?? p?.id ?? ""),
    name: String(p?.Name ?? p?.name ?? ""),
    address: String(p?.Address ?? p?.address ?? ""),
    approxCost: String(p?.ApproxCost ?? p?.approxCost ?? ""),

    openHour: p?.OpenHour ?? p?.openHour ?? null,
    closeHour: p?.CloseHour ?? p?.closeHour ?? null,
    is24Hours: Boolean(p?.Is24Hours ?? p?.is24Hours ?? false),
    visitRecommendation: p?.VisitRecommendation ?? p?.visitRecommendation ?? null,
    googleMapLink: String(p?.GoogleMapLink ?? p?.googleMapLink ?? ""),
    poiImgUrl: p?.POIImgUrl ?? p?.poiImgUrl ?? null,
    isIndoor: Boolean(p?.IsIndoor ?? p?.isIndoor ?? false),
    latitude: Number(p?.Latitude ?? p?.latitude ?? 0),
    longitude: Number(p?.Longitude ?? p?.longitude ?? 0),
    type: (p?.Type ?? p?.type ?? "Attraction") as POIType,
    status: (p?.Status ?? p?.status ?? "Pending") as POIStatus,
    locationId: String(p?.LocationId ?? p?.locationId ?? ""),
    locationName: p?.LocationName ?? p?.locationName ?? null,
    districtId: String(p?.DistrictId ?? p?.districtId ?? ""),
    poiPreferences: Array.isArray(p?.POIPreferences ?? p?.poiPreferences)
      ? (p?.POIPreferences ?? p?.poiPreferences)
      : [],
  }
}

// ── API BASE URL & Token (for FormData uploads) ─────────────────────
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5131/api"

export const getPOITypes = async (): Promise<POITypeOption[]> => {
  try {
    const data = await apiClient("/poi-types")
    if (!Array.isArray(data)) return []

    return data
      .map((item: any) => ({
        value: String(item?.value ?? item?.Value ?? "") as POIType,
        label: String(item?.label ?? item?.Label ?? ""),
      }))
      .filter((item) => item.value && item.label)
  } catch {
    return []
  }
}


const getPartnerToken = () =>
  localStorage.getItem("partner_token") ||
  localStorage.getItem("admin_token") ||
  localStorage.getItem("manager_token")

export interface LocationOption {
  id: string
  name: string
}

export const getLocations = async (): Promise<LocationOption[]> => {
  try {
    const data = await apiClient("/manager/locations")
    if (!Array.isArray(data)) return []
    return data.map((l: any) => ({
      id: String(l?.LocationId ?? l?.locationId ?? l?.Id ?? l?.id ?? ""),
      name: String(l?.LocationName ?? l?.locationName ?? l?.Name ?? l?.name ?? "")
    })).filter(x => x.id)
  } catch {
    return []
  }
}

export const getDistrictsByLocationId = async (locationId: string): Promise<District[]> => {
  if (!locationId) return []
  const data = await apiClient(`/districts?locationId=${locationId}`)
  if (!Array.isArray(data)) return []
  return data.map((d: any) => ({
    id: String(d?.Id ?? d?.id ?? ""),
    name: String(d?.Name ?? d?.name ?? ""),
  }))
}

export interface POIPreference {
  id: string
  name: string
}

export const getPreferences = async (): Promise<POIPreference[]> => {
  try {
    const data = await apiClient("/preferences/get-all")
    if (!Array.isArray(data)) return []
    return data.map((p: any) => ({
      id: String(p?.Id ?? p?.id ?? ""),
      name: String(p?.Name ?? p?.name ?? "")
    })).filter(x => x.id)
  } catch {
    return []
  }
}

// ── 1. POST /api/partner/pois ───────────────────────────────────────
export const createPartnerPOI = async (
  payload: CreatePartnerPOIPayload,
  imageFile?: File | null
): Promise<PartnerPOI> => {
  const formData = new FormData()
  formData.append("Name", payload.Name)
  formData.append("Address", payload.Address)
  formData.append("ApproxCost", payload.ApproxCost)

  formData.append("OpenHour", payload.OpenHour)
  formData.append("CloseHour", payload.CloseHour)
  formData.append("Is24Hours", String(payload.Is24Hours))
  if (payload.VisitRecommendation) {
    formData.append("VisitRecommendation", payload.VisitRecommendation)
  }
  formData.append("GoogleMapLink", payload.GoogleMapLink)
  formData.append("IsIndoor", String(payload.IsIndoor))
  formData.append("Type", payload.Type)
  formData.append("LocationId", payload.LocationId)
  formData.append("DistrictId", payload.DistrictId)

  if (payload.PoiPreferences?.length) {
    payload.PoiPreferences.forEach((pref) => {
      formData.append("PoiPreferences", pref)
    })
  }

  if (imageFile) {
    formData.append("POIImgUrl", imageFile)
  }

  const token = getPartnerToken()
  const res = await fetch(`${API_BASE_URL}/partner/pois`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  })

  if (!res.ok) {
    const errorText = await res.text()
    const err = new Error(errorText || "Tạo POI thất bại")
    ;(err as any).status = res.status
    throw err
  }

  const contentType = res.headers.get("content-type") ?? ""
  const data = contentType.includes("application/json")
    ? await res.json()
    : await res.text()

  return normalizePOI(data)
}

// ── 2. GET /api/partner/pois/my?page=&pageSize= ────────────────────
export const getMyPartnerPOIs = async (
  page: number = 1,
  pageSize: number = 10
): Promise<PagedResult<PartnerPOI>> => {
  const data = await apiClient(
    `/partner/pois/my?page=${page}&pageSize=${pageSize}`
  )

  // Handle both paged and array responses
  if (Array.isArray(data)) {
    return {
      items: data.map(normalizePOI),
      page,
      pageSize,
      totalItems: data.length,
      totalPages: 1,
    }
  }

  return {
    items: Array.isArray(data?.Items ?? data?.items)
      ? (data?.Items ?? data?.items).map(normalizePOI)
      : [],
    page: data?.Page ?? data?.page ?? page,
    pageSize: data?.PageSize ?? data?.pageSize ?? pageSize,
    totalItems: data?.TotalItems ?? data?.totalItems ?? 0,
    totalPages: data?.TotalPages ?? data?.totalPages ?? 0,
  }
}

// ── 3. GET /api/partner/pois/my/{id} ────────────────────────────────
export const getMyPartnerPOIById = async (
  id: string
): Promise<PartnerPOI | null> => {
  try {
    const data = await apiClient(`/partner/pois/my/${id}`)
    if (!data) return null
    return normalizePOI(data)
  } catch {
    return null
  }
}

// ── 4. PUT /api/partner/pois/my/{id} ────────────────────────────────
export const updateMyPartnerPOI = async (
  id: string,
  payload: UpdatePartnerPOIPayload,
  imageFile?: File | null
): Promise<PartnerPOI> => {
  const formData = new FormData()

  if (payload.Name !== undefined) formData.append("Name", payload.Name)
  if (payload.Address !== undefined) formData.append("Address", payload.Address)
  if (payload.ApproxCost !== undefined) formData.append("ApproxCost", payload.ApproxCost)

  if (payload.OpenHour !== undefined) formData.append("OpenHour", payload.OpenHour)
  if (payload.CloseHour !== undefined) formData.append("CloseHour", payload.CloseHour)
  if (payload.Is24Hours !== undefined) formData.append("Is24Hours", String(payload.Is24Hours))
  if (payload.VisitRecommendation !== undefined) formData.append("VisitRecommendation", payload.VisitRecommendation)
  if (payload.GoogleMapLink !== undefined) formData.append("GoogleMapLink", payload.GoogleMapLink)
  if (payload.IsIndoor !== undefined) formData.append("IsIndoor", String(payload.IsIndoor))
  if (payload.Type !== undefined) formData.append("Type", payload.Type)
  if (payload.LocationId !== undefined) formData.append("LocationId", payload.LocationId)
  if (payload.DistrictId !== undefined) formData.append("DistrictId", payload.DistrictId)

  if (payload.PoiPreferences !== undefined) {
    if (payload.PoiPreferences.length > 0) {
      payload.PoiPreferences.forEach((pref) => {
        formData.append("PoiPreferences", pref)
      })
    } else {
      // Send an empty value so the backend knows to clear the list.
      formData.append("PoiPreferences", "")
    }
  }

  if (imageFile) {
    formData.append("POIImgUrl", imageFile)
  }

  const token = getPartnerToken()
  const res = await fetch(`${API_BASE_URL}/partner/pois/my/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  })

  if (!res.ok) {
    const errorText = await res.text()
    const err = new Error(errorText || "Cập nhật POI thất bại")
    ;(err as any).status = res.status
    throw err
  }

  const contentType = res.headers.get("content-type") ?? ""
  const data = contentType.includes("application/json")
    ? await res.json()
    : await res.text()

  return normalizePOI(data)
}

// ── 5. PATCH /api/partner/pois/my/{id}/inactivate?confirmCascade= ──
export interface InactivateResult {
  poi: PartnerPOI | null
  affectedAds: number
  message: string
}

export const inactivateMyPartnerPOI = async (
  id: string,
  confirmCascade: boolean = false
): Promise<InactivateResult> => {
  const data = await apiClient(
    `/partner/pois/my/${encodeURIComponent(id)}/inactivate?confirmCascade=${confirmCascade}`,
    { method: "PATCH" }
  )

  return {
    poi: data?.poi ? normalizePOI(data.poi) : null,
    affectedAds: Number(data?.affectedAds ?? 0),
    message: String(data?.message ?? "POI đã inactive thành công."),
  }
}

export const requestReactivationMyPartnerPOI = async (
  id: string
): Promise<PartnerPOI> => {
  const data = await apiClient(
    `/partner/pois/my/${encodeURIComponent(id)}/request-reactivation`,
    { method: "POST" }
  )

  return normalizePOI(data?.poi ?? data)
}