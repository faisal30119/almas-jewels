'use client';
import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { adminFetch } from '@/lib/admin-utils';
import { useToast } from '@/components/admin/Toast';

const INPUT = 'w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-emerald-800';
const LABEL = 'block text-xs uppercase tracking-widest text-gray-500 mb-1';

const SEO_DEFAULTS: Record<string, string> = {
  seo_title: 'Almas Jewels | Luxury Bridal Jewelry',
  seo_description: 'Almas Jewels — handcrafted luxury bridal jewelry including Kundan, Polki, Meenakari & more.',
  seo_keywords: 'bridal jewelry, kundan, polki, meenakari, luxury jewelry, Indian bridal',
  og_image: '',
  twitter_handle: '',
  robots_txt: 'User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: https://almasjewels.com/sitemap.xml',
  google_analytics_id: '',
};

export default function SEOPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>(SEO_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminFetch('/api/admin/settings').then((r) => r.json()).then((data) => {
      setSettings({ ...SEO_DEFAULTS, ...data.data });
      setLoading(false);
    });
  }, []);

  function set(key: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setSettings((s) => ({ ...s, [key]: e.target.value }));
  }

  async function save() {
    setSaving(true);
    const res = await adminFetch('/api/admin/settings', { method: 'POST', body: JSON.stringify(settings) });
    const data = await res.json();
    if (data.error) toast(data.error, 'error');
    else toast('SEO settings saved');
    setSaving(false);
  }

  if (loading) return <div className="p-6 text-sm text-gray-400">Loading…</div>;

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-playfair font-bold text-gray-900">SEO</h1>
          <p className="text-sm text-gray-500">Global search engine optimization settings</p>
        </div>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-emerald-900 text-white text-xs uppercase tracking-widest px-4 py-2.5 hover:bg-emerald-800 disabled:opacity-60">
          <Save size={14} /> {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      <div className="bg-white border border-gray-200 p-6 mb-4">
        <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-4">Meta Tags</h2>
        <div className="space-y-4">
          <div><label className={LABEL}>Site Title</label><input type="text" value={settings.seo_title} onChange={set('seo_title')} className={INPUT} /></div>
          <div><label className={LABEL}>Meta Description</label><textarea value={settings.seo_description} rows={3} onChange={set('seo_description')} className={INPUT + ' resize-none'} /></div>
          <div><label className={LABEL}>Keywords (comma-separated)</label><input type="text" value={settings.seo_keywords} onChange={set('seo_keywords')} className={INPUT} /></div>
          <div><label className={LABEL}>OG Image URL</label><input type="text" value={settings.og_image} onChange={set('og_image')} className={INPUT} placeholder="https://..." /></div>
          <div><label className={LABEL}>Twitter Handle</label><input type="text" value={settings.twitter_handle} onChange={set('twitter_handle')} className={INPUT} placeholder="@almasjewels" /></div>
          <div><label className={LABEL}>Google Analytics ID</label><input type="text" value={settings.google_analytics_id} onChange={set('google_analytics_id')} className={INPUT} placeholder="G-XXXXXXXXXX" /></div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-6">
        <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-4">robots.txt</h2>
        <textarea value={settings.robots_txt} rows={8} onChange={set('robots_txt')} className={INPUT + ' resize-y font-mono text-xs'} />
        <p className="text-xs text-gray-400 mt-2">This content is served at /robots.txt via your server config.</p>
      </div>
    </div>
  );
}
