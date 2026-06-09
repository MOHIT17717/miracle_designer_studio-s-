'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '../cart/CartProvider';
import { logout } from '@/lib/api';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, setIsOpen: setIsCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/login');
    } catch (e) {
      console.error(e);
      setIsLoggingOut(false);
    }
  };

  // Hide navbar on admin and login pages
  if (pathname.startsWith('/admin') || pathname === '/login') return null;

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Booking', href: '/booking' },
    { name: 'Offers', href: '/offers' },
    { name: 'Track Order', href: '/orders/track' },
    { name: 'About', href: '/about' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-brand-black/85 backdrop-blur-md border-b border-white/10 py-4 shadow-lg'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <div className="w-10 h-10 rounded-full border border-gold-500/50 flex items-center justify-center bg-gradient-to-br from-gold-500/20 to-brand-dark transition-all duration-300 group-hover:border-gold-500">
            <span className="font-display font-bold text-gradient-gold text-lg">M</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold tracking-widest text-cream text-lg leading-tight group-hover:text-gold-300 transition-colors">
              MIRACLES
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-gold-500 font-light">
              Designer Studio
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium tracking-wider uppercase transition-colors relative py-1 ${
                  isActive ? 'text-gold-500' : 'text-cream/80 hover:text-gold-300'
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-gold-500 to-gold-300 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Cart + Mobile Action + Profile/Signout */}
        <div className="flex items-center gap-4">
          {/* Profile / Sign Out */}
          <div className="hidden md:flex items-center gap-4 border-r border-white/10 pr-4 mr-2">
            <span className="text-white/50 text-sm flex items-center gap-2" title="My Profile">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </span>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 uppercase tracking-widest transition-colors disabled:opacity-50"
            >
              {isLoggingOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>

          {/* Cart Icon */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-cream hover:text-gold-500 transition-colors focus:outline-none"
            aria-label="Open cart"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold-500 text-brand-black font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                {totalItems}
              </span>
            )}
          </button>

          {/* Hamburger Menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-cream hover:text-gold-500 transition-colors focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 top-[72px] bg-brand-dark/95 backdrop-blur-lg border-t border-white/10 z-40 transform transition-transform duration-300 md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col p-8 space-y-6 h-full overflow-y-auto">
          {/* Profile Section Mobile */}
          <div className="flex items-center gap-3 pb-6 border-b border-white/10">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-cream tracking-wider uppercase">My Profile</p>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 tracking-widest mt-1 disabled:opacity-50"
              >
                {isLoggingOut ? 'SIGNING OUT...' : 'SIGN OUT'}
              </button>
            </div>
          </div>

          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-lg font-medium tracking-widest uppercase transition-colors ${
                  isActive ? 'text-gold-500' : 'text-cream hover:text-gold-300'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsCartOpen(true);
            }}
            className="btn-gold w-full text-center mt-auto mb-10"
          >
            View Cart ({totalItems})
          </button>
        </div>
      </div>
    </nav>
  );
}
