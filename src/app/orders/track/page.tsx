'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { trackOrder, Order, formatPrice } from '@/lib/api';
import SectionHeading from '@/components/ui/SectionHeading';
import GlassCard from '@/components/ui/GlassCard';

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: '📋', description: 'Your order has been received' },
  { key: 'confirmed', label: 'Confirmed', icon: '✅', description: 'Payment verified & order accepted' },
  { key: 'shipped', label: 'Shipped', icon: '🚚', description: 'Your order is on its way' },
  { key: 'delivered', label: 'Delivered', icon: '🎉', description: 'Order delivered successfully' },
];

const PAYMENT_LABELS: Record<string, { label: string; color: string }> = {
  unpaid: { label: 'Awaiting Payment', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  paid: { label: 'Payment Verified', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
};

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const prefilledId = searchParams.get('id') || '';

  const [orderId, setOrderId] = useState(prefilledId);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  // Auto-search if ID is in URL params
  useEffect(() => {
    if (prefilledId) {
      handleTrack(prefilledId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefilledId]);

  const handleTrack = async (id?: string) => {
    const searchId = id || orderId;
    if (!searchId.trim()) {
      setError('Please enter your Order Reference ID.');
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const data = await trackOrder(searchId.trim());
      setOrder(data);
    } catch (err: any) {
      setOrder(null);
      setError(err?.message || 'Order not found. Please check the ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleTrack();
  };

  const getStatusIndex = (status: string) => {
    if (status === 'cancelled') return -1;
    return STATUS_STEPS.findIndex((s) => s.key === status);
  };

  const currentStepIndex = order ? getStatusIndex(order.status) : -1;

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-8 pb-20 space-y-12">
      <SectionHeading
        title="Track Your Order"
        subtitle="Enter your Order Reference ID to check the current status of your purchase."
      />

      {/* Search Form */}
      <GlassCard className="p-6 md:p-8 border border-white/5">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter Order Reference ID (e.g. cm3x...)"
              className="input-field w-full text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-gold px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-wider disabled:opacity-50 flex-shrink-0"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Searching...
              </span>
            ) : (
              'Track Order'
            )}
          </button>
        </form>
      </GlassCard>

      {/* Error State */}
      {error && searched && (
        <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* Order Details */}
      {order && (
        <div className="space-y-8 animate-fade-in-up">
          {/* Order Summary Header */}
          <GlassCard className="p-6 md:p-8 border border-gold-500/15 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs text-white/40 uppercase tracking-wider">Order Reference</p>
                <p className="font-mono text-gold-500 font-bold text-sm">{order.id}</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Payment Status Badge */}
                <span className={`px-3 py-1.5 rounded-full border text-xs font-semibold ${
                  PAYMENT_LABELS[order.paymentStatus]?.color || 'text-white/60 bg-white/5 border-white/10'
                }`}>
                  {PAYMENT_LABELS[order.paymentStatus]?.label || order.paymentStatus}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Customer</p>
                <p className="text-cream text-sm font-medium">{order.customerName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Mobile</p>
                <p className="text-cream text-sm font-medium">{order.mobile}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Total Amount</p>
                <p className="text-gradient-gold font-bold text-lg">{formatPrice(order.totalAmount)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Placed On</p>
                <p className="text-cream text-sm font-medium">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Status Timeline */}
          <GlassCard className="p-6 md:p-8 border border-white/5 space-y-6">
            <h3 className="font-display font-bold text-cream text-lg">Order Progress</h3>

            {order.status === 'cancelled' ? (
              <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                <span className="text-3xl block mb-2">❌</span>
                <p className="text-red-400 font-semibold">Order Cancelled</p>
                <p className="text-white/40 text-xs mt-1">This order has been cancelled. Please contact us for more information.</p>
              </div>
            ) : (
              <div className="relative">
                {/* Progress Bar Background */}
                <div className="hidden sm:block absolute top-5 left-[10%] right-[10%] h-1 bg-white/10 rounded-full" />
                {/* Progress Bar Fill */}
                {currentStepIndex >= 0 && (
                  <div
                    className="hidden sm:block absolute top-5 left-[10%] h-1 bg-gradient-to-r from-gold-500 to-gold-300 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((currentStepIndex / (STATUS_STEPS.length - 1)) * 80, 80)}%` }}
                  />
                )}

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 sm:gap-0 relative">
                  {STATUS_STEPS.map((step, i) => {
                    const isCompleted = i <= currentStepIndex;
                    const isCurrent = i === currentStepIndex;
                    return (
                      <div key={step.key} className="flex sm:flex-col items-center sm:items-center gap-4 sm:gap-3 text-center">
                        <div
                          className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all duration-500 flex-shrink-0 ${
                            isCurrent
                              ? 'border-gold-500 bg-gold-500/20 shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                              : isCompleted
                              ? 'border-green-500/50 bg-green-500/10'
                              : 'border-white/10 bg-white/5'
                          }`}
                        >
                          {step.icon}
                        </div>
                        <div className="sm:text-center text-left">
                          <p className={`text-sm font-semibold ${isCompleted ? 'text-cream' : 'text-white/30'}`}>
                            {step.label}
                          </p>
                          <p className={`text-xs mt-0.5 ${isCompleted ? 'text-white/50' : 'text-white/20'}`}>
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </GlassCard>

          {/* Order Items */}
          <GlassCard className="p-6 md:p-8 border border-white/5 space-y-4">
            <h3 className="font-display font-bold text-cream text-lg">Ordered Items</h3>
            <div className="divide-y divide-white/5">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-500/10 to-rose-500/5 flex items-center justify-center text-gold-500/50 text-lg flex-shrink-0">
                      ✨
                    </div>
                    <div className="min-w-0">
                      <p className="text-cream text-sm font-medium truncate">{item.product?.name || 'Product'}</p>
                      <p className="text-white/40 text-xs mt-0.5">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                    </div>
                  </div>
                  <span className="text-gold-500 font-semibold text-sm flex-shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center border-t border-white/10 pt-4">
              <span className="text-cream font-semibold">Total</span>
              <span className="text-gradient-gold font-bold text-xl">{formatPrice(order.totalAmount)}</span>
            </div>
          </GlassCard>

          {/* Delivery Info */}
          <GlassCard className="p-6 md:p-8 border border-white/5 space-y-4">
            <h3 className="font-display font-bold text-cream text-lg">Delivery Address</h3>
            <div className="text-white/60 text-sm space-y-1">
              <p>{order.address}</p>
              <p>{order.city} – {order.pincode}</p>
            </div>
          </GlassCard>

          {/* Actions */}
          {order.paymentStatus === 'unpaid' && order.status === 'pending' && (
            <div className="text-center">
              <p className="text-white/40 text-sm mb-4">Payment not yet verified? Complete it via WhatsApp:</p>
              <a
                href={(() => {
                  const msg = `🛍️ *Order Payment Reminder*\n\nOrder ID: ${order.id}\nCustomer: ${order.customerName}\nTotal: ${formatPrice(order.totalAmount)}\n\nHi, I need to complete payment for this order. Please share the payment QR. 🙏`;
                  return `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '919655425277'}?text=${encodeURIComponent(msg)}`;
                })()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold px-8 py-3 text-sm"
              >
                💬 Pay via WhatsApp
              </a>
            </div>
          )}
        </div>
      )}

      {/* Empty state if no search */}
      {!order && !error && !loading && !searched && (
        <div className="text-center py-12 space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-3xl">📦</div>
          <p className="text-white/40 text-sm">Enter your order reference ID above to track your order status.</p>
          <p className="text-white/25 text-xs">You received the Order ID when you placed your order during checkout.</p>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-6 lg:px-8 pb-20 text-center py-20">
        <div className="w-12 h-12 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto" />
        <p className="text-white/40 text-sm mt-4">Loading...</p>
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
