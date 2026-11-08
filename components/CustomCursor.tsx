'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Disable custom cursor on mobile touch devices
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const cursor = cursorRef.current;
    const dot = dotRef.current;
    if (!cursor || !dot) return;

    // Use GSAP quickTo for silky smooth momentum tracking
    const cursorX = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3.out' });
    const cursorY = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3.out' });
    const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power2.out' });
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power2.out' });

    const moveHandler = (e: MouseEvent) => {
      cursorX(e.clientX);
      cursorY(e.clientY);
      dotX(e.clientX);
      dotY(e.clientY);
    };

    window.addEventListener('mousemove', moveHandler);

    // Expand & snap gently to buttons or interactive links
    const handleInteractEnter = () => {
      gsap.to(cursor, {
        scale: 1.6,
        borderColor: '#2DEB90',
        backgroundColor: 'rgba(45, 235, 144, 0.08)',
        duration: 0.2,
      });
      gsap.to(dot, { scale: 0, duration: 0.15 });
    };

    const handleInteractLeave = () => {
      gsap.to(cursor, {
        scale: 1,
        borderColor: 'rgba(45, 235, 144, 0.45)',
        backgroundColor: 'transparent',
        duration: 0.2,
      });
      gsap.to(dot, { scale: 1, duration: 0.15 });
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
      {/* Outer Restrained Mint Ring */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-7 h-7 -ml-3.5 -mt-3.5 rounded-full border border-[#2DEB90]/40 pointer-events-none z-[9999] transition-opacity mix-blend-screen shadow-[0_0_15px_rgba(45,235,144,0.25)] hidden md:block"
      />
      {/* Inner Pinpoint Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 -ml-[3px] -mt-[3px] rounded-full bg-[#2DEB90] pointer-events-none z-[9999] hidden md:block"
      />
    </>
  );
}
