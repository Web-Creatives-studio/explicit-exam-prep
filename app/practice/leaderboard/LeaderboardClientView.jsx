'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  FaTrophy, 
  FaMedal, 
  FaBolt, 
  FaClock, 
  FaSearch, 
  FaBuilding,
  FaArrowRight 
} from 'react-icons/fa';

export default function LeaderboardClientView({ profile, scores = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');

  // Extract unique departments in leaderboard
  const departments = ['ALL', ...new Set(scores.map((s) => s.profiles?.department).filter(Boolean))];

  // Filter rankings
  const filteredScores = scores.filter((entry) => {
    const nameMatch = entry.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const deptMatch = filterDept === 'ALL' || entry.profiles?.department === filterDept;
    return nameMatch && deptMatch;
  });

  const topThree = scores.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-[#141822] border border-gray-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-bold uppercase tracking-wider border border-yellow-500/20">
            <FaTrophy /> Weekly Post-UTME Rankings
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Nationwide Aspirants Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-lg leading-relaxed">
            Live rankings calculated across all 4-subject mock challenges taken in the last 7 days. Higher scores and faster completion times rank higher.
          </p>
        </div>

        <Link
          href="/practice/mock"
          className="py-3.5 px-6 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-orange-600/30 transition flex items-center justify-center gap-2 self-start md:self-auto shrink-0 cursor-pointer"
        >
          <FaBolt /> Take 40-Min Mock Exam
        </Link>
      </div>

      {/* Top 3 Podium Cards */}
      {topThree.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 2nd Place */}
          <div className="bg-[#141822] border border-slate-700/60 p-5 rounded-3xl flex flex-col items-center text-center space-y-3 relative order-2 md:order-1">
            <span className="w-10 h-10 rounded-2xl bg-slate-500/20 text-slate-300 flex items-center justify-center font-black text-base border border-slate-500/30 shadow-md">
              🥈 2
            </span>
            <div>
              <h3 className="font-extrabold text-white text-sm truncate max-w-[200px]">
                {topThree[1].profiles?.full_name || 'Candidate'}
              </h3>
              <p className="text-[11px] text-gray-400 truncate max-w-[200px] mt-0.5">
                {topThree[1].profiles?.department || 'OAU Aspirant'}
              </p>
            </div>
            <div className="bg-[#0b0e14] py-1.5 px-4 rounded-xl border border-gray-800 text-xs font-mono font-bold text-orange-400">
              {topThree[1].score}/{topThree[1].total_questions} • {Math.floor(topThree[1].time_spent_seconds / 60)}m {topThree[1].time_spent_seconds % 60}s
            </div>
          </div>

          {/* 1st Place (Gold) */}
          <div className="bg-gradient-to-b from-[#1c2230] to-[#141822] border border-yellow-500/40 p-6 rounded-3xl flex flex-col items-center text-center space-y-3 relative shadow-2xl order-1 md:order-2 md:-translate-y-2">
            <span className="w-12 h-12 rounded-2xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-black text-xl border border-yellow-500/40 shadow-lg shadow-yellow-500/10">
              👑 1
            </span>
            <div>
              <h3 className="font-black text-white text-base truncate max-w-[220px]">
                {topThree[0].profiles?.full_name || 'Candidate'}
              </h3>
              <p className="text-xs text-yellow-400/90 font-medium truncate max-w-[220px] mt-0.5">
                {topThree[0].profiles?.department || 'OAU Aspirant'}
              </p>
            </div>
            <div className="bg-[#0b0e14] py-2 px-5 rounded-xl border border-yellow-500/30 text-xs font-mono font-black text-yellow-400">
              {topThree[0].score}/{topThree[0].total_questions} • {Math.floor(topThree[0].time_spent_seconds / 60)}m {topThree[0].time_spent_seconds % 60}s
            </div>
          </div>

          {/* 3rd Place */}
          <div className="bg-[#141822] border border-amber-900/60 p-5 rounded-3xl flex flex-col items-center text-center space-y-3 relative order-3">
            <span className="w-10 h-10 rounded-2xl bg-amber-600/20 text-amber-500 flex items-center justify-center font-black text-base border border-amber-600/30 shadow-md">
              🥉 3
            </span>
            <div>
              <h3 className="font-extrabold text-white text-sm truncate max-w-[200px]">
                {topThree[2].profiles?.full_name || 'Candidate'}
              </h3>
              <p className="text-[11px] text-gray-400 truncate max-w-[200px] mt-0.5">
                {topThree[2].profiles?.department || 'OAU Aspirant'}
              </p>
            </div>
            <div className="bg-[#0b0e14] py-1.5 px-4 rounded-xl border border-gray-800 text-xs font-mono font-bold text-orange-400">
              {topThree[2].score}/{topThree[2].total_questions} • {Math.floor(topThree[2].time_spent_seconds / 60)}m {topThree[2].time_spent_seconds % 60}s
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-[#141822] border border-gray-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate name..."
            className="w-full pl-9 pr-3 py-2 bg-[#0b0e14] border border-gray-800 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-orange-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <FaBuilding className="text-gray-500 text-xs" />
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="w-full sm:w-auto bg-[#0b0e14] border border-gray-800 rounded-xl py-2 px-3 text-xs text-gray-300 focus:outline-none focus:border-orange-500"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept === 'ALL' ? 'All Departments' : dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-[#141822] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0b0e14] text-gray-400 text-[11px] font-bold uppercase tracking-wider border-b border-gray-800">
                <th className="py-3.5 px-4 sm:px-6">Rank</th>
                <th className="py-3.5 px-4 sm:px-6">Aspirant</th>
                <th className="py-3.5 px-4 sm:px-6">Department</th>
                <th className="py-3.5 px-4 sm:px-6">Score</th>
                <th className="py-3.5 px-4 sm:px-6">Time Taken</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-xs sm:text-sm">
              {filteredScores.map((entry, idx) => {
                const isCurrentUser = profile?.id && entry.user_id === profile.id;

                return (
                  <tr
                    key={entry.id || idx}
                    className={`transition ${
                      isCurrentUser
                        ? 'bg-orange-600/15 font-bold border-l-4 border-l-orange-500'
                        : idx < 3
                        ? 'bg-white/[0.02]'
                        : 'hover:bg-gray-800/40'
                    }`}
                  >
                    <td className="py-4 px-4 sm:px-6 font-black font-mono">
                      {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `#${idx + 1}`}
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-white font-semibold">
                      <div className="flex items-center gap-2">
                        <span>{entry.profiles?.full_name || 'Candidate'}</span>
                        {isCurrentUser && (
                          <span className="text-[10px] bg-orange-600 text-white px-2 py-0.5 rounded font-black">
                            YOU
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-gray-400">
                      {entry.profiles?.department || 'OAU Post-UTME'}
                    </td>
                    <td className="py-4 px-4 sm:px-6 font-extrabold text-orange-400">
                      {entry.score} <span className="text-gray-500 font-normal">/ {entry.total_questions}</span>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-gray-300 font-mono">
                      {Math.floor(entry.time_spent_seconds / 60)}m {entry.time_spent_seconds % 60}s
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-gray-500 text-right text-[11px] font-mono">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}

              {filteredScores.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500">
                    No matching mock attempts found. Be the first to take the mock challenge this week!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}