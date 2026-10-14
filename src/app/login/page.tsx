// src/app/login/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/config/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message || 'Invalid email or password.');
      setLoading(false);
      return;
    }

    const isDemoUser = email.toLowerCase() === 'demo@gradetrack.com';
    router.push(isDemoUser ? '/?demo=true' : '/');
    router.refresh();
  };

  const handleDemoAccess = () => {
    router.push('/?demo=true');
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="gt-modal-card max-w-sm w-full !p-8 !gap-6">
        <div className="text-center mb-1">
          <h1 className="gt-dashboard-title text-3xl mb-2">GradeTrack</h1>
          <p className="text-sm font-medium text-slate-500">
            Sign in to access your account
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 text-xs font-semibold bg-red-50 text-red-700 border border-red-200 rounded-md text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="gt-editable-title-input py-2 px-3 text-sm"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="gt-editable-title-input py-2 px-3 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="gt-btn-primary gt-pop-target mt-2 py-2.5 text-sm font-bold text-center w-full"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 font-medium pt-1">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-bold text-slate-900 underline hover:text-slate-700">
            Create an Account
          </Link>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200" />
          <span className="flex-shrink mx-3 text-xs font-bold uppercase text-slate-400">OR</span>
          <div className="flex-grow border-t border-slate-200" />
        </div>

        <button
          type="button"
          onClick={handleDemoAccess}
          disabled={loading}
          className="gt-btn-cancel gt-pop-target w-full py-2.5 text-sm font-bold text-slate-800"
        >
          Try Demo Account
        </button>
      </div>
    </main>
  );
}