import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // If user is accessing protected practice/mock routes
  if (user && request.nextUrl.pathname.startsWith('/practice')) {
    const deviceToken = request.cookies.get('device_session_token')?.value;

    // Fetch the active session token registered in database
    const { data: profile } = await supabase
      .from('profiles')
      .select('current_session_token')
      .eq('id', user.id)
      .single();

    // If another device logged in and changed the token, kick them out
    if (profile?.current_session_token && profile.current_session_token !== deviceToken) {
      // Force logout and redirect
      await supabase.auth.signOut();
      const redirectUrl = new URL('/login?error=session_terminated', request.url);
      const res = NextResponse.redirect(redirectUrl);
      res.cookies.delete('device_session_token');
      return res;
    }
  }

  return response;
}

export const config = {
  matcher: ['/practice/:path*'],
};