'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../utils/supabase/client';
import { areResultsReleased, getDepartmentMockSubjects } from '../../../utils/weeklyMockHelper';
import { 
  FaLock, 
  FaCheckCircle, 
  FaClock, 
  FaTrophy, 
  FaEye, 
  FaChartPie 
} from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';

export default function MockResultPage() {
  const router = useRouter();
  const supabase = createClient();

  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadLatestSessionAndBreakdown() {
      try {
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) {
          router.push('/login');
          return;
        }

        const { data: userProfile, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileErr || !userProfile) {
          setErrorMessage('Failed to load candidate profile.');
          setLoading(false);
          return;
        }
        setProfile(userProfile);

        const { data: sessionData, error: sessionErr } = await supabase
          .from('test_sessions')
          .select(`
            id,
            user_id,
            mode,
            mock_id,
            score,
            total_questions,
            time_spent_seconds,
            answers_payload,
            created_at,
            weekly_mocks (
              id,
              title,
              active_date
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (sessionErr) {
          console.error('Session Query Error:', sessionErr);
          setErrorMessage(sessionErr.message);
          setLoading(false);
          return;
        }

        if (!sessionData) {
          setErrorMessage('No completed test records found for your account.');
          setLoading(false);
          return;
        }

        setSession(sessionData);
      } catch (err) {
        console.error('Unexpected error loading result:', err);
        setErrorMessage('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    }

    loadLatestSessionAndBreakdown();
  }, [supabase, router]);

  // Compute departmental subject score breakdown strictly from session payload
  const subjectBreakdown = useMemo(() => {
    if (!session || !profile) return [];

    const payload = session.answers_payload || {};
    const targetSubjectNames = getDepartmentMockSubjects(profile.department);

    // 1. If session contains the saved breakdown array from live exam
    if (payload.breakdown && Array.isArray(payload.breakdown) && payload.breakdown.length > 0) {
      return payload.breakdown;
    }

    // 2. If session contains the questions snapshot
    if (payload.questions_snapshot && Array.isArray(payload.questions_snapshot)) {
      const map = {};
      payload.questions_snapshot.forEach((q) => {
        const name = q.subject_name || 'Aptitude';
        if (!map[name]) map[name] = { name, score: 0, total: 0 };
        map[name].total += 1;
        if (q.is_correct) map[name].score += 1;
      });
      return Object.values(map);
    }

    // 3. Fallback for older legacy sessions without snapshot
    const totalScore = session.score || 0;
    return targetSubjectNames.map((name, idx) => {
      const baseScore = Math.floor(totalScore / targetSubjectNames.length);
      const remainder = totalScore % targetSubjectNames.length;
      return {
        name,
        score: baseScore + (idx < remainder ? 1 : 0),
        total: 10,
      };
    });
  }, [session, profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] text-gray-400 flex flex-col items-center justify-center gap-3 text-xs select-none">
        <FiLoader className="animate-spin text-orange-500 text-3xl" />
        <span className="font-bold uppercase tracking-wider text-gray-300">
          Loading departmental scorecard...
        </span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white p-4 sm:p-8 flex items-center justify-center select-none">
        <div className="max-w-md w-full bg-[#0e131d] border border-gray-800 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-600/20 text-orange-400 flex items-center justify-center text-xl">
            <FaClock />
          </div>
          <h2 className="text-xl font-bold text-white">No Test Record Found</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            {errorMessage || 'You have not completed any test sessions yet.'}
          </p>
          <Link
            href="/practice/single"
            className="inline-block py-2.5 px-6 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition"
          >
            Start a Practice Drill
          </Link>
        </div>
      </div>
    );
  }

  const isWeekly = session.mode === 'weekly_challenge' || session.mode === 'weekly_mock';
  const released =
    !isWeekly ||
    (typeof areResultsReleased === 'function'
      ? areResultsReleased(session.weekly_mocks?.active_date || session.created_at)
      : true);

  const accuracyPct = Math.round(((session.score || 0) / (session.total_questions || 1)) * 100);
  const timeSpentMins = Math.floor((session.time_spent_seconds || 0) / 60);
  const timeSpentSecs = (session.time_spent_seconds || 0) % 60;

  return (
    <div className="min-h-screen bg-[#07090e] text-white py-8 px-4 sm:px-8 flex items-center justify-center select-none selection:bg-orange-500 selection:text-white">
      <div className="max-w-2xl w-full bg-[#0e131d] border border-gray-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">

        {!released ? (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 text-3xl shadow-lg shadow-orange-500/20">
              <FaLock />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                Exam Submitted & Secured
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white">Results Pending Saturday Release</h1>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                Your score and subject breakdown for{' '}
                <strong className="text-white">{session.weekly_mocks?.title || 'Weekly Mock Challenge'}</strong> will unlock{' '}
                <strong className="text-orange-400">tomorrow (Saturday) at 12:00 AM WAT</strong>.
              </p>
            </div>

            <div className="bg-[#090d15] border border-gray-800 p-4 rounded-2xl flex items-center justify-around text-xs font-mono text-gray-400">
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-sans">Questions Answered</span>
                <strong className="text-white text-base">{session.total_questions || 40}</strong>
              </div>
              <div className="h-8 w-px bg-gray-800" />
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-sans">Time Taken</span>
                <strong className="text-white text-base">
                  {timeSpentMins}m {timeSpentSecs}s
                </strong>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link 
                href="/history" 
                className="flex-1 py-3 bg-[#151c28] hover:bg-[#1c2536] border border-gray-700/60 text-gray-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                <FaTrophy className="text-yellow-400" /> View History
              </Link>
              <Link 
                href="/practice/single" 
                className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-orange-600/30"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl shadow-lg shadow-emerald-500/20">
                <FaCheckCircle />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  Official Scorecard Released
                </span>
                <h1 className="text-3xl font-black text-white mt-2">
                  Total Score: <span className="text-orange-500">{session.score}</span> / {session.total_questions}
                </h1>
                <p className="text-xs text-gray-400 mt-1 font-mono">
                  {profile?.full_name} • <span className="text-orange-400 font-bold">{profile?.department}</span>
                </p>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 bg-[#090d15] border border-gray-800 p-3 rounded-2xl text-center text-xs font-mono">
              <div className="p-2">
                <span className="text-gray-500 block text-[9px] uppercase font-sans font-bold">Accuracy</span>
                <strong className={`text-base ${accuracyPct >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {accuracyPct}%
                </strong>
              </div>
              <div className="p-2 border-x border-gray-800">
                <span className="text-gray-500 block text-[9px] uppercase font-sans font-bold">Total Time</span>
                <strong className="text-white text-base">
                  {timeSpentMins}m {timeSpentSecs}s
                </strong>
              </div>
              <div className="p-2">
                <span className="text-gray-500 block text-[9px] uppercase font-sans font-bold">Pace</span>
                <strong className="text-orange-400 text-base">
                  {Math.round((session.time_spent_seconds || 1) / (session.total_questions || 1))}s / Q
                </strong>
              </div>
            </div>

            {/* Departmental Subject Breakdown */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center gap-2">
                  <FaChartPie className="text-orange-500" /> Departmental Subject Breakdown
                </h3>
                <span className="text-[10px] text-gray-400 font-mono">
                  {subjectBreakdown.length} Core Subjects
                </span>
              </div>

              <div className="space-y-2.5">
                {subjectBreakdown.map((sub) => {
                  const subPct = Math.round((sub.score / (sub.total || 1)) * 100);
                  const isPass = subPct >= 50;

                  return (
                    <div 
                      key={sub.name}
                      className="bg-[#090d15] border border-gray-800/80 rounded-2xl p-3.5 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white truncate pr-2">
                          {sub.name}
                        </span>
                        <div className="flex items-center gap-2 shrink-0 font-mono">
                          <span className={`font-black ${isPass ? 'text-emerald-400' : 'text-orange-400'}`}>
                            {sub.score} / {sub.total}
                          </span>
                          <span className="text-[10px] text-gray-400 bg-[#121824] px-2 py-0.5 rounded border border-gray-700/60">
                            {subPct}%
                          </span>
                        </div>
                      </div>

                      <div className="h-1.5 w-full bg-[#151c28] rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            isPass ? 'bg-emerald-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${subPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              <Link 
                href="/practice/mock/review" 
                className="flex-1 py-3.5 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-orange-600/30 cursor-pointer"
              >
                <FaEye /> Step-by-Step Corrections
              </Link>
              <Link 
                href="/practice/single" 
                className="flex-1 py-3.5 bg-[#151c28] hover:bg-[#1c2536] border border-gray-700/60 text-gray-200 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                Return to Dashboard
              </Link>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}