'use client';

import { FaBook } from 'react-icons/fa';

export default function SubjectDrillGrid({ subjects = [], isPremium, onSelectSubject }) {
  return (
    <div className="space-y-4 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <FaBook className="text-orange-500" /> Quick Practice by Subject
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Click any subject to launch a targeted single-subject drill.</p>
        </div>
        <span className="text-xs font-bold text-gray-400 bg-[#141822] px-3 py-1.5 rounded-xl border border-gray-800">
          {subjects.length} Subjects Available
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {subjects.map((sub) => (
          <div
            key={sub.id}
            onClick={() => onSelectSubject(sub)}
            className="bg-[#141822] hover:border-orange-500 p-5 rounded-2xl border border-gray-800 shadow-sm transition hover:-translate-y-1 group cursor-pointer flex flex-col justify-between h-40"
          >
            <div className="flex justify-between items-start">
              <span className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 font-black text-xs flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition">
                {sub.code || 'OAU'}
              </span>
              {!isPremium ? (
                <span className="text-[10px] font-bold text-gray-400 uppercase bg-[#0f1117] border border-gray-800 px-2.5 py-0.5 rounded-md">
                  Free Trial
                </span>
              ) : (
                <span className="text-[10px] font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                  Pro Access
                </span>
              )}
            </div>

            <div>
              <h3 className="font-bold text-white text-sm group-hover:text-orange-400 transition line-clamp-1">
                {sub.name}
              </h3>
              <span className="text-xs text-gray-500 font-medium">Configure Quick Drill →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}