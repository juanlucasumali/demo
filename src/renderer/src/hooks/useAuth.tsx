import { useEffect, useState, useContext, createContext, FC, PropsWithChildren } from 'react'
import { supabase } from '../lib/supabaseClient'

interface AuthContextValue {
  session: any;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ session: null, loading: true })

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
    const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const initSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (isMounted) {
        if (error) console.error("Error getting session:", error)
        setSession(session)
        setLoading(false)
      }
    }

    initSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      isMounted = false
      authListener?.subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
