'use client';

import Link from 'next/link';
import Navbar from './Navbar';
import { FaBolt, FaCrown, FaInfoCircle, FaCheckCircle, FaCheck } from 'react-icons/fa';

export default function MockBriefing({
  profile,
  aptitudeSubject,
  selectableSubjects,
  selectedSubjectIds,
  onToggleSubject,
  onStartExam,
  isPremium,
  questionsPerSubject
}) {
  return (
    <>
    <Navbar profile={profile}/>
    <div className="w-full max-w-3xl mx-auto py-2 sm:py-6 px-2 sm:px-4 space-y-6">
      <div className="bg-[#161922] border border-gray-800 rounded-3xl p-6 sm:p-10 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-orange-600/30 shrink-0">
              <FaBolt />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-black text-white leading-tight">OAU Post-UTME Mock</h1>
              <p className="text-xs text-orange-400 font-bold tracking-wider uppercase mt-0.5">
                {isPremium ? '40 Questions • 40 Minutes' : '20 Questions • 20 Minutes (Free Pass)'}
              </p>
            </div>
          </div>

          {isPremium ? (
            <span className="self-start sm:self-auto inline-flex items-center gap-1.5 bg-yellow-500/10 text-yellow-400 text-xs font-bold px-3 py-1 rounded-xl border border-yellow-500/20">
              <FaCrown /> PRO (10 Qs/Sub)
            </span>
          ) : (
            <span className="self-start sm:self-auto inline-flex items-center gap-1 bg-gray-800 text-gray-300 text-xs font-semibold px-3 py-1 rounded-xl border border-gray-700">
              Free Tier (5 Qs/Sub)
            </span>
          )}
        </div>

        {/* Tier Info Card */}
        <div className="p-4 bg-[#0f1117] rounded-2xl border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-gray-300">
            <FaInfoCircle className="text-orange-500 text-sm shrink-0" />
            <span>
              {isPremium ? (
                <><strong>PRO Pass Active</strong>: 10 questions per subject across all 4 selected subjects.</>
              ) : (
                <><strong>Free Trial Tier</strong>: Limited to 5 questions per subject (20 questions total).</>
              )}
            </span>
          </div>
          {!isPremium && (
            <Link href="/practice/single" className="text-orange-400 hover:text-orange-300 font-bold underline shrink-0">
              Redeem Code
            </Link>
          )}
        </div>

        {/* Step 1: Compulsory Aptitude */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
            1. Compulsory Subject (Locked)
          </label>
          <div className="bg-[#0f1117] border border-orange-500/40 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-orange-600 text-white text-xs font-black flex items-center justify-center shadow-md shrink-0">
                1
              </span>
              <div>
                <div className="font-extrabold text-sm text-white">{aptitudeSubject?.name || 'Aptitude'}</div>
                <div className="text-[11px] text-orange-400 font-medium">
                  General Aptitude for all OAU candidates ({questionsPerSubject} Qs)
                </div>
              </div>
            </div>
            <FaCheckCircle className="text-orange-500 text-lg shrink-0 ml-2" />
          </div>
        </div>

        {/* Step 2: Elective 3-Subject Picker */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-gray-400 uppercase tracking-wider">
              2. Select 3 Elective Subjects:
            </span>
            <span className={`font-bold ${selectedSubjectIds.length === 3 ? 'text-emerald-400' : 'text-orange-400'}`}>
              {selectedSubjectIds.length} of 3 Selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto p-1">
            {selectableSubjects.map((sub) => {
              const isSelected = selectedSubjectIds.includes(sub.id);
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => onToggleSubject(sub.id)}
                  className={`p-3.5 rounded-2xl border text-left text-xs font-bold transition flex items-center justify-between ${
                    isSelected
                      ? 'border-orange-500 bg-orange-600/20 text-white shadow-sm'
                      : 'border-gray-800 bg-[#0f1117] text-gray-400 hover:border-gray-700 hover:text-gray-200'
                  }`}
                >
                  <span className="truncate pr-2">{sub.name}</span>
                  {isSelected && <FaCheck className="text-orange-500 text-xs shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Start Button */}
        <button
          disabled={selectedSubjectIds.length !== 3}
          onClick={onStartExam}
          className="w-full py-4 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-800 disabled:text-gray-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-orange-600/25 transition flex items-center justify-center gap-2"
        >
          <FaBolt /> Start {isPremium ? '40-Question (40 Mins)' : '20-Question (20 Mins)'} Mock Exam
        </button>
      </div>
    </div>
    </>
  );
}