import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/manager/login")({
  beforeLoad: () => {
    throw redirect({ to: "/" })
  },
  component: () => null,
})
