import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {

    const role = localStorage.getItem("role")

    if (role === "Admin") {
      throw redirect({ to: "/admin" })
    }

    if (role === "Staff") {
      throw redirect({ to: "/staff" })
    }

    // chưa login
    throw redirect({ to: "/admin/login" })

  },
})