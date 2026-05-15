'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import { useMarketplaceFeatured, useMarketplaceSearch } from '@/lib/hooks/use-queries';
import { clsx } from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MarketplaceListing {
  id: string;
  title: string;
  shortDescription: string;
  system: string;
  type: string;
  licenseType: 'free' | 'cc_by' | 'proprietary';
  priceCentavos: number;
  coverImageUrl: string | null;
  averageRating: number;
  reviewCount: number;
  creatorName: string;
  tags: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SYSTEMS = [
  { id: '', label: 'All Systems' },
  { id: 'tormenta20', label: '🐉 Tormenta20' },
  { id: 'dnd5e', label: '⚔️ D&D 5e' },
  { id: 'shadowrun', label: '🤖 Shadowrun' },
];

const TYPES = [
  { id: '', label: 'All Types' },
  { id: 'adventure', label: 'Adventures' },
  { id: 'map', label: 'Maps' },
  { id: 'token', label: 'Tokens' },
  { id: 'rule', label: 'Rules Supplement' },
  { id: 'compendium', label: 'Compendium' },
];

const SORT_OPTIONS = [
  { id: 'relevance',  label: 'Most Relevant' },
  { id: 'newest',     label: 'Newest' },
  { id: 'best_rated', label: 'Best Rated' },
  { id: 'price_asc',  label: 'Price ↑' },
  { id: 'price_desc', label: 'Price ↓' },
];

const LICENSE_COLORS: Record<string, string> = {
  free:        'bg-green-900/60 text-green-300 border-green-700/40',
  cc_by:       'bg-blue-900/60 text-blue-300 border-blue-700/40',
  proprietary: 'bg-slate-800 text-slate-400 border-slate-700',
};

const LICENSE_LABELS: Record<string, string> = {
  free: 'Free', cc_by: 'CC-BY', proprietary: 'Paid',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRating({ rating, count }: { rating: number; count: number }) {
  const stars = Math.round(rating * 2) / 2;
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={clsx(
            'text-xs',
            stars >= star ? 'text-amber-400' : stars >= star - 0.5 ? 'text-amber-400/50' : 'text-slate-600',
          )}>★</span>
        ))}
      </div>
      <span className="text-xs text-slate-500">({count})</span>
    </div>
  );
}

function PriceBadge({ centavos, licenseType }: { centavos: number; licenseType: string }) {
  if (licenseType === 'free' || centavos === 0) {
    return <span className="text-green-400 font-bold text-sm">Grátis</span>;
  }
  return (
    <span className="text-white font-bold text-sm">
      R${(centavos / 100).toFixed(2).replace('.', ',')}
    </span>
  );
}

function ListingCard({ listing, onClick }: { listing: MarketplaceListing; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-500 hover:shadow-lg hover:shadow-black/30 transition-all cursor-pointer group"
    >
      {/* Cover image */}
      <div className="h-32 bg-slate-700/60 relative overflow-hidden">
        {listing.coverImageUrl ? (
          <img
            src={listing.coverImageUrl}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-slate-600">
            {listing.type === 'map' ? '🗺️' :
             listing.type === 'token' ? '🎭' :
             listing.type === 'adventure' ? '📖' : '📦'}
          </div>
        )}
        {/* License badge */}
        <div className="absolute top-2 left-2">
          <span className={clsx(
            'text-xs px-1.5 py-0.5 rounded border',
            LICENSE_COLORS[listing.licenseType] ?? LICENSE_COLORS.proprietary,
          )}>
            {LICENSE_LABELS[listing.licenseType]}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-200 text-sm leading-tight line-clamp-2 group-hover:text-white transition-colors">
            {listing.title}
          </h3>
          <PriceBadge centavos={listing.priceCentavos} licenseType={listing.licenseType} />
        </div>

        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {listing.shortDescription}
        </p>

        <div className="flex items-center justify-between">
          <StarRating rating={listing.averageRating} count={listing.reviewCount} />
          <span className="text-xs text-slate-500 truncate max-w-[100px]">{listing.creatorName}</span>
        </div>

        {/* Tags */}
        <div className="flex gap-1 flex-wrap">
          {[listing.system, listing.type].filter(Boolean).map(tag => (
            <span key={tag} className="text-xs bg-slate-700/60 text-slate-400 px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ListingModal({ listing, onClose }: { listing: MarketplaceListing; onClose: () => void }) {
  const [purchasing, setPurchasing] = useState(false);
  const [purchased, setPurchased] = useState(false);

  const handlePurchase = async () => {
    setPurchasing(true);
    // In production: call marketplace purchase API
    await new Promise(r => setTimeout(r, 1500));
    setPurchased(true);
    setPurchasing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header image */}
        <div className="h-48 bg-slate-800 relative rounded-t-2xl overflow-hidden">
          {listing.coverImageUrl ? (
            <img src={listing.coverImageUrl} alt={listing.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl text-slate-700">📦</div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >✕</button>
          <div className="absolute bottom-3 left-3">
            <span className={clsx('text-xs px-2 py-1 rounded border', LICENSE_COLORS[listing.licenseType])}>
              {LICENSE_LABELS[listing.licenseType]}
            </span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <h2 className="text-xl font-bold text-white">{listing.title}</h2>
            <p className="text-sm text-slate-400 mt-1">by {listing.creatorName}</p>
          </div>

          <StarRating rating={listing.averageRating} count={listing.reviewCount} />

          <p className="text-sm text-slate-300 leading-relaxed">{listing.shortDescription}</p>

          <div className="flex flex-wrap gap-1">
            {listing.tags.map(tag => (
              <span key={tag} className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>

          {/* Purchase / Download button */}
          <div className="pt-2">
            {purchased ? (
              <div className="flex items-center gap-2 text-green-400 font-medium">
                <span>✓</span>
                <span>{listing.licenseType === 'free' ? 'Downloaded!' : 'Purchase complete!'}</span>
              </div>
            ) : (
              <button
                onClick={handlePurchase}
                disabled={purchasing}
                className={clsx(
                  'w-full py-3 rounded-xl font-semibold text-sm transition-all',
                  listing.licenseType === 'free' || listing.priceCentavos === 0
                    ? 'bg-green-600 hover:bg-green-500 text-white'
                    : 'bg-violet-600 hover:bg-violet-500 text-white',
                  purchasing && 'opacity-50 cursor-not-allowed',
                )}
              >
                {purchasing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⟳</span>
                    Processando...
                  </span>
                ) : listing.licenseType === 'free' || listing.priceCentavos === 0 ? (
                  'Download Grátis'
                ) : (
                  `Comprar — R$${(listing.priceCentavos / 100).toFixed(2).replace('.', ',')}`
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  const router = useRouter();
  const [query, setQuery]         = useState('');
  const [system, setSystem]       = useState('');
  const [type, setType]           = useState('');
  const [sortBy, setSortBy]       = useState('newest');
  const [onlyFree, setOnlyFree]   = useState(false);
  const [page, setPage]           = useState(1);
  const [selected, setSelected]   = useState<MarketplaceListing | null>(null);

  const [debouncedQuery] = useDebounce(query, 400);

  const filters = {
    query: debouncedQuery || undefined,
    system: system || undefined,
    type: type || undefined,
    licenseType: onlyFree ? 'free' : undefined,
    sortBy,
    page,
    limit: 20,
  };

  const { data: featured, isLoading: featuredLoading } = useMarketplaceFeatured(system || undefined);
  const { data: results, isLoading: searchLoading }    = useMarketplaceSearch(filters);

  const isSearching = !!debouncedQuery || !!system || !!type || onlyFree;
  const listings = isSearching ? results?.items : featured;
  const isLoading = isSearching ? searchLoading : featuredLoading;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <button onClick={() => router.push('/campaigns')} className="text-slate-400 hover:text-slate-200 transition-colors text-sm">
            ← Campanhas
          </button>
          <h1 className="text-lg font-bold flex-1">🛒 Marketplace</h1>
          <button
            onClick={() => router.push('/marketplace/my-content')}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Meu Conteúdo
          </button>
          <button
            onClick={() => router.push('/marketplace/create')}
            className="text-xs bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            + Publicar
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Search + Filters */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 mb-6 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">
              {isLoading ? '⟳' : '🔍'}
            </span>
            <input
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setPage(1); }}
              placeholder="Buscar aventuras, mapas, tokens..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-colors"
            />
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap gap-2">
            {/* System */}
            <select
              value={system}
              onChange={e => { setSystem(e.target.value); setPage(1); }}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-violet-500"
            >
              {SYSTEMS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>

            {/* Type */}
            <select
              value={type}
              onChange={e => { setType(e.target.value); setPage(1); }}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-violet-500"
            >
              {TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-violet-500"
            >
              {SORT_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>

            {/* Free only toggle */}
            <button
              onClick={() => { setOnlyFree(v => !v); setPage(1); }}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs border transition-all',
                onlyFree
                  ? 'bg-green-900/60 border-green-700 text-green-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500',
              )}
            >
              Grátis
            </button>

            {/* Results count */}
            {isSearching && results && (
              <span className="text-xs text-slate-500 self-center ml-auto">
                {results.total} resultado{results.total !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Section title */}
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
          {isSearching ? 'Resultados' : '⭐ Em Destaque'}
        </h2>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-slate-800/40 rounded-xl h-56 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && (!listings || listings.length === 0) && (
          <div className="text-center py-20 text-slate-500">
            <div className="text-5xl mb-4">🏪</div>
            <p className="text-lg">
              {isSearching ? 'Nenhum resultado encontrado.' : 'Nenhum item em destaque.'}
            </p>
            {isSearching && (
              <button
                onClick={() => { setQuery(''); setSystem(''); setType(''); setOnlyFree(false); }}
                className="mt-3 text-sm text-violet-400 hover:text-violet-300 transition-colors"
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}

        {/* Grid */}
        {!isLoading && listings && listings.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {listings.map((listing: MarketplaceListing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onClick={() => setSelected(listing)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {isSearching && results && results.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 disabled:opacity-40 hover:border-slate-500 transition-colors"
            >← Anterior</button>
            <span className="px-4 py-2 text-sm text-slate-400">
              {page} / {results.totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(results.totalPages, p + 1))}
              disabled={page === results.totalPages}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 disabled:opacity-40 hover:border-slate-500 transition-colors"
            >Próximo →</button>
          </div>
        )}
      </main>

      {/* Listing modal */}
      {selected && (
        <ListingModal listing={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
