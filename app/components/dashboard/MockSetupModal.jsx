'use client';

import { FaBolt, FaTimes, FaCheckCircle, FaCheck } from 'react-icons/fa';

export default function MockSetupModal({
  isOpen,
  onClose,
  aptitudeSubject,
  selectableSubjects = [],
  selectedSubjectIds = [],
  onToggleSubject,
  onLaunchMock,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#161922] border border-gray-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl text-white relative animate-in fade-in zoom-in duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white transition cursor-pointer"
        >
          <FaTimes />
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-orange-500 font-black text-xs uppercase tracking-wider">
            <FaBolt /> Mock Examination Setup
          </div>
          <h2 className="text-2xl font-black">Configure 4-Subject Combination</h2>
          <p className="text-xs text-gray-400">
            OAU Post-UTME mandates <strong>Aptitude</strong> (10 Qs) + any 3 elective subjects (10 Qs each) for a total of 40 Questions in 40 Minutes.
          </p>
        </div>

        {/* 1. Compulsory Aptitude */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-gray-400 uppercase">1. Compulsory Subject (Auto-Selected)</span>
          <div className="bg-[#0f1117] border border-orange-500/40 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-orange-600 text-white text-xs font-black flex items-center justify-center shadow-md">
                1
              </span>
              <div>
                <div className="font-extrabold text-sm text-white">{aptitudeSubject?.name || 'Aptitude'}</div>
                <div className="text-[11px] text-orange-400 font-medium">Compulsory for all candidates (10 Qs)</div>
              </div>
            </div>
            <FaCheckCircle className="text-orange-500 text-lg" />
          </div>
        </div>

        {/* 2. Pick 3 Other Subjects */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-gray-400 uppercase">2. Pick Remaining 3 Subjects:</span>
            <span className={`font-bold ${selectedSubjectIds.length === 3 ? 'text-emerald-400' : 'text-orange-400'}`}>
              {selectedSubjectIds.length} of 3 Selected
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1">
            {selectableSubjects.map((sub) => {
              const isSelected = selectedSubjectIds.includes(sub.id);
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => onToggleSubject(sub.id)}
                  className={`p-3 rounded-xl border text-left text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'border-orange-500 bg-orange-600/20 text-white shadow-sm'
                      : 'border-gray-800 bg-[#0f1117] text-gray-400 hover:border-gray-700 hover:text-gray-200'
                  }`}
                >
                  <span className="line-clamp-1">{sub.name}</span>
                  {isSelected && <FaCheck className="text-orange-500 text-xs shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Launch Button */}
        <button
          type="button"
          disabled={selectedSubjectIds.length !== 3}
          onClick={onLaunchMock}
          className="w-full py-4 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-800 disabled:text-gray-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-orange-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <FaBolt /> Launch 40-Minute Mock Exam
        </button>
      </div>
    </div>
  );
}