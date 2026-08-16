'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '../../utils/supabase/client';
import { toast } from 'react-toastify';
import { FaSearch, FaCrown } from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';

export const dynamic = 'force-dynamic';

function StudentsAdminContent() {
  const supabase = createClient();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('role', 'admin')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch registered candidates.');
    } else {
      setStudents(data || []);
    }
    setLoading(false);
  };

  const togglePremium = async (id, currentStatus) => {
    const nextStatus = !currentStatus;
    setTogglingId(id);

    const { error } = await supabase
      .from('profiles')
      .update({ is_premium: nextStatus })
      .eq('id', id);

    if (!error) {
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, is_premium: nextStatus } : s))
      );
      toast.success(nextStatus ? 'PRO access granted!' : 'PRO access revoked.');
    } else {
      toast.error(error.message || 'Failed to update access status.');
    }
    setTogglingId(null);
  };

  const filtered = students.filter((s) => 
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.department?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && students.length === 0) {
    return (
      <div className="h-[70vh] w-full flex flex-col items-center justify-center gap-3 text-gray-400">
        <FiLoader className="animate-spin text-orange-500 text-3xl" />
        <p className="text-xs font-bold uppercase tracking-widest">Loading Aspirants Directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Registered Aspirants</h1>
          <p className="text-gray-400 text-sm mt-1">Manage student accounts, department assignments, and access privileges.</p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-sm w-full">
          <FaSearch className="absolute left-3.5 top-3.5 text-gray-500 text-sm" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student or department..."
            className="w-full bg-[#161922] border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      <div className="bg-[#161922] border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-800/60 text-xs uppercase font-bold text-gray-400">
              <tr>
                <th className="p-4">Candidate Name</th>
                <th className="p-4">Target Department</th>
                <th className="p-4">Status</th>
                <th className="p-4">Last Active</th>
                <th className="p-4 text-right">Quick Access Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/80">
              {filtered.map((student) => (
                <tr key={student.id} className="hover:bg-gray-800/30">
                  <td className="p-4 font-bold text-white">{student.full_name || 'N/A'}</td>
                  <td className="p-4 text-xs text-gray-300">{student.department || 'Undecided'}</td>
                  <td className="p-4">
                    {student.is_premium ? (
                      <span className="inline-flex items-center gap-1 bg-yellow-500/10 text-yellow-400 text-xs font-bold px-2.5 py-0.5 rounded-md border border-yellow-500/20">
                        <FaCrown className="text-[10px]" /> PRO
                      </span>
                    ) : (
                      <span className="bg-gray-800 text-gray-400 text-xs font-semibold px-2 py-0.5 rounded">
                        FREE
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-xs text-gray-400">
                    {student.last_active_at ? new Date(student.last_active_at).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      disabled={togglingId === student.id}
                      onClick={() => togglePremium(student.id, student.is_premium)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition disabled:opacity-50 cursor-pointer ${
                        student.is_premium
                          ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                          : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                      }`}
                    >
                      {togglingId === student.id ? 'Updating...' : student.is_premium ? 'Revoke Pro' : 'Grant Pro Pass'}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">No candidates matched your search criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StudentsLoadingFallback() {
  return (
    <div className="h-[70vh] w-full flex flex-col items-center justify-center gap-3 text-gray-400">
      <FiLoader className="animate-spin text-orange-500 text-3xl" />
      <p className="text-xs font-bold uppercase tracking-widest">Loading Aspirants Directory...</p>
    </div>
  );
}

export default function StudentsAdminPage() {
  return (
    <Suspense fallback={<StudentsLoadingFallback />}>
      <StudentsAdminContent />
    </Suspense>
  );
}