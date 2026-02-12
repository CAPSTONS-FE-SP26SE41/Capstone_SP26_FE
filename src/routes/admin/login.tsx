import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { PlaneTakeoff } from 'lucide-react'

export const Route = createFileRoute('/admin/login')({
  component: AdminLogin,
})

function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (email && password) {
      localStorage.setItem('admin_token', 'mock-admin-token')
      navigate({ to: '/admin' })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4">

      <div className="w-full max-w-[480px] rounded-2xl bg-white shadow-2xl border border-slate-200">

        {/* Header */}
        <div className="flex flex-col items-center pt-10 pb-6 px-10">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
  <PlaneTakeoff size={32} />
</div>




        <h2 className="text-3xl font-bold text-slate-900">
          Admin Portal
        </h2>

        <p className="text-slate-500 text-sm mt-2 text-center">
          Welcome back. Please sign in to your dashboard.
        </p>
      </div>

      {/* Form */}
      <div className="px-10 pb-10">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@travelapp.com"
              className="w-full h-12 px-4 rounded-xl border border-slate-300 bg-white
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              text-slate-900 placeholder:text-slate-400 transition-all"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-12 px-4 rounded-xl border border-slate-300 bg-white
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              text-slate-900 placeholder:text-slate-400 transition-all"
            />
          </div>

          {/* Options */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-600">
                Keep me signed in
              </span>
            </label>

            <button
              type="button"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 
            text-white font-semibold hover:from-blue-700 hover:to-indigo-700 
            active:scale-[0.98] transition-all shadow-lg shadow-blue-500/30"
          >
            Sign In
          </button>

          {/* Back to Home */}
          <div
            onClick={() => navigate({ to: '/' })}
            className="text-center text-sm text-slate-500 hover:text-blue-600 
            cursor-pointer transition-colors pt-2"
          >
            ← Back to Home
          </div>

        </form>
      </div>

    </div>

  </div >
)
}