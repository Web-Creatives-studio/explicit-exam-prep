'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  FaShieldAlt
} from 'react-icons/fa';

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // -------------------------------------------------------------
      // STEP 1: Authenticate with Supabase Auth
      // -------------------------------------------------------------
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (authError) {
        throw new Error(authError.message || 'Invalid email or password.');
      }

      const user = authData?.user;

      console.log(authData)
      if (!user || !user.id) {
        throw new Error('Authentication succeeded, but no user identity was returned.');
      }

      // -------------------------------------------------------------
      // STEP 2: Fetch Role from public.profiles table using user.id
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

      // -------------------------------------------------------------
      // STEP 3: Update last_active_at timestamp asynchronously
      // -------------------------------------------------------------
      supabase
        .from('profiles')
        .update({ last_active_at: new Date().toISOString() })
        .eq('id', user.id)
        .then(() => {});

      toast.success(`Welcome back, ${fullName.split(' ')[0]}!`);

      // -------------------------------------------------------------
      // STEP 4: Redirect based on verified role
      // -------------------------------------------------------------
      if (userRole === 'admin') {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/practice/single';
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* LEFT COLUMN: AUTHENTICATION FORM */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-md">
          {/* Header & Logo */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
              <div className="w-11 h-11 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-600/30 group-hover:scale-105 transition">
                <FaGraduationCap className="text-2xl" />
              </div>
              <div>
                <span className="font-black text-2xl tracking-tight text-gray-900 block leading-tight">
                  OAU<span className="text-orange-600">CBT</span>
                </span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Practice Portal
                </span>
              </div>
            </Link>

            <h1 className="text-3xl font-black text-gray-950 tracking-tight">
              Candidate Login
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Access your personalized practice dashboard and mock tests.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FaEnvelope className="text-sm" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aspirant@gmail.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FaLock className="text-sm" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-extrabold py-3.5 rounded-xl transition shadow-lg shadow-orange-600/25 hover:-translate-y-0.5 text-sm cursor-pointer"
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
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
            <span>
              New candidate?{' '}
              <Link href="/signup" className="font-bold text-orange-600 hover:text-orange-700">
                Register Free
              </Link>
            </span>
            <div className="flex items-center gap-1 text-gray-400">
              <FaShieldAlt className="text-[11px]" /> Role-aware secure gateway
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: HERO VISUAL */}
      <div className="hidden lg:flex flex-1 relative bg-[#0d0f14] overflow-hidden justify-between flex-col p-12 text-white">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 scale-105 transition duration-700"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1600&auto=format&fit=crop')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f14] via-[#0d0f14]/85 to-[#0d0f14]/60 z-10" />

        <div className="relative z-20 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold uppercase tracking-wider text-orange-400">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            2026/2027 Admissions Prep
          </div>
          <span className="text-xs text-gray-400 font-mono font-semibold">
            Great Ife • Excellence
          </span>
        </div>

        <div className="relative z-20 max-w-lg space-y-6 my-auto">
          <div className="w-12 h-12 rounded-2xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400 text-xl">
            <FaQuoteLeft />
          </div>

          <blockquote className="text-2xl xl:text-3xl font-black leading-snug tracking-tight text-white">
            "Preparation is the line between wishing for admission and walking through the Great Ife gates."
          </blockquote>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
              OAU
            </div>
            <div>
              <div className="font-bold text-sm text-white">Obafemi Awolowo University</div>
              <div className="text-xs text-orange-400 font-medium">For Learning and Culture</div>
            </div>
          </div>
        </div>

        <div className="relative z-20 grid grid-cols-3 gap-3 pt-6 border-t border-white/10 text-xs">
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