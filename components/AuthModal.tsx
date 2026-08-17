'use client';
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type Mode = 'login' | 'register' | 'forgot';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
    openAuthModal,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    resetPassword,
  } = useAuth();

  const [mode, setMode] = useState<Mode>(authModalMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync mode when modal opens
  React.useEffect(() => {
    if (isAuthModalOpen) {
      setMode(authModalMode);
      setError(null);
      setSuccessMsg(null);
      setEmail('');
      setPassword('');
      setDisplayName('');
    }
  }, [isAuthModalOpen, authModalMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    if (mode === 'login') {
      const { error: err } = await signInWithEmail(email, password);
      if (err) {
        setError(err);
      } else {
        closeAuthModal();
      }
    } else if (mode === 'register') {
      if (!displayName.trim()) {
        setError('Please enter your name.');
        setLoading(false);
        return;
      }
      const { error: err } = await signUpWithEmail(email, password, displayName);
      if (err) {
        setError(err);
      } else {
        setSuccessMsg('Account created! Please check your email to verify.');
      }
    } else if (mode === 'forgot') {
      const { error: err } = await resetPassword(email);
      if (err) {
        setError(err);
      } else {
        setSuccessMsg('Password reset link sent. Check your inbox.');
      }
    }

    setLoading(false);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setSuccessMsg(null);
  };

  const inputClass =
    'w-full bg-transparent border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors placeholder-gray-400';

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/60 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAuthModal}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-white w-full max-w-md relative">
              {/* Header bar */}
              <div className="bg-[#022c22] px-5 sm:px-8 py-5 sm:py-6 flex items-center justify-between">
                <div>
                  <p className="text-[#D4AF37] text-[10px] sm:text-xs tracking-widest uppercase font-sans mb-1">
                    Almas Jewels
                  </p>
                  <h2 className="text-white font-serif text-lg sm:text-xl font-semibold">
                    {mode === 'login' && 'Welcome Back'}
                    {mode === 'register' && 'Create Account'}
                    {mode === 'forgot' && 'Reset Password'}
                  </h2>
                </div>
                <button
                  onClick={closeAuthModal}
                  className="text-white/60 hover:text-white transition-colors p-1"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="px-5 sm:px-8 py-6 sm:py-8">
                {/* Google sign-in (not on forgot mode) */}
                {mode !== 'forgot' && (
                  <button
                    onClick={signInWithGoogle}
                    className="w-full border border-gray-300 flex items-center justify-center gap-3 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors mb-6"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path
                        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                        fill="#4285F4"
                      />
                      <path
                        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
                        fill="#34A853"
                      />
                      <path
                        d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue with Google
                  </button>
                )}

                {mode !== 'forgot' && (
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400 tracking-widest uppercase">or</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'register' && (
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className={inputClass}
                      required
                    />
                  )}

                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    required
                  />

                  {mode !== 'forgot' && (
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputClass + ' pr-12'}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPass((v) => !v)}
                        tabIndex={-1}
                      >
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  )}

                  {error && (
                    <p className="text-red-600 text-xs border border-red-200 bg-red-50 px-3 py-2">
                      {error}
                    </p>
                  )}
                  {successMsg && (
                    <p className="text-emerald-700 text-xs border border-emerald-200 bg-emerald-50 px-3 py-2">
                      {successMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#022c22] text-[#D4AF37] py-3 text-sm tracking-widest uppercase font-semibold hover:bg-[#064e3b] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    {mode === 'login' && 'Sign In'}
                    {mode === 'register' && 'Create Account'}
                    {mode === 'forgot' && 'Send Reset Link'}
                  </button>
                </form>

                {/* Footer links */}
                <div className="mt-6 text-center space-y-2">
                  {mode === 'login' && (
                    <>
                      <button
                        onClick={() => switchMode('forgot')}
                        className="text-xs text-gray-500 hover:text-[#D4AF37] transition-colors block w-full"
                      >
                        Forgot password?
                      </button>
                      <p className="text-xs text-gray-500">
                        No account?{' '}
                        <button
                          onClick={() => switchMode('register')}
                          className="text-[#D4AF37] hover:underline"
                        >
                          Create one
                        </button>
                      </p>
                    </>
                  )}
                  {mode === 'register' && (
                    <p className="text-xs text-gray-500">
                      Already have an account?{' '}
                      <button
                        onClick={() => switchMode('login')}
                        className="text-[#D4AF37] hover:underline"
                      >
                        Sign in
                      </button>
                    </p>
                  )}
                  {mode === 'forgot' && (
                    <button
                      onClick={() => switchMode('login')}
                      className="text-xs text-gray-500 hover:text-[#D4AF37] transition-colors"
                    >
                      Back to sign in
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
