'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '../../../utils/supabase/client';
import { getWeeklyMockWindowStatus, getDepartmentMockSubjects } from '../../../utils/weeklyMockHelper';
import { toast } from 'react-toastify';
import { 
  FaClock, 
  FaCheckCircle, 
  FaSpinner, 
  FaChevronLeft, 
  FaChevronRight, 
  FaShieldAlt
} from 'react-icons/fa';

export const dynamic = 'force-dynamic';

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function LiveWeeklyMockExamContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const isBypassMode = searchParams.get('bypass') === 'true';
  const customMockId = searchParams.get('mock_id');

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [activeMock, setActiveMock] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
  const [submitting, setSubmitting] = useState(false);

  const startTimeRef = useRef(Date.now());
  const answersRef = useRef(answers);
  const questionsRef = useRef(questions);
  const profileRef = useRef(profile);
  const activeMockRef = useRef(activeMock);

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { questionsRef.current = questions; }, [questions]);
  useEffect(() => { profileRef.current = profile; }, [profile]);
  useEffect(() => { activeMockRef.current = activeMock; }, [activeMock]);

  // -----------------------------------------------------------------
  // 1. Submit Exam & Save Results to public.test_sessions
  // -----------------------------------------------------------------
  const handleSubmitExam = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);

    const currentAnswers = answersRef.current;
    const currentQuestions = questionsRef.current;
    const currentProfile = profileRef.current;
    const currentMock = activeMockRef.current;

    const timeSpentSeconds = Math.min(3600, Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000)));

    let totalScore = 0;
    const subjectMap = {};

    // Evaluate each question using the candidate's exact active question list
    const evaluatedQuestions = currentQuestions.map((q, idx) => {
      const selected = currentAnswers[idx]?.trim().toUpperCase() || null;
      const correct = q.correct_option?.trim().toUpperCase();
      const isCorrect = Boolean(selected && correct && selected === correct);
      const subName = q.subject_name || q.subjects?.name || 'Aptitude';

      if (isCorrect) totalScore += 1;

      if (!subjectMap[subName]) {
        subjectMap[subName] = { name: subName, score: 0, total: 0 };
      }
      subjectMap[subName].total += 1;
      if (isCorrect) subjectMap[subName].score += 1;

      return {
        id: q.id,
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_option: correct,
        selected_option: selected,
        explanation: q.explanation,
        subject_name: subName,
        is_correct: isCorrect,
      };
    });

    const breakdownArray = Object.values(subjectMap);

    try {
      const { data: sessionData, error } = await supabase
        .from('test_sessions')
        .insert({
          user_id: currentProfile.id,
          mode: 'weekly_mock',
          mock_id: currentMock?.id || null,
          score: totalScore,
          total_questions: currentQuestions.length,
          time_spent_seconds: timeSpentSeconds,
          answers_payload: {
            user_answers: currentAnswers,
            breakdown: breakdownArray,
            questions_snapshot: evaluatedQuestions,
          },
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Exam submitted successfully!');
      router.push('/practice/single');
    } catch (err) {
      console.error('Submission error:', err);
      toast.error('Failed to submit exam. Please try again.');
      setSubmitting(false);
    }
  }, [submitting, supabase, router]);

  // -----------------------------------------------------------------
  // 2. Realtime Single-Device Session Lock
  // -----------------------------------------------------------------
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel(`live-exam-lock-${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${profile.id}`,
        },
        (payload) => {
          const currentLocalToken = document.cookie
            .split('; ')
            .find((row) => row.startsWith('device_session_token='))
            ?.split('=')[1];

          if (
            payload.new.current_session_token &&
            currentLocalToken &&
            payload.new.current_session_token !== currentLocalToken
          ) {
            toast.error('Account logged in on another device. Exam terminated.');
            supabase.auth.signOut().then(() => {
              window.location.href = '/login?error=session_terminated';
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, supabase]);

  // -----------------------------------------------------------------
  // 3. Initial Setup, Security & Question Assembling
  // -----------------------------------------------------------------
  useEffect(() => {
    async function initExam() {
      const windowStatus = getWeeklyMockWindowStatus();

      // 1. Time Window Check
      if (!windowStatus.isOpen && !isBypassMode) {
        toast.error('The Weekly Mock Challenge is only accessible on Fridays between 10:00 AM and 2:00 PM WAT.');
        router.push('/practice/single');
        return;
      }

      // 2. Auth Session Check
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?next=/practice/mock/live');
        return;
      }

      // 3. Profile & PRO Access Check
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!userProfile?.is_premium) {
        toast.warning('Weekly Mock Challenge requires PRO Access.');
        router.push('/practice/single');
        return;
      }
      setProfile(userProfile);

      // 4. Fetch Active Weekly Mock Edition
      let mockQuery = supabase
        .from('weekly_mocks')
        .select('*')
        .eq('is_published', true);

      if (customMockId) {
        mockQuery = mockQuery.eq('id', customMockId);
      } else {
        mockQuery = mockQuery.order('active_date', { ascending: false });
      }

      const { data: mockList, error: mockFetchError } = await mockQuery.limit(1);
      const mockData = mockList?.[0] || null;

      if (mockFetchError || !mockData) {
        toast.error('No active Weekly Mock edition found.');
        router.push('/practice/single');
        return;
      }
      setActiveMock(mockData);

      // 5. Enforce Single Attempt per Candidate per Mock Edition
      if (!isBypassMode) {
        const { data: existingSession } = await supabase
          .from('test_sessions')
          .select('id')
          .eq('user_id', user.id)
          .eq('mode', 'weekly_mock')
          .eq('mock_id', mockData.id)
          .maybeSingle();

        if (existingSession) {
          toast.info("You have already completed this week's challenge.");
          router.push('/practice/single');
          return;
        }
      }

      // 6. Resolve Candidate's 4 Core Subjects
      const { data: allSubjects } = await supabase
        .from('subjects')
        .select('id, name, code');

      const targetSubjectNames = getDepartmentMockSubjects(userProfile.department);

      const matchedSubjectObjects = targetSubjectNames.map((targetName) => {
        const targetClean = targetName.toLowerCase().trim();
        return (
          allSubjects?.find((s) => {
            const dbClean = s.name.toLowerCase().trim();
            return dbClean === targetClean || dbClean.includes(targetClean) || targetClean.includes(dbClean);
          }) || { id: null, name: targetName }
        );
      });

      // 7. Fetch Linked Mock Questions
      const { data: mockLinks, error: mockLinkErr } = await supabase
        .from('weekly_mock_questions')
        .select(`
          mock_id,
          subject_id,
          question_id,
          questions (
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
        .eq('mock_id', mockData.id);

      const questionsBySubjectId = {};
      if (!mockLinkErr && mockLinks) {
        mockLinks.forEach((link) => {
          if (!link.questions) return;
          if (!questionsBySubjectId[link.subject_id]) {
            questionsBySubjectId[link.subject_id] = [];
          }
          questionsBySubjectId[link.subject_id].push(link.questions);
        });
      }

      const assembled = [];

      for (const subObj of matchedSubjectObjects) {
        let pool = subObj.id && questionsBySubjectId[subObj.id] ? questionsBySubjectId[subObj.id] : [];

        if (pool.length < 10 && subObj.id) {
          const { data: fallbackQs } = await supabase
            .from('questions')
            .select('*')
            .eq('subject_id', subObj.id)
            .limit(20);

          if (fallbackQs && fallbackQs.length > 0) {
            const existingIds = new Set(pool.map((q) => q.id));
            const freshQs = fallbackQs.filter((q) => !existingIds.has(q.id));
            pool = [...pool, ...freshQs];
          }
        }

        const selectedTen = shuffleArray(pool).slice(0, 10).map((q) => ({
          ...q,
          subject_name: subObj.name,
        }));

        assembled.push(...selectedTen);
      }

      if (assembled.length === 0) {
        toast.error('Questions for your department are being assembled. Please check back shortly.');
        router.push('/practice/single');
        return;
      }

      setQuestions(assembled);
      setLoading(false);
      startTimeRef.current = Date.now();
    }

    initExam();
  }, [router, supabase, isBypassMode, customMockId]);

  // -----------------------------------------------------------------
  // 4. Countdown Timer
  // -----------------------------------------------------------------
  useEffect(() => {
    if (loading || submitting) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, submitting, handleSubmitExam]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!submitting) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [submitting]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0c10] text-gray-400 flex flex-col items-center justify-center gap-3 select-none">
        <FaSpinner className="text-3xl text-orange-500 animate-spin" />
        <p className="text-xs font-bold uppercase tracking-wider text-gray-300">
          Assembling 40 Departmental Questions...
        </p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-[#0a0c10] text-gray-100 flex flex-col justify-between selection:bg-orange-500 selection:text-white select-none">
      
      {/* Top Header */}
      <header className="bg-[#141822] border-b border-gray-800 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-black text-white truncate">
              {activeMock?.title || 'Weekly Nationwide Mock'}
            </h1>
            <p className="text-[10px] text-gray-400 font-mono truncate">
              {profile?.full_name} • <span className="text-orange-400 font-bold">{profile?.department}</span>
            </p>
          </div>
        </div>

        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-black text-xs sm:text-sm shrink-0 ${
          timeLeft < 300 
            ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse' 
            : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
        }`}>
          <FaClock className="text-xs sm:text-sm" />
          <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
        </div>
      </header>

      {/* Main Question Interface */}
      <main className="max-w-4xl w-full mx-auto px-4 py-6 sm:py-8 flex-1 flex flex-col justify-between">
        
        <div className="bg-[#141822] border border-gray-800 rounded-3xl p-5 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-orange-500">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-[10px] text-gray-500 font-mono">
                ({answeredCount}/{questions.length} answered)
              </span>
            </div>

            <span className="text-[11px] font-bold text-gray-300 bg-[#0b0e14] border border-gray-800 px-3 py-1 rounded-xl">
              {currentQ?.subject_name || 'Department Drill'}
            </span>
          </div>

          <div className="text-base sm:text-lg font-medium text-white leading-relaxed">
            {currentQ?.question_text}
          </div>

          <div className="space-y-3 pt-2">
            {['A', 'B', 'C', 'D'].map((opt) => {
              const optKey = `option_${opt.toLowerCase()}`;
              const optText = currentQ?.[optKey];
              if (!optText) return null;
              const isSelected = answers[currentIndex] === opt;

              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setAnswers((prev) => ({ ...prev, [currentIndex]: opt }))}
                  className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm font-medium transition flex items-center justify-between cursor-pointer active:scale-[0.99] ${
                    isSelected
                      ? 'bg-orange-600/15 border-orange-500 text-white shadow-lg shadow-orange-600/15'
                      : 'bg-[#0b0e14] border-gray-800 text-gray-300 hover:border-gray-700 hover:bg-[#161a24]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSelected ? 'bg-orange-600 text-white' : 'bg-[#141822] text-gray-400 border border-gray-800'
                    }`}>
                      {opt}
                    </span>
                    <span className="leading-snug">{optText}</span>
                  </div>
                  {isSelected && <FaCheckCircle className="text-orange-500 text-sm shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation & Question Palette */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="px-4 sm:px-5 py-2.5 bg-[#141822] hover:bg-[#191e2b] active:scale-[0.98] disabled:opacity-30 border border-gray-800 text-gray-300 font-bold rounded-xl text-xs flex items-center gap-2 transition cursor-pointer"
            >
              <FaChevronLeft /> Previous
            </button>

            <button
              type="button"
              onClick={handleSubmitExam}
              disabled={submitting}
              className="px-6 sm:px-8 py-2.5 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-extrabold rounded-xl text-xs transition shadow-lg shadow-red-600/25 flex items-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin" /> Submitting...
                </>
              ) : (
                'Submit Challenge'
              )}
            </button>

            <button
              type="button"
              disabled={currentIndex === questions.length - 1}
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              className="px-4 sm:px-5 py-2.5 bg-[#141822] hover:bg-[#191e2b] active:scale-[0.98] disabled:opacity-30 border border-gray-800 text-gray-300 font-bold rounded-xl text-xs flex items-center gap-2 transition cursor-pointer"
            >
              Next <FaChevronRight />
            </button>
          </div>

          <div className="bg-[#141822] border border-gray-800 p-4 rounded-2xl">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2.5 text-center">
              Question Navigator (Jump to Question)
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center max-h-32 overflow-y-auto">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-7 h-7 rounded-lg text-[11px] font-mono font-bold transition cursor-pointer ${
                    currentIndex === idx
                      ? 'ring-2 ring-orange-500 bg-orange-600 text-white shadow-md shadow-orange-600/30'
                      : answers[idx]
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-[#0b0e14] text-gray-500 border border-gray-800 hover:text-white'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

function LiveMockLoadingFallback() {
  return (
    <div className="min-h-screen bg-[#0a0c10] text-gray-400 flex flex-col items-center justify-center gap-3 select-none">
      <FaSpinner className="text-3xl text-orange-500 animate-spin" />
      <p className="text-xs font-bold uppercase tracking-wider text-gray-300">
        Loading Live Mock Room...
      </p>
    </div>
  );
}

export default function LiveWeeklyMockExam() {
  return (
    <Suspense fallback={<LiveMockLoadingFallback />}>
      <LiveWeeklyMockExamContent />
    </Suspense>
  );
}