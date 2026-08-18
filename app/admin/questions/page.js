'use client';

import { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { createClient } from '../../utils/supabase/client';
import { toast } from 'react-toastify';
import { 
  FaBook, 
  FaTrashAlt, 
  FaSearch, 
  FaPlus, 
  FaArrowLeft,
  FaCrown,
  FaTimes,
  FaMagic,
  FaSpinner,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaCheckCircle,
  FaInfoCircle,
  FaLayerGroup
} from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';

export const dynamic = 'force-dynamic';

const DEFAULT_OAU_SUBJECTS = [
  { name: 'Use of English', code: 'ENG' },
  { name: 'Mathematics', code: 'MTH' },
  { name: 'Biology', code: 'BIO' },
  { name: 'Chemistry', code: 'CHM' },
  { name: 'Physics', code: 'PHY' },
  { name: 'Government & Current Affairs', code: 'GOV' },
  { name: 'Economics', code: 'ECO' },
  { name: 'Literature in English', code: 'LIT' },
  { name: 'General Knowledge', code: 'GK' },
  { name: 'Agricultural Science', code: 'AGR' },
  { name: 'Financial Accounting', code: 'ACC' },
  { name: 'Commerce', code: 'COM' },
];

function QuestionsExplorerContent() {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // -------------------------------------------------------------
  // Read Initial State from URL Search Params
  // -------------------------------------------------------------
  const selectedSubjectCode = searchParams.get('subject') || null;
  const search = searchParams.get('search') || '';
  const yearFilter = searchParams.get('year') || 'ALL';
  const tierFilter = searchParams.get('tier') || 'ALL'; // 'ALL' | 'FREE' | 'PRO'
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('limit') || '15', 10);
  const selectedQuestionId = searchParams.get('qId') || null;

  // Local Data State
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [showMobileInspector, setShowMobileInspector] = useState(false);

  // Modal State for adding new subject
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [submittingSubject, setSubmittingSubject] = useState(false);

  // Helper to push updated search parameters to the URL
  const updateQueryParams = useCallback((updates, replace = true) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '' || value === 'ALL') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    const queryString = params.toString();
    const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
    
    if (replace) {
      router.replace(targetUrl, { scroll: false });
    } else {
      router.push(targetUrl, { scroll: false });
    }
  }, [searchParams, pathname, router]);

  // 1. Fetch Subject List & Counts
  const fetchSubjectSummary = useCallback(async () => {
    setLoadingSubjects(true);
    const { data: subs } = await supabase.from('subjects').select('*').order('name');
    
    if (subs) {
      const counts = await Promise.all(
        subs.map(async (s) => {
          const { count } = await supabase
            .from('questions')
            .select('*', { count: 'exact', head: true })
            .eq('subject_id', s.id);
          return { ...s, total_questions: count || 0 };
        })
      );
      setSubjects(counts);
    }
    setLoadingSubjects(false);
  }, [supabase]);

  useEffect(() => {
    fetchSubjectSummary();
  }, [fetchSubjectSummary]);

  // Current selected subject object resolved by Code
  const activeSubject = useMemo(() => {
    if (!selectedSubjectCode) return null;
    return subjects.find((s) => s.code?.toUpperCase() === selectedSubjectCode.toUpperCase()) || null;
  }, [subjects, selectedSubjectCode]);

  // 2. Fetch Questions when activeSubject changes
  useEffect(() => {
    async function loadSubjectQuestions() {
      if (!activeSubject) {
        setQuestions([]);
        return;
      }

      setLoadingQuestions(true);
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('subject_id', activeSubject.id)
        .order('year', { ascending: false });

      if (error) {
        toast.error('Failed to load questions: ' + error.message);
      }

      setQuestions(data || []);
      setLoadingQuestions(false);
    }

    loadSubjectQuestions();
  }, [activeSubject, supabase]);

  // 3. Subject Actions
  const handleSelectSubject = (subject) => {
    updateQueryParams({
      subject: subject.code,
      page: null,
      year: null,
      tier: null,
      search: null,
      qId: null
    }, false);
  };

  const handleClearSubject = () => {
    updateQueryParams({
      subject: null,
      page: null,
      year: null,
      tier: null,
      search: null,
      qId: null
    }, false);
    setShowMobileInspector(false);
  };

  const handleSeedDefaults = async () => {
    setLoadingSubjects(true);
    const { data, error } = await supabase
      .from('subjects')
      .upsert(DEFAULT_OAU_SUBJECTS, { onConflict: 'name' })
      .select();

    if (error) {
      toast.error('Failed to seed subjects: ' + error.message);
    } else {
      toast.success(`Populated ${data.length} core subjects!`);
      fetchSubjectSummary();
    }
    setLoadingSubjects(false);
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubCode.trim()) return;

    setSubmittingSubject(true);
    const { error } = await supabase
      .from('subjects')
      .insert([{ name: newSubName.trim(), code: newSubCode.trim().toUpperCase() }])
      .select();

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Subject "${newSubName}" created!`);
      setNewSubName('');
      setNewSubCode('');
      setShowAddSubjectModal(false);
      fetchSubjectSummary();
    }
    setSubmittingSubject(false);
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!confirm('Are you sure you want to delete this question?')) return;

    const { error } = await supabase.from('questions').delete().eq('id', id);
    if (!error) {
      toast.success('Question deleted.');
      const updated = questions.filter((q) => q.id !== id);
      setQuestions(updated);

      if (selectedQuestionId === id) {
        const nextActive = updated[0]?.id || null;
        updateQueryParams({ qId: nextActive });
        if (!nextActive) setShowMobileInspector(false);
      }
      fetchSubjectSummary();
    } else {
      toast.error(error.message);
    }
  };

  // 4. Filtering & Pagination
  const uniqueYears = useMemo(() => {
    return [...new Set(questions.map((q) => q.year).filter(Boolean))].sort((a, b) => b - a);
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch = q.question_text?.toLowerCase().includes(search.toLowerCase());
      const matchesYear = yearFilter === 'ALL' || q.year === Number(yearFilter);
      
      let matchesTier = true;
      if (tierFilter === 'FREE') matchesTier = q.is_free === true;
      if (tierFilter === 'PRO') matchesTier = q.is_free === false;

      return matchesSearch && matchesYear && matchesTier;
    });
  }, [questions, search, yearFilter, tierFilter]);

  const totalPages = Math.ceil(filteredQuestions.length / pageSize) || 1;

  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredQuestions.slice(start, start + pageSize);
  }, [filteredQuestions, currentPage, pageSize]);

  // Active question for the Inspector
  const activeQuestion = useMemo(() => {
    if (!selectedQuestionId) return paginatedQuestions[0] || questions[0] || null;
    return questions.find((q) => q.id === selectedQuestionId) || paginatedQuestions[0] || null;
  }, [questions, selectedQuestionId, paginatedQuestions]);

  const handleQuestionClick = (q) => {
    updateQueryParams({ qId: q.id });
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setShowMobileInspector(true);
    }
  };

  const freeCount = useMemo(() => questions.filter((q) => q.is_free).length, [questions]);
  const proCount = useMemo(() => questions.filter((q) => !q.is_free).length, [questions]);

  // Shared Inspector Component Content
  const renderInspectorContent = (q) => {
    if (!q) return null;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500 text-xs">
              <FaEye />
            </span>
            <span className="text-xs font-black uppercase text-white tracking-wider">
              Question Inspector
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-gray-400 bg-[#0b0e14] px-2.5 py-1 rounded-md border border-gray-800">
              {q.year ? `UTME ${q.year}` : 'Standard'}
            </span>
            {q.is_free ? (
              <span className="text-[9px] font-bold text-gray-300 bg-gray-800 px-2 py-1 rounded">
                FREE
              </span>
            ) : (
              <span className="text-[9px] font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded flex items-center gap-1">
                <FaCrown className="text-[8px]" /> PRO
              </span>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Problem Statement</span>
          <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed">
            {q.question_text}
          </p>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Multiple-Choice Options</span>
          <div className="space-y-2">
            {['a', 'b', 'c', 'd'].map((key) => {
              const upperKey = key.toUpperCase();
              const isCorrect = q.correct_option === upperKey;
              const optText = q[`option_${key}`];
              if (!optText) return null;

              return (
                <div
                  key={key}
                  className={`p-2.5 sm:p-3 rounded-xl border text-xs flex items-center justify-between ${
                    isCorrect
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-semibold'
                      : 'border-gray-800 bg-[#0b0e14] text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${
                      isCorrect ? 'bg-emerald-500 text-white' : 'bg-[#141822] text-gray-400'
                    }`}>
                      {upperKey}
                    </span>
                    <span className="leading-snug">{optText}</span>
                  </div>
                  {isCorrect && (
                    <span className="text-[9px] uppercase font-black tracking-wider text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1 shrink-0 ml-2">
                      <FaCheckCircle className="text-[9px]" /> Correct
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-3 sm:p-3.5 bg-[#0b0e14] rounded-2xl border border-gray-800 space-y-1 text-xs text-gray-300">
          <div className="text-orange-400 font-bold flex items-center gap-1.5 text-[10px] sm:text-[11px] uppercase tracking-wider">
            <FaInfoCircle /> Step-by-Step Explanation
          </div>
          <p className="leading-relaxed text-gray-300 text-[11px]">
            {q.explanation || 'No step-by-step explanation attached to this question.'}
          </p>
        </div>

        <div className="pt-2 flex items-center justify-between text-xs border-t border-gray-800">
          <span className="text-gray-500 font-mono text-[10px]">ID: {q.id.slice(0, 10)}...</span>
          <button
            type="button"
            onClick={(e) => handleDelete(q.id, e)}
            className="px-3 py-1.5 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white rounded-xl transition font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-red-500/20"
          >
            <FaTrashAlt className="text-[10px]" /> Delete Record
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 select-none selection:bg-orange-500 selection:text-white pb-10">
      {/* ------------------------------------------------------------- */}
      {/* TOP HEADER */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              Question Bank Studio
            </h1>
            {activeSubject && (
              <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full">
                {activeSubject.code} • {filteredQuestions.length} Questions
              </span>
            )}
          </div>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            {activeSubject 
              ? `Managing question curriculum and explanations for ${activeSubject.name}`
              : 'Select a subject from the curriculum grid to review and inspect questions.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!activeSubject ? (
            <>
              {subjects.length === 0 && !loadingSubjects && (
                <button
                  onClick={handleSeedDefaults}
                  disabled={loadingSubjects}
                  className="flex items-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  <FaMagic /> Auto-Seed Subjects
                </button>
              )}
              <button
                onClick={() => setShowAddSubjectModal(true)}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-bold transition shadow-md shadow-orange-600/30 cursor-pointer"
              >
                <FaPlus /> Add New Subject
              </button>
            </>
          ) : (
            <button
              onClick={handleClearSubject}
              className="flex items-center gap-2 bg-[#141822] hover:bg-gray-800 border border-gray-800 text-gray-300 px-3.5 py-2 rounded-xl text-xs font-bold transition w-fit cursor-pointer"
            >
              <FaArrowLeft /> Switch Subject
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* VIEW 1: SUBJECTS GRID VIEW */}
      {/* ------------------------------------------------------------- */}
      {!activeSubject ? (
        <>
          {loadingSubjects && subjects.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-gray-400">
              <FiLoader className="animate-spin text-orange-500 text-3xl" />
              <p className="text-xs font-bold uppercase tracking-widest">Loading Curriculum Grid...</p>
            </div>
          ) : subjects.length === 0 && !loadingSubjects ? (
            <div className="bg-[#141822] border border-gray-800 rounded-3xl p-8 sm:p-12 text-center space-y-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-600/10 text-orange-400 border border-orange-500/20 rounded-2xl flex items-center justify-center text-xl sm:text-2xl mx-auto">
                <FaBook />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">No Subjects Configured</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Click below to initialize standard UTME subjects or add a bespoke course.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleSeedDefaults}
                  className="w-full sm:w-auto px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold rounded-xl transition shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FaMagic /> Seed Default Subjects
                </button>
                <button
                  onClick={() => setShowAddSubjectModal(true)}
                  className="w-full sm:w-auto px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-extrabold rounded-xl transition border border-gray-700 cursor-pointer"
                >
                  Create Custom Subject
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {subjects.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => handleSelectSubject(sub)}
                  className="bg-[#141822] hover:border-orange-500/80 border border-gray-800 p-5 sm:p-6 rounded-2xl cursor-pointer transition hover:-translate-y-1 group shadow-sm flex flex-col justify-between h-36 sm:h-40"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 font-black text-xs flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition">
                      {sub.code || 'UTME'}
                    </span>
                    <span className="text-[11px] sm:text-xs font-mono font-bold text-gray-400 bg-[#0b0e14] px-2.5 py-1 rounded-md border border-gray-800">
                      {sub.total_questions} Questions
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-sm sm:text-base group-hover:text-orange-400 transition line-clamp-1">
                      {sub.name}
                    </h3>
                    <span className="text-[11px] sm:text-xs text-gray-500 font-medium">Open Question Studio →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* ------------------------------------------------------------- */
        /* VIEW 2: PROFESSIONAL SPLIT-PANE WITH URL SEARCH PARAMS       */
        /* ------------------------------------------------------------- */
        <div className="space-y-4">
          {/* Quick Filter Control Toolbar */}
          <div className="bg-[#141822] border border-gray-800 rounded-2xl p-3 sm:p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-xl">
            {/* Search Input (Pushed to URL search param) */}
            <div className="relative w-full lg:w-80">
              <FaSearch className="absolute left-3.5 top-3.5 text-gray-500 text-xs" />
              <input
                type="text"
                value={search}
                onChange={(e) => updateQueryParams({ search: e.target.value, page: 1 })}
                placeholder="Search by keywords..."
                className="w-full bg-[#0b0e14] border border-gray-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 transition"
              />
            </div>

            {/* Filter Buttons & Year Dropdown */}
            <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 w-full lg:w-auto">
              {/* Access Tier Pills */}
              <div className="flex items-center gap-1 bg-[#0b0e14] border border-gray-800 p-1 rounded-xl w-full sm:w-auto justify-between">
                <button
                  type="button"
                  onClick={() => updateQueryParams({ tier: 'ALL', page: 1 })}
                  className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition cursor-pointer text-center ${
                    tierFilter === 'ALL' ? 'bg-orange-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  All ({questions.length})
                </button>
                <button
                  type="button"
                  onClick={() => updateQueryParams({ tier: 'FREE', page: 1 })}
                  className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition cursor-pointer text-center ${
                    tierFilter === 'FREE' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Free ({freeCount})
                </button>
                <button
                  type="button"
                  onClick={() => updateQueryParams({ tier: 'PRO', page: 1 })}
                  className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                    tierFilter === 'PRO' ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 shadow-sm' : 'text-yellow-500/70 hover:text-yellow-400'
                  }`}
                >
                  <FaCrown className="text-[9px]" /> Pro ({proCount})
                </button>
              </div>

              {/* Year Filter */}
              <div className="flex-1 sm:flex-initial flex items-center gap-1.5 bg-[#0b0e14] border border-gray-800 px-3 py-1.5 rounded-xl">
                <FaFilter className="text-gray-500 text-[10px]" />
                <span className="text-[11px] sm:text-xs text-gray-400 font-bold uppercase">Year:</span>
                <select
                  value={yearFilter}
                  onChange={(e) => updateQueryParams({ year: e.target.value, page: 1 })}
                  className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer w-full"
                >
                  <option value="ALL" className="bg-[#141822] text-white">All Years</option>
                  {uniqueYears.map((yr) => (
                    <option key={yr} value={yr} className="bg-[#141822] text-white">
                      {yr} ({questions.filter((q) => q.year === yr).length})
                    </option>
                  ))}
                </select>
              </div>

              {/* Page Size Selector */}
              <div className="flex items-center gap-1.5 bg-[#0b0e14] border border-gray-800 px-2.5 py-1.5 rounded-xl">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => updateQueryParams({ limit: e.target.value, page: 1 })}
                  className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value={10} className="bg-[#141822] text-white">10</option>
                  <option value={15} className="bg-[#141822] text-white">15</option>
                  <option value={25} className="bg-[#141822] text-white">25</option>
                  <option value={50} className="bg-[#141822] text-white">50</option>
                </select>
              </div>
            </div>
          </div>

          {/* DUAL PANE WORKSPACE */}
          {loadingQuestions ? (
            <div className="h-72 flex flex-col items-center justify-center gap-3 text-gray-400">
              <FiLoader className="animate-spin text-orange-500 text-3xl" />
              <p className="text-xs font-bold uppercase tracking-widest">Loading Question Bank...</p>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="p-8 sm:p-12 text-center text-gray-500 bg-[#141822] rounded-3xl border border-gray-800 space-y-2">
              <FaLayerGroup className="mx-auto text-3xl text-gray-600" />
              <p className="text-sm font-bold text-gray-300">No questions found matching your filter criteria.</p>
              <p className="text-xs text-gray-500">Try adjusting your keyword search or year filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT PANE: RESPONSIVE QUESTION LIST */}
              <div className="lg:col-span-7 space-y-3 w-full">
                <div className="bg-[#141822] border border-gray-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl">
                  <div className="divide-y divide-gray-800/60">
                    {paginatedQuestions.map((q, idx) => {
                      const absoluteIndex = (currentPage - 1) * pageSize + idx + 1;
                      const isSelected = activeQuestion?.id === q.id;

                      return (
                        <div
                          key={q.id}
                          onClick={() => handleQuestionClick(q)}
                          className={`p-3.5 sm:p-4 transition cursor-pointer flex items-start justify-between gap-3 ${
                            isSelected
                              ? 'bg-orange-600/10 border-l-4 border-orange-500 text-white'
                              : 'hover:bg-[#0b0e14] text-gray-300 active:bg-orange-600/5'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
                            <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg text-[10px] sm:text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected ? 'bg-orange-600 text-white' : 'bg-[#0b0e14] text-gray-400 border border-gray-800'
                            }`}>
                              {absoluteIndex}
                            </span>
                            <div className="space-y-1.5 min-w-0">
                              <p className="text-xs sm:text-sm font-semibold line-clamp-2 leading-relaxed text-white">
                                {q.question_text}
                              </p>
                              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 bg-[#0b0e14] px-1.5 sm:px-2 py-0.5 rounded border border-gray-800">
                                  {q.year ? `Year ${q.year}` : 'General'}
                                </span>
                                {q.is_free ? (
                                  <span className="text-[8px] sm:text-[9px] font-bold text-gray-300 bg-gray-800 px-1.5 py-0.5 rounded">
                                    FREE
                                  </span>
                                ) : (
                                  <span className="text-[8px] sm:text-[9px] font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                    <FaCrown className="text-[7px]" /> PRO
                                  </span>
                                )}
                                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                                  Ans: ({q.correct_option})
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => handleDelete(q.id, e)}
                              className="text-gray-500 hover:text-red-400 p-1.5 sm:p-2 rounded-lg transition cursor-pointer hover:bg-red-500/10"
                              title="Delete Question"
                            >
                              <FaTrashAlt className="text-xs" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* PAGINATION CONTROLLER */}
                <div className="bg-[#141822] border border-gray-800 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
                  <span>
                    Page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong> ({filteredQuestions.length} Items)
                  </span>

                  <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => updateQueryParams({ page: Math.max(1, currentPage - 1) })}
                      className="p-2 bg-[#0b0e14] hover:bg-gray-800 disabled:opacity-30 border border-gray-800 rounded-lg text-gray-300 transition cursor-pointer shrink-0"
                    >
                      <FaChevronLeft className="text-xs" />
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 2))
                      .map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => updateQueryParams({ page: p })}
                          className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition cursor-pointer shrink-0 ${
                            currentPage === p
                              ? 'bg-orange-600 text-white shadow-sm'
                              : 'bg-[#0b0e14] text-gray-400 hover:text-white border border-gray-800'
                          }`}
                        >
                          {p}
                        </button>
                      ))}

                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => updateQueryParams({ page: Math.min(totalPages, currentPage + 1) })}
                      className="p-2 bg-[#0b0e14] hover:bg-gray-800 disabled:opacity-30 border border-gray-800 rounded-lg text-gray-300 transition cursor-pointer shrink-0"
                    >
                      <FaChevronRight className="text-xs" />
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT PANE: DESKTOP STICKY QUESTION INSPECTOR */}
              <div className="hidden lg:block lg:col-span-5 sticky top-6">
                {activeQuestion ? (
                  <div className="bg-[#141822] border border-gray-800 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                    {renderInspectorContent(activeQuestion)}
                  </div>
                ) : (
                  <div className="bg-[#141822] border border-gray-800 rounded-3xl p-10 text-center text-gray-500 space-y-3">
                    <FaEye className="mx-auto text-2xl text-gray-600" />
                    <p className="text-xs font-bold">Select any question on the left to inspect full options and explanations.</p>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MOBILE BOTTOM SLIDE-UP INSPECTOR DRAWER                       */}
      {/* ------------------------------------------------------------- */}
      {showMobileInspector && activeQuestion && (
        <div className="fixed inset-0 z-50 lg:hidden bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-[#141822] border border-gray-800 rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-5 sm:p-6 shadow-2xl relative space-y-4 text-white">
            <button
              onClick={() => setShowMobileInspector(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 bg-[#0b0e14] border border-gray-800 rounded-xl cursor-pointer"
            >
              <FaTimes />
            </button>
            {renderInspectorContent(activeQuestion)}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CREATE SUBJECT MODAL                                          */}
      {/* ------------------------------------------------------------- */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141822] border border-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4 text-white">
            <button
              onClick={() => setShowAddSubjectModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white cursor-pointer"
            >
              <FaTimes />
            </button>

            <div>
              <h3 className="text-xl font-bold text-white">Create New Subject</h3>
              <p className="text-xs text-gray-400 mt-0.5">Add a subject to your CBT curriculum.</p>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="e.g. Physics"
                  className="w-full bg-[#0b0e14] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Subject Code (3-4 chars)</label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={newSubCode}
                  onChange={(e) => setNewSubCode(e.target.value)}
                  placeholder="e.g. PHY"
                  className="w-full bg-[#0b0e14] border border-gray-800 rounded-xl p-3 text-sm font-mono uppercase text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={submittingSubject}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-800 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 cursor-pointer"
              >
                {submittingSubject ? <FaSpinner className="animate-spin" /> : 'Save Subject'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionsExplorerFallback() {
  return (
    <div className="h-[70vh] w-full flex flex-col items-center justify-center gap-3 text-gray-400">
      <FiLoader className="animate-spin text-orange-500 text-3xl" />
      <p className="text-xs font-bold uppercase tracking-widest">Loading Questions Explorer...</p>
    </div>
  );
}

export default function QuestionsExplorerPage() {
  return (
    <Suspense fallback={<QuestionsExplorerFallback />}>
      <QuestionsExplorerContent />
    </Suspense>
  );
}