import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const SignUp = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (signUpError) throw signUpError;
      
      // Usually requires email confirmation, but for local dev with auto-confirm:
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center p-6 font-body-md antialiased">
      {/* Container */}
      <div className="flex flex-col md:flex-row w-full max-w-[1024px] bg-surface-container-lowest border border-surface-variant shadow-sm rounded-lg overflow-hidden min-h-[600px]">
        {/* Left Side: Image/Branding */}
        <div className="hidden md:flex md:w-1/2 relative bg-surface-container-low border-r border-surface-variant flex-col justify-between p-8">
          <div className="z-10 relative">
            <h1 className="font-display text-display text-primary flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>ac_unit</span>
              ColdStore360
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mt-4">
              Enterprise logistics and warehouse management system. Join the platform to optimize your cold storage operations.
            </p>
          </div>
          <div className="absolute inset-0 z-0">
            <div 
              className="bg-cover bg-center w-full h-full opacity-40 mix-blend-multiply" 
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCv37dJBYpSGBDpv6th2pFbnMs2iBTDKuzTD-g4WOYpFmqBZ8r9RjTq3RRPjpFVb1F090B5R2UfwVd9rR-sgzWeryMSs9ytVjVwcnsOfbgzwB6zM2bboO4VU9Ok8PnBMEXY1fzxnO3MpTcp6Q43OBLiOBWuI01EtLyHXC_iQxXkr6_3Eo_t--W6JHy_g_9jWPU54I5fUgjRXfZtsIUQC6f8YVtehC0TM_AYmbQ6uNg46TBYj6EfWwgr')" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-surface-container-low/50 to-transparent"></div>
          </div>
          <div className="z-10 relative mt-auto">
            <div className="bg-surface-container-lowest/80 backdrop-blur-sm border border-surface-variant p-4 rounded-lg">
              <p className="font-body-sm text-body-sm text-on-surface italic mb-2">"ColdStore360 transformed our inventory tracking. The precision is unmatched."</p>
              <p className="font-label-md text-label-md text-on-surface-variant">- Operations Director, Global Foods Inc.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Sign Up Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-surface-container-lowest">
          <div className="mb-8">
            {/* Mobile Logo Fallback */}
            <div className="md:hidden flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>ac_unit</span>
              <span className="font-headline-md text-headline-md text-primary font-bold">ColdStore360</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Create a new operator account.</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Enter your details below to get started with ColdStore360.</p>
          </div>
          
          {error && (
            <div className="mb-4 p-4 bg-error-container text-on-error-container rounded-DEFAULT text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-1">
              <label className="block font-label-md text-label-md text-on-surface" htmlFor="fullName">Full Name</label>
              <input 
                className="w-full h-[40px] px-3 bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md text-body-md rounded focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 placeholder:text-outline transition-all duration-200" 
                id="fullName" 
                placeholder="Jane Doe" 
                required 
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="block font-label-md text-label-md text-on-surface" htmlFor="email">Email Address</label>
              <input 
                className="w-full h-[40px] px-3 bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md text-body-md rounded focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 placeholder:text-outline transition-all duration-200" 
                id="email" 
                placeholder="jane.doe@company.com" 
                required 
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="block font-label-md text-label-md text-on-surface" htmlFor="password">Password</label>
              <input 
                className="w-full h-[40px] px-3 bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md text-body-md rounded focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 placeholder:text-outline transition-all duration-200" 
                id="password" 
                placeholder="••••••••" 
                required 
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="block font-label-md text-label-md text-on-surface" htmlFor="confirmPassword">Confirm Password</label>
              <input 
                className="w-full h-[40px] px-3 bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md text-body-md rounded focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 placeholder:text-outline transition-all duration-200" 
                id="confirmPassword" 
                placeholder="••••••••" 
                required 
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>
            <button 
              disabled={loading}
              className="w-full h-[40px] mt-6 bg-primary hover:bg-primary/90 text-on-primary font-label-md text-label-md rounded transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50" 
              type="submit"
            >
              {loading ? 'Creating...' : 'Create Account'}
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </form>
          
          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-surface-variant"></div>
            <span className="px-3 font-body-sm text-body-sm text-on-surface-variant">OR</span>
            <div className="flex-grow border-t border-surface-variant"></div>
          </div>
          
          <button className="w-full h-[40px] bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface font-label-md text-label-md rounded transition-colors duration-200 flex items-center justify-center gap-2" type="button">
            {/* Inline SVG for Google Logo */}
            <svg fill="none" height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
            </svg>
            Sign up with Google
          </button>
          
          <div className="mt-8 text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Already have an account? 
              <Link to="/login" className="text-secondary hover:text-secondary/80 font-medium underline transition-colors ml-1">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
