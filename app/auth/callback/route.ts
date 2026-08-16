import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';

  if (!code) {
    return NextResponse.redirect(new URL('/', requestUrl.origin));
  }

  const cookieStore = cookies();

  // Build the response first so we can write cookies onto it
  const redirectTo = new URL(next, requestUrl.origin);
  const response = NextResponse.redirect(redirectTo);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          // Write session cookies onto the outgoing response
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, (options ?? {}) as Parameters<typeof response.cookies.set>[2]);
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('[auth/callback] exchangeCodeForSession error:', error.message);
    return NextResponse.redirect(
      new URL(`/?auth_error=${encodeURIComponent(error.message)}`, requestUrl.origin)
    );
  }

  if (data.user) {
    // Upsert user profile — fire and forget, never block the redirect
    void Promise.resolve(
      supabase.from('user_profiles').upsert(
        {
          uid: data.user.id,
          email: data.user.email!,
          display_name:
            data.user.user_metadata?.full_name ??
            data.user.user_metadata?.display_name ??
            data.user.email?.split('@')[0] ??
            '',
        },
        { onConflict: 'uid' }
      )
    ).catch(() => {});
  }

  return response;
}
