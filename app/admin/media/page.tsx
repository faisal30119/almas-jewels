'use client';
import { useEffect, useState, useRef } from 'react';
import { Upload, Copy, Trash2, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminFetch } from '@/lib/admin-utils';
import { useToast } from '@/components/admin/Toast';
import ConfirmModal from '@/components/admin/ConfirmModal';

interface MediaItem {
  public_id: string;
  secure_url: string;
  format: string;
  bytes: number;
  created_at: string;
  width: number;
  height: number;
}

export default function MediaPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Cursor stack: index 0 = page 1 (no cursor), index 1 = page 2 cursor, etc.
  const [cursorStack, setCursorStack] = useState<string[]>(['']);
  const [page, setPage] = useState(0); // index into cursorStack
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  async function load(cursor: string) {
    setLoading(true);
    const params = cursor ? `?next_cursor=${encodeURIComponent(cursor)}` : '';
    const res = await adminFetch(`/api/admin/media${params}`);
    const data = await res.json();
    setItems(data.items ?? []);
    setNextCursor(data.next_cursor ?? null);
    setLoading(false);
  }

  useEffect(() => { load(''); }, []);

  function goNext() {
    if (!nextCursor) return;
    const newStack = [...cursorStack.slice(0, page + 1), nextCursor];
    setCursorStack(newStack);
    setPage(page + 1);
    load(nextCursor);
  }

  function goPrev() {
    if (page === 0) return;
    const prevPage = page - 1;
    setPage(prevPage);
    load(cursorStack[prevPage]);
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    let uploaded = 0;
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append('file', file);
      const res = await adminFetch('/api/admin/upload', { method: 'POST', body: fd, headers: {} });
      const data = await res.json();
      if (data.url) uploaded++;
      else toast(`Failed: ${file.name}`, 'error');
    }
    if (uploaded > 0) {
      toast(`${uploaded} file(s) uploaded`);
      // Reset to page 1 so the new image appears
      setCursorStack(['']);
      setPage(0);
      load('');
    }
    setUploading(false);
  }

  async function deleteMedia() {
    if (!deleteTarget) return;
    const res = await adminFetch('/api/admin/media', {
      method: 'DELETE',
      body: JSON.stringify({ public_id: deleteTarget.public_id }),
    });
    const data = await res.json();
    if (data.error) toast(data.error, 'error');
    else {
      toast('Deleted');
      // Reload current page
      load(cursorStack[page]);
    }
    setDeleteTarget(null);
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url).then(() => toast('URL copied'));
  }

  const pageNumber = page + 1;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-playfair font-bold text-gray-900">Media Library</h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Page {pageNumber} · {items.length} images
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            ref={fileRef} type="file" accept="image/*" multiple
            className="hidden" onChange={(e) => handleUpload(e.target.files)}
          />
          <button
            onClick={() => fileRef.current?.click()} disabled={uploading}
            className="flex items-center gap-2 bg-emerald-900 text-white text-xs uppercase tracking-widest px-4 py-2.5 hover:bg-emerald-800 disabled:opacity-60"
          >
            <Upload size={14} /> {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </div>


      {/* Drop zone */}
      <div
        className="border-2 border-dashed border-gray-200 p-8 mb-6 text-center cursor-pointer hover:border-emerald-600 transition-colors"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}
      >
        <ImageIcon size={28} className="mx-auto text-gray-300 mb-2" />
        <p className="text-sm text-gray-400">Drag & drop images here or <span className="text-emerald-700 underline">browse</span></p>
        <p className="text-xs text-gray-300 mt-1">PNG, JPG, WebP supported</p>
      </div>

      {/* Image grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="aspect-square animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No media yet. Upload your first image.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item) => (
            <div key={item.public_id} className="group relative border border-gray-200 overflow-hidden bg-gray-50">
              <img
                src={item.secure_url} alt={item.public_id}
                referrerPolicy="no-referrer"
                className="w-full aspect-square object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => copyUrl(item.secure_url)}
                  className="p-1.5 bg-white text-gray-800 hover:bg-gray-100"
                  title="Copy URL"
                >
                  <Copy size={13} />
                </button>
                <button
                  onClick={() => setDeleteTarget(item)}
                  className="p-1.5 bg-white text-red-500 hover:bg-red-50"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="px-2 py-1.5 border-t border-gray-100 bg-white">
                <p className="text-[10px] text-gray-400 truncate">{item.public_id.split('/').pop()}</p>
                <p className="text-[10px] text-gray-300">{Math.round(item.bytes / 1024)}KB · {item.width}×{item.height}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && (page > 0 || nextCursor) && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={goPrev}
            disabled={page === 0}
            className="flex items-center gap-2 border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <span className="text-sm text-gray-500">Page {pageNumber}</span>
          <button
            onClick={goNext}
            disabled={!nextCursor}
            className="flex items-center gap-2 border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget} title="Delete Image"
        message={`Delete "${deleteTarget?.public_id.split('/').pop()}" from Cloudinary? This cannot be undone.`}
        onConfirm={deleteMedia} onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
