import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helper';

function getCloudinaryAuth() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;
  return { cloudName, apiKey, apiSecret };
}

// GET /api/admin/media?next_cursor=xxx
// Returns 10 images per page using Cloudinary cursor-based pagination
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return NextResponse.json({ error }, { status: 401 });

  const { cloudName, apiKey, apiSecret } = getCloudinaryAuth();
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ items: [], next_cursor: null });
  }

  const nextCursor = req.nextUrl.searchParams.get('next_cursor') ?? '';

  const creds = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

  const url = new URL(`https://api.cloudinary.com/v1_1/${cloudName}/resources/image`);
  url.searchParams.set('type', 'upload');
  url.searchParams.set('max_results', '10');
  if (nextCursor) url.searchParams.set('next_cursor', nextCursor);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Basic ${creds}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('Cloudinary list error:', res.status, errText);
    return NextResponse.json({ items: [], next_cursor: null });
  }

  const data = await res.json();
  const items = (data.resources ?? []).map((r: Record<string, unknown>) => ({
    public_id: r.public_id,
    secure_url: r.secure_url,
    format: r.format,
    bytes: r.bytes,
    created_at: r.created_at,
    width: r.width,
    height: r.height,
  }));

  return NextResponse.json({
    items,
    next_cursor: data.next_cursor ?? null,
  });
}

// DELETE /api/admin/media — delete from Cloudinary
export async function DELETE(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return NextResponse.json({ error }, { status: 401 });

  const { public_id } = await req.json();
  if (!public_id) return NextResponse.json({ error: 'public_id required' }, { status: 400 });

  const { cloudName, apiKey, apiSecret } = getCloudinaryAuth();
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 500 });
  }

  const creds = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload`,
    {
      method: 'DELETE',
      headers: { Authorization: `Basic ${creds}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_ids: [public_id] }),
    }
  );

  if (!res.ok) return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  return NextResponse.json({ success: true });
}
