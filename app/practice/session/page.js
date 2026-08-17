import { redirect } from 'next/navigation';
import { createClient } from '../../utils/supabase/server';
import QuickSessionClient from './QuickSessionClient';

export const dynamic = 'force-dynamic';

/**
 * High-Entropy Fisher-Yates Randomizer
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default async function QuickSessionPage({ searchParams }) {
  const supabase = await createClient();

  // 1. Authenticate user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/practice/single');
  }

  // 2. Resolve search params safely
  const resolvedParams = await searchParams;
  const subjectId = resolvedParams?.subjectId;
  const count = Math.min(Math.max(Number(resolvedParams?.count) || 10, 5), 50);
  const timed = resolvedParams?.timed !== 'false';

  if (!subjectId) {
    redirect('/practice/single');
  }

  // 3. Fetch user profile and subject info concurrently
  const [profileRes, subjectRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single(),
    supabase
      .from('subjects')
      .select('*')
      .eq('id', subjectId)
      .single(),
  ]);

  const profile = profileRes?.data || null;
  const subject = subjectRes?.data || null;

  if (!subject) {
    redirect('/practice/single');
  }

  const isPremium = Boolean(profile?.is_premium);

  // 4. Fetch the full pool of questions for this subject respecting tier privileges
  let query = supabase
    .from('questions')
    .select(
      'id, subject_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, is_free, year'
    )
    .eq('subject_id', subjectId);

  // Free users only get free questions; Premium users get the entire bank
  if (!isPremium) {
    query = query.eq('is_free', true);
  }

  const { data: questionPool, error } = await query;

  if (error) {
    console.error('Error fetching questions:', error);
  }

  // 5. Randomly shuffle the pool and slice the requested count
  const randomizedQuestions = shuffleArray(questionPool || []).slice(0, count);

  return (
    <div className="min-h-screen bg-[#0a0c10] text-gray-100 flex flex-col justify-center selection:bg-orange-500 selection:text-white select-none">
      <main className="flex-1 w-full max-w-4xl mx-auto p-3 sm:p-6 flex flex-col justify-center">
        <QuickSessionClient
          profile={profile}
          subject={subject}
          questions={randomizedQuestions}
          timed={timed}
          questionCount={count}
          isPremium={isPremium}
        />
      </main>
    </div>
  );
}