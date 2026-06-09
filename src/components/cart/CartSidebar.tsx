'use client';

import { useCart } from './CartProvider';
import { formatPrice } from '@/lib/api';

export default function CartSidebar() {
  const { items, removeItem, updateQuantity, clearCart, totalAmount, totalItems, isOpen, setIsOpen } = useCart();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-brand-dark border-l border-white/10 z-[70] transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-display font-bold text-cream">
            Shopping Cart
            {totalItems > 0 && (
              <span className="ml-2 text-sm font-body text-gold-500">({totalItems} items)</span>
            )}
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
            aria-label="Close cart"
          >
            <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-16 h-16 mx-auto text-white/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-white/40 text-lg">Your cart is empty</p>
              <button
                onClick={() => setIsOpen(false)}
                className="mt-4 text-gold-500 hover:text-gold-300 transition-colors text-sm"
              >
                Continue Shopping →
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all"
              >
                {/* Product image placeholder */}
                <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-gold-500/20 to-rose-400/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-gold-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-cream font-medium text-sm truncate">{item.name}</h3>
                  <p className="text-gold-500 font-semibold text-sm mt-1">
                    {formatPrice(item.salePrice || item.price)}
                    {item.salePrice && (
                      <span className="text-white/30 line-through ml-2 text-xs">{formatPrice(item.price)}</span>
                    )}
                  </p>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-7 h-7 rounded-md bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-cream text-sm"
                    >
                      −
                    </button>
                    <span className="text-cream text-sm w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-7 h-7 rounded-md bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-cream text-sm"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="ml-auto text-white/30 hover:text-red-400 transition-colors"
                      aria-label="Remove item"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-white/10 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/60">Subtotal</span>
              <span className="text-xl font-bold text-gradient-gold">{formatPrice(totalAmount)}</span>
            </div>
            <a
              href="/checkout"
              className="btn-gold w-full text-center block"
              onClick={() => setIsOpen(false)}
            >
              Proceed to Checkout
            </a>
            <button
              onClick={clearCart}
              className="w-full text-center text-white/40 hover:text-white/60 text-sm transition-colors"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}
