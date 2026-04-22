import { apiClient } from "../../api/apiClient"

export const getRecommendedPOI = async (limit: number = 10) => {
  return apiClient(`/pois/recommended?limit=${limit}`)
}

export type StaffPOI = {
  Id: string
  Name: string
  Address: string

  ApproxCost: string


  // Thời gian mở cửa
  OpenHour: string
  CloseHour: string
  Is24Hours: boolean
  VisitRecommendation: string

  // Hình ảnh/địa chỉ bản đồ
  POIImgUrl: string
  GoogleMapLink: string

  IsIndoor: boolean
  Latitude: number
  Longitude: number
  LocationId: string
  DistrictId?: string

  // Các trường mới từ backend
  Status?: string | number
  PartnerId?: string
  PoiPreferences?: string[]

  // Một số backend có thể trả thêm, nhưng không bắt buộc
  LocationName?: string

  // UI convenience (tạo từ OpenHour/CloseHour/Is24Hours)
  OpeningHours: string
}

function normalizeStaffPOI(p: any): StaffPOI {
  const is24 =
    Boolean(
      p?.Is24Hours ?? p?.is24Hours ?? p?.is24hours ?? p?.Is_24_Hours
    ) ?? false

  const openHourRaw =
    p?.OpenHour ?? p?.openHour ?? p?.open_hour ?? p?.Open_hours ?? ""
  const closeHourRaw =
    p?.CloseHour ?? p?.closeHour ?? p?.close_hour ?? p?.Close_hours ?? ""

  const normalizeTime = (t: any) => {
    const s = String(t ?? "")
    // Convert "08:00:00" -> "08:00"
    if (s.length >= 5 && s.includes(":")) return s.slice(0, 5)
    return s
  }

  const openHour = normalizeTime(openHourRaw)
  const closeHour = normalizeTime(closeHourRaw)

  const openingHours = is24
    ? "Mở 24 giờ"
    : openHour && closeHour
      ? `${openHour} - ${closeHour}`
      : openHour || closeHour || ""

  const statusRaw = p?.Status ?? p?.POIStatus ?? p?.status
  const partnerIdRaw = p?.PartnerId ?? p?.partnerId ?? p?.PartnerID ?? p?.partner_id

  const poiPreferencesRaw = p?.PoiPreferences ?? p?.poiPreferences ?? p?.POIPreferences
  const poiPreferencesNormalized =
    Array.isArray(poiPreferencesRaw)
      ? poiPreferencesRaw.map((x) => {
          if (x === null || x === undefined) return ""
          if (typeof x === "string") return x
          if (typeof x === "number") return String(x)
          if (typeof x === "object") {
            const maybeId = (x as any)?.id ?? (x as any)?.Id
            const maybeName = (x as any)?.name ?? (x as any)?.Name
            return String(maybeId ?? maybeName ?? x)
          }
          return String(x)
        })
        .filter(Boolean)
      : typeof poiPreferencesRaw === "string"
        ? poiPreferencesRaw
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined

  const statusNormalized =
    statusRaw === null || statusRaw === undefined ? undefined : (typeof statusRaw === "number" ? statusRaw : String(statusRaw))
  const partnerIdNormalized =
    partnerIdRaw === null || partnerIdRaw === undefined || partnerIdRaw === ""
      ? undefined
      : String(partnerIdRaw)

  const extractImgString = (value: any): string => {
    if (value === null || value === undefined) return ""
    if (typeof value === "string") return value
    if (typeof value === "number") return String(value)
    if (typeof value === "object") {
      // Some APIs return { url: "..." } or { Url: "..." }
      const maybeUrl =
        (value as any)?.url ??
        (value as any)?.Url ??
        (value as any)?.imageUrl ??
        (value as any)?.ImageUrl ??
        (value as any)?.POIImgUrl ??
        (value as any)?.poiImgUrl
      if (typeof maybeUrl === "string") return maybeUrl
    }
    return String(value)
  }

  const rawImg = String(
    extractImgString(
      p?.POIImgUrl ??
        p?.POIImgeUrl ??
        p?.poiImgUrl ??
        p?.poiImgeUrl ??
        p?.POIImageUrl ??
        p?.poi_image_url ??
        // common alternates
        p?.imageUrl ??
        p?.ImageUrl ??
        p?.url ??
        p?.Url ??
        p?.image?.url ??
        p?.Image?.Url ??
        ""
    )
  ).trim()

  const resolvePoiImgUrl = (value: string) => {
    if (!value) return ""
    const v = value.trim()
    // Một số backend có thể trả placeholder kiểu .NET type name
    if (v.includes("Microsoft.AspNetCore.Http.FormFile")) return ""
    if (v === "null" || v === "undefined") return ""

    // data URL
    if (v.startsWith("data:")) return v

    // absolute URL
    if (/^https?:\/\//i.test(v)) return v

    // relative path -> prefix origin từ VITE_API_BASE_URL (vd http://localhost:5131/api -> http://localhost:5131)
    const origin = (() => {
      try {
        return new URL(API_BASE_URL).origin
      } catch {
        return ""
      }
    })()

    if (!origin) return v
    if (v.startsWith("/")) return `${origin}${v}`
    return `${origin}/${v}`
  }

  return {
    Id: String(p?.Id ?? p?.id ?? ""),
    Name: String(p?.Name ?? p?.name ?? ""),
    Address: String(p?.Address ?? p?.address ?? ""),
    ApproxCost: String(p?.ApproxCost ?? p?.approxCost ?? p?.approx_cost ?? ""),
    OpenHour: openHour,
    CloseHour: closeHour,
    Is24Hours: Boolean(p?.Is24Hours ?? p?.is24Hours ?? p?.is24hours ?? false),
    VisitRecommendation: String(
      p?.VisitRecommendation ??
        p?.visitRecommendation ??
        p?.visit_recommendation ??
        ""
    ),

    GoogleMapLink: String(
      p?.GoogleMapLink ?? p?.googleMapLink ?? p?.google_map_link ?? ""
    ),
    POIImgUrl: resolvePoiImgUrl(rawImg),

    IsIndoor: Boolean(p?.IsIndoor ?? p?.isIndoor ?? false),
    Latitude: Number(p?.Latitude ?? p?.latitude ?? 0),
    Longitude: Number(p?.Longitude ?? p?.longitude ?? 0),
    LocationId: String(p?.LocationId ?? p?.locationId ?? ""),
    DistrictId: String(p?.DistrictId ?? p?.districtId ?? ""),
    Status: statusNormalized,
    PartnerId: partnerIdNormalized,
    PoiPreferences: poiPreferencesNormalized,
    LocationName: p?.LocationName ?? p?.locationName,
    OpeningHours: String(p?.OpeningHours ?? openingHours ?? ""),
  }
}

export const getStaffPOIs = async (): Promise<StaffPOI[]> => {
  const data = await apiClient("/manager/pois")
  const items = Array.isArray(data) ? data : (data?.items || data?.Items || [])
  return items.map(normalizeStaffPOI)
}

export type ManagerPendingPOIResult = {
  items: StaffPOI[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export const getManagerPendingPOIs = async (
  page: number = 1,
  pageSize: number = 10
): Promise<ManagerPendingPOIResult> => {
  const data = await apiClient(`/manager/pois/pending?page=${page}&pageSize=${pageSize}`)
  const rawItems = data?.Items ?? data?.items ?? []

  return {
    items: Array.isArray(rawItems) ? rawItems.map(normalizeStaffPOI) : [],
    page: Number(data?.Page ?? data?.page ?? page),
    pageSize: Number(data?.PageSize ?? data?.pageSize ?? pageSize),
    totalItems: Number(data?.TotalItems ?? data?.totalItems ?? 0),
    totalPages: Number(data?.TotalPages ?? data?.totalPages ?? 1),
  }
}

export const getStaffPOIById = async (id: string): Promise<StaffPOI | null> => {
  try {
    const data = await apiClient(`/manager/pois/${id}`)
    if (!data) return null
    return normalizeStaffPOI(data)
  } catch {
    // Fallback for environments where detail endpoint is unavailable.
    const data = await getStaffPOIs()
    const found = data.find((p) => p.Id === id)
    return found ?? null
  }
}

export type StaffLocationOption = {
  Id: string
  Name: string
}

export type StaffLocation = {
  LocationId: string
  LocationName: string
  Latitude: number
  Longitude: number
}

export type CreateStaffLocationPayload = {
  LocationId?: string
  LocationName: string
  Latitude: number
  Longitude: number
}

export type UpdateStaffLocationPayload = {
  LocationName: string
  Latitude: number
  Longitude: number
}

function normalizeLocationOption(l: any): StaffLocationOption {
  return {
    Id: String(l?.LocationId ?? l?.locationId ?? l?.Id ?? l?.id ?? ""),
    Name: String(
      l?.LocationName ?? l?.locationName ?? l?.Name ?? l?.name ?? ""
    ),
  }
}

function normalizeStaffLocation(l: any): StaffLocation {
  return {
    LocationId: String(l?.LocationId ?? l?.locationId ?? l?.Id ?? l?.id ?? ""),
    LocationName: String(
      l?.LocationName ?? l?.locationName ?? l?.Name ?? l?.name ?? ""
    ),
    Latitude: Number(l?.Latitude ?? l?.latitude ?? 0),
    Longitude: Number(l?.Longitude ?? l?.longitude ?? 0),
  }
}

export const getStaffLocationsList = async (): Promise<StaffLocation[]> => {
  const data = await apiClient("/manager/locations")
  if (!Array.isArray(data)) return []
  return data.map(normalizeStaffLocation)
}

export const getStaffLocationById = async (
  id: string
): Promise<StaffLocation | null> => {
  const data = await apiClient(`/manager/locations/${id}`)
  if (!data) return null
  return normalizeStaffLocation(data)
}

export const createStaffLocation = async (
  payload: CreateStaffLocationPayload
): Promise<StaffLocation> => {
  const data = await apiClient("/manager/locations", {
    method: "POST",
    body: JSON.stringify(payload),
  })
  return normalizeStaffLocation(data ?? payload)
}

export const updateStaffLocation = async (
  id: string,
  payload: UpdateStaffLocationPayload
): Promise<StaffLocation> => {
  const data = await apiClient(`/manager/locations/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
  return normalizeStaffLocation(data ?? { LocationId: id, ...payload })
}

export const deleteStaffLocation = async (id: string): Promise<void> => {
  await apiClient(`/manager/locations/${id}`, {
    method: "DELETE",
  })
}

export const getStaffLocations = async (): Promise<StaffLocationOption[]> => {
  try {
    const data = await apiClient("/manager/locations")
    if (!Array.isArray(data)) return []
    return data.map(normalizeLocationOption).filter((x) => x.Id)
  } catch {
    // Fallback for environments exposing shared endpoint only.
    const data = await apiClient("/locations")
    if (!Array.isArray(data)) return []
    return data.map(normalizeLocationOption).filter((x) => x.Id)
  }
}

export type CreateStaffPOIPayload = {
  Name: string
  Address: string

  ApproxCost: string
  OpenHour: string
  CloseHour: string
  GoogleMapLink: string
  IsIndoor: boolean
  LocationId: string
  DistrictId: string
  Status?: string | number
  PartnerId?: string
  VisitRecommendation?: string
  // Backend đang map sang Dictionary/Map, nên có thể truyền array object {id,name} hoặc array string
  PoiPreferences?: Array<string | { id: string; name: string }>

}

export const createStaffPOI = async (
  payload: CreateStaffPOIPayload,
  imageFile?: File | null
): Promise<StaffPOI> => {
  const normalizeTimeOnly = (t: string) => {
    const s = String(t ?? "").trim()
    // Input time thường là "HH:mm" => backend TimeOnly cần "HH:mm:ss"
    if (/^\d{2}:\d{2}$/.test(s)) return `${s}:00`
    return s
  }

  const formData = new FormData()
  formData.append("Name", payload.Name)
  formData.append("Address", payload.Address)

  formData.append("ApproxCost", payload.ApproxCost)
  formData.append("OpenHour", normalizeTimeOnly(payload.OpenHour))
  formData.append("CloseHour", normalizeTimeOnly(payload.CloseHour))
  formData.append("LocationId", payload.LocationId)
  formData.append("DistrictId", payload.DistrictId)
  formData.append("GoogleMapLink", payload.GoogleMapLink)
  formData.append("IsIndoor", String(payload.IsIndoor))
if (payload.VisitRecommendation && payload.VisitRecommendation.trim().length > 0) {
    formData.append("VisitRecommendation", payload.VisitRecommendation.trim())
  }
  
  if (payload.PoiPreferences?.length) {
    // Xử lý thông minh từ dev_2 (đã bao hàm luôn logic của nhánh feat)
    payload.PoiPreferences.forEach((pref) => {
      if (pref && typeof pref === "object") {
        const id = (pref as any).id ?? (pref as any).Id
        const name = (pref as any).name ?? (pref as any).Name
        if (id) formData.append(`PoiPreferences[${id}]`, String(name ?? ""))
        return
      }
      // Nếu là string bình thường (giống nhánh feat), vẫn append vào mảng
      formData.append("PoiPreferences", String(pref))
    })
  }

  if (payload.Status !== undefined) {
    formData.append("Status", String(payload.Status))
  }

  if (payload.PartnerId) {
    formData.append("PartnerId", payload.PartnerId)
  }
  if (imageFile) {
    formData.append("POIImgUrl", imageFile)
  }

  const token = getStaffToken()
  const res = await fetch(`${API_BASE_URL}/manager/pois`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  })
  if (!res.ok) {
    const errorText = await res.text()
    const err = new Error(errorText || "Create POI failed")
    ;(err as any).status = res.status
    throw err
  }

  const contentType = res.headers.get("content-type") ?? ""
  const data = contentType.includes("application/json")
    ? await res.json()
    : await res.text()

  return normalizeStaffPOI(data ?? payload)
}

export type UpdateStaffPOIPayload = {
  Name: string
  Address: string

  ApproxCost: string
  OpenHour: string
  CloseHour: string
  GoogleMapLink: string
  IsIndoor: boolean
  POIImgUrl: string
  LocationId: string
  DistrictId: string
  Status?: string | number
  PartnerId?: string
  VisitRecommendation?: string
  PoiPreferences?: Array<string | { id: string; name: string }>
}

export const updateStaffPOI = async (
  id: string,
  payload: UpdateStaffPOIPayload,
  imageFile?: File | null
): Promise<StaffPOI> => {
  const normalizeTimeOnly = (t: string) => {
    const s = String(t ?? "").trim()
    if (/^\d{2}:\d{2}$/.test(s)) return `${s}:00`
    return s
  }

  // Backend của bạn có endpoint upload ảnh riêng:
  // POST /api/manager/pois/upload-image -> trả về URL ảnh
  // Sau đó update POI bằng POIImgUrl (string) sẽ giúp GET chi tiết trả ảnh đúng.
  let poiImgUrlForUpdate = payload.POIImgUrl ?? ""
  if (imageFile) {
    poiImgUrlForUpdate = await uploadStaffPOIImage(imageFile)
  }

  const paramsObj: Record<string, string> = {
    Name: payload.Name ?? "",
    Address: payload.Address ?? "",

    ApproxCost: payload.ApproxCost ?? "",
    OpenHour: normalizeTimeOnly(payload.OpenHour ?? ""),
    CloseHour: normalizeTimeOnly(payload.CloseHour ?? ""),
    LocationId: payload.LocationId ?? "",
    DistrictId: payload.DistrictId ?? "",
    GoogleMapLink: payload.GoogleMapLink ?? "",
    IsIndoor: String(Boolean(payload.IsIndoor)),
    POIImgUrl: poiImgUrlForUpdate ?? "",
  }

  if (payload.VisitRecommendation && payload.VisitRecommendation.trim().length > 0) {
    paramsObj.VisitRecommendation = payload.VisitRecommendation.trim()
  }

  if (payload.Status !== undefined) {
    paramsObj.Status = String(payload.Status)
  }
  if (payload.PartnerId) {
    paramsObj.PartnerId = payload.PartnerId
  }

  const params = new URLSearchParams(paramsObj)
  if (payload.PoiPreferences?.length) {
    payload.PoiPreferences.forEach((pref) => {
      if (pref && typeof pref === "object") {
        const pid = (pref as any).id ?? (pref as any).Id
        const name = (pref as any).name ?? (pref as any).Name
        if (pid) params.append(`PoiPreferences[${pid}]`, String(name ?? ""))
        return
      }
      params.append("PoiPreferences", String(pref))
    })
  }

  const data = await apiClient(
    `/manager/pois/${encodeURIComponent(id)}?${params.toString()}`,
    {
    method: "PUT",
    }
  )
  return normalizeStaffPOI(data ?? payload)
}

export const deleteStaffPOI = async (id: string): Promise<void> => {
  await apiClient(`/manager/pois/${id}`, {
    method: "DELETE",
  })
}

export const approveManagerPendingPOI = async (id: string): Promise<void> => {
  await apiClient(`/manager/pois/${id}/approve`, {
    method: "POST",
  })
}

export const rejectManagerPendingPOI = async (id: string, reason?: string): Promise<void> => {
  await apiClient(`/manager/pois/${id}/reject`, {
    method: "POST",
    body: JSON.stringify(reason ? { reason } : {}),
  })
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5131/api"

const getStaffToken = () =>
  localStorage.getItem("manager_token") || localStorage.getItem("admin_token")

export const uploadStaffPOIImage = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append("file", file)

  const token = getStaffToken()
  const res = await fetch(`${API_BASE_URL}/manager/pois/upload-image`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  })

  if (!res.ok) {
    const errorText = await res.text()
    const err = new Error(errorText || "Upload image failed")
    ;(err as any).status = res.status
    throw err
  }

  const contentType = res.headers.get("content-type") ?? ""
  if (!contentType.includes("application/json")) {
    const text = await res.text()
    if (!text) throw new Error("Upload thành công nhưng không nhận được URL ảnh")
    return text
  }

  const data = await res.json()
  const imageUrl =
    data?.POIImgUrl ?? data?.poiImgUrl ?? data?.url ?? data?.imageUrl ?? ""

  if (!imageUrl) {
    throw new Error("Upload thành công nhưng phản hồi không có POIImgUrl")
  }

  return String(imageUrl)
}

const parseImportResponseMessage = async (res: Response): Promise<string> => {
  const contentType = res.headers.get("content-type") ?? ""

  if (contentType.includes("application/json")) {
    const data = await res.json()
    return String(data?.message ?? data?.Message ?? "Import thành công")
  }

  const text = await res.text()
  return text || "Import thành công"
}

const importStaffExcelFile = async (
  endpoint: string,
  file: File
): Promise<string> => {
  const formData = new FormData()
  formData.append("file", file)

  const token = getStaffToken()
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  })

  if (!res.ok) {
    const errorText = await res.text()
    const err = new Error(errorText || "Import thất bại")
    ;(err as any).status = res.status
    throw err
  }

  return parseImportResponseMessage(res)
}

export const importStaffPOIsExcel = async (file: File): Promise<string> => {
  return importStaffExcelFile("/manager/pois/import", file)
}

export const importStaffLocationsExcel = async (file: File): Promise<string> => {
  return importStaffExcelFile("/manager/locations/import", file)
}