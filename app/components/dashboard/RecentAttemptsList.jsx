'use client';

import { FaHistory } from 'react-icons/fa';

export default function RecentAttemptsList({ recentSessions = [] }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 space-y-4 shadow-sm">
      <h3 className="font-black text-gray-900 text-sm uppercase tracking-wider flex items-center gap-2">
        <FaHistory className="text-gray-400" /> Recent Test Attempts
      </h3>

      {recentSessions.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {recentSessions.map((session) => (
            <div key={session.id} className="py-3.5 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-gray-900 capitalize text-sm">
                  {session.mode.replace('_', ' ')}
                </span>
                <span className="text-gray-400 ml-2">
                  {new Date(session.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-gray-500">
                  ⏱ {Math.floor(session.time_spent_seconds / 60)}m {session.time_spent_seconds % 60}s
                </span>
                <span className="font-black text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-xl border border-orange-100">
                  {session.score} / {session.total_questions}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-gray-400 py-6 text-center">
          No past attempts recorded yet. Start a quick test or mock challenge above.
        </div>
      )}
    </div>
  );
}