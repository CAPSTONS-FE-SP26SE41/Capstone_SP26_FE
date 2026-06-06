import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import appCss from '../styles.css?url'
import { AlertProvider } from '../components/ui/AlertContext'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Trip Planner',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        type: 'image/png',
        href: '/favicon.png',
      },
    ],
  }),

  shellComponent: RootDocument,
  notFoundComponent: () => {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 bg-slate-50">
        <h1 className="text-8xl font-black text-slate-200">404</h1>
        <div className="mt-4">
          <h2 className="text-2xl font-bold text-slate-800">Oops! Trang không tìm thấy</h2>
          <p className="text-slate-500 mt-2 max-w-sm">
            Có vẻ như trang bạn đang tìm kiếm không tồn tại hoặc đã bị di dời.
          </p>
        </div>
        <a 
          href="/" 
          className="mt-8 px-6 py-3 bg-primary text-white font-semibold rounded-xl shadow-lg shadow-primary/20 hover:brightness-95 transition-all"
        >
          Quay lại trang chủ
        </a>
      </div>
    )
  },
})


function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <AlertProvider>
          {children}
        </AlertProvider>

        {/* <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        /> */}

        <Scripts />
      </body>
    </html>
  )
}

