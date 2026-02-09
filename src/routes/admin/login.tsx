import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/admin/login')({
  component: AdminLogin,
})

function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // MOCK LOGIN
    if (email && password) {
      localStorage.setItem('admin_token', 'mock-admin-token')
      navigate({ to: '/admin' })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-200 to-orange-300">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-[360px] rounded-xl shadow-xl p-6"
      >
        <h1 className="text-2xl font-bold text-center mb-2">
          Admin Portal
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Welcome back. Please sign in.
        </p>

        <div className="mb-4">
          <label className="text-sm font-medium">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full border rounded-lg px-3 py-2"
            placeholder="admin@example.com"
          />
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full border rounded-lg px-3 py-2"
          />
        </div>

        <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
          Sign In
        </button>

        <div className="text-center text-sm text-gray-500 mt-4">
          ← Back to Home
        </div>
      </form>
    </div>
  )
}
