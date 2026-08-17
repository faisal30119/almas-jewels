import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminSidebar from '@/components/admin/Sidebar';
import { ToastProvider } from '@/components/admin/Toast';

const ADMIN_EMAILS = [
  'faisal301196@gmail.com',
  'almasladiescornersakchi@gmail.com',
  ...(process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map((e) => e.trim()) ?? []),
];

export const metadata = { title: 'Almas Admin' };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !ADMIN_EMAILS.includes(user.email ?? '')) {
    redirect('/');
  }

  return (
    <ToastProvider>
      <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}

