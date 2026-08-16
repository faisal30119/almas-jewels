import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ArrowLeft,
  Mail,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { confirmPasswordResetWithCode, resetPassword, openAuthModal } = useAuth();

  // States
  const [status, setStatus] = useState<'verifying' | 'valid_code' | 'invalid_code' | 'no_code' | 'success'>('verifying');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fallback direct request state
  const [requestEmail, setRequestEmail] = useState('');
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestCooldown, setRequestCooldown] = useState(0);

  useEffect(() => {
    let timer: any;
    if (requestCooldown > 0) {
      timer = setTimeout(() => setRequestCooldown(requestCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [requestCooldown]);

  useEffect(() => {
    // Supabase sends the recovery token in the URL hash fragment as #access_token=...&type=recovery
    // The Supabase JS client automatically picks up the session from the hash on page load.
    // We just need to check if we have a recovery session.
    const checkSession = async () => {
      // Give the Supabase client a moment to process the hash
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        setStatus('invalid_code');
        setError('Unable to verify this password reset link. Please request a new one.');
        return;
      }

      if (session) {
        // We have a valid session — could be recovery or normal login
        // Check if the URL contains recovery-related hash parameters
        const hash = window.location.hash;
        if (hash.includes('type=recovery') || hash.includes('access_token')) {
          setStatus('valid_code');
        } else {
          // Check if there are URL search params with error info
          const params = new URLSearchParams(window.location.search);
          const urlError = params.get('error');
          const urlErrorCode = params.get('error_code');
          if (urlError || urlErrorCode) {
            setStatus('invalid_code');
            if (urlErrorCode === 'otp_expired') {
              setError('This password reset link has expired. Please request a new one.');
            } else {
              setError(urlError || 'This password reset link is invalid or has already been used.');
            }
          } else {
            // No reset token in URL — user may have navigated here directly
            setStatus('no_code');
          }
        }
      } else {
        // No session — check for error params in URL
        const params = new URLSearchParams(window.location.search);
        const urlError = params.get('error');
        const urlErrorCode = params.get('error_code');
        if (urlError || urlErrorCode) {
          setStatus('invalid_code');
          if (urlErrorCode === 'otp_expired') {
            setError('This password reset link has expired. Please request a new one.');
          } else {
            setError(urlError || 'This password reset link is invalid or has already been used.');
          }
        } else {
          setStatus('no_code');
        }
      }
    };

    checkSession();
  }, []);

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword) {
      setError('Please enter a new password.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordResetWithCode('', newPassword);
      setStatus('success');
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestEmail) {
      setError('Please enter your email address.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await resetPassword(requestEmail);
      setRequestSuccess(true);
      setRequestCooldown(60);
    } catch (err: any) {
      console.error('Request reset error:', err);
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-neutral-50/50">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white border border-neutral-200 shadow-xl p-8 sm:p-10 text-neutral-900"
      >
        {/* Verifying Link Code State */}
        {status === 'verifying' && (
          <div className="text-center py-8">
            <Loader2 className="w-10 h-10 text-[#C79853] animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-serif text-neutral-900 mb-2">Verifying Link</h2>
            <p className="text-sm text-neutral-500 font-sans">
              Please wait while we verify your password reset security link...
            </p>
          </div>
        )}

        {/* Valid Code - Password Update Form */}
        {status === 'valid_code' && (
          <div>
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-[#C79853]/10 text-[#C79853] rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-7 h-7" />
              </div>
              <h1 className="text-3xl font-serif font-normal text-neutral-900 tracking-tight mb-2">
                Set New Password
              </h1>
              <p className="text-sm text-neutral-600 font-sans">
                Create a new secure password for your account
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-sans flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleResetSubmit} className="space-y-5 font-sans">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="w-full px-4 py-3 bg-white border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-neutral-900 text-sm outline-none transition-all placeholder:text-neutral-400 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    className="w-full px-4 py-3 bg-white border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-neutral-900 text-sm outline-none transition-all placeholder:text-neutral-400 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 bg-[#C79853] hover:bg-[#b88944] active:bg-[#a87a38] text-white font-medium text-sm uppercase tracking-widest transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {!loading && 'Save New Password'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Invalid or Expired Code */}
        {status === 'invalid_code' && (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-serif text-neutral-900 mb-2">Invalid or Expired Link</h2>
            <p className="text-sm text-neutral-600 mb-6 font-sans leading-relaxed">
              {error || 'This password reset link is invalid or has expired. Password reset links can only be used once.'}
            </p>

            <div className="space-y-3">
              <button
                onClick={() => setStatus('no_code')}
                className="w-full py-3 px-6 bg-[#C79853] hover:bg-[#b88944] text-white font-medium text-sm uppercase tracking-widest transition-colors shadow-sm"
              >
                Request a New Reset Link
              </button>
              <button
                onClick={() => openAuthModal('login')}
                className="w-full py-3 px-6 border border-neutral-300 text-neutral-800 hover:bg-neutral-50 font-medium text-sm uppercase tracking-widest transition-colors"
              >
                Back to Log In
              </button>
            </div>
          </div>
        )}

        {/* Successfully Reset Password */}
        {status === 'success' && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="text-3xl font-serif text-neutral-900 mb-2">Password Updated!</h2>
            <p className="text-sm text-neutral-600 mb-8 font-sans leading-relaxed">
              Your password has been successfully reset. You can now log in to your account with your new password.
            </p>

            <button
              onClick={() => {
                openAuthModal('login');
                navigate('/');
              }}
              className="w-full py-3.5 px-6 bg-[#C79853] hover:bg-[#b88944] text-white font-medium text-sm uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              Log In Now
            </button>
          </div>
        )}

        {/* No Code Provided / Request Reset Link Form */}
        {status === 'no_code' && (
          <div>
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-[#C79853]/10 text-[#C79853] rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7" />
              </div>
              <h1 className="text-3xl font-serif font-normal text-neutral-900 tracking-tight mb-2">
                Reset Password
              </h1>
              <p className="text-sm text-neutral-600 font-sans">
                Enter your account email address and we'll send you a link to reset your password.
              </p>
            </div>

            {requestSuccess ? (
              <div className="text-center py-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-sm text-emerald-900 text-sm mb-6 leading-relaxed">
                  <p className="font-semibold mb-1">Reset Link Sent!</p>
                  <p className="text-xs text-emerald-800">
                    We have emailed a password reset link to <strong className="text-emerald-950">{requestEmail}</strong>. Please check your inbox and spam folder.
                  </p>
                </div>

                <div className="space-y-3 font-sans">
                  <button
                    disabled={requestCooldown > 0 || loading}
                    onClick={handleRequestReset}
                    className="w-full py-3 border border-[#C79853] text-[#C79853] hover:bg-[#C79853]/5 font-medium text-sm uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    {requestCooldown > 0 ? `Resend email in ${requestCooldown}s` : 'Resend Email'}
                  </button>

                  <button
                    onClick={() => openAuthModal('login')}
                    className="w-full py-3 bg-neutral-900 text-white hover:bg-neutral-800 font-medium text-sm uppercase tracking-wider transition-colors"
                  >
                    Back to Log In
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {error && (
                  <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm font-sans flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleRequestReset} className="space-y-4 font-sans">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={requestEmail}
                      onChange={(e) => setRequestEmail(e.target.value)}
                      placeholder="Enter your registered email"
                      className="w-full px-4 py-3 bg-white border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-neutral-900 text-sm outline-none transition-all placeholder:text-neutral-400"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-6 bg-[#C79853] hover:bg-[#b88944] active:bg-[#a87a38] text-white font-medium text-sm uppercase tracking-widest transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                    >
                      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {!loading && 'Send Reset Link'}
                    </button>
                  </div>
                </form>

                <div className="mt-6 pt-4 border-t border-neutral-100 text-center">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Log In</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
