import { apiClient } from "../../api/apiClient"

export interface Preference {
  id: string
  name: string
}

export const getPreferences = async (): Promise<Preference[]> => {
  const data = await apiClient("/preferences/get-all")
  // Map fields from backend if backend returns Id/Name instead of id/name
  return (data || []).map((item: any) => ({
    id: item.Id ?? item.id,
    name: item.Name ?? item.name,
  }))
}

export const createPreference = async (name: string): Promise<Preference> => {
  const data = await apiClient("/preferences/create", {
    method: "POST",
    body: JSON.stringify({ name }),
  })
  return {
    id: data.Id ?? data.id,
    name: data.Name ?? data.name,
  }
}

export const updatePreference = async (id: string, name: string): Promise<Preference> => {
  const data = await apiClient(`/preferences/update/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name }),
  })
  return {
    id: data.Id ?? data.id,
    name: data.Name ?? data.name,
  }
}

export const deletePreference = async (id: string): Promise<void> => {
  await apiClient(`/preferences/delete/${id}`, {
    method: "DELETE",
  })
}
