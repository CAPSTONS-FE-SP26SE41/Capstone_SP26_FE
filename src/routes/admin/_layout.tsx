import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import AdminSidebar from '../../components/AdminSidebar'
import AdminTopbar from '../../components/AdminTopbar'


export const Route = createFileRoute('/admin/_layout')({
  beforeLoad: () => {
    if (!localStorage.getItem('admin_token')) {
      throw redirect({ to: '/admin/login' })
    }
  },
  component: AdminLayout,
})

function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminTopbar />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
