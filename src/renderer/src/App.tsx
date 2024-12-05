import { FC, useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import { Dashboard } from './components/dashboard/Dashboard'
import { AuthForm } from './components/auth/AuthForm'
import { VerifyEmail } from './components/auth/VerifyEmail'
import MyFiles from './components/dashboard/MyFiles/MyFiles'

export type ViewType = "welcome" | "signup" | "login" | "main" | "files" | "verify"

const App: FC = () => {
  const [view, setView] = useState<ViewType>("welcome")
  const [emailAddress, setEmailAddress] = useState("")

  useEffect(() => {
    let isMounted = true

    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error("Error getting session:", error)
        return
      }

      if (session && isMounted) {
        if (session.user.email_confirmed_at) {
          setView("main")
        } else {
          setView("verify")
        }
      }
    }

    getInitialSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        if (session.user.email_confirmed_at) {
          setView("main")
        } else {
          setView("verify")
        }
      } else {
        setView("welcome")
      }
    })

    return () => {
      isMounted = false
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const handleAuthSuccess = () => {
    setView("main")
  }

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      {view === "main" ? (
        <Dashboard />
      ) : view === "files" ? (
        <MyFiles />
      ) : view === "verify" ? (
        <VerifyEmail emailAddress={emailAddress} onBack={() => setView("signup")} />
      ) : (
        <AuthForm
          view={view as "welcome" | "login" | "signup"}
          onViewChange={setView}
          onSuccess={handleAuthSuccess}
          setEmailAddress={setEmailAddress}
        />
      )}
    </div>
  )
}

export default App
