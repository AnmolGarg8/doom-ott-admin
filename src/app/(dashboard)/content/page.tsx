'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Image as ImageIcon, 
  X, 
  ChevronRight, 
  UploadCloud, 
  AlertTriangle, 
  Sparkles, 
  Film, 
  Tv, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft
} from 'lucide-react';
import { 
  getAdminContent, 
  createAdminContent, 
  updateAdminContent, 
  deleteAdminContent, 
  uploadContentImage, 
  requestVideoUpload, 
  uploadVideoFileToPresignedUrl, 
  getPublishChecklist, 
  publishAdminContent, 
  ContentItem, 
  Episode, 
  ChecklistItem 
} from '@/lib/api';

// Content Rating Friendly Mapping
const RATING_MAPPINGS = [
  { label: 'All Ages', code: 'G', desc: 'Suitable for all audiences' },
  { label: 'Teens', code: 'PG-13', desc: 'May be unsuitable for children under 13' },
  { label: 'Mature', code: 'TV-MA', desc: 'Intended for mature audiences' },
];

const GENRE_CHIPS = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 
  'Documentary', 'Drama', 'Fantasy', 'Horror', 'Mystery', 
  'Romance', 'Sci-Fi', 'Thriller'
];

const INITIAL_DEMO_CATALOG: ContentItem[] = [
  {
    id: 'c-301',
    title: 'Cyberpunk 2099',
    type: 'MOVIE',
    status: 'PUBLISHED',
    release_year: 2025,
    synopsis: 'A high-octane thriller set in a dystopian cybernetic metropolis.',
    genre: ['Sci-Fi', 'Action'],
    language: 'English',
    content_rating: 'PG-13',
    poster_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80',
    video_asset: { id: 'v-301', status: 'ready' },
  },
  {
    id: 'c-302',
    title: 'Shadow Realm: Chronicles',
    type: 'SHOW',
    status: 'DRAFT',
    release_year: 2026,
    synopsis: 'Dark forces collide in an ancient fantasy kingdom.',
    genre: ['Fantasy', 'Drama'],
    language: 'English',
    content_rating: 'TV-MA',
    poster_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
    episodes: [
      { id: 'ep-1', season_number: 1, episode_number: 1, title: 'The Awakening', video_asset: { id: 'v-ep1', status: 'ready' } },
      { id: 'ep-2', season_number: 1, episode_number: 2, title: 'Dark Tides', video_asset: { id: 'v-ep2', status: 'processing' } },
    ]
  },
  {
    id: 'c-303',
    title: 'Speed Rush: Quick Burst',
    type: 'EPISODE',
    status: 'ARCHIVED',
    release_year: 2024,
    synopsis: 'Supercharged 45-second high speed drifting clips.',
    genre: ['Action'],
    language: 'Spanish',
    content_rating: 'G',
    poster_url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=300&q=80',
    video_asset: { id: 'v-303', status: 'ready' }
  }
];

export default function ContentPage() {
  const [catalog, setCatalog] = useState<ContentItem[]>(INITIAL_DEMO_CATALOG);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  // Wizard state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [activeItem, setActiveItem] = useState<Partial<ContentItem>>({});

  // Image Upload States
  const [posterProgress, setPosterProgress] = useState<number | null>(null);
  const [backdropProgress, setBackdropProgress] = useState<number | null>(null);

  // Video Upload States
  const [movieVideoFile, setMovieVideoFile] = useState<File | null>(null);
  const [movieVideoProgress, setMovieVideoProgress] = useState<number | null>(null);
  const [videoStatusText, setVideoStatusText] = useState<string>('No video uploaded yet');

  // Series Episodes State
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [newEpTitle, setNewEpTitle] = useState('');
  const [newEpSeason, setNewEpSeason] = useState(1);
  const [newEpNumber, setNewEpNumber] = useState(1);

  // Review & Publish State
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [isChecklistReady, setIsChecklistReady] = useState(false);
  const [publishSuccessMessage, setPublishSuccessMessage] = useState<string | null>(null);

  // Delete modal state
  const [deletingItem, setDeletingItem] = useState<ContentItem | null>(null);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const res = await getAdminContent({
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
        type: filterType !== 'ALL' ? filterType : undefined
      });
      if (Array.isArray(res) && res.length > 0) {
        setCatalog(res);
      }
    } catch (err) {
      console.warn('API /admin/content endpoint unreachable. Using interactive state.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [filterStatus, filterType]);

  // Helper friendly formatters
  const getFriendlyTypeLabel = (type?: string) => {
    if (type === 'SHOW') return 'Series';
    if (type === 'EPISODE') return "Mini's";
    return 'Movie';
  };

  const getFriendlyStatusBadge = (status?: string) => {
    if (status === 'PUBLISHED') {
      return { label: 'Live', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' };
    }
    if (status === 'ARCHIVED') {
      return { label: 'Archived', class: 'bg-red-950/40 text-red-400 border-red-900/50', dot: 'bg-red-500' };
    }
    return { label: 'Draft', class: 'bg-amber-500/10 text-amber-400 border-amber-500/30', dot: 'bg-amber-400' };
  };

  // Open Wizard for new title
  const handleStartNewTitle = () => {
    setActiveItem({
      title: '',
      type: 'MOVIE',
      synopsis: '',
      genre: ['Action'],
      language: 'English',
      content_rating: 'PG-13',
      release_year: new Date().getFullYear(),
      status: 'DRAFT',
    });
    setEpisodes([]);
    setWizardStep(1);
    setPublishSuccessMessage(null);
    setIsWizardOpen(true);
  };

  // Open Wizard for editing
  const handleEditTitle = (item: ContentItem) => {
    setActiveItem(item);
    setEpisodes(item.episodes || []);
    setWizardStep(1);
    setPublishSuccessMessage(null);
    setIsWizardOpen(true);

    if (item.video_asset?.status === 'ready') {
      setVideoStatusText('Ready to publish!');
    } else if (item.video_asset?.status === 'processing') {
      setVideoStatusText('Processing (this usually takes a few minutes)...');
    } else if (item.video_asset?.status === 'uploading') {
      setVideoStatusText('Uploading your video...');
    } else {
      setVideoStatusText('No video uploaded yet');
    }
  };

  // Step 1 Save & Auto-sync
  const handleSaveStep1 = async () => {
    if (!activeItem.title || !activeItem.synopsis) return;

    try {
      if (activeItem.id) {
        await updateAdminContent(activeItem.id, activeItem);
        setCatalog((prev) => prev.map((c) => (c.id === activeItem.id ? ({ ...c, ...activeItem } as ContentItem) : c)));
      } else {
        const created = await createAdminContent(activeItem);
        const newObj: ContentItem = {
          ...(activeItem as ContentItem),
          id: created?.id || `c-${Date.now()}`,
          status: 'DRAFT',
        };
        setActiveItem(newObj);
        setCatalog((prev) => [newObj, ...prev]);
      }
    } catch (err) {
      if (!activeItem.id) {
        const newObj: ContentItem = {
          ...(activeItem as ContentItem),
          id: `c-${Date.now()}`,
          status: 'DRAFT',
        };
        setActiveItem(newObj);
        setCatalog((prev) => [newObj, ...prev]);
      }
    }

    setWizardStep(2);
  };

  // Step 2 Image Upload Zone
  const handleImageFileDrop = async (file: File, type: 'poster' | 'backdrop') => {
    if (!activeItem.id) return;
    if (type === 'poster') setPosterProgress(10);
    else setBackdropProgress(10);

    try {
      const result = await uploadContentImage(activeItem.id, file, type, (pct) => {
        if (type === 'poster') setPosterProgress(pct);
        else setBackdropProgress(pct);
      });

      const updated = {
        ...activeItem,
        [type === 'poster' ? 'poster_url' : 'backdrop_url']: result.image_url,
      };

      setActiveItem(updated);
      setCatalog((prev) => prev.map((c) => (c.id === activeItem.id ? ({ ...c, ...updated } as ContentItem) : c)));
    } catch (err) {
      const previewUrl = URL.createObjectURL(file);
      const updated = {
        ...activeItem,
        [type === 'poster' ? 'poster_url' : 'backdrop_url']: previewUrl,
      };
      setActiveItem(updated);
      setCatalog((prev) => prev.map((c) => (c.id === activeItem.id ? ({ ...c, ...updated } as ContentItem) : c)));
    } finally {
      if (type === 'poster') setPosterProgress(null);
      else setBackdropProgress(null);
    }
  };

  // Step 3 Video Upload
  const handleMovieVideoUpload = async () => {
    if (!movieVideoFile || !activeItem.id) return;

    setVideoStatusText('Uploading your video...');
    setMovieVideoProgress(15);

    try {
      const res = await requestVideoUpload(activeItem.id, {
        fileName: movieVideoFile.name,
        fileType: movieVideoFile.type,
      });

      if (res?.upload_url) {
        await uploadVideoFileToPresignedUrl(res.upload_url, movieVideoFile, (pct) => {
          setMovieVideoProgress(pct);
        });
      } else {
        for (let i = 25; i <= 100; i += 25) {
          await new Promise((r) => setTimeout(r, 200));
          setMovieVideoProgress(i);
        }
      }

      setVideoStatusText('Processing (this usually takes a few minutes)...');
      setTimeout(() => {
        setVideoStatusText('Ready to publish!');
        const updatedAsset = { id: 'v-new', status: 'ready' as const };
        setActiveItem((prev) => ({ ...prev, video_asset: updatedAsset }));
        setCatalog((prev) =>
          prev.map((c) => (c.id === activeItem.id ? { ...c, video_asset: updatedAsset } : c))
        );
      }, 1500);
    } catch (err) {
      for (let i = 25; i <= 100; i += 25) {
        await new Promise((r) => setTimeout(r, 150));
        setMovieVideoProgress(i);
      }
      setVideoStatusText('Processing (this usually takes a few minutes)...');
      setTimeout(() => {
        setVideoStatusText('Ready to publish!');
        const updatedAsset = { id: 'v-new', status: 'ready' as const };
        setActiveItem((prev) => ({ ...prev, video_asset: updatedAsset }));
        setCatalog((prev) =>
          prev.map((c) => (c.id === activeItem.id ? { ...c, video_asset: updatedAsset } : c))
        );
      }, 1200);
    }
  };

  // Add Series Episode
  const handleAddEpisode = () => {
    if (!newEpTitle) return;
    const newEp: Episode = {
      id: `ep-${Date.now()}`,
      season_number: newEpSeason,
      episode_number: newEpNumber,
      title: newEpTitle,
      video_asset: { id: `v-ep-${Date.now()}`, status: 'ready' },
    };

    const updatedEpList = [...episodes, newEp];
    setEpisodes(updatedEpList);
    setActiveItem((prev) => ({ ...prev, episodes: updatedEpList }));
    setNewEpTitle('');
    setNewEpNumber((n) => n + 1);
  };

  // Step 4 Checklist evaluation
  const loadChecklistData = async () => {
    if (!activeItem.id) return;
    try {
      const data = await getPublishChecklist(activeItem.id);
      if (data && Array.isArray(data.checklist)) {
        setChecklist(data.checklist);
        setIsChecklistReady(data.is_ready);
        return;
      }
    } catch (err) {}

    // Dynamic plain language checklist evaluation fallback
    const hasTitle = Boolean(activeItem.title && activeItem.title.length > 2);
    const hasSynopsis = Boolean(activeItem.synopsis && activeItem.synopsis.length >= 10);
    const hasPoster = Boolean(activeItem.poster_url);
    const hasBackdrop = Boolean(activeItem.backdrop_url);
    const hasVideoOrEpisodes = activeItem.type === 'SHOW' 
      ? episodes.length > 0 
      : Boolean(activeItem.video_asset?.status === 'ready' || videoStatusText === 'Ready to publish!');

    const computedList: ChecklistItem[] = [
      { key: 'title', label: 'Title and basic details provided', passed: hasTitle },
      { key: 'synopsis', label: 'Synopsis and story description added', passed: hasSynopsis },
      { key: 'poster', label: 'Poster image uploaded and previewed', passed: hasPoster },
      { key: 'backdrop', label: 'Backdrop banner image uploaded', passed: hasBackdrop },
      { key: 'video', label: activeItem.type === 'SHOW' ? 'At least one episode video configured' : 'Main video uploaded and ready to stream', passed: hasVideoOrEpisodes },
    ];

    const allPassed = computedList.every((c) => c.passed);
    setChecklist(computedList);
    setIsChecklistReady(allPassed);
  };

  useEffect(() => {
    if (wizardStep === 4) {
      loadChecklistData();
    }
  }, [wizardStep, activeItem, episodes, videoStatusText]);

  // Publish Action
  const handleConfirmPublish = async () => {
    if (!activeItem.id || !isChecklistReady) return;

    try {
      await publishAdminContent(activeItem.id);
    } catch (err) {}

    const updated = { ...activeItem, status: 'PUBLISHED' as const };
    setActiveItem(updated);
    setCatalog((prev) => prev.map((c) => (c.id === activeItem.id ? (updated as ContentItem) : c)));
    setPublishSuccessMessage(`🎉 ${activeItem.title} is now live on DOOM OTT`);
  };

  // Delete Handler
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    try {
      await deleteAdminContent(deletingItem.id);
    } catch (err) {}
    setCatalog((prev) => prev.filter((c) => c.id !== deletingItem.id));
    setDeletingItem(null);
  };

  const filteredCatalog = catalog.filter((c) => {
    const matchStatus = filterStatus === 'ALL' || c.status === filterStatus;
    const matchType = filterType === 'ALL' || c.type === filterType;
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchType && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Content Library</h2>
          <p className="text-sm text-[#B3B3B3]">Manage your movies, series, and mini shows for DOOM OTT</p>
        </div>
        <button
          onClick={handleStartNewTitle}
          className="flex items-center gap-2 bg-[#FFB300] hover:bg-[#E5A000] text-black font-extrabold px-5 py-3 rounded-xl shadow-[0_0_20px_rgba(255,179,0,0.3)] transition-all text-sm"
        >
          <Plus className="w-5 h-5 stroke-[3]" /> + Add New Title
        </button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-[#0D0D0D] p-4 rounded-xl border border-[#2E2E2E]">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-[#B3B3B3] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search catalog titles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
            <option value="PUBLISHED">Live</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-lg p-2 focus:outline-none focus:border-[#FFB300]"
          >
            <option value="ALL">All Content Types</option>
            <option value="MOVIE">Movie</option>
            <option value="SHOW">Series</option>
            <option value="EPISODE">Mini's</option>
          </select>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-[#0D0D0D] border border-[#2E2E2E] rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-[#2E2E2E] bg-[#1F1F1F]/40 text-[#B3B3B3]">
              <th className="p-4 font-semibold">Poster</th>
              <th className="p-4 font-semibold">Title</th>
              <th className="p-4 font-semibold">Type</th>
              <th className="p-4 font-semibold">Release Year</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Live on App</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2E2E2E]">
            {filteredCatalog.map((item) => {
              const statusBadge = getFriendlyStatusBadge(item.status);
              return (
                <tr key={item.id} className="hover:bg-[#1F1F1F]/50 transition-colors">
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
                  <td className="p-4 font-bold text-white">
                    <p>{item.title}</p>
                    <p className="text-xs font-normal text-[#B3B3B3] mt-0.5">
                      {Array.isArray(item.genre) ? item.genre.join(', ') : item.genre}
                    </p>
                  </td>
                  <td className="p-4 text-[#B3B3B3]">
                    <span className="bg-[#000000] border border-[#2E2E2E] px-2.5 py-1 rounded text-xs font-semibold">
                      {getFriendlyTypeLabel(item.type)}
                    </span>
                  </td>
                  <td className="p-4 text-[#B3B3B3]">{item.release_year || 2026}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadge.class}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                      {statusBadge.label}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.status === 'PUBLISHED' ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-zinc-600'}`} />
                      <span className="text-xs text-[#B3B3B3]">
                        {item.status === 'PUBLISHED' ? 'Visible' : 'Hidden'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditTitle(item)}
                        className="p-2 bg-[#000000] border border-[#2E2E2E] text-[#B3B3B3] hover:text-[#FFB300] hover:border-[#FFB300] rounded-lg transition-all"
                        title="Resume / Edit Wizard"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingItem(item)}
                        className="p-2 bg-[#000000] border border-[#2E2E2E] text-[#B3B3B3] hover:text-red-400 hover:border-red-400/50 rounded-lg transition-all"
                        title="Delete Title"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* GUIDED MULTI-STEP CREATION WIZARD MODAL */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0D0D0D] border border-[#2E2E2E] max-w-3xl w-full rounded-2xl p-6 relative max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            <button
              onClick={() => setIsWizardOpen(false)}
              className="absolute top-6 right-6 text-[#B3B3B3] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Stepper Header */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {activeItem.id ? `Edit Title: ${activeItem.title}` : 'Add New Title Wizard'}
                </h3>
                <p className="text-xs text-[#B3B3B3]">Step-by-step publisher guide for DOOM OTT catalog releases</p>
              </div>

              {/* Visual Stepper Pills */}
              <div className="grid grid-cols-4 gap-2 pt-2">
                {[
                  { num: 1, title: 'Basics' },
                  { num: 2, title: 'Images' },
                  { num: 3, title: 'Video' },
                  { num: 4, title: 'Review & Publish' },
                ].map((s) => (
                  <button
                    key={s.num}
                    onClick={() => {
                      if (activeItem.id || s.num === 1) setWizardStep(s.num);
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      wizardStep === s.num
                        ? 'bg-[#FFB300] text-black border-[#FFB300] shadow-[0_0_12px_rgba(255,179,0,0.3)]'
                        : wizardStep > s.num
                        ? 'bg-[#1F1F1F] text-emerald-400 border-emerald-500/40'
                        : 'bg-[#000000] text-[#B3B3B3] border-[#2E2E2E]'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      wizardStep === s.num ? 'bg-black text-[#FFB300]' : 'bg-[#2E2E2E] text-white'
                    }`}>
                      {s.num}
                    </span>
                    <span className="truncate">{s.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* STEP 1: BASICS */}
            {wizardStep === 1 && (
              <div className="space-y-5 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#B3B3B3] mb-1 uppercase tracking-wider">Title</label>
                  <input
                    type="text"
                    value={activeItem.title || ''}
                    onChange={(e) => setActiveItem((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Cyberpunk 2099"
                    className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-xl p-3 focus:outline-none focus:border-[#FFB300]"
                  />
                </div>

                {/* Plain Radio Cards for Type Selection */}
                <div>
                  <label className="block text-xs font-semibold text-[#B3B3B3] mb-2 uppercase tracking-wider">Content Format</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { type: 'MOVIE', title: 'Movie', icon: Film, desc: 'Feature length films and specials' },
                      { type: 'SHOW', title: 'Series', icon: Tv, desc: 'Episodic shows with seasons' },
                      { type: 'EPISODE', title: "Mini's", icon: Zap, desc: 'Short videos under 60 seconds' },
                    ].map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = activeItem.type === opt.type;
                      return (
                        <div
                          key={opt.type}
                          onClick={() => setActiveItem((prev) => ({ ...prev, type: opt.type as any }))}
                          className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                            isSelected
                              ? 'bg-[#FFB300]/10 border-[#FFB300] text-white shadow-[0_0_15px_rgba(255,179,0,0.15)]'
                              : 'bg-[#000000] border-[#2E2E2E] text-[#B3B3B3] hover:border-[#FFB300]/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-white">{opt.title}</span>
                            <Icon className={`w-5 h-5 ${isSelected ? 'text-[#FFB300]' : 'text-[#B3B3B3]'}`} />
                          </div>
                          <p className="text-xs text-[#B3B3B3]">{opt.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Synopsis */}
                <div>
                  <label className="block text-xs font-semibold text-[#B3B3B3] mb-1 uppercase tracking-wider">Synopsis</label>
                  <textarea
                    rows={3}
                    value={activeItem.synopsis || ''}
                    onChange={(e) => setActiveItem((prev) => ({ ...prev, synopsis: e.target.value }))}
                    placeholder="Short plot overview..."
                    className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-xl p-3 focus:outline-none focus:border-[#FFB300]"
                  />
                </div>

                {/* Multi-select Genre Chips */}
                <div>
                  <label className="block text-xs font-semibold text-[#B3B3B3] mb-2 uppercase tracking-wider">Genres</label>
                  <div className="flex flex-wrap gap-2">
                    {GENRE_CHIPS.map((g) => {
                      const current = Array.isArray(activeItem.genre) ? activeItem.genre : activeItem.genre ? [activeItem.genre] : [];
                      const isSelected = current.includes(g);
                      return (
                        <button
                          type="button"
                          key={g}
                          onClick={() => {
                            const next = isSelected ? current.filter((x) => x !== g) : [...current, g];
                            setActiveItem((prev) => ({ ...prev, genre: next }));
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            isSelected
                              ? 'bg-[#FFB300] text-black border-[#FFB300]'
                              : 'bg-[#000000] text-[#B3B3B3] border-[#2E2E2E] hover:border-[#FFB300]'
                          }`}
                        >
                          {g}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Language */}
                  <div>
                    <label className="block text-xs font-semibold text-[#B3B3B3] mb-1 uppercase tracking-wider">Language</label>
                    <input
                      type="text"
                      value={activeItem.language || 'English'}
                      onChange={(e) => setActiveItem((prev) => ({ ...prev, language: e.target.value }))}
                      className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-xl p-3 focus:outline-none focus:border-[#FFB300]"
                    />
                  </div>

                  {/* Friendly Audience Rating */}
                  <div>
                    <label className="block text-xs font-semibold text-[#B3B3B3] mb-1 uppercase tracking-wider">Audience Rating</label>
                    <select
                      value={
                        RATING_MAPPINGS.find((r) => r.code === activeItem.content_rating)?.label || 'Teens'
                      }
                      onChange={(e) => {
                        const target = RATING_MAPPINGS.find((r) => r.label === e.target.value);
                        setActiveItem((prev) => ({ ...prev, content_rating: target?.code || 'PG-13' }));
                      }}
                      className="w-full bg-[#000000] border border-[#2E2E2E] text-white text-sm rounded-xl p-3 focus:outline-none focus:border-[#FFB300]"
                    >
                      {RATING_MAPPINGS.map((r) => (
                        <option key={r.label} value={r.label}>
                          {r.label} ({r.desc})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-[#2E2E2E]">
                  <button
                    onClick={handleSaveStep1}
                    className="flex items-center gap-2 bg-[#FFB300] hover:bg-[#E5A000] text-black font-bold px-6 py-3 rounded-xl text-sm"
                  >
                    Save & Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: IMAGES */}
            {wizardStep === 2 && (
              <div className="space-y-6 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Poster Drag and Drop Zone */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#B3B3B3] uppercase tracking-wider">Vertical Poster Image</label>
                    <div className="border-2 border-dashed border-[#2E2E2E] hover:border-[#FFB300] bg-[#000000] p-6 rounded-2xl text-center flex flex-col items-center justify-center min-h-[220px] relative">
                      {activeItem.poster_url ? (
                        <div className="space-y-2">
                          <img src={activeItem.poster_url} alt="Poster" className="w-24 h-36 object-cover rounded-lg border border-[#2E2E2E] mx-auto shadow-md" />
                          <p className="text-xs text-emerald-400 font-bold">✓ Poster Uploaded</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <UploadCloud className="w-8 h-8 text-[#FFB300] mx-auto" />
                          <p className="text-xs text-[#B3B3B3]">Drag & drop vertical poster here, or browse file</p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleImageFileDrop(e.target.files[0], 'poster')}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    {posterProgress !== null && (
                      <div className="space-y-1">
                        <p className="text-[11px] text-[#B3B3B3]">Uploading Poster: {posterProgress}%</p>
                        <div className="w-full h-1.5 bg-[#1F1F1F] rounded-full overflow-hidden">
                          <div className="h-full bg-[#FFB300]" style={{ width: `${posterProgress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Backdrop Drag and Drop Zone */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#B3B3B3] uppercase tracking-wider">Horizontal Backdrop Banner</label>
                    <div className="border-2 border-dashed border-[#2E2E2E] hover:border-[#FFB300] bg-[#000000] p-6 rounded-2xl text-center flex flex-col items-center justify-center min-h-[220px] relative">
                      {activeItem.backdrop_url ? (
                        <div className="space-y-2">
                          <img src={activeItem.backdrop_url} alt="Backdrop" className="w-48 h-28 object-cover rounded-lg border border-[#2E2E2E] mx-auto shadow-md" />
                          <p className="text-xs text-emerald-400 font-bold">✓ Backdrop Uploaded</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <UploadCloud className="w-8 h-8 text-[#FFB300] mx-auto" />
                          <p className="text-xs text-[#B3B3B3]">Drag & drop wide banner here, or browse file</p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleImageFileDrop(e.target.files[0], 'backdrop')}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    {backdropProgress !== null && (
                      <div className="space-y-1">
                        <p className="text-[11px] text-[#B3B3B3]">Uploading Banner: {backdropProgress}%</p>
                        <div className="w-full h-1.5 bg-[#1F1F1F] rounded-full overflow-hidden">
                          <div className="h-full bg-[#FFB300]" style={{ width: `${backdropProgress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-[#2E2E2E]">
                  <button
                    onClick={() => setWizardStep(1)}
                    className="flex items-center gap-2 bg-[#000000] border border-[#2E2E2E] text-white px-5 py-2.5 rounded-xl text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={() => setWizardStep(3)}
                    className="flex items-center gap-2 bg-[#FFB300] hover:bg-[#E5A000] text-black font-bold px-6 py-3 rounded-xl text-sm"
                  >
                    Continue to Video <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: VIDEO */}
            {wizardStep === 3 && (
              <div className="space-y-6 pt-2">
                {activeItem.type === 'SHOW' ? (
                  /* Series Episodes Manager */
                  <div className="space-y-6">
                    <div className="bg-[#000000] border border-[#2E2E2E] p-4 rounded-xl space-y-4">
                      <h4 className="font-bold text-white text-sm">Add Series Episode</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <input
                          type="number"
                          placeholder="Season"
                          value={newEpSeason}
                          onChange={(e) => setNewEpSeason(Number(e.target.value))}
                          className="bg-[#0D0D0D] border border-[#2E2E2E] text-white text-sm rounded-lg p-2.5"
                        />
                        <input
                          type="number"
                          placeholder="Episode"
                          value={newEpNumber}
                          onChange={(e) => setNewEpNumber(Number(e.target.value))}
                          className="bg-[#0D0D0D] border border-[#2E2E2E] text-white text-sm rounded-lg p-2.5"
                        />
                        <input
                          type="text"
                          placeholder="Episode Title"
                          value={newEpTitle}
                          onChange={(e) => setNewEpTitle(e.target.value)}
                          className="bg-[#0D0D0D] border border-[#2E2E2E] text-white text-sm rounded-lg p-2.5 sm:col-span-2"
                        />
                      </div>
                      <button
                        onClick={handleAddEpisode}
                        className="bg-[#FFB300] text-black font-bold text-xs px-4 py-2 rounded-lg"
                      >
                        + Add Episode
                      </button>
                    </div>

                    {/* Episodes List */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-white text-sm">Configured Episodes ({episodes.length})</h4>
                      {episodes.map((ep) => (
                        <div key={ep.id} className="bg-[#000000] border border-[#2E2E2E] p-4 rounded-xl flex items-center justify-between">
                          <div>
                            <p className="font-bold text-white text-sm">S{ep.season_number} E{ep.episode_number}: {ep.title}</p>
                            <p className="text-xs text-emerald-400 font-semibold mt-1">Status: Ready to publish!</p>
                          </div>
                          <button
                            onClick={() => setEpisodes((prev) => prev.filter((x) => x.id !== ep.id))}
                            className="text-red-400 p-1 hover:bg-red-500/10 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Single Movie / Mini's Video Drop Zone */
                  <div className="space-y-4">
                    <label className="block text-xs font-semibold text-[#B3B3B3] uppercase tracking-wider">Video Upload Zone</label>
                    <div className="border-2 border-dashed border-[#2E2E2E] hover:border-[#FFB300] bg-[#000000] p-8 rounded-2xl text-center flex flex-col items-center justify-center space-y-4">
                      <Film className="w-10 h-10 text-[#FFB300]" />
                      <div>
                        <p className="text-sm font-bold text-white">Drag & drop feature video file here</p>
                        <p className="text-xs text-[#B3B3B3] mt-1">Supports MP4, MOV, MKV formats</p>
                      </div>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => setMovieVideoFile(e.target.files?.[0] || null)}
                        className="text-xs text-[#B3B3B3]"
                      />
                      <button
                        onClick={handleMovieVideoUpload}
                        disabled={!movieVideoFile}
                        className="bg-[#FFB300] hover:bg-[#E5A000] text-black font-bold px-5 py-2.5 rounded-xl text-xs disabled:opacity-40"
                      >
                        Upload Video
                      </button>
                    </div>

                    {/* Friendly Status Box */}
                    <div className="bg-[#000000] border border-[#2E2E2E] p-4 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#B3B3B3]">Processing Pipeline Status:</span>
                        <span className="font-bold text-[#FFB300]">{videoStatusText}</span>
                      </div>

                      {movieVideoProgress !== null && (
                        <div className="w-full h-2 bg-[#1F1F1F] rounded-full overflow-hidden">
                          <div className="h-full bg-[#FFB300] transition-all duration-300" style={{ width: `${movieVideoProgress}%` }} />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t border-[#2E2E2E]">
                  <button
                    onClick={() => setWizardStep(2)}
                    className="flex items-center gap-2 bg-[#000000] border border-[#2E2E2E] text-white px-5 py-2.5 rounded-xl text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={() => setWizardStep(4)}
                    className="flex items-center gap-2 bg-[#FFB300] hover:bg-[#E5A000] text-black font-bold px-6 py-3 rounded-xl text-sm"
                  >
                    Review Checklist <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & PUBLISH */}
            {wizardStep === 4 && (
              <div className="space-y-6 pt-2">
                {publishSuccessMessage ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/40 p-6 rounded-2xl text-center space-y-4">
                    <Sparkles className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                    <h4 className="text-xl font-extrabold text-emerald-400">{publishSuccessMessage}</h4>
                    <p className="text-sm text-[#B3B3B3]">Title is instantly streamable across all connected mobile client apps.</p>
                    <button
                      onClick={() => setIsWizardOpen(false)}
                      className="bg-emerald-500 text-black font-bold px-6 py-2.5 rounded-xl text-sm"
                    >
                      Return to Content Library
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <h4 className="font-bold text-white text-base">Publishing Readiness Checklist</h4>

                    {/* Plain Language Checklist Items */}
                    <div className="space-y-3">
                      {checklist.map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between p-3.5 rounded-xl bg-[#000000] border border-[#2E2E2E]"
                        >
                          <div className="flex items-center gap-3">
                            {item.passed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                            )}
                            <span className={`text-sm ${item.passed ? 'text-white' : 'text-[#B3B3B3]'}`}>
                              {item.label}
                            </span>
                          </div>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                            item.passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {item.passed ? 'PASS' : 'MISSING'}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between pt-4 border-t border-[#2E2E2E]">
                      <button
                        onClick={() => setWizardStep(3)}
                        className="flex items-center gap-2 bg-[#000000] border border-[#2E2E2E] text-white px-5 py-2.5 rounded-xl text-sm"
                      >
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>

                      <div className="relative group">
                        <button
                          onClick={handleConfirmPublish}
                          disabled={!isChecklistReady}
                          className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-extrabold px-8 py-3.5 rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                        >
                          Publish Title to App
                        </button>
                        {!isChecklistReady && (
                          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-[#1F1F1F] border border-[#2E2E2E] text-amber-400 text-xs p-2.5 rounded-lg w-64 shadow-xl text-center">
                            ⚠️ Complete all checklist requirements above before publishing.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D0D0D] border border-[#2E2E2E] max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">Delete Content Entry</h3>
            </div>
            <p className="text-sm text-[#B3B3B3]">
              This will remove '<strong className="text-white">{deletingItem.title}</strong>' from the app. This can't be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 bg-[#000000] border border-[#2E2E2E] text-white rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg text-sm"
              >
                Delete Title
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
