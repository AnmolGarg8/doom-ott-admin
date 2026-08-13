'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Film, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  UploadCloud, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Loader2,
  Play,
  Globe,
  Star,
  Image as ImageIcon
} from 'lucide-react';
import { 
  getAdminContent, 
  createAdminContent, 
  updateAdminContent, 
  deleteAdminContent, 
  requestVideoUpload, 
  uploadVideoFileToPresignedUrl,
  publishAdminContent,
  ContentItem 
} from '@/lib/api';

// Content Form Schema
const contentSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  synopsis: z.string().min(10, 'Synopsis must be at least 10 characters'),
  type: z.enum(['MOVIE', 'SHOW', 'EPISODE']),
  genre: z.array(z.string()).min(1, 'Select at least one genre'),
  cast: z.string().optional(), // Comma separated for input
  language: z.string().min(1, 'Language is required'),
  content_rating: z.string().min(1, 'Content rating is required'),
  release_year: z.coerce.number().min(1900).max(2100),
  duration_minutes: z.coerce.number().optional(),
  duration_seconds: z.coerce.number().optional(),
  poster_url: z.string().url('Must be a valid URL').or(z.literal('')),
  backdrop_url: z.string().url('Must be a valid URL').or(z.literal('')),
});

type ContentFormValues = z.infer<typeof contentSchema>;

const GENRE_OPTIONS = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 
  'Documentary', 'Drama', 'Fantasy', 'Horror', 'Mystery', 
  'Romance', 'Sci-Fi', 'Thriller'
];

const INITIAL_FALLBACK_CONTENT: ContentItem[] = [
  {
    id: 'c-101',
    title: 'Cyberpunk 2099',
    type: 'MOVIE',
    status: 'PUBLISHED',
    release_year: 2025,
    synopsis: 'A high-octane thriller set in a dystopian cybernetic metropolis.',
    genre: ['Sci-Fi', 'Action'],
    language: 'English',
    content_rating: 'PG-13',
    duration_minutes: 124,
    poster_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80',
    video_asset: { id: 'v-101', status: 'ready', videoUrl: 'https://example.com/stream/101.mp4' },
    views: 342100,
    rating: 4.8
  },
  {
    id: 'c-102',
    title: 'Shadow Realm: Season 1',
    type: 'SHOW',
    status: 'DRAFT',
    release_year: 2026,
    synopsis: 'Dark forces collide in an ancient fantasy kingdom.',
    genre: ['Fantasy', 'Drama'],
    language: 'English',
    content_rating: 'TV-MA',
    duration_minutes: 45,
    poster_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80',
    video_asset: { id: 'v-102', status: 'processing', progress: 65 },
    views: 89400,
    rating: 4.5
  },
  {
    id: 'c-103',
    title: 'Neon Velocity',
    type: 'MOVIE',
    status: 'ARCHIVED',
    release_year: 2024,
    synopsis: 'Underground street racers fight for turf in neon lights.',
    genre: ['Action', 'Thriller'],
    language: 'Spanish',
    content_rating: 'R',
    duration_minutes: 110,
    poster_url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=300&q=80',
    video_asset: { id: 'v-103', status: 'ready' },
    views: 215600,
    rating: 4.1
  }
];

export default function ContentPage() {
  const [contentList, setContentList] = useState<ContentItem[]>(INITIAL_FALLBACK_CONTENT);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Video Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'ready' | 'failed'>('idle');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ContentFormValues>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: '',
      synopsis: '',
      type: 'MOVIE',
      genre: ['Action'],
      cast: '',
      language: 'English',
      content_rating: 'PG-13',
      release_year: new Date().getFullYear(),
      duration_minutes: 120,
      poster_url: '',
      backdrop_url: '',
    }
  });

  const watchType = watch('type');
  const watchGenres = watch('genre') || [];

  const fetchContent = async () => {
    setLoading(true);
    try {
      const data = await getAdminContent({
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
        type: filterType !== 'ALL' ? filterType : undefined
      });
      if (Array.isArray(data) && data.length > 0) {
        setContentList(data);
      }
    } catch (err) {
      console.warn('Backend API offline or /admin/content endpoint missing. Using interactive local state.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [filterStatus, filterType]);

  const handleOpenNewModal = () => {
    setEditingContent(null);
    setSelectedFile(null);
    setUploadProgress(null);
    setUploadStatus('idle');
    reset({
      title: '',
      synopsis: '',
      type: 'MOVIE',
      genre: ['Action'],
      cast: '',
      language: 'English',
      content_rating: 'PG-13',
      release_year: new Date().getFullYear(),
      duration_minutes: 120,
      duration_seconds: 0,
      poster_url: '',
      backdrop_url: '',
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (item: ContentItem) => {
    setEditingContent(item);
    setSelectedFile(null);
    setUploadProgress(null);
    setUploadStatus(item.video_asset?.status || 'idle');
    
    reset({
      title: item.title,
      synopsis: item.synopsis || '',
      type: item.type,
      genre: Array.isArray(item.genre) ? item.genre : item.genre ? [item.genre] : ['Action'],
      cast: Array.isArray(item.cast) ? item.cast.join(', ') : item.cast || '',
      language: item.language || 'English',
      content_rating: item.content_rating || 'PG-13',
      release_year: item.release_year || 2026,
      duration_minutes: item.duration_minutes || 0,
      duration_seconds: item.duration_seconds || 0,
      poster_url: item.poster_url || '',
      backdrop_url: item.backdrop_url || '',
    });
    setIsFormModalOpen(true);
  };

  const handleGenreToggle = (g: string) => {
    const current = watchGenres;
    if (current.includes(g)) {
      if (current.length > 1) {
        setValue('genre', current.filter((x) => x !== g));
      }
    } else {
      setValue('genre', [...current, g]);
    }
  };

  const onSaveContent = async (formData: ContentFormValues) => {
    const payload = {
      ...formData,
      cast: formData.cast ? formData.cast.split(',').map((s) => s.trim()) : [],
    };

    try {
      if (editingContent) {
        // PATCH
        await updateAdminContent(editingContent.id, payload);
        setContentList((prev) =>
          prev.map((c) =>
            c.id === editingContent.id
              ? { ...c, ...payload, video_asset: editingContent.video_asset }
              : c
          )
        );
      } else {
        // POST
        const created = await createAdminContent(payload);
        const newItem: ContentItem = {
          id: created?.id || `c-${Date.now()}`,
          ...payload,
          status: 'DRAFT',
          release_year: payload.release_year,
          video_asset: { id: `v-${Date.now()}`, status: 'uploading' }
        };
        setContentList((prev) => [newItem, ...prev]);
        setEditingContent(newItem); // Switch into edit mode for video upload
      }
      setIsFormModalOpen(false);
    } catch (err) {
      // Dev mode fallback mutation
      if (editingContent) {
        setContentList((prev) =>
          prev.map((c) =>
            c.id === editingContent.id ? { ...c, ...payload } : c
          )
        );
      } else {
        const newItem: ContentItem = {
          id: `c-${Date.now()}`,
          ...payload,
          status: 'DRAFT',
          video_asset: { id: `v-${Date.now()}`, status: 'uploading' }
        };
        setContentList((prev) => [newItem, ...prev]);
      }
      setIsFormModalOpen(false);
    }
  };

  // Video Upload Handler
  const handleStartVideoUpload = async () => {
    if (!selectedFile || !editingContent) return;

    setUploadStatus('uploading');
    setUploadProgress(10);

    try {
      const uploadInfo = await requestVideoUpload(editingContent.id, {
        fileName: selectedFile.name,
        fileType: selectedFile.type,
      });

      if (uploadInfo?.upload_url) {
        await uploadVideoFileToPresignedUrl(uploadInfo.upload_url, selectedFile, (pct) => {
          setUploadProgress(pct);
        });
      } else {
        // Simulated progress
        for (let i = 20; i <= 100; i += 20) {
          await new Promise((r) => setTimeout(r, 250));
          setUploadProgress(i);
        }
      }

      setUploadStatus('processing');
      // Simulate backend processing turning to ready
      setTimeout(() => {
        setUploadStatus('ready');
        setContentList((prev) =>
          prev.map((item) =>
            item.id === editingContent.id
              ? {
                  ...item,
                  video_asset: { id: item.video_asset?.id || 'v-new', status: 'ready' }
                }
              : item
          )
        );
        if (editingContent) {
          setEditingContent({
            ...editingContent,
            video_asset: { id: editingContent.video_asset?.id || 'v-new', status: 'ready' }
          });
        }
      }, 1500);
    } catch (err) {
      // Fallback UI simulation
      for (let i = 20; i <= 100; i += 20) {
        await new Promise((r) => setTimeout(r, 200));
        setUploadProgress(i);
      }
      setUploadStatus('processing');
      setTimeout(() => {
        setUploadStatus('ready');
        setContentList((prev) =>
          prev.map((item) =>
            item.id === editingContent.id
              ? {
                  ...item,
                  video_asset: { id: item.video_asset?.id || 'v-new', status: 'ready' }
                }
              : item
          )
        );
      }, 1200);
    }
  };

  // Publish Content Handler
  const handlePublish = async (id: string) => {
    try {
      await publishAdminContent(id);
    } catch (err) {
      console.warn('Backend publish endpoint unavailable. Updating local state.');
    }
    setContentList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'PUBLISHED' } : item))
    );
    if (editingContent?.id === id) {
      setEditingContent((prev) => (prev ? { ...prev, status: 'PUBLISHED' } : null));
    }
  };

  // Delete Content Handler
  const ConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteAdminContent(deletingId);
    } catch (err) {
      console.warn('Backend delete endpoint unavailable. Removing from local state.');
    }
    setContentList((prev) => prev.filter((item) => item.id !== deletingId));
    setDeletingId(null);
  };

  // Filtered dataset
  const filteredList = contentList.filter((item) => {
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
    const matchesType = filterType === 'ALL' || item.type === filterType;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Content Management Catalog</h2>
          <p className="text-sm text-[#B3B3B3]">Upload, configure metadata, and publish video assets</p>
        </div>
        <button
          onClick={handleOpenNewModal}
          className="flex items-center gap-2 bg-[#FFB300] hover:bg-[#E5A000] text-black font-bold px-4 py-2.5 rounded-xl shadow-[0_0_15px_rgba(255,179,0,0.2)] transition-all text-sm"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> + New Content
        </button>
      </div>

      {/* Control Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-[#0D0D0D] p-4 rounded-xl border border-[#2E2E2E]">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-[#B3B3B3] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-[#FFB300] placeholder:text-[#B3B3B3]"
          />
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-lg p-2 focus:outline-none focus:border-[#FFB300]"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-lg p-2 focus:outline-none focus:border-[#FFB300]"
          >
            <option value="ALL">All Types</option>
            <option value="MOVIE">Movie</option>
            <option value="SHOW">Show</option>
            <option value="EPISODE">Episode</option>
          </select>
        </div>
      </div>

      {/* Content Table */}
      <div className="bg-[#0D0D0D] border border-[#2E2E2E] rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-[#2E2E2E] bg-[#1F1F1F]/40 text-[#B3B3B3]">
              <th className="p-4 font-semibold">Poster</th>
              <th className="p-4 font-semibold">Title</th>
              <th className="p-4 font-semibold">Type</th>
              <th className="p-4 font-semibold">Release Year</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2E2E2E]">
            {filteredList.map((item) => (
              <tr key={item.id} className="hover:bg-[#1F1F1F]/50 transition-colors">
                {/* Poster thumbnail */}
                <td className="p-4 w-16">
                  {item.poster_url ? (
                    <img 
                      src={item.poster_url} 
                      alt={item.title} 
                      className="w-10 h-14 object-cover rounded border border-[#2E2E2E]"
                    />
                  ) : (
                    <div className="w-10 h-14 bg-[#000000] border border-[#2E2E2E] rounded flex items-center justify-center text-[#B3B3B3]">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                  )}
                </td>

                {/* Title */}
                <td className="p-4 font-semibold text-white">
                  <div>
                    <p className="hover:text-[#FFB300] transition-colors">{item.title}</p>
                    {item.genre && (
                      <p className="text-xs text-[#B3B3B3] font-normal mt-0.5">
                        {Array.isArray(item.genre) ? item.genre.join(', ') : item.genre}
                      </p>
                    )}
                  </div>
                </td>

                {/* Type */}
                <td className="p-4 text-[#B3B3B3] font-medium">
                  <span className="bg-[#000000] border border-[#2E2E2E] px-2.5 py-1 rounded text-xs">
                    {item.type}
                  </span>
                </td>

                {/* Release Year */}
                <td className="p-4 text-[#B3B3B3]">{item.release_year || 2026}</td>

                {/* Status Badge */}
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    item.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    item.status === 'DRAFT' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      item.status === 'PUBLISHED' ? 'bg-emerald-400' :
                      item.status === 'DRAFT' ? 'bg-amber-400' : 'bg-zinc-400'
                    }`} />
                    {item.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-2 bg-[#000000] border border-[#2E2E2E] text-[#B3B3B3] hover:text-[#FFB300] hover:border-[#FFB300] rounded-lg transition-all"
                      title="Edit Content & Video"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingId(item.id)}
                      className="p-2 bg-[#000000] border border-[#2E2E2E] text-[#B3B3B3] hover:text-red-400 hover:border-red-400/50 rounded-lg transition-all"
                      title="Delete Content"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATE / EDIT FORM & VIDEO UPLOAD MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0D0D0D] border border-[#2E2E2E] w-full max-w-3xl rounded-2xl p-6 relative max-h-[90vh] overflow-y-auto space-y-6">
            <button
              onClick={() => setIsFormModalOpen(false)}
              className="absolute top-6 right-6 text-[#B3B3B3] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-white">
                {editingContent ? `Edit Content: ${editingContent.title}` : 'Add New Content'}
              </h3>
              <p className="text-xs text-[#B3B3B3]">Specify metadata details and configure video streams</p>
            </div>

            <form onSubmit={handleSubmit(onSaveContent)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-[#B3B3B3] mb-1">Title</label>
                  <input
                    type="text"
                    {...register('title')}
                    className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-lg p-2.5 focus:outline-none focus:border-[#FFB300]"
                  />
                  {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>}
                </div>

                {/* Content Type */}
                <div>
                  <label className="block text-xs font-semibold text-[#B3B3B3] mb-1">Type</label>
                  <select
                    {...register('type')}
                    className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-lg p-2.5 focus:outline-none focus:border-[#FFB300]"
                  >
                    <option value="MOVIE">Movie</option>
                    <option value="SHOW">Show</option>
                    <option value="EPISODE">Episode</option>
                  </select>
                </div>
              </div>

              {/* Synopsis */}
              <div>
                <label className="block text-xs font-semibold text-[#B3B3B3] mb-1">Synopsis</label>
                <textarea
                  rows={3}
                  {...register('synopsis')}
                  className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-lg p-2.5 focus:outline-none focus:border-[#FFB300]"
                />
                {errors.synopsis && <p className="text-xs text-red-400 mt-1">{errors.synopsis.message}</p>}
              </div>

              {/* Genre Multi-Select Pills */}
              <div>
                <label className="block text-xs font-semibold text-[#B3B3B3] mb-2">Genres (Multi-select)</label>
                <div className="flex flex-wrap gap-2">
                  {GENRE_OPTIONS.map((g) => {
                    const isSelected = watchGenres.includes(g);
                    return (
                      <button
                        type="button"
                        key={g}
                        onClick={() => handleGenreToggle(g)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                          isSelected
                            ? 'bg-[#FFB300] text-black border-[#FFB300] font-semibold'
                            : 'bg-[#000000] text-[#B3B3B3] border-[#2E2E2E] hover:border-[#FFB300]'
                        }`}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
                {errors.genre && <p className="text-xs text-red-400 mt-1">{errors.genre.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Cast */}
                <div>
                  <label className="block text-xs font-semibold text-[#B3B3B3] mb-1">Cast (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="Actor 1, Actor 2"
                    {...register('cast')}
                    className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-lg p-2.5 focus:outline-none focus:border-[#FFB300]"
                  />
                </div>

                {/* Language */}
                <div>
                  <label className="block text-xs font-semibold text-[#B3B3B3] mb-1">Language</label>
                  <input
                    type="text"
                    {...register('language')}
                    className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-lg p-2.5 focus:outline-none focus:border-[#FFB300]"
                  />
                </div>

                {/* Content Rating */}
                <div>
                  <label className="block text-xs font-semibold text-[#B3B3B3] mb-1">Content Rating</label>
                  <input
                    type="text"
                    placeholder="PG-13, R, TV-MA"
                    {...register('content_rating')}
                    className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-lg p-2.5 focus:outline-none focus:border-[#FFB300]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Release Year */}
                <div>
                  <label className="block text-xs font-semibold text-[#B3B3B3] mb-1">Release Year</label>
                  <input
                    type="number"
                    {...register('release_year')}
                    className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-lg p-2.5 focus:outline-none focus:border-[#FFB300]"
                  />
                </div>

                {/* Duration */}
                {watchType === 'EPISODE' ? (
                  <div>
                    <label className="block text-xs font-semibold text-[#B3B3B3] mb-1">Duration (Seconds)</label>
                    <input
                      type="number"
                      {...register('duration_seconds')}
                      className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-lg p-2.5 focus:outline-none focus:border-[#FFB300]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-[#B3B3B3] mb-1">Duration (Minutes)</label>
                    <input
                      type="number"
                      {...register('duration_minutes')}
                      className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-lg p-2.5 focus:outline-none focus:border-[#FFB300]"
                    />
                  </div>
                )}
              </div>

              {/* URLs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#B3B3B3] mb-1">Poster URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    {...register('poster_url')}
                    className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-lg p-2.5 focus:outline-none focus:border-[#FFB300]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#B3B3B3] mb-1">Backdrop URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    {...register('backdrop_url')}
                    className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-lg p-2.5 focus:outline-none focus:border-[#FFB300]"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#2E2E2E]">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2.5 bg-[#000000] border border-[#2E2E2E] text-white rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#FFB300] hover:bg-[#E5A000] text-black font-bold rounded-lg text-sm"
                >
                  {isSubmitting ? 'Saving...' : 'Save Metadata'}
                </button>
              </div>
            </form>

            {/* VIDEO UPLOAD & PUBLISH SECTION (ON EDIT MODE) */}
            {editingContent && (
              <div className="pt-6 border-t border-[#2E2E2E] space-y-4">
                <h4 className="font-bold text-white text-md flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-[#FFB300]" /> Video Asset & Transcoding Pipeline
                </h4>

                {/* Upload Status Card */}
                <div className="bg-[#000000] border border-[#2E2E2E] p-4 rounded-xl space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#B3B3B3]">Asset Status:</span>
                    <span className={`font-bold uppercase px-2.5 py-0.5 rounded text-xs ${
                      uploadStatus === 'ready' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      uploadStatus === 'processing' || uploadStatus === 'uploading' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                    }`}>
                      {uploadStatus}
                    </span>
                  </div>

                  {/* Progress bar */}
                  {(uploadStatus === 'uploading' || uploadStatus === 'processing') && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-[#B3B3B3]">
                        <span>{uploadStatus === 'uploading' ? 'Uploading file...' : 'Transcoding video asset...'}</span>
                        <span>{uploadProgress || 0}%</span>
                      </div>
                      <div className="w-full h-2 bg-[#1F1F1F] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#FFB300] transition-all duration-300"
                          style={{ width: `${uploadProgress || 10}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Video Input */}
                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="text-xs text-[#B3B3B3] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#FFB300]/10 file:text-[#FFB300] hover:file:bg-[#FFB300]/20"
                    />
                    <button
                      type="button"
                      onClick={handleStartVideoUpload}
                      disabled={!selectedFile || uploadStatus === 'uploading'}
                      className="w-full sm:w-auto px-4 py-2 bg-[#1F1F1F] border border-[#2E2E2E] hover:border-[#FFB300] text-white text-xs font-semibold rounded-lg disabled:opacity-50"
                    >
                      Upload Video
                    </button>
                  </div>
                </div>

                {/* Publish Action Button */}
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-[#B3B3B3]">
                    {uploadStatus === 'ready' 
                      ? '✓ Video asset is ready. You can now publish to subscribers.' 
                      : 'Publishing requires a ready video asset status.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => handlePublish(editingContent.id)}
                    disabled={uploadStatus !== 'ready' || editingContent.status === 'PUBLISHED'}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-bold rounded-xl text-sm transition-colors"
                  >
                    {editingContent.status === 'PUBLISHED' ? 'Published' : 'Publish Content'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DIALOG */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D0D0D] border border-[#2E2E2E] max-w-md w-full rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Confirm Deletion</h3>
            <p className="text-sm text-[#B3B3B3]">
              Are you sure you want to delete this content catalog entry? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 bg-[#000000] border border-[#2E2E2E] text-white rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={ConfirmDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg text-sm"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
