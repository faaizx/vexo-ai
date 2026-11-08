'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const dot = dotRef.current;
    if (!cursor || !dot) return;

    // Use GSAP quickTo for 60fps momentum tracking
    const cursorX = gsap.quickTo(cursor, 'x', { duration: 0.45, ease: 'power3.out' });
    const cursorY = gsap.quickTo(cursor, 'y', { duration: 0.45, ease: 'power3.out' });
    const dotX = gsap.quickTo(dot, 'x', { duration: 0.15, ease: 'power2.out' });
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.15, ease: 'power2.out' });

    const moveHandler = (e: MouseEvent) => {
      cursorX(e.clientX);
      cursorY(e.clientY);
      dotX(e.clientX);
      dotY(e.clientY);
    };

    window.addEventListener('mousemove', moveHandler);

    // Expand & snap to buttons or interactive links
    const handleInteractEnter = (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      gsap.to(cursor, {
        scale: 1.8,
        borderColor: '#00FF9D',
        backgroundColor: 'rgba(0, 255, 157, 0.15)',
        duration: 0.25,
      });
      gsap.to(dot, { scale: 0, duration: 0.2 });
    };

    const handleInteractLeave = () => {
      gsap.to(cursor, {
        scale: 1,
        borderColor: '#00FF9D',
        backgroundColor: 'transparent',
        duration: 0.25,
      });
      gsap.to(dot, { scale: 1, duration: 0.2 });
    };

    const attachListeners = () => {
      const targets = document.querySelectorAll('button, a, [role="button"], input, select');
      targets.forEach((t) => {
        t.removeEventListener('mouseenter', handleInteractEnter);
        t.removeEventListener('mouseleave', handleInteractLeave);
        t.addEventListener('mouseenter', handleInteractEnter);
        t.addEventListener('mouseleave', handleInteractLeave);
      });
    };

    attachListeners();
    const observer = new MutationObserver(attachListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', moveHandler);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* Outer Glowing Neon Mint Ring */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-8 h-8 -ml-4 -mt-4 rounded-full border border-[#00FF9D] pointer-events-none z-[9999] transition-opacity mix-blend-screen shadow-[0_0_20px_rgba(0,255,157,0.5)]"
      />
      {/* Inner Pinpoint Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 -ml-[3px] -mt-[3px] rounded-full bg-[#00FF9D] pointer-events-none z-[9999]"
      />
    </>
  );
}
