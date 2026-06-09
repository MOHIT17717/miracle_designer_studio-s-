'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile.trim() || !password.trim()) {
      setError('Please enter both mobile number and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await login(mobile.trim(), password.trim());
      if (res.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-black relative overflow-hidden px-6 py-12">
      {/* Immersive Fashion Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1549439602-43ebca2327af?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-[0.08]" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/80 to-transparent" />
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-gold-500/10 rounded-full blur-[120px] transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-rose-500/10 rounded-full blur-[100px] transform -translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row items-stretch rounded-3xl overflow-hidden glass border-glow shadow-2xl">
        
        {/* Left Section: Visual/Branding */}
        <div className="hidden md:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden bg-gradient-to-br from-white/[0.05] to-transparent">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?q=80&w=1887&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-black/50 to-brand-black" />
          
          <div className="relative z-10 space-y-4">
            <div className="w-16 h-16 rounded-full border border-gold-500/50 flex items-center justify-center bg-brand-black/50 backdrop-blur-md">
              <span className="font-display font-bold text-gradient-gold text-2xl">M</span>
            </div>
          </div>

          <div className="relative z-10 space-y-4 mt-20">
            <h1 className="font-display text-4xl lg:text-5xl font-bold text-cream leading-tight">
              Where Style <br/>
              <span className="text-gradient-gold italic">Meets Grace</span>
            </h1>
            <p className="text-white/60 font-light max-w-sm leading-relaxed">
              Step into the exclusive world of Miracles Designer Studio. Access your bespoke bridal couture, premium sarees, and beauty appointments all in one place.
            </p>
          </div>
        </div>

        {/* Right Section: Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-brand-dark/95 backdrop-blur-xl border-l border-white/5">
          <div className="max-w-sm w-full mx-auto space-y-8">
            <div className="text-center md:text-left space-y-2">
              <h2 className="font-display text-3xl font-bold text-cream tracking-tight">Welcome Back</h2>
              <p className="text-white/50 text-sm font-light">Sign in to continue your fashion journey.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center animate-fade-in">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">📱</span>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="Enter mobile number"
                      className="input-field w-full pl-12 text-sm tracking-widest"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-white/50 font-semibold flex justify-between">
                    <span>Password</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">🔒</span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-field w-full pl-12 text-lg tracking-widest"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-gold w-full text-center py-4 rounded-xl uppercase tracking-wider text-sm font-bold shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all disabled:opacity-50 disabled:shadow-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Authenticating...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="text-center pt-6 border-t border-white/5">
              <p className="text-white/30 text-xs">
                Protected by Miracles Designer Studio security.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
