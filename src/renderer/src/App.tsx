import { FC } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth, AuthProvider } from './hooks/useAuth'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { WelcomePage } from './pages/WelcomePage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { VerifyEmailPage } from './pages/VerifyEmailPage'
import { Dashboard } from './components/dashboard/Dashboard'
import MyFiles from './components/dashboard/MyFiles/MyFiles'

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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/files" element={<MyFiles />} />
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
      <AppContent />
    </AuthProvider>
  )
}

export default App
