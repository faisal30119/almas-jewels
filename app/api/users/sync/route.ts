import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/auth-helper';

export async function POST(request: Request) {
  const { user, error: authError } = await requireAuth(request);
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const displayName =
    body.display_name ??
    user.user_metadata?.display_name ??
    user.user_metadata?.full_name ??
    user.email?.split('@')[0] ??
    '';

  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .upsert(
      {
        uid: user.id,
        email: user.email!,
        display_name: displayName,
      },
      { onConflict: 'uid' }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}
