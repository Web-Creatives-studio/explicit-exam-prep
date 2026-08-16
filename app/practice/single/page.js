import { redirect } from 'next/navigation';
import { createClient } from '../../utils/supabase/server';
import Navbar from '../../components/Navbar';
import DashboardClientView from './DesktopClientView';

export const dynamic = 'force-dynamic';

export default async function StudentHomePage() {
  const supabase = await createClient();

  // 1. Authenticate Logged-in User
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/practice/single');
  }

  // 2. Fetch Profile, Subjects, and Recent Sessions concurrently via Promise.all
  const [profileRes, subjectsRes, recentSessionsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single(),
    supabase
      .from('subjects')
      .select('*')
      .order('name', { ascending: true }),
    supabase
      .from('mock_sessions')
      .select('id, mode, score, total_questions, time_spent_seconds, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const profile = profileRes?.data || null;
  const subjects = subjectsRes?.data || [];
  const recentSessions = recentSessionsRes?.data || [];

  return (
    <div className="min-h-screen bg-[#0a0c10] text-gray-100 flex flex-col selection:bg-orange-500 selection:text-white">
      <Navbar profile={profile} />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-8">
        <DashboardClientView 
          profile={profile} 
          subjects={subjects} 
          recentSessions={recentSessions} 
        />
      </main>
    </div>
  );
}