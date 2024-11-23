import { FC, useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import MainApp from './components/MainApp'
import { supabase } from './lib/supabaseClient'
import MainInterface from './components/MainInterface'

const App: FC = () => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="w-full h-screen flex flex-col px-5 space-y-8 items-center justify-center">
      {session ? <MainInterface /> : <MainApp />}
    </div>
  )
}

export default App