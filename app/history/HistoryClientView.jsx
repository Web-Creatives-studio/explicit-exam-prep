'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  FaHistory, 
  FaBookOpen, 
  FaLayerGroup, 
  FaCalendarAlt, 
  FaClock, 
  FaSearch, 
  FaCheckCircle, 
  FaChartLine, 
  FaTrophy,
  FaBolt
} from 'react-icons/fa';

export default function StudentHistoryClientView({ profile, sessions = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('ALL');

  // Summary Metrics
  const stats = useMemo(() => {
    if (!sessions || sessions.length === 0) {
      return { totalTests: 0, avgScore: 0, bestScore: 0, totalMinutes: 0 };
    }

    const totalTests = sessions.length;
    let totalScore = 0;
    let totalMaxScore = 0;
    let highestPct = 0;
    let totalSeconds = 0;

    sessions.forEach((s) => {
      const score = s.score || 0;
      const total = s.total_questions || 1;
      const pct = Math.round((score / total) * 100);

      totalScore += score;
      totalMaxScore += total;
      totalSeconds += s.time_spent_seconds || 0;

      if (pct > highestPct) highestPct = pct;
    });

    const avgScore = Math.round((totalScore / (totalMaxScore || 1)) * 100);
    const totalMinutes = Math.round(totalSeconds / 60);

    return { totalTests, avgScore, bestScore: highestPct, totalMinutes };
  }, [sessions]);

  // Helper to format mode label and badge styling
  const getSessionMeta = (session) => {
    if (session.mode === 'single_subject') {
      return {
        title: session.subjects?.name || 'Single Subject Drill',
        badge: 'Single Drill',
        badgeColor: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
        icon: <FaBookOpen className="text-xs" />,
      };
    }
    if (session.mode === 'full_mock') {
      return {
        title: 'Full Mock Exam (4 Subjects)',
        badge: 'Full Mock',
        badgeColor: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
        icon: <FaLayerGroup className="text-xs" />,
      };
    }
    if (session.mode === 'weekly_mock') {
      return {
        title: 'Weekly Nationwide Mock',
        badge: 'Weekly Mock',
        badgeColor: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        icon: <FaCalendarAlt className="text-xs" />,
      };
    }
    return {
      title: session.mode?.replace('_', ' ') || 'Practice Test',
      badge: 'Drill',
      badgeColor: 'bg-gray-500/10 border-gray-500/20 text-gray-400',
      icon: <FaBookOpen className="text-xs" />,
    };
  };

  // Filter history records
  const filteredSessions = sessions.filter((s) => {
    const meta = getSessionMeta(s);
    const searchTarget = `${meta.title} ${s.mode}`.toLowerCase();
    const matchesSearch = searchTarget.includes(searchQuery.toLowerCase());

    const matchesMode =
      filterMode === 'ALL' ||
      (filterMode === 'single_subject' && s.mode === 'single_subject') ||
      (filterMode === 'full_mock' && s.mode === 'full_mock');

    return matchesSearch && matchesMode;
  });

  return (
    <div className="space-y-8 select-none">
      {/* Header Banner */}
      <div className="bg-[#141822] border border-gray-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold uppercase tracking-wider border border-orange-500/20">
            <FaHistory /> Test History & Analytics
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Personal Performance Log
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-lg leading-relaxed">
            Review your past mock scores, practice drills, and completion speed to monitor your readiness.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/practice/single"
            className="py-3 px-5 bg-[#0b0e14] hover:bg-gray-800 border border-gray-800 text-gray-200 font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer"
          >
            <FaBookOpen /> Quick Drill
          </Link>
          <Link
            href="/practice/mock"
            className="py-3 px-5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-orange-600/30 transition flex items-center gap-2 cursor-pointer"
          >
            <FaBolt /> Full Mock Exam
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#141822] border border-gray-800 p-5 rounded-2xl space-y-1">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <FaCheckCircle className="text-orange-500" /> Total Attempts
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{stats.totalTests}</div>
        </div>

        <div className="bg-[#141822] border border-gray-800 p-5 rounded-2xl space-y-1">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <FaChartLine className="text-emerald-400" /> Average Score
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">{stats.avgScore}%</div>
        </div>

        <div className="bg-[#141822] border border-gray-800 p-5 rounded-2xl space-y-1">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <FaTrophy className="text-yellow-400" /> Best Score
          </div>
          <div className="text-2xl sm:text-3xl font-black text-yellow-400">{stats.bestScore}%</div>
        </div>

        <div className="bg-[#141822] border border-gray-800 p-5 rounded-2xl space-y-1">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <FaClock className="text-blue-400" /> Practice Time
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-400">{stats.totalMinutes} <span className="text-xs text-gray-400 font-normal">mins</span></div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#141822] border border-gray-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by subject or mock mode..."
            className="w-full pl-9 pr-3 py-2 bg-[#0b0e14] border border-gray-800 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-orange-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="w-full sm:w-auto bg-[#0b0e14] border border-gray-800 rounded-xl py-2 px-3 text-xs text-gray-300 focus:outline-none focus:border-orange-500"
          >
            <option value="ALL">All Test Types</option>
            <option value="single_subject">Single Subject Drills</option>
            <option value="full_mock">Full 4-Subject Mocks</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-[#141822] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0b0e14] text-gray-400 text-[11px] font-bold uppercase tracking-wider border-b border-gray-800">
                <th className="py-4 px-4 sm:px-6">Test / Subject</th>
                <th className="py-4 px-4 sm:px-6">Type</th>
                <th className="py-4 px-4 sm:px-6">Score</th>
                <th className="py-4 px-4 sm:px-6">Percentage</th>
                <th className="py-4 px-4 sm:px-6">Time Spent</th>
                <th className="py-4 px-4 sm:px-6 text-right">Date Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-xs sm:text-sm">
              {filteredSessions.map((session, idx) => {
                const meta = getSessionMeta(session);
                const percentage = Math.round(
                  ((session.score || 0) / (session.total_questions || 1)) * 100
                );

                return (
                  <tr key={session.id || idx} className="hover:bg-gray-800/30 transition">
                    {/* Subject / Title */}
                    <td className="py-4 px-4 sm:px-6 font-bold text-white">
                      {meta.title}
                    </td>

                    {/* Type Badge */}
                    <td className="py-4 px-4 sm:px-6">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${meta.badgeColor}`}>
                        {meta.icon} {meta.badge}
                      </span>
                    </td>

                    {/* Score */}
                    <td className="py-4 px-4 sm:px-6 font-mono font-bold text-orange-400">
                      {session.score} <span className="text-gray-500 font-normal">/ {session.total_questions}</span>
                    </td>

                    {/* Percentage Pill */}
                    <td className="py-4 px-4 sm:px-6">
                      <span className={`inline-block font-mono text-xs font-bold px-2.5 py-0.5 rounded-md ${
                        percentage >= 60 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-gray-800 text-gray-400 border border-gray-700'
                      }`}>
                        {percentage}%
                      </span>
                    </td>

                    {/* Time Spent */}
                    <td className="py-4 px-4 sm:px-6 text-gray-300 font-mono text-xs">
                      {Math.floor((session.time_spent_seconds || 0) / 60)}m {(session.time_spent_seconds || 0) % 60}s
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 sm:px-6 text-gray-500 text-right text-[11px] font-mono">
                      {new Date(session.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                );
              })}

              {filteredSessions.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-14 text-center text-gray-500">
                    <p className="font-semibold text-gray-400">No test attempts match your filter.</p>
                    <p className="text-xs mt-1">Take a quick drill or full mock exam to log your practice tests.</p>
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