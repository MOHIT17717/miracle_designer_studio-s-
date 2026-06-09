'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getProducts, getCategories, Product, Category } from '@/lib/api';
import ProductCard from '@/components/shop/ProductCard';
import SectionHeading from '@/components/ui/SectionHeading';
import GlassCard from '@/components/ui/GlassCard';

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter States
  const categoryId = searchParams.get('categoryId') || '';
  const search = searchParams.get('search') || '';
  const sort = (searchParams.get('sort') as any) || 'newest';
  const page = parseInt(searchParams.get('page') || '1');

  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 8;

  // Search input local state
  const [searchInput, setSearchInput] = useState(search);

  // Fetch Categories once
  useEffect(() => {
    async function loadCats() {
      try {
        const res = await getCategories();
        setCategories(res.items || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    }
    loadCats();
  }, []);

  // Fetch Products on filter changes
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const res = await getProducts({
          categoryId: categoryId || undefined,
          search: search || undefined,
          sort: sort || undefined,
          page,
          limit,
        });
        setProducts(res.items || []);
        setTotalCount(res.total || 0);
        setTotalPages(Math.ceil((res.total || 0) / limit));
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [categoryId, search, sort, page]);

  // Sync Search state with URL params
  const updateParams = (newParams: Record<string, string | number | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([k, v]) => {
      if (v === null || v === '') {
        next.delete(k);
      } else {
        next.set(k, String(v));
      }
    });
    // Reset page if filters change
    if (!newParams.page && kIsNotPage(newParams)) {
      next.set('page', '1');
    }
    router.push(`/shop?${next.toString()}`);
  };

  const kIsNotPage = (params: Record<string, any>) => {
    return Object.keys(params).some((k) => k !== 'page');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput });
  };

  const handleCategoryClick = (catId: string) => {
    updateParams({ categoryId: categoryId === catId ? '' : catId });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
      <SectionHeading
        title="The Designer Shop"
        subtitle="Browse our high-end boutique of custom bridal lehengas, handloom silk sarees, and exquisite jewelry sets."
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* ─── Filters Sidebar ────────────────────────────────── */}
        <div className="space-y-6">
          {/* Search Bar */}
          <GlassCard className="p-5 border border-white/5">
            <h3 className="font-semibold text-cream text-sm uppercase tracking-wider mb-3">Search Products</h3>
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search..."
                className="input-field py-2 text-sm"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gold-500 text-brand-black font-semibold rounded-xl text-sm hover:bg-gold-300 transition-colors"
              >
                Go
              </button>
            </form>
          </GlassCard>

          {/* Categories Filter */}
          <GlassCard className="p-5 border border-white/5">
            <h3 className="font-semibold text-cream text-sm uppercase tracking-wider mb-4">Categories</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => updateParams({ categoryId: '' })}
                className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  !categoryId
                    ? 'bg-gold-500 text-brand-black font-semibold'
                    : 'text-white/60 hover:text-cream hover:bg-white/5'
                }`}
              >
                All Collections
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex justify-between items-center ${
                    categoryId === cat.id
                      ? 'bg-gold-500 text-brand-black font-semibold'
                      : 'text-white/60 hover:text-cream hover:bg-white/5'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    categoryId === cat.id ? 'bg-brand-black/25 text-brand-black' : 'bg-white/5 text-white/40'
                  }`}>
                    {cat._count?.products || 0}
                  </span>
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Sort Dropdown */}
          <GlassCard className="p-5 border border-white/5">
            <h3 className="font-semibold text-cream text-sm uppercase tracking-wider mb-3">Sort By</h3>
            <select
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-cream focus:outline-none focus:border-gold-500/50"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </GlassCard>
        </div>

        {/* ─── Product Listing Grid ───────────────────────────── */}
        <div className="lg:col-span-3 space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[3/4] h-96 rounded-2xl bg-white/5 animate-pulse border border-white/10" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
              <svg className="w-16 h-16 mx-auto text-white/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-white/40 text-lg font-light">No products found matching your criteria.</p>
              <button
                onClick={() => router.push('/shop')}
                className="mt-4 text-gold-500 hover:text-gold-300 transition-colors font-semibold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center text-xs text-white/40">
                <span>Showing {products.length} of {totalCount} creations</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-8">
                  <button
                    disabled={page <= 1}
                    onClick={() => updateParams({ page: page - 1 })}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-cream text-sm font-semibold transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-white/60">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => updateParams({ page: page + 1 })}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-cream text-sm font-semibold transition-colors disabled:opacity-30 disabled:pointer-events-none"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500 mx-auto" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
