import { redirect } from 'next/navigation';
import { createClient } from '../utils/supabase/server';
import Navbar from '../components/Navbar';
import ProfileClientView from './ProfileClientView';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const supabase = await createClient();

  // 1. Authenticate candidate
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/practice/profile');
  }

  // 2. Fetch User Profile and Lifetime Attempts concurrently via Promise.all
  const [profileRes, attemptsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single(),
    supabase
      .from('mock_sessions')
      .select('score, total_questions, time_spent_seconds, created_at, mode')
      .eq('user_id', user.id),
  ]);

  const profile = profileRes?.data || null;
  const attempts = attemptsRes?.data || [];

  // 3. Compute lifetime statistics safely
  const totalExams = attempts.length;
  let totalScore = 0;
  let totalQuestions = 0;
  let totalSeconds = 0;
  let bestScore = 0;

  for (const att of attempts) {
    const s = att.score || 0;
    const q = att.total_questions || 0;
    const t = att.time_spent_seconds || 0;

    totalScore += s;
    totalQuestions += q;
    totalSeconds += t;
    if (s > bestScore) {
      bestScore = s;
    }
  }

  const averageAccuracy = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

  const stats = {
    totalExams,
    averageAccuracy,
    bestScore,
    totalHoursStudied: (totalSeconds / 3600).toFixed(1),
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-gray-100 flex flex-col selection:bg-orange-500 selection:text-white">
      <Navbar profile={profile} />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-8">
        <ProfileClientView 
          profile={profile}
          stats={stats}
        />
      </main>
    </div>
  );
}