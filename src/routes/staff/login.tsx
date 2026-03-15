import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { PlaneTakeoff } from "lucide-react"
import { jwtDecode } from "jwt-decode"


import { login } from "../../services/authService"

export const Route = createFileRoute("/staff/login")({
  component: StaffLoginPage,
})

function StaffLoginPage() {

  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {

      const data = await login(email, password)

      const token = data.token.replace("Bearer ", "")

      const decoded: any = jwtDecode(token)

      const role =
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]

      if (role !== "Staff") {
        alert("This account is not staff")
        return
      }

      localStorage.setItem("staff_token", token)
      localStorage.setItem("role", role)

      navigate({ to: "/staff" })

    } catch (error) {

      console.log(error)
      alert("Login failed")

    }
  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 px-4">

      <div className="w-full max-w-120 rounded-2xl bg-white shadow-2xl border border-slate-200">

        <div className="flex flex-col items-center pt-10 pb-6 px-10">

          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
            <PlaneTakeoff size={32} />
          </div>

          <h2 className="text-3xl font-bold text-slate-900">
            Staff Portal
          </h2>

          <p className="text-slate-500 text-sm mt-2 text-center">
            Please sign in to your dashboard
          </p>

        </div>

        <div className="px-10 pb-10">

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            <input
              type="email"
              placeholder="staff@travelapp.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 px-4 rounded-xl border border-slate-300"
            />

            <input
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 px-4 rounded-xl border border-slate-300"
            />

            <button
              type="submit"
              className="h-12 rounded-xl bg-blue-600 text-white font-semibold"
            >
              Sign In
            </button>

          </form>

          <button
            onClick={() => navigate({ to: "/" })}
            className="mt-6 w-full h-10 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-100"
          >
            ← Back to Login Portal
          </button>

        </div>

      </div>

    </div>
  )
}