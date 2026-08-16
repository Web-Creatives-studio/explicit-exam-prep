import Link from 'next/link';
import { 
  FaGraduationCap, 
  FaTrophy, 
  FaClock, 
  FaBookOpen, 
  FaCheckCircle, 
  FaCrown, 
  FaArrowRight, 
  FaUsers 
} from 'react-icons/fa';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between">
      {/* Navigation */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <FaGraduationCap className="text-xl" />
            </div>
            <span className="font-black text-xl tracking-tight text-gray-900">
              OAU<span className="text-orange-600">CBT</span> Prep
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="text-sm font-semibold text-gray-700 hover:text-orange-600 px-3 py-2 transition"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="text-sm font-bold bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl shadow-md shadow-orange-600/20 transition hover:-translate-y-0.5"
            >
              Start Free Practice
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-4 pt-16 pb-20 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-orange-600 animate-ping" />
            2026/2027 Post-UTME Practice Portal
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-gray-950 max-w-4xl mx-auto leading-tight">
            Master the <span className="text-orange-600 underline decoration-orange-300">OAU Post-UTME</span> CBT with Precision.
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Simulate real Great Ife aptitude tests, compete in weekly faculty mock challenges, track your speed, and secure your admission slot.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href="/signup" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-bold bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-xl shadow-lg shadow-orange-600/25 transition hover:-translate-y-0.5"
            >
              Take Free Practice Test <FaArrowRight />
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 px-8 py-4 rounded-xl transition"
            >
              Redeem Access Code
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 max-w-4xl mx-auto border-t border-gray-100">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="text-2xl sm:text-3xl font-black text-gray-900">10,000+</div>
              <div className="text-xs text-gray-500 font-medium mt-1">Verified Past Questions</div>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="text-2xl sm:text-3xl font-black text-orange-600">40 Mins</div>
              <div className="text-xs text-gray-500 font-medium mt-1">Realistic Speed Sim</div>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="text-2xl sm:text-3xl font-black text-gray-900">13 Faculties</div>
              <div className="text-xs text-gray-500 font-medium mt-1">Departmental Tailoring</div>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="text-2xl sm:text-3xl font-black text-green-600">Live</div>
              <div className="text-xs text-gray-500 font-medium mt-1">Weekly Leaderboard</div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="bg-gray-50 py-20 border-y border-gray-100">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-extrabold text-gray-900">Built to Match OAU's Exact Test Format</h2>
              <p className="text-gray-600 mt-2">Everything you need to beat negative marking and strict timing.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center text-xl">
                  <FaBookOpen />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Single Subject Drill</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Focus on your weak spots. Pick Mathematics, English, Biology, Chemistry, Physics, or Current Affairs and practice with instant explanations.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-xl">
                  <FaClock />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Full Mock Simulation</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Take the full multi-subject 40-question combination strictly timed to mirror the actual Great Ife CBT exam center screen.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center text-xl">
                  <FaTrophy />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Weekly Leaderboard</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Compete against thousands of candidates vying for your specific department. Rank high to gauge your admission readiness.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing / Access Tier */}
        <section className="max-w-5xl mx-auto px-4 py-20">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900">Simple Access Options</h2>
            <p className="text-gray-600 mt-2">Start free, upgrade via one-time access voucher when you're ready.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-sm font-bold text-gray-500 uppercase">Free Trial</div>
                <div className="text-4xl font-black text-gray-900">₦0</div>
                <p className="text-sm text-gray-600">Great for quick testing and getting familiar with the interface.</p>
                <ul className="space-y-3 pt-4 text-sm text-gray-700">
                  <li className="flex items-center gap-2"><FaCheckCircle className="text-green-500" /> 10 Free questions per subject</li>
                  <li className="flex items-center gap-2"><FaCheckCircle className="text-green-500" /> Basic performance summary</li>
                  <li className="flex items-center gap-2"><FaCheckCircle className="text-green-500" /> Standard speed timer</li>
                </ul>
              </div>
              <Link 
                href="/signup" 
                className="mt-8 block text-center font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl transition"
              >
                Create Free Account
              </Link>
            </div>

            {/* Premium Tier */}
            <div className="bg-gradient-to-b from-orange-50 to-white p-8 rounded-2xl border-2 border-orange-500 shadow-lg flex flex-col justify-between relative">
              <div className="absolute -top-3.5 right-6 bg-orange-600 text-white text-xs font-black uppercase px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <FaCrown /> Recommended
              </div>
              <div className="space-y-4">
                <div className="text-sm font-bold text-orange-600 uppercase">Full CBT Access</div>
                <div className="text-4xl font-black text-gray-900">One-Time Voucher</div>
                <p className="text-sm text-gray-600">Complete access until your 2026 Post-UTME exam day.</p>
                <ul className="space-y-3 pt-4 text-sm text-gray-700">
                  <li className="flex items-center gap-2"><FaCheckCircle className="text-orange-600" /> Unlimited past questions (2006 – 2025)</li>
                  <li className="flex items-center gap-2"><FaCheckCircle className="text-orange-600" /> Detailed step-by-step explanations</li>
                  <li className="flex items-center gap-2"><FaCheckCircle className="text-orange-600" /> Access to Weekly Nationwide Mock</li>
                  <li className="flex items-center gap-2"><FaCheckCircle className="text-orange-600" /> Departmental percentile ranking</li>
                </ul>
              </div>
              <Link 
                href="/signup" 
                className="mt-8 block text-center font-bold bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl shadow-md shadow-orange-600/30 transition"
              >
                Get Premium Pass
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs gap-4">
          <p>© 2026 OAU CBT Prep Portal. Built for Great Ife Aspirants.</p>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-white transition">Sign In</Link>
            <Link href="/signup" className="hover:text-white transition">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}