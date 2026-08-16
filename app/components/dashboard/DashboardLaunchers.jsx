'use client';

import Link from 'next/link';
import { FaBolt, FaTrophy, FaWhatsapp, FaArrowRight } from 'react-icons/fa';

export default function DashboardLaunchers({ onOpenMockModal }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-5 select-none">
      
      {/* 1. Mock Exam Trigger */}
      <div
        onClick={onOpenMockModal}
        className="group cursor-pointer bg-gradient-to-br from-[#161922] to-[#12141c] hover:border-orange-500/80 active:scale-[0.98] border border-gray-800 p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl transition-all duration-200 shadow-md flex items-center justify-between gap-3"
      >
        <div className="space-y-1 sm:space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 text-orange-500 font-black text-sm sm:text-base lg:text-lg tracking-tight">
            <FaBolt className="text-orange-500 shrink-0 text-sm sm:text-base" />
            <span className="truncate">40-Question Mock</span>
          </div>
          <p className="text-[11px] sm:text-xs text-gray-400 leading-relaxed line-clamp-2 sm:line-clamp-none">
            Auto-picks <strong className="text-white font-semibold">Aptitude</strong> + choose <strong className="text-white font-semibold">3 subjects</strong> (40 mins CBT simulation).
          </p>
        </div>

        <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-xl sm:rounded-2xl bg-orange-600 text-white flex items-center justify-center group-hover:scale-105 group-hover:bg-orange-500 transition-all shadow-lg shadow-orange-600/30 shrink-0 text-xs sm:text-sm">
          <FaArrowRight />
        </div>
      </div>

      {/* 2. Nationwide Leaderboard Trigger */}
      <Link
        href="/practice/leaderboard"
        className="group bg-gradient-to-br from-[#161922] to-[#12141c] hover:border-yellow-500/50 active:scale-[0.98] border border-gray-800 p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl transition-all duration-200 shadow-md flex items-center justify-between gap-3"
      >
        <div className="space-y-1 sm:space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 text-white font-black text-sm sm:text-base lg:text-lg tracking-tight">
            <FaTrophy className="text-yellow-500 shrink-0 text-sm sm:text-base" />
            <span className="truncate">Live Leaderboard</span>
          </div>
          <p className="text-[11px] sm:text-xs text-gray-400 leading-relaxed line-clamp-2 sm:line-clamp-none">
            Compare your score and speed against aspirants across Nigeria.
          </p>
        </div>

        <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-xl sm:rounded-2xl bg-gray-800 text-gray-200 flex items-center justify-center group-hover:scale-105 group-hover:bg-gray-700 group-hover:text-white transition-all shrink-0 text-xs sm:text-sm">
          <FaArrowRight />
        </div>
      </Link>

      {/* 3. Aspirants WhatsApp Community Group (Spans full width on tablet) */}
      <a
        href="https://chat.whatsapp.com/Fg3IVBojRafBlIcHF25gTH"
        target="_blank"
        rel="noopener noreferrer"
        className="sm:col-span-2 lg:col-span-1 group bg-gradient-to-br from-[#161922] to-[#12141c] hover:border-emerald-500/60 active:scale-[0.98] border border-gray-800 p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl transition-all duration-200 shadow-md flex items-center justify-between gap-3"
      >
        <div className="space-y-1 sm:space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 text-emerald-400 font-black text-sm sm:text-base lg:text-lg tracking-tight">
            <FaWhatsapp className="text-emerald-500 shrink-0 text-base sm:text-lg" />
            <span className="truncate">Join Aspirants Group</span>
          </div>
          <p className="text-[11px] sm:text-xs text-gray-400 leading-relaxed line-clamp-2 sm:line-clamp-none">
            Connect with aspirants, get syllabus updates, study resources & cutoff info.
          </p>
        </div>

        <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-xl sm:rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-lg shadow-emerald-600/20 shrink-0 text-xs sm:text-sm">
          <FaArrowRight />
        </div>
      </a>

    </div>
  );
}