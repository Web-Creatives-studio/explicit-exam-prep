'use client';

import Link from 'next/link';
import Navbar from './Navbar';
import { 
  FaBolt, 
  FaCrown, 
  FaInfoCircle, 
  FaCheckCircle, 
  FaCheck, 
  FaCalendarAlt 
} from 'react-icons/fa';

export default function MockBriefing({
  profile,
  aptitudeSubject,
  selectableSubjects = [],
  selectedSubjectIds = [],
  onToggleSubject,
  availableYears = [],
  selectedYear = 'all',
  onSelectYear,
  onStartExam,
  isPremium,
  questionsPerSubject
}) {
  return (
    <>
      <Navbar profile={profile} />
      <div className="w-full max-w-4xl mx-auto py-3 sm:py-6 px-3 sm:px-6 lg:px-8 space-y-4 sm:space-y-6 select-none">
        
        {/* Main Briefing Card */}
        <div className="bg-[#141822] border border-gray-800/90 rounded-2xl sm:rounded-3xl p-4 sm:p-7 md:p-10 space-y-5 sm:space-y-6 shadow-2xl backdrop-blur-md">
          
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-4 sm:pb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-11 h-11 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl flex items-center justify-center text-white text-lg sm:text-2xl shadow-lg shadow-orange-600/30 shrink-0">
                <FaBolt />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-white leading-tight truncate">
                  OAU Post-UTME Mock
                </h1>
                <p className="text-[11px] sm:text-xs text-orange-400 font-bold tracking-wide uppercase mt-0.5 sm:mt-1">
                  {isPremium ? '40 Questions • 40 Minutes' : '20 Questions • 20 Minutes (Free Pass)'}
                </p>
              </div>
            </div>

            {/* Access Badge */}
            <div className="self-start sm:self-auto shrink-0">
              {isPremium ? (
                <span className="inline-flex items-center gap-1.5 bg-yellow-500/10 text-yellow-400 text-xs font-extrabold px-3 py-1.5 rounded-xl border border-yellow-500/30 shadow-sm">
                  <FaCrown className="text-xs" /> PRO (10 Qs/Sub)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-gray-800/90 text-gray-300 text-xs font-semibold px-3 py-1.5 rounded-xl border border-gray-700">
                  Free Tier (5 Qs/Sub)
                </span>
              )}
            </div>
          </div>

          {/* Tier Notice */}
          <div className="p-3.5 sm:p-4 bg-[#0b0e14] rounded-2xl border border-gray-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2.5 text-gray-300">
              <FaInfoCircle className="text-orange-500 text-sm shrink-0" />
              <span className="leading-relaxed">
                {isPremium ? (
                  <><strong>PRO Pass Active:</strong> 10 authentic questions per subject across all 4 chosen subjects.</>
                ) : (
                  <><strong>Free Trial Tier:</strong> Limited to 5 questions per subject (20 questions total).</>
                )}
              </span>
            </div>
            {!isPremium && (
              <Link 
                href="/practice/single" 
                className="text-orange-400 hover:text-orange-300 font-bold underline shrink-0 transition"
              >
                Redeem Code
              </Link>
            )}
          </div>

          {/* Step 1: Compulsory Aptitude & Past Question Year Dropdown (Side-by-Side) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            
            {/* 1A. Aptitude (Locked) */}
            <div className="space-y-2">
              <label className="block text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">
                1. Compulsory Aptitude
              </label>
              <div className="h-[68px] bg-[#0b0e14] border border-orange-500/40 px-3.5 sm:px-4 rounded-2xl flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-8 h-8 rounded-xl bg-orange-600 text-white text-xs font-black flex items-center justify-center shadow-md shrink-0">
                    1
                  </span>
                  <div className="min-w-0">
                    <div className="font-extrabold text-sm sm:text-base text-white truncate">
                      {aptitudeSubject?.name || 'Aptitude'}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-orange-400 font-medium truncate">
                      Compulsory for all candidates ({questionsPerSubject} Qs)
                    </div>
                  </div>
                </div>
                <FaCheckCircle className="text-orange-500 text-base sm:text-lg shrink-0 ml-2" />
              </div>
            </div>

            {/* 1B. Past-Question Year Selection Dropdown */}
            <div className="space-y-2">
              <label className="block text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <FaCalendarAlt className="text-orange-500" /> Past Question Series
              </label>
              <div className="h-[68px] bg-[#0b0e14] border border-gray-800 px-3.5 sm:px-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3 w-full">
                  <div className="w-8 h-8 rounded-xl bg-gray-800 text-orange-400 text-xs font-black flex items-center justify-center shadow-md shrink-0">
                    <FaCalendarAlt />
                  </div>
                  <div className="flex-1 min-w-0">
                    <select
                      value={selectedYear}
                      onChange={(e) => onSelectYear(e.target.value)}
                      className="w-full bg-transparent text-white font-bold text-xs sm:text-sm focus:outline-none cursor-pointer py-1"
                    >
                      <option value="all" className="bg-[#141822] text-white">
                        All Years (Randomized Series)
                      </option>
                      {availableYears.map((year) => (
                        <option key={year} value={year} className="bg-[#141822] text-white font-mono">
                          {year} Past Question Series
                        </option>
                      ))}
                    </select>
                    <div className="text-[10px] text-gray-400">
                      Filter questions by CBT edition
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

      
          <div className="space-y-2.5 sm:space-y-3 pt-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-gray-400 uppercase tracking-wider text-[11px] sm:text-xs">
                2. Select 3 Elective Subjects:
              </span>
              <span className={`font-mono font-bold text-xs ${
                selectedSubjectIds.length === 3 ? 'text-emerald-400' : 'text-orange-400'
              }`}>
                {selectedSubjectIds.length} / 3 Selected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5 h-fit sm:max-h-64 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-gray-800">
              {selectableSubjects.map((sub) => {
                const isSelected = selectedSubjectIds.includes(sub.id);
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => onToggleSubject(sub.id)}
                    className={`min-h-[48px] p-3 sm:p-3.5 rounded-2xl border text-left text-xs font-bold transition flex items-center justify-between cursor-pointer active:scale-[0.98] ${
                      isSelected
                        ? 'border-orange-500 bg-orange-600/20 text-white shadow-md shadow-orange-600/10'
                        : 'border-gray-800/80 bg-[#0b0e14] text-gray-400 hover:border-gray-700 hover:text-gray-200'
                    }`}
                  >
                    <span className="truncate pr-2">{sub.name}</span>
                    {isSelected && <FaCheck className="text-orange-500 text-xs shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Launch Exam CTA */}
          <button
            type="button"
            disabled={selectedSubjectIds.length !== 3}
            onClick={onStartExam}
            className="w-full min-h-[52px] py-3.5 sm:py-4 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] disabled:bg-gray-800 disabled:text-gray-500 disabled:border-gray-800 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl shadow-orange-600/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            <FaBolt className="shrink-0" /> Start {isPremium ? '40-Question (40 Mins)' : '20-Question (20 Mins)'} Mock Exam
          </button>

        </div>
      </div>
    </>
  );
}