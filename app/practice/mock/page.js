import { redirect } from 'next/navigation';
import { createClient } from '../../utils/supabase/server';
import MockExamEngine from './MockEngine';

export const dynamic = 'force-dynamic';

/**
 * Server-side Fisher-Yates Random Shuffler
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default async function MockChallengePage() {
  const supabase = await createClient();

  // 1. Authenticate user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/practice/mock');
  }

  // 2. Fetch User Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const isPremium = Boolean(profile?.is_premium);

  // 3. Fetch All Active Subjects
  const { data: allSubjects } = await supabase
    .from('subjects')
    .select('id, name, code')
    .order('name', { ascending: true });

  // 4. Fetch questions based on tier and pre-shuffle on server
  const subjectsWithQuestions = await Promise.all(
    (allSubjects || []).map(async (sub) => {
      let query = supabase
        .from('questions')
        .select(
          'id, subject_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, is_free, year'
        )
        .eq('subject_id', sub.id);

      // If user is Free, restrict to free question pool
      if (!isPremium) {
        query = query.eq('is_free', true);
      }

      const { data: qData, error: qErr } = await query;

      if (qErr) {
        console.error(`Error fetching questions for ${sub.name}:`, qErr);
      }

      const randomizedPool = shuffleArray(qData || []).map((q) => ({
        ...q,
        subject_name: sub.name,
        subject_code: sub.code,
      }));

      return {
        ...sub,
        questions: randomizedPool,
      };
    })
  );

  return (
    <div className="min-h-screen bg-[#0a0c10] text-gray-100 flex flex-col justify-center selection:bg-orange-500 selection:text-white">
      <main className="flex-1 w-full max-w-6xl mx-auto p-3 sm:p-6 flex flex-col justify-center">
        <MockExamEngine
          profile={profile}
          subjectsData={subjectsWithQuestions}
          isPremium={isPremium}
        />
      </main>
    </div>
  );
}