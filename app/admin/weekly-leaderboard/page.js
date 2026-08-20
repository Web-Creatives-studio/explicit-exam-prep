'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { createClient } from '../../utils/supabase/client';
import { 
  FaTrophy, 
  FaMedal, 
  FaClock, 
  FaSearch, 
  FaBuilding, 
  FaLayerGroup, 
  FaDownload,
  FaUserGraduate,
  FaCircle,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';

export default function AdminWeeklyLeaderboardPage() {
  const supabase = createClient();

  const [leaderboard, setLeaderboard] = useState([]);
  const [mockEditions, setMockEditions] = useState([]);
  const [selectedMockId, setSelectedMockId] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // 1. Fetch function reusable for initial load and realtime refetches
  const fetchLeaderboardData = useCallback(async () => {
    const { data: mocks } = await supabase
      .from('weekly_mocks')
      .select('id, title, active_date')
      .order('active_date', { ascending: false });

    if (mocks) {
      setMockEditions(mocks);
    }

    const { data: sessionsData, error } = await supabase
      .from('test_sessions')
      .select(`
        id,
        user_id,
        mode,
        mock_id,
        score,
        total_questions,
        time_spent_seconds,
        created_at,
        profiles (
          id,
          full_name,
          department
        ),
        weekly_mocks (
          id,
          title,
          active_date
        )
      `)
      .in('mode', ['weekly_mock', 'weekly_challenge'])
      .order('score', { ascending: false })
      .order('time_spent_seconds', { ascending: true })
      .limit(1000);

    if (error) {
      console.error('Error fetching admin test_sessions leaderboard:', error);
    }

    setLeaderboard(sessionsData || []);
    setLoading(false);
  }, [supabase]);

  // 2. Initial Data Fetch & Supabase Realtime Listener Setup
  useEffect(() => {
    fetchLeaderboardData();

    const channel = supabase
      .channel('admin-realtime-leaderboard-pagination')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'test_sessions',
        },
        () => {
          fetchLeaderboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchLeaderboardData]);

  // 3. Extract unique departments dynamically
  const departments = useMemo(() => {
    const list = leaderboard
      .map((item) => item.profiles?.department)
      .filter((dept) => Boolean(dept) && dept !== 'General Drill');
    return ['ALL', ...Array.from(new Set(list)).sort()];
  }, [leaderboard]);

  // 4. Multi-factor Filtering
  const filtered = useMemo(() => {
    return leaderboard.filter((item) => {
      const candidateName = item.profiles?.full_name?.toLowerCase() || '';
      const candidateDept = item.profiles?.department?.toLowerCase() || '';
      const term = search.toLowerCase().trim();

      const matchesSearch =
        !term || candidateName.includes(term) || candidateDept.includes(term);

      const matchesMock =
        selectedMockId === 'ALL' || item.mock_id === selectedMockId;

      const matchesDept =
        selectedDept === 'ALL' || item.profiles?.department === selectedDept;

      return matchesSearch && matchesMock && matchesDept;
    });
  }, [leaderboard, search, selectedMockId, selectedDept]);

  // Reset page number on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedMockId, selectedDept, pageSize]);

  // Top 3 Podium is determined by overall filtered list
  const topThree = filtered.slice(0, 3);

  // 5. Pagination Slices & Calculations
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const paginatedScores = useMemo(() => {
    return filtered.slice(startIndex, startIndex + pageSize);
  }, [filtered, startIndex, pageSize]);

  // 6. Admin CSV Export (Exports all filtered rows)
  const exportToCSV = () => {
    if (filtered.length === 0) return;

    const headers = ['Rank,Full Name,Department,Mock Title,Score,Total Questions,Time (Seconds),Date'];
    const rows = filtered.map((entry, idx) => {
      const rank = idx + 1;
      const name = `"${(entry.profiles?.full_name || 'Anonymous').replace(/"/g, '""')}"`;
      const dept = `"${(entry.profiles?.department || 'N/A').replace(/"/g, '""')}"`;
      const title = `"${(entry.weekly_mocks?.title || 'Weekly Mock Challenge').replace(/"/g, '""')}"`;
      const date = entry.created_at ? new Date(entry.created_at).toLocaleDateString() : 'N/A';
      return `${rank},${name},${dept},${title},${entry.score},${entry.total_questions},${entry.time_spent_seconds},${date}`;
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `admin_leaderboard_${selectedDept}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 select-none selection:bg-orange-500 selection:text-white">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-[11px] font-black uppercase tracking-wider border border-orange-500/20">
              Admin Console
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
              <FaCircle className="text-[6px] animate-pulse" /> Live Realtime Sync
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <FaTrophy className="text-yellow-400" /> Weekly Nationwide Leaderboard
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time candidate score rankings, department distributions, and speed analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono bg-[#141822] border border-gray-800 px-4 py-2.5 rounded-2xl text-gray-400">
            Total Aspirants: <strong className="text-orange-400">{filtered.length}</strong>
          </div>

          <button
            type="button"
            onClick={exportToCSV}
            disabled={filtered.length === 0}
            className="py-2.5 px-4 bg-[#141822] hover:bg-[#1a202c] active:scale-[0.98] border border-gray-700/80 text-gray-200 font-bold text-xs rounded-2xl flex items-center gap-2 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <FaDownload className="text-orange-400" /> Export CSV
          </button>
        </div>
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

      {/* Filter Control Bar */}
      <div className="bg-[#141822] border border-gray-800 rounded-3xl p-4 sm:p-5 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-xl">
        
        {/* Search */}
        <div className="relative w-full lg:w-72">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate name or course..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#0b0e14] border border-gray-800 rounded-2xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 w-full lg:w-auto">
          
          {/* Mock Edition Dropdown */}
          <div className="flex items-center gap-2">
            <FaLayerGroup className="text-gray-500 text-xs shrink-0" />
            <select
              value={selectedMockId}
              onChange={(e) => setSelectedMockId(e.target.value)}
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

      {/* Leaderboard Table */}
      <div className="bg-[#141822] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl space-y-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b0e14] text-gray-400 uppercase tracking-wider text-[10px] border-b border-gray-800">
              <tr>
                <th className="py-4 px-4 sm:px-6">Rank</th>
                <th className="py-4 px-4 sm:px-6">Candidate</th>
                <th className="py-4 px-4 sm:px-6">Target Course</th>
                <th className="py-4 px-4 sm:px-6">Mock Title</th>
                <th className="py-4 px-4 sm:px-6">Score</th>
                <th className="py-4 px-4 sm:px-6 text-right">Time Taken</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FiLoader className="text-2xl text-orange-500 animate-spin" />
                      <span>Loading nationwide mock standings...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedScores.length > 0 ? (
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
                        {globalRank === 1 && (
                          <span className="text-yellow-400 flex items-center gap-1.5 font-black">
                            <FaMedal /> 1st
                          </span>
                        )}
                        {globalRank === 2 && (
                          <span className="text-gray-300 flex items-center gap-1.5 font-black">
                            <FaMedal /> 2nd
                          </span>
                        )}
                        {globalRank === 3 && (
                          <span className="text-amber-500 flex items-center gap-1.5 font-black">
                            <FaMedal /> 3rd
                          </span>
                        )}
                        {globalRank > 3 && (
                          <span className="text-gray-500 font-bold">#{globalRank}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 sm:px-6 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <FaUserGraduate className="text-gray-600 text-xs shrink-0" />
                          <span>{entry.profiles?.full_name || 'Anonymous Candidate'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-gray-400 font-medium">
                        {entry.profiles?.department || 'General Aspirant'}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-gray-400">
                        <span className="bg-[#0b0e14] border border-gray-800 px-2.5 py-1 rounded-lg text-[11px] font-mono text-gray-300">
                          {entry.weekly_mocks?.title || 'Weekly Mock Challenge'}
                        </span>
                      </td>
                      <td className="py-4 px-4 sm:px-6 font-mono font-black text-orange-400 text-sm">
                        {entry.score} <span className="text-gray-500 font-normal text-xs">/ {entry.total_questions || 40}</span>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-gray-400 font-mono text-right">
                        <div className="inline-flex items-center gap-1.5 text-xs bg-[#0b0e14] border border-gray-800/80 px-2.5 py-1 rounded-lg">
                          <FaClock className="text-orange-500 text-[10px]" />
                          <span>{Math.floor((entry.time_spent_seconds || 0) / 60)}m {(entry.time_spent_seconds || 0) % 60}s</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
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

    </div>
  );
}