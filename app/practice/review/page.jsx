'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '../../utils/supabase/client';
import { areResultsReleased } from '../../utils/weeklyMockHelper';
import { 
  FaArrowLeft, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaInfoCircle, 
  FaSpinner,
  FaBookOpen,
  FaTrophy
} from 'react-icons/fa';

function ReviewCorrectionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const supabase = createClient();

  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviewData() {
      if (!sessionId) {
        router.push('/practice/single');
        return;
      }

      // 1. Fetch test session record from test_sessions with foreign key relation
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
        .eq('id', sessionId)
        .maybeSingle();

      if (sessionErr || !sessionData) {
        console.error('Error loading session for review:', sessionErr);
        router.push('/practice/single');
        return;
      }

      // 2. Lock check for weekly mock mode (Must be Saturday or released)
      const isWeekly = sessionData.mode === 'weekly_challenge' || sessionData.mode === 'weekly_mock';
      const released = !isWeekly || (typeof areResultsReleased === 'function' 
        ? areResultsReleased(sessionData?.weekly_mocks?.active_date || sessionData.created_at) 
        : true);

      if (isWeekly && !released) {
        router.push(`/practice/mock/result?session_id=${sessionId}`);
        return;
      }

      setSession(sessionData);

      // 3. Fetch questions linked via weekly_mock_questions if mock_id exists
      if (sessionData.mock_id) {
        const { data: mockQData, error: mockQErr } = await supabase
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
              subjects ( name )
            )
          `)
          .eq('mock_id', sessionData.mock_id);

        if (!mockQErr && mockQData?.length > 0) {
          setQuestions(mockQData.map((m) => m.questions).filter(Boolean));
        }
      }

      // Fallback: If no mock_id is attached or questions are empty, query question pool
      if (!sessionData.mock_id || questions.length === 0) {
        const { data: fallbackQs } = await supabase
          .from('questions')
          .select(`
            id, 
            question_text, 
            option_a, 
            option_b, 
            option_c, 
            option_d, 
            correct_option, 
            explanation,
            subjects ( name )
          `)
          .limit(sessionData.total_questions || 40);

        if (fallbackQs) setQuestions(fallbackQs);
      }

      setLoading(false);
    }

    loadReviewData();
  }, [sessionId, router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0c10] text-gray-400 flex flex-col items-center justify-center gap-3 select-none">
        <FaSpinner className="text-3xl text-orange-500 animate-spin" />
        <p className="text-xs font-bold uppercase tracking-wider text-gray-300">Loading Exam Corrections...</p>
      </div>
    );
  }

  const answersPayload = session?.answers_payload || {};

  return (
    <div className="min-h-screen bg-[#0a0c10] text-gray-100 py-8 px-4 sm:px-8 select-none selection:bg-orange-500 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141822] border border-gray-800 p-5 sm:p-6 rounded-3xl shadow-xl">
          <div>
            <Link 
              href={`/practice/mock/result?session_id=${session?.id}`}
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition mb-2"
            >
              <FaArrowLeft /> Back to Score Summary
            </Link>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <FaBookOpen className="text-orange-500" /> Exam Corrections & Explanations
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {session?.weekly_mocks?.title || (session?.mode === 'weekly_challenge' ? 'Weekly Mock Challenge' : 'Practice Drill Review')}
            </p>
          </div>

          <div className="bg-[#0b0e14] border border-gray-800 px-4 py-2.5 rounded-2xl flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-gray-500 block text-[10px] uppercase font-sans">Final Score</span>
              <strong className="text-orange-400 text-sm">{session?.score} / {session?.total_questions}</strong>
            </div>
            <div className="h-6 w-px bg-gray-800" />
            <div>
              <span className="text-gray-500 block text-[10px] uppercase font-sans">Accuracy</span>
              <strong className="text-emerald-400 text-sm">
                {Math.round(((session?.score || 0) / (session?.total_questions || 1)) * 100)}%
              </strong>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {questions.map((q, idx) => {
            const candidateAnswer = answersPayload[idx];
            const isCorrect = 
              candidateAnswer && 
              q.correct_option && 
              candidateAnswer.trim().toUpperCase() === q.correct_option.trim().toUpperCase();

            return (
              <div 
                key={q.id || idx} 
                className={`bg-[#141822] border rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl transition ${
                  isCorrect ? 'border-emerald-500/30' : 'border-red-500/20'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Question {idx + 1} of {questions.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 bg-[#0b0e14] border border-gray-800 px-2.5 py-0.5 rounded-md">
                      {q?.subjects?.name || 'General'}
                    </span>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                        <FaCheckCircle /> Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-md">
                        <FaTimesCircle /> Incorrect
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Text */}
                <div className="text-sm sm:text-base font-medium text-white leading-relaxed">
                  {q.question_text}
                </div>

                {/* Options Breakdown */}
                <div className="space-y-2 pt-1">
                  {['A', 'B', 'C', 'D'].map((opt) => {
                    const optKey = `option_${opt.toLowerCase()}`;
                    const optText = q[optKey];
                    if (!optText) return null;

                    const isChosen = candidateAnswer === opt;
                    const isRightAnswer = q.correct_option?.trim().toUpperCase() === opt;

                    let optionStyle = 'bg-[#0b0e14] border-gray-800 text-gray-300';
                    if (isRightAnswer) {
                      optionStyle = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold';
                    } else if (isChosen && !isRightAnswer) {
                      optionStyle = 'bg-red-500/10 border-red-500/40 text-red-300 line-through';
                    }

                    return (
                      <div
                        key={opt}
                        className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-center justify-between ${optionStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isRightAnswer
                              ? 'bg-emerald-600 text-white'
                              : isChosen
                              ? 'bg-red-600 text-white'
                              : 'bg-[#141822] text-gray-500'
                          }`}>
                            {opt}
                          </span>
                          <span>{optText}</span>
                        </div>

                        {isRightAnswer && (
                          <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                            Correct Answer
                          </span>
                        )}
                        {isChosen && !isRightAnswer && (
                          <span className="text-[10px] font-black uppercase text-red-400 bg-red-500/20 px-2 py-0.5 rounded border border-red-500/30">
                            Your Selection
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Step-by-Step Explanation Block */}
                <div className="mt-4 p-4 bg-[#0b0e14] rounded-2xl border border-gray-800 space-y-1.5">
                  <div className="text-xs font-bold text-orange-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <FaInfoCircle /> Step-by-Step Explanation:
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {q.explanation || 'No detailed explanation recorded for this question.'}
                  </p>
                </div>

              </div>
            );
          })}
        </div>

        {/* Bottom Floating Navigation */}
        <div className="flex justify-center pt-4">
          <Link
            href="/history"
            className="px-6 py-3 bg-[#141822] hover:bg-gray-800 border border-gray-800 text-gray-200 hover:text-white font-bold rounded-2xl text-xs flex items-center gap-2 transition shadow-lg shadow-black/40"
          >
            <FaTrophy className="text-yellow-400" /> Return to Performance History
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function ReviewCorrectionsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0c10] text-gray-400 flex flex-col items-center justify-center gap-3 select-none">
          <FaSpinner className="text-3xl text-orange-500 animate-spin" />
          <p className="text-xs font-bold uppercase tracking-wider">Loading Exam Corrections...</p>
        </div>
      }
    >
      <ReviewCorrectionsContent />
    </Suspense>
  );
}