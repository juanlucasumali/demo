import { FC } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

interface VerifiedRouteProps {
  session: any;
}

export const VerifiedRoute: FC<VerifiedRouteProps> = ({ session }) => {
  if (!session || !session.user) {
    return <Navigate to="/" replace />
  }

  // If user exists but not verified:
  if (!session.user.email_confirmed_at) {
    return <Outlet />
  }

  // If already verified, send them to dashboard
  return <Navigate to="/dashboard" replace />
}
