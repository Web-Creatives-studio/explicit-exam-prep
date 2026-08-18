'use client';

import { FaSlidersH, FaTimes, FaClock, FaCalendarAlt } from 'react-icons/fa';

export default function QuickTestModal({
  isOpen,
  onClose,
  selectedSubject,
  availableYears = [],
  quickQuestionCount,
  setQuickQuestionCount,
  quickTimed,
  setQuickTimed,
  quickYear,
  setQuickYear,
  onLaunchQuickTest,
}) {
  if (!isOpen || !selectedSubject) return null;

  // Fallback years if the table has no tagged years yet
  const yearsList = availableYears.length > 0 
    ? availableYears 
    : [2024, 2023, 2022, 2021, 2020, 2019];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#141822] border border-gray-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl text-white relative animate-in fade-in zoom-in-95 duration-200">
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
          <h2 className="text-2xl font-black text-white">{selectedSubject.name}</h2>
          <p className="text-xs text-gray-400">Configure year, question count, and timer options.</p>
        </div>

        {/* 1. Dynamic Year Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1.5">
            <FaCalendarAlt className="text-orange-500" /> Exam Year
          </label>
          <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
            <button
              type="button"
              onClick={() => setQuickYear('all')}
              className={`py-2 rounded-xl border text-[11px] font-bold transition cursor-pointer ${
                quickYear === 'all'
                  ? 'border-orange-500 bg-orange-600 text-white shadow-md shadow-orange-600/30'
                  : 'border-gray-800 bg-[#0b0e14] text-gray-400 hover:text-white hover:border-gray-700'
              }`}
            >
              All Years (Random)
            </button>
            {yearsList.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setQuickYear(String(y))}
                className={`py-2 rounded-xl border text-[11px] font-bold transition cursor-pointer ${
                  quickYear === String(y)
                    ? 'border-orange-500 bg-orange-600 text-white shadow-md shadow-orange-600/30'
                    : 'border-gray-800 bg-[#0b0e14] text-gray-400 hover:text-white hover:border-gray-700'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Question Count Selector */}
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
                    ? 'border-orange-500 bg-orange-600 text-white shadow-md shadow-orange-600/30'
                    : 'border-gray-800 bg-[#0b0e14] text-gray-400 hover:text-white hover:border-gray-700'
                }`}
              >
                {count} Questions
              </button>
            ))}
          </div>
        </div>

        {/* 3. Timer Toggle */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase">Session Timer Mode</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setQuickTimed(true)}
              className={`py-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                quickTimed
                  ? 'border-orange-500 bg-orange-600 text-white shadow-md shadow-orange-600/30'
                  : 'border-gray-800 bg-[#0b0e14] text-gray-400 hover:text-white hover:border-gray-700'
              }`}
            >
              <FaClock /> Timed ({quickQuestionCount} mins)
            </button>
            <button
              type="button"
              onClick={() => setQuickTimed(false)}
              className={`py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                !quickTimed
                  ? 'border-orange-500 bg-orange-600 text-white shadow-md shadow-orange-600/30'
                  : 'border-gray-800 bg-[#0b0e14] text-gray-400 hover:text-white hover:border-gray-700'
              }`}
            >
              Untimed (Practice)
            </button>
          </div>
        </div>

        {/* 4. Start Button */}
        <button
          type="button"
          onClick={onLaunchQuickTest}
          className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-orange-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          Start Random Drill
        </button>
      </div>
    </div>
  );
}