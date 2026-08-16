'use client';

import { useState, useEffect, Suspense } from 'react';
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
  FaSpinner
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
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('ALL');

  // Modal State for adding new subject
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [submittingSubject, setSubmittingSubject] = useState(false);

  useEffect(() => {
    fetchSubjectSummary();
  }, []);

  const fetchSubjectSummary = async () => {
    setLoading(true);
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
    setLoading(false);
  };

  // Seed default subjects if empty
  const handleSeedDefaults = async () => {
    setLoading(true);
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
    setLoading(false);
  };

  // Create single new subject
  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubCode.trim()) return;

    setSubmittingSubject(true);
    const { data, error } = await supabase
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

  // Fetch questions for a clicked subject
  const handleSelectSubject = async (subject) => {
    setSelectedSubject(subject);
    setLoading(true);
    const { data } = await supabase
      .from('questions')
      .select('*')
      .eq('subject_id', subject.id)
      .order('year', { ascending: false });

    setQuestions(data || []);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    const { error } = await supabase.from('questions').delete().eq('id', id);
    if (!error) {
      toast.success('Question deleted.');
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      fetchSubjectSummary();
    } else {
      toast.error(error.message);
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.question_text?.toLowerCase().includes(search.toLowerCase());
    const matchesYear = yearFilter === 'ALL' || q.year === Number(yearFilter);
    return matchesSearch && matchesYear;
  });

  const uniqueYears = [...new Set(questions.map((q) => q.year).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* Header with Add Subject buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Questions Bank Explorer</h1>
          <p className="text-gray-400 text-sm mt-1">
            {selectedSubject 
              ? `Browsing questions for ${selectedSubject.name}`
              : 'Select a subject from the grid to manage and view questions.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!selectedSubject ? (
            <>
              {subjects.length === 0 && !loading && (
                <button
                  onClick={handleSeedDefaults}
                  disabled={loading}
                  className="flex items-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  <FaMagic /> Auto-Seed OAU Subjects
                </button>
              )}
              <button
                onClick={() => setShowAddSubjectModal(true)}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-md shadow-orange-600/30 cursor-pointer"
              >
                <FaPlus /> Add New Subject
              </button>
            </>
          ) : (
            <button
              onClick={() => setSelectedSubject(null)}
              className="flex items-center gap-2 bg-[#161922] hover:bg-gray-800 border border-gray-800 text-gray-300 px-4 py-2 rounded-xl text-xs font-bold transition w-fit cursor-pointer"
            >
              <FaArrowLeft /> Back to Subjects Grid
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* VIEW 1: SUBJECTS GRID CARDS */}
      {/* ------------------------------------------------------------- */}
      {!selectedSubject ? (
        <>
          {loading && subjects.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-gray-400">
              <FiLoader className="animate-spin text-orange-500 text-3xl" />
              <p className="text-xs font-bold uppercase tracking-widest">Loading Subjects Bank...</p>
            </div>
          ) : subjects.length === 0 && !loading ? (
            <div className="bg-[#161922] border border-gray-800 rounded-3xl p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-orange-600/10 text-orange-400 border border-orange-500/20 rounded-2xl flex items-center justify-center text-2xl mx-auto">
                <FaBook />
              </div>
              <h3 className="text-xl font-bold text-white">No Subjects Found in Database</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Click below to instantly initialize the official OAU UTME subjects or manually create your own.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleSeedDefaults}
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold rounded-xl transition shadow-lg shadow-orange-600/30 flex items-center gap-2 cursor-pointer"
                >
                  <FaMagic /> Seed Default OAU Subjects
                </button>
                <button
                  onClick={() => setShowAddSubjectModal(true)}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-extrabold rounded-xl transition border border-gray-700 cursor-pointer"
                >
                  Create Custom Subject
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {subjects.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => handleSelectSubject(sub)}
                  className="bg-[#161922] hover:border-orange-500 border border-gray-800 p-6 rounded-2xl cursor-pointer transition hover:-translate-y-1 group shadow-sm flex flex-col justify-between h-40"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 font-black text-xs flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition">
                      {sub.code || 'OAU'}
                    </span>
                    <span className="text-xs font-mono font-bold text-gray-400 bg-[#0f1117] px-2.5 py-1 rounded-md border border-gray-800">
                      {sub.total_questions} Questions
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-base group-hover:text-orange-400 transition line-clamp-1">
                      {sub.name}
                    </h3>
                    <span className="text-xs text-gray-500 font-medium">Click to manage & view bank →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* ------------------------------------------------------------- */
        /* VIEW 2: SUBJECT QUESTION LIST VIEW */
        /* ------------------------------------------------------------- */
        <div className="space-y-4">
          <div className="bg-[#161922] border border-gray-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <FaSearch className="absolute left-3.5 top-3.5 text-gray-500 text-xs" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search within this subject..."
                className="w-full bg-[#0f1117] border border-gray-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-gray-400 font-bold uppercase">Year:</span>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="bg-[#0f1117] border border-gray-800 text-white rounded-xl px-3 py-2 text-xs font-semibold"
              >
                <option value="ALL">All Years</option>
                {uniqueYears.map((yr) => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Question Cards / Loader */}
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-gray-400">
              <FiLoader className="animate-spin text-orange-500 text-3xl" />
              <p className="text-xs font-bold uppercase tracking-widest">Loading Subject Questions...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredQuestions.map((q, idx) => (
                <div key={q.id} className="bg-[#161922] border border-gray-800 rounded-2xl p-5 space-y-3 hover:border-gray-700 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-orange-600/20 text-orange-400 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-gray-400">Year {q.year || 'N/A'}</span>
                      {q.is_free ? (
                        <span className="text-[10px] bg-gray-800 text-gray-300 font-semibold px-2 py-0.5 rounded">
                          FREE
                        </span>
                      ) : (
                        <span className="text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <FaCrown className="text-[9px]" /> PRO
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete(q.id)}
                      className="text-gray-500 hover:text-red-400 p-1.5 transition cursor-pointer"
                      title="Delete Question"
                    >
                      <FaTrashAlt className="text-xs" />
                    </button>
                  </div>

                  <div className="text-sm font-semibold text-gray-100">
                    {q.question_text}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {['a', 'b', 'c', 'd'].map((optKey) => {
                      const optUpper = optKey.toUpperCase();
                      const isCorrect = q.correct_option === optUpper;
                      return (
                        <div
                          key={optKey}
                          className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                            isCorrect
                              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-semibold'
                              : 'border-gray-800/80 bg-[#0f1117] text-gray-400'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                            isCorrect ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-400'
                          }`}>
                            {optUpper}
                          </span>
                          <span>{q[`option_${optKey}`]}</span>
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="text-[11px] text-gray-400 bg-[#0f1117] p-2.5 rounded-xl border border-gray-800/80">
                      <span className="font-bold text-orange-400">Explanation:</span> {q.explanation}
                    </div>
                  )}
                </div>
              ))}

              {filteredQuestions.length === 0 && !loading && (
                <div className="p-12 text-center text-gray-500 bg-[#161922] rounded-2xl border border-gray-800">
                  No questions found for this criteria.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* CREATE SUBJECT MODAL */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161922] border border-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
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
                  className="w-full bg-[#0f1117] border border-gray-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  className="w-full bg-[#0f1117] border border-gray-800 rounded-xl p-3 text-sm font-mono uppercase text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
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