import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/staff/login")({
  beforeLoad: () => {
    throw redirect({ to: "/" })
  },
  component: () => null,
})
<<<<<<< Updated upstream
=======

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
        alert("Tài khoản này không phải nhân viên")
        return
      }

      localStorage.setItem("staff_token", token)
      localStorage.setItem("role", role)

      navigate({ to: "/staff" })

    } catch (error) {

      console.log(error)
      alert("Đăng nhập thất bại")

    }
  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-emerald-50 to-teal-100 px-4">

      <div className="w-full max-w-120 rounded-2xl bg-white shadow-2xl border border-slate-200">

        <div className="flex flex-col items-center pt-10 pb-6 px-10">

          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
            <PlaneTakeoff size={32} />
          </div>

          <h2 className="text-3xl font-bold text-slate-900">Cổng nhân viên</h2>

          <p className="text-slate-500 text-sm mt-2 text-center">
            Vui lòng đăng nhập để vào bảng điều khiển
          </p>

        </div>

        <div className="px-10 pb-10">

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            <input
              type="email"
              placeholder="email nhân viên"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 px-4 rounded-xl border border-slate-300"
            />

            <input
              type="password"
              placeholder="mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 px-4 rounded-xl border border-slate-300"
            />

            <button
              type="submit"
              className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
            >
              Đăng nhập
            </button>

          </form>

          <button
            onClick={() => navigate({ to: "/" })}
            className="mt-6 w-full h-10 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-100"
          >
            ← Quay lại cổng đăng nhập
          </button>

        </div>

      </div>

    </div>
  )
}
>>>>>>> Stashed changes
