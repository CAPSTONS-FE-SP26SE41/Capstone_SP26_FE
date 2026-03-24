import { createFileRoute, redirect } from "@tanstack/react-router"
import {
  Package,
  Megaphone,
  ChartBar,
  User,
  Store
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
      setUserName(localStorage.getItem("user_name") ?? "Partner Profile")
      setUserRole(localStorage.getItem("user_role") ?? "Partner")
    }
  }, [])

  return (
    <DashboardLayout
      brand={{
        name: "TripPartner",
        subtitle: "Partner Dashboard",
        icon: Store,
      }}
      navItems={[
        { to: "/partner", icon: Package, label: "Package", exact: true },
        { to: "/partner/advertisement", icon: Megaphone, label: "Advertisement" },
        { to: "/partner/stats", icon: ChartBar, label: "Stats" },
        { to: "/partner/profile", icon: User, label: "Profile" },
      ]}
      logoutTo="/partner/login"
      logoutTokenKey="partner_token"
      userName={userName}
      userRole={userRole}
      searchPlaceholder="Search packages, ads..."
      themeColor="orange"
    />
  )
}
