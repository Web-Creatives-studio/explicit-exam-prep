'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '../../utils/supabase/client';
import { areResultsReleased } from '../../utils/weeklyMockHelper';
import { 
  FaArrowLeft, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaInfoCircle, 
  FaLock, 
  FaSpinner,
  FaBookOpen
} from 'react-icons/fa';

export default function ReviewCorrectionsPage() {
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

      // 1. Fetch the test session record
      const { data: sessionData, error: sessionErr } = await supabase
        .from('test_sessions')
        .select(`
          *,
          weekly_mocks ( active_date, title )
        `)
        .eq('id', sessionId)
        .single();

      if (sessionErr || !sessionData) {
        router.push('/practice/single');
        return;
      }

      // 2. Check if results are released (strictly Saturday onward for weekly mocks)
      const isWeekly = sessionData.mode === 'weekly_challenge';
      if (isWeekly && !areResultsReleased(sessionData?.weekly_mocks?.active_date)) {
        router.push(`/practice/mock/result?session_id=${sessionId}`);
        return;
      }

      setSession(sessionData);

      // 3. Fetch questions associated with this mock challenge
      if (sessionData.mock_id) {
        const { data: mockQData } = await supabase
          .from('weekly_mock_questions')
          .select(`
            questions (
              id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation,
              subjects ( name )
            )
          `)
          .eq('mock_id', sessionData.mock_id);

        if (mockQData) {
          setQuestions(mockQData.map((m) => m.questions).filter(Boolean));
        }
      }

      setLoading(false);
    }

    loadReviewData();
  }, [sessionId, router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0c10] text-gray-400 flex flex-col items-center justify-center gap-3 select-none">
        <FaSpinner className="text-3xl text-orange-500 animate-spin" />
        <p className="text-xs font-bold uppercase tracking-wider">Loading Exam Corrections...</p>
      </div>
    );
  }

  const answersPayload = session?.answers_payload || {};

  return (
    <div className="min-h-screen bg-[#0a0c10] text-gray-100 py-8 px-4 sm:px-8 select-none selection:bg-orange-500 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141822] border border-gray-800 p-5 rounded-3xl">
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
              {session?.weekly_mocks?.title || 'Weekly Mock Challenge'}
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
            const isCorrect = candidateAnswer && candidateAnswer === q.correct_option?.toUpperCase();

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

                {/* Question Body */}
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
                    const isRightAnswer = q.correct_option?.toUpperCase() === opt;

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
                            Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Block */}
                <div className="mt-4 p-4 bg-[#0b0e14] rounded-2xl border border-gray-800 space-y-1.5">
                  <div className="text-xs font-bold text-orange-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <FaInfoCircle /> Explanation:
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {q.explanation || 'No step-by-step explanation available for this question.'}
                  </p>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}