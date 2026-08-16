'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import DashboardHeader from '../../components/dashboard/DashboardHeader';
import DashboardLaunchers from '../../components/dashboard/DashboardLaunchers';
import SubjectDrillGrid from '../../components/dashboard/SubjectDrillGrid';
import RecentAttemptsList from '../../components/dashboard/RecentAttemptsList';
import MockSetupModal from '../../components/dashboard/MockSetupModal';
import QuickTestModal from '../../components/dashboard/QuickTestModal';
import RedeemModal from '../../components/ReedemModal';

export default function DashboardClientView({ profile, subjects = [], recentSessions = [] }) {
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

  // Fallback subjects if database is newly seeded
  const displaySubjects =
    subjects.length > 0
      ? subjects
      : [
          { id: 'appt', name: 'Aptitude', code: 'APPT' },
          { id: 'eng', name: 'Use of English', code: 'ENG' },
          { id: 'mth', name: 'Mathematics', code: 'MTH' },
          { id: 'bio', name: 'Biology', code: 'BIO' },
          { id: 'chm', name: 'Chemistry', code: 'CHM' },
          { id: 'phy', name: 'Physics', code: 'PHY' },
          { id: 'gov', name: 'Government', code: 'GOV' },
          { id: 'eco', name: 'Economics', code: 'ECN' },
          { id: 'lit', name: 'Literature', code: 'LIT' },
          { id: 'crs', name: 'Christian Religious Studies', code: 'CRS' },
        ];

  // Auto-picked compulsory Aptitude
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
    setShowQuickTestModal(true);
  };

  const handleLaunchQuickTest = () => {
    if (!selectedQuickSubject) return;
    router.push(
      `/practice/session?subjectId=${selectedQuickSubject.id}&count=${quickQuestionCount}&timed=${quickTimed}&mode=single_subject`
    );
  };

  return (
    <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-8">
      {/* 1. Header Hero Banner */}
      <DashboardHeader
        profile={profile}
        onOpenRedeem={() => setShowRedeemModal(true)}
      />

      {/* 2. Mode Launchers */}
      <DashboardLaunchers
        onOpenMockModal={() => setShowMockConfigModal(true)}
      />

      {/* 3. Subject Drills Grid */}
      <SubjectDrillGrid
        subjects={displaySubjects}
        isPremium={Boolean(profile?.is_premium)}
        onSelectSubject={handleOpenQuickTest}
      />

      {/* 4. Recent Test Attempts List */}
      <RecentAttemptsList recentSessions={recentSessions} />

      {/* 5. Mock Exam 4-Subject Setup Modal */}
      <MockSetupModal
        isOpen={showMockConfigModal}
        onClose={() => setShowMockConfigModal(false)}
        aptitudeSubject={aptitudeSubject}
        selectableSubjects={selectableMockSubjects}
        selectedSubjectIds={selectedMockSubjectIds}
        onToggleSubject={toggleMockSubject}
        onLaunchMock={handleLaunchMock}
      />

      {/* 6. Quick Single Drill Setup Modal */}
      <QuickTestModal
        isOpen={showQuickTestModal}
        onClose={() => setShowQuickTestModal(false)}
        selectedSubject={selectedQuickSubject}
        quickQuestionCount={quickQuestionCount}
        setQuickQuestionCount={setQuickQuestionCount}
        quickTimed={quickTimed}
        setQuickTimed={setQuickTimed}
        onLaunchQuickTest={handleLaunchQuickTest}
      />

      {/* 7. Redeem Code & Buy via WhatsApp Modal */}
      <RedeemModal
        isOpen={showRedeemModal}
        onClose={() => setShowRedeemModal(false)}
        profile={profile}
        onRedeemed={() => window.location.reload()}
      />
    </main>
  );
}