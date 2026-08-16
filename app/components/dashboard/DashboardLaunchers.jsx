'use client';

import Link from 'next/link';
import { FaBolt, FaTrophy, FaArrowRight } from 'react-icons/fa';

export default function DashboardLaunchers({ onOpenMockModal }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Mock Exam Trigger */}
      <div
        onClick={onOpenMockModal}
        className="group cursor-pointer bg-gradient-to-br from-[#161922] to-[#12141c] hover:border-orange-500 border border-gray-800 p-6 rounded-3xl transition duration-200 shadow-md flex items-center justify-between"
      >
        <div className="space-y-1.5 pr-4">
          <div className="flex items-center gap-2 text-orange-500 font-black text-lg">
            <FaBolt className="text-orange-500" /> 40-Question Timed Mock Challenge
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Auto-picks <strong className="text-white">Aptitude</strong> + choose <strong className="text-white">any 3 other subjects</strong> (40 mins, official CBT exam simulation).
          </p>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-orange-600 text-white flex items-center justify-center group-hover:scale-105 group-hover:bg-orange-500 transition shadow-lg shadow-orange-600/30 shrink-0">
          <FaArrowRight />
        </div>
      </div>

      {/* Nationwide Leaderboard Trigger */}
      <Link
        href="/practice/leaderboard"
        className="group bg-gradient-to-br from-[#161922] to-[#12141c] hover:border-gray-700 border border-gray-800 p-6 rounded-3xl transition duration-200 shadow-md flex items-center justify-between"
      >
        <div className="space-y-1.5 pr-4">
          <div className="flex items-center gap-2 text-white font-black text-lg">
            <FaTrophy className="text-yellow-500" /> Weekly Nationwide Leaderboard
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Compare your performance and speed with other Great Ife aspirants across Nigeria.
          </p>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-gray-800 text-gray-200 flex items-center justify-center group-hover:scale-105 group-hover:bg-gray-700 transition shrink-0">
          <FaArrowRight />
        </div>
      </Link>
    </div>
  );
}