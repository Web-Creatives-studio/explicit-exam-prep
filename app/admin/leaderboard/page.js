'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { createClient } from '../../utils/supabase/client';
import { toast } from 'react-toastify';
import { 
  FaTrophy, 
  FaTrashAlt, 
  FaSearch, 
  FaTimes, 
  FaExclamationTriangle, 
  FaSpinner, 
  FaBuilding, 
  FaShieldAlt, 
  FaCrown, 
  FaChevronLeft, 
  FaChevronRight, 
  FaUserGraduate, FaClock
} from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';

export const dynamic = 'force-dynamic';

function AdminLeaderboardContent() {
  const supabase = createClient();
  const [topScores, setTopScores] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedTier, setSelectedTier] = useState('ALL'); // 'ALL' | 'PRO' | 'FREE'
  const [loading, setLoading] = useState(true);
  const [purging, setPurging] = useState(false);
  const [showPurgeModal, setShowPurgeModal] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);

    // Fetch test sessions across weekly mock modes
    const { data: sessions, error } = await supabase
      .from('mock_sessions')
      .select('id, score, total_questions, time_spent_seconds, created_at, mode, user_id')
      .in('mode', ['full_mock', 'weekly_mock', 'weekly_challenge'])
      .order('score', { ascending: false })
      .order('time_spent_seconds', { ascending: true })
      .limit(1000);

    if (error) {
      toast.error('Failed to load leaderboard records');
      setLoading(false);
      return;
    }

    // Fetch candidate profiles to extract department, name, and is_premium tier
    const userIds = [...new Set((sessions || []).map((s) => s.user_id).filter(Boolean))];
    let profileMap = {};

    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, department, is_premium')
        .in('id', userIds);

      if (profilesData) {
        profilesData.forEach((p) => {
          profileMap[p.id] = p;
        });
      }
    }

    // Map candidate session records cleanly
    const mapped = (sessions || []).map((entry) => {
      const p = profileMap[entry.user_id];
      return {
        ...entry,
        candidateName: p?.full_name || 'Anonymous Candidate',
        candidateDepartment: p?.department || 'Undecided',
        is_premium: Boolean(p?.is_premium),
      };
    });

    setTopScores(mapped);
    setLoading(false);
  };

  const handlePurgeLeaderboard = async () => {
    setPurging(true);

    const { error } = await supabase
      .from('mock_sessions')
      .delete()
      .in('mode', ['full_mock', 'weekly_mock']);

    if (!error) {
      toast.success('Mock challenge leaderboard has been reset.');
      setTopScores([]);
      setShowPurgeModal(false);
    } else {
      toast.error(error.message || 'Failed to reset leaderboard.');
    }

    setPurging(false);
  };

  // Extract unique departments for filtering
  const departments = useMemo(() => {
    const list = topScores.map((s) => s.candidateDepartment).filter((d) => Boolean(d) && d !== 'Undecided');
    return ['ALL', ...Array.from(new Set(list)).sort()];
  }, [topScores]);

  // Multi-factor Filter: Search (Name/Course) + Department + Tier (PRO/FREE)
  const filteredScores = useMemo(() => {
    return topScores.filter((s) => {
      const nameMatch =
        !search.trim() ||
        s.candidateName?.toLowerCase().includes(search.toLowerCase().trim()) ||
        s.candidateDepartment?.toLowerCase().includes(search.toLowerCase().trim());

      const deptMatch = selectedDept === 'ALL' || s.candidateDepartment === selectedDept;

      const tierMatch =
        selectedTier === 'ALL' ||
        (selectedTier === 'PRO' && s.is_premium) ||
        (selectedTier === 'FREE' && !s.is_premium);

      return nameMatch && deptMatch && tierMatch;
    });
  }, [topScores, search, selectedDept, selectedTier]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedDept, selectedTier, pageSize]);

  // Pagination calculations
  const totalItems = filteredScores.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const paginatedScores = useMemo(() => {
    return filteredScores.slice(startIndex, startIndex + pageSize);
  }, [filteredScores, startIndex, pageSize]);

  return (
    <div className="space-y-6 select-none selection:bg-orange-500 selection:text-white">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-[11px] font-black uppercase tracking-wider border border-orange-500/20 mb-2">
            Admin Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <FaTrophy className="text-yellow-400" /> Mock Challenge Standings
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Live rankings, score performance, and tier status of all participating candidates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono bg-[#141822] border border-gray-800 px-4 py-2.5 rounded-2xl text-gray-400">
            Total Records: <strong className="text-orange-400">{filteredScores.length}</strong>
          </div>

          <button
            type="button"
            onClick={() => setShowPurgeModal(true)}
            className="flex items-center gap-2 bg-red-600/15 hover:bg-red-600/25 active:scale-[0.98] text-red-400 border border-red-500/30 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer"
          >
            <FaTrashAlt /> Reset Standings
          </button>
        </div>
      </div>

      {/* Control Bar: Search + Tier Filter + Department Filter + Page Size */}
      <div className="bg-[#141822] border border-gray-800 rounded-3xl p-4 sm:p-5 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-xl">
        
        {/* Search */}
        <div className="relative w-full lg:w-72">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate name or course..."
            className="w-full bg-[#0b0e14] border border-gray-800 rounded-2xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 w-full lg:w-auto">
          
          {/* Access Tier Filter */}
          <div className="flex items-center gap-2">
            <FaShieldAlt className="text-gray-500 text-xs shrink-0" />
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="bg-[#0b0e14] border border-gray-800 rounded-2xl py-2 px-3 text-xs text-gray-300 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="ALL">All Tiers (Pro & Free)</option>
              <option value="PRO">👑 PRO Aspirants</option>
              <option value="FREE">FREE Tier</option>
            </select>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <FaBuilding className="text-gray-500 text-xs shrink-0" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
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

      {/* Standings Table Card */}
      <div className="bg-[#141822] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-gray-300 min-w-[650px]">
            <thead className="bg-[#0b0e14] text-[11px] uppercase font-bold text-gray-400 tracking-wider border-b border-gray-800">
              <tr>
                <th className="py-4 px-4 sm:px-6">Rank</th>
                <th className="py-4 px-4 sm:px-6">Candidate</th>
                <th className="py-4 px-4 sm:px-6">Target Course</th>
                <th className="py-4 px-4 sm:px-6">Tier</th>
                <th className="py-4 px-4 sm:px-6">Score</th>
                <th className="py-4 px-4 sm:px-6">Time Taken</th>
                <th className="py-4 px-4 sm:px-6 text-right">Date Taken</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {loading && topScores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FiLoader className="animate-spin text-orange-500 text-2xl" />
                      <span className="text-xs font-bold uppercase tracking-wider">Loading Leaderboard Standings...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedScores.map((entry, idx) => {
                  const globalRank = startIndex + idx + 1;

                  return (
                    <tr 
                      key={entry.id || idx} 
                      className={`transition ${
                        globalRank <= 3 ? 'bg-white/[0.02]' : 'hover:bg-gray-800/20'
                      }`}
                    >
                      <td className="py-4 px-4 sm:px-6 font-black font-mono text-sm">
                        {globalRank === 1 && <span className="text-yellow-400">🥇 1st</span>}
                        {globalRank === 2 && <span className="text-gray-300">🥈 2nd</span>}
                        {globalRank === 3 && <span className="text-amber-500">🥉 3rd</span>}
                        {globalRank > 3 && <span className="text-gray-500">#{globalRank}</span>}
                      </td>
                      <td className="py-4 px-4 sm:px-6 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <FaUserGraduate className="text-gray-600 text-xs shrink-0" />
                          <span>{entry.candidateName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-gray-300 font-medium">{entry.candidateDepartment}</td>
                      <td className="py-4 px-4 sm:px-6">
                        {entry.is_premium ? (
                          <span className="inline-flex items-center gap-1 bg-yellow-500/10 text-yellow-400 text-[11px] font-black px-2 py-0.5 rounded-md border border-yellow-500/20">
                            <FaCrown className="text-[9px]" /> PRO
                          </span>
                        ) : (
                          <span className="bg-[#0b0e14] border border-gray-800 text-gray-400 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                            FREE
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 sm:px-6 font-mono font-black text-orange-400 text-sm">
                        {entry.score} <span className="text-gray-500 font-normal text-xs">/ {entry.total_questions || 40}</span>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-gray-300 font-mono">
                        <div className="inline-flex items-center gap-1.5 text-xs bg-[#0b0e14] border border-gray-800/80 px-2.5 py-1 rounded-lg">
                          <FaClock className="text-orange-500 text-[10px]" />
                          <span>{Math.floor((entry.time_spent_seconds || 0) / 60)}m {(entry.time_spent_seconds || 0) % 60}s</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-gray-500 text-right text-[11px] font-mono">
                        {entry.created_at ? new Date(entry.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  );
                })
              )}

              {filteredScores.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-500">
                    No mock challenge attempts match the selected filter criteria.
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
              disabled={currentPage <= 1 || loading}
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
              disabled={currentPage >= totalPages || loading}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className="px-3 py-1.5 rounded-xl bg-[#141822] hover:bg-[#1c2230] border border-gray-800 text-gray-300 font-bold transition flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              Next <FaChevronRight className="text-[10px]" />
            </button>
          </div>
        </div>

      </div>

      {/* Purge / Reset Confirmation Modal */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141822] border border-red-500/30 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl text-white relative animate-in fade-in zoom-in duration-200">
            <button
              type="button"
              onClick={() => setShowPurgeModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition cursor-pointer"
            >
              <FaTimes />
            </button>

            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 text-2xl">
                <FaExclamationTriangle />
              </div>
              <h3 className="text-2xl font-black tracking-tight">Reset Leaderboard?</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                This will permanently delete all candidate mock scores from <code className="text-orange-400 font-mono">public.test_sessions</code> and start a fresh leaderboard.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPurgeModal(false)}
                className="flex-1 py-3 bg-[#0b0e14] hover:bg-gray-800 border border-gray-800 text-gray-300 font-bold rounded-xl transition text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={purging}
                onClick={handlePurgeLeaderboard}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white font-extrabold rounded-xl transition shadow-lg shadow-red-600/25 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {purging ? (
                  <>
                    <FaSpinner className="animate-spin" /> Purging...
                  </>
                ) : (
                  <>
                    <FaTrashAlt /> Confirm Reset
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminLeaderboardFallback() {
  return (
    <div className="h-[70vh] w-full flex flex-col items-center justify-center gap-3 text-gray-400 select-none">
      <FiLoader className="animate-spin text-orange-500 text-3xl" />
      <p className="text-xs font-bold uppercase tracking-widest text-gray-300">Loading Leaderboard Standings...</p>
    </div>
  );
}

export default function AdminLeaderboardPage() {
  return (
    <Suspense fallback={<AdminLeaderboardFallback />}>
      <AdminLeaderboardContent />
    </Suspense>
  );
}