'use client';

import { useEffect, useState } from 'react';
import { createClient } from '../../../utils/supabase/client';
import { FaTrophy, FaMedal, FaClock, FaSearch } from 'react-icons/fa';

export default function WeeklyLeaderboardPage() {
  const supabase = createClient();
  const [leaderboard, setLeaderboard] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      const { data } = await supabase
        .from('weekly_mock_leaderboard')
        .select('*')
        .order('rank', { ascending: true })
        .limit(100);

      setLeaderboard(data || []);
      setLoading(false);
    }
    loadLeaderboard();
  }, [supabase]);

  const filtered = leaderboard.filter((item) =>
    item.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    item.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <FaTrophy className="text-yellow-400" /> Weekly Nationwide Leaderboard
          </h1>
          <p className="text-xs text-gray-400 mt-1">Official rankings from the Friday Mock Challenge.</p>
        </div>

        <div className="relative min-w-[240px]">
          <FaSearch className="absolute left-3.5 top-3.5 text-xs text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate or course..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#141822] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      <div className="bg-[#141822] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0f1117] text-gray-400 uppercase tracking-wider text-[10px] border-b border-gray-800">
              <tr>
                <th className="py-3.5 px-4">Rank</th>
                <th className="py-3.5 px-4">Candidate</th>
                <th className="py-3.5 px-4">Target Course</th>
                <th className="py-3.5 px-4">Score</th>
                <th className="py-3.5 px-4">Speed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">Loading standings...</td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((entry) => (
                  <tr key={entry.session_id} className="hover:bg-gray-800/20 transition">
                    <td className="py-3.5 px-4 font-black text-sm">
                      {entry.rank === 1 && <span className="text-yellow-400 flex items-center gap-1"><FaMedal /> 1st</span>}
                      {entry.rank === 2 && <span className="text-gray-300 flex items-center gap-1"><FaMedal /> 2nd</span>}
                      {entry.rank === 3 && <span className="text-amber-600 flex items-center gap-1"><FaMedal /> 3rd</span>}
                      {entry.rank > 3 && <span className="text-gray-500">#{entry.rank}</span>}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">{entry.full_name}</td>
                    <td className="py-3.5 px-4 text-gray-400">{entry.department}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-orange-400">
                      {entry.score} / {entry.total_questions}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 font-mono flex items-center gap-1">
                      <FaClock className="text-[10px]" />
                      {Math.floor(entry.time_spent_seconds / 60)}m {entry.time_spent_seconds % 60}s
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">No mock attempts recorded for this week yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}