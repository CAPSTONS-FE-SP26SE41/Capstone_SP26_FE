import { createFileRoute, redirect } from "@tanstack/react-router"
import {
  LayoutDashboard,
  Megaphone,
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
        name: "TripStaff",
        subtitle: "Staff Control Panel",
        icon: PlaneTakeoff,
      }}
      navItems={[
        { to: "/staff", icon: LayoutDashboard, label: "Dashboard", exact: true },
        { to: "/staff/advertisements", icon: Megaphone, label: "Advertisements" },
      ]}
      logoutTo="/staff/login"
      logoutTokenKey="staff_token"
      userName={typeof window !== "undefined" ? localStorage.getItem("user_name") ?? "Staff Profile" : "Staff Profile"}
      userRole={typeof window !== "undefined" ? localStorage.getItem("user_role") ?? "Staff" : "Staff"}
      searchPlaceholder="Search ads..."
    />
  )
}