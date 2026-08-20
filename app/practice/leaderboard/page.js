import { createClient } from '../../utils/supabase/server';
import LeaderboardClientView from './LeaderboardClientView';

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const filterType = resolvedSearchParams?.type || 'all_mocks';
  const selectedMockId = resolvedSearchParams?.mock_id || 'ALL';
  const daysParam = resolvedSearchParams?.days ? Number(resolvedSearchParams.days) : 7;
  const supabase = await createClient();

  // 1. Authenticate user profile
  const { data: { user } } = await supabase.auth.getUser();
  let userProfile = null;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, department, role')
      .eq('id', user.id)
      .maybeSingle();
    userProfile = profile;
  }

  // 2. Fetch all published weekly mock editions for the edition dropdown
  const { data: allMockEditions } = await supabase
    .from('weekly_mocks')
    .select('id, title, active_date')
    .eq('is_published', true)
    .order('active_date', { ascending: false });

  const latestMock = allMockEditions?.[0] || null;

  // 3. Build test_sessions query
  let query = supabase
    .from('test_sessions')
    .select(`
      id,
      user_id,
      mode,
      mock_id,
      score,
      total_questions,
      time_spent_seconds,
      created_at,
      profiles (
        id,
        full_name,
        department
      ),
      weekly_mocks (
        id,
        title,
        active_date
      )
    `)
    .in('mode', ['weekly_mock', 'weekly_challenge']);

  // Apply Mock Edition Filter
  if (selectedMockId !== 'ALL') {
    query = query.eq('mock_id', selectedMockId);
  } else if (filterType === 'latest_mock' && latestMock?.id) {
    query = query.eq('mock_id', latestMock.id);
  } else if (filterType === 'timeframe') {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysParam);
    query = query.gte('created_at', cutoffDate.toISOString());
  }

  const { data: scores, error } = await query
    .order('score', { ascending: false })
    .order('time_spent_seconds', { ascending: true })
    .limit(200);

  if (error) {
    console.error('Error fetching test_sessions leaderboard:', error);
  }

  return (
    <div className="min-h-screen bg-[#07090e] py-8 sm:py-12 px-4 sm:px-8 selection:bg-orange-500 selection:text-white">
      <div className="max-w-6xl mx-auto">
        <LeaderboardClientView 
          profile={userProfile} 
          scores={scores || []} 
          mockEditions={allMockEditions || []}
          latestMock={latestMock}
        />
      </div>
    </div>
  );
}