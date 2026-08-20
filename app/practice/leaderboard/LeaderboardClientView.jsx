'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getNowWAT } from '../../utils/weeklyMockHelper';
import { 
  FaTrophy, 
  FaBolt, 
  FaSearch, 
  FaBuilding, 
  FaLayerGroup, 
  FaClock, 
  FaMedal, 
  FaLock, 
  FaChevronLeft, 
  FaChevronRight, 
  FaUserCheck, 
  FaCrosshairs 
} from 'react-icons/fa';

export default function LeaderboardClientView({ 
  profile, 
  scores = [], 
  mockEditions = [],
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userRowRef = useRef(null);

  const activeMockId = searchParams.get('mock_id') || 'ALL';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Check if leaderboard is locked: Friday 10:00 AM till Saturday 12:00 AM WAT
  const [isLocked, setIsLocked] = useState(() => {
    const nowWAT = typeof getNowWAT === 'function' ? getNowWAT() : new Date();
    const day = nowWAT.getDay(); // 5 = Friday
    const hour = nowWAT.getHours();
    const minute = nowWAT.getMinutes();
    const timeDec = hour + minute / 60;
    return day === 5 && timeDec >= 10.0;
  });

  useEffect(() => {
    const checkLockStatus = () => {
      const nowWAT = typeof getNowWAT === 'function' ? getNowWAT() : new Date();
      const day = nowWAT.getDay();
      const hour = nowWAT.getHours();
      const minute = nowWAT.getMinutes();
      const timeDec = hour + minute / 60;
      setIsLocked(day === 5 && timeDec >= 10.0);
    };

    checkLockStatus();
    const interval = setInterval(checkLockStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // Extract unique departments from active scores
  const departments = useMemo(() => {
    const list = scores.map((s) => s.profiles?.department).filter(Boolean);
    return ['ALL', ...Array.from(new Set(list)).sort()];
  }, [scores]);

  // Filter rankings by name search & selected department
  const filteredScores = useMemo(() => {
    return scores.filter((entry) => {
      const nameMatch =
        !searchQuery.trim() ||
        entry.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        entry.profiles?.department?.toLowerCase().includes(searchQuery.toLowerCase().trim());

      const deptMatch = filterDept === 'ALL' || entry.profiles?.department === filterDept;

      return nameMatch && deptMatch;
    });
  }, [scores, searchQuery, filterDept]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterDept, activeMockId, pageSize]);

  // Identify Student's Personal Rank & Entry
  const studentPosition = useMemo(() => {
    if (!profile?.id) return null;
    const index = filteredScores.findIndex((s) => s.user_id === profile.id);
    if (index === -1) return null;

    const rank = index + 1;
    const entry = filteredScores[index];
    const targetPage = Math.ceil(rank / pageSize);
    const percentile = Math.max(1, Math.round(((filteredScores.length - rank) / filteredScores.length) * 100));

    return { rank, entry, targetPage, percentile };
  }, [filteredScores, profile?.id, pageSize]);

  // Jump to candidate's position row
  const handleJumpToMyPosition = () => {
    if (!studentPosition) return;
    setCurrentPage(studentPosition.targetPage);

    setTimeout(() => {
      userRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // Top 3 Podium
  const topThree = filteredScores.slice(0, 3);

  // Pagination Slice
  const totalItems = filteredScores.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const paginatedScores = useMemo(() => {
    return filteredScores.slice(startIndex, startIndex + pageSize);
  }, [filteredScores, startIndex, pageSize]);

  // URL State Synchronizer
  const updateUrlParams = (updates) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === undefined) {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    router.push(`?${params.toString()}`);
  };

  // Locked View: Friday 10:00 AM – Saturday 12:00 AM WAT
  if (isLocked) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 select-none">
        <div className="bg-[#0e131d] border border-gray-800/80 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 text-3xl shadow-lg shadow-orange-500/20">
            <FaLock />
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 bg-orange-500/10 px-3.5 py-1.5 rounded-full border border-orange-500/20">
              Exam Hours Underway
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Leaderboard Unavailable Right Now
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-md mx-auto">
              Standings and percentile rankings are locked during Friday test hours to protect competitive integrity. Please check back on <strong className="text-orange-400 font-bold">Saturday by 12:00 AM WAT</strong> when official results unlock.
            </p>
          </div>

          <div className="bg-[#07090e] border border-gray-800 p-4 rounded-2xl flex items-center justify-center gap-3 text-xs text-gray-400 font-mono">
            <FaClock className="text-orange-500 text-sm" />
            <span>Unlocks Saturday 12:00 AM WAT</span>
          </div>

          <div className="pt-2">
            <Link
              href="/practice/single"
              className="inline-flex items-center gap-2 py-3 px-8 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-orange-600/30 transition cursor-pointer"
            >
              <FaBolt /> Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none">
      
      {/* Header Banner */}
      <div className="bg-[#141822] border border-gray-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-bold uppercase tracking-wider border border-yellow-500/20">
            <FaTrophy /> Nationwide Mock Rankings
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Nationwide Aspirants Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-lg leading-relaxed">
            Verified candidate scores & speed rankings from official Post-UTME mock challenge editions. Results unlocked every Saturday at 12:00 AM WAT.
          </p>
        </div>

        <Link
          href="/practice/single"
          className="py-3.5 px-6 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-orange-600/30 transition flex items-center justify-center gap-2 self-start md:self-auto shrink-0 cursor-pointer"
        >
          <FaBolt /> Return to Dashboard
        </Link>
      </div>

      {/* Student Personal Position Quick Access Widget */}
      {studentPosition && (
        <div className="bg-gradient-to-r from-orange-950/40 via-[#141822] to-[#141822] border border-orange-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400 text-xl font-black shadow-inner">
              #{studentPosition.rank}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-orange-400 tracking-wider flex items-center gap-1">
                  <FaUserCheck /> Your Standing
                </span>
                <span className="text-[10px] bg-orange-500/10 border border-orange-500/30 text-orange-300 px-2 py-0.5 rounded-full font-mono font-bold">
                  Top {studentPosition.percentile}%
                </span>
              </div>
              <p className="text-sm font-bold text-white mt-0.5">
                {studentPosition.entry.profiles?.full_name} • <span className="text-gray-400 font-normal">{studentPosition.entry.profiles?.department}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-right font-mono">
              <div className="text-sm font-black text-orange-400">
                {studentPosition.entry.score} / {studentPosition.entry.total_questions || 40}
              </div>
              <div className="text-[10px] text-gray-500">
                {Math.floor(studentPosition.entry.time_spent_seconds / 60)}m {studentPosition.entry.time_spent_seconds % 60}s
              </div>
            </div>

            <button
              type="button"
              onClick={handleJumpToMyPosition}
              className="py-2.5 px-4 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white text-xs font-black rounded-xl shadow-lg shadow-orange-600/30 transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <FaCrosshairs className="text-xs" /> Jump to My Rank
            </button>
          </div>
        </div>
      )}

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
              {topThree[1].score}/{topThree[1].total_questions || 40} • {Math.floor(topThree[1].time_spent_seconds / 60)}m {topThree[1].time_spent_seconds % 60}s
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
              {topThree[0].score}/{topThree[0].total_questions || 40} • {Math.floor(topThree[0].time_spent_seconds / 60)}m {topThree[0].time_spent_seconds % 60}s
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
              {topThree[2].score}/{topThree[2].total_questions || 40} • {Math.floor(topThree[2].time_spent_seconds / 60)}m {topThree[2].time_spent_seconds % 60}s
            </div>
          </div>

        </div>
      )}

      {/* Filter Control Toolbar */}
      <div className="bg-[#141822] border border-gray-800 rounded-3xl p-4 sm:p-5 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-xl">
        
        {/* Search */}
        <div className="relative w-full lg:w-64">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate name..."
            className="w-full pl-9 pr-3 py-2.5 bg-[#0b0e14] border border-gray-800 rounded-2xl text-xs text-gray-200 focus:outline-none focus:border-orange-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 w-full lg:w-auto">
          
          {/* Mock Edition Dropdown */}
          <div className="flex items-center gap-2">
            <FaLayerGroup className="text-gray-500 text-xs shrink-0" />
            <select
              value={activeMockId}
              onChange={(e) => updateUrlParams({ mock_id: e.target.value, type: 'custom' })}
              className="bg-[#0b0e14] border border-gray-800 rounded-2xl py-2 px-3 text-xs text-gray-300 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="ALL">All Mock Editions</option>
              {mockEditions.map((mock) => (
                <option key={mock.id} value={mock.id}>
                  {mock.title}
                </option>
              ))}
            </select>
          </div>

          {/* Department Dropdown */}
          <div className="flex items-center gap-2">
            <FaBuilding className="text-gray-500 text-xs shrink-0" />
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="bg-[#0b0e14] border border-gray-800 rounded-2xl py-2 px-3 text-xs text-gray-300 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'ALL' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>

          {/* Page Size Selector */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-[#0b0e14] border border-gray-800 rounded-xl py-2 px-2.5 text-xs text-gray-300 focus:outline-none focus:border-orange-500 cursor-pointer font-mono"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

        </div>

      </div>

      {/* Leaderboard Table */}
      <div className="bg-[#141822] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0b0e14] text-gray-400 text-[11px] font-bold uppercase tracking-wider border-b border-gray-800">
                <th className="py-4 px-4 sm:px-6">Rank</th>
                <th className="py-4 px-4 sm:px-6">Aspirant</th>
                <th className="py-4 px-4 sm:px-6">Department</th>
                <th className="py-4 px-4 sm:px-6">Mock Title</th>
                <th className="py-4 px-4 sm:px-6">Score</th>
                <th className="py-4 px-4 sm:px-6">Time Taken</th>
                <th className="py-4 px-4 sm:px-6 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-xs sm:text-sm">
              {paginatedScores.map((entry, idx) => {
                const globalRank = startIndex + idx + 1;
                const isCurrentUser = profile?.id && entry.user_id === profile.id;

                return (
                  <tr
                    key={entry.id || idx}
                    ref={isCurrentUser ? userRowRef : null}
                    className={`transition ${
                      isCurrentUser
                        ? 'bg-orange-600/20 font-bold border-l-4 border-l-orange-500 ring-1 ring-orange-500/30'
                        : globalRank <= 3
                        ? 'bg-white/[0.02]'
                        : 'hover:bg-gray-800/40'
                    }`}
                  >
                    <td className="py-4 px-4 sm:px-6 font-black font-mono">
                      {globalRank === 1 ? '🥇 1' : globalRank === 2 ? '🥈 2' : globalRank === 3 ? '🥉 3' : `#${globalRank}`}
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-white font-semibold">
                      <div className="flex items-center gap-2">
                        <span>{entry.profiles?.full_name || 'Candidate'}</span>
                        {isCurrentUser && (
                          <span className="text-[10px] bg-orange-600 text-white px-2 py-0.5 rounded font-black tracking-wide">
                            YOU
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-gray-400">
                      {entry.profiles?.department || 'OAU Post-UTME'}
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-gray-400">
                      <span className="bg-[#0b0e14] border border-gray-800 px-2.5 py-1 rounded-lg text-[11px] font-mono text-gray-300">
                        {entry.weekly_mocks?.title || 'Weekly Mock Challenge'}
                      </span>
                    </td>
                    <td className="py-4 px-4 sm:px-6 font-extrabold text-orange-400">
                      {entry.score} <span className="text-gray-500 font-normal">/ {entry.total_questions || 40}</span>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-gray-300 font-mono">
                      <div className="inline-flex items-center gap-1.5 text-xs bg-[#0b0e14] border border-gray-800/80 px-2.5 py-1 rounded-lg">
                        <FaClock className="text-orange-500 text-[10px]" />
                        <span>{Math.floor(entry.time_spent_seconds / 60)}m {entry.time_spent_seconds % 60}s</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-gray-500 text-right text-[11px] font-mono">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}

              {filteredScores.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-500">
                    No mock challenge submissions found matching the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer Controls */}
        <div className="bg-[#0b0e14] border-t border-gray-800 px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-gray-400 font-mono text-[11px]">
            Showing <strong className="text-white">{totalItems === 0 ? 0 : startIndex + 1}</strong> to <strong className="text-white">{endIndex}</strong> of <strong className="text-orange-400">{totalItems}</strong> entries
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="px-3 py-1.5 rounded-xl bg-[#141822] hover:bg-[#1c2230] border border-gray-800 text-gray-300 font-bold transition flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <FaChevronLeft className="text-[10px]" /> Prev
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl font-mono text-xs font-bold transition cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                        : 'bg-[#141822] border border-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className="px-3 py-1.5 rounded-xl bg-[#141822] hover:bg-[#1c2230] border border-gray-800 text-gray-300 font-bold transition flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              Next <FaChevronRight className="text-[10px]" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}