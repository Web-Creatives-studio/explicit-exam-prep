'use client';

import Link from 'next/link';
import { FaBookOpen, FaEye, FaRedo } from 'react-icons/fa';

export default function QuickSessionSummary({
  subject,
  questions = [],
  results,
  onLaunchReview,
}) {
  return (
    <div className="w-full max-w-xl mx-auto py-6 space-y-6 select-none">
      <div className="bg-[#141822] border border-gray-800 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center text-3xl border border-orange-500/20">
            <FaBookOpen />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Practice Drill Completed!</h2>
          <p className="text-xs text-gray-400">
            {subject?.name} • {questions.length} Questions
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 bg-[#0b0e14] p-5 rounded-2xl border border-gray-800 text-center">
          <div>
            <div className="text-[11px] font-bold text-gray-500 uppercase">Score</div>
            <div className="text-2xl sm:text-4xl font-black text-white mt-1">
              {results.score} <span className="text-xs text-gray-500 font-normal">/ {results.total}</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-gray-500 uppercase">Accuracy</div>
            <div className="text-2xl sm:text-4xl font-black text-orange-500 mt-1">
              {results.percentage}%
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-gray-500 uppercase">Time</div>
            <div className="text-2xl sm:text-4xl font-black text-emerald-400 mt-1 font-mono">
              {Math.floor(results.timeSpent / 60)}m {results.timeSpent % 60}s
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onLaunchReview}
            className="flex-1 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 text-xs sm:text-sm cursor-pointer"
          >
            <FaEye /> View Corrections
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 py-3.5 bg-[#0b0e14] hover:bg-gray-800 border border-gray-800 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
          >
            <FaRedo /> Retake Drill
          </button>
          <Link
            href="/practice/single"
            className="flex-1 py-3.5 bg-[#0b0e14] hover:bg-gray-800 border border-gray-800 text-white font-bold rounded-xl transition text-center flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}