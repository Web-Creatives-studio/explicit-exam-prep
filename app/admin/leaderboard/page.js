'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '../../utils/supabase/client';
import { toast } from 'react-toastify';
import { 
  FaTrophy, 
  FaTrashAlt, 
  FaSearch, 
  FaTimes, 
  FaExclamationTriangle, 
  FaSpinner 
} from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';

export const dynamic = 'force-dynamic';

function AdminLeaderboardContent() {
  const supabase = createClient();
  const [topScores, setTopScores] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [purging, setPurging] = useState(false);
  const [showPurgeModal, setShowPurgeModal] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // 1. Fetch mock sessions from the past 7 days across mock modes
    const { data: sessions, error } = await supabase
      .from('mock_sessions')
      .select('id, score, total_questions, time_spent_seconds, created_at, mode, user_id')
      .in('mode', ['full_mock', 'weekly_mock'])
      .gte('created_at', oneWeekAgo)
      .order('score', { ascending: false })
      .order('time_spent_seconds', { ascending: true })
      .limit(100);

    if (error) {
      toast.error('Failed to load leaderboard records');
      setLoading(false);
      return;
    }

    // 2. Fetch candidate profiles using direct lookup map
    const userIds = [...new Set((sessions || []).map((s) => s.user_id).filter(Boolean))];
    let profileMap = {};

    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, department')
        .in('id', userIds);

      if (profilesData) {
        profilesData.forEach((p) => {
          profileMap[p.id] = p;
        });
      }
    }

    // 3. Map candidates cleanly
    const mapped = (sessions || []).map((entry) => {
      const p = profileMap[entry.user_id];
      return {
        ...entry,
        candidateName: p?.full_name || 'Candidate',
        candidateDepartment: p?.department || 'OAU Post-UTME',
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

  const filteredScores = topScores.filter((s) =>
    s.candidateName?.toLowerCase().includes(search.toLowerCase()) ||
    s.candidateDepartment?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 select-none">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Mock Challenge Standings</h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Live rankings of all candidates participating in the 4-Subject Mock.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or course..."
              className="bg-[#141822] border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowPurgeModal(true)}
            className="flex items-center gap-2 bg-red-600/15 hover:bg-red-600/25 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <FaTrashAlt /> Reset Standings
          </button>
        </div>
      </div>

      {/* Standings Table Card */}
      <div className="bg-[#141822] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-gray-300 min-w-[650px]">
            <thead className="bg-[#0b0e14] text-[11px] uppercase font-bold text-gray-400 border-b border-gray-800">
              <tr>
                <th className="p-4">Rank</th>
                <th className="p-4">Candidate</th>
                <th className="p-4">Department</th>
                <th className="p-4">Score</th>
                <th className="p-4">Time Taken</th>
                <th className="p-4 text-right">Date Taken</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {loading && topScores.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FiLoader className="animate-spin text-orange-500 text-2xl" />
                      <span className="text-xs font-bold uppercase tracking-wider">Loading Leaderboard Standings...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredScores.map((entry, idx) => (
                  <tr key={entry.id} className="hover:bg-gray-800/20 transition">
                    <td className="p-4 font-black font-mono text-orange-400">
                      {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `#${idx + 1}`}
                    </td>
                    <td className="p-4 font-bold text-white">{entry.candidateName}</td>
                    <td className="p-4 text-xs text-gray-400">{entry.candidateDepartment}</td>
                    <td className="p-4 font-mono font-black text-emerald-400">
                      {entry.score} / {entry.total_questions}
                    </td>
                    <td className="p-4 text-xs text-gray-300 font-mono">
                      {Math.floor((entry.time_spent_seconds || 0) / 60)}m {(entry.time_spent_seconds || 0) % 60}s
                    </td>
                    <td className="p-4 text-xs text-gray-500 text-right">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}

              {filteredScores.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No mock records available for this cycle.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
                This will permanently delete all candidate mock scores from the database and start a fresh leaderboard.
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
    <div className="h-[70vh] w-full flex flex-col items-center justify-center gap-3 text-gray-400">
      <FiLoader className="animate-spin text-orange-500 text-3xl" />
      <p className="text-xs font-bold uppercase tracking-widest">Loading Leaderboard Standings...</p>
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