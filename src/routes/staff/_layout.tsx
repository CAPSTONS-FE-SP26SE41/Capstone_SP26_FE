import { createFileRoute, redirect } from "@tanstack/react-router"
import {
  LayoutDashboard,
  MapPin,
  Map,
  PlaneTakeoff
} from "lucide-react"

import DashboardLayout from "../../components/layouts/DashboardLayout"

export const Route = createFileRoute("/staff/_layout")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !localStorage.getItem("staff_token")) {
      throw redirect({ to: "/staff/login" })
    }
  },
  component: StaffLayout,
})

function StaffLayout() {
  return (
    <DashboardLayout
      brand={{
        name: "TripNhân viên",
        subtitle: "Bảng điều khiển nhân viên",
        icon: PlaneTakeoff,
      }}
      accent="emerald"
      navItems={[
        { to: "/staff", icon: LayoutDashboard, label: "Trang chủ", exact: true },
        { to: "/staff/pois", icon: MapPin, label: "Quản lí POIs" },
        { to: "/staff/locations", icon: Map, label: "Quản lí địa điểm" },
      ]}
      logoutTo="/staff/login"
      logoutTokenKey="staff_token"
      userName={typeof window !== "undefined" ? localStorage.getItem("user_name") ?? "Staff Profile" : "Staff Profile"}
      userRole={typeof window !== "undefined" ? localStorage.getItem("user_role") ?? "Staff" : "Staff"}
      searchPlaceholder="Search ads..."
    />
  )
}