'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '../../../utils/supabase/client';
import { areResultsReleased } from '../../../utils/weeklyMockHelper';
import { FaLock, FaCheckCircle, FaClock, FaTrophy, FaArrowLeft, FaEye } from 'react-icons/fa';

export default function MockResultPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const supabase = createClient();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      if (!sessionId) return;
      const { data } = await supabase
        .from('test_sessions')
        .select(`
          *,
          weekly_mocks ( active_date, title )
        `)
        .eq('id', sessionId)
        .single();

      setSession(data);
      setLoading(false);
    }
    loadSession();
  }, [sessionId, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0c10] text-gray-400 flex items-center justify-center text-xs select-none">
        Loading test submission record...
      </div>
    );
  }

  const isWeekly = session?.mode === 'weekly_challenge';
  const released = !isWeekly || areResultsReleased(session?.weekly_mocks?.active_date);

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white p-4 sm:p-8 flex items-center justify-center select-none">
      <div className="max-w-xl w-full bg-[#141822] border border-gray-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-6">
        
        {/* Results Locked on Friday */}
        {!released ? (
          <>
            <div className="w-16 h-16 mx-auto rounded-3xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 text-3xl shadow-lg shadow-orange-500/20">
              <FaLock />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                Exam Submitted & Recorded
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white">Results Pending Saturday Release</h1>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                To maintain competitive integrity during the Friday test window, your score and detailed corrections for the <strong>{session?.weekly_mocks?.title || 'Weekly Mock'}</strong> will unlock <strong>tomorrow (Saturday) at 12:00 AM WAT</strong>.
              </p>
            </div>

            <div className="bg-[#0b0e14] border border-gray-800 p-4 rounded-2xl flex items-center justify-around text-xs font-mono text-gray-400">
              <div>
                <span className="text-gray-600 block text-[10px] uppercase font-sans">Questions Answered</span>
                <strong className="text-white text-base">{session?.total_questions || 40}</strong>
              </div>
              <div className="h-8 w-px bg-gray-800" />
              <div>
                <span className="text-gray-600 block text-[10px] uppercase font-sans">Duration</span>
                <strong className="text-white text-base">
                  {Math.floor(session?.time_spent_seconds / 60)}m {session?.time_spent_seconds % 60}s
                </strong>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link 
                href="/practice/leaderboard" 
                className="flex-1 py-3 bg-[#0f1117] hover:bg-gray-800 border border-gray-800 text-gray-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                <FaTrophy className="text-yellow-400" /> View Leaderboard
              </Link>
              <Link 
                href="/practice/single" 
                className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-orange-600/30"
              >
                Back to Dashboard
              </Link>
            </div>
          </>
        ) : (
          /* Results Unlocked on Saturday */
          <>
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-3xl shadow-lg shadow-emerald-500/20">
              <FaCheckCircle />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Official Result Released
              </span>
              <h1 className="text-3xl font-black text-white mt-2">
                Score: <span className="text-orange-500">{session?.score}</span> / {session?.total_questions}
              </h1>
              <p className="text-xs text-gray-400">Corrections and explanations are now fully unlocked.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link 
                href={`/practice/review?session_id=${session?.id}`} 
                className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-orange-600/30"
              >
                <FaEye /> Review Explanations
              </Link>
              <Link 
                href="/practice/leaderboard" 
                className="flex-1 py-3 bg-[#0f1117] hover:bg-gray-800 border border-gray-800 text-gray-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                <FaTrophy className="text-yellow-400" /> Check Nationwide Rank
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
}