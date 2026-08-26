// src/admin/Login.tsx
import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabaseClient';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      if (/not confirmed/i.test(signInError.message)) {
        setError('Tu usuario todavía no está confirmado. Pedile a quien armó el sitio que lo revise.');
      } else {
        setError('Usuario o contraseña incorrectos.');
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0b0a] px-5 text-[#f2eee7]">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#141210] p-8">
        <h1 className="font-serif text-3xl">Panel A&G</h1>
        <p className="mt-2 text-sm text-white/50">Ingresá con tu usuario para cargar productos.</p>
        <label className="mt-6 block text-xs uppercase tracking-wide text-white/50">Email</label>
        <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#c99558]" />
        <label className="mt-4 block text-xs uppercase tracking-wide text-white/50">Contraseña</label>
        <input type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#c99558]" />
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={loading} className="mt-6 w-full rounded-full bg-[#c99558] py-3 text-sm font-semibold uppercase tracking-wide text-black transition hover:bg-[#dba86c] disabled:opacity-50">
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}

export default Login;
