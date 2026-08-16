'use client';

import { FaCrown, FaCheckCircle, FaBullseye } from 'react-icons/fa';

export default function DashboardHeader({ profile, onOpenRedeem }) {
  return (
    <div className="bg-gradient-to-r from-[#141822] via-[#10131a] to-[#0b0e14] text-white rounded-3xl p-6 sm:p-8 border border-gray-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 select-none">
      {/* Candidate Metadata & Welcome */}
      <div className="space-y-2.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold uppercase tracking-wider border border-orange-500/20">
          <FaBullseye className="text-orange-500 text-xs" />
          <span>Target: {profile?.department || 'OAU Post-UTME Aspirant'}</span>
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Welcome back, <span className="text-orange-500">{profile?.full_name || 'Candidate'}</span>
        </h1>
        
        <p className="text-xs sm:text-sm text-gray-400 max-w-xl leading-relaxed">
          Sharpen your speed and accuracy. Select a subject below for a single practice drill or configure your full 4-subject mock challenge.
        </p>
      </div>

      {/* Access Status Card */}
      <div className="bg-[#141822] p-5 rounded-2xl border border-gray-800 flex flex-col items-start md:items-end justify-center gap-2 min-w-[250px] shadow-lg">
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          Access Status
        </div>

        {profile?.is_premium ? (
          <div className="space-y-1 md:text-right w-full">
            <div className="inline-flex items-center gap-2 text-yellow-400 font-black text-sm bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-lg">
              <FaCrown className="text-yellow-400 text-xs" /> PRO Unlimited Pass
            </div>
            <p className="text-[11px] text-emerald-400 font-semibold flex items-center md:justify-end gap-1 pt-1">
              <FaCheckCircle className="text-[10px]" /> All 10,000+ Questions Unlocked
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 w-full">
            <div className="text-xs font-semibold text-gray-300 flex items-center justify-between">
              <span>Free Trial Tier</span>
              <span className="text-[10px] bg-[#0f1117] text-gray-400 border border-gray-800 px-2 py-0.5 rounded font-mono font-bold">
                5 Qs/Sub
              </span>
            </div>
            
            <button
              type="button"
              onClick={onOpenRedeem}
              className="w-full text-xs font-extrabold bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 cursor-pointer"
            >
              <FaCrown className="text-xs" /> Unlock Pro Access
            </button>
          </div>
        )}
      </div>
    </div>
  );
}