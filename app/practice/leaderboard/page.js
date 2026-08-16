import { createClient } from '../../utils/supabase/server';
import Navbar from '../../components/Navbar';
import LeaderboardClientView from './LeaderboardClientView';

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
  const supabase = await createClient();

  // 1. Get logged in user profile
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    profile = userProfile;
  }

  // 2. Fetch top 50 participants from the past 7 days
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const { data: rawSessions } = await supabase
    .from('mock_sessions')
    .select(`
      id,
      score,
      total_questions,
      time_spent_seconds,
      created_at,
      user_id,
      profiles:user_id (id, full_name, department)
    `)
    .in('mode', ['weekly_mock', 'full_mock'])
    .gte('created_at', oneWeekAgo.toISOString())
    .order('score', { ascending: false })
    .order('time_spent_seconds', { ascending: true })
    .limit(50);

  // 3. Fallback Map for User Profiles if foreign key joins return array/null
  const userIds = [...new Set((rawSessions || []).map((s) => s.user_id).filter(Boolean))];
  let profileMap = {};

  if (userIds.length > 0) {
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, full_name, department')
      .in('id', userIds);

    if (profilesData) {
      profilesData.forEach((p) => {
        profileMap[p.id] = p;
      });
    }
  }

  // 4. Normalize records for LeaderboardClientView
  const normalizedScores = (rawSessions || []).map((session) => {
    const joinedProfile = Array.isArray(session.profiles)
      ? session.profiles[0]
      : session.profiles;

    const fallbackProfile = profileMap[session.user_id];

    return {
      ...session,
      profiles: {
        id: session.user_id,
        full_name:
          joinedProfile?.full_name ||
          fallbackProfile?.full_name ||
          'Candidate',
        department:
          joinedProfile?.department ||
          fallbackProfile?.department ||
          'OAU Post-UTME',
      },
    };
  });

  return (
    <div className="min-h-screen bg-[#0a0c10] text-gray-100 flex flex-col selection:bg-orange-500 selection:text-white">
      <Navbar profile={profile} />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-8">
        <LeaderboardClientView 
          profile={profile}
          scores={normalizedScores}
        />
      </main>
    </div>
  );
}