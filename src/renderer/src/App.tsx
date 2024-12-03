import { FC, useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import { Dashboard } from './components/Dashboard'
import { AuthForm } from './components/auth/AuthForm'

type ViewType = "welcome" | "signup" | "login" | "main"

const App: FC = () => {
  const [view, setView] = useState<ViewType>("welcome")

  useEffect(() => {
    let isMounted = true

    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error("Error getting session:", error)
        return
      }

      if (session && isMounted) {
        setView("main")
      }
    }

    getInitialSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setView("main")
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
      ) : (
        <AuthForm
          view={view as "welcome" | "login" | "signup"}
          onViewChange={setView}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  )
}

export default App