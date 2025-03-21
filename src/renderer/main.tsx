import './lib/polyfills'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router'
import './index.css'

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import { ThemeProvider } from './context/theme-context'
import { AuthProvider, useAuth } from './context/auth-context'
import { Toaster } from './components/ui/toaster'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UpdateHandler } from './components/update-handler'
import { MediaPlayer } from './components/media-player/media-player'
import { SyncCheck } from './components/sync-check'
import { Toaster as Sonner } from "./components/ui/sonner"
import { Subscript } from 'lucide-react'
import { SubscriptionProvider } from './context/subscription-context'


const memoryHistory = createMemoryHistory({
  initialEntries: ['/home'] // Pass your initial url
})

const queryClient = new QueryClient()

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
      <UpdateHandler />
      <SyncCheck/>
      <RouterProvider router={router} context={{ auth }} />
      <MediaPlayer />
      <Toaster />
      <Sonner />
    </>
  )
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)

  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
          <AuthProvider>
            <SubscriptionProvider>
              <InnerApp />
            </SubscriptionProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>,
  )
}