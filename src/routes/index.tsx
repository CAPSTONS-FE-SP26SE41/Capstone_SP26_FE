import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { PlaneTakeoff } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (email === "admin@test.com" && password === "123456") {
    localStorage.setItem("admin_token", "mock-admin-token")
    navigate({ to: "/admin" })
    return
  }


    try {
    const response = await fetch("https://localhost:7176/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    })

    if (!response.ok) {
      throw new Error("Login failed")
    }

    const data = await response.json()

    localStorage.setItem("admin_token", data.token)
    localStorage.setItem("role", data.role)

    if (data.role === "Admin") {
      navigate({ to: "/admin" })
    } else if (data.role === "Staff") {
      navigate({ to: "/staff" })
    } else {
      navigate({ to: "/" })
    }

  } catch (error) {
    alert("Login failed. Please check email/password.")
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4">

      <div className="w-full max-w-[480px] rounded-2xl bg-white shadow-2xl border border-slate-200">

        <div className="flex flex-col items-center pt-10 pb-6 px-10">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
            <PlaneTakeoff size={32} />
          </div>

          <h2 className="text-3xl font-bold text-slate-900">
            Admin Portal
          </h2>

          <p className="text-slate-500 text-sm mt-2 text-center">
            Please sign in to your dashboard
          </p>
        </div>

        <div className="px-10 pb-10">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            <input
              type="email"
              placeholder="admin@travelapp.com"
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
        </div>

      </div>

    </div>
  )
}