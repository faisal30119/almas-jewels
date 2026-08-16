import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, ArrowUpRight, Mail, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'forgot';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const { user, signInWithEmail, signUpWithEmail, resetPassword, signInWithGoogle } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetCooldown, setResetCooldown] = useState(0);

  useEffect(() => {
    if (user && isOpen) {
      handleClose();
    }
  }, [user, isOpen]);

  useEffect(() => {
    let timer: any;
    if (resetCooldown > 0) {
      timer = setTimeout(() => setResetCooldown(resetCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resetCooldown]);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setError(null);
    setResetEmailSent(false);
  };

  const switchMode = (newMode: 'login' | 'register' | 'forgot') => {
    resetForm();
    setMode(newMode);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanEmail = email.trim();

    try {
      if (mode === 'login') {
        if (!cleanEmail || !password) {
          throw new Error('Please fill in all required fields.');
        }
        await signInWithEmail(cleanEmail, password);
        handleClose();
      } else if (mode === 'register') {
        if (!cleanEmail || !password) {
          throw new Error('Please enter your email and password.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        await signUpWithEmail(cleanEmail, password, firstName.trim(), lastName.trim());
        handleClose();
      } else if (mode === 'forgot') {
        if (!cleanEmail) {
          throw new Error('Please enter your email address.');
        }
        await resetPassword(cleanEmail);
        setResetEmailSent(true);
        setResetCooldown(60);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let message = err.message || 'An error occurred. Please try again.';

      // Map Supabase error messages to user-friendly messages
      if (mode === 'forgot') {
        if (message.toLowerCase().includes('rate limit') || message.toLowerCase().includes('too many')) {
          message = 'Too many reset requests. Please wait a few minutes before trying again.';
        } else if (message.toLowerCase().includes('invalid email') || message.toLowerCase().includes('email not found')) {
          message = 'Please enter a valid email address.';
        }
      } else {
        if (message.toLowerCase().includes('invalid login') || message.toLowerCase().includes('invalid credentials') || message.toLowerCase().includes('email not confirmed')) {
          message = 'Invalid email or password. Please check your details and try again.';
        } else if (message.toLowerCase().includes('already registered') || message.toLowerCase().includes('already exists')) {
          message = 'An account with this email already exists. Please log in.';
        } else if (message.toLowerCase().includes('password should be') || message.toLowerCase().includes('weak password')) {
          message = 'Password is too weak. Please use at least 6 characters.';
        } else if (message.toLowerCase().includes('rate limit') || message.toLowerCase().includes('too many')) {
          message = 'Access temporarily disabled due to multiple failed attempts. Please try again later or reset your password.';
        }
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      // Google OAuth redirects — no immediate close needed
    } catch (err: any) {
      const msg = err?.message || '';
      if (!msg.toLowerCase().includes('cancelled') && !msg.toLowerCase().includes('closed')) {
        setError(msg || 'Google Sign-In failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-[480px] bg-white rounded-none shadow-2xl overflow-hidden z-10 p-6 sm:p-8 md:p-10 my-auto text-neutral-900 border border-neutral-100"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 p-2 text-neutral-500 hover:text-neutral-900 transition-colors focus:outline-none rounded-full hover:bg-neutral-100"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          {/* If Reset Email was successfully sent */}
          {mode === 'forgot' && resetEmailSent ? (
            <div className="text-center py-2 font-sans">
              <div className="w-16 h-16 bg-[#C79853]/10 text-[#C79853] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#C79853]/20">
                <Mail className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-normal text-neutral-900 tracking-tight mb-2">
                Check Your Email
              </h2>
              <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
                We've sent a password reset link to <strong className="text-neutral-900 font-medium">{email}</strong>. Please click the link in the email to set a new password.
              </p>

              <div className="bg-amber-50/70 border border-amber-200/60 p-3.5 text-xs text-amber-900 text-left mb-6 space-y-1">
                <p className="font-semibold">Didn't receive the email?</p>
                <p className="text-amber-800">Check your spam or junk folder. The link will remain valid for 1 hour.</p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  disabled={resetCooldown > 0 || loading}
                  onClick={handleSubmit}
                  className="w-full py-3.5 px-6 border border-[#C79853] text-[#C79853] hover:bg-[#C79853]/5 font-medium text-sm tracking-wide uppercase transition-colors disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin inline mr-2" />}
                  {resetCooldown > 0 ? `Resend email in ${resetCooldown}s` : 'Resend Reset Email'}
                </button>

                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="w-full py-3.5 px-6 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-sm tracking-wide uppercase transition-colors"
                >
                  Back to Log In
                </button>

                <button
                  type="button"
                  onClick={() => { setResetEmailSent(false); }}
                  className="text-xs text-neutral-500 hover:text-neutral-800 underline transition-colors pt-1 block mx-auto"
                >
                  Use a different email address
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Header Title */}
              <div className="mb-6">
                <h2 className="text-3xl sm:text-4xl font-serif font-normal text-neutral-900 tracking-tight">
                  {mode === 'login' && 'Log in'}
                  {mode === 'register' && 'Register'}
                  {mode === 'forgot' && 'Reset password'}
                </h2>
                {mode !== 'register' && (
                  <p className="text-sm text-neutral-500 mt-1 font-sans">
                    {mode === 'login' && 'Welcome back! Please enter your details.'}
                    {mode === 'forgot' && "Enter your email address and we'll send you a password reset link."}
                  </p>
                )}
              </div>

              {/* Feedback Banners */}
              {error && (
                <div className="mb-5 p-3 rounded-none bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-sans leading-relaxed flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 font-sans">
                {mode === 'register' && (
                  <>
                    <div>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name"
                        className="w-full px-4 py-3.5 bg-white border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-neutral-900 text-sm outline-none transition-all placeholder:text-neutral-400 rounded-none"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last name"
                        className="w-full px-4 py-3.5 bg-white border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-neutral-900 text-sm outline-none transition-all placeholder:text-neutral-400 rounded-none"
                      />
                    </div>
                  </>
                )}

                <div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email *"
                    className="w-full px-4 py-3.5 bg-white border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-neutral-900 text-sm outline-none transition-all placeholder:text-neutral-400 rounded-none"
                  />
                </div>

                {mode !== 'forgot' && (
                  <div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password *"
                      className="w-full px-4 py-3.5 bg-white border border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-neutral-900 text-sm outline-none transition-all placeholder:text-neutral-400 rounded-none"
                    />
                  </div>
                )}

                {/* Forgot password link */}
                {mode === 'login' && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-sm text-neutral-700 hover:text-neutral-900 underline underline-offset-4 decoration-neutral-300 transition-colors"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}

                {/* Main Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 bg-[#C79853] hover:bg-[#b88944] active:bg-[#a87a38] text-white font-medium text-base tracking-wide transition-colors flex items-center justify-center gap-2 rounded-none shadow-xs disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {!loading && (
                      <>
                        {mode === 'login' && 'Log in'}
                        {mode === 'register' && 'Register'}
                        {mode === 'forgot' && 'Send reset link'}
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Secondary Footer Links */}
              <div className="mt-6 pt-2 space-y-3 font-sans">
                {mode === 'login' && (
                  <button
                    onClick={() => switchMode('register')}
                    className="group text-left font-medium text-neutral-900 hover:text-[#C79853] transition-colors flex items-center gap-1 py-1 text-sm sm:text-base underline underline-offset-4 decoration-neutral-900"
                  >
                    <span>New customer? Create your account</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>
                )}

                {mode === 'register' && (
                  <button
                    onClick={() => switchMode('login')}
                    className="group text-left font-medium text-neutral-900 hover:text-[#C79853] transition-colors flex items-center gap-1 py-1 text-sm sm:text-base underline underline-offset-4 decoration-neutral-900"
                  >
                    <span>Already have an account? Log in here</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>
                )}

                {mode === 'forgot' && (
                  <button
                    onClick={() => switchMode('login')}
                    className="group text-left font-medium text-neutral-900 hover:text-[#D4A359] transition-colors flex items-center gap-1 py-1 text-sm sm:text-base border-b border-neutral-900 pb-1"
                  >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span>Back to log in</span>
                  </button>
                )}

                {/* Google Sign In option */}
                {mode !== 'forgot' && (
                  <div className="pt-3">
                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-neutral-200"></div>
                      <span className="flex-shrink mx-3 text-xs text-neutral-400 uppercase tracking-wider">or</span>
                      <div className="flex-grow border-t border-neutral-200"></div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      className="mt-2 w-full py-3 px-4 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-medium text-sm transition-colors flex items-center justify-center gap-3 rounded-none shadow-xs"
                    >
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Sign in with Google</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

