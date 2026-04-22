import { createFileRoute, redirect } from "@tanstack/react-router"
import {
  Package,
  Megaphone,
  ChartBar,
  User,
  Store,
  History,
  MapPin
} from "lucide-react"

import DashboardLayout from "../../components/layouts/DashboardLayout"
import { getMe } from "@/services/authService"

export const Route = createFileRoute("/partner/_layout")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !localStorage.getItem("partner_token")) {
      throw redirect({ to: "/partner/login" })
    }
  },
  component: PartnerLayout,
})

import { useState, useEffect } from "react"

function PartnerLayout() {
  const [userName, setUserName] = useState(() => {
    return (typeof window !== "undefined" && localStorage.getItem("user_name")) || "Đang tải..."
  })
  const [userRole, setUserRole] = useState(() => {
    return (typeof window !== "undefined" && localStorage.getItem("user_role")) || "Đối tác"
  })
  const [userAvatar, setUserAvatar] = useState(() => {
    return (typeof window !== "undefined" && localStorage.getItem("user_avatar")) || "https://i.pravatar.cc/40"
  })

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const data = await getMe();
        if (data) {
          const name = data.name || "Hồ sơ cá nhân";
          const role = data.roleName || "Đối tác";
          const avatar = data.profile?.avtUrl || data.avatarUrl || data.profile?.avatarUrl || "https://i.pravatar.cc/40";
          
          setUserName(name);
          setUserRole(role);
          setUserAvatar(avatar);

          // Update cache for next reload
          localStorage.setItem("user_name", name);
          localStorage.setItem("user_role", role);
          localStorage.setItem("user_avatar", avatar);
        }
      } catch (error) {
        console.error("Failed to fetch me:", error);
      }
    };
    fetchMe();
  }, [])




  return (
    <DashboardLayout
      brand={{
        name: "TripPartner",
        subtitle: "Bảng điều khiển Đối tác",
        icon: Store,
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
