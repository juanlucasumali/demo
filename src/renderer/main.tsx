import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router'
import './index.css'

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import { ThemeProvider } from './context/theme-context'
import { AuthProvider, useAuth } from './context/auth-context'
import { Toaster } from './components/ui/toaster'

const memoryHistory = createMemoryHistory({
  initialEntries: ['/home'] // Pass your initial url
})

// Create a new router instance
const router = createRouter({ 
  routeTree, 
  history: memoryHistory,
  context: {
    auth: undefined!,
  },
  defaultPreload: 'intent',
  defaultErrorComponent: ({ error }) => {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Something went wrong!</h1>
          <pre className="text-sm text-red-500">{error.message}</pre>
        </div>
      </div>
    )
  }
 })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function InnerApp() {
  const auth = useAuth()
  return (
    <>
      <RouterProvider router={router} context={{ auth }} />
      <Toaster />
    </>
  )
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)

  root.render(
    <StrictMode>
      <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
        <AuthProvider>
          <InnerApp />
        </AuthProvider>
      </ThemeProvider>
    </StrictMode>,
  )
}