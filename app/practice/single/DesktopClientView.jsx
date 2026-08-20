'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import DashboardHeader from '../../components/dashboard/DashboardHeader';
import DashboardLaunchers from '../../components/dashboard/DashboardLaunchers';
import SubjectDrillGrid from '../../components/dashboard/SubjectDrillGrid';
import RecentAttemptsList from '../../components/dashboard/RecentAttemptsList';
import MockSetupModal from '../../components/dashboard/MockSetupModal';
import QuickTestModal from '../../components/dashboard/QuickTestModal';
import RedeemModal from '../../components/ReedemModal';

import { 
  getWeeklyMockWindowStatus, 
  areResultsReleased, 
  getDepartmentMockSubjects 
} from '../../utils/weeklyMockHelper';

import { 
  FaTrophy, 
  FaClock, 
  FaFire, 
  FaCalendarCheck, 
  FaLock, 
  FaArrowRight, 
  FaFileAlt, 
  FaMedal,
  FaBolt
} from 'react-icons/fa';

export default function DesktopClientView({ 
  profile, 
  subjects = [], 
  recentSessions = [],
  availableYears = [],
  weeklyMock = null
}) {
  const router = useRouter();

  // Modals state
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [showMockConfigModal, setShowMockConfigModal] = useState(false);
  const [showQuickTestModal, setShowQuickTestModal] = useState(false);
  const [selectedQuickSubject, setSelectedQuickSubject] = useState(null);

  // Mock Setup state
  const [selectedMockSubjectIds, setSelectedMockSubjectIds] = useState([]);

  // Quick Drill parameters
  const [quickQuestionCount, setQuickQuestionCount] = useState(10);
  const [quickTimed, setQuickTimed] = useState(true);
  const [quickYear, setQuickYear] = useState('all');

  // Live window & release status driven directly by weeklyMockHelper
  const [mockStatus, setMockStatus] = useState(() => getWeeklyMockWindowStatus());
  const [resultsUnlocked, setResultsUnlocked] = useState(() => 
    areResultsReleased(weeklyMock?.active_date)
  );

  useEffect(() => {
    const syncTime = () => {
      setMockStatus(getWeeklyMockWindowStatus());
      setResultsUnlocked(areResultsReleased(weeklyMock?.active_date));
    };

    syncTime();
    const interval = setInterval(syncTime, 1000);
    return () => clearInterval(interval);
  }, [weeklyMock]);

  const displaySubjects = subjects;

  const aptitudeSubject =
    displaySubjects.find(
      (s) => s.code?.toUpperCase() === 'APPT' || s.name?.toLowerCase().includes('aptitude')
    ) || displaySubjects[0];

  const selectableMockSubjects = displaySubjects.filter(
    (s) => s.id !== aptitudeSubject?.id
  );

  const toggleMockSubject = (id) => {
    if (selectedMockSubjectIds.includes(id)) {
      setSelectedMockSubjectIds(selectedMockSubjectIds.filter((item) => item !== id));
    } else {
      if (selectedMockSubjectIds.length < 3) {
        setSelectedMockSubjectIds([...selectedMockSubjectIds, id]);
      }
    }
  };

  const handleLaunchMock = () => {
    if (selectedMockSubjectIds.length !== 3) return;
    const finalSubjects = [aptitudeSubject.id, ...selectedMockSubjectIds].join(',');
    router.push(`/practice/mock?subjects=${finalSubjects}`);
  };

  const handleOpenQuickTest = (subject) => {
    setSelectedQuickSubject(subject);
    setQuickYear('all');
    setShowQuickTestModal(true);
  };

  const handleLaunchQuickTest = () => {
    if (!selectedQuickSubject) return;
    router.push(
      `/practice/session?subjectId=${selectedQuickSubject.id}&count=${quickQuestionCount}&timed=${quickTimed}&year=${quickYear}&mode=single_subject`
    );
  };

  return (
    <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-8 select-none">
      <DashboardHeader
        profile={profile}
        onOpenRedeem={() => setShowRedeemModal(true)}
      />

      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800/80 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500 text-sm">
                <FaBolt />
              </span>
              <h2 className="text-xl font-black text-white tracking-tight">
                Weekly Nationwide Mock Challenge
              </h2>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Strict 1-hour departmental trial • Every Friday 10:00 AM – 2:00 PM WAT
            </p>
          </div>

          <div className="flex items-center gap-2">
            {mockStatus.isOpen ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Live Window Open
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-800/80 border border-gray-700 text-gray-400 text-xs font-bold">
                <FaClock className="text-orange-500" /> Next Mock: Friday 10:00 AM
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Card 1: Live Exam Room */}
          <div className={`relative overflow-hidden bg-gradient-to-b from-[#141822] to-[#0f1117] border rounded-3xl p-6 flex flex-col justify-between shadow-xl transition ${
            mockStatus.isOpen ? 'border-orange-500/60 shadow-orange-500/5' : 'border-gray-800 opacity-90'
          }`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center text-lg ${
                  mockStatus.isOpen 
                    ? 'bg-orange-600/20 border-orange-500/30 text-orange-400' 
                    : 'bg-gray-800/50 border-gray-700 text-gray-400'
                }`}>
                  <FaFire />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20">
                  40 Questions • 1 Hour
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-white">Take Live Challenge</h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Compulsory Aptitude + your 3 core departmental subjects automatically matched.
                </p>
              </div>

              <div className="bg-[#0b0e14] border border-gray-800 p-3 rounded-2xl flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {mockStatus.isOpen ? 'Window Closes In:' : 'Opens In:'}
                </span>
                <div className="font-mono font-black text-xs text-orange-400 flex items-center gap-1">
                  <span>{String(mockStatus.hours || 0).padStart(2, '0')}h</span> :
                  <span>{String(mockStatus.minutes || 0).padStart(2, '0')}m</span> :
                  <span>{String(mockStatus.seconds || 0).padStart(2, '0')}s</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={!mockStatus.isOpen}
              onClick={() => {
                if (!mockStatus.isOpen) return;
                if (!profile?.is_premium) {
                  setShowRedeemModal(true);
                  return;
                }
                router.push('/practice/mock/live');
              }}
              className={`mt-5 w-full py-3 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition ${
                mockStatus.isOpen
                  ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/30 active:scale-[0.98] cursor-pointer'
                  : 'bg-gray-800/80 border border-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {mockStatus.isOpen ? (
                <>Enter Live Mock Room <FaArrowRight /></>
              ) : (
                <><FaLock className="text-xs text-gray-500" /> Opens Friday 10:00 AM WAT</>
              )}
            </button>
          </div>

          {/* Card 2: Results & Corrections */}
          <div className="relative overflow-hidden bg-gradient-to-b from-[#141822] to-[#0f1117] border border-gray-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-lg">
                  <FaCalendarCheck />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  Every Saturday
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-white">Results & Corrections</h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Scores and step-by-step answer explanations unlock every Saturday at 12:00 AM WAT.
                </p>
              </div>

              <div className="bg-[#0b0e14] border border-gray-800 p-3 rounded-2xl flex items-center gap-2.5 text-xs text-gray-400">
                <FaFileAlt className="text-emerald-400 text-sm shrink-0" />
                <span className="text-[11px]">View breakdown, wrong answers, and speed diagnostics.</span>
              </div>
            </div>

            {resultsUnlocked ? (
              <Link
                href="/practice/mock/result"
                className="mt-5 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-600/20"
              >
                Check My Mock Results <FaArrowRight />
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="mt-5 w-full py-3 bg-gray-800/80 border border-gray-700 text-gray-400 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <FaLock className="text-xs text-gray-500" /> Unlocks on Saturday
              </button>
            )}
          </div>

          {/* Card 3: Nationwide Leaderboard */}
          <div className="relative overflow-hidden bg-gradient-to-b from-[#141822] to-[#0f1117] border border-gray-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl group hover:border-yellow-500/50 transition">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-yellow-600/20 border border-yellow-500/30 flex items-center justify-center text-yellow-400 text-lg">
                  <FaTrophy />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-lg border border-yellow-500/20">
                  Top 100 Rank
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-white group-hover:text-yellow-400 transition">
                  Nationwide Leaderboard
                </h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Compare your percentile, speed, and accuracy against thousands of aspirants nationwide.
                </p>
              </div>

              <div className="bg-[#0b0e14] border border-gray-800 p-3 rounded-2xl flex items-center justify-between text-xs font-mono text-gray-400">
                <span className="flex items-center gap-1 text-yellow-400 font-bold">
                  <FaMedal /> 1st – 3rd Medals
                </span>
                <span className="text-[11px] text-gray-500">Live Standings</span>
              </div>
            </div>

            <Link 
              href="/practice/leaderboard"
              className="mt-5 w-full py-3 bg-[#0b0e14] hover:bg-gray-800 border border-gray-800 text-gray-200 hover:text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer text-center"
            >
              View Leaderboard <FaArrowRight />
            </Link>
          </div>

        </div>
      </section>

      <DashboardLaunchers
        onOpenMockModal={() => setShowMockConfigModal(true)}
      />

      <SubjectDrillGrid
        subjects={displaySubjects}
        isPremium={Boolean(profile?.is_premium)}
        onSelectSubject={handleOpenQuickTest}
      />

      <RecentAttemptsList recentSessions={recentSessions} />

      <MockSetupModal
        isOpen={showMockConfigModal}
        onClose={() => setShowMockConfigModal(false)}
        aptitudeSubject={aptitudeSubject}
        selectableSubjects={selectableMockSubjects}
        selectedSubjectIds={selectedMockSubjectIds}
        onToggleSubject={toggleMockSubject}
        onLaunchMock={handleLaunchMock}
      />

      <QuickTestModal
        isOpen={showQuickTestModal}
        onClose={() => setShowQuickTestModal(false)}
        selectedSubject={selectedQuickSubject}
        availableYears={availableYears}
        quickQuestionCount={quickQuestionCount}
        setQuickQuestionCount={setQuickQuestionCount}
        quickTimed={quickTimed}
        setQuickTimed={setQuickTimed}
        quickYear={quickYear}
        setQuickYear={setQuickYear}
        onLaunchQuickTest={handleLaunchQuickTest}
      />

      <RedeemModal
        isOpen={showRedeemModal}
        onClose={() => setShowRedeemModal(false)}
        profile={profile}
        onRedeemed={() => window.location.reload()}
      />
    </main>
  );
}