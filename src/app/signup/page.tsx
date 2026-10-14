// src/app/signup/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/config/supabase';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    router.push('/');
    router.refresh();
  };

  return (
    <main className="gt-auth-layout">
      <div className="gt-modal-card gt-auth-card">
        <div className="gt-auth-header">
          <h1 className="gt-dashboard-title !text-3xl !m-0">GradeTrack</h1>
          <p className="gt-auth-subtitle">
            Create a new account
          </p>
        </div>

        {errorMsg && (
          <div className="gt-auth-error-badge">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSignup} className="gt-auth-form">
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

          <div className="gt-field-group">
            <label className="gt-field-label">Confirm Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="gt-form-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="gt-btn-primary gt-pop-target gt-auth-submit-btn"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="gt-auth-toggle-link">
          Already have an account?{' '}
          <Link href="/login">
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}