import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    // Redirect đến trang login khi khởi động
    throw redirect({
      to: '/admin/login',
    })
  },
})
