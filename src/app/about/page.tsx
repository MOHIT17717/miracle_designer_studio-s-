'use client';

import { useState } from 'react';
import SectionHeading from '@/components/ui/SectionHeading';
import GlassCard from '@/components/ui/GlassCard';
import { getWhatsAppLink } from '@/lib/api';

export default function AboutPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const values = [
    { title: 'Exquisite Craftsmanship', desc: 'Every stitch, motif, and fold is handled by master weavers and design directors dedicated to perfection.' },
    { title: 'Bespoke Experience', desc: 'We believe fashion is personal. We host specialized fitting sessions and detailed consultations to match your aesthetic.' },
    { title: 'Modern Elegance', desc: 'Blending deep Indian heritage design with contemporary cuts, styling colors, and premium fabrics.' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-20 space-y-20">
      {/* ─── Header ────────────────────────────────────────── */}
      <SectionHeading
        title="Our Story"
        subtitle="The history, core values, and creative team behind Chennai's premium luxury bridal boutique."
      />

      {/* ─── Story Block ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h3 className="font-display font-bold text-cream text-3xl leading-tight">
            Redefining Luxury Couture Since <span className="text-gradient-gold">2018</span>
          </h3>
          <p className="text-white/60 font-light leading-relaxed text-sm sm:text-base">
            Miracles Designer Studio started with a simple vision: to create bespoke luxury bridal wear and event makeovers that make every client feel like a work of art. 
          </p>
          <p className="text-white/60 font-light leading-relaxed text-sm sm:text-base">
            Over the years, we have grown into a full-scale designer boutique housing traditional Banarasi silk sarees, Kanjeevarams, handloom embroidery lehengas, and an exclusive professional makeup studio. Our designers work closely with brides and fashion-forward individuals to bring dream aesthetics to life.
          </p>
        </div>
        
        {/* Placeholder for Studio Banner */}
        <div className="relative aspect-[4/3] bg-gradient-to-tr from-gold-500/5 via-rose-500/5 to-white/5 border border-white/10 rounded-3xl flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold-500 via-transparent to-transparent" />
          <span className="text-6xl text-gold-500/20">🏛️</span>
          <span className="absolute bottom-6 left-6 text-xs text-white/40 uppercase tracking-widest bg-brand-black/60 border border-white/5 px-4 py-2 rounded-full">
            Miracles Studio, Chennai
          </span>
        </div>
      </div>

      {/* ─── Core Values ───────────────────────────────────── */}
      <div className="space-y-10">
        <h3 className="font-display font-bold text-cream text-3xl text-center">
          What We <span className="text-gradient-gold">Stand For</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((v) => (
            <GlassCard key={v.title} className="p-8 border border-white/5 space-y-4 hover:border-gold-500/25 transition-all">
              <h4 className="font-display font-semibold text-cream text-xl">{v.title}</h4>
              <p className="text-white/50 text-sm font-light leading-relaxed">{v.desc}</p>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* ─── Contact Info + Form ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start pt-10">
        {/* Contact info column (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          <h3 className="font-display font-bold text-cream text-3xl">Get In Touch</h3>
          <p className="text-white/60 font-light leading-relaxed">
            Have questions about sizes, scheduling, or order deliveries? Our styling team is happy to help you.
          </p>

          <div className="space-y-6">
            <GlassCard className="p-6 border border-white/5 space-y-4">
              <div className="flex gap-4 items-start">
                <span className="text-2xl mt-1">📍</span>
                <div className="space-y-1">
                  <h4 className="font-semibold text-cream text-sm">Our Location</h4>
                  <p className="text-white/50 text-xs font-light leading-relaxed">
                    12, Luxury Lane, Gold Avenue, Chennai - 600018
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6 border border-white/5 space-y-4">
              <div className="flex gap-4 items-start">
                <span className="text-2xl mt-1">📞</span>
                <div className="space-y-1">
                  <h4 className="font-semibold text-cream text-sm">Call/WhatsApp Support</h4>
                  <p className="text-white/50 text-xs font-light">
                    +91 96554 25277
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6 border border-white/5 space-y-4">
              <div className="flex gap-4 items-start">
                <span className="text-2xl mt-1">⏰</span>
                <div className="space-y-1">
                  <h4 className="font-semibold text-cream text-sm">Studio timings</h4>
                  <p className="text-white/50 text-xs font-light">
                    Monday to Saturday: 10:00 AM - 8:00 PM
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Contact Form column (7 cols) */}
        <div className="lg:col-span-7">
          <GlassCard className="p-8 border border-gold-500/20 bg-gradient-to-b from-brand-dark to-brand-black">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-gold-500/10 border border-gold-500/30 rounded-full flex items-center justify-center mx-auto text-gold-500 text-3xl">
                  ✓
                </div>
                <h4 className="font-display text-2xl font-bold text-cream">Message Sent Successfully</h4>
                <p className="text-white/60 font-light text-sm max-w-sm mx-auto leading-relaxed">
                  Thank you for writing to us. One of our designers will review your message and email you back within 24 hours.
                </p>
                <button onClick={() => setSubmitted(false)} className="btn-gold px-8 py-2.5 text-xs mt-4">
                  Write Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <h3 className="font-display font-bold text-cream text-2xl mb-4">Send a Message</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Your Name</label>
                    <input
                      required
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Shalini Nair"
                      className="input-field"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Your Email</label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. client@email.com"
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Subject</label>
                  <input
                    required
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="e.g. Customized Bridal Saree enquiry"
                    className="input-field"
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-white/50 font-semibold">Your Message</label>
                  <textarea
                    required
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Write your creative requirements, fabric choices, or fitting questions..."
                    rows={4}
                    className="input-field resize-none"
                  />
                </div>

                {/* Submit button */}
                <button type="submit" className="btn-gold w-full text-center py-4 rounded-xl uppercase tracking-wider text-xs font-bold">
                  Send Message
                </button>
              </form>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
