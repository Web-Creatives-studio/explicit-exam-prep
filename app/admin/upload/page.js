'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '../../utils/supabase/client';
import { toast } from 'react-toastify';
import { 
  FaCloudUploadAlt, 
  FaPlus, 
  FaSpinner, 
  FaFileCode, 
  FaFilePdf, 
  FaFileAlt, 
  FaCheckCircle 
} from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';

export const dynamic = 'force-dynamic';

function UploadQuestionsContent() {
  const supabase = createClient();
  const [subjects, setSubjects] = useState([]);
  const [activeTab, setActiveTab] = useState('pdf'); // 'pdf' | 'text' | 'single' | 'bulk_json'
  const [loading, setLoading] = useState(false);
  const [fetchingInitial, setFetchingInitial] = useState(true);

  // Common metadata
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedYear, setSelectedYear] = useState(2024);
  const [isFreeTier, setIsFreeTier] = useState(false);

  // PDF Mode State
  const [pdfStatus, setPdfStatus] = useState('');
  const [pdfParsedPreview, setPdfParsedPreview] = useState([]);

  // Raw Text Mode State
  const [rawText, setRawText] = useState('');
  const [textParsedPreview, setTextParsedPreview] = useState([]);

  // Single Question Form State
  const [singleForm, setSingleForm] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A',
    explanation: '',
  });

  // Bulk JSON state
  const [jsonInput, setJsonInput] = useState('');

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setFetchingInitial(true);
    const { data } = await supabase.from('subjects').select('*').order('name');
    if (data && data.length > 0) {
      setSubjects(data);
      setSelectedSubjectId(data[0].id);
    }
    setFetchingInitial(false);
  };

  // -------------------------------------------------------------
  // REUSABLE REGEX PARSER FUNCTION
  // -------------------------------------------------------------
  const parseContentToQuestions = (inputString) => {
    const rawBlocks = inputString
      .split(/(?=(?:^|\n)(?:Q(?:uestion|\.)?\s*\d+|\d+[\)\.]))\s*/i)
      .filter((b) => b.trim());

    const parsedRows = [];

    rawBlocks.forEach((block) => {
      const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
      let qText = '';
      let optionsMap = {};
      let correctOpt = 'A';
      let explanation = '';

      lines.forEach((line) => {
        const optMatch = line.match(/^([A-D])[\)\.\:\-]\s*(.+)/i);
        const ansMatch = line.match(/^(?:Ans|Answer|Correct)[\:\s]*([A-D])/i);
        const expMatch = line.match(/^(?:Explanation|Explain)[\:\s]*(.+)/i);

        if (optMatch) {
          optionsMap[optMatch[1].toUpperCase()] = optMatch[2].trim();
        } else if (ansMatch) {
          correctOpt = ansMatch[1].toUpperCase();
        } else if (expMatch) {
          explanation = expMatch[1].trim();
        } else if (Object.keys(optionsMap).length === 0) {
          qText += (qText ? ' ' : '') + line;
        }
      });

      const optA = optionsMap['A'] || '';
      const optB = optionsMap['B'] || '';
      const optC = optionsMap['C'] || 'None of the above';
      const optD = optionsMap['D'] || 'All of the above';

      if (qText && optA && optB) {
        parsedRows.push({
          subject_id: selectedSubjectId,
          year: selectedYear,
          is_free: isFreeTier,
          question_text: qText.replace(/^(?:Q(?:uestion|\.)?\s*\d+|\d+[\)\.])\s*/i, ''),
          option_a: optA,
          option_b: optB,
          option_c: optC,
          option_d: optD,
          correct_option: correctOpt,
          explanation: explanation || null,
        });
      }
    });

    return parsedRows;
  };

  // -------------------------------------------------------------
  // 1. PDF HANDLER
  // -------------------------------------------------------------
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setPdfStatus('Extracting pages from PDF...');
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map((item) => item.str).join(' ') + '\n\n';
      }

      const rows = parseContentToQuestions(fullText);
      setPdfParsedPreview(rows);
      setPdfStatus(`Extracted ${pdf.numPages} pages. Auto-parsed ${rows.length} valid questions.`);
      toast.success(`Successfully parsed ${rows.length} questions from PDF!`);
    } catch (err) {
      console.error(err);
      setPdfStatus('Error processing PDF file.');
      toast.error('Could not parse PDF. Ensure it contains text, not scanned images.');
    }
  };

  const handleUploadPdfParsed = async () => {
    if (pdfParsedPreview.length === 0) return;
    setLoading(true);
    const { error } = await supabase.from('questions').insert(pdfParsedPreview);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Saved ${pdfParsedPreview.length} questions to database!`);
      setPdfParsedPreview([]);
      setPdfStatus('');
    }
    setLoading(false);
  };

  // -------------------------------------------------------------
  // 2. TEXT PARSER HANDLER
  // -------------------------------------------------------------
  const handleParseText = () => {
    if (!rawText.trim()) {
      toast.error('Please paste question text.');
      return;
    }
    const rows = parseContentToQuestions(rawText);
    setTextParsedPreview(rows);
    if (rows.length === 0) {
      toast.warn('No questions matched. Format like: 1. Question? A) Opt B) Opt Ans: A');
    } else {
      toast.info(`Parsed ${rows.length} questions.`);
    }
  };

  const handleUploadTextParsed = async () => {
    const rows = textParsedPreview.length > 0 ? textParsedPreview : parseContentToQuestions(rawText);
    if (!rows || rows.length === 0) return;

    setLoading(true);
    const { error } = await supabase.from('questions').insert(rows);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Saved ${rows.length} questions to database!`);
      setRawText('');
      setTextParsedPreview([]);
    }
    setLoading(false);
  };

  // -------------------------------------------------------------
  // 3. SINGLE MANUAL FORM
  // -------------------------------------------------------------
  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubjectId) {
      toast.error('Select a subject first.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('questions').insert([{
      ...singleForm,
      subject_id: selectedSubjectId,
      year: selectedYear,
      is_free: isFreeTier,
    }]);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Question added successfully!');
      setSingleForm({
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'A',
        explanation: '',
      });
    }
    setLoading(false);
  };

  // -------------------------------------------------------------
  // 4. BATCH JSON
  // -------------------------------------------------------------
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('Must be an array of questions.');
      }
      const { error } = await supabase.from('questions').insert(parsed);
      if (error) throw error;

      toast.success(`Uploaded ${parsed.length} questions!`);
      setJsonInput('');
    } catch (err) {
      toast.error(err.message || 'Invalid JSON format.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingInitial) {
    return (
      <div className="h-[70vh] w-full flex flex-col items-center justify-center gap-3 text-gray-400">
        <FiLoader className="animate-spin text-orange-500 text-3xl" />
        <p className="text-xs font-bold uppercase tracking-widest">Loading Upload Panel...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">Upload Question Bank</h1>
        <p className="text-gray-400 text-sm mt-1">Select your preferred method to add questions into the system.</p>
      </div>

      {/* Global Metadata (Subject, Year, Access Tier) */}
      <div className="bg-[#161922] border border-gray-800 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Target Subject</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full bg-[#0f1117] border border-gray-800 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-orange-500"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Exam Year</label>
          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-full bg-[#0f1117] border border-gray-800 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Access Level</label>
          <select
            value={isFreeTier ? 'true' : 'false'}
            onChange={(e) => setIsFreeTier(e.target.value === 'true')}
            className="w-full bg-[#0f1117] border border-gray-800 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-orange-500"
          >
            <option value="false">Premium Pro Only</option>
            <option value="true">Free Trial (All Users)</option>
          </select>
        </div>
      </div>

      {/* 4 Dedicated Upload Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('pdf')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition ${
            activeTab === 'pdf'
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
              : 'bg-[#161922] text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          <FaFilePdf /> PDF Upload
        </button>

        <button
          onClick={() => setActiveTab('text')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition ${
            activeTab === 'text'
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
              : 'bg-[#161922] text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          <FaFileAlt /> Raw Text Paste
        </button>

        <button
          onClick={() => setActiveTab('single')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition ${
            activeTab === 'single'
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
              : 'bg-[#161922] text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          <FaPlus /> Single Entry
        </button>

        <button
          onClick={() => setActiveTab('bulk_json')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition ${
            activeTab === 'bulk_json'
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
              : 'bg-[#161922] text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          <FaFileCode /> Batch JSON
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODE 1: PDF FILE UPLOAD */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'pdf' && (
        <div className="bg-[#161922] border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="border-2 border-dashed border-gray-800 hover:border-orange-500/50 bg-[#0f1117] rounded-2xl p-8 text-center space-y-3 transition">
            <FaFilePdf className="text-5xl text-orange-500 mx-auto" />
            <div>
              <label htmlFor="standalonePdfInput" className="cursor-pointer font-bold text-white text-base hover:underline block">
                Click to upload PDF Document
              </label>
              <input
                id="standalonePdfInput"
                type="file"
                accept="application/pdf"
                onChange={handlePdfUpload}
                className="hidden"
              />
              <p className="text-xs text-gray-400 mt-1">Directly extracts, splits questions, and prepares for database import.</p>
            </div>
            {pdfStatus && (
              <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl inline-block border border-emerald-500/20">
                {pdfStatus}
              </div>
            )}
          </div>

          {pdfParsedPreview.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                  <FaCheckCircle /> {pdfParsedPreview.length} Questions Extracted
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto border border-gray-800 rounded-xl bg-[#0f1117] divide-y divide-gray-800/60 text-xs">
                {pdfParsedPreview.map((q, idx) => (
                  <div key={idx} className="p-3 space-y-1">
                    <div className="font-semibold text-white">#{idx + 1}. {q.question_text}</div>
                    <div className="text-gray-400 grid grid-cols-2 gap-2 text-[11px]">
                      <span>A: {q.option_a}</span>
                      <span>B: {q.option_b}</span>
                      <span>C: {q.option_c}</span>
                      <span>D: {q.option_d}</span>
                    </div>
                    <div className="text-orange-400 font-bold text-[11px]">Answer: Option {q.correct_option}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleUploadPdfParsed}
                disabled={loading}
                className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-800 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <FaSpinner className="animate-spin" /> : <><FaCloudUploadAlt /> Save {pdfParsedPreview.length} Questions to Database</>}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODE 2: RAW TEXT PASTE */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'text' && (
        <div className="bg-[#161922] border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Paste Questions Text</label>
              <button
                type="button"
                onClick={handleParseText}
                className="text-xs font-bold text-orange-400 hover:underline cursor-pointer"
              >
                Preview Parsed Output
              </button>
            </div>
            <textarea
              rows={10}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`1. What is the unit of electric current?\nA) Volt\nB) Ampere\nC) Ohm\nD) Watt\nAns: B\nExplanation: Current is measured in Amperes.\n\n2. Solve 3x - 9 = 0\nA) 2\nB) 3\nC) 4\nD) 5\nAns: B`}
              className="w-full bg-[#0f1117] border border-gray-800 rounded-xl p-4 text-xs font-mono text-gray-200 focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {textParsedPreview.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                <FaCheckCircle /> {textParsedPreview.length} Questions Ready
              </span>
              <div className="max-h-60 overflow-y-auto border border-gray-800 rounded-xl bg-[#0f1117] divide-y divide-gray-800/60 text-xs">
                {textParsedPreview.map((q, idx) => (
                  <div key={idx} className="p-3 space-y-1">
                    <div className="font-semibold text-white">#{idx + 1}. {q.question_text}</div>
                    <div className="text-orange-400 font-bold text-[11px]">Answer: Option {q.correct_option}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleParseText}
              type="button"
              className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Parse Text
            </button>
            <button
              onClick={handleUploadTextParsed}
              disabled={loading || !rawText}
              className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-800 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <><FaCloudUploadAlt /> Save Parsed to DB</>}
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODE 3: SINGLE MANUAL ENTRY */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'single' && (
        <form onSubmit={handleSingleSubmit} className="bg-[#161922] border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Question Body</label>
            <textarea
              required
              rows={3}
              value={singleForm.question_text}
              onChange={(e) => setSingleForm({ ...singleForm, question_text: e.target.value })}
              placeholder="e.g. In the human body, urea is synthesized in the..."
              className="w-full bg-[#0f1117] border border-gray-800 rounded-xl p-3.5 text-sm text-white focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {['A', 'B', 'C', 'D'].map((opt) => (
              <div key={opt}>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Option {opt}</label>
                <input
                  type="text"
                  required
                  value={singleForm[`option_${opt.toLowerCase()}`]}
                  onChange={(e) => setSingleForm({ ...singleForm, [`option_${opt.toLowerCase()}`]: e.target.value })}
                  className="w-full bg-[#0f1117] border border-gray-800 rounded-xl p-3 text-sm text-white"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Correct Option</label>
              <select
                value={singleForm.correct_option}
                onChange={(e) => setSingleForm({ ...singleForm, correct_option: e.target.value })}
                className="w-full bg-[#0f1117] border border-gray-800 rounded-xl p-3 text-sm text-white"
              >
                {['A', 'B', 'C', 'D'].map((o) => (
                  <option key={o} value={o}>Option {o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Explanation</label>
              <input
                type="text"
                value={singleForm.explanation}
                onChange={(e) => setSingleForm({ ...singleForm, explanation: e.target.value })}
                placeholder="Optional reasoning..."
                className="w-full bg-[#0f1117] border border-gray-800 rounded-xl p-3 text-sm text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 text-white font-bold rounded-xl shadow-lg shadow-orange-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <FaSpinner className="animate-spin" /> : 'Save Question to Bank'}
          </button>
        </form>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODE 4: BATCH JSON */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'bulk_json' && (
        <form onSubmit={handleBulkSubmit} className="bg-[#161922] border border-gray-800 rounded-2xl p-6 space-y-4">
          <textarea
            rows={12}
            required
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={`[\n  {\n    "subject_id": "${selectedSubjectId}",\n    "question_text": "What is the capital of Nigeria?",\n    "option_a": "Lagos",\n    "option_b": "Abuja",\n    "option_c": "Kano",\n    "option_d": "Ibadan",\n    "correct_option": "B",\n    "year": 2024,\n    "is_free": true\n  }\n]`}
            className="w-full bg-[#0f1117] border border-gray-800 rounded-xl p-4 text-xs font-mono text-white focus:ring-2 focus:ring-orange-500"
          />

          <button
            type="submit"
            disabled={loading || !jsonInput.trim()}
            className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 text-white font-bold rounded-xl shadow-lg shadow-orange-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <><FaCloudUploadAlt /> Run Batch Upload</>}
          </button>
        </form>
      )}
    </div>
  );
}

function UploadLoadingFallback() {
  return (
    <div className="h-[70vh] w-full flex flex-col items-center justify-center gap-3 text-gray-400">
      <FiLoader className="animate-spin text-orange-500 text-3xl" />
      <p className="text-xs font-bold uppercase tracking-widest">Loading Upload Panel...</p>
    </div>
  );
}

export default function UploadQuestionsPage() {
  return (
    <Suspense fallback={<UploadLoadingFallback />}>
      <UploadQuestionsContent />
    </Suspense>
  );
}