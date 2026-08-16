'use client';

import { 
  FaClock, 
  FaArrowLeft, 
  FaArrowRight, 
  FaShieldAlt, 
  FaSignOutAlt, 
  FaKeyboard, 
  FaCrown 
} from 'react-icons/fa';
import FloatingCalculator from '../FloatingCalculator';

export default function QuickSessionDesk({
  profile,
  subject,
  questions = [],
  currentIndex,
  setCurrentIndex,
  answers = {},
  onSelectOption,
  timed,
  timeLeft,
  timeSpent,
  formatTime,
  progressPercent,
  answeredCount,
  totalQuestions,
  onOpenSubmitModal,
  onOpenQuitModal,
  onOpenPaywallModal,
  isPremium,
}) {
  const currentQ = questions[currentIndex];

  const handleNextClick = () => {
    // If user is on free tier and is at question index 4 (5th question), trigger paywall
    if (!isPremium && currentIndex >= 4) {
      onOpenPaywallModal();
      return;
    }

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onOpenSubmitModal();
    }
  };

  return (
    <div className="w-full space-y-4 select-none relative">
      {/* Top Bar */}
      <div className="bg-[#141822] border border-gray-800/90 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 sticky top-2 z-30 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600/15 border border-orange-500/30 flex items-center justify-center text-orange-400 font-black text-xs shrink-0">
            <FaShieldAlt className="text-base" />
          </div>
          <div>
            <div className="font-black text-white text-xs sm:text-sm leading-tight flex items-center gap-2">
              <span>{subject?.name} Drill</span>
              {!isPremium && (
                <span className="text-[10px] bg-orange-600/20 text-orange-400 px-2 py-0.5 rounded-md font-bold border border-orange-500/30">
                  Free Trial (5 Qs)
                </span>
              )}
            </div>
            <div className="text-[11px] text-gray-400 font-medium">
              Candidate: <span className="text-gray-200 font-semibold">{profile?.full_name?.split(' ')[0] || 'Aspirant'}</span>
            </div>
          </div>
        </div>

        {/* Actions & Clock */}
        <div className="flex items-center gap-2.5">
          <div
            className={`flex items-center gap-1.5 font-mono text-xs sm:text-sm font-black px-3.5 py-2 rounded-xl border ${
              timed && timeLeft < 120
                ? 'bg-red-500/10 text-red-400 border-red-500/40 animate-pulse'
                : 'bg-[#0b0e14] text-orange-400 border-gray-800'
            }`}
          >
            <FaClock className="text-xs" />
            {timed ? formatTime(timeLeft) : formatTime(timeSpent)}
          </div>

          <button
            type="button"
            onClick={onOpenQuitModal}
            className="p-2 sm:px-3 sm:py-2 bg-[#0b0e14] hover:bg-red-500/10 border border-gray-800 hover:border-red-500/30 text-gray-400 hover:text-red-400 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
          >
            <FaSignOutAlt className="text-xs" />
            <span className="hidden sm:inline">Quit</span>
          </button>

          <button
            type="button"
            onClick={onOpenSubmitModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition shadow-lg shadow-emerald-600/25 cursor-pointer"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#141822] rounded-full h-1.5 overflow-hidden border border-gray-800/80">
        <div
          className="bg-gradient-to-r from-orange-600 to-amber-500 h-full transition-all duration-300 ease-out rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-[#141822] border border-gray-800/90 rounded-3xl p-5 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-orange-600/20 text-orange-400 border border-orange-500/30 font-black text-xs flex items-center justify-center shrink-0">
              {currentIndex + 1}
            </span>
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
          </div>

          <span className="text-xs font-mono text-gray-400 bg-[#0b0e14] px-3 py-1 rounded-lg border border-gray-800">
            {answeredCount}/{totalQuestions} Answered
          </span>
        </div>

        {/* Stem */}
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
            <FaKeyboard /> Keyboard Shortcuts Enabled (A, B, C, D)
          </div>

          <button
            type="button"
            onClick={handleNextClick}
            className="flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition shadow-lg shadow-orange-600/20 cursor-pointer"
          >
            {!isPremium && currentIndex >= 4 ? (
              <>
                <FaCrown /> Unlock Next (PRO)
              </>
            ) : currentIndex < totalQuestions - 1 ? (
              <>
                Next <FaArrowRight />
              </>
            ) : (
              'Finish Drill'
            )}
          </button>
        </div>
      </div>

      {/* Palette Matrix */}
      <div className="bg-[#141822] border border-gray-800/90 rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase">
          <span>Question Palette</span>
          {!isPremium && (
            <span className="text-[10px] text-orange-400 font-bold">
              Questions 6+ locked on Free Pass
            </span>
          )}
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {questions.map((_, i) => {
            const isCurrent = currentIndex === i;
            const isAnswered = answers[i] !== undefined;
            const isLocked = !isPremium && i >= 5;

            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (isLocked) {
                    onOpenPaywallModal();
                  } else {
                    setCurrentIndex(i);
                  }
                }}
                className={`h-9 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                  isCurrent
                    ? 'bg-orange-600 text-white ring-2 ring-orange-400 shadow-md shadow-orange-600/30'
                    : isLocked
                    ? 'bg-[#0b0e14]/50 border border-gray-800/50 text-gray-600 cursor-not-allowed'
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

      {/* Floating Calculator */}
      <FloatingCalculator />
    </div>
  );
}