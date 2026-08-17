'use client';

import { FaHistory, FaBookOpen, FaLayerGroup, FaCalendarAlt, FaClock } from 'react-icons/fa';

export default function RecentAttemptsList({ recentSessions = [] }) {
  // Helper to format mode label and subject display
  const getSessionLabel = (session) => {
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
    if (session.mode === 'weekly_mock' || session.mode === 'weekly_challenge') {
      return {
        title: 'Weekly Nationwide Challenge',
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

  return (
    <div className="bg-[#141822] rounded-3xl border border-gray-800 p-6 sm:p-8 space-y-4 shadow-xl select-none">
      <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
        <h3 className="font-black text-white text-sm uppercase tracking-wider flex items-center gap-2">
          <FaHistory className="text-orange-500" /> Recent Test Attempts
        </h3>
        <span className="text-[11px] font-mono text-gray-500">
          Showing last {recentSessions.length} sessions
        </span>
      </div>

      {recentSessions.length > 0 ? (
        <div className="divide-y divide-gray-800/60">
          {recentSessions.map((session) => {
            const { title, badge, badgeColor, icon } = getSessionLabel(session);
            const percentage = Math.round(
              ((session.score || 0) / (session.total_questions || 1)) * 100
            );

            return (
              <div 
                key={session.id} 
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-[#161b26] px-3 rounded-2xl transition"
              >
                {/* Left Side: Subject / Mode Title & Date */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-sm">
                      {title}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${badgeColor}`}>
                      {icon} {badge}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 flex items-center gap-2">
                    <span>
                      {new Date(session.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono text-gray-400">
                      <FaClock className="text-[10px]" />
                      {Math.floor(session.time_spent_seconds / 60)}m {session.time_spent_seconds % 60}s
                    </span>
                  </div>
                </div>

                {/* Right Side: Score & Percentage Pills */}
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-xs font-bold px-2.5 py-1 rounded-lg ${
                    percentage >= 60 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-gray-800 text-gray-400 border border-gray-700'
                  }`}>
                    {percentage}%
                  </span>

                  <span className="font-mono font-black text-sm text-orange-400 bg-orange-500/10 px-3.5 py-1.5 rounded-xl border border-orange-500/20 shadow-sm">
                    {session.score} / {session.total_questions}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-xs text-gray-500 py-8 text-center space-y-1">
          <p className="font-medium text-gray-400">No test attempts recorded yet.</p>
          <p className="text-[11px]">Start a quick subject drill or take a full mock exam above to see your history here.</p>
        </div>
      )}
    </div>
  );
}