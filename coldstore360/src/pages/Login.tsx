import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Check role and redirect appropriately. For MVP, go to dashboard.
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface h-full flex font-body-md text-on-surface antialiased selection:bg-secondary-fixed selection:text-on-secondary-fixed min-h-screen">
      <main className="flex w-full h-full min-h-screen">
        {/* Left Side: Image / Branding */}
        <div className="hidden lg:flex w-1/2 bg-tertiary-container relative overflow-hidden items-center justify-center">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-60"
            style={{
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBfGJ2MHZ2bt-QQd483gSgjPWCpI13W8kBlzlfudj4UjjzSD7Ksdmey8u1DzdYptHhZFejcaz6og7PpdgKPVjG0IEOrcjsGO6f72IC66iAMuRhgpLvbsDcm3F2WOu0JOHU6fteDW4dla5vrw8jlj5g32Nj3uAVSmTxCHuVM5OyxAOo-M2BwCb89jS5QXc7Utba6yDqyG7Wvhn7NjkaxIEec2kFPasJQub8XOJxgAbKdOWjaHQvaSukC')`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-tertiary-container to-transparent opacity-80" />
          <div className="relative z-10 text-on-tertiary p-12 max-w-lg">
            <div className="flex items-center gap-3 mb-8">
              <span
                className="material-symbols-outlined text-4xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                ac_unit
              </span>
              <h1 className="font-display text-display font-black tracking-tight text-on-tertiary">
                ColdStore360
              </h1>
            </div>
            <p className="font-headline-lg text-headline-lg font-light mb-6">
              Cold Storage Operations Platform
            </p>
            <p className="font-body-lg text-body-lg text-tertiary-fixed-dim">
              Industrial precision and high-utility warehouse management engineered for performance and data density.
            </p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-surface-container-lowest">
          <div className="w-full max-w-md">
            <div className="mb-10 lg:hidden flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="material-symbols-outlined text-primary text-3xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  ac_unit
                </span>
                <h1 className="font-headline-lg text-headline-lg font-black text-on-surface">
                  ColdStore360
                </h1>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant text-center">
                Cold Storage Operations Platform
              </p>
            </div>

            <div className="mb-8">
              <h2 className="font-headline-lg text-headline-lg mb-2">Sign In</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Access your dashboard and manage operations.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-error-container text-on-error-container rounded-DEFAULT text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label
                  className="block font-label-md text-label-md text-on-surface"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <input
                  className="w-full h-11 bg-surface-container-lowest border border-surface-variant text-on-surface rounded-DEFAULT px-4 font-body-md text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-colors"
                  id="email"
                  placeholder="operator@coldstore360.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label
                    className="block font-label-md text-label-md text-on-surface"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <a
                    className="font-label-md text-label-md text-secondary hover:text-on-secondary-fixed-variant transition-colors"
                    href="#"
                  >
                    Forgot Password?
                  </a>
                </div>
                <input
                  className="w-full h-11 bg-surface-container-lowest border border-surface-variant text-on-surface rounded-DEFAULT px-4 font-body-md text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-colors"
                  id="password"
                  placeholder="••••••••"
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                className="w-full h-11 bg-primary text-on-primary font-label-md text-label-md rounded-DEFAULT hover:bg-tertiary-container transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
