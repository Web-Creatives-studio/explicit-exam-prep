'use client';

import { useState, useEffect } from 'react';
import { 
  FaClock, 
  FaArrowLeft, 
  FaArrowRight, 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaTimes, 
  FaQuestionCircle, 
  FaSignOutAlt, 
  FaShieldAlt,
  FaKeyboard
} from 'react-icons/fa';
import FloatingCalculator from './FloatingCalculator';

export default function MockTestDesk({
  profile,
  examQuestions = [],
  currentIndex,
  setCurrentIndex,
  answers = {},
  onSelectOption,
  subjectsInExam = [],
  currentQ,
  timeLeft,
  formatTime,
  onSubmitExam
}) {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = examQuestions.length;
  const unansweredCount = totalQuestions - answeredCount;
  const progressPercent = Math.round((answeredCount / (totalQuestions || 1)) * 100);

  // Keyboard Shortcuts (A, B, C, D, ArrowLeft, ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showSubmitModal || showQuitModal) return;

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key)) {
        onSelectOption(key);
      } else if (e.key === 'n' || e.key === 'PageDown') {
        if (currentIndex < totalQuestions - 1) {
          setCurrentIndex((prev) => prev + 1);
        }
      } else if (e.key === 'p' || e.key === 'PageUp') {
        if (currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, totalQuestions, onSelectOption, setCurrentIndex, showSubmitModal, showQuitModal]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 px-2 sm:px-4 relative select-none">
      
      {/* ------------------------------------------------------------- */}
      {/* SECURE EXAM TOP BAR */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#141822] border border-gray-800/90 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 sticky top-2 z-30 shadow-2xl backdrop-blur-md">
        
        {/* Left: Identity Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600/15 border border-orange-500/30 flex items-center justify-center text-orange-400 font-black text-xs shrink-0">
            <FaShieldAlt className="text-base" />
          </div>
          <div>
            <div className="font-black text-white text-xs sm:text-sm leading-tight flex items-center gap-2">
              <span>OAU CBT Secure Exam</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-[11px] text-gray-400 font-medium">
              Candidate: <span className="text-gray-200 font-semibold">{profile?.full_name?.split(' ')[0] || 'Aspirant'}</span>
            </div>
          </div>
        </div>

        {/* Center: Subject Selection Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full order-3 sm:order-2 no-scrollbar py-0.5">
          {subjectsInExam.map((sub) => {
            const isTabActive = currentQ?.subject_name === sub;
            return (
              <button
                key={sub}
                type="button"
                onClick={() => {
                  const firstIdx = examQuestions.findIndex((q) => q.subject_name === sub);
                  if (firstIdx !== -1) setCurrentIndex(firstIdx);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer ${
                  isTabActive
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                    : 'bg-[#0b0e14] text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                {sub}
              </button>
            );
          })}
        </div>

        {/* Right: Clock & Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 ml-auto order-2 sm:order-3">
          <div
            className={`flex items-center gap-1.5 font-mono text-xs sm:text-sm font-black px-3.5 py-2 rounded-xl border ${
              timeLeft < 300
                ? 'bg-red-500/10 text-red-400 border-red-500/40 animate-pulse'
                : 'bg-[#0b0e14] text-orange-400 border-gray-800'
            }`}
          >
            <FaClock className="text-xs" />
            {formatTime(timeLeft)}
          </div>

          <button
            type="button"
            onClick={() => setShowQuitModal(true)}
            className="p-2 sm:px-3 sm:py-2 bg-[#0b0e14] hover:bg-red-500/10 border border-gray-800 hover:border-red-500/30 text-gray-400 hover:text-red-400 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
            title="Abandon Exam"
          >
            <FaSignOutAlt className="text-xs" />
            <span className="hidden sm:inline">Quit</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition shadow-lg shadow-emerald-600/25 cursor-pointer"
          >
            Submit
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* EXAM PROGRESS BAR */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full bg-[#141822] rounded-full h-1.5 overflow-hidden border border-gray-800/80">
        <div 
          className="bg-gradient-to-r from-orange-600 to-amber-500 h-full transition-all duration-300 ease-out rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MAIN ACTIVE QUESTION CARD */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#141822] border border-gray-800/90 rounded-3xl p-5 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-800/80 pb-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-9 h-9 rounded-xl bg-orange-600/20 text-orange-400 border border-orange-500/30 font-black text-xs flex items-center justify-center shrink-0 shadow-inner">
              {currentIndex + 1}
            </span>
            <div>
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wide truncate block">
                {currentQ?.subject_name}
              </span>
              <span className="text-[10px] text-gray-500 hidden sm:block">
                Use Keys A, B, C, D to answer & Arrows to navigate
              </span>
            </div>
          </div>
          
          <span className="text-xs font-mono text-gray-400 bg-[#0b0e14] px-3 py-1 rounded-lg border border-gray-800 shrink-0 ml-2">
            {answeredCount}/{totalQuestions} Answered
          </span>
        </div>

        {/* Question Prompt */}
        <div className="text-base sm:text-lg font-semibold text-gray-100 leading-relaxed min-h-[60px] break-words">
          {currentQ?.question_text}
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 gap-3">
          {['A', 'B', 'C', 'D'].map((opt) => {
            const isSelected = answers[currentIndex] === opt;
            const optText = currentQ?.[`option_${opt.toLowerCase()}`];

            return (
              <button
                key={opt}
                type="button"
                onClick={() => onSelectOption(opt)}
                className={`flex items-center p-4 rounded-2xl border text-left transition duration-150 cursor-pointer ${
                  isSelected
                    ? 'border-orange-500 bg-orange-600/15 text-white ring-1 ring-orange-500/40 shadow-md shadow-orange-600/10'
                    : 'border-gray-800/80 bg-[#0b0e14] text-gray-300 hover:border-gray-700 hover:bg-[#10141d]'
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black mr-3.5 transition shrink-0 ${
                    isSelected
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-600/40'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {opt}
                </span>
                <span className="text-xs sm:text-sm font-medium break-words flex-1 leading-relaxed">
                  {optText}
                </span>
              </button>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => prev - 1)}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl border border-gray-800 bg-[#0b0e14] text-gray-300 hover:text-white disabled:opacity-30 text-xs font-bold transition cursor-pointer"
          >
            <FaArrowLeft /> Prev
          </button>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-gray-500">
            <FaKeyboard /> Keyboard Shortcuts Enabled
          </div>

          {currentIndex < totalQuestions - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              className="flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition shadow-lg shadow-orange-600/20 cursor-pointer"
            >
              Next <FaArrowRight />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="px-5 sm:px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              Finish Exam
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* QUESTION PALETTE */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#141822] border border-gray-800/90 rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Question Palette ({totalQuestions} Questions)
          </span>
          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-orange-600 inline-block" /> Current
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-600 inline-block" /> Answered
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#0b0e14] border border-gray-700 inline-block" /> Unanswered
            </span>
          </div>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-20 gap-2">
          {examQuestions.map((_, i) => {
            const isCurrent = currentIndex === i;
            const isAnswered = answers[i] !== undefined;

            return (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentIndex(i)}
                className={`h-9 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                  isCurrent
                    ? 'bg-orange-600 text-white ring-2 ring-orange-400 shadow-md shadow-orange-600/30'
                    : isAnswered
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-[#0b0e14] text-gray-400 hover:bg-gray-800 border border-gray-800'
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. SUBMISSION CONFIRMATION MODAL */}
      {/* ------------------------------------------------------------- */}
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
              <h3 className="text-2xl font-black tracking-tight">Submit Examination?</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Review your session statistics below before committing to your final grade.
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
                <div className="text-[10px] font-bold text-gray-500 uppercase">Time Left</div>
                <div className="text-xl font-black text-orange-400 mt-0.5 font-mono">{formatTime(timeLeft)}</div>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-2.5 text-xs text-amber-300">
                <FaExclamationTriangle className="text-amber-400 text-sm shrink-0 mt-0.5" />
                <span>
                  You still have <strong className="text-white">{unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''}</strong>.
                </span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3 bg-[#0b0e14] hover:bg-gray-800 border border-gray-800 text-gray-300 font-bold rounded-xl transition text-xs cursor-pointer"
              >
                Return to Exam
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSubmitModal(false);
                  onSubmitExam();
                }}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition shadow-lg shadow-emerald-600/25 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FaCheckCircle /> Yes, Submit Final
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. QUIT / EXIT EXAM WARNING MODAL */}
      {/* ------------------------------------------------------------- */}
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
              <h3 className="text-2xl font-black tracking-tight text-white">Exit Active Exam?</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Leaving this page will forfeit your current test attempt and any unsaved progress.
              </p>
            </div>

            <div className="p-4 bg-[#0b0e14] rounded-2xl border border-gray-800 text-xs text-gray-300 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Current Progress:</span>
                <span className="font-bold text-white">{answeredCount} of {totalQuestions} questions</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Time Remaining:</span>
                <span className="font-mono font-bold text-orange-400">{formatTime(timeLeft)}</span>
              </div>
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
                <FaSignOutAlt /> Abandon Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating CBT Calculator */}
      <FloatingCalculator />
    </div>
  );
}