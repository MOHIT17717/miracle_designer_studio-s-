'use client';

import Link from 'next/link';
import { Product, formatPrice } from '@/lib/api';
import { useCart } from '../cart/CartProvider';
import GlassCard from '../ui/GlassCard';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const displayPrice = product.salePrice || product.price;

  return (
    <GlassCard
      padding="none"
      className="group overflow-hidden flex flex-col h-full border border-white/5 hover:border-gold-500/20 transition-all duration-300"
    >
      {/* Product Image Panel */}
      <div className="relative aspect-[3/4] bg-gradient-to-br from-gold-500/5 to-rose-400/5 flex items-center justify-center overflow-hidden">
        {/* Abstract pattern to make empty state look high-end */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-500 via-transparent to-transparent group-hover:scale-110 transition-transform duration-500" />
        <span className="text-4xl text-gold-500/20 group-hover:scale-125 transition-transform duration-500">✨</span>

        {/* Labels */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
          {product.isNew && (
            <span className="bg-gold-500 text-brand-black text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
              New In
            </span>
          )}
          {product.salePrice && (
            <span className="bg-rose-400 text-brand-black text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
              Sale
            </span>
          )}
        </div>

        {/* Click overlay leading to details */}
        <Link href={`/shop/${product.id}`} className="absolute inset-0 z-10" />
      </div>

      {/* Product Details Panel */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4 relative z-20">
        <div className="space-y-1">
          <span className="text-[10px] text-gold-500 uppercase tracking-widest font-semibold block">
            {product.category?.name || 'Studio Original'}
          </span>
          <Link href={`/shop/${product.id}`}>
            <h3 className="font-display font-semibold text-cream text-base group-hover:text-gold-300 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <p className="text-white/40 text-xs font-light line-clamp-2 leading-relaxed">
            {product.description || 'Exclusive designer collection hand-curated at Miracles Studio.'}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-cream font-semibold text-sm">
              {formatPrice(displayPrice)}
            </span>
            {product.salePrice && (
              <span className="text-white/30 line-through text-xs ml-2">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <button
            onClick={() =>
              addItem({
                productId: product.id,
                name: product.name,
                price: product.price,
                salePrice: product.salePrice,
                image: '',
              })
            }
            className="w-9 h-9 rounded-full border border-gold-500/30 flex items-center justify-center text-gold-500 hover:bg-gold-500 hover:text-brand-black hover:border-gold-500 transition-all duration-300"
            aria-label="Add to cart"
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
