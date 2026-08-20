'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../utils/supabase/client';
import { areResultsReleased } from '../../../utils/weeklyMockHelper';
import { 
  FaArrowLeft, 
  FaArrowRight, 
  FaCheck, 
  FaTimes, 
  FaExclamationCircle, 
  FaSpinner 
} from 'react-icons/fa';

export default function ReviewCorrectionsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadLatestReviewData() {
      try {
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) {
          router.push('/login');
          return;
        }

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
          console.error('Error fetching review session:', sessionErr);
          setErrorMessage(sessionErr.message);
          setLoading(false);
          return;
        }

        if (!sessionData) {
          setErrorMessage('No completed test records found for your account.');
          setLoading(false);
          return;
        }

        const isWeekly = sessionData.mode === 'weekly_challenge' || sessionData.mode === 'weekly_mock';
        const released = !isWeekly || (typeof areResultsReleased === 'function' 
          ? areResultsReleased(sessionData?.weekly_mocks?.active_date || sessionData.created_at) 
          : true);

        if (isWeekly && !released) {
          router.push('/practice/mock/result');
          return;
        }

        setSession(sessionData);

        // Load questions directly from the saved exam snapshot
        const payload = sessionData.answers_payload || {};
        if (payload.questions_snapshot && Array.isArray(payload.questions_snapshot) && payload.questions_snapshot.length > 0) {
          setQuestions(payload.questions_snapshot);
          setLoading(false);
          return;
        }

        // Fallback for older sessions without snapshot
        let fallbackQs = [];
        if (sessionData.mock_id) {
          const { data: mockQData } = await supabase
            .from('weekly_mock_questions')
            .select(`
              question_id,
              questions (
                id, 
                question_text, 
                option_a, 
                option_b, 
                option_c, 
                option_d, 
                correct_option, 
                explanation,
                subjects ( name, code )
              )
            `)
            .eq('mock_id', sessionData.mock_id);

          if (mockQData?.length > 0) {
            fallbackQs = mockQData.map((m) => ({
              ...m.questions,
              subject_name: m.questions?.subjects?.name || 'Subject Drill',
            })).filter(Boolean);
          }
        }

        setQuestions(fallbackQs);
      } catch (err) {
        console.error('Unexpected error loading review:', err);
        setErrorMessage('An unexpected error occurred while loading corrections.');
      } finally {
        setLoading(false);
      }
    }

    loadLatestReviewData();
  }, [router, supabase]);

  const answersPayload = useMemo(() => {
    const raw = session?.answers_payload || {};
    return raw.user_answers || raw;
  }, [session]);

  const reviewedQuestions = useMemo(() => {
    return questions.map((q, idx) => {
      const candidateAnswer = q.selected_option !== undefined ? q.selected_option : answersPayload[idx]?.trim().toUpperCase();
      const rightAnswer = q.correct_option?.trim().toUpperCase();
      const isCorrect = q.is_correct !== undefined ? q.is_correct : Boolean(candidateAnswer && rightAnswer && candidateAnswer === rightAnswer);
      
      return {
        ...q,
        candidateAnswer,
        rightAnswer,
        isCorrect,
      };
    });
  }, [questions, answersPayload]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] text-gray-400 flex flex-col items-center justify-center gap-3 select-none">
        <FaSpinner className="text-3xl text-orange-500 animate-spin" />
        <p className="text-xs font-bold uppercase tracking-wider text-gray-300">
          Loading Question Review...
        </p>
      </div>
    );
  }

  if (!session || reviewedQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-[#07090e] text-gray-300 flex flex-col items-center justify-center p-4 space-y-4 select-none">
        <p className="text-sm font-bold text-white">
          {errorMessage || 'No questions found for this session.'}
        </p>
        <Link 
          href="/practice/single" 
          className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const currentQ = reviewedQuestions[currentIndex] || reviewedQuestions[0];
  const isCurrentCorrect = currentQ.isCorrect;

  return (
    <div className="min-h-screen bg-[#07090e] text-gray-100 py-6 sm:py-10 px-3 sm:px-6 select-none selection:bg-orange-500 selection:text-white flex flex-col justify-between">
      <div className="max-w-4xl w-full mx-auto space-y-4">

        {/* Top Header */}
        <div className="bg-[#0e131d] border border-gray-800/80 p-3 sm:p-4 rounded-2xl flex items-center justify-between shadow-lg">
          <Link
            href="/practice/mock/result"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#151c28] hover:bg-[#1c2536] text-white text-xs font-bold transition border border-gray-700/60 cursor-pointer"
          >
            <FaArrowLeft className="text-[10px]" /> Back to Summary
          </Link>

          {isCurrentCorrect ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <FaCheck className="text-[10px]" /> Correct (1)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
              <FaTimes className="text-[10px]" /> Incorrect (0)
            </span>
          )}
        </div>

        {/* Question Card */}
        <div className="bg-[#0e131d] border border-gray-800/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-black flex items-center justify-center">
                {currentIndex + 1}
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-gray-200">
                {currentQ?.subject_name || currentQ?.subjects?.name || 'Subject Drill'}
              </span>
            </div>

            <span className="text-xs text-gray-500 font-medium">
              Question {currentIndex + 1} of {reviewedQuestions.length}
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
            {currentQ.question_text}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {['A', 'B', 'C', 'D'].map((opt) => {
              const optKey = `option_${opt.toLowerCase()}`;
              const optText = currentQ[optKey];
              if (!optText) return null;

              const isRight = currentQ.rightAnswer === opt;
              const isSelectedWrong = currentQ.candidateAnswer === opt && !isRight;

              let cardStyle = 'bg-[#121824] border-gray-800/80 text-gray-300';
              let badgeStyle = 'bg-[#1a2232] text-gray-400';

              if (isRight) {
                cardStyle = 'bg-[#062419] border-emerald-500/80 text-white shadow-lg shadow-emerald-950/40';
                badgeStyle = 'bg-[#0a4d33] text-emerald-300 font-black';
              } else if (isSelectedWrong) {
                cardStyle = 'bg-[#290e14] border-red-500/80 text-white shadow-lg shadow-red-950/40';
                badgeStyle = 'bg-[#52131e] text-red-300 font-black';
              }

              return (
                <div
                  key={opt}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition ${cardStyle}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 ${badgeStyle}`}>
                      {opt}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold truncate leading-snug">
                      {optText}
                    </span>
                  </div>

                  {isRight && (
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-xs">
                      <FaCheck />
                    </span>
                  )}
                  {isSelectedWrong && (
                    <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 text-xs">
                      <FaTimes />
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="bg-[#090d15] border border-gray-800/90 rounded-2xl p-4 sm:p-5 space-y-1.5">
            <div className="flex items-center gap-2 text-orange-500 font-black text-[11px] uppercase tracking-wider">
              <FaExclamationCircle className="text-xs" /> Explanation & Key Concept:
            </div>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              {currentQ.explanation || 'No step-by-step explanation was provided for this question.'}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="px-5 py-2.5 rounded-xl bg-[#121824] hover:bg-[#1a2333] disabled:opacity-30 border border-gray-800 text-gray-300 text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <FaArrowLeft className="text-[10px]" /> Previous
            </button>

            <button
              type="button"
              disabled={currentIndex === reviewedQuestions.length - 1}
              onClick={() => setCurrentIndex((prev) => Math.min(reviewedQuestions.length - 1, prev + 1))}
              className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-30 text-white text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-lg shadow-orange-600/30 disabled:cursor-not-allowed"
            >
              Next <FaArrowRight className="text-[10px]" />
            </button>
          </div>

        </div>

        {/* Bottom Question Palette */}
        <div className="bg-[#0e131d] border border-gray-800/80 rounded-3xl p-5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="uppercase tracking-wider text-gray-400">Question Palette</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Correct
              </span>
              <span className="flex items-center gap-1.5 text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-500" /> Wrong
              </span>
            </div>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {reviewedQuestions.map((q, idx) => {
              const isActive = currentIndex === idx;
              const isPass = q.isCorrect;

              let btnStyle = isPass
                ? 'bg-[#093222] border-emerald-500/40 text-emerald-400 hover:bg-emerald-600 hover:text-white'
                : 'bg-[#310f16] border-red-500/40 text-red-400 hover:bg-red-600 hover:text-white';

              if (isActive) {
                btnStyle = 'bg-orange-600 border-orange-500 text-white shadow-lg shadow-orange-600/40 ring-2 ring-orange-500';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-9 rounded-xl border text-xs font-mono font-bold transition flex items-center justify-center cursor-pointer ${btnStyle}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}