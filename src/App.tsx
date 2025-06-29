import React, { useEffect, useState } from 'react'
import { useAuthStore, initializeSupabase } from './lib/auth'
import { AppWrapper } from './components/ui/AppWrapper'
import ReelSkillsDashboard from './components/ReelSkillsDashboard'
import './index.css'

function App() {
  const {
    initialize,
    isLoading,
    isInitializing,
    isAuthenticated,
    user,
    profile,
    login,
    signup,
    sendPasswordResetEmail,
    error,
  } = useAuthStore();
  const [localInitializing, setLocalInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseAnonKey) throw new Error('Missing Supabase env');
        initializeSupabase(supabaseUrl, supabaseAnonKey);
        await initialize();
      } catch (error) {
        setInitError(error instanceof Error ? error.message : 'Init error');
      } finally {
        setLocalInitializing(false);
      }
    };
    init();
  }, [initialize]);

  if (localInitializing || isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (initError) {
    return <div className="min-h-screen flex items-center justify-center">{initError}</div>;
  }

  return (
    <AppWrapper
      isAuthenticated={isAuthenticated}
      isInitializing={isInitializing ?? false}
      user={user}
      error={error ?? null}
      onLogin={login}
      onSignup={signup}
      onPasswordReset={sendPasswordResetEmail}
      isLoading={isLoading ?? false}
    >
      {profile?.role === 'recruiter' ? (
        <div className="min-h-screen flex items-center justify-center">
          <p>ReelSkills is only available for candidates.</p>
        </div>
      ) : (
        <ReelSkillsDashboard />
      )}
    </AppWrapper>
  );
}

export default App