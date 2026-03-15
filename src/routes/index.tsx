import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { PlaneTakeoff } from "lucide-react"

export const Route = createFileRoute("/")({
  component: PortalPage,
})

function PortalPage() {

  const navigate = useNavigate()

  return (

    <div className="min-h-screen flex items-center justify-center bg-slate-100">

      <div className="bg-white shadow-xl rounded-2xl p-10 w-96 text-center">

        <div className="flex justify-center mb-6 text-blue-600">
          <PlaneTakeoff size={40}/>
        </div>

        <h2 className="text-2xl font-bold mb-6">
          Travel Planner Portal
        </h2>

        <div className="flex flex-col gap-4">

          <button
            onClick={() => navigate({ to: "/staff/login" })}
            className="h-12 bg-blue-600 text-white rounded-xl"
          >
            Staff Portal
          </button>

          <button
            onClick={() => navigate({ to: "/admin/login" })}
            className="h-12 bg-slate-800 text-white rounded-xl"
          >
            Admin Portal
          </button>

        </div>

      </div>

    </div>
  )
}