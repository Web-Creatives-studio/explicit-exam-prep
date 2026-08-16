'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '../../utils/supabase/client';
import confetti from 'canvas-confetti';
import { toast } from 'react-toastify';
import { 
  FaTimes, 
  FaQuestionCircle, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaSignOutAlt, 
  FaBookOpen 
} from 'react-icons/fa';

import QuickSessionDesk from '../../components/session/QuickSessionDesk';
import QuickSessionSummary from '../../components/session/QuickSessionSummary';
import QuickSessionReview from '../../components/session/QuickSessionReview';
import PremiumPaywallModal from '../../components/session/PremiumPaywallModal';

export default function QuickSessionClient({
  profile,
  subject,
  questions = [],
  timed = true,
  questionCount = 10,
}) {
  const supabase = createClient();
  const isPremium = Boolean(profile?.is_premium);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [showReviewMode, setShowReviewMode] = useState(false);

  // Modals
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);

  // Timer
  const TOTAL_TIME_SECONDS = timed ? questions.length * 60 : 0;
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME_SECONDS);
  const [timeSpent, setTimeSpent] = useState(0);

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const unansweredCount = totalQuestions - answeredCount;
  const progressPercent = Math.round((answeredCount / (totalQuestions || 1)) * 100);

  // Active Session Browser Lock
  const isSessionActive = !isSubmitted && questions.length > 0;

  useEffect(() => {
    if (!isSessionActive) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Active practice drill in progress.';
      return e.returnValue;
    };

    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
      setShowQuitModal(true);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isSessionActive]);

  // Submission handler
  const finishSession = useCallback(async () => {
    let totalScore = 0;

    questions.forEach((q, idx) => {
      if (answers[idx] === q.correct_option) {
        totalScore += 1;
      }
    });

    const elapsed = timed ? TOTAL_TIME_SECONDS - timeLeft : timeSpent;
    const percentage = Math.round((totalScore / (questions.length || 1)) * 100);

    setIsSubmitted(true);
    setResults({
      score: totalScore,
      total: questions.length,
      percentage,
      timeSpent: elapsed,
    });

    if (percentage >= 60) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }

    if (profile?.id) {
      await supabase.from('mock_sessions').insert({
        user_id: profile.id,
        mode: 'single_subject',
        score: totalScore,
        total_questions: questions.length,
        time_spent_seconds: elapsed,
      });
    }
  }, [questions, answers, timed, TOTAL_TIME_SECONDS, timeLeft, timeSpent, profile, supabase]);

  // Timer Tick
  useEffect(() => {
    if (!isSessionActive) return;

    const timer = setInterval(() => {
      if (timed) {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            toast.warn('Time elapsed! Submitting session...');
            finishSession();
            return 0;
          }
          return prev - 1;
        });
      } else {
        setTimeSpent((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isSessionActive, timed, finishSession]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 1. Empty state
  if (questions.length === 0) {
    return (
      <div className="bg-[#141822] border border-gray-800 rounded-3xl p-8 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-orange-600/20 text-orange-400 flex items-center justify-center text-xl mx-auto">
          <FaBookOpen />
        </div>
        <h2 className="text-xl font-bold text-white">No Questions Found</h2>
        <p className="text-xs text-gray-400 leading-relaxed">
          There are currently no active questions uploaded for <strong>{subject?.name}</strong>.
        </p>
        <Link
          href="/practice/single"
          className="inline-block py-2.5 px-6 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // 2. Corrections & Solutions Desk
  if (isSubmitted && showReviewMode && results) {
    return (
      <QuickSessionReview
        subject={subject}
        questions={questions}
        answers={answers}
        onBackToSummary={() => setShowReviewMode(false)}
      />
    );
  }

  // 3. Post-Drill Summary
  if (isSubmitted && results) {
    return (
      <QuickSessionSummary
        subject={subject}
        questions={questions}
        results={results}
        onLaunchReview={() => setShowReviewMode(true)}
      />
    );
  }

  // 4. Live Practice Session Floor
  return (
    <>
      <QuickSessionDesk
        profile={profile}
        subject={subject}
        questions={questions}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
        answers={answers}
        onSelectOption={(opt) => setAnswers({ ...answers, [currentIndex]: opt })}
        timed={timed}
        timeLeft={timeLeft}
        timeSpent={timeSpent}
        formatTime={formatTime}
        progressPercent={progressPercent}
        answeredCount={answeredCount}
        totalQuestions={totalQuestions}
        onOpenSubmitModal={() => setShowSubmitModal(true)}
        onOpenQuitModal={() => setShowQuitModal(true)}
        onOpenPaywallModal={() => setShowPaywallModal(true)}
        isPremium={isPremium}
      />

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141822] border border-gray-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl text-white relative animate-in fade-in zoom-in duration-200">
            <button
              type="button"
              onClick={() => setShowSubmitModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition cursor-pointer"
            >
              <FaTimes />
            </button>

            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400 text-2xl">
                <FaQuestionCircle />
              </div>
              <h3 className="text-2xl font-black tracking-tight">Submit Drill?</h3>
              <p className="text-xs text-gray-400">
                You are about to complete your practice drill for {subject?.name}.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 bg-[#0b0e14] p-4 rounded-2xl border border-gray-800 text-center">
              <div>
                <div className="text-[10px] font-bold text-gray-500 uppercase">Answered</div>
                <div className="text-xl font-black text-emerald-400 mt-0.5">{answeredCount}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-500 uppercase">Unanswered</div>
                <div className={`text-xl font-black mt-0.5 ${unansweredCount > 0 ? 'text-amber-400' : 'text-gray-400'}`}>
                  {unansweredCount}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-500 uppercase">Time</div>
                <div className="text-xl font-black text-orange-400 mt-0.5 font-mono">
                  {timed ? formatTime(timeLeft) : formatTime(timeSpent)}
                </div>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-2.5 text-xs text-amber-300">
                <FaExclamationTriangle className="text-amber-400 text-sm shrink-0 mt-0.5" />
                <span>
                  You have <strong className="text-white">{unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''}</strong> remaining.
                </span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3 bg-[#0b0e14] hover:bg-gray-800 border border-gray-800 text-gray-300 font-bold rounded-xl transition text-xs cursor-pointer"
              >
                Return
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSubmitModal(false);
                  finishSession();
                }}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition shadow-lg shadow-emerald-600/25 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FaCheckCircle /> Submit Final
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quit Modal */}
      {showQuitModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141822] border border-red-500/30 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl text-white relative animate-in fade-in zoom-in duration-200">
            <button
              type="button"
              onClick={() => setShowQuitModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition cursor-pointer"
            >
              <FaTimes />
            </button>

            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 text-2xl">
                <FaExclamationTriangle />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-white">Exit Practice Drill?</h3>
              <p className="text-xs text-gray-400">
                Leaving now will discard your current attempt for {subject?.name}.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowQuitModal(false)}
                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition text-xs cursor-pointer"
              >
                Keep Practicing
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/practice/single';
                }}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl transition shadow-lg shadow-red-600/25 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FaSignOutAlt /> Abandon Drill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paywall Modal */}
      <PremiumPaywallModal
        isOpen={showPaywallModal}
        onClose={() => setShowPaywallModal(false)}
        profile={profile}
        subjectName={subject?.name}
      />
    </>
  );
}