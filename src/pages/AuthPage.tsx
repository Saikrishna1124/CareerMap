import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, ArrowRight, ArrowLeft, Loader2, Eye, EyeOff, CheckCircle2, RotateCcw, ShieldCheck, Edit2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AuthPage: React.FC<{ mode: 'login' | 'signup' }> = ({ mode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // OTP Verification specific state
  const [signupStep, setSignupStep] = useState<'form' | 'otp'>('form');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [devNotice, setDevNotice] = useState<string | null>(null);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const { login, sendOtp, resendOtp, verifyOtp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Reset form stage when switching between login and signup
  useEffect(() => {
    setSignupStep('form');
    setError('');
    setSuccessMsg('');
    setDevNotice(null);
    setOtpDigits(['', '', '', '', '', '']);
  }, [mode]);

  // Timer countdown for resending OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Focus first OTP input when entering OTP step
  useEffect(() => {
    if (signupStep === 'otp' && otpInputsRef.current[0]) {
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
    }
  }, [signupStep]);

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Send OTP to User's Real Email
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setDevNotice(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please provide a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await sendOtp(email.trim(), password, name.trim());
      setSignupStep('otp');
      setResendCooldown(60);
      setSuccessMsg(response.message || `Verification code sent to ${email}`);
      if (response.devMode) {
        setDevNotice(response.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setError('');
    setSuccessMsg('');
    setIsLoading(true);
    try {
      const response = await resendOtp(email.trim());
      setResendCooldown(60);
      setSuccessMsg(response.message || 'A fresh verification code has been sent.');
      if (response.devMode) {
        setDevNotice(response.message);
      }
    } catch (err: any) {
      setError(err.message || 'Could not resend verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle individual OTP digit changes
  const handleOtpChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const updated = [...otpDigits];
      updated[index] = '';
      setOtpDigits(updated);
      return;
    }

    // Handle full paste (e.g. 6-digit code copied from email)
    if (cleaned.length >= 6) {
      const pasted = cleaned.slice(0, 6).split('');
      setOtpDigits(pasted);
      otpInputsRef.current[5]?.focus();
      return;
    }

    const updated = [...otpDigits];
    updated[index] = cleaned[cleaned.length - 1]; // take last entered digit
    setOtpDigits(updated);

    // Auto-advance focus to next field
    if (index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  // Handle Backspace navigation in OTP boxes
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Handle Paste event on OTP input
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;
    const digits = pasteData.split('');
    const updated = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      updated[i] = digits[i] || '';
    }
    setOtpDigits(updated);
    const targetIndex = Math.min(digits.length, 5);
    otpInputsRef.current[targetIndex]?.focus();
  };

  // Step 2: Verify OTP and finalize Account Creation
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otpDigits.join('');
    if (otpCode.length < 6) {
      setError('Please enter all 6 digits of your verification code.');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await verifyOtp(email.trim(), otpCode);
      setSuccessMsg('Account verified successfully! Redirecting...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Incorrect verification code. Please check your email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FB] dark:bg-slate-950 p-6 relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl relative z-10"
      >
        <Link
          to="/"
          className="absolute top-6 left-6 p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"
          title="Back to home"
        >
          <ArrowLeft size={20} />
        </Link>

        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-stone-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-md border border-slate-100 dark:border-slate-800/80 mx-auto mb-4 shrink-0">
            <img
              src="/main_logo.png"
              alt="CareerMap Logo"
              className="w-11 h-11 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {mode === 'login'
              ? 'Welcome Back'
              : signupStep === 'otp'
              ? 'Verify Your Email'
              : 'Join CareerMap'}
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            {mode === 'login'
              ? 'Your professional journey continues here'
              : signupStep === 'otp'
              ? 'Enter the 6-digit code sent to your inbox'
              : 'Create your account with verified real email'}
          </p>
        </div>

        {/* Alerts & Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 text-red-600 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-950/40 p-3 rounded-xl border border-red-200 dark:border-red-900/50"
            >
              {error}
            </motion.div>
          )}

          {successMsg && !error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 text-emerald-700 dark:text-emerald-400 text-sm text-center bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {devNotice && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-5 text-amber-700 dark:text-amber-400 text-xs bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/40 text-center"
            >
              💡 <strong>Dev Notice:</strong> {devNotice}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F5F7FB] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 pl-11 focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F5F7FB] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 pl-11 pr-12 focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white rounded-xl py-3.5 font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        )}

        {/* 2. SIGNUP - STEP 1: ACCOUNT DETAILS */}
        {mode === 'signup' && signupStep === 'form' && (
          <form onSubmit={handleRequestOtp} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F5F7FB] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 pl-11 focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Real Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F5F7FB] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 pl-11 focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white"
                  placeholder="Enter your email address"
                />
              </div>
              <p className="text-[11px] text-slate-400 ml-1">We will send a 6-digit verification code to this inbox.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F5F7FB] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 pl-11 pr-12 focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white"
                  placeholder="Enter your password (min 6 characters)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 ml-1">Used for normal sign in after your email is verified.</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white rounded-xl py-3.5 font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        )}

        {/* 3. SIGNUP - STEP 2: ENTER OTP */}
        {mode === 'signup' && signupStep === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-indigo-600/10 text-indigo-600 flex items-center justify-center shrink-0">
                  <Mail size={16} />
                </div>
                <div className="truncate">
                  <p className="text-[11px] text-slate-400 font-medium">Verification email sent to</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSignupStep('form');
                  setError('');
                }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline ml-2 shrink-0"
              >
                <Edit2 size={12} />
                <span>Edit</span>
              </button>
            </div>

            {/* 6 Digit Inputs */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">
                Enter 6-Digit Code
              </label>
              <div className="flex justify-between gap-2">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      otpInputsRef.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    className="w-12 h-14 text-center text-2xl font-bold font-mono bg-[#F5F7FB] dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all dark:text-white"
                  />
                ))}
              </div>
            </div>

            {/* Resend Action */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Didn't receive the email?</span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || isLoading}
                className="font-bold text-indigo-600 hover:text-indigo-700 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center gap-1 hover:underline"
              >
                <RotateCcw size={13} className={isLoading ? "animate-spin" : ""} />
                <span>
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </span>
              </button>
            </div>

            {/* Submit Verification */}
            <button
              type="submit"
              disabled={isLoading || otpDigits.join('').length < 6}
              className="w-full bg-indigo-600 text-white rounded-xl py-3.5 font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  <ShieldCheck size={18} />
                  <span>Verify & Create Account</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Navigation */}
        <div className="mt-8 text-center text-sm text-slate-500">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <Link to="/signup" className="text-indigo-600 font-bold hover:underline">Join Now</Link>
            </>
          ) : (
            <>
              Already a member?{' '}
              <Link to="/login" className="text-indigo-600 font-bold hover:underline">Login with Password</Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
