'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function CBTPlayer({ questions = [], mode = 'single_subject', timeLimitMinutes = 30, userId }) {
  const supabase = createClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(timeLimitMinutes * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 && !isSubmitted) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

  const handleOptionSelect = (optionKey) => {
    if (isSubmitted) return;
    setAnswers({ ...answers, [currentIndex]: optionKey });
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correct_option) {
        score += 1;
      }
    });
    return score;
  };

  const handleSubmit = async () => {
    const finalScore = calculateScore();
    const timeSpent = timeLimitMinutes * 60 - timeLeft;

    setIsSubmitted(true);
    setResult({
      score: finalScore,
      total: questions.length,
      percentage: Math.round((finalScore / questions.length) * 100),
    });

    // Save session in Supabase
    if (userId) {
      await supabase.from('mock_sessions').insert({
        user_id: userId,
        mode: mode,
        score: finalScore,
        total_questions: questions.length,
        time_spent_seconds: timeSpent,
      });
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIndex];

  if (!questions || questions.length === 0) {
    return <div className="p-8 text-center text-gray-500">No questions available for this module.</div>;
  }

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md border text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Test Completed!</h2>
        <p className="text-gray-500 mb-6">Here is your performance breakdown:</p>
        
        <div className="flex justify-around bg-orange-50 p-4 rounded-lg mb-6 border border-orange-200">
          <div>
            <div className="text-xs text-orange-600 font-semibold uppercase">Total Score</div>
            <div className="text-3xl font-black text-gray-900">{result.score} / {result.total}</div>
          </div>
          <div>
            <div className="text-xs text-orange-600 font-semibold uppercase">Percentage</div>
            <div className="text-3xl font-black text-gray-900">{result.percentage}%</div>
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition"
        >
          Retake Practice
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header with Timer */}
      <div className="flex justify-between items-center bg-gray-900 text-white px-6 py-4 rounded-xl">
        <span className="font-semibold tracking-wide">Question {currentIndex + 1} of {questions.length}</span>
        <div className="text-lg font-mono font-bold text-orange-400 bg-gray-800 px-4 py-1 rounded-md border border-gray-700">
          ⏱ {formatTime(timeLeft)}
        </div>
      </div>

      {/* Question Box */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        <h3 className="text-lg font-medium text-gray-900 leading-relaxed">
          {currentQ?.question_text}
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {['A', 'B', 'C', 'D'].map((opt) => (
            <button
              key={opt}
              onClick={() => handleOptionSelect(opt)}
              className={`flex items-center p-4 rounded-lg border text-left transition ${
                answers[currentIndex] === opt
                  ? 'border-orange-500 bg-orange-50 text-orange-950 font-medium'
                  : 'border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 mr-3 text-sm font-bold">
                {opt}
              </span>
              <span>{currentQ?.[`option_${opt.toLowerCase()}`]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid Question Navigator */}
      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="text-xs font-semibold text-gray-500 uppercase mb-3">Jump to Question</div>
        <div className="flex flex-wrap gap-2">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-9 h-9 rounded-md text-sm font-semibold transition ${
                currentIndex === i
                  ? 'bg-orange-500 text-white'
                  : answers[i]
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-2">
        <button
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((prev) => prev - 1)}
          className="px-5 py-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-100 text-gray-700 font-medium"
        >
          Previous
        </button>
        {currentIndex < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIndex((prev) => prev + 1)}
            className="px-6 py-2 bg-gray-900 hover:bg-black text-white rounded-lg font-medium"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
          >
            Submit Exam
          </button>
        )}
      </div>
    </div>
  );
}