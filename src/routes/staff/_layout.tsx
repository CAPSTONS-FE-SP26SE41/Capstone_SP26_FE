import { createFileRoute, redirect } from "@tanstack/react-router"
import {
  LayoutDashboard,
  MapPin,
  Map,
  PlaneTakeoff,
  ClipboardCheck
} from "lucide-react"
import { useEffect, useState } from "react"

import DashboardLayout from "../../components/layouts/DashboardLayout"

export const Route = createFileRoute("/staff/_layout")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !localStorage.getItem("manager_token")) {
      throw redirect({ to: "/staff/login" }) // Nhớ kiểm tra lại xem có định đổi /staff thành /manager không nhé
    }
  },
  component: ManagerLayout,
})

function ManagerLayout() {
  const [userName, setUserName] = useState("Manager")
  const [userRole, setUserRole] = useState("Manager")

  // Sử dụng useEffect (từ dev_2) để đảm bảo an toàn khi render
  useEffect(() => {
    if (typeof window === "undefined") return
    setUserName(localStorage.getItem("user_name") ?? "Manager")
    setUserRole(localStorage.getItem("user_role") ?? "Manager")
  }, [])

  return (
    <DashboardLayout
      brand={{
        name: "Trip Manager",
        subtitle: "Bảng điều khiển quản lý",
        icon: PlaneTakeoff,
      }}
      themeColor="emerald" // Dùng đúng tên prop từ dev_2
      navItems={[
        { to: "/staff", icon: LayoutDashboard, label: "Thống kê", exact: true },
        { to: "/staff/pois", icon: MapPin, label: "Quản lí POIs" },
        { to: "/staff/locations", icon: Map, label: "Quản lí địa điểm" },
        { to: "/staff/advertisements", icon: ClipboardCheck, label: "Yêu cầu xét duyệt" }, // Lấy từ feat
      ]}
      userName={userName}
      userRole={userRole}
      searchPlaceholder="Search..."
      showSearch={false} // Lấy từ feat để giấu thanh tìm kiếm
    />
  )
}