import { createFileRoute, redirect } from "@tanstack/react-router"
import {
  LayoutDashboard,
  MapPin,
  Map,
  ClipboardList,
  ClipboardCheck,
  Users
} from "lucide-react"
import { useEffect, useState } from "react"

import DashboardLayout from "../../components/layouts/DashboardLayout"

export const Route = createFileRoute("/manager/_layout")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !localStorage.getItem("manager_token")) {
      throw redirect({ to: "/manager/login" }) // Nhớ kiểm tra lại xem có định đổi /manager thành /manager không nhé
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
        name: "Manager Dashboard",
        subtitle: "Bảng điều khiển quản lý",
        icon: ClipboardList,
      }}
      themeColor="emerald" // Dùng đúng tên prop từ dev_2
      navItems={[
        { to: "/manager", icon: LayoutDashboard, label: "Thống kê", exact: true },
        { to: "/manager/pois", icon: MapPin, label: "Quản lí POIs" },
        { to: "/manager/advertisements", icon: ClipboardCheck, label: "Yêu cầu xét duyệt" }, // Lấy từ feat
        { to: "/manager/partner-requests", icon: Users, label: "Yêu cầu đối tác" },
      ]}
      userName={userName}
      userRole={userRole}
      searchPlaceholder="Search..."
      showSearch={false} // Lấy từ feat để giấu thanh tìm kiếm
    />
  )
}