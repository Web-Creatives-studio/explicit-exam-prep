'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '../utils/supabase/client';
import { OAU_FACULTIES_AND_DEPARTMENTS } from '../utils/department';
import { toast } from 'react-toastify';
import { 
  FaGraduationCap, 
  FaEnvelope, 
  FaLock, 
  FaUser, 
  FaBuilding, 
  FaSpinner, 
  FaEye, 
  FaEyeSlash, 
  FaCheckCircle, 
  FaQuoteLeft,
  FaShieldAlt
} from 'react-icons/fa';

export default function SignUpPage() {
  const supabase = createClient();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!department) {
      toast.error('Please select your target department.');
      return;
    }

    setLoading(true);

    try {
      // 1. Sign up user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName,
            department: department,
            role: 'student',
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/practice/single`,
        },
      });

      if (authError) throw authError;

      const user = authData?.user;

      if (user) {
        // 2. Insert/Upsert into profiles table
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: user.id,
          full_name: fullName,
          department: department,
          role: 'student',
          is_premium: false,
          last_active_at: new Date().toISOString(),
        });

        if (profileError) {
          console.error('Profile insertion error:', profileError);
        }

        toast.success('Registration successful! Welcome to TOPPERS CBT.');
        
        // 3. Navigate straight to practice drills
        window.location.href = '/practice/single';
      }
    } catch (err) {
      toast.error(err.message || 'An error occurred during registration.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-gray-100 flex selection:bg-orange-500 selection:text-white select-none">
      {/* ------------------------------------------------------------- */}
      {/* LEFT COLUMN: REGISTRATION FORM */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col justify-center py-10 px-6 sm:px-12 lg:px-16 xl:px-20 bg-[#0a0c10] border-r border-gray-800/80">
        <div className="mx-auto w-full max-w-md">
          {/* Brand Header */}
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
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
              Create Account
            </h1>
            <p className="mt-1.5 text-sm text-gray-400">
              Join thousands of aspirants preparing for the 2026/2027 OAU Post-UTME.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignUp} className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1 tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <FaUser className="text-sm" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Adebayo Ogunlesi"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#141822] border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition"
                />
              </div>
            </div>

            {/* Target Department */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1 tracking-wider">
                Target Department / Course
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <FaBuilding className="text-sm" />
                </div>
                <select
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#141822] border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500 transition appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#141822] text-gray-400">Select your course...</option>
                  {OAU_FACULTIES_AND_DEPARTMENTS.map((fac) => (
                    <optgroup key={fac.faculty} label={`Faculty of ${fac.faculty}`} className="bg-[#0f1117] text-orange-400 font-bold">
                      {fac.departments.map((dept) => (
                        <option key={dept} value={dept} className="bg-[#141822] text-white font-normal">
                          {dept}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1 tracking-wider">
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
                  className="w-full pl-10 pr-4 py-2.5 bg-[#141822] border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1 tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <FaLock className="text-sm" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-11 py-2.5 bg-[#141822] border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] disabled:bg-orange-500/50 text-white font-extrabold py-3.5 rounded-xl transition shadow-lg shadow-orange-600/30 hover:-translate-y-0.5 text-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" /> Setting Up Your Portal...
                </>
              ) : (
                'Start Free CBT Practice'
              )}
            </button>
          </form>

          {/* Footer Notice */}
          <div className="mt-6 pt-5 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
            <span>
              Already registered?{' '}
              <Link href="/login" className="font-bold text-orange-400 hover:text-orange-300">
                Sign In here
              </Link>
            </span>
            <div className="flex items-center gap-1.5 text-gray-500">
              <FaShieldAlt className="text-[11px] text-orange-500" /> SSL Encrypted Portal
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* RIGHT COLUMN: HERO VISUAL & INSPIRATIONAL QUOTE */}
      {/* ------------------------------------------------------------- */}
      <div className="hidden lg:flex flex-1 relative bg-[#0b0e14] overflow-hidden justify-between flex-col p-12 text-white">
        {/* Background Image with Dark Gradient Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 scale-105 transition duration-700 opacity-20"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1600&auto=format&fit=crop')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10] via-[#0a0c10]/90 to-[#0a0c10]/70 z-10" />

        {/* Top Header Badge */}
        <div className="relative z-20 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-xs font-bold uppercase tracking-wider text-orange-400">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            2026/2027 Admissions Gateway
          </div>
          <span className="text-xs text-gray-400 font-mono font-semibold">
            Obafemi Awolowo University
          </span>
        </div>

        {/* Center Quote Box */}
        <div className="relative z-20 max-w-lg space-y-6 my-auto">
          <div className="w-12 h-12 rounded-2xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400 text-xl shadow-lg shadow-orange-600/20">
            <FaQuoteLeft />
          </div>

          <blockquote className="text-2xl xl:text-3xl font-black leading-snug tracking-tight text-white">
            "Your journey to Great Ife starts with every practice question you conquer today."
          </blockquote>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center font-black text-white text-sm shadow-md shadow-orange-600/30">
              OAU
            </div>
            <div>
              <div className="font-bold text-sm text-white">For Learning and Culture</div>
              <div className="text-xs text-orange-400 font-medium">Excellence in Tertiary Education</div>
            </div>
          </div>
        </div>

        {/* Bottom Feature Pill Counters */}
        <div className="relative z-20 grid grid-cols-3 gap-3 pt-6 border-t border-gray-800 text-xs">
          <div className="flex items-center gap-2">
            <FaCheckCircle className="text-orange-500 text-sm shrink-0" />
            <span className="text-gray-300 font-medium">Departmental Tailoring</span>
          </div>
          <div className="flex items-center gap-2">
            <FaCheckCircle className="text-orange-500 text-sm shrink-0" />
            <span className="text-gray-300 font-medium">Instant Scoring & Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <FaCheckCircle className="text-orange-500 text-sm shrink-0" />
            <span className="text-gray-300 font-medium">Weekly Mock Tests</span>
          </div>
        </div>
      </div>
    </div>
  );
}