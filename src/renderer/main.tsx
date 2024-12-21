import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router'
import './index.css'

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import { ThemeProvider } from './context/theme-context'

const memoryHistory = createMemoryHistory({
  initialEntries: ['/home'] // Pass your initial url
})

// Create a new router instance
const router = createRouter({ routeTree, history: memoryHistory })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
        <RouterProvider router={router} />
      </ThemeProvider>
    </StrictMode>,
  )
}