"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "../../utils/supabase/client";
import confetti from "canvas-confetti";
import { toast } from "react-toastify";
import { FiLoader } from "react-icons/fi";
import { FaGraduationCap, FaCheckCircle, FaShieldAlt } from "react-icons/fa";

import MockBriefing from "../../components/MockBriefing";
import MockSummary from "../../components/MockSummary";
import MockReviewDesk from "../../components/MockReviewDesk";
import MockTestDesk from "../../components/MockTestDesk";

/**
 * Fisher-Yates Randomizer
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function MockExamEngine({
  profile,
  subjectsData = [],
  isPremium = false,
}) {
  const supabase = createClient();
  const userIsPremium = Boolean(profile?.is_premium || isPremium);

  // Compulsory Aptitude Subject
  const aptitudeSubject =
    subjectsData.find(
      (s) =>
        s.code?.toUpperCase() === "APPT" ||
        s.name?.toLowerCase().includes("aptitude")
    ) || subjectsData[0];

  const selectableSubjects = subjectsData.filter(
    (s) => s.id !== aptitudeSubject?.id
  );

  // Engine States
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
  const [activeSubjects, setActiveSubjects] = useState([]);
  const [isPreparing, setIsPreparing] = useState(false);
  const [started, setStarted] = useState(false);
  const [examQuestions, setExamQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [showReviewMode, setShowReviewMode] = useState(false);

  // Timing: 10 Qs per subject (40 total) for PRO, 5 Qs per subject (20 total) for Free
  const questionsPerSubject = userIsPremium ? 10 : 5;
  // 1 hour (3600s) for PRO, 30 mins (1800s) for Free
  const TOTAL_TIME_SECONDS = userIsPremium ? 60 * 60 : 30 * 60;
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME_SECONDS);

  // -------------------------------------------------------------
  // ACTIVE EXAM BROWSER LOCK (Prevents accidental exits)
  // -------------------------------------------------------------
  const isTestActive = started && !isSubmitted;

  useEffect(() => {
    if (!isTestActive) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue =
        "You have an active exam in progress. Leaving will forfeit your attempt.";
      return e.returnValue;
    };

    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      toast.warn(
        "Active Exam in Progress! Use the Submit or Quit button on screen."
      );
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isTestActive]);

  // Subject Selector Toggle
  const handleToggleSubject = (id) => {
    if (selectedSubjectIds.includes(id)) {
      setSelectedSubjectIds(selectedSubjectIds.filter((item) => item !== id));
    } else {
      if (selectedSubjectIds.length < 3) {
        setSelectedSubjectIds([...selectedSubjectIds, id]);
      } else {
        toast.info(
          "You have already selected 3 elective subjects alongside Aptitude."
        );
      }
    }
  };

  // -------------------------------------------------------------
  // LAUNCH TEST WITH LOADING STATE & QUESTION SHUFFLING
  // -------------------------------------------------------------
  const handleStartExam = async () => {
    if (selectedSubjectIds.length !== 3) {
      toast.error("Please select exactly 3 elective subjects to proceed.");
      return;
    }

    // Trigger visual loading transition
    setIsPreparing(true);

    const chosenSubjects = [
      aptitudeSubject,
      ...selectableSubjects.filter((s) => selectedSubjectIds.includes(s.id)),
    ];

    // Artificial delay (700ms) for smooth test-setup UI experience
    await new Promise((resolve) => setTimeout(resolve, 700));

    const bundledQuestions = [];

    chosenSubjects.forEach((sub) => {
      if (sub?.questions && sub.questions.length > 0) {
        // High-entropy shuffle for each selected subject pool
        const randomized = shuffleArray(sub.questions);

        // Extract 10 Qs for PRO or 5 Qs for Free
        const sliced = randomized.slice(0, questionsPerSubject).map((q) => ({
          ...q,
          subject_name: sub.name,
          subject_code: sub.code,
        }));

        bundledQuestions.push(...sliced);
      }
    });

    if (bundledQuestions.length === 0) {
      setIsPreparing(false);
      toast.error(
        "No questions found for the selected combination. Please check your subject selection or upgrade to PRO."
      );
      return;
    }

    setActiveSubjects(chosenSubjects);
    setExamQuestions(bundledQuestions);
    setTimeLeft(TOTAL_TIME_SECONDS);
    setAnswers({});
    setCurrentIndex(0);
    setIsSubmitted(false);
    setResults(null);
    setIsPreparing(false);
    setStarted(true);
  };

  // -------------------------------------------------------------
  // SUBMISSION HANDLER & GRADING
  // -------------------------------------------------------------
  const finishExam = useCallback(async () => {
    let totalScore = 0;
    const subjectBreakdown = {};

    activeSubjects.forEach((sub) => {
      subjectBreakdown[sub.name] = { correct: 0, total: 0 };
    });

    examQuestions.forEach((q, idx) => {
      const subName = q.subject_name;
      if (!subjectBreakdown[subName]) {
        subjectBreakdown[subName] = { correct: 0, total: 0 };
      }

      subjectBreakdown[subName].total += 1;

      // Case-insensitive answer comparison
      if (
        answers[idx] &&
        q.correct_option &&
        answers[idx].trim().toUpperCase() ===
          q.correct_option.trim().toUpperCase()
      ) {
        totalScore += 1;
        subjectBreakdown[subName].correct += 1;
      }
    });

    const timeSpent = TOTAL_TIME_SECONDS - timeLeft;
    const percentage = Math.round(
      (totalScore / (examQuestions.length || 1)) * 100
    );

    setIsSubmitted(true);
    setResults({
      score: totalScore,
      total: examQuestions.length,
      percentage,
      timeSpent,
      breakdown: subjectBreakdown,
    });

    if (percentage >= 60) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }

    // 1. Resolve User ID
    let currentUserId = profile?.id;
    if (!currentUserId) {
      const { data: authData } = await supabase.auth.getUser();
      currentUserId = authData?.user?.id;
    }

    // 2. Insert test session adhering to check constraint ('full_mock')
    if (currentUserId) {
      const { error } = await supabase.from("mock_sessions").insert({
        user_id: currentUserId,
        mode: "full_mock",
        subject_id: null,
        score: Number(totalScore) || 0,
        total_questions: Number(examQuestions.length) || 0,
        time_spent_seconds: Number(timeSpent) || 0,
      });

      if (error) {
        console.error("Supabase session insert error:", error);
        toast.error("Could not save test score to history.");
      } else {
        toast.success("Mock exam recorded successfully!");
      }
    }
  }, [
    activeSubjects,
    examQuestions,
    answers,
    TOTAL_TIME_SECONDS,
    timeLeft,
    profile,
    supabase,
  ]);

  // Exam Countdown Timer
  useEffect(() => {
    if (!started || isSubmitted) return;

    if (timeLeft <= 0) {
      toast.warn("Time elapsed! Submitting exam automatically...");
      finishExam();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [started, timeLeft, isSubmitted, finishExam]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // -------------------------------------------------------------
  // 1. FULL-SCREEN TEST PREPARATION OVERLAY
  // -------------------------------------------------------------
  if (isPreparing) {
    return (
      <div className="bg-[#141822] border border-gray-800 rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-2xl space-y-6 select-none animate-in fade-in zoom-in-95 duration-200">
        <div className="relative w-20 h-20 mx-auto">
          <div className="w-20 h-20 rounded-3xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400 text-3xl shadow-lg shadow-orange-600/20">
            <FaGraduationCap />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-[#0b0e14] p-1.5 rounded-xl border border-gray-800">
            <FiLoader className="animate-spin text-orange-500 text-base" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Preparing Your Exam Floor
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            Bundling questions for{" "}
            <strong className="text-white">Aptitude</strong> and your 3 chosen subjects into a secured 1-hour CBT session...
          </p>
        </div>

        <div className="bg-[#0b0e14] border border-gray-800/80 rounded-2xl p-4 space-y-2.5 text-left">
          <div className="flex items-center gap-2.5 text-xs text-gray-300">
            <FaCheckCircle className="text-emerald-400 text-xs shrink-0" />
            <span>Anti-cheat browser lock configured</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-gray-300">
            <FaCheckCircle className="text-emerald-400 text-xs shrink-0" />
            <span>Questions randomized from national question bank</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-gray-300">
            <FaShieldAlt className="text-orange-400 text-xs shrink-0" />
            <span>
              Timer initialized:{" "}
              <strong className="text-orange-400 font-mono">
                {Math.floor(TOTAL_TIME_SECONDS / 60)} minutes
              </strong>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. BRIEFING & SETUP FLOOR
  // -------------------------------------------------------------
  if (!started) {
    return (
      <MockBriefing
        profile={profile}
        aptitudeSubject={aptitudeSubject}
        selectableSubjects={selectableSubjects}
        selectedSubjectIds={selectedSubjectIds}
        onToggleSubject={handleToggleSubject}
        onStartExam={handleStartExam}
        isPremium={userIsPremium}
        questionsPerSubject={questionsPerSubject}
      />
    );
  }

  // -------------------------------------------------------------
  // 3. CORRECTIONS & REVIEW FLOOR
  // -------------------------------------------------------------
  if (isSubmitted && showReviewMode && results) {
    return (
      <MockReviewDesk
        examQuestions={examQuestions}
        activeSubjects={activeSubjects}
        answers={answers}
        onBackToSummary={() => setShowReviewMode(false)}
      />
    );
  }

  // -------------------------------------------------------------
  // 4. POST-EXAM RESULTS SUMMARY
  // -------------------------------------------------------------
  if (isSubmitted && results) {
    return (
      <MockSummary
        profile={profile}
        results={results}
        activeSubjects={activeSubjects}
        onLaunchReview={() => setShowReviewMode(true)}
      />
    );
  }

  // -------------------------------------------------------------
  // 5. LIVE EXAM DESK FLOOR
  // -------------------------------------------------------------
  return (
    <MockTestDesk
      profile={profile}
      examQuestions={examQuestions}
      currentIndex={currentIndex}
      setCurrentIndex={setCurrentIndex}
      answers={answers}
      onSelectOption={(opt) =>
        !isSubmitted && setAnswers({ ...answers, [currentIndex]: opt })
      }
      subjectsInExam={activeSubjects.map((s) => s.name)}
      currentQ={examQuestions[currentIndex]}
      timeLeft={timeLeft}
      formatTime={formatTime}
      onSubmitExam={finishExam}
    />
  );
}