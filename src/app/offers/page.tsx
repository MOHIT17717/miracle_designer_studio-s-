'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getOffers, Offer, formatPrice } from '@/lib/api';
import { useCart } from '@/components/cart/CartProvider';
import SectionHeading from '@/components/ui/SectionHeading';
import GlassCard from '@/components/ui/GlassCard';

function CountdownTimer({ endDateStr }: { endDateStr: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(endDateStr).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endDateStr]);

  const timeBlocks = [
    { label: 'Days', val: timeLeft.days },
    { label: 'Hrs', val: timeLeft.hours },
    { label: 'Mins', val: timeLeft.minutes },
    { label: 'Secs', val: timeLeft.seconds },
  ];

  return (
    <div className="flex gap-3 justify-center md:justify-start pt-2">
      {timeBlocks.map((block) => (
        <div key={block.label} className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-display font-bold text-gradient-gold text-lg sm:text-xl shadow-inner">
            {String(block.val).padStart(2, '0')}
          </div>
          <span className="text-[10px] text-white/40 uppercase tracking-widest mt-1 font-medium">{block.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    async function loadOffers() {
      try {
        const res = await getOffers();
        setOffers(res.items || []);
      } catch (err) {
        console.error('Error fetching offers:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOffers();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500 mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-20 space-y-16">
      <SectionHeading
        title="Studio Offers"
        subtitle="Exclusive festival events, season clearances, and promotional sales. Bring home luxury designer creations at unmatched prices."
      />

      {offers.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 max-w-2xl mx-auto">
          <span className="text-4xl block mb-4">🎉</span>
          <h3 className="font-display text-2xl font-bold text-cream">No Active Offers Right Now</h3>
          <p className="text-white/40 font-light mt-2 max-w-md mx-auto text-sm leading-relaxed">
            We currently don't have active public festival sales. Follow our social handles or subscribe to our notifications for updates on upcoming collections.
          </p>
          <Link href="/shop" className="btn-gold px-8 mt-6 inline-block">
            Browse Storefront
          </Link>
        </div>
      ) : (
        <div className="space-y-16">
          {offers.map((offer) => (
            <div key={offer.id} className="space-y-8">
              {/* Offer Banner Block */}
              <div className="rounded-3xl border border-gold-500/20 bg-gradient-to-r from-brand-dark via-gold-950/20 to-brand-dark p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gold-500/5 blur-[80px]" />
                <div className="flex-1 space-y-4 relative z-10 text-center md:text-left">
                  <span className="bg-gold-500/10 text-gold-500 border border-gold-500/25 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider inline-block">
                    {offer.festivalName || 'Limited Sale'}
                  </span>
                  <h2 className="font-display text-3xl sm:text-5xl font-bold text-cream">
                    {offer.title}
                  </h2>
                  <p className="text-white/60 font-light leading-relaxed max-w-xl text-sm sm:text-base">
                    {offer.description || 'Exclusive luxury fashion event.'}
                  </p>

                  {/* Countdown */}
                  <div className="space-y-2 pt-2">
                    <span className="text-xs uppercase tracking-wider text-white/40 font-semibold block text-center md:text-left">
                      Offer Ends In:
                    </span>
                    <CountdownTimer endDateStr={offer.endDate} />
                  </div>
                </div>

                <div className="w-full md:w-80 aspect-square rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center relative flex-shrink-0">
                  <span className="font-display text-5xl font-bold text-gradient-gold">
                    {offer.discount}% OFF
                  </span>
                  <span className="text-xs text-white/40 uppercase tracking-widest mt-2">Discount Applied</span>
                </div>
              </div>

              {/* Products linked with this offer */}
              {offer.products && offer.products.length > 0 && (
                <div className="space-y-6">
                  <h3 className="font-display font-bold text-cream text-2xl tracking-tight border-b border-white/10 pb-3">
                    Featured Sale Items
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {offer.products.map(({ product: prod }) => {
                      const discountedPrice = prod.price * (1 - offer.discount / 100);
                      return (
                        <GlassCard key={prod.id} padding="none" className="group overflow-hidden flex flex-col h-full border border-white/5 hover:border-gold-500/20 transition-all duration-300">
                          {/* Image box */}
                          <div className="relative aspect-[3/4] bg-gradient-to-br from-gold-500/5 to-rose-400/5 flex items-center justify-center overflow-hidden">
                            <span className="text-4xl text-gold-500/30">✨</span>
                            <span className="absolute top-4 left-4 bg-rose-400 text-brand-black text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                              -{offer.discount}%
                            </span>
                            <Link href={`/shop/${prod.id}`} className="absolute inset-0 z-10" />
                          </div>

                          {/* Details */}
                          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                            <div className="space-y-1">
                              <span className="text-[10px] text-gold-500 uppercase tracking-widest font-semibold block">
                                {prod.category?.name || 'Couture'}
                              </span>
                              <Link href={`/shop/${prod.id}`}>
                                <h3 className="font-display font-semibold text-cream text-base group-hover:text-gold-300 transition-colors line-clamp-1">
                                  {prod.name}
                                </h3>
                              </Link>
                              <p className="text-white/40 text-xs font-light line-clamp-2 leading-relaxed">
                                {prod.description}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              <div>
                                <span className="text-cream font-semibold text-sm">
                                  {formatPrice(discountedPrice)}
                                </span>
                                <span className="text-white/30 line-through text-xs ml-2">
                                  {formatPrice(prod.price)}
                                </span>
                              </div>
                              <button
                                onClick={() =>
                                  addItem({
                                    productId: prod.id,
                                    name: prod.name,
                                    price: prod.price,
                                    salePrice: discountedPrice,
                                    image: '',
                                  })
                                }
                                className="w-9 h-9 rounded-full border border-gold-500/30 flex items-center justify-center text-gold-500 hover:bg-gold-500 hover:text-brand-black transition-colors"
                                aria-label="Add to cart"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </GlassCard>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
