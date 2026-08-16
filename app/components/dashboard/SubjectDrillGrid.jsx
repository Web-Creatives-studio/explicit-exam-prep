'use client';

import { FaBook } from 'react-icons/fa';

export default function SubjectDrillGrid({ subjects = [], isPremium, onSelectSubject }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <FaBook className="text-orange-600" /> Quick Practice by Subject
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Click any subject to launch a targeted single-subject drill.</p>
        </div>
        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200">
          {subjects.length} Subjects Available
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {subjects.map((sub) => (
          <div
            key={sub.id}
            onClick={() => onSelectSubject(sub)}
            className="bg-white hover:border-orange-500 p-5 rounded-2xl border border-gray-200 shadow-sm transition hover:-translate-y-1 group cursor-pointer flex flex-col justify-between h-40"
          >
            <div className="flex justify-between items-start">
              <span className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 font-black text-xs flex items-center justify-center border border-orange-100 group-hover:bg-orange-600 group-hover:text-white transition">
                {sub.code || 'OAU'}
              </span>
              {!isPremium ? (
                <span className="text-[10px] font-bold text-gray-500 uppercase bg-gray-100 px-2.5 py-0.5 rounded-md">
                  Free Trial
                </span>
              ) : (
                <span className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                  Pro Access
                </span>
              )}
            </div>

            <div>
              <h3 className="font-bold text-gray-900 text-sm group-hover:text-orange-600 transition line-clamp-1">
                {sub.name}
              </h3>
              <span className="text-xs text-gray-400 font-medium">Configure Quick Drill →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}