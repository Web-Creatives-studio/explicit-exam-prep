'use client';

import { FaSlidersH, FaTimes, FaClock } from 'react-icons/fa';

export default function QuickTestModal({
  isOpen,
  onClose,
  selectedSubject,
  quickQuestionCount,
  setQuickQuestionCount,
  quickTimed,
  setQuickTimed,
  onLaunchQuickTest,
}) {
  if (!isOpen || !selectedSubject) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#161922] border border-gray-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl text-white relative animate-in fade-in zoom-in duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white transition cursor-pointer"
        >
          <FaTimes />
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-orange-500 font-black text-xs uppercase tracking-wider">
            <FaSlidersH /> Quick Single Drill
          </div>
          <h2 className="text-2xl font-black">{selectedSubject.name}</h2>
          <p className="text-xs text-gray-400">Configure your single-subject training drill parameters.</p>
        </div>

        {/* Question Count Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase">Number of Questions</label>
          <div className="grid grid-cols-3 gap-2">
            {[10, 20, 30].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setQuickQuestionCount(count)}
                className={`py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  quickQuestionCount === count
                    ? 'border-orange-500 bg-orange-600 text-white shadow-md'
                    : 'border-gray-800 bg-[#0f1117] text-gray-400 hover:text-white'
                }`}
              >
                {count} Questions
              </button>
            ))}
          </div>
        </div>

        {/* Timer Toggle */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase">Session Timer Mode</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setQuickTimed(true)}
              className={`py-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                quickTimed
                  ? 'border-orange-500 bg-orange-600 text-white shadow-md'
                  : 'border-gray-800 bg-[#0f1117] text-gray-400 hover:text-white'
              }`}
            >
              <FaClock /> Timed ({quickQuestionCount} mins)
            </button>
            <button
              type="button"
              onClick={() => setQuickTimed(false)}
              className={`py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                !quickTimed
                  ? 'border-orange-500 bg-orange-600 text-white shadow-md'
                  : 'border-gray-800 bg-[#0f1117] text-gray-400 hover:text-white'
              }`}
            >
              Untimed (Practice)
            </button>
          </div>
        </div>

        {/* Start Button */}
        <button
          type="button"
          onClick={onLaunchQuickTest}
          className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-orange-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          Start Drill Now
        </button>
      </div>
    </div>
  );
}