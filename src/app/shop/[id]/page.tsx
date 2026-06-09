'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getProduct, Product, formatPrice, getWhatsAppLink, parseTags } from '@/lib/api';
import { useCart } from '@/components/cart/CartProvider';
import GlassCard from '@/components/ui/GlassCard';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  useEffect(() => {
    async function loadProduct() {
      try {
        const prod = await getProduct(id);
        setProduct(prod);
      } catch (err) {
        console.error('Error loading product detail:', err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500 mx-auto" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 text-center space-y-6">
        <h2 className="font-display text-3xl font-bold text-cream">Product Not Found</h2>
        <p className="text-white/60 max-w-md mx-auto font-light">
          The creation you are looking for might have been archived or is temporarily unavailable.
        </p>
        <Link href="/shop" className="btn-gold px-8 inline-block">
          Return to Shop
        </Link>
      </div>
    );
  }

  const tags = parseTags(product.tags);
  const displayPrice = product.salePrice || product.price;

  // Pre-filled WhatsApp message about this product
  const whatsappMsg = `Hi Miracles Studio! I'm interested in the "${product.name}" (${formatPrice(displayPrice)}). Could you please share more details about sizes, fabrics, and customizations?`;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-20 space-y-12">
      {/* Back to Shop link */}
      <div>
        <Link href="/shop" className="text-gold-500 hover:text-gold-300 text-sm font-semibold transition-colors flex items-center gap-2">
          &larr; Back to Designer Shop
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Left Column: Product Image Showcase */}
        <div className="relative aspect-[3/4] bg-gradient-to-br from-gold-500/5 to-rose-400/5 border border-white/10 rounded-3xl flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-500 via-transparent to-transparent" />
          <span className="text-7xl text-gold-500/25">✨</span>
          {product.isNew && (
            <span className="absolute top-6 left-6 bg-gold-500 text-brand-black text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full">
              New In
            </span>
          )}
        </div>

        {/* Right Column: Information Panel */}
        <div className="space-y-8">
          <div className="space-y-4">
            <span className="bg-gold-500/10 text-gold-500 border border-gold-500/25 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider inline-block">
              {product.category?.name || 'Studio Original'}
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-cream tracking-tight leading-tight">
              {product.name}
            </h1>
            
            {/* Price section */}
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-bold text-gradient-gold">
                {formatPrice(displayPrice)}
              </span>
              {product.salePrice && (
                <span className="text-white/30 line-through text-lg">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
          </div>

          <div className="h-px bg-white/10" />

          {/* Description */}
          <div className="space-y-3">
            <h3 className="font-semibold text-cream text-sm uppercase tracking-wider">Product Details</h3>
            <p className="text-white/60 font-light leading-relaxed">
              {product.description || 'No description available for this creation.'}
            </p>
          </div>

          {/* Stock state */}
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-white/50">
              {product.stock > 0 ? `In Stock (${product.stock} items available)` : 'Out of Stock'}
            </span>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {tags.map((tag) => (
                <span key={tag} className="bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg text-xs text-white/50">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="h-px bg-white/10" />

          {/* Add to Cart Actions */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-cream">Quantity:</span>
              <div className="flex items-center gap-3">
                <button
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(quantity - 1)}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-cream font-bold transition-colors disabled:opacity-30"
                >
                  −
                </button>
                <span className="w-8 text-center text-cream font-semibold text-lg">{quantity}</span>
                <button
                  disabled={quantity >= product.stock}
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-cream font-bold transition-colors disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                disabled={product.stock <= 0}
                onClick={() =>
                  addItem(
                    {
                      productId: product.id,
                      name: product.name,
                      price: product.price,
                      salePrice: product.salePrice,
                      image: '',
                    },
                    quantity
                  )
                }
                className="btn-gold flex-1 text-center py-4 rounded-xl font-bold uppercase tracking-wider text-sm disabled:opacity-40 disabled:pointer-events-none"
              >
                Add to Cart
              </button>
              
              <a
                href={getWhatsAppLink(whatsappMsg)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline flex-1 text-center py-4 rounded-xl font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2"
              >
                <span>💬 WhatsApp Inquiry</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
