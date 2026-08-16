'use client';

import { useState } from 'react';
import { 
  FaArrowLeft, 
  FaArrowRight, 
  FaCheck, 
  FaTimes, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaInfoCircle, 
  FaArrowAltCircleLeft 
} from 'react-icons/fa';

export default function QuickSessionReview({
  subject,
  questions = [],
  answers = {},
  onBackToSummary,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const reviewQ = questions[currentIndex];
  const userAnswer = answers[currentIndex];
  const isCorrect = userAnswer === reviewQ?.correct_option;

  return (
    <div className="w-full space-y-4 select-none">
      {/* Top Bar */}
      <div className="bg-[#141822] border border-gray-800 rounded-2xl p-4 flex items-center justify-between shadow-md">
        <button
          onClick={onBackToSummary}
          className="flex items-center gap-2 bg-[#0b0e14] hover:bg-gray-800 border border-gray-800 text-gray-300 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
        >
          <FaArrowAltCircleLeft /> Back to Summary
        </button>

        <div className="flex items-center gap-2">
          {isCorrect ? (
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-3 py-1.5 rounded-xl">
              <FaCheck /> Correct (+1)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold px-3 py-1.5 rounded-xl">
              <FaTimes /> Incorrect (0)
            </span>
          )}
        </div>
      </div>

      {/* Single Question Card */}
      <div className="bg-[#141822] border border-gray-800 rounded-3xl p-5 sm:p-7 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-orange-600/20 text-orange-400 border border-orange-500/30 font-black text-xs flex items-center justify-center">
              {currentIndex + 1}
            </span>
            <span className="text-xs font-bold text-gray-300 uppercase">
              {subject?.name}
            </span>
          </div>
          <span className="text-xs font-mono text-gray-500">
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>

        <div className="text-base sm:text-lg font-semibold text-gray-100 leading-relaxed break-words min-h-[50px]">
          {reviewQ?.question_text}
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {['A', 'B', 'C', 'D'].map((opt) => {
            const optText = reviewQ?.[`option_${opt.toLowerCase()}`];
            const isPicked = userAnswer === opt;
            const isCorrectOption = reviewQ?.correct_option === opt;

            let cardStyle = 'border-gray-800 bg-[#0b0e14] text-gray-400';
            let icon = null;

            if (isCorrectOption) {
              cardStyle = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300 font-semibold';
              icon = <FaCheckCircle className="text-emerald-400 text-base shrink-0 ml-auto" />;
            } else if (isPicked && !isCorrect) {
              cardStyle = 'border-red-500/50 bg-red-500/10 text-red-300 font-semibold';
              icon = <FaTimesCircle className="text-red-400 text-base shrink-0 ml-auto" />;
            }

            return (
              <div
                key={opt}
                className={`p-3.5 sm:p-4 rounded-2xl border text-xs sm:text-sm flex items-center gap-3 transition ${cardStyle}`}
              >
                <span
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                    isCorrectOption
                      ? 'bg-emerald-500 text-white'
                      : isPicked
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {opt}
                </span>
                <span className="flex-1 break-words leading-relaxed">{optText}</span>
                {icon}
              </div>
            );
          })}
        </div>

        {/* Explanation */}
        {reviewQ?.explanation ? (
          <div className="p-4 bg-[#0b0e14] rounded-2xl border border-gray-800/80 space-y-1">
            <div className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
              <FaInfoCircle /> Explanation & Key Concept:
            </div>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed break-words">
              {reviewQ.explanation}
            </p>
          </div>
        ) : (
          <div className="p-3 bg-[#0b0e14] rounded-2xl border border-gray-800/80 text-xs text-gray-500">
            Correct answer is <strong className="text-emerald-400">Option {reviewQ?.correct_option}</strong>.
          </div>
        )}

        {/* Nav Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-800">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => prev - 1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-800 bg-[#0b0e14] text-gray-300 hover:text-white disabled:opacity-30 text-xs font-bold transition cursor-pointer"
          >
            <FaArrowLeft /> Previous
          </button>

          <button
            disabled={currentIndex === questions.length - 1}
            onClick={() => setCurrentIndex((prev) => prev + 1)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-30 text-white text-xs font-bold transition shadow-md shadow-orange-600/20 cursor-pointer"
          >
            Next <FaArrowRight />
          </button>
        </div>
      </div>

      {/* Palette */}
      <div className="bg-[#141822] border border-gray-800 rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase">
          <span>Question Palette</span>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" /> Correct
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-red-500 inline-block" /> Wrong
            </span>
          </div>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {questions.map((q, i) => {
            const isCurr = currentIndex === i;
            const qCorrect = answers[i] === q.correct_option;

            return (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-9 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                  isCurr
                    ? 'ring-2 ring-orange-400 bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                    : qCorrect
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}