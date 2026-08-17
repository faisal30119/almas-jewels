'use client';
import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { adminFetch } from '@/lib/admin-utils';
import { useToast } from '@/components/admin/Toast';

const INPUT = 'w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-emerald-800';
const LABEL = 'block text-xs uppercase tracking-widest text-gray-500 mb-1';

const DEFAULTS: Record<string, string> = {
  site_name: 'Almas Jewels',
  site_tagline: 'Luxury Bridal Jewelry',
  contact_email: 'almasladiescornersakchi@gmail.com',
  contact_phone: '+91 9608921088',
  whatsapp_number: '919608921088',
  address: 'Sakchi, Jamshedpur, Jharkhand',
  facebook_url: '',
  instagram_url: '',
  youtube_url: '',
  announcement_text: '',
  announcement_active: 'false',
  tax_percent: '0',
  free_shipping_above: '5000',
  shipping_fee: '99',
  logo_url: '',
};

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminFetch('/api/admin/settings').then((r) => r.json()).then((data) => {
      setSettings({ ...DEFAULTS, ...data.data });
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
    else toast('Settings saved');
    setSaving(false);
  }

  if (loading) return <div className="p-6 text-sm text-gray-400">Loading settings…</div>;

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white border border-gray-200 p-6 mb-4">
      <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-4 font-medium">{title}</h2>
      {children}
    </div>
  );

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-playfair font-bold text-gray-900">Settings</h1>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-emerald-900 text-white text-xs uppercase tracking-widest px-4 py-2.5 hover:bg-emerald-800 disabled:opacity-60">
          <Save size={14} /> {saving ? 'Saving…' : 'Save All'}
        </button>
      </div>

      <Section title="Brand">
        <div className="grid grid-cols-2 gap-4">
          <div><label className={LABEL}>Site Name</label><input type="text" value={settings.site_name} onChange={set('site_name')} className={INPUT} /></div>
          <div><label className={LABEL}>Tagline</label><input type="text" value={settings.site_tagline} onChange={set('site_tagline')} className={INPUT} /></div>
        </div>
        <div className="mt-3"><label className={LABEL}>Logo URL</label><input type="text" value={settings.logo_url} onChange={set('logo_url')} className={INPUT} placeholder="https://..." /></div>
      </Section>

      <Section title="Contact">
        <div className="grid grid-cols-2 gap-4">
          <div><label className={LABEL}>Email</label><input type="email" value={settings.contact_email} onChange={set('contact_email')} className={INPUT} /></div>
          <div><label className={LABEL}>Phone</label><input type="text" value={settings.contact_phone} onChange={set('contact_phone')} className={INPUT} /></div>
          <div><label className={LABEL}>WhatsApp Number</label><input type="text" value={settings.whatsapp_number} onChange={set('whatsapp_number')} className={INPUT} /></div>
          <div><label className={LABEL}>Address</label><input type="text" value={settings.address} onChange={set('address')} className={INPUT} /></div>
        </div>
      </Section>

      <Section title="Social Links">
        <div className="space-y-3">
          <div><label className={LABEL}>Facebook URL</label><input type="text" value={settings.facebook_url} onChange={set('facebook_url')} className={INPUT} placeholder="https://facebook.com/..." /></div>
          <div><label className={LABEL}>Instagram URL</label><input type="text" value={settings.instagram_url} onChange={set('instagram_url')} className={INPUT} placeholder="https://instagram.com/..." /></div>
          <div><label className={LABEL}>YouTube URL</label><input type="text" value={settings.youtube_url} onChange={set('youtube_url')} className={INPUT} placeholder="https://youtube.com/..." /></div>
        </div>
      </Section>

      <Section title="Announcement Bar">
        <div className="space-y-3">
          <div><label className={LABEL}>Message</label><input type="text" value={settings.announcement_text} onChange={set('announcement_text')} className={INPUT} placeholder="Free shipping on orders above ₹5000!" /></div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={settings.announcement_active === 'true'} onChange={(e) => setSettings((s) => ({ ...s, announcement_active: e.target.checked ? 'true' : 'false' }))} className="w-4 h-4 accent-emerald-700" />
            <span className="text-sm text-gray-700">Show announcement bar</span>
          </label>
        </div>
      </Section>

      <Section title="Shipping & Tax">
        <div className="grid grid-cols-3 gap-4">
          <div><label className={LABEL}>Shipping Fee (₹)</label><input type="number" value={settings.shipping_fee} onChange={set('shipping_fee')} className={INPUT} /></div>
          <div><label className={LABEL}>Free Shipping Above (₹)</label><input type="number" value={settings.free_shipping_above} onChange={set('free_shipping_above')} className={INPUT} /></div>
          <div><label className={LABEL}>Tax %</label><input type="number" value={settings.tax_percent} onChange={set('tax_percent')} className={INPUT} /></div>
        </div>
      </Section>
    </div>
  );
}
