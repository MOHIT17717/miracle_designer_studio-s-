'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect, ReactNode } from 'react';

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [animationClass, setAnimationClass] = useState('animate-fade-in-up');
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    // When the path changes, trigger a quick fade-out/fade-in cycle
    setAnimationClass('opacity-0 transition-opacity duration-200');
    
    const timeout = setTimeout(() => {
      setDisplayChildren(children);
      setAnimationClass('animate-fade-in-up');
    }, 200);

    return () => clearTimeout(timeout);
  }, [pathname, children]);

  return (
    <div className={`relative z-10 w-full ${animationClass}`}>
      {displayChildren}
    </div>
  );
}
