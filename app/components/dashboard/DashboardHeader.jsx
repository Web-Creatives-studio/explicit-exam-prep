'use client';

import { FaCrown } from 'react-icons/fa';

export default function DashboardHeader({ profile, onOpenRedeem }) {
  return (
    <div className="bg-gradient-to-r from-[#161922] via-[#12141c] to-[#0f1117] text-white rounded-3xl p-6 sm:p-8 border border-gray-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/20 text-orange-400 text-xs font-bold uppercase tracking-wider border border-orange-500/30">
          🎯 Target: {profile?.department || 'OAU Post-UTME Aspirant'}
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          Welcome back, {profile?.full_name || 'Candidate'}
        </h1>
        <p className="text-sm text-gray-400 max-w-xl leading-relaxed">
          Sharpen your speed and accuracy. Select a subject below for a single practice drill or configure your full 4-subject mock challenge.
        </p>
      </div>

      <div className="bg-[#1a1e29] p-5 rounded-2xl border border-gray-700/70 flex flex-col items-start md:items-end justify-center gap-2 min-w-[240px]">
        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Access Status</div>
        {profile?.is_premium ? (
          <div className="flex items-center gap-2 text-yellow-400 font-extrabold text-base">
            <FaCrown /> PRO Unlimited Pass
          </div>
        ) : (
          <div className="space-y-2.5 w-full">
            <div className="text-xs font-semibold text-gray-300">Free Practice Mode (Trial Tier)</div>
            <button
              type="button"
              onClick={onOpenRedeem}
              className="w-full text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-orange-600/25 cursor-pointer"
            >
              <FaCrown /> Unlock Pro Access
            </button>
          </div>
        )}
      </div>
    </div>
  );
}