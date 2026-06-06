import { createFileRoute, redirect } from "@tanstack/react-router"
import {
  Package,
  Megaphone,
  ChartBar,
  User,
  Handshake,
  History,
  MapPin
} from "lucide-react"

import DashboardLayout from "../../components/layouts/DashboardLayout"

export const Route = createFileRoute("/partner/_layout")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !localStorage.getItem("partner_token")) {
      throw redirect({ to: "/partner/login" })
    }
  },
  component: PartnerLayout,
})

import { useState, useEffect } from "react"
import { getMyPartnerProfile } from "@/services/partnerProfileService"

function PartnerLayout() {
  const [userName, setUserName] = useState("Đang tải...")
  const [userRole, setUserRole] = useState("Đối tác")
  const [userAvatar, setUserAvatar] = useState("https://ui-avatars.com/api/?name=Partner&background=FDBA74&color=7C2D12")

  useEffect(() => {
    // Đọc cache từ localStorage trước để hiển thị nhanh
    const cachedName = localStorage.getItem("user_name")
    const cachedRole = localStorage.getItem("user_role")
    const cachedAvatar = localStorage.getItem("user_avatar")
    if (cachedName) setUserName(cachedName)
    if (cachedRole) setUserRole(cachedRole)
    if (cachedAvatar) setUserAvatar(cachedAvatar)

    const fetchMe = async () => {
      try {
        const data = await getMyPartnerProfile();
        if (data) {
          const name = data.businessName || "Doanh nghiệp đối tác";
          const role = "Đối tác";
          const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FDBA74&color=7C2D12`;
          const avatar = data.businessAvatarUrl || defaultAvatarUrl;
          
          setUserName(name);
          setUserRole(role);
          setUserAvatar(avatar);

          // Update cache for next reload
          localStorage.setItem("user_name", name);
          localStorage.setItem("user_role", role);
          localStorage.setItem("user_avatar", avatar);
        }
      } catch (error) {
        console.error("Failed to fetch partner profile:", error);
      }
    };
    fetchMe();
  }, [])




  return (
    <DashboardLayout
      brand={{
        name: "Partner Dashboard",
        subtitle: "Bảng điều khiển Đối tác",
        icon: Handshake,
      }}
      navItems={[
        { to: "/partner/stats", icon: ChartBar, label: "Thống kê" },
        { to: "/partner/packages", icon: Package, label: "Gói dịch vụ" },
        { to: "/partner/history", icon: History, label: "Lịch sử mua hàng" },
        { to: "/partner/advertisement", icon: Megaphone, label: "Quảng cáo" },
        { to: "/partner/poi", icon: MapPin, label: "Địa điểm (POI)" },
        { to: "/partner/profile", icon: User, label: "Hồ sơ" },
      ]}



      userName={userName}
      userRole={userRole}
      userAvatarUrl={userAvatar}
      showSearch={false}

      themeColor="orange"

    />
  )
}
