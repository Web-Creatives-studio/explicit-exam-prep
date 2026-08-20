"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  availableYears = [],
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
  const [selectedYear, setSelectedYear] = useState("all");
  const [activeSubjects, setActiveSubjects] = useState([]);
  const [isPreparing, setIsPreparing] = useState(false);
  const [started, setStarted] = useState(false);
  const [examQuestions, setExamQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [showReviewMode, setShowReviewMode] = useState(false);

  // Derive unique years from question pools if not explicitly passed
  const distinctYears = useMemo(() => {
    if (availableYears.length > 0) return availableYears;
    const yearSet = new Set();
    subjectsData.forEach((s) => {
      s.questions?.forEach((q) => {
        if (q.year) yearSet.add(q.year);
      });
    });
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [availableYears, subjectsData]);

  // Timing: 10 Qs per subject (40 total) for PRO, 5 Qs per subject (20 total) for Free
  const questionsPerSubject = userIsPremium ? 10 : 5;
  const TOTAL_TIME_SECONDS = userIsPremium ? 40 * 60 : 20 * 60;
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME_SECONDS);

  // Active Exam Browser Lock
  const isTestActive = started && !isSubmitted;

  useEffect(() => {
    if (!isTestActive) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "You have an active exam in progress. Leaving will forfeit your attempt.";
      return e.returnValue;
    };

    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      toast.warn("Active Exam in Progress! Use the Submit or Quit button on screen.");
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
        toast.info("You have already selected 3 elective subjects alongside Aptitude.");
      }
    }
  };

  // Launch Test with Year-Filtered Question Pools
  const handleStartExam = async () => {
    if (selectedSubjectIds.length !== 3) {
      toast.error("Please select exactly 3 elective subjects to proceed.");
      return;
    }

    setIsPreparing(true);

    const chosenSubjects = [
      aptitudeSubject,
      ...selectableSubjects.filter((s) => selectedSubjectIds.includes(s.id)),
    ];

    await new Promise((resolve) => setTimeout(resolve, 700));

    const bundledQuestions = [];

    chosenSubjects.forEach((sub) => {
      if (sub?.questions && sub.questions.length > 0) {
        // Filter by selected year if specific year chosen
        let filteredPool = sub.questions;
        if (selectedYear !== "all") {
          const yearFiltered = sub.questions.filter(
            (q) => String(q.year) === String(selectedYear)
          );
          // Fallback to full pool if year-filtered pool doesn't have enough questions
          filteredPool = yearFiltered.length >= questionsPerSubject ? yearFiltered : sub.questions;
        }

        const randomized = shuffleArray(filteredPool);
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
        "No questions found for the selected combination and year. Please adjust your selection."
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

  // Submission Handler & Grading
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

      if (
        answers[idx] &&
        q.correct_option &&
        answers[idx].trim().toUpperCase() === q.correct_option.trim().toUpperCase()
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

    let currentUserId = profile?.id;
    if (!currentUserId) {
      const { data: authData } = await supabase.auth.getUser();
      currentUserId = authData?.user?.id;
    }

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

  // Full-Screen Test Preparation Overlay
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
            Bundling questions for <strong className="text-white">Aptitude</strong> and your 3 chosen subjects ({selectedYear === "all" ? "All Years" : `${selectedYear} Series`})...
          </p>
        </div>

        <div className="bg-[#0b0e14] border border-gray-800/80 rounded-2xl p-4 space-y-2.5 text-left">
          <div className="flex items-center gap-2.5 text-xs text-gray-300">
            <FaCheckCircle className="text-emerald-400 text-xs shrink-0" />
            <span>Anti-cheat browser lock configured</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-gray-300">
            <FaCheckCircle className="text-emerald-400 text-xs shrink-0" />
            <span>
              Target Year: <strong className="text-white uppercase font-mono">{selectedYear === "all" ? "Comprehensive (All Years)" : `${selectedYear} CBT Bank`}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-gray-300">
            <FaShieldAlt className="text-orange-400 text-xs shrink-0" />
            <span>
              Timer initialized: <strong className="text-orange-400 font-mono">{Math.floor(TOTAL_TIME_SECONDS / 60)} minutes</strong>
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Briefing & Setup Floor
  if (!started) {
    return (
      <MockBriefing
        profile={profile}
        aptitudeSubject={aptitudeSubject}
        selectableSubjects={selectableSubjects}
        selectedSubjectIds={selectedSubjectIds}
        onToggleSubject={handleToggleSubject}
        availableYears={distinctYears}
        selectedYear={selectedYear}
        onSelectYear={setSelectedYear}
        onStartExam={handleStartExam}
        isPremium={userIsPremium}
        questionsPerSubject={questionsPerSubject}
      />
    );
  }

  // Corrections & Review Floor
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

  // Post-Exam Results Summary
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

  // Live Exam Desk Floor
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