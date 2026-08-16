'use client';

import Link from 'next/link';
import { 
  FaGraduationCap, 
  FaTrophy, 
  FaClock, 
  FaBookOpen, 
  FaCheckCircle, 
  FaCrown, 
  FaArrowRight, 
  FaWhatsapp 
} from 'react-icons/fa';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0c10] text-gray-100 flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      {/* Navigation */}
      <header className="border-b border-gray-800 sticky top-0 bg-[#0a0c10]/90 backdrop-blur-md z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-600/30">
              <FaGraduationCap className="text-xl" />
            </div>
            <span className="font-black text-xl tracking-tight text-white">
              TOPPERS<span className="text-orange-500">CBT</span> Prep
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="text-xs sm:text-sm font-semibold text-gray-300 hover:text-orange-400 px-3 py-2 transition"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="text-xs sm:text-sm font-bold bg-orange-600 hover:bg-orange-700 text-white px-4 sm:px-5 py-2.5 rounded-xl shadow-lg shadow-orange-600/25 transition hover:-translate-y-0.5"
            >
              Start Free Practice
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-4 pt-16 pb-20 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            2026/2027 Post-UTME Practice Portal
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Master the <span className="text-orange-500 underline decoration-orange-500/40">OAU Post-UTME</span> CBT with Precision.
          </h1>

          <p className="text-base sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Simulate real Great Ife aptitude tests, compete in weekly faculty mock challenges, track your speed, and secure your admission slot with TOPPERS CBT.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href="/signup" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm sm:text-base font-bold bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-xl shadow-lg shadow-orange-600/30 transition hover:-translate-y-0.5"
            >
              Take Free Practice Test <FaArrowRight />
            </Link>
            <a 
              href="https://chat.whatsapp.com/Fg3IVBojRafBlIcHF25gTH" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm sm:text-base font-bold bg-[#141822] hover:bg-[#191f2c] border border-gray-800 text-emerald-400 px-8 py-4 rounded-xl transition"
            >
              <FaWhatsapp className="text-lg text-emerald-400" /> Join Aspirants Group
            </a>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 max-w-4xl mx-auto border-t border-gray-800">
            <div className="p-4 rounded-2xl bg-[#141822] border border-gray-800">
              <div className="text-2xl sm:text-3xl font-black text-white">10,000+</div>
              <div className="text-xs text-gray-400 font-medium mt-1">Verified Past Questions</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#141822] border border-gray-800">
              <div className="text-2xl sm:text-3xl font-black text-orange-500">40 Mins</div>
              <div className="text-xs text-gray-400 font-medium mt-1">Realistic Speed Sim</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#141822] border border-gray-800">
              <div className="text-2xl sm:text-3xl font-black text-white">13 Faculties</div>
              <div className="text-xs text-gray-400 font-medium mt-1">Departmental Tailoring</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#141822] border border-gray-800">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">Live</div>
              <div className="text-xs text-gray-400 font-medium mt-1">Weekly Leaderboard</div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="bg-[#0e1118] py-20 border-y border-gray-800">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
              <h2 className="text-3xl font-black text-white">Built to Match OAU's Exact Test Format</h2>
              <p className="text-gray-400 text-sm">Everything you need to beat negative marking, strict timing, and departmental cutoffs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#141822] p-8 rounded-3xl border border-gray-800 shadow-xl space-y-4 hover:border-gray-700 transition">
                <div className="w-12 h-12 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-2xl flex items-center justify-center text-xl">
                  <FaBookOpen />
                </div>
                <h3 className="text-xl font-bold text-white">Single Subject Drill</h3>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                  Focus on your weak spots. Pick Mathematics, English, Biology, Chemistry, Physics, or Current Affairs and practice with instant explanations.
                </p>
              </div>

              <div className="bg-[#141822] p-8 rounded-3xl border border-gray-800 shadow-xl space-y-4 hover:border-gray-700 transition">
                <div className="w-12 h-12 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-2xl flex items-center justify-center text-xl">
                  <FaClock />
                </div>
                <h3 className="text-xl font-bold text-white">Full Mock Simulation</h3>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                  Take the full multi-subject 40-question combination strictly timed to mirror the actual Great Ife CBT exam center screen.
                </p>
              </div>

              <div className="bg-[#141822] p-8 rounded-3xl border border-gray-800 shadow-xl space-y-4 hover:border-gray-700 transition">
                <div className="w-12 h-12 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-2xl flex items-center justify-center text-xl">
                  <FaTrophy />
                </div>
                <h3 className="text-xl font-bold text-white">Weekly Leaderboard</h3>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                  Compete against thousands of candidates vying for your specific department. Rank high to gauge your admission readiness.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing / Access Tier */}
        <section className="max-w-5xl mx-auto px-4 py-20">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <h2 className="text-3xl font-black text-white">Simple Access Options</h2>
            <p className="text-gray-400 text-sm">Start free, upgrade via one-time access voucher when you're ready.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="bg-[#141822] p-8 rounded-3xl border border-gray-800 shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Free Trial</div>
                <div className="text-4xl font-black text-white">₦0</div>
                <p className="text-xs text-gray-400 leading-relaxed">Great for quick testing and getting familiar with the CBT test interface.</p>
                <ul className="space-y-3 pt-4 text-xs sm:text-sm text-gray-300">
                  <li className="flex items-center gap-2"><FaCheckCircle className="text-emerald-400 shrink-0" /> 10 Free questions per subject</li>
                  <li className="flex items-center gap-2"><FaCheckCircle className="text-emerald-400 shrink-0" /> Basic performance summary</li>
                  <li className="flex items-center gap-2"><FaCheckCircle className="text-emerald-400 shrink-0" /> Standard speed timer</li>
                </ul>
              </div>
              <Link 
                href="/signup" 
                className="mt-8 block text-center text-xs sm:text-sm font-bold bg-[#0f1117] hover:bg-gray-800 border border-gray-800 text-gray-200 py-3.5 rounded-xl transition"
              >
                Create Free Account
              </Link>
            </div>

            {/* Premium Tier */}
            <div className="bg-gradient-to-b from-[#191d29] to-[#141822] p-8 rounded-3xl border-2 border-orange-500 shadow-2xl flex flex-col justify-between relative">
              <div className="absolute -top-3.5 right-6 bg-orange-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-orange-600/30">
                <FaCrown /> Recommended
              </div>
              <div className="space-y-4">
                <div className="text-xs font-bold text-orange-500 uppercase tracking-wider">Full CBT Access</div>
                <div className="text-4xl font-black text-white">One-Time Voucher</div>
                <p className="text-xs text-gray-400 leading-relaxed">Complete unrestricted access until your 2026 Post-UTME exam day.</p>
                <ul className="space-y-3 pt-4 text-xs sm:text-sm text-gray-200">
                  <li className="flex items-center gap-2"><FaCheckCircle className="text-orange-500 shrink-0" /> Unlimited past questions (2006 – 2025)</li>
                  <li className="flex items-center gap-2"><FaCheckCircle className="text-orange-500 shrink-0" /> Detailed step-by-step explanations</li>
                  <li className="flex items-center gap-2"><FaCheckCircle className="text-orange-500 shrink-0" /> Access to Weekly Nationwide Mock</li>
                  <li className="flex items-center gap-2"><FaCheckCircle className="text-orange-500 shrink-0" /> Departmental percentile ranking</li>
                </ul>
              </div>
              <Link 
                href="/signup" 
                className="mt-8 block text-center text-xs sm:text-sm font-bold bg-orange-600 hover:bg-orange-700 text-white py-3.5 rounded-xl shadow-lg shadow-orange-600/30 transition hover:-translate-y-0.5"
              >
                Get Premium Pass
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0b0e14] text-gray-400 py-8 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs gap-4">
          <p>© 2026 TOPPERS CBT Prep. Built for Great Ife Aspirants.</p>
          <div className="flex gap-6">
            <a 
              href="https://chat.whatsapp.com/Fg3IVBojRafBlIcHF25gTH" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-emerald-400 transition"
            >
              WhatsApp Community
            </a>
            <Link href="/login" className="hover:text-white transition">Sign In</Link>
            <Link href="/signup" className="hover:text-white transition">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}