'use client';

import { useState } from 'react';
import { createBooking, BookingData } from '@/lib/api';
import SectionHeading from '@/components/ui/SectionHeading';
import GlassCard from '@/components/ui/GlassCard';

export default function BookingPage() {
  const serviceTypes = [
    { id: 'bridal', name: 'Bridal Makeup', desc: 'Complete bridal look with trial, custom hair-styling, and saree draping.', icon: '👰' },
    { id: 'party', name: 'Party Makeup', desc: 'Sophisticated event makeup for weddings, receptions, and guest styles.', icon: '💃' },
    { id: 'engagement', name: 'Engagement Makeup', desc: 'Elegant looks tailored to engagement ceremonies and photoshoots.', icon: '💍' },
    { id: 'photoshoot', name: 'Photoshoot Makeup', desc: 'High-definition camera-ready makeup for portfolio and outdoor shoots.', icon: '📸' },
  ];

  const [formData, setFormData] = useState<BookingData>({
    customerName: '',
    mobile: '',
    email: '',
    serviceType: 'bridal',
    date: '',
    time: '',
    address: '',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await createBooking(formData);
      setSuccess(true);
      // Clear form
      setFormData({
        customerName: '',
        mobile: '',
        email: '',
        serviceType: 'bridal',
        date: '',
        time: '',
        address: '',
        notes: '',
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to submit booking request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-20 space-y-12">
      <SectionHeading
        title="Makeup Appointments"
        subtitle="Book a session with our premium bridal makeup artists and styling directors for your special occasion."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Left Column: Services Offered */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="font-display font-bold text-cream text-2xl mb-4">Our Specialties</h3>
          {serviceTypes.map((svc) => (
            <GlassCard key={svc.id} className="p-6 border border-white/5 space-y-3" hover>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{svc.icon}</span>
                <h4 className="font-semibold text-cream text-base">{svc.name}</h4>
              </div>
              <p className="text-white/50 text-xs font-light leading-relaxed">
                {svc.desc}
              </p>
            </GlassCard>
          ))}
        </div>

        {/* Right Column: Booking Form */}
        <div className="lg:col-span-2">
          <GlassCard className="p-8 border border-gold-500/20 bg-gradient-to-b from-brand-dark to-brand-black">
            {success ? (
              <div className="text-center py-12 space-y-6">
                <div className="w-16 h-16 bg-gold-500/10 border border-gold-500/30 rounded-full flex items-center justify-center mx-auto text-gold-500 text-3xl">
                  ✓
                </div>
                <h3 className="font-display text-2xl font-bold text-cream">Appointment Requested</h3>
                <p className="text-white/60 font-light max-w-md mx-auto text-sm leading-relaxed">
                  Thank you! Your makeup booking request has been successfully submitted. Our team will contact you shortly over mobile or email to confirm your date and time slot.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="btn-gold px-8 py-3 text-sm mt-4"
                >
                  Book Another Appointment
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="font-display font-bold text-cream text-2xl mb-6">Reservation Form</h3>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Your Name *</label>
                    <input
                      required
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      placeholder="e.g. Priyanjali Sen"
                      className="input-field"
                    />
                  </div>

                  {/* Mobile */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Mobile Number *</label>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Email Address (Optional)</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. mail@example.com"
                      className="input-field"
                    />
                  </div>

                  {/* Service Type */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Service Type *</label>
                    <select
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-cream focus:outline-none focus:border-gold-500/50"
                    >
                      <option value="bridal">Bridal Makeup</option>
                      <option value="party">Party Makeup</option>
                      <option value="engagement">Engagement Makeup</option>
                      <option value="photoshoot">Photoshoot Makeup</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Date */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Event Date *</label>
                    <input
                      required
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>

                  {/* Time */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Preferred Time *</label>
                    <input
                      required
                      type="text"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      placeholder="e.g. 10:00 AM"
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Venue Address */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Venue Address (Optional)</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="e.g. Hotel Grand Place, Hall 3, Chennai"
                    className="input-field"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Special Instructions (Optional)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Mention skin concerns, preferred draping styles, or jewelry setups..."
                    rows={4}
                    className="input-field resize-none"
                  />
                </div>

                {/* Action button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-gold w-full text-center py-4 rounded-xl uppercase tracking-wider text-sm font-bold disabled:opacity-50"
                >
                  {submitting ? 'Submitting Reservation...' : 'Submit Booking Request'}
                </button>
              </form>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
