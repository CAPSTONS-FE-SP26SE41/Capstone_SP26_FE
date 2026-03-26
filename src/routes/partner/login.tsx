import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/partner/login")({
  beforeLoad: () => {
    throw redirect({ to: "/" })
  },
  component: () => null,
})
