import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/staff/_layout/locations")({
  beforeLoad: () => {
    throw redirect({ to: "/staff/pois" })
  },
  component: () => null,
})
export default Route
