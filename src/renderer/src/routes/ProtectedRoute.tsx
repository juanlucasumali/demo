import { FC } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

// Props:
// - session: The current Supabase session (or null)
// This route ensures the user is logged in and their email is confirmed.

interface ProtectedRouteProps {
  session: any; // Adjust type to match your session type
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({ session }) => {
  if (!session || !session.user) {
    // Not logged in
    return <Navigate to="/" replace />
  }

  if (!session.user.email_confirmed_at) {
    // Not verified
    return <Navigate to="/verify" replace />
  }

  return <Outlet />
}
