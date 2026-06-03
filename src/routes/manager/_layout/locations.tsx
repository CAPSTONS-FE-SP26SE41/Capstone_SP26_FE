import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/manager/_layout/locations")({
  beforeLoad: () => {
    throw redirect({ to: "/manager/pois" })
  },
  component: () => null,
})
export default Route
