import { apiClient } from "../../api/apiClient"

export const login = async (email: string, password: string) => {

  try {

    const data = await apiClient("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    })

    return data

  } catch (error) {

    throw new Error("Invalid email or password")

  }

}

export const logout = () => {
  localStorage.removeItem("admin_token")
  localStorage.removeItem("partner_token")
  localStorage.removeItem("manager_token")
  localStorage.removeItem("role")
  localStorage.removeItem("user_name")
  localStorage.removeItem("user_role")
  localStorage.removeItem("user_avatar")
}


export const getMe = async () => {
  return apiClient("/auth/me")
}

export const updateProfile = async (data: any, avatarFile?: File | null) => {
  const formData = new FormData();
  if (data.name) formData.append('Name', data.name);
  if (data.address) formData.append('Address', data.address);
  if (data.phoneNumber) formData.append('PhoneNumber', data.phoneNumber);
  if (data.gender) formData.append('Gender', data.gender);
  if (data.dateOfBirth) formData.append('DateOfBirth', data.dateOfBirth);
  
  if (avatarFile) {
    formData.append('AvatarUrl', avatarFile);
  }

  return apiClient("/auth/profile", {
    method: "PUT",
    body: formData,
  })
}
