import { redirect } from 'next/navigation';
import { createClient } from '../utils/supabase/server';
import Navbar from '../components/Navbar';
import StudentHistoryClientView from './HistoryClientView';

export const dynamic = 'force-dynamic';

export default async function StudentHistoryPage() {
  const supabase = await createClient();

  // 1. Authenticate user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/history');
  }

  // 2. Fetch Profile & Complete Test History concurrently
  const [profileRes, sessionsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single(),
    supabase
      .from('mock_sessions')
      .select(`
        id,
        mode,
        subject_id,
        score,
        total_questions,
        time_spent_seconds,
        created_at,
        subjects (
          id,
          name,
          code
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ]);

  const profile = profileRes?.data || null;
  const sessions = sessionsRes?.data || [];

  return (
    <div className="min-h-screen bg-[#0a0c10] text-gray-100 flex flex-col selection:bg-orange-500 selection:text-white">
      <Navbar profile={profile} />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <StudentHistoryClientView 
          profile={profile} 
          sessions={sessions} 
        />
      </main>
    </div>
  );
}