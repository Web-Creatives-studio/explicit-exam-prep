import { redirect } from 'next/navigation';
// 1. Point to server.js (or '@/utils/supabase/server' if you use path aliases)
import { createClient } from '../utils/supabase/server';
import AdminLayoutClient from './AdminLayoutClient';

export const dynamic = 'force-dynamic';

export default async function AdminRootLayout({ children }) {
  // 2. Await the server client (reads session cookies)
  const supabase = await createClient();

  // 1. Check logged-in auth user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/admin/dashboard');
  }

  // 2. Fetch role from database profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', user.id)
    .single();

  // 3. Kick out unauthorized users (students)
  if (!profile || profile.role !== 'admin') {
    redirect('/practice/single');
  }

  return (
    <AdminLayoutClient userProfile={profile}>
      {children}
    </AdminLayoutClient>
  );
}