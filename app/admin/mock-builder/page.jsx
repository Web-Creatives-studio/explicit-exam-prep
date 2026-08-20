'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '../../utils/supabase/client';
import { toast } from 'react-toastify';
import { 
  FaCalendarAlt, 
  FaCloudUploadAlt, 
  FaSpinner, 
  FaPlusCircle, 
  FaCheckCircle, 
  FaLayerGroup,
  FaTrashAlt,
  FaCrown,
  FaTimes,
  FaEye,
  FaInfoCircle,
  FaSearch,
  FaExclamationTriangle
} from 'react-icons/fa';

export default function AdminMockBuilder() {
  const supabase = createClient();

  // State Management
  const [mocks, setMocks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedMockId, setSelectedMockId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  
  // Batch Defaults for Ingestion
  const [batchYear, setBatchYear] = useState(2026);
  const [batchIsFree, setBatchIsFree] = useState(false);

  // New Mock Creation Fields
  const [newMockTitle, setNewMockTitle] = useState('');
  const [newMockDate, setNewMockDate] = useState('');
  const [creatingMock, setCreatingMock] = useState(false);

  // Raw Text Question Input & Parsing
  const [rawText, setRawText] = useState('');
  const [uploadingQuestions, setUploadingQuestions] = useState(false);
  const [mockSubjectCounts, setMockSubjectCounts] = useState({});

  // Modal View: Questions linked to active mock
  const [linkedQuestions, setLinkedQuestions] = useState([]);
  const [viewingSubjectQuestions, setViewingSubjectQuestions] = useState(null);
  const [loadingLinkedQuestions, setLoadingLinkedQuestions] = useState(false);
  const [activeInspectedQuestion, setActiveInspectedQuestion] = useState(null);
  const [modalSearch, setModalSearch] = useState('');

  // 1. Fetch initial mock editions and subjects
  useEffect(() => {
    fetchInitialData();
  }, []);

  // 2. Fetch question distribution counts when a mock is selected
  useEffect(() => {
    if (selectedMockId) {
      fetchMockQuestionCounts(selectedMockId);
    }
  }, [selectedMockId]);

  // Lock background body scroll when modal is open
  useEffect(() => {
    if (viewingSubjectQuestions) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [viewingSubjectQuestions]);

  const fetchInitialData = async () => {
    const { data: subs } = await supabase
      .from('subjects')
      .select('id, name, code')
      .order('name', { ascending: true });
    setSubjects(subs || []);
    if (subs?.length > 0) setSelectedSubjectId(subs[0].id);

    const { data: mockList } = await supabase
      .from('weekly_mocks')
      .select('id, title, active_date, is_published')
      .order('active_date', { ascending: false });
    setMocks(mockList || []);
    if (mockList?.length > 0) setSelectedMockId(mockList[0].id);
  };

  const fetchMockQuestionCounts = async (mockId) => {
    if (!mockId) return;
    const { data } = await supabase
      .from('weekly_mock_questions')
      .select('subject_id')
      .eq('mock_id', mockId);

    const counts = {};
    data?.forEach((row) => {
      counts[row.subject_id] = (counts[row.subject_id] || 0) + 1;
    });
    setMockSubjectCounts(counts);
  };

  // -----------------------------------------------------------------
  // 3. Create a New Weekly Mock Challenge Edition
  // -----------------------------------------------------------------
  const handleCreateMock = async (e) => {
    e.preventDefault();
    if (!newMockTitle.trim() || !newMockDate) {
      toast.error('Please enter mock title and Friday target date.');
      return;
    }

    setCreatingMock(true);
    try {
      const { data, error } = await supabase
        .from('weekly_mocks')
        .insert({
          title: newMockTitle.trim(),
          active_date: newMockDate,
          is_published: true,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('New Weekly Mock edition created!');
      setMocks([data, ...mocks]);
      setSelectedMockId(data.id);
      setNewMockTitle('');
      setNewMockDate('');
    } catch (err) {
      toast.error(err.message || 'Failed to create mock challenge.');
    } finally {
      setCreatingMock(false);
    }
  };

  // -----------------------------------------------------------------
  // 4. Robust, Multi-Format Text Question Parser
  // -----------------------------------------------------------------
  const parseQuestionsFromText = (text) => {
    if (!text || !text.trim()) return [];

    // Normalize Windows/Mac/Linux line breaks
    const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Split by question number headers (e.g., "1.", "1)", "(1)", "Question 1:", "Q1.")
    const rawBlocks = cleanText
      .split(/(?=(?:^[ \t]*(?:(?:Question|Q)?[ \t]*\d+[.\):]|[\[(]\d+[\])])))/gim)
      .map((b) => b.trim())
      .filter(Boolean);

    const parsedQuestions = [];

    for (let block of rawBlocks) {
      if (!block) continue;

      let explanation = '';
      let correct_option = '';
      let question_text = '';
      let option_a = '';
      let option_b = '';
      let option_c = '';
      let option_d = '';

      // 1. Extract Explanation if present at the end
      const expRegex = /(?:^|\n)[ \t]*(?:EXPLANATION|EXP|REASON|SOLUTION|WHY)[ \t]*:?[ \t]*([\s\S]*)$/i;
      const expMatch = block.match(expRegex);
      if (expMatch) {
        explanation = expMatch[1].trim();
        block = block.replace(expRegex, '').trim();
      }

      // 2. Extract Answer Key (e.g., "ANSWER: A", "ANS: (B)", "Correct Option: C", "[ANS: D]")
      const ansRegex = /(?:^|\n)[ \t]*(?:ANSWER|ANS|CORRECT|CORRECT OPTION|KEY)[ \t]*:?[ \t]*[\[(]?([A-D])[\])]?[ \t]*(?:\n|$)/i;
      const ansMatch = block.match(ansRegex);
      if (ansMatch) {
        correct_option = ansMatch[1].toUpperCase();
        block = block.replace(ansRegex, '\n').trim();
      }

      // 3. Robust Option Boundary Splitting
      const optDelimRegex = /(?:^|\n)[ \t]*(?:[\[(]?([A-D])[\]).:])[ \t]+/gi;
      const matches = [...block.matchAll(optDelimRegex)];

      if (matches.length >= 4) {
        // Question text is everything before Option A
        const firstOptIndex = matches[0].index;
        question_text = block
          .substring(0, firstOptIndex)
          .replace(/^[ \t]*(?:(?:Question|Q)?[ \t]*\d+[.\):]|[\[(]\d+[\])])[ \t]*/i, '')
          .trim();

        // Extract option text by tracking boundaries between matches
        for (let i = 0; i < matches.length; i++) {
          const letter = matches[i][1].toUpperCase();
          const startIndex = matches[i].index + matches[i][0].length;
          const endIndex = i + 1 < matches.length ? matches[i + 1].index : block.length;
          const content = block.substring(startIndex, endIndex).trim();

          if (letter === 'A' && !option_a) option_a = content;
          else if (letter === 'B' && !option_b) option_b = content;
          else if (letter === 'C' && !option_c) option_c = content;
          else if (letter === 'D' && !option_d) option_d = content;
        }
      } else {
        // Line-by-line fallback parser for compact formats
        const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
        let currentSection = 'question';

        for (const line of lines) {
          const optMatch = line.match(/^[\[(]?([A-D])[\]).:][ \t]+([\s\S]*)/i);
          if (optMatch) {
            const letter = optMatch[1].toUpperCase();
            const text = optMatch[2].trim();
            if (letter === 'A') { option_a = text; currentSection = 'A'; }
            else if (letter === 'B') { option_b = text; currentSection = 'B'; }
            else if (letter === 'C') { option_c = text; currentSection = 'C'; }
            else if (letter === 'D') { option_d = text; currentSection = 'D'; }
          } else if (currentSection === 'question') {
            const cleanLine = line.replace(/^[ \t]*(?:(?:Question|Q)?[ \t]*\d+[.\):]|[\[(]\d+[\])])[ \t]*/i, '');
            question_text += (question_text ? '\n' : '') + cleanLine;
          } else if (['A', 'B', 'C', 'D'].includes(currentSection)) {
            if (currentSection === 'A') option_a += '\n' + line;
            if (currentSection === 'B') option_b += '\n' + line;
            if (currentSection === 'C') option_c += '\n' + line;
            if (currentSection === 'D') option_d += '\n' + line;
          }
        }
      }

      // Default fallback if no answer key was parsed
      if (!correct_option) {
        correct_option = 'A';
      }

      // Push valid question only if all essential fields exist
      if (question_text.trim() && option_a.trim() && option_b.trim() && option_c.trim() && option_d.trim()) {
        parsedQuestions.push({
          question_text: question_text.trim(),
          option_a: option_a.trim(),
          option_b: option_b.trim(),
          option_c: option_c.trim(),
          option_d: option_d.trim(),
          correct_option,
          explanation: explanation.trim() || 'No detailed explanation provided for this question.',
          year: Number(batchYear) || 2026,
          is_free: Boolean(batchIsFree),
        });
      }
    }

    return parsedQuestions;
  };

  // -----------------------------------------------------------------
  // 5. Upload Parsed Subject Questions & Link to Selected Mock
  // -----------------------------------------------------------------
  const handleUploadSubjectQuestions = async (e) => {
    e.preventDefault();

    if (!selectedMockId) {
      toast.error('Please select a Weekly Mock edition first.');
      return;
    }

    if (!selectedSubjectId) {
      toast.error('Please select a subject.');
      return;
    }

    if (!rawText.trim()) {
      toast.error('Please paste formatted questions into the textbox.');
      return;
    }

    const parsedList = parseQuestionsFromText(rawText);

    if (parsedList.length === 0) {
      toast.error('Could not parse any valid questions. Please ensure Question and A/B/C/D options exist.');
      return;
    }

    setUploadingQuestions(true);

    try {
      const formattedQuestions = parsedList.map((q) => ({
        ...q,
        subject_id: selectedSubjectId,
      }));

      // 1. Insert directly into public.questions
      const { data: insertedQuestions, error: qError } = await supabase
        .from('questions')
        .insert(formattedQuestions)
        .select('id');

      if (qError) throw qError;

      if (!insertedQuestions || insertedQuestions.length === 0) {
        throw new Error('Database accepted request but returned no record IDs.');
      }

      // 2. Link each created question into weekly_mock_questions
      const mockLinks = insertedQuestions.map((q) => ({
        mock_id: selectedMockId,
        question_id: q.id,
        subject_id: selectedSubjectId,
      }));

      const { error: linkError } = await supabase
        .from('weekly_mock_questions')
        .insert(mockLinks);

      if (linkError) throw linkError;

      toast.success(`Successfully uploaded ${insertedQuestions.length} complete questions!`);
      setRawText('');
      fetchMockQuestionCounts(selectedMockId);
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(err.message || 'Failed to upload questions to database.');
    } finally {
      setUploadingQuestions(false);
    }
  };

  // -----------------------------------------------------------------
  // 6. View & Manage Linked Questions with Full Joins
  // -----------------------------------------------------------------
  const handleViewSubjectQuestions = useCallback(async (sub) => {
    setViewingSubjectQuestions(sub);
    setLoadingLinkedQuestions(true);
    setModalSearch('');

    const { data, error } = await supabase
      .from('weekly_mock_questions')
      .select(`
        id,
        mock_id,
        subject_id,
        question_id,
        created_at,
        questions:question_id (
          id,
          subject_id,
          question_text,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_option,
          explanation,
          year,
          is_free
        )
      `)
      .eq('mock_id', selectedMockId)
      .eq('subject_id', sub.id)
      .order('created_at', { ascending: true });

    if (error) {
      toast.error('Failed to load linked questions from database.');
    }

    const list = data || [];
    setLinkedQuestions(list);
    setActiveInspectedQuestion(list[0] || null);
    setLoadingLinkedQuestions(false);
  }, [selectedMockId, supabase]);

  const handleRemoveQuestionFromMock = async (linkId, e) => {
    if (e) e.stopPropagation();
    if (!confirm('Remove this question from the mock challenge?')) return;

    const { error } = await supabase
      .from('weekly_mock_questions')
      .delete()
      .eq('id', linkId);

    if (!error) {
      toast.success('Question detached from mock.');
      const updated = linkedQuestions.filter((item) => item.id !== linkId);
      setLinkedQuestions(updated);
      if (activeInspectedQuestion?.id === linkId) {
        setActiveInspectedQuestion(updated[0] || null);
      }
      fetchMockQuestionCounts(selectedMockId);
    } else {
      toast.error(error.message);
    }
  };

  const filteredModalQuestions = useMemo(() => {
    if (!modalSearch.trim()) return linkedQuestions;
    return linkedQuestions.filter((item) =>
      item.questions?.question_text?.toLowerCase().includes(modalSearch.toLowerCase())
    );
  }, [linkedQuestions, modalSearch]);

  const selectedMock = mocks.find((m) => m.id === selectedMockId);
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <div className="max-w-6xl mx-auto space-y-8 select-none selection:bg-orange-500 selection:text-white">
      
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
          <FaLayerGroup className="text-orange-500" /> Weekly Mock Builder & Batch Ingestion
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Create live Friday mock editions and batch-upload questions per subject via text format.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: CREATE NEW MOCK & SUBJECT TALLY */}
        <div className="space-y-6">
          
          {/* Create Mock Edition Card */}
          <div className="bg-[#141822] border border-gray-800 p-5 rounded-3xl space-y-4 shadow-xl">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <FaPlusCircle className="text-orange-500" /> 1. Create New Mock Edition
            </h3>

            <form onSubmit={handleCreateMock} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">
                  Mock Title
                </label>
                <input
                  type="text"
                  required
                  value={newMockTitle}
                  onChange={(e) => setNewMockTitle(e.target.value)}
                  placeholder="e.g. Nationwide Mock Challenge - Week 3"
                  className="w-full px-3.5 py-2.5 bg-[#0b0e14] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">
                  Target Friday Date (WAT)
                </label>
                <input
                  type="date"
                  required
                  value={newMockDate}
                  onChange={(e) => setNewMockDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0b0e14] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={creatingMock}
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] disabled:bg-orange-500/50 text-white font-extrabold rounded-xl transition text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-600/25 cursor-pointer"
              >
                {creatingMock ? <FaSpinner className="animate-spin" /> : 'Create Mock Edition'}
              </button>
            </form>
          </div>

          {/* Active Mock Selector & Question Tally */}
          <div className="bg-[#141822] border border-gray-800 p-5 rounded-3xl space-y-4 shadow-xl">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <FaCalendarAlt className="text-orange-500" /> Active Mock Challenge
            </h3>

            <div>
              <select
                value={selectedMockId}
                onChange={(e) => setSelectedMockId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0b0e14] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                {mocks.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} ({new Date(m.active_date).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Distribution Breakdown */}
            <div className="space-y-2 pt-2 border-t border-gray-800">
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Uploaded Questions (Click to inspect):
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {subjects.map((sub) => {
                  const count = mockSubjectCounts[sub.id] || 0;
                  const isReady = count >= 10;
                  return (
                    <div
                      key={sub.id}
                      onClick={() => handleViewSubjectQuestions(sub)}
                      className="flex items-center justify-between px-3 py-2 bg-[#0b0e14] hover:bg-[#161a24] rounded-xl border border-gray-800 hover:border-gray-700 text-xs transition cursor-pointer group"
                    >
                      <span className="font-semibold text-gray-300 group-hover:text-white">
                        {sub.name}
                      </span>
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                          isReady
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                        }`}
                      >
                        {count} / 10 Qs
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: MANUAL BATCH INGESTION DESK */}
        <div className="lg:col-span-2 bg-[#141822] border border-gray-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl flex flex-col justify-between">
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <FaCloudUploadAlt className="text-orange-500 text-lg" /> 2. Upload Questions for Subject
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Linking to: <strong className="text-white">{selectedMock?.title || 'No mock selected'}</strong>
                </p>
              </div>

              {/* Subject Selector */}
              <div className="min-w-[180px]">
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#0b0e14] border border-gray-800 rounded-xl text-xs font-bold text-orange-400 focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ingestion Batch Parameters (Year & Free/Pro) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#0b0e14] border border-gray-800 p-3.5 rounded-2xl text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-gray-400 uppercase text-[10px]">Default Exam Year:</span>
                <input
                  type="number"
                  value={batchYear}
                  onChange={(e) => setBatchYear(Number(e.target.value))}
                  className="w-24 px-2 py-1 bg-[#141822] border border-gray-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-gray-400 uppercase text-[10px]">Access Tier:</span>
                <button
                  type="button"
                  onClick={() => setBatchIsFree(!batchIsFree)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    batchIsFree
                      ? 'bg-gray-800 text-gray-300 border border-gray-700'
                      : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                  }`}
                >
                  {batchIsFree ? 'FREE TIER' : <><FaCrown className="text-[10px]" /> PRO ONLY</>}
                </button>
              </div>
            </div>

            {/* Textarea */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5 tracking-wider">
                Paste {selectedSubject?.name || 'Subject'} Questions Here:
              </label>
              <textarea
                rows={11}
                required
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={`1. In the reaction 2H2 + O2 -> 2H2O, what is the stoichiometric ratio?\nA. 1:1\nB. 2:1\nC. 1:2\nD. 2:2\nANSWER: B\nEXPLANATION: 2 moles of Hydrogen react with 1 mole of Oxygen.`}
                className="w-full p-4 bg-[#0b0e14] border border-gray-800 rounded-2xl text-xs sm:text-sm font-mono text-gray-200 placeholder-gray-700 focus:outline-none focus:border-orange-500 leading-relaxed transition"
              />
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={() => setRawText('')}
              disabled={!rawText || uploadingQuestions}
              className="px-4 py-2.5 bg-transparent hover:bg-red-500/10 border border-transparent hover:border-red-500/30 text-red-400 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <FaTrashAlt /> Clear Text
            </button>

            <button
              type="button"
              onClick={handleUploadSubjectQuestions}
              disabled={uploadingQuestions || !rawText.trim()}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] disabled:opacity-40 text-white font-black rounded-xl transition text-xs flex items-center gap-2 shadow-lg shadow-orange-600/30 cursor-pointer"
            >
              {uploadingQuestions ? (
                <>
                  <FaSpinner className="animate-spin" /> Uploading & Linking to Mock...
                </>
              ) : (
                <>
                  <FaCheckCircle /> Save & Upload to {selectedSubject?.name || 'Subject'}
                </>
              )}
            </button>
          </div>

        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: QUESTIONS LIST ON LEFT, PREVIEW ON RIGHT               */}
      {/* ------------------------------------------------------------- */}
      {viewingSubjectQuestions && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setViewingSubjectQuestions(null);
              setActiveInspectedQuestion(null);
            }
          }}
        >
          <div className="bg-[#141822] border border-gray-800 rounded-3xl max-w-5xl w-full h-[88vh] max-h-[850px] overflow-hidden flex flex-col shadow-2xl relative text-white animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Top Header */}
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-[#10131a] shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded border border-orange-500/20">
                    Mock Inspection Desk
                  </span>
                  <span className="text-xs font-mono text-gray-400">
                    {selectedMock?.title}
                  </span>
                </div>
                <h2 className="text-lg font-black text-white mt-1">
                  {viewingSubjectQuestions.name} ({linkedQuestions.length} Questions Attached)
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setViewingSubjectQuestions(null);
                  setActiveInspectedQuestion(null);
                }}
                className="text-gray-400 hover:text-white transition cursor-pointer p-2 bg-[#0b0e14] border border-gray-800 rounded-xl"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body: Split Grid */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-gray-800">
              
              {/* LEFT PANE: ATTACHED QUESTIONS LIST */}
              <div className="lg:col-span-5 p-4 flex flex-col h-full bg-[#0e1118] overflow-hidden">
                
                {/* Search in Modal */}
                <div className="relative mb-3 shrink-0">
                  <FaSearch className="absolute left-3 top-3 text-gray-500 text-xs" />
                  <input
                    type="text"
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    placeholder="Filter questions..."
                    className="w-full bg-[#0b0e14] border border-gray-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Question List */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1.5 scrollbar-thin scrollbar-thumb-gray-800">
                  {loadingLinkedQuestions ? (
                    <div className="h-48 flex flex-col items-center justify-center gap-2 text-gray-400">
                      <FaSpinner className="animate-spin text-orange-500 text-xl" />
                      <span className="text-xs uppercase font-bold tracking-wider">Fetching Questions...</span>
                    </div>
                  ) : filteredModalQuestions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 bg-[#0b0e14] rounded-2xl border border-gray-800 text-xs font-bold">
                      No questions found for this subject.
                    </div>
                  ) : (
                    filteredModalQuestions.map((item, idx) => {
                      const q = item.questions;
                      const isSelected = activeInspectedQuestion?.id === item.id;

                      return (
                        <div
                          key={item.id}
                          onClick={() => setActiveInspectedQuestion(item)}
                          className={`p-3 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                            isSelected
                              ? 'bg-orange-600/15 border-orange-500 text-white shadow-md shadow-orange-600/10'
                              : 'bg-[#141822] hover:bg-[#181c26] border-gray-800 text-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <span className={`w-5 h-5 rounded-md text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected ? 'bg-orange-600 text-white' : 'bg-[#0b0e14] text-gray-400 border border-gray-800'
                            }`}>
                              {idx + 1}
                            </span>
                            <div className="space-y-1 min-w-0">
                              <p className="text-xs font-medium text-white line-clamp-2 leading-relaxed">
                                {q?.question_text || 'No question text loaded'}
                              </p>
                              <div className="flex items-center gap-1.5 text-[10px]">
                                <span className="text-emerald-400 font-mono font-bold">
                                  Ans: ({q?.correct_option || 'N/A'})
                                </span>
                                <span className="text-gray-500">•</span>
                                <span className="text-gray-400">
                                  {q?.year ? `Year ${q.year}` : 'General'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => handleRemoveQuestionFromMock(item.id, e)}
                            className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg transition hover:bg-red-500/10 cursor-pointer shrink-0"
                            title="Remove from Mock"
                          >
                            <FaTrashAlt className="text-xs" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Left Pane Footer Count Badge */}
                <div className="pt-3 border-t border-gray-800 mt-2 flex items-center justify-between text-[11px] text-gray-400 shrink-0">
                  <span>Total in Mock: <strong className="text-white">{linkedQuestions.length}</strong></span>
                  <span className="text-orange-400 font-bold">
                    {linkedQuestions.length >= 10 ? '✓ Target Met (10/10)' : `${Math.max(0, 10 - linkedQuestions.length)} more needed`}
                  </span>
                </div>

              </div>

              {/* RIGHT PANE: LIVE PREVIEW */}
              <div className="lg:col-span-7 p-6 overflow-y-auto space-y-5 bg-[#141822] h-full scrollbar-thin scrollbar-thumb-gray-800">
                {activeInspectedQuestion ? (
                  <div className="space-y-5 animate-in fade-in duration-150">
                    
                    {/* Header Details */}
                    <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500 text-xs">
                          <FaEye />
                        </span>
                        <span className="text-xs font-black uppercase text-white tracking-wider">
                          Question Preview & Details
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-gray-400 bg-[#0b0e14] px-2.5 py-1 rounded-md border border-gray-800">
                          {activeInspectedQuestion.questions?.year ? `UTME ${activeInspectedQuestion.questions.year}` : 'Standard'}
                        </span>
                        {activeInspectedQuestion.questions?.is_free ? (
                          <span className="text-[9px] font-bold text-gray-300 bg-gray-800 px-2 py-0.5 rounded">
                            FREE
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                            <FaCrown className="text-[8px]" /> PRO
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Problem Statement */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        Problem Statement
                      </span>
                      <p className="text-sm font-semibold text-white leading-relaxed whitespace-pre-wrap">
                        {activeInspectedQuestion.questions?.question_text}
                      </p>
                    </div>

                    {/* Options Breakdown */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        Multiple-Choice Options
                      </span>
                      <div className="space-y-2">
                        {['a', 'b', 'c', 'd'].map((key) => {
                          const upperKey = key.toUpperCase();
                          const isCorrect = activeInspectedQuestion.questions?.correct_option === upperKey;
                          const optText = activeInspectedQuestion.questions?.[`option_${key}`];
                          if (!optText) return null;

                          return (
                            <div
                              key={key}
                              className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
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
                                <span className="whitespace-pre-wrap">{optText}</span>
                              </div>
                              {isCorrect && (
                                <span className="text-[9px] uppercase font-black tracking-wider text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1 shrink-0 ml-2">
                                  <FaCheckCircle className="text-[9px]" /> Correct Answer
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step-by-Step Explanation */}
                    <div className="p-3.5 bg-[#0b0e14] rounded-2xl border border-gray-800 space-y-1 text-xs text-gray-300">
                      <div className="text-orange-400 font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                        <FaInfoCircle /> Step-by-Step Explanation
                      </div>
                      <p className="leading-relaxed text-gray-300 text-[11px] whitespace-pre-wrap">
                        {activeInspectedQuestion.questions?.explanation || 'No step-by-step explanation attached to this question.'}
                      </p>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-2 flex items-center justify-between text-xs border-t border-gray-800">
                      <span className="text-gray-500 font-mono text-[10px]">
                        ID: {activeInspectedQuestion.question_id?.slice(0, 12)}...
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveQuestionFromMock(activeInspectedQuestion.id, e)}
                        className="px-3 py-1.5 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white rounded-xl transition font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-red-500/20"
                      >
                        <FaTrashAlt className="text-[10px]" /> Remove From Mock
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2 p-12 text-center">
                    <FaEye className="text-3xl text-gray-600" />
                    <p className="text-xs font-bold text-gray-400">Select any question on the left list to inspect its preview and explanation.</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}