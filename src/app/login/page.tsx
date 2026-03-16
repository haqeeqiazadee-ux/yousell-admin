'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );
}

export default function ClientLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = getSupabase();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Check role to route to the correct dashboard
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'admin' || profile?.role === 'super_admin') {
        window.location.href = '/admin';
        return;
      }
    }

    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-emerald-500/5 blur-3xl" />

      <div className="w-full max-w-[1100px] grid md:grid-cols-2 gap-0 relative z-10">
        {/* Left – Login Form */}
        <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/[0.06] rounded-l-2xl md:rounded-l-2xl rounded-t-2xl md:rounded-tr-none p-8 md:p-10 flex flex-col justify-center">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              You<span className="text-red-500">Sell</span><span className="text-emerald-400">.</span><span className="text-gray-400">Online</span>
            </h1>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-gray-400 text-sm mb-8">Sign in to your client dashboard</p>

          {/* Social Login Buttons */}
          <SocialLoginButtons redirectTo="/dashboard" />

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[#111827] px-4 text-gray-500">or sign in with email</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 mb-4">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500/50"
                />
                <span className="text-sm text-gray-400">Remember me for 7 days</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg py-2.5 text-sm font-semibold hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 transition-all shadow-lg shadow-rose-500/20"
            >
              {loading ? 'Signing in...' : 'Sign In \u2192'}
            </button>
          </form>

          {/* Sign up link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              Contact YouSell
            </Link>
          </p>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-white/5 text-center">
            <p className="text-xs text-gray-600">
              &copy; {new Date().getFullYear()} YouSell Online LLC &middot;{' '}
              <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy</Link> &middot;{' '}
              <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms</Link>
            </p>
          </div>
        </div>

        {/* Right – Feature Panel */}
        <div className="bg-gradient-to-br from-[#0F1A2E] to-[#0B1120] border border-white/[0.06] border-l-0 rounded-r-2xl md:rounded-r-2xl rounded-b-2xl md:rounded-bl-none p-8 md:p-10 flex flex-col justify-center hidden md:flex">
          <span className="text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-4">
            Your Ecommerce HQ
          </span>
          <h2 className="text-3xl font-bold text-white leading-tight mb-2">
            All your platforms.<br />One dashboard.
          </h2>
          <p className="text-gray-400 text-sm mb-10">
            Real-time data from Amazon, TikTok Shop, and Shopify &mdash; unified in one place.
          </p>

          {/* Feature list */}
          <div className="space-y-5">
            <FeatureItem
              icon="📦"
              title="Amazon Analytics"
              description="Revenue, ACOS, BSR, inventory & account health"
            />
            <FeatureItem
              icon="🎵"
              title="TikTok Shop GMV"
              description="Creator performance, live sessions & GMV tracking"
            />
            <FeatureItem
              icon="🛍️"
              title="Shopify Store"
              description="Orders, conversion rate, AOV & email subscribers"
            />
            <FeatureItem
              icon="📊"
              title="Weekly Reports"
              description="Auto-generated PDF reports with your branded data"
            />
          </div>

          {/* Integration badges */}
          <div className="flex flex-wrap gap-2 mt-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
              📦 Amazon SP-API
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
              🎵 TikTok Open API
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
              🛍️ Shopify Admin API
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xl mt-0.5 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-white/5">
        {icon}
      </span>
      <div>
        <h3 className="text-white font-semibold text-sm">{title}</h3>
        <p className="text-gray-500 text-xs mt-0.5">{description}</p>
      </div>
    </div>
  );
}
