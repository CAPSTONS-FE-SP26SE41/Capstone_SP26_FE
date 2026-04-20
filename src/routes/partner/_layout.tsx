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
  const [userName, setUserName] = useState("Partner Profile")
  const [userRole, setUserRole] = useState("Partner")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserName(localStorage.getItem("user_name") ?? "Hồ sơ đối tác")
      setUserRole(localStorage.getItem("user_role") ?? "Đối tác")
    }
  }, [])

  return (
    <DashboardLayout
      brand={{
        name: "TripPartner",
        subtitle: "Bảng điều khiển Đối tác",
        icon: Store,
      }}
      navItems={[
        { to: "/partner/", icon: Package, label: "Gói dịch vụ", exact: true },
        { to: "/partner/history", icon: History, label: "Lịch sử mua hàng" },
        { to: "/partner/advertisement", icon: Megaphone, label: "Quảng cáo" },
        { to: "/partner/poi", icon: MapPin, label: "Địa điểm (POI)" },
        { to: "/partner/stats", icon: ChartBar, label: "Thống kê" },
        { to: "/partner/profile", icon: User, label: "Hồ sơ" },
      ]}

      userName={userName}
      userRole={userRole}
      showSearch={false}
      themeColor="orange"
    />
  )
}
