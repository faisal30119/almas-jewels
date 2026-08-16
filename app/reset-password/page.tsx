'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Supabase sends the user to this page with a hash containing the token.
  // The @supabase/ssr middleware automatically exchanges it for a session.
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push('/'), 3000);
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="max-w-sm w-full text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 size={36} className="text-emerald-600" />
            </div>
          </div>
          <h1 className="font-serif text-3xl text-emerald-950 mb-3">Password Updated</h1>
          <p className="text-gray-500 font-sans text-sm mb-6">
            Your password has been changed successfully. Redirecting you to the homepage…
          </p>
          <Link
            href="/"
            className="inline-block bg-emerald-950 text-white font-sans text-xs uppercase tracking-widest px-8 py-4 hover:bg-emerald-900 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-sm w-full">
        {/* Brand */}
        <div className="text-center mb-10">
          <Link href="/" className="font-serif text-2xl text-emerald-950 tracking-widest">
            ALMAS JEWELS
          </Link>
          <p className="text-xs font-sans uppercase tracking-widest text-gray-400 mt-2">
            Set New Password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New password */}
          <div>
            <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Minimum 8 characters"
                className="w-full border border-gray-200 px-4 py-3 font-sans text-sm text-emerald-950 placeholder-gray-300 focus:outline-none focus:border-emerald-950 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-950"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">
              Confirm Password
            </label>
            <input
              type={showPw ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              placeholder="Re-enter your password"
              className="w-full border border-gray-200 px-4 py-3 font-sans text-sm text-emerald-950 placeholder-gray-300 focus:outline-none focus:border-emerald-950"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 text-red-600 text-xs font-sans">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-950 text-white font-sans text-xs uppercase tracking-widest py-4 hover:bg-emerald-900 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Update Password
          </button>
        </form>

        <p className="text-center text-xs font-sans text-gray-400 mt-8">
          Remembered it?{' '}
          <Link href="/" className="text-emerald-950 hover:underline">
            Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-8 h-8 border-2 border-emerald-950 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
