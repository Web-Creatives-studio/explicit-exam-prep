'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '../utils/supabase/client';
import { OAU_FACULTIES_AND_DEPARTMENTS } from '../utils/department';
import { toast } from 'react-toastify';
import { 
  FaGraduationCap, 
  FaEnvelope, 
  FaLock, 
  FaUser, 
  FaSpinner, 
  FaEye, 
  FaEyeSlash, 
  FaCheckCircle, 
  FaQuoteLeft,
  FaShieldAlt,
  FaArrowRight,
  FaArrowLeft,
  FaSearch,
  FaCheck
} from 'react-icons/fa';

export default function SignUpPage() {
  const supabase = createClient();

  // Onboarding Step State (1: Credentials, 2: Profile & Course)
  const [step, setStep] = useState(1);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');

  // Course Autocomplete Search & UI States
  const [courseQuery, setCourseQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Flatten all departments with their respective faculty for fast letter-by-letter matching
  const allDepartmentsList = useMemo(() => {
    const list = [];
    if (Array.isArray(OAU_FACULTIES_AND_DEPARTMENTS)) {
      OAU_FACULTIES_AND_DEPARTMENTS.forEach((fac) => {
        fac.departments.forEach((dept) => {
          list.push({
            name: dept,
            faculty: fac.faculty,
          });
        });
      });
    }
    return list;
  }, []);

  // Filter suggestions dynamically for each character typed
  const filteredDepartments = useMemo(() => {
    if (!courseQuery.trim()) return allDepartmentsList;
    const cleanQuery = courseQuery.toLowerCase();
    return allDepartmentsList.filter(
      (item) =>
        item.name.toLowerCase().includes(cleanQuery) ||
        item.faculty.toLowerCase().includes(cleanQuery)
    );
  }, [courseQuery, allDepartmentsList]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Step 1 Validation & Proceed
  const handleProceedToStep2 = (e) => {
    e.preventDefault();

    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setStep(2);
  };

  // Select Course from Dropdown
  const handleSelectDepartment = (deptName) => {
    setDepartment(deptName);
    setCourseQuery(deptName);
    setIsDropdownOpen(false);
  };

  // Final Submission on Step 2
  const handleFinalSignUp = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error('Please enter your full name.');
      return;
    }

    if (!department) {
      toast.error('Please select your target course from the suggestions.');
      return;
    }

    setLoading(true);

    try {
      // 1. Generate unique session token for this device
      const deviceSessionToken = crypto.randomUUID();

      // Store in document cookie for single-device session validation
      document.cookie = `device_session_token=${deviceSessionToken}; path=/; max-age=2592000; SameSite=Lax; secure`;

      // 2. Sign up user in Supabase Auth with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            department: department,
            role: 'student',
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/practice/single`,
        },
      });

      if (authError) throw authError;

      const user = authData?.user;

      if (user) {
        // 3. Upsert profile with active session token & initial tier
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: user.id,
          full_name: fullName.trim(),
          department: department,
          role: 'student',
          is_premium: false,
          current_session_token: deviceSessionToken,
          last_active_at: new Date().toISOString(),
        });

        if (profileError) {
          console.warn('Profile upsert notice:', profileError);
        }

        // Register session token via RPC if available
        try {
          await supabase.rpc('register_user_session', {
            p_user_id: user.id,
            p_session_token: deviceSessionToken,
          });
        } catch {
          // Handled by upsert fallback above
        }

        toast.success('Registration successful! Welcome to TOPPERS CBT.');
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
      {/* LEFT COLUMN: ONBOARDING STEP FORM */}
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

            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-black text-white tracking-tight">
                {step === 1 ? 'Create Account' : 'Candidate Profile'}
              </h1>
              <span className="text-xs font-black uppercase text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
                Step {step} of 2
              </span>
            </div>
            
            <p className="mt-1.5 text-xs sm:text-sm text-gray-400">
              {step === 1 
                ? 'Step 1: Enter your login credentials to secure your student portal.' 
                : 'Step 2: Provide your details and choose your dream course at OAU.'}
            </p>

            {/* Step Progress Bar */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className={`h-1.5 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-orange-500' : 'bg-gray-800'}`} />
              <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 2 ? 'bg-orange-500' : 'bg-gray-800'}`} />
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* STEP 1: EMAIL & PASSWORD */}
          {/* ------------------------------------------------------------- */}
          {step === 1 && (
            <form onSubmit={handleProceedToStep2} className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              {/* Email */}
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
                    className="w-full pl-10 pr-4 py-3 bg-[#141822] border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition"
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

              {/* Next Step Button */}
              <button
                type="submit"
                className="w-full mt-3 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white font-extrabold py-3.5 rounded-xl transition shadow-lg shadow-orange-600/30 text-sm cursor-pointer"
              >
                Continue to Step 2 <FaArrowRight className="text-xs" />
              </button>
            </form>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STEP 2: NAME & COURSE WITH REAL-TIME DROPDOWN SUGGESTIONS */}
          {/* ------------------------------------------------------------- */}
          {step === 2 && (
            <form onSubmit={handleFinalSignUp} className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
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
                    autoFocus
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Adebayo Ogunlesi"
                    className="w-full pl-10 pr-4 py-3 bg-[#141822] border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>

              {/* Course with Letter-by-Letter Dropdown Suggestions */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1 tracking-wider">
                  Target Course / Department
                </label>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <FaSearch className="text-sm" />
                  </div>
                  <input
                    type="text"
                    required
                    value={courseQuery}
                    onFocus={() => setIsDropdownOpen(true)}
                    onChange={(e) => {
                      setCourseQuery(e.target.value);
                      setDepartment('');
                      setIsDropdownOpen(true);
                    }}
                    placeholder="Type any course (e.g. Nursing, Law, Computer)..."
                    className="w-full pl-10 pr-10 py-3 bg-[#141822] border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition"
                  />
                  {department && (
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-emerald-400">
                      <FaCheck className="text-xs" />
                    </div>
                  )}
                </div>

                {/* Suggestions Dropdown List */}
                {isDropdownOpen && (
                  <div className="absolute z-50 left-0 right-0 mt-1 bg-[#161a24] border border-gray-700/80 rounded-2xl shadow-2xl max-h-56 overflow-y-auto divide-y divide-gray-800">
                    {filteredDepartments.length > 0 ? (
                      filteredDepartments.map((dept) => {
                        const isSelected = department === dept.name;
                        return (
                          <button
                            key={dept.name}
                            type="button"
                            onClick={() => handleSelectDepartment(dept.name)}
                            className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-orange-500/10 transition cursor-pointer ${
                              isSelected ? 'bg-orange-600/15 text-orange-400 font-bold' : 'text-gray-300'
                            }`}
                          >
                            <div>
                              <div className="text-sm font-semibold text-white">{dept.name}</div>
                              <div className="text-[11px] text-gray-400 font-medium">Faculty of {dept.faculty}</div>
                            </div>
                            {isSelected && <FaCheckCircle className="text-orange-500 text-sm" />}
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-4 py-4 text-center text-xs text-gray-400">
                        No matching course found for "{courseQuery}".
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step 2 Action Buttons (Back & Complete Registration) */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="px-4 py-3.5 bg-[#141822] hover:bg-gray-800 border border-gray-800 text-gray-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <FaArrowLeft /> Back
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] disabled:bg-orange-500/50 text-white font-extrabold py-3.5 rounded-xl transition shadow-lg shadow-orange-600/30 text-sm cursor-pointer"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" /> Finalizing Portal...
                    </>
                  ) : (
                    'Complete & Launch Portal'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Footer Notice */}
          <div className="mt-6 pt-5 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
            <span>
              Already registered?{' '}
              <Link href="/login" className="font-bold text-orange-400 hover:text-orange-300">
                Sign In here
              </Link>
            </span>
            <div className="flex items-center gap-1.5 text-gray-500">
              <FaShieldAlt className="text-[11px] text-orange-500" /> Single-Device Protected
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* RIGHT COLUMN: HERO VISUAL & INSPIRATIONAL QUOTE */}
      {/* ------------------------------------------------------------- */}
      <div className="hidden lg:flex flex-1 relative bg-[#0b0e14] overflow-hidden justify-between flex-col p-12 text-white">
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
            <span className="text-gray-300 font-medium">Departmental Matching</span>
          </div>
          <div className="flex items-center gap-2">
            <FaCheckCircle className="text-orange-500 text-sm shrink-0" />
            <span className="text-gray-300 font-medium">Live Instant Scoring</span>
          </div>
          <div className="flex items-center gap-2">
            <FaCheckCircle className="text-orange-500 text-sm shrink-0" />
            <span className="text-gray-300 font-medium">Friday Live Mock</span>
          </div>
        </div>
      </div>
    </div>
  );
}