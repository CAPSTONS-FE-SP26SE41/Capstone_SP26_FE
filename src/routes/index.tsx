import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { PlaneTakeoff } from "lucide-react"
import { useState } from "react"
import { jwtDecode } from "jwt-decode"

import { login } from "../services/authService"

export const Route = createFileRoute("/")({
  component: LoginPortalPage,
})

function LoginPortalPage() {

  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    try {
      const data = await login(email, password)

      const token = data.token.replace("Bearer ", "")

      const decoded: any = jwtDecode(token)

      const role =
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]

      const name =
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
        decoded.name ||
        decoded.unique_name ||
        data?.name ||
        data?.fullName ||
        data?.username ||
        data?.user?.name ||
        data?.user?.fullName ||
        data?.user?.username ||
        decoded.email ||
        email

      if (role === "Staff") {
        localStorage.setItem("staff_token", token)
        localStorage.setItem("role", role)
        localStorage.setItem("user_name", name)
        localStorage.setItem("user_role", role)
        navigate({ to: "/staff" })
        return
      }

      if (role === "Admin" || role === "SuperAdmin") {
        localStorage.setItem("admin_token", token)
        localStorage.setItem("role", role)
        localStorage.setItem("user_name", name)
        localStorage.setItem("user_role", role)
        navigate({ to: "/admin/analytics" })
        return
      }

      setErrorMessage("Tài khoản không có quyền truy cập")

    } catch (error) {
      console.log(error)
      setErrorMessage("Email hoặc mật khẩu không đúng")
    }
  }

  return (
    <div className="login-page">
      <div className="login-background" data-alt="Scenic mountain lake landscape with a boat">
        <div className="login-background-overlay" />
      </div>

      <div className="login-panel">
        <div className="login-card">
          <div className="login-brand">
            <div className="login-brand-icon">
              <PlaneTakeoff size={32} className="text-[var(--login-primary)]" />
            </div>
            <h1 className="login-title">Travel Planner</h1>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="login-field">
              <label className="login-label">Email</label>
              <div className="login-input-wrapper">
                <input
                  className="login-input login-input-no-icon"
                  placeholder="Enter your email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="login-field">
              <label className="login-label">Password</label>
              <div className="login-input-wrapper">
                <input
                  className="login-input login-input-no-icon"
                  placeholder="Enter your password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="login-meta">
              <div className="login-remember">
                <input
                  className="w-4 h-4 rounded text-[var(--login-primary)] focus:ring-[var(--login-primary)] border-slate-300"
                  id="remember"
                  type="checkbox"
                />
                <label className="text-sm text-slate-600" htmlFor="remember">
                  Remember me
                </label>
              </div>
              <button type="button" className="login-forgot">
                Forgot password?
              </button>
            </div>

            {errorMessage && (
              <div className="login-error">
                <p>{errorMessage}</p>
              </div>
            )}

            <button className="login-button" type="submit">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
