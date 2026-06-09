'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-brand-black border-t border-white/10 mt-20">
      {/* Top Gold Accent Bar */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-gold-500 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Info */}
          <div className="space-y-6">
            <Link href="/" className="group flex items-center gap-2">
              <div className="w-10 h-10 rounded-full border border-gold-500/50 flex items-center justify-center bg-gradient-to-br from-gold-500/20 to-brand-dark">
                <span className="font-display font-bold text-gradient-gold text-lg">M</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold tracking-widest text-cream text-lg leading-tight">
                  MIRACLES
                </span>
                <span className="text-[10px] uppercase tracking-[0.25em] text-gold-500 font-light">
                  Designer Studio
                </span>
              </div>
            </Link>
            <p className="text-white/50 text-sm font-light leading-relaxed">
              Elevating personal style and grace through bespoke designer wear, premium traditional sarees, custom lehengas, and world-class makeup services.
            </p>
            {/* Social Icons */}
            <div className="flex gap-4">
              {['instagram', 'facebook', 'pinterest', 'youtube'].map((social) => (
                <a
                  key={social}
                  href={`https://${social}.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-gold-500/10 hover:text-gold-500 transition-all border border-white/5 hover:border-gold-500/25"
                  aria-label={`Follow us on ${social}`}
                >
                  <span className="text-xs capitalize">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gold-500 font-semibold tracking-wider uppercase text-sm mb-6">Explore</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-white/60 hover:text-cream text-sm transition-colors font-light">
                  Home Page
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-white/60 hover:text-cream text-sm transition-colors font-light">
                  Designer Shop
                </Link>
              </li>
              <li>
                <Link href="/booking" className="text-white/60 hover:text-cream text-sm transition-colors font-light">
                  Makeup Bookings
                </Link>
              </li>
              <li>
                <Link href="/offers" className="text-white/60 hover:text-cream text-sm transition-colors font-light">
                  Festival Offers
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white/60 hover:text-cream text-sm transition-colors font-light">
                  About the Studio
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-gold-500 font-semibold tracking-wider uppercase text-sm mb-6">Our Services</h3>
            <ul className="space-y-4">
              <li className="text-white/60 text-sm font-light">Bridal Couture Design</li>
              <li className="text-white/60 text-sm font-light">Premium Silk Sarees</li>
              <li className="text-white/60 text-sm font-light">Custom Handloom Embroidery</li>
              <li className="text-white/60 text-sm font-light">Bridal & Event Makeup</li>
              <li className="text-white/60 text-sm font-light">Jewelry Styling Consultations</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-gold-500 font-semibold tracking-wider uppercase text-sm mb-6">The Studio</h3>
            <ul className="space-y-4 text-sm font-light text-white/60">
              <li className="flex gap-2 items-start">
                <span className="text-gold-500 mt-1">📍</span>
                <span>12, Luxury Lane, Gold Avenue, Chennai - 600018</span>
              </li>
              <li className="flex gap-2 items-center">
                <span className="text-gold-500">📞</span>
                <span>+91 96554 25277</span>
              </li>
              <li className="flex gap-2 items-center">
                <span className="text-gold-500">✉️</span>
                <span>info@miraclesdesignerstudio.com</span>
              </li>
              <li className="flex gap-2 items-center">
                <span className="text-gold-500">⏰</span>
                <span>Mon - Sat: 10:00 AM - 8:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-light text-white/40">
          <p>© {new Date().getFullYear()} Miracles Designer Studio. All Rights Reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-cream transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-cream transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
