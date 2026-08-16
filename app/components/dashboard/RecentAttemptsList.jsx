'use client';

import { FaHistory } from 'react-icons/fa';

export default function RecentAttemptsList({ recentSessions = [] }) {
  return (
    <div className="bg-[#141822] rounded-3xl border border-gray-800 p-6 sm:p-8 space-y-4 shadow-xl select-none">
      <h3 className="font-black text-white text-sm uppercase tracking-wider flex items-center gap-2">
        <FaHistory className="text-gray-500" /> Recent Test Attempts
      </h3>

      {recentSessions.length > 0 ? (
        <div className="divide-y divide-gray-800/80">
          {recentSessions.map((session) => (
            <div key={session.id} className="py-3.5 flex items-center justify-between text-xs hover:bg-gray-800/20 px-2 rounded-xl transition">
              <div>
                <span className="font-bold text-white capitalize text-sm">
                  {session.mode?.replace('_', ' ')}
                </span>
                <span className="text-gray-500 ml-2">
                  {new Date(session.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-gray-400">
                  ⏱ {Math.floor(session.time_spent_seconds / 60)}m {session.time_spent_seconds % 60}s
                </span>
                <span className="font-mono font-black text-sm text-orange-400 bg-orange-500/10 px-3 py-1 rounded-xl border border-orange-500/20">
                  {session.score} / {session.total_questions}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-gray-500 py-6 text-center">
          No past attempts recorded yet. Start a quick test or mock challenge above.
        </div>
      )}
    </div>
  );
}