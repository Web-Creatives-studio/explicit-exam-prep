'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { createClient } from '../../utils/supabase/client';
import { toast } from 'react-toastify';
import { 
  FaSearch, 
  FaCrown, 
  FaUserGraduate, 
  FaChevronLeft, 
  FaChevronRight, 
  FaBuilding,
  FaShieldAlt
} from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';

export const dynamic = 'force-dynamic';

function StudentsAdminContent() {
  const supabase = createClient();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedTier, setSelectedTier] = useState('ALL'); // 'ALL' | 'PRO' | 'FREE'
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

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

  // Extract unique departments for filtering
  const departments = useMemo(() => {
    const list = students.map((s) => s.department).filter(Boolean);
    return ['ALL', ...Array.from(new Set(list)).sort()];
  }, [students]);

  // Search + Department + Tier Filter
  const filtered = useMemo(() => {
    return students.filter((s) => {
      const nameMatch =
        !search.trim() ||
        s.full_name?.toLowerCase().includes(search.toLowerCase().trim()) ||
        s.department?.toLowerCase().includes(search.toLowerCase().trim()) ||
        s.email?.toLowerCase().includes(search.toLowerCase().trim());

      const deptMatch = selectedDept === 'ALL' || s.department === selectedDept;

      const tierMatch =
        selectedTier === 'ALL' ||
        (selectedTier === 'PRO' && Boolean(s.is_premium)) ||
        (selectedTier === 'FREE' && !s.is_premium);

      return nameMatch && deptMatch && tierMatch;
    });
  }, [students, search, selectedDept, selectedTier]);

  // Reset to page 1 on filter or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedDept, selectedTier, pageSize]);

  // Pagination calculations
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const paginatedStudents = useMemo(() => {
    return filtered.slice(startIndex, startIndex + pageSize);
  }, [filtered, startIndex, pageSize]);

  if (loading && students.length === 0) {
    return (
      <div className="h-[70vh] w-full flex flex-col items-center justify-center gap-3 text-gray-400 select-none">
        <FiLoader className="animate-spin text-orange-500 text-3xl" />
        <p className="text-xs font-bold uppercase tracking-widest text-gray-300">Loading Aspirants Directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none selection:bg-orange-500 selection:text-white">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <FaUserGraduate className="text-orange-500" /> Registered Aspirants
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Manage candidate accounts, target department allocations, and PRO access privileges.
          </p>
        </div>

        <div className="text-xs font-mono bg-[#161922] border border-gray-800 px-4 py-2.5 rounded-2xl text-gray-400 self-start md:self-auto">
          Total Candidates: <strong className="text-orange-400">{filtered.length}</strong>
        </div>
      </div>

      {/* Control Bar: Search + Department Filter + Access Tier Filter + Page Size */}
      <div className="bg-[#161922] border border-gray-800 rounded-3xl p-4 sm:p-5 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-xl">
        
        {/* Search Input */}
        <div className="relative w-full lg:w-72">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate name or course..."
            className="w-full bg-[#0e1118] border border-gray-800 rounded-2xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 w-full lg:w-auto">
          
          {/* Access Tier Filter */}
          <div className="flex items-center gap-2">
            <FaShieldAlt className="text-gray-500 text-xs shrink-0" />
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="bg-[#0e1118] border border-gray-800 rounded-2xl py-2 px-3 text-xs text-gray-300 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="ALL">All Tiers (Pro & Free)</option>
              <option value="PRO">👑 PRO Aspirants</option>
              <option value="FREE">FREE Tier</option>
            </select>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <FaBuilding className="text-gray-500 text-xs shrink-0" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-[#0e1118] border border-gray-800 rounded-2xl py-2 px-3 text-xs text-gray-300 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'ALL' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>

          {/* Page Size Selector */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-[#0e1118] border border-gray-800 rounded-xl py-2 px-2.5 text-xs text-gray-300 focus:outline-none focus:border-orange-500 cursor-pointer font-mono"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

        </div>

      </div>

      {/* Candidates Table */}
      <div className="bg-[#161922] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#0e1118] text-[10px] uppercase font-bold text-gray-400 tracking-wider border-b border-gray-800">
              <tr>
                <th className="py-4 px-4 sm:px-6">Candidate Name</th>
                <th className="py-4 px-4 sm:px-6">Target Department</th>
                <th className="py-4 px-4 sm:px-6">Access Tier</th>
                <th className="py-4 px-4 sm:px-6">Joined Date</th>
                <th className="py-4 px-4 sm:px-6 text-right">Quick Access Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/80">
              {paginatedStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-800/30 transition">
                  <td className="py-4 px-4 sm:px-6 font-bold text-white">
                    <div className="flex items-center gap-2">
                      <FaUserGraduate className="text-gray-600 text-xs shrink-0" />
                      <span>{student.full_name || 'Anonymous Aspirant'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-gray-300 font-medium">
                    {student.department || 'Undecided'}
                  </td>
                  <td className="py-4 px-4 sm:px-6">
                    {student.is_premium ? (
                      <span className="inline-flex items-center gap-1 bg-yellow-500/10 text-yellow-400 text-[11px] font-black px-2.5 py-0.5 rounded-lg border border-yellow-500/20">
                        <FaCrown className="text-[10px]" /> PRO
                      </span>
                    ) : (
                      <span className="bg-[#0e1118] border border-gray-800 text-gray-400 text-[11px] font-semibold px-2.5 py-0.5 rounded-lg">
                        FREE
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-gray-500 font-mono">
                    {student.created_at ? new Date(student.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-right">
                    <button
                      type="button"
                      disabled={togglingId === student.id}
                      onClick={() => togglePremium(student.id, student.is_premium)}
                      className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition active:scale-[0.98] disabled:opacity-50 cursor-pointer ${
                        student.is_premium
                          ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                          : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                    >
                      {togglingId === student.id ? 'Updating...' : student.is_premium ? 'Revoke PRO' : 'Grant PRO Pass'}
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-gray-500">
                    No candidates matched your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer Controls */}
        <div className="bg-[#0e1118] border-t border-gray-800 px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-gray-400 font-mono text-[11px]">
            Showing <strong className="text-white">{totalItems === 0 ? 0 : startIndex + 1}</strong> to <strong className="text-white">{endIndex}</strong> of <strong className="text-orange-400">{totalItems}</strong> candidates
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1 || loading}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="px-3 py-1.5 rounded-xl bg-[#161922] hover:bg-[#1f232f] border border-gray-800 text-gray-300 font-bold transition flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <FaChevronLeft className="text-[10px]" /> Prev
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl font-mono text-xs font-bold transition cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                        : 'bg-[#161922] border border-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={currentPage >= totalPages || loading}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className="px-3 py-1.5 rounded-xl bg-[#161922] hover:bg-[#1f232f] border border-gray-800 text-gray-300 font-bold transition flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              Next <FaChevronRight className="text-[10px]" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

function StudentsLoadingFallback() {
  return (
    <div className="h-[70vh] w-full flex flex-col items-center justify-center gap-3 text-gray-400 select-none">
      <FiLoader className="animate-spin text-orange-500 text-3xl" />
      <p className="text-xs font-bold uppercase tracking-widest text-gray-300">Loading Aspirants Directory...</p>
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