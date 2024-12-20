import { createRootRoute } from '@tanstack/react-router'
import '../index.css'
import Home from './home'

export const Route = createRootRoute({
  // Implement breadcrumbs, Sidebar toggle, back & forth button
  component: () => (
    <>
      <Home />
    </>
  ),
})