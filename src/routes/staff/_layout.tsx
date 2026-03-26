import { createFileRoute, redirect } from "@tanstack/react-router"
import {
  LayoutDashboard,
  MapPin,
  Map,
  PlaneTakeoff
} from "lucide-react"
import { useEffect, useState } from "react"

import DashboardLayout from "../../components/layouts/DashboardLayout"

export const Route = createFileRoute("/staff/_layout")({
  beforeLoad: () => {
    if (
      typeof window !== "undefined" &&
      !localStorage.getItem("manager_token")
    ) {
      throw redirect({ to: "/staff/login" })
    }
  },
  component: StaffLayout,
})

function StaffLayout() {
  const [userName, setUserName] = useState("Manager Profile")
  const [userRole, setUserRole] = useState("Manager")

  useEffect(() => {
    if (typeof window === "undefined") return
    setUserName(localStorage.getItem("user_name") ?? "Manager Profile")
    setUserRole(localStorage.getItem("user_role") ?? "Manager")
  }, [])

  return (
    <DashboardLayout
      brand={{
        name: "Trip Manager",
        subtitle: "Bảng điều khiển quản lí",
        icon: PlaneTakeoff,
      }}
      themeColor="emerald"
      navItems={[
        { to: "/staff", icon: LayoutDashboard, label: "Trang chủ", exact: true },
        { to: "/staff/pois", icon: MapPin, label: "Quản lí POIs" },
        { to: "/staff/locations", icon: Map, label: "Quản lí địa điểm" },
      ]}
      userName={userName}
      userRole={userRole}
      searchPlaceholder="Search ads..."
    />
  )
}