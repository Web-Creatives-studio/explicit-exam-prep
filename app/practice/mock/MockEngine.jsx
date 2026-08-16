'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '../../utils/supabase/client';
import confetti from 'canvas-confetti';
import { toast } from 'react-toastify';

import MockBriefing from '../../components/MockBriefing';
import MockSummary from '../../components/MockSummary';
import MockReviewDesk from '../../components/MockReviewDesk';
import MockTestDesk from '../../components/MockTestDesk';

export default function MockExamEngine({ profile, subjectsData = [], isPremium = false }) {
  const supabase = createClient();

  // Compulsory Aptitude Subject
  const aptitudeSubject =
    subjectsData.find(
      (s) => s.code?.toUpperCase() === 'APPT' || s.name?.toLowerCase().includes('aptitude')
    ) || subjectsData[0];

  const selectableSubjects = subjectsData.filter((s) => s.id !== aptitudeSubject?.id);

  // States
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
  const [activeSubjects, setActiveSubjects] = useState([]);
  const [started, setStarted] = useState(false);
  const [examQuestions, setExamQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [showReviewMode, setShowReviewMode] = useState(false);

  // Timing
  const questionsPerSubject = isPremium ? 10 : 5;
  const TOTAL_TIME_SECONDS = isPremium ? 40 * 60 : 20 * 60;
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME_SECONDS);

  // -------------------------------------------------------------
  // ACTIVE EXAM BROWSER LOCK (Prevents Accidental Tab Close / Back)
  // -------------------------------------------------------------
  const isTestActive = started && !isSubmitted;

  useEffect(() => {
    if (!isTestActive) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'You have an active exam in progress. Leaving will forfeit your attempt.';
      return e.returnValue;
    };

    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
      toast.warn('Active Exam in Progress! Use the Submit or Quit button on screen.');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
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
        toast.info('You have already selected 3 elective subjects alongside Aptitude.');
      }
    }
  };

  // Launch Test
  const handleStartExam = () => {
    if (selectedSubjectIds.length !== 3) {
      toast.error('Please select exactly 3 elective subjects to proceed.');
      return;
    }

    const chosenSubjects = [
      aptitudeSubject,
      ...selectableSubjects.filter((s) => selectedSubjectIds.includes(s.id)),
    ];

    setActiveSubjects(chosenSubjects);

    const bundledQuestions = [];
    chosenSubjects.forEach((sub) => {
      if (sub?.questions && sub.questions.length > 0) {
        const sliced = sub.questions.slice(0, questionsPerSubject).map((q) => ({
          ...q,
          subject_name: sub.name,
          subject_code: sub.code,
        }));
        bundledQuestions.push(...sliced);
      }
    });

    if (bundledQuestions.length === 0) {
      toast.error('No questions found for the selected subjects. Please check the question banks.');
      return;
    }

    setExamQuestions(bundledQuestions);
    setTimeLeft(TOTAL_TIME_SECONDS);
    setStarted(true);
  };

  // Submission handler
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

      if (answers[idx] === q.correct_option) {
        totalScore += 1;
        subjectBreakdown[subName].correct += 1;
      }
    });

    const timeSpent = TOTAL_TIME_SECONDS - timeLeft;
    const percentage = Math.round((totalScore / (examQuestions.length || 1)) * 100);

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

    if (profile?.id) {
      await supabase.from('mock_sessions').insert({
        user_id: profile.id,
        mode: 'full_mock',
        score: totalScore,
        total_questions: examQuestions.length,
        time_spent_seconds: timeSpent,
      });
    }
  }, [activeSubjects, examQuestions, answers, TOTAL_TIME_SECONDS, timeLeft, profile, supabase]);

  // Exam Countdown Timer
  useEffect(() => {
    if (!started || isSubmitted) return;

    if (timeLeft <= 0) {
      toast.warn('Time elapsed! Submitting exam automatically...');
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
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 1. Briefing Screen
  if (!started) {
    return (
      <MockBriefing
        profile={profile}
        aptitudeSubject={aptitudeSubject}
        selectableSubjects={selectableSubjects}
        selectedSubjectIds={selectedSubjectIds}
        onToggleSubject={handleToggleSubject}
        onStartExam={handleStartExam}
        isPremium={isPremium}
        questionsPerSubject={questionsPerSubject}
      />
    );
  }

  // 2. Correction & Review Desk
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

  // 3. Post-Exam Summary
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

  // 4. Active Exam Floor (Navbar hidden)
  return (
    <MockTestDesk
      profile={profile}
      examQuestions={examQuestions}
      currentIndex={currentIndex}
      setCurrentIndex={setCurrentIndex}
      answers={answers}
      onSelectOption={(opt) => !isSubmitted && setAnswers({ ...answers, [currentIndex]: opt })}
      subjectsInExam={activeSubjects.map((s) => s.name)}
      currentQ={examQuestions[currentIndex]}
      timeLeft={timeLeft}
      formatTime={formatTime}
      onSubmitExam={finishExam}
    />
  );
}