'use client';

import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MagneticButton from '@/components/MagneticButton';

// SSR-safe dynamic import for Three.js WebGL canvas (crucial for Vercel builds)
const Hero3D = dynamic(() => import('@/components/Hero3D'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-[#050505] -z-10 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border border-[#00FF9D]/30 border-t-[#00FF9D] animate-spin" />
    </div>
  ),
});

export default function LandingPage() {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // 1. GSAP Staggered Mask-Up Text Reveal on Page Load
    if (headlineRef.current) {
      const words = headlineRef.current.querySelectorAll('.reveal-word');
      gsap.fromTo(
        words,
        {
          yPercent: 120,
          opacity: 0,
          rotateX: 45,
        },
        {
          yPercent: 0,
          opacity: 1,
          rotateX: 0,
          duration: 1.1,
          stagger: 0.08,
          ease: 'power4.out',
          delay: 0.2,
        }
      );
    }

    // 2. ScrollTrigger: Animate 3D canvas on scroll down (scale down, move z backward, blur out)
    if (canvasWrapRef.current && heroSectionRef.current) {
      gsap.to(canvasWrapRef.current, {
        scrollTrigger: {
          trigger: heroSectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        },
        scale: 0.65,
        opacity: 0.2,
        filter: 'blur(8px)',
        transformOrigin: 'center center',
        ease: 'none',
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#050505] text-white">
      {/* 3D WebGL Background (Instanced Floating Anti-Gravity Voxels) */}
      <div ref={canvasWrapRef} className="fixed inset-0 pointer-events-none -z-10">
        <Hero3D />
      </div>

      {/* Top Header with Glassmorphism */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0F19]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00FF9D] to-emerald-700 font-bold text-black shadow-lg shadow-[#00FF9D]/25">
              ⛏️
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-gradient-to-r from-white via-emerald-200 to-[#00FF9D] bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
                  Vexo AI
                </span>
                <span className="rounded-full border border-[#00FF9D]/30 bg-[#00FF9D]/10 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-[#00FF9D]">
                  3D AWWWARDS
                </span>
              </div>
              <div className="flex items-center space-x-1.5 font-mono text-[10px] text-gray-400">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00FF9D] animate-pulse" />
                <span>ONLINE • MC 26.3 • THREE.JS</span>
              </div>
            </div>
          </div>

          <nav className="hidden items-center space-x-6 font-mono text-xs font-semibold uppercase tracking-wider text-gray-300 md:flex">
            <a href="#features" className="transition hover:text-[#00FF9D]">// Features</a>
            <a href="#platforms" className="transition hover:text-[#00FF9D]">// Platforms</a>
            <a href="#downloads" className="text-[#00FF9D] transition">// Downloads (26.3)</a>
          </nav>

          <div className="flex items-center space-x-3">
            <MagneticButton strength={0.25}>
              <button className="flex items-center space-x-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs font-medium backdrop-blur-md transition hover:border-[#00FF9D]/50 hover:bg-white/10">
                <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
                <span>Connect API Key</span>
              </button>
            </MagneticButton>

            <MagneticButton strength={0.35}>
              <button className="flex items-center space-x-2 rounded-lg bg-[#00FF9D] px-4 py-2 font-mono text-xs font-bold text-black shadow-lg shadow-[#00FF9D]/25 transition hover:bg-[#34D399]">
                <span>Launch Studio</span>
              </button>
            </MagneticButton>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroSectionRef} className="relative z-10 pt-16 pb-24 text-center px-4">
        <div className="mx-auto max-w-5xl">
          {/* Cockpit Status Pill */}
          <div className="inline-flex items-center space-x-2 rounded-full border border-[#00FF9D]/40 bg-[#0B0F19]/80 px-3.5 py-1.5 font-mono text-xs text-[#00FF9D] shadow-xl backdrop-blur-md mb-6">
            <span className="h-2 w-2 rounded-full bg-[#00FF9D] animate-pulse" />
            <span className="font-bold text-white tracking-wider">VEXO MISSION CONTROL</span>
            <span className="text-gray-500">//</span>
            <span>MINECRAFT 26.3 COMPATIBLE</span>
            <span className="text-gray-500">//</span>
            <span className="text-cyan-400">100% BYOK ENCLAVE</span>
          </div>

          {/* Staggered Masked Headline */}
          <h1
            ref={headlineRef}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] overflow-hidden"
          >
            <span className="inline-block overflow-hidden">
              <span className="reveal-word inline-block mr-3 text-white">The</span>
            </span>
            <span className="inline-block overflow-hidden">
              <span className="reveal-word inline-block mr-3 text-white">Autonomous</span>
            </span>
            <span className="inline-block overflow-hidden">
              <span className="reveal-word inline-block mr-3 bg-gradient-to-r from-[#00FF9D] via-teal-200 to-cyan-400 bg-clip-text text-transparent text-glow-mint">
                Minecraft Server AI
              </span>
            </span>
            <span className="inline-block overflow-hidden">
              <span className="reveal-word inline-block text-white">Developer</span>
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-sm sm:text-base md:text-lg text-gray-300 font-normal leading-relaxed">
            Stop wrestling with complex YAML syntax, obscure crash reports, and plugin jars.
            Connect your server, provide your API key, and manage, troubleshoot, and code plugins in plain English.
          </p>

          {/* Magnetic CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <MagneticButton strength={0.4}>
              <button className="flex items-center space-x-2 rounded-xl bg-[#00FF9D] px-8 py-3.5 font-sans font-bold text-black shadow-xl shadow-[#00FF9D]/30 transition hover:bg-[#34D399]">
                <span>Open Server Studio</span>
                <span>→</span>
              </button>
            </MagneticButton>

            <MagneticButton strength={0.35}>
              <button className="flex items-center space-x-2 rounded-xl border border-white/10 bg-[#0F172A]/90 px-6 py-3.5 font-sans font-bold text-gray-200 backdrop-blur-md transition hover:border-[#00FF9D]/50 hover:bg-[#1E293B]">
                <span>Connect via SFTP & RCON</span>
              </button>
            </MagneticButton>
          </div>

          {/* Floating Version Selector Pills (Glassmorphism) */}
          <div className="mx-auto mt-8 max-w-4xl rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-md flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
            <div className="flex items-center space-x-2 pl-2 text-gray-400">
              <span className="h-2 w-2 rounded-full bg-[#00FF9D]" />
              <span className="font-bold text-gray-200 uppercase tracking-wider text-[11px]">Direct Version Select:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg border border-[#00FF9D]/30 bg-[#0F172A] px-2.5 py-1 text-[#00FF9D] font-semibold">
                Paper / Spigot (26.3)
              </span>
              <span className="rounded-lg border border-cyan-500/30 bg-[#0F172A] px-2.5 py-1 text-cyan-400 font-semibold">
                Fabric (26.3)
              </span>
              <span className="rounded-lg border border-amber-500/30 bg-[#0F172A] px-2.5 py-1 text-amber-400 font-semibold">
                Forge & Neo (26.3)
              </span>
              <span className="rounded-lg border border-purple-500/30 bg-[#0F172A] px-2.5 py-1 text-purple-400 font-semibold">
                Velocity Proxy
              </span>
              <span className="rounded-lg border border-yellow-500/30 bg-[#0F172A] px-2.5 py-1 text-yellow-400 font-semibold">
                Vanilla Daemon
              </span>
            </div>
          </div>

          {/* 4-Card Bento Telemetry Grid */}
          <div className="mx-auto mt-8 grid max-w-5xl grid-cols-2 gap-3 text-left md:grid-cols-4 font-mono">
            <div className="rounded-xl border border-white/10 bg-[#0F172A]/80 p-4 backdrop-blur-md shadow-xl transition hover:border-[#00FF9D]/40">
              <div className="text-[10px] text-gray-400 font-bold tracking-wider uppercase mb-1">MC VERSIONS</div>
              <div className="text-xl font-bold text-white">1.7.10 — 26.3</div>
              <div className="text-xs text-[#00FF9D] mt-1">33+ Target Releases</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0F172A]/80 p-4 backdrop-blur-md shadow-xl transition hover:border-cyan-500/40">
              <div className="text-[10px] text-gray-400 font-bold tracking-wider uppercase mb-1">SERVER ENGINE</div>
              <div className="text-xl font-bold text-white">20.00 TPS</div>
              <div className="text-xs text-cyan-400 mt-1">0.0ms Jitter • Paper 26.3</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0F172A]/80 p-4 backdrop-blur-md shadow-xl transition hover:border-amber-500/40">
              <div className="text-[10px] text-gray-400 font-bold tracking-wider uppercase mb-1">BYOK ENGINES</div>
              <div className="text-xl font-bold text-white">8+ Models</div>
              <div className="text-xs text-amber-400 mt-1">Gemini, OpenAI, Claude...</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0F172A]/80 p-4 backdrop-blur-md shadow-xl transition hover:border-purple-500/40">
              <div className="text-[10px] text-gray-400 font-bold tracking-wider uppercase mb-1">SAFE AIRGAP</div>
              <div className="text-xl font-bold text-white">SFTP + RCON</div>
              <div className="text-xs text-purple-400 mt-1">Auto-Backup (*.bak)</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
