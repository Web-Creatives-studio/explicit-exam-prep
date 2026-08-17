'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../utils/supabase/client';
import { toast } from 'react-toastify';
import { 
  FaCalendarAlt, 
  FaBook, 
  FaCloudUploadAlt, 
  FaSpinner, 
  FaPlusCircle, 
  FaCheckCircle, 
  FaLayerGroup,
  FaTrashAlt,
  FaFileAlt
} from 'react-icons/fa';

export default function AdminMockBuilder() {
  const supabase = createClient();

  // State Management
  const [mocks, setMocks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedMockId, setSelectedMockId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  
  // New Mock Creation Fields
  const [newMockTitle, setNewMockTitle] = useState('');
  const [newMockDate, setNewMockDate] = useState('');
  const [creatingMock, setCreatingMock] = useState(false);

  // Raw Text Question Input & Parsing
  const [rawText, setRawText] = useState('');
  const [uploadingQuestions, setUploadingQuestions] = useState(false);
  const [mockSubjectCounts, setMockSubjectCounts] = useState({});

  // 1. Fetch existing weekly mocks and subjects
  useEffect(() => {
    fetchInitialData();
  }, []);

  // 2. Fetch question distribution counts when a mock is selected
  useEffect(() => {
    if (selectedMockId) {
      fetchMockQuestionCounts(selectedMockId);
    }
  }, [selectedMockId]);

  const fetchInitialData = async () => {
    // Fetch subjects
    const { data: subs } = await supabase
      .from('subjects')
      .select('*')
      .order('name', { ascending: true });
    setSubjects(subs || []);
    if (subs?.length > 0) setSelectedSubjectId(subs[0].id);

    // Fetch weekly mocks
    const { data: mockList } = await supabase
      .from('weekly_mocks')
      .select('*')
      .order('active_date', { ascending: false });
    setMocks(mockList || []);
    if (mockList?.length > 0) setSelectedMockId(mockList[0].id);
  };

  const fetchMockQuestionCounts = async (mockId) => {
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
  // 4. Robust Text Parser (Matches 1. / A) / A. / ANSWER: / EXPLANATION:)
  // -----------------------------------------------------------------
  const parseQuestionsFromText = (text) => {
    const blocks = text.trim().split(/\n\s*\n+/);
    const parsedQuestions = [];

    for (const block of blocks) {
      const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length < 5) continue; // Needs at least question stem, 4 options, and answer

      let question_text = '';
      let option_a = '';
      let option_b = '';
      let option_c = '';
      let option_d = '';
      let correct_option = '';
      let explanation = '';
      let topic = 'General';
      let exam_year = 2026;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (/^1?\d+[\.\)]\s*/i.test(line) && !question_text) {
          question_text = line.replace(/^1?\d+[\.\)]\s*/i, '').trim();
        } else if (/^[A][\.\)]\s*/i.test(line)) {
          option_a = line.replace(/^[A][\.\)]\s*/i, '').trim();
        } else if (/^[B][\.\)]\s*/i.test(line)) {
          option_b = line.replace(/^[B][\.\)]\s*/i, '').trim();
        } else if (/^[C][\.\)]\s*/i.test(line)) {
          option_c = line.replace(/^[C][\.\)]\s*/i, '').trim();
        } else if (/^[D][\.\)]\s*/i.test(line)) {
          option_d = line.replace(/^[D][\.\)]\s*/i, '').trim();
        } else if (/^(ANSWER|ANS):\s*/i.test(line)) {
          correct_option = line.replace(/^(ANSWER|ANS):\s*/i, '').trim().toUpperCase();
        } else if (/^EXPLANATION:\s*/i.test(line)) {
          explanation = line.replace(/^EXPLANATION:\s*/i, '').trim();
        } else if (/^TOPIC:\s*/i.test(line)) {
          topic = line.replace(/^TOPIC:\s*/i, '').trim();
        } else if (/^YEAR:\s*/i.test(line)) {
          exam_year = parseInt(line.replace(/^YEAR:\s*/i, '').trim()) || 2026;
        }
      }

      if (question_text && option_a && option_b && option_c && option_d && correct_option) {
        parsedQuestions.push({
          question_text,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_option: correct_option.charAt(0),
          explanation: explanation || 'No explanation provided.',
          topic,
          exam_year,
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
      toast.error('Could not parse any valid questions. Please verify format.');
      return;
    }

    setUploadingQuestions(true);

    try {
      // Step A: Insert into main questions table with selected subject_id
      const formattedQuestions = parsedList.map((q) => ({
        ...q,
        subject_id: selectedSubjectId,
      }));

      const { data: insertedQuestions, error: qError } = await supabase
        .from('questions')
        .insert(formattedQuestions)
        .select('id');

      if (qError) throw qError;

      // Step B: Link inserted questions to weekly_mock_questions
      const mockLinks = insertedQuestions.map((q) => ({
        mock_id: selectedMockId,
        question_id: q.id,
        subject_id: selectedSubjectId,
      }));

      const { error: linkError } = await supabase
        .from('weekly_mock_questions')
        .insert(mockLinks);

      if (linkError) throw linkError;

      toast.success(`Successfully uploaded ${insertedQuestions.length} questions for this subject!`);
      setRawText('');
      fetchMockQuestionCounts(selectedMockId);
    } catch (err) {
      toast.error(err.message || 'Failed to upload questions.');
    } finally {
      setUploadingQuestions(false);
    }
  };

  const selectedMock = mocks.find((m) => m.id === selectedMockId);
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <div className="max-w-6xl mx-auto space-y-8 select-none">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
          <FaLayerGroup className="text-orange-500" /> Weekly Mock Builder & Subject Uploader
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Create mock editions and manually upload 10 questions per subject via text format.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: CREATE NEW MOCK & MOCK SELECTOR */}
        <div className="space-y-6">
          
          {/* Create Mock Box */}
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
                  placeholder="e.g. Mock Challenge - Week 4"
                  className="w-full px-3.5 py-2.5 bg-[#0b0e14] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">
                  Target Friday Date
                </label>
                <input
                  type="date"
                  required
                  value={newMockDate}
                  onChange={(e) => setNewMockDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0b0e14] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
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

          {/* Active Mock Selection & Status */}
          <div className="bg-[#141822] border border-gray-800 p-5 rounded-3xl space-y-4 shadow-xl">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <FaCalendarAlt className="text-orange-500" /> Select Active Mock Edition
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
                Uploaded Questions Per Subject:
              </div>

              <div className="space-y-1.5  overflow-y-auto pr-1">
                {subjects.map((sub) => {
                  const count = mockSubjectCounts[sub.id] || 0;
                  return (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between px-3 py-2 bg-[#0b0e14] rounded-xl border border-gray-800 text-xs"
                    >
                      <span className="font-semibold text-gray-300">{sub.name}</span>
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                          count >= 10
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

        {/* RIGHT COLUMN: MANUAL SUBJECT QUESTION TEXT UPLOADER */}
        <div className="lg:col-span-2 bg-[#141822] border border-gray-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl flex flex-col justify-between">
          
          <div className="space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <FaCloudUploadAlt className="text-orange-500 text-lg" /> 2. Upload Questions for Subject
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Uploading to: <strong className="text-white">{selectedMock?.title || 'No mock selected'}</strong>
                </p>
              </div>

              {/* Subject Dropdown */}
              <div className="min-w-[180px]">
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#0b0e14] border border-gray-800 rounded-xl text-xs font-bold text-orange-400 focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Formatting Help Box */}
            <div className="bg-[#0b0e14] border border-gray-800 p-3.5 rounded-2xl text-[11px] text-gray-400 space-y-1 font-mono">
              <div className="text-gray-300 font-sans font-bold flex items-center gap-1.5">
                <FaFileAlt className="text-orange-500 text-xs" /> Format Guide:
              </div>
              <p className="text-gray-500">
                1. What is the unit of electric current?<br />
                A. Volt<br />
                B. Ampere<br />
                C. Ohm<br />
                D. Watt<br />
                ANSWER: B<br />
                EXPLANATION: Current is measured in Amperes.
              </p>
            </div>

            {/* Textarea */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5 tracking-wider">
                Paste {selectedSubject?.name || 'Subject'} Questions Here:
              </label>
              <textarea
                rows={12}
                required
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={`1. Question text here...\nA. Option A\nB. Option B\nC. Option C\nD. Option D\nANSWER: A\nEXPLANATION: Step by step breakdown...`}
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
              className="px-4 py-2.5 bg-transparent hover:bg-red-500/10 border border-transparent hover:border-red-500/30 text-red-400 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
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
    </div>
  );
}