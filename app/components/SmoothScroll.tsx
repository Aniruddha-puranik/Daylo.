'use client';

import { ReactLenis, useLenis } from 'lenis/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useState, type ReactNode } from 'react';
import 'lenis/dist/lenis.css';

function SyncScrollTrigger() {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis) return;
    const update = () => ScrollTrigger.update();
    lenis.on('scroll', update);
    return () => { lenis.off('scroll', update); };
  }, [lenis]);
  return null;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return <ReactLenis root options={{ lerp: reducedMotion ? 1 : 0.09, syncTouch: false, smoothWheel: !reducedMotion }}>
    <SyncScrollTrigger />
    {children}
  </ReactLenis>;
}
