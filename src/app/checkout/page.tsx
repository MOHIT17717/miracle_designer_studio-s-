'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/cart/CartProvider';
import { createOrder, OrderData, formatPrice } from '@/lib/api';
import SectionHeading from '@/components/ui/SectionHeading';
import GlassCard from '@/components/ui/GlassCard';

export default function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCart();

  const [formData, setFormData] = useState({
    customerName: '',
    mobile: '',
    email: '',
    address: '',
    city: '',
    pincode: '',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const orderData: OrderData = {
      ...formData,
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    };

    try {
      const res = await createOrder(orderData);
      setOrderId(res.id);
      clearCart();
    } catch (err: any) {
      setError(err?.message || 'Failed to place the order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-20 space-y-12">
      <SectionHeading
        title="Checkout Details"
        subtitle="Confirm your purchase order and provide delivery instructions for shipping your designer clothing."
      />

      {orderId ? (
        <div className="max-w-xl mx-auto text-center space-y-6">
          <GlassCard className="p-8 border border-gold-500/20 text-center space-y-6">
            <div className="w-16 h-16 bg-gold-500/10 border border-gold-500/30 rounded-full flex items-center justify-center mx-auto text-gold-500 text-3xl">
              ✓
            </div>
            <h3 className="font-display text-2xl font-bold text-cream">Order Placed Successfully!</h3>
            <p className="text-white/60 font-light text-sm leading-relaxed">
              Your order has been recorded in our database. We are preparing your designer creations for dispatch.
            </p>
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-left space-y-2">
              <p className="text-xs text-white/40">Order Reference ID:</p>
              <p className="font-mono text-gold-500 font-bold text-base truncate">{orderId}</p>
            </div>
            <p className="text-xs text-white/40 leading-relaxed">
              Our styling team will reach out to you on <strong>{formData.mobile}</strong> to share shipment details and tracking codes.
            </p>
            <div className="pt-4">
              <Link href="/shop" className="btn-gold px-8 py-3 text-sm">
                Continue Shopping
              </Link>
            </div>
          </GlassCard>
        </div>
      ) : items.length === 0 ? (
        <div className="max-w-md mx-auto text-center space-y-6 py-12">
          <p className="text-white/40 text-lg">You do not have any items in your checkout cart.</p>
          <Link href="/shop" className="btn-gold px-8">
            Go to Shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Form (8 Columns) */}
          <div className="lg:col-span-7">
            <GlassCard className="p-8 border border-white/5 bg-gradient-to-b from-brand-dark to-brand-black">
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="font-display font-bold text-cream text-2xl mb-6">Shipping Information</h3>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Full Name *</label>
                    <input
                      required
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      placeholder="e.g. Shalini Nair"
                      className="input-field"
                    />
                  </div>

                  {/* Mobile */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Contact Mobile *</label>
                    <input
                      required
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      placeholder="e.g. 9876543210"
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Email Address (Optional)</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. customer@domain.com"
                    className="input-field"
                  />
                </div>

                {/* Street Address */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Delivery Address *</label>
                  <input
                    required
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Flat No, Building Name, Street Name"
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* City */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">City *</label>
                    <input
                      required
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g. Chennai"
                      className="input-field"
                    />
                  </div>

                  {/* Pincode */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Pincode *</label>
                    <input
                      required
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="e.g. 600018"
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Delivery Notes */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Special Delivery Instructions (Optional)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Note down specific timing constraints, custom adjustments, or landmark cues..."
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-gold w-full text-center py-4 rounded-xl uppercase tracking-wider text-sm font-bold disabled:opacity-50"
                >
                  {submitting ? 'Processing Order...' : `Confirm Purchase — ${formatPrice(totalAmount)}`}
                </button>
              </form>
            </GlassCard>
          </div>

          {/* Right Column: Order Summary (5 Columns) */}
          <div className="lg:col-span-5">
            <GlassCard className="p-6 border border-white/5 space-y-6">
              <h3 className="font-display font-bold text-cream text-xl tracking-tight border-b border-white/10 pb-3">
                Order Summary
              </h3>

              <div className="max-h-[350px] overflow-y-auto space-y-4 pr-2">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-cream text-sm truncate font-medium">{item.name}</p>
                      <p className="text-white/40 text-xs mt-0.5">
                        Qty: {item.quantity} × {formatPrice(item.salePrice || item.price)}
                      </p>
                    </div>
                    <span className="text-gold-500 font-semibold text-sm flex-shrink-0">
                      {formatPrice((item.salePrice || item.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2">
                <div className="flex justify-between text-xs text-white/50">
                  <span>Shipping</span>
                  <span className="text-green-500 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between items-center border-t border-white/5 pt-3">
                  <span className="text-cream font-semibold">Grand Total</span>
                  <span className="text-gradient-gold font-bold text-xl">{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}
