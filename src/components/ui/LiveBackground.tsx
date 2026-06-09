'use client';

import { useEffect, useState } from 'react';

interface Sparkle {
  id: number;
  top: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
}

export default function LiveBackground() {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    // Generate random gold sparkles on mount
    const items: Sparkle[] = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 4 + 2, // 2px to 6px
      delay: Math.random() * 5,
      duration: Math.random() * 6 + 4, // 4s to 10s
    }));
    setSparkles(items);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Dark luxury background mesh base */}
      <div className="absolute inset-0 bg-brand-black" />

      {/* Large Moving Aurora-style Glowing Meshes */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] aspect-square rounded-full bg-gold-500/5 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] aspect-square rounded-full bg-rose-500/5 blur-[120px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
      <div className="absolute top-[30%] right-[15%] w-[40%] aspect-square rounded-full bg-gold-500/3 blur-[100px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }} />

      {/* Subtle floating circles */}
      <div className="absolute w-[300px] h-[300px] rounded-full bg-gradient-to-br from-gold-500/5 to-transparent top-1/4 left-1/3 blur-3xl animate-float" style={{ animationDuration: '15s' }} />
      <div className="absolute w-[250px] h-[250px] rounded-full bg-gradient-to-br from-rose-500/5 to-transparent bottom-1/3 right-1/4 blur-3xl animate-float" style={{ animationDuration: '20s', animationDelay: '3s' }} />

      {/* Luxury Pattern Overlay (Subtle radial noise/fine-grain grid) */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(var(--gold-500) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Floating Gold Sparkles / Star Elements */}
      {sparkles.map((sp) => (
        <div
          key={sp.id}
          className="absolute rounded-full bg-gradient-to-r from-gold-300 to-gold-500 shadow-[0_0_10px_rgba(245,208,96,0.8)] opacity-0 animate-glow"
          style={{
            top: `${sp.top}%`,
            left: `${sp.left}%`,
            width: `${sp.size}px`,
            height: `${sp.size}px`,
            animationDelay: `${sp.delay}s`,
            animationDuration: `${sp.duration}s`,
            animationIterationCount: 'infinite',
          }}
        />
      ))}
    </div>
  );
}
