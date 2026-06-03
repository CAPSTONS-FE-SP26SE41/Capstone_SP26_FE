import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { PlaneTakeoff, Eye, EyeOff } from "lucide-react"
import { useState, useEffect } from "react"
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
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("login_remember_me")
    if (saved === "true") {
      setEmail(localStorage.getItem("login_saved_email") || "")
      setPassword(localStorage.getItem("login_saved_password") || "")
      setRememberMe(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    try {
      if (rememberMe) {
        localStorage.setItem("login_remember_me", "true")
        localStorage.setItem("login_saved_email", email)
        localStorage.setItem("login_saved_password", password)
      } else {
        localStorage.removeItem("login_remember_me")
        localStorage.removeItem("login_saved_email")
        localStorage.removeItem("login_saved_password")
      }

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

      console.log("[Login] JWT decoded role:", JSON.stringify(role), "| All claims:", decoded)

      const normalizedRole = role?.toString().trim().toLowerCase()

      if (normalizedRole === "manager") {
        localStorage.setItem("manager_token", token)
        localStorage.setItem("role", role)
        localStorage.setItem("user_name", name)
        localStorage.setItem("user_role", "Manager")
        navigate({ to: "/manager" })
        return
      }

      if (normalizedRole === "admin" || normalizedRole === "superadmin") {
        localStorage.setItem("admin_token", token)
        localStorage.setItem("role", role)
        localStorage.setItem("user_name", name)
        localStorage.setItem("user_role", role)
        navigate({ to: "/admin/analytics" })
        return
      }

      if (normalizedRole === "partner") {
        localStorage.setItem("partner_token", token)
        localStorage.setItem("role", role)
        localStorage.setItem("user_name", name)
        localStorage.setItem("user_role", role)
        navigate({ to: "/partner", search: { tab: "my-packages" } })
        return
      }

      console.warn("[Login] Role không hợp lệ hoặc không được hỗ trợ:", JSON.stringify(role))
      setErrorMessage(`Tài khoản không có quyền truy cập (role: ${role || "không xác định"})`)

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
                  style={{ paddingRight: '3rem' }}
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="login-input-toggle-btn"
                  tabIndex={-1}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="login-meta">
              <div className="login-remember">
                <input
                  className="w-4 h-4 rounded text-[var(--login-primary)] focus:ring-[var(--login-primary)] border-slate-300"
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
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
