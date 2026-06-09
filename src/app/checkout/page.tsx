'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/cart/CartProvider';
import { createOrder, OrderData, formatPrice, getWhatsAppLink } from '@/lib/api';
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
  const [orderResult, setOrderResult] = useState<{ id: string; total: number; name: string; mobile: string } | null>(null);
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
      setOrderResult({
        id: res.id,
        total: res.totalAmount,
        name: formData.customerName,
        mobile: formData.mobile,
      });
      clearCart();
    } catch (err: any) {
      setError(err?.message || 'Failed to place the order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Build WhatsApp message with order details
  const getPaymentWhatsAppLink = () => {
    if (!orderResult) return '#';
    const msg = `🛍️ *Miracles Designer Studio – Order Payment*\n\n` +
      `Order ID: ${orderResult.id}\n` +
      `Customer: ${orderResult.name}\n` +
      `Mobile: ${orderResult.mobile}\n` +
      `Total Amount: ${formatPrice(orderResult.total)}\n\n` +
      `Hi, I have placed an order and would like to make the payment. Please share the payment QR code. 🙏`;
    return getWhatsAppLink(msg);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-20 space-y-12">
      <SectionHeading
        title="Checkout Details"
        subtitle="Confirm your purchase order and provide delivery instructions for shipping your designer clothing."
      />

      {orderResult ? (
        /* ─── Order Success + WhatsApp Payment Flow ────────────── */
        <div className="max-w-2xl mx-auto space-y-8">
          <GlassCard className="p-8 md:p-10 border border-gold-500/20 text-center space-y-8">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-2 border-green-500/40 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div className="space-y-2">
              <h3 className="font-display text-3xl font-bold text-cream">Order Placed Successfully!</h3>
              <p className="text-white/50 font-light text-sm leading-relaxed max-w-md mx-auto">
                Your order has been recorded. Complete the payment via WhatsApp to confirm your order.
              </p>
            </div>

            {/* Order Reference */}
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40 uppercase tracking-wider">Order Reference</span>
                <span className="text-xs text-white/40 uppercase tracking-wider">Total</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-gold-500 font-bold text-sm truncate max-w-[200px]">{orderResult.id}</span>
                <span className="text-gradient-gold font-bold text-xl">{formatPrice(orderResult.total)}</span>
              </div>
            </div>

            {/* Payment Steps */}
            <div className="text-left space-y-4">
              <h4 className="text-cream font-semibold text-sm uppercase tracking-wider text-center">How to Complete Payment</h4>
              <div className="space-y-3">
                {[
                  { step: 1, text: 'Click the "Pay via WhatsApp" button below', icon: '📱' },
                  { step: 2, text: 'Send the pre-filled message to our team', icon: '💬' },
                  { step: 3, text: 'We\'ll share a payment QR code with you', icon: '📷' },
                  { step: 4, text: 'Make the payment and share the screenshot', icon: '✅' },
                  { step: 5, text: 'We\'ll verify and confirm your order', icon: '🎉' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="w-8 h-8 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500 font-bold text-xs flex-shrink-0">
                      {item.step}
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-white/70 text-sm font-light">{item.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a
                href={getPaymentWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold flex-1 text-center py-4 rounded-xl uppercase tracking-wider text-sm font-bold gap-3"
              >
                <span>💬</span> Pay via WhatsApp
              </a>
              <Link
                href={`/orders/track?id=${orderResult.id}`}
                className="btn-outline flex-1 text-center py-4 rounded-xl uppercase tracking-wider text-sm font-bold"
              >
                Track Order
              </Link>
            </div>
          </GlassCard>

          <p className="text-center text-white/30 text-xs">
            Save your Order Reference ID. You can track your order status anytime at{' '}
            <Link href="/orders/track" className="text-gold-500 hover:text-gold-300 underline">Track Order</Link>.
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="max-w-md mx-auto text-center space-y-6 py-12">
          <div className="w-20 h-20 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-3xl">🛒</div>
          <p className="text-white/40 text-lg">Your cart is empty</p>
          <Link href="/shop" className="btn-gold px-8">
            Browse Collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Form (7 Columns) */}
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
            <GlassCard className="p-6 border border-white/5 space-y-6 sticky top-28">
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

              {/* Payment Info */}
              <div className="p-4 bg-gold-500/5 border border-gold-500/15 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">💬</span>
                  <span className="text-gold-500 text-xs font-semibold uppercase tracking-wider">WhatsApp Payment</span>
                </div>
                <p className="text-white/40 text-xs leading-relaxed">
                  After placing the order, you will be redirected to WhatsApp to complete payment via QR code shared by our team.
                </p>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}
