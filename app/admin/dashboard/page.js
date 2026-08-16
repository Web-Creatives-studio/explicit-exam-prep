'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '../../utils/supabase/client';
import { 
  FaUsers, 
  FaUserGraduate, 
  FaBook, 
  FaKey, 
  FaCrown, 
  FaClock, 
  FaArrowRight 
} from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';

export const dynamic = 'force-dynamic';

function AdminDashboardContent() {
  const supabase = createClient();
  const [stats, setStats] = useState({
    activeNow: 0,
    totalStudents: 0,
    premiumStudents: 0,
    totalQuestions: 0,
    unusedCodes: 0,
    totalMockSessions: 0,
  });
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    // 1. Fetch KPI counts concurrently
    const [
      { count: activeCount },
      { count: totalUserCount },
      { count: premiumUserCount },
      { count: questionCount },
      { count: unusedCodeCount },
      { count: mockCount },
      { data: recentSessions }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('last_active_at', fifteenMinsAgo),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_premium', true),
      supabase.from('questions').select('*', { count: 'exact', head: true }),
      supabase.from('access_codes').select('*', { count: 'exact', head: true }).eq('is_used', false),
      supabase.from('mock_sessions').select('*', { count: 'exact', head: true }),
      supabase.from('mock_sessions')
        .select(`
          id, mode, score, total_questions, time_spent_seconds, created_at, user_id,
          profiles:user_id (id, full_name, department)
        `)
        .order('created_at', { ascending: false })
        .limit(6)
    ]);

    setStats({
      activeNow: activeCount || 0,
      totalStudents: totalUserCount || 0,
      premiumStudents: premiumUserCount || 0,
      totalQuestions: questionCount || 0,
      unusedCodes: unusedCodeCount || 0,
      totalMockSessions: mockCount || 0,
    });

    // Normalize and map profiles safely (whether array or object)
    const normalizedAttempts = (recentSessions || []).map((session) => {
      const profileData = Array.isArray(session.profiles) 
        ? session.profiles[0] 
        : session.profiles;

      return {
        ...session,
        candidateName: profileData?.full_name || 'Anonymous Candidate',
        candidateDepartment: profileData?.department || 'OAU Post-UTME',
      };
    });

    setRecentAttempts(normalizedAttempts);
    setLoading(false);
  };

  const statCards = [
    { label: 'Active Candidates (15m)', value: stats.activeNow, icon: FaUsers, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Total Registered Aspirants', value: stats.totalStudents, icon: FaUserGraduate, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
    { label: 'PRO Subscribers', value: stats.premiumStudents, icon: FaCrown, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    { label: 'Total Question Bank', value: stats.totalQuestions, icon: FaBook, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Unused Voucher Codes', value: stats.unusedCodes, icon: FaKey, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { label: 'Total CBT Tests Taken', value: stats.totalMockSessions, icon: FaClock, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  ];

  return (
    <div className="space-y-8 select-none">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">System Performance & Insights</h1>
        <p className="text-gray-400 text-xs sm:text-sm mt-1">Real-time candidate engagement, test submissions, and license metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-[#141822] p-5 rounded-2xl border border-gray-800 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400">{c.label}</div>
                <div className={`text-2xl sm:text-3xl font-black mt-1.5 ${c.color}`}>
                  {loading ? '...' : c.value.toLocaleString()}
                </div>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border text-lg ${c.bg} ${c.color}`}>
                <Icon />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link 
          href="/admin/upload"
          className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 p-6 rounded-2xl flex items-center justify-between text-white shadow-lg shadow-orange-600/20 transition group"
        >
          <div>
            <div className="font-extrabold text-lg">Upload Questions</div>
            <div className="text-xs text-orange-100 mt-1">Bulk past questions via raw text, CSV, or formatted JSON</div>
          </div>
          <FaArrowRight className="text-xl group-hover:translate-x-1 transition" />
        </Link>

        <Link 
          href="/admin/codes"
          className="bg-[#141822] hover:bg-[#191f2c] border border-gray-800 p-6 rounded-2xl flex items-center justify-between text-white transition group"
        >
          <div>
            <div className="font-extrabold text-lg text-purple-400">Generate Access Vouchers</div>
            <div className="text-xs text-gray-400 mt-1">Create licensing codes for candidates activating via WhatsApp</div>
          </div>
          <FaArrowRight className="text-xl text-gray-400 group-hover:text-purple-400 group-hover:translate-x-1 transition" />
        </Link>
      </div>

      {/* Live Stream Table */}
      <div className="bg-[#141822] border border-gray-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white">Live Candidate Test Stream</h2>
          <Link href="/admin/students" className="text-xs text-orange-400 font-bold hover:underline">
            View All Candidates →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-gray-300 min-w-[600px]">
            <thead className="bg-[#0b0e14] text-[11px] uppercase font-bold text-gray-400 border-b border-gray-800">
              <tr>
                <th className="p-3.5 rounded-l-xl">Student</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Mode</th>
                <th className="p-3.5">Score</th>
                <th className="p-3.5">Time Spent</th>
                <th className="p-3.5 rounded-r-xl text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {loading && recentAttempts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FiLoader className="animate-spin text-orange-500 text-2xl" />
                      <span className="text-xs font-bold uppercase tracking-wider">Loading Live Candidate Activity...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                recentAttempts.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-800/20 transition">
                    <td className="p-3.5 font-bold text-white">{row.candidateName}</td>
                    <td className="p-3.5 text-xs text-gray-400">{row.candidateDepartment}</td>
                    <td className="p-3.5 capitalize text-xs text-orange-400 font-bold">{row.mode?.replace('_', ' ')}</td>
                    <td className="p-3.5 font-mono font-bold text-white">{row.score} / {row.total_questions}</td>
                    <td className="p-3.5 text-xs text-gray-400">{Math.floor((row.time_spent_seconds || 0) / 60)}m {(row.time_spent_seconds || 0) % 60}s</td>
                    <td className="p-3.5 text-xs text-gray-500 text-right">{new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))
              )}
              {recentAttempts.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">No test attempts logged yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminDashboardFallback() {
  return (
    <div className="h-[70vh] w-full flex flex-col items-center justify-center gap-3 text-gray-400">
      <FiLoader className="animate-spin text-orange-500 text-3xl" />
      <p className="text-xs font-bold uppercase tracking-widest">Loading Dashboard Insights...</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<AdminDashboardFallback />}>
      <AdminDashboardContent />
    </Suspense>
  );
}