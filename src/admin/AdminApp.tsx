// src/admin/AdminApp.tsx
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import Login from './Login';

function AdminApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setCheckingSession(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingSession(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!supabase) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0b0a] p-6 text-center text-[#f2eee7]">
        Falta configurar Supabase (variables de entorno VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).
      </div>
    );
  }

  if (checkingSession) {
    return <div className="flex min-h-screen items-center justify-center bg-[#0b0b0a] text-[#f2eee7]">Cargando...</div>;
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0b0a] text-[#f2eee7]">
      Sesión iniciada. Panel en construcción (Task 6).
    </div>
  );
}

export default AdminApp;
