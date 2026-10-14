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
    <main className="gt-auth-layout">
      <div className="gt-modal-card gt-auth-card">
        <div className="gt-auth-header">
          <h1 className="gt-dashboard-title !text-3xl !m-0">GradeTrack</h1>
          <p className="gt-auth-subtitle">
            Sign in to access your GradeTrack
          </p>
        </div>

        {errorMsg && (
          <div className="gt-auth-error-badge">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="gt-auth-form">
          <div className="gt-field-group">
            <label className="gt-field-label">Email Address</label>
            <input
              type="email"
              required
              placeholder="user@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="gt-form-input"
            />
          </div>

          <div className="gt-field-group">
            <label className="gt-field-label">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="gt-form-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="gt-btn-primary gt-pop-target gt-auth-submit-btn"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="gt-auth-toggle-link">
          Don&apos;t have an account?{' '}
          <Link href="/signup">
            Create an Account
          </Link>
        </div>

        <div className="gt-auth-divider">
          <div className="gt-auth-divider-line" />
          <span className="gt-auth-divider-text">OR</span>
          <div className="gt-auth-divider-line" />
        </div>

        <button
          type="button"
          onClick={handleDemoAccess}
          disabled={loading}
          className="gt-btn-cancel gt-pop-target gt-auth-submit-btn !text-slate-800"
        >
          Try Demo Account
        </button>
      </div>
    </main>
  );
}