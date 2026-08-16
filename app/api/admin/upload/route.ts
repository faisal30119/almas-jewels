import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helper';

export async function POST(request: Request) {
  const { user, error: authError } = await requireAdmin(request);
  if (authError || !user) {
    return NextResponse.json({ error: authError ?? 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: 'Only JPEG, PNG, WebP, and GIF images are allowed' },
      { status: 400 }
    );
  }

  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File size must be under 10 MB' }, { status: 400 });
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    return NextResponse.json(
      { error: 'Cloudinary is not configured (missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME or NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET)' },
      { status: 500 }
    );
  }

  // Upload to Cloudinary via unsigned upload preset
  const cloudinaryForm = new FormData();
  cloudinaryForm.append('file', file);
  cloudinaryForm.append('upload_preset', uploadPreset);
  cloudinaryForm.append('folder', 'almas_bridal/products');

  const cloudRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: cloudinaryForm }
  );

  if (!cloudRes.ok) {
    const errText = await cloudRes.text();
    console.error('Cloudinary upload error:', errText);
    return NextResponse.json({ error: 'Cloudinary upload failed' }, { status: 500 });
  }

  const cloudData = await cloudRes.json() as {
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
  };

  return NextResponse.json({
    url: cloudData.secure_url,
    public_id: cloudData.public_id,
  });
}
