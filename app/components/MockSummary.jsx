'use client';

import Link from 'next/link';
import Navbar from './Navbar';
import { FaTrophy, FaEye, FaRedo } from 'react-icons/fa';

export default function MockSummary({ profile, results, activeSubjects = [], onLaunchReview }) {
  return (
    <>
    <Navbar/>
    <div className="w-full max-w-4xl mx-auto py-4 sm:py-8 px-2 sm:px-4 space-y-6">
      <div className="bg-[#161922] border border-gray-800 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center text-3xl border border-orange-500/20">
            <FaTrophy />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Mock Challenge Completed!</h2>
          <p className="text-xs text-gray-400">Official scoring breakdown across all 4 subjects for {profile?.full_name}</p>
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-3 gap-3 bg-[#0f1117] p-5 rounded-2xl border border-gray-800 text-center">
          <div>
            <div className="text-[11px] font-bold text-gray-500 uppercase">Total Score</div>
            <div className="text-2xl sm:text-4xl font-black text-white mt-1">
              {results.score} <span className="text-xs sm:text-sm text-gray-500 font-normal">/ {results.total}</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-gray-500 uppercase">Percentage</div>
            <div className="text-2xl sm:text-4xl font-black text-orange-500 mt-1">
              {results.percentage}%
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-gray-500 uppercase">Time Spent</div>
            <div className="text-2xl sm:text-4xl font-black text-emerald-400 mt-1 font-mono">
              {Math.floor(results.timeSpent / 60)}m
            </div>
          </div>
        </div>

        {/* 4-Subject Performance Matrix */}
        <div className="space-y-3">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-400">
            4-Subject Performance Matrix:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {activeSubjects.map((sub) => {
              const data = results.breakdown[sub.name] || { correct: 0, total: 0 };
              const subPct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;

              return (
                <div key={sub.id || sub.name} className="bg-[#0f1117] p-4 rounded-2xl border border-gray-800 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">{sub.code || 'SUB'}</div>
                    <div className="font-bold text-white text-xs sm:text-sm truncate mt-0.5">{sub.name}</div>
                  </div>
                  <div className="flex items-baseline justify-between mt-3 pt-2 border-t border-gray-800/80">
                    <span className="text-[11px] text-gray-500">{data.correct} / {data.total}</span>
                    <span className="text-base font-black text-orange-400">{subPct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onLaunchReview}
            className="flex-1 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 text-xs sm:text-sm"
          >
            <FaEye /> View Corrections & Solutions
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 py-3.5 bg-[#0f1117] hover:bg-gray-800 border border-gray-800 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 text-xs sm:text-sm"
          >
            <FaRedo /> Retake Mock
          </button>
          <Link
            href="/practice/single"
            className="flex-1 py-3.5 bg-[#0f1117] hover:bg-gray-800 border border-gray-800 text-white font-bold rounded-xl transition text-center flex items-center justify-center gap-2 text-xs sm:text-sm"
          >
            <FaTrophy className="text-yellow-500" /> Dashboard
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}