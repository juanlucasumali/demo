import { FC } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth, AuthProvider } from './hooks/useAuth'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { WelcomePage } from './pages/WelcomePage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { VerifyEmailPage } from './pages/VerifyEmailPage'
import { DashboardLayout } from './pages/dashboard/DashboardLayout'
import { dashboardRoutes } from './routes/dashboardRoutes'
import { FoldersProvider } from './contexts/FoldersContext'

const AppContent: FC = () => {
  const { session, loading } = useAuth()

  if (loading) return <div>Loading...</div>

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <Router>
        <Routes>
          <Route path="/" element={
            session && session.user
              ? (session.user.email_confirmed_at ? <Navigate to="/dashboard" /> : <Navigate to="/verify" />)
              : <WelcomePage />
          }/>

          <Route path="/login" element={
            session && session.user
              ? (session.user.email_confirmed_at ? <Navigate to="/dashboard" /> : <Navigate to="/verify" />)
              : <LoginPage />
          }/>

          <Route path="/signup" element={
            session && session.user
              ? (session.user.email_confirmed_at ? <Navigate to="/dashboard" /> : <Navigate to="/verify" />)
              : <SignupPage />
          }/>

          <Route path="/verify" element={ <VerifyEmailPage /> }/>

          <Route element={<ProtectedRoute session={session} />}>
            <Route path="/dashboard/*" element={<DashboardLayout />}>
              {dashboardRoutes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={route.element}
                />
              ))}
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </div>
  )
}

const App: FC = () => {
  return (
    <AuthProvider>
      <FoldersProvider> 
        <AppContent />
      </FoldersProvider>
    </AuthProvider>
  )
}

export default App
