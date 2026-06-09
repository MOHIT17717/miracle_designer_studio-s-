'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getProducts, getCategories, getOffers, Product, Category, Offer, formatPrice, getWhatsAppLink } from '@/lib/api';
import { useCart } from '@/components/cart/CartProvider';
import GlassCard from '@/components/ui/GlassCard';
import SectionHeading from '@/components/ui/SectionHeading';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, prodRes, offerRes] = await Promise.all([
          getCategories().catch(() => ({ items: [] })),
          getProducts({ limit: 4 }).catch(() => ({ items: [] })),
          getOffers().catch(() => ({ items: [] })),
        ]);
        setCategories(catRes.items || []);
        setProducts(prodRes.items || []);
        setOffers(offerRes.items || []);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const services = [
    {
      title: 'Bridal Couture & Custom Design',
      desc: 'Work with our master designers to sketch and craft your dream bridal lehenga, custom-fit gown, or traditional reception outfit.',
      icon: '✨',
      link: '/booking',
    },
    {
      title: 'Bridal & Premium Event Makeup',
      desc: 'Flawless airbrush and traditional HD makeup customized for your skin tone, camera lighting, and wedding theme.',
      icon: '💄',
      link: '/booking',
    },
    {
      title: 'Silk Saree Draping & Styling',
      desc: 'Expert draping in traditional styles (Madisar, Gujarati, Bengali) along with customized jewelry and accessories styling.',
      icon: '🎗️',
      link: '/booking',
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* ─── Hero Section ────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20 px-6">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 bg-dark-gradient z-0" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gold-500/10 blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-rose-500/10 blur-[120px] animate-float stagger-3" />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8 animate-fade-in-up">
          <span className="text-gold-500 uppercase tracking-[0.3em] font-medium text-xs sm:text-sm block">
            Couture • Luxury • Elegance
          </span>
          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold text-cream leading-[1.15] tracking-tight">
            Crafting Your <span className="text-gradient-gold">Perfect Miracle</span>
          </h1>
          <p className="text-white/60 text-lg sm:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Discover bespoke bridal wear, premium handloom silk sarees, and professional makeup services curated for life's most beautiful celebrations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Link href="/shop" className="btn-gold min-w-44 text-center">
              Explore Collection
            </Link>
            <Link href="/booking" className="btn-outline min-w-44 text-center">
              Book Appointment
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Categories Section ──────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8">
        <SectionHeading
          title="Browse Collections"
          subtitle="Explore our curated categories of designer garments, traditional handloom work, and premium styling kits."
        />

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-44 rounded-2xl bg-white/5 animate-pulse border border-white/10" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((cat, i) => (
              <Link href={`/shop?categoryId=${cat.id}`} key={cat.id}>
                <GlassCard
                  hover
                  padding="none"
                  className={`h-44 flex flex-col justify-center items-center text-center p-4 border border-white/5 hover:border-gold-500/30 transition-all stagger-${(i % 5) + 1}`}
                >
                  <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-500 text-2xl mb-4 group-hover:scale-110 transition-transform">
                    {cat.name === 'Sarees' ? '👘' : cat.name === 'Lehengas' ? '👗' : cat.name === 'Kurtis' ? '👚' : cat.name === 'Jewelry' ? '👑' : cat.name === 'Makeup Kits' ? '💄' : '👜'}
                  </div>
                  <h3 className="font-semibold text-cream text-sm tracking-wide">{cat.name}</h3>
                  <span className="text-white/40 text-xs mt-1 font-light">
                    {cat._count?.products || 0} Items
                  </span>
                </GlassCard>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ─── Featured Products Section ────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8">
        <SectionHeading
          title="Featured Creations"
          subtitle="Our most celebrated signature pieces, hand-tailored with premium textiles and exquisite craftsmanship."
        />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-96 rounded-2xl bg-white/5 animate-pulse border border-white/10" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((prod) => (
              <GlassCard key={prod.id} padding="none" className="group overflow-hidden flex flex-col h-full border border-white/5">
                {/* Product Image Box */}
                <div className="relative aspect-[3/4] bg-gradient-to-br from-gold-500/5 to-rose-500/5 flex items-center justify-center overflow-hidden">
                  <span className="text-4xl text-gold-500/30">✨</span>
                  {prod.isNew && (
                    <span className="absolute top-4 left-4 bg-gold-500 text-brand-black text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                      New In
                    </span>
                  )}
                  <Link href={`/shop/${prod.id}`} className="absolute inset-0 z-10" />
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gold-500 uppercase tracking-widest font-medium">
                      {prod.category?.name || 'Couture'}
                    </span>
                    <h3 className="font-display font-semibold text-cream text-base group-hover:text-gold-300 transition-colors line-clamp-1">
                      {prod.name}
                    </h3>
                    <p className="text-white/40 text-xs font-light line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="text-cream font-semibold text-sm">
                        {formatPrice(prod.salePrice || prod.price)}
                      </span>
                      {prod.salePrice && (
                        <span className="text-white/30 line-through text-xs ml-2">
                          {formatPrice(prod.price)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        addItem({
                          productId: prod.id,
                          name: prod.name,
                          price: prod.price,
                          salePrice: prod.salePrice,
                          image: '',
                        })
                      }
                      className="w-9 h-9 rounded-full border border-gold-500/25 flex items-center justify-center text-gold-500 hover:bg-gold-500 hover:text-brand-black transition-colors"
                      aria-label="Add to cart"
                    >
                      +
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </section>

      {/* ─── Offers Section ──────────────────────────────────── */}
      {offers.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="rounded-3xl border border-gold-500/20 bg-gradient-to-r from-brand-dark via-gold-950/20 to-brand-dark p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gold-500/5 blur-[80px]" />
            <div className="flex-1 space-y-4 relative z-10 text-center md:text-left">
              <span className="bg-gold-500/10 text-gold-500 border border-gold-500/25 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                {offers[0].festivalName || 'Limited Time Offer'}
              </span>
              <h2 className="font-display text-3xl sm:text-5xl font-bold text-cream">
                {offers[0].title}
              </h2>
              <p className="text-white/60 font-light leading-relaxed max-w-xl">
                {offers[0].description}
              </p>
              <div className="flex gap-4 pt-4 justify-center md:justify-start">
                <Link href="/offers" className="btn-gold px-8 py-3 text-sm">
                  View Offers
                </Link>
              </div>
            </div>
            <div className="w-full md:w-80 aspect-square rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative flex-shrink-0">
              <span className="font-display text-5xl font-bold text-gradient-gold">
                {offers[0].discount}% OFF
              </span>
            </div>
          </div>
        </section>
      )}

      {/* ─── Services Section ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8">
        <SectionHeading
          title="Studio Services"
          subtitle="We specialize in bringing your aesthetic visions to life, blending traditional heritage with modern glamour."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((svc) => (
            <GlassCard key={svc.title} className="flex flex-col justify-between h-full border border-white/5 hover:border-gold-500/20 transition-all p-8">
              <div className="space-y-4">
                <span className="text-4xl block">{svc.icon}</span>
                <h3 className="font-display font-semibold text-cream text-xl tracking-tight">
                  {svc.title}
                </h3>
                <p className="text-white/50 font-light leading-relaxed text-sm">
                  {svc.desc}
                </p>
              </div>
              <Link
                href={svc.link}
                className="mt-6 inline-flex items-center text-gold-500 hover:text-gold-300 text-sm font-semibold transition-colors"
              >
                Book Appointment &rarr;
              </Link>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* ─── WhatsApp Banner ─────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6">
        <GlassCard className="text-center p-10 space-y-6 border border-gold-500/20 bg-gradient-to-b from-brand-dark/50 to-brand-black">
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-cream">
            Prefer a Custom Consultation?
          </h2>
          <p className="text-white/60 font-light text-sm sm:text-base max-w-lg mx-auto">
            Get in touch with our design team directly over WhatsApp to share references, discuss budgets, or check date availability.
          </p>
          <a
            href={getWhatsAppLink('Hi, I would like to consult about designing a custom outfit.')}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold inline-flex items-center gap-3 px-8"
          >
            <span>💬 Chat on WhatsApp</span>
          </a>
        </GlassCard>
      </section>
    </div>
  );
}
