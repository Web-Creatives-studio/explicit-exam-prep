'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '../utils/supabase/client';
import { toast } from 'react-toastify';
import { 
  FaGraduationCap, 
  FaEnvelope, 
  FaLock, 
  FaSpinner, 
  FaEye, 
  FaEyeSlash, 
  FaCheckCircle, 
  FaQuoteLeft,
  FaShieldAlt,
  FaExclamationTriangle
} from 'react-icons/fa';

function LoginContent() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if user was kicked out due to another device login
  const errorParam = searchParams.get('error');
  const sessionTerminated = errorParam === 'session_terminated';

  useEffect(() => {
    if (sessionTerminated) {
      toast.warn('Your session was ended because your account logged in from another device.', {
        autoClose: 6000,
      });
    }
  }, [sessionTerminated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (authError) {
        throw new Error(authError.message || 'Invalid email or password.');
      }

      const user = authData?.user;

      if (!user || !user.id) {
        throw new Error('Authentication succeeded, but no user identity was returned.');
      }

      // -------------------------------------------------------------
      // 2. ENFORCE ONE SESSION PER USER (Device Token Lock)
      // -------------------------------------------------------------
      const newDeviceSessionToken = crypto.randomUUID();

      // Store in document cookie for middleware validation (30 days validity)
      document.cookie = `device_session_token=${newDeviceSessionToken}; path=/; max-age=2592000; SameSite=Lax; secure`;

      // Register this session in the database
      const { error: rpcError } = await supabase.rpc('register_user_session', {
        p_user_id: user.id,
        p_session_token: newDeviceSessionToken,
      });

      // Fallback update if RPC is not yet created in SQL
      if (rpcError) {
        await supabase
          .from('profiles')
          .update({
            current_session_token: newDeviceSessionToken,
            last_active_at: new Date().toISOString(),
          })
          .eq('id', user.id);
      }

      // -------------------------------------------------------------
      // 3. Fetch Role and Profile Info
      // -------------------------------------------------------------
      let userRole = 'student';
      let fullName = user?.user_metadata?.full_name || 'Candidate';

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role, full_name')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        userRole = profile.role || 'student';
        fullName = profile.full_name || fullName;
      } else if (profileError) {
        console.warn('Profile fetch warning (falling back to default role):', profileError);
      }

      toast.success(`Welcome back, ${fullName.split(' ')[0]}!`);

      // 4. Redirect based on role
      if (userRole === 'admin') {
        window.location.href = '/admin/dashboard';
      } else {
        const nextParam = searchParams.get('next');
        window.location.href = nextParam || '/practice/single';
      }

    } catch (err) {
      console.error('Login process error:', err);
      const errorMessage =
        err?.message ||
        (typeof err === 'string' ? err : 'An error occurred during login. Please try again.');
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-gray-100 flex selection:bg-orange-500 selection:text-white select-none">
      {/* LEFT COLUMN: AUTHENTICATION FORM */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-20 xl:px-24 bg-[#0a0c10] border-r border-gray-800/80">
        <div className="mx-auto w-full max-w-md">
          {/* Header & Logo */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
              <div className="w-11 h-11 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-600/30 group-hover:scale-105 transition">
                <FaGraduationCap className="text-2xl" />
              </div>
              <div>
                <span className="font-black text-2xl tracking-tight text-white block leading-tight">
                  TOPPERS<span className="text-orange-500">CBT</span>
                </span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Practice Portal
                </span>
              </div>
            </Link>

            <h1 className="text-3xl font-black text-white tracking-tight">
              Candidate Login
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Access your personalized practice dashboard and timed mock tests.
            </p>

            {/* Session Expired Banner if kicked out by another device */}
            {sessionTerminated && (
              <div className="mt-4 p-3.5 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex items-start gap-3 text-xs text-yellow-300">
                <FaExclamationTriangle className="text-yellow-400 text-sm shrink-0 mt-0.5" />
                <span>
                  <strong>Single-Device Lock:</strong> Your previous session was signed out because your account logged in from another device.
                </span>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5 tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <FaEnvelope className="text-sm" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aspirant@gmail.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#141822] border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5 tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <FaLock className="text-sm" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-[#141822] border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300 transition cursor-pointer"
                >
                  {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] disabled:bg-orange-500/50 text-white font-extrabold py-3.5 rounded-xl transition shadow-lg shadow-orange-600/30 hover:-translate-y-0.5 text-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" /> Verifying Credentials...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          {/* Footer Notice */}
          <div className="mt-8 pt-6 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
            <span>
              New candidate?{' '}
              <Link href="/signup" className="font-bold text-orange-400 hover:text-orange-300">
                Register Free
              </Link>
            </span>
            <div className="flex items-center gap-1.5 text-gray-500">
              <FaShieldAlt className="text-[11px] text-orange-500" /> Single-Device Protected
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: HERO VISUAL */}
      <div className="hidden lg:flex flex-1 relative bg-[#0b0e14] overflow-hidden justify-between flex-col p-12 text-white">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 scale-105 transition duration-700 opacity-20"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1600&auto=format&fit=crop')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10] via-[#0a0c10]/90 to-[#0a0c10]/70 z-10" />

        <div className="relative z-20 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-xs font-bold uppercase tracking-wider text-orange-400">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            2026/2027 Admissions Prep
          </div>
          <span className="text-xs text-gray-400 font-mono font-semibold">
            Great Ife • Excellence
          </span>
        </div>

        <div className="relative z-20 max-w-lg space-y-6 my-auto">
          <div className="w-12 h-12 rounded-2xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400 text-xl shadow-lg shadow-orange-600/20">
            <FaQuoteLeft />
          </div>

          <blockquote className="text-2xl xl:text-3xl font-black leading-snug tracking-tight text-white">
            "Preparation is the line between wishing for admission and walking through the Great Ife gates."
          </blockquote>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center font-black text-white text-sm shadow-md shadow-orange-600/30">
              OAU
            </div>
            <div>
              <div className="font-bold text-sm text-white">Obafemi Awolowo University</div>
              <div className="text-xs text-orange-400 font-medium">For Learning and Culture</div>
            </div>
          </div>
        </div>

        <div className="relative z-20 grid grid-cols-3 gap-3 pt-6 border-t border-gray-800 text-xs">
          <div className="flex items-center gap-2">
            <FaCheckCircle className="text-orange-500 text-sm shrink-0" />
            <span className="text-gray-300 font-medium">40 Mins Timed Mock</span>
          </div>
          <div className="flex items-center gap-2">
            <FaCheckCircle className="text-orange-500 text-sm shrink-0" />
            <span className="text-gray-300 font-medium">10,000+ Past Qs</span>
          </div>
          <div className="flex items-center gap-2">
            <FaCheckCircle className="text-orange-500 text-sm shrink-0" />
            <span className="text-gray-300 font-medium">Weekly Leaderboard</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0c10]" />}>
      <LoginContent />
    </Suspense>
  );
}