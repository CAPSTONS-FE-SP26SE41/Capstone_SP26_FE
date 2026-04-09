import { createFileRoute, redirect } from "@tanstack/react-router"
import {
  LayoutDashboard,
  MapPin,
  Map,
  PlaneTakeoff,
  ClipboardCheck
} from "lucide-react"

import DashboardLayout from "../../components/layouts/DashboardLayout"

export const Route = createFileRoute("/staff/_layout")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !localStorage.getItem("manager_token")) {
      throw redirect({ to: "/staff/login" })
    }
  },
  component: ManagerLayout,
})

function ManagerLayout() {
  return (
    <DashboardLayout
      brand={{
        name: "Trip Manager",
        subtitle: "Bảng điều khiển quản lý",
        icon: PlaneTakeoff,
      }}
      accent="emerald"
      navItems={[
        { to: "/staff", icon: LayoutDashboard, label: "Trang chủ", exact: true },
        { to: "/staff/pois", icon: MapPin, label: "Quản lí POIs" },
        { to: "/staff/locations", icon: Map, label: "Quản lí địa điểm" },
        { to: "/staff/advertisements", icon: ClipboardCheck, label: "Yêu cầu xét duyệt" },
      ]}
      userName={typeof window !== "undefined" ? localStorage.getItem("user_name") ?? "Manager" : "Manager"}

      userRole={typeof window !== "undefined" ? localStorage.getItem("user_role") ?? "Manager" : "Manager"}
      searchPlaceholder="Search..."
      showSearch={false}
    />
  )
}