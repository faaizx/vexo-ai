'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import MagneticButton from '@/components/MagneticButton';

// SSR-safe dynamic import for the ambient Three.js WebGL canvas
const Hero3D = dynamic(() => import('@/components/Hero3D'), {
  ssr: false,
  loading: () => null,
});

export default function LandingPage() {
  const [airgapMode, setAirgapMode] = useState<'byok' | 'cloud'>('byok');
  const [activeTab, setActiveTab] = useState<'all' | 'paper' | 'fabric' | 'forge' | 'proxy'>('all');
  const [terminalStep, setTerminalStep] = useState(0);

  // Terminal simulated live diagnostic events
  useEffect(() => {
    const timer = setInterval(() => {
      setTerminalStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 1400);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#08090C] text-[#F8FAFC]">
      {/* Ambient 3D Depth Layer (Restrained, Subdued) */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <Hero3D />
      </div>

      {/* Subtle Radial Gradient Glow at Top 20% (Rule 2) */}
      <div 
        className="pointer-events-none fixed inset-0 -z-10 opacity-70"
        style={{
          background: 'radial-gradient(circle 900px at 50% 18%, #12161F 0%, transparent 70%)',
        }}
      />

      {/* ========================================================================= */}
      {/* 1. TOP HEADER (Minimalist Glass Bar)                                      */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#08090C]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo & Mark */}
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.08] font-bold text-[#2DEB90] shadow-sm">
              ⛏
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-bold tracking-tight text-white">
                Vexo AI
              </span>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] font-medium tracking-wider text-[#2DEB90]">
                OPEN BYOK
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden items-center space-x-7 font-mono text-xs font-medium text-[#8B949E] md:flex">
            <a href="#hero" className="transition hover:text-white">// Overview</a>
            <a href="#terminal" className="transition hover:text-white">// Live Diagnostic</a>
            <a href="#runtimes" className="transition hover:text-white">// Runtimes (26.3)</a>
            <a href="#airgap" className="transition hover:text-white">// BYOK Enclave</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center space-x-3">
            <MagneticButton strength={0.2}>
              <button 
                onClick={() => alert('Connect API Key: Configure your Google Gemini, OpenAI, Claude, or Ollama tokens in 100% client-side localStorage.')}
                className="flex items-center space-x-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 font-mono text-xs font-medium text-[#8B949E] transition hover:border-white/[0.15] hover:text-white"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#2DEB90] animate-pulse" />
                <span>Connect API Key</span>
              </button>
            </MagneticButton>

            <MagneticButton strength={0.25}>
              <button 
                onClick={() => alert('Launching Vexo Server Studio: Direct connection via SFTP (port 22/2022) & RCON (port 25575).')}
                className="flex items-center space-x-2 rounded-lg bg-[#2DEB90] px-4 py-2 font-mono text-xs font-bold text-[#05080A] shadow-md shadow-[#2DEB90]/10 transition hover:brightness-105 active:scale-[0.98]"
              >
                <span>Launch Studio</span>
              </button>
            </MagneticButton>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION (Clean & Impactful - Rule 3)                               */}
      {/* ========================================================================= */}
      <section id="hero" className="relative z-10 pt-20 pb-20 text-center px-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          {/* Floating Mono Capsule Tag ABOVE Headline (Clean Telemetry - Rule 3) */}
          <div className="inline-flex items-center space-x-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 font-mono text-xs text-[#8B949E] backdrop-blur-md mb-8">
            <span className="h-2 w-2 rounded-full bg-[#2DEB90] animate-pulse" />
            <span className="font-semibold text-white tracking-wider">VEXO-NODE-01</span>
            <span className="text-white/20">//</span>
            <span>MC 26.3 COMPATIBLE</span>
            <span className="text-white/20">//</span>
            <span className="text-[#2DEB90]">20.00 TPS</span>
            <span className="text-white/20">//</span>
            <span>100% BYOK ENCLAVE</span>
          </div>

          {/* Headline (Rule 3: Pure white with subtle mint accent on Minecraft & AI Developer) */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.12] text-white">
            The Autonomous <span className="text-[#2DEB90]">Minecraft</span> Server{' '}
            <span className="text-[#2DEB90]">AI Developer</span>
          </h1>

          {/* Subtext (Rule 2: Cool Slate Gray #8B949E) */}
          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-[#8B949E] font-normal leading-relaxed">
            Stop wrestling with complex YAML syntax, obscure crash reports, and plugin jars.
            Connect your server, provide your API key, and manage, troubleshoot, and code plugins in plain English.
          </p>

          {/* CTA Buttons (Rule 3) */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <MagneticButton strength={0.3}>
              <button 
                onClick={() => alert('Opening Server Studio: Zero installation required on client machine.')}
                className="flex items-center space-x-2 rounded-xl bg-[#2DEB90] px-7 py-3.5 font-sans font-bold text-[#05080A] shadow-lg shadow-[#2DEB90]/15 transition hover:brightness-105 active:scale-[0.98]"
              >
                <span>Open Server Studio</span>
                <span>→</span>
              </button>
            </MagneticButton>

            <MagneticButton strength={0.25}>
              <button 
                onClick={() => alert('Connect via SFTP & RCON: Standard ports 22/25575. Zero extra open ports required.')}
                className="flex items-center space-x-2 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] px-6 py-3.5 font-sans font-semibold text-white backdrop-blur-md transition active:scale-[0.98]"
              >
                <span>Connect via SFTP & RCON</span>
              </button>
            </MagneticButton>
          </div>

          {/* Monospace Direct Version Quick-Selector Capsule */}
          <div className="mx-auto mt-10 max-w-3xl rounded-xl border border-white/[0.08] bg-white/[0.02] p-2.5 backdrop-blur-md flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
            <div className="flex items-center space-x-2 pl-2 text-[#64748B]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2DEB90]" />
              <span className="font-semibold text-[#8B949E] uppercase tracking-wider text-[11px]">Direct Version Select:</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[#2DEB90] font-medium">
                Paper (26.3)
              </span>
              <span className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[#8B949E] font-medium">
                Fabric (26.3)
              </span>
              <span className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[#8B949E] font-medium">
                Forge / Neo (26.3)
              </span>
              <span className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[#8B949E] font-medium">
                Velocity 3.3
              </span>
              <span className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[#8B949E] font-medium">
                Vanilla BDS
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SECTION 2: TERMINAL & LIVE EXECUTION (Rule 4: 2-Column Showcase)        */}
      {/* ========================================================================= */}
      <section id="terminal" className="relative z-10 py-20 px-4 sm:px-6 border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Problem & Promise (Rule 4) */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <div className="inline-flex items-center space-x-2 font-mono text-xs text-[#2DEB90]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2DEB90]" />
                <span className="tracking-wider uppercase">// AUTONOMOUS INTERVENTION</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                English in.<br />
                Synchronized execution out.
              </h2>

              <p className="text-base text-[#8B949E] leading-relaxed">
                At 8:42 PM on Friday night, your 60-player survival SMP drops to 8.4 TPS.
                Runaway villager brain ticking in the Nether hub is consuming 41% of server tick time.
                A single broken indent in <code className="text-white font-mono text-xs bg-white/[0.05] px-1.5 py-0.5 rounded">paper-world-defaults.yml</code> bricks the reboot.
              </p>

              <div className="space-y-3 pt-2 font-mono text-xs text-[#8B949E]">
                <div className="flex items-start space-x-3">
                  <span className="text-[#2DEB90] mt-0.5">✓</span>
                  <span>Automatic atomic configuration snapshot & backup (*.bak)</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-[#2DEB90] mt-0.5">✓</span>
                  <span>Surgical clamp of entity activation and despawn bounds</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-[#2DEB90] mt-0.5">✓</span>
                  <span>Synchronous reload dispatch with zero player disconnections</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-[#2DEB90] mt-0.5">✓</span>
                  <span>Immediate TPS restoration back to 20.00 (0.0ms tick jitter)</span>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => alert('Simulating autonomous live reload inspection across paper-world-defaults.yml.')}
                  className="inline-flex items-center space-x-2 text-xs font-mono font-semibold text-[#2DEB90] hover:underline"
                >
                  <span>Inspect autonomous patch pipeline</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* Right Column: Realistic macOS/Linux Glass Terminal Window (Rule 4) */}
            <div className="lg:col-span-7">
              <div className="terminal-window rounded-2xl overflow-hidden text-left">
                {/* Titlebar with traffic light controls */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                  <div className="flex items-center space-x-2">
                    <span className="h-3 w-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/50 inline-block" />
                    <span className="h-3 w-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50 inline-block" />
                    <span className="h-3 w-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/50 inline-block" />
                  </div>
                  <div className="font-mono text-xs text-[#64748B] flex items-center space-x-2">
                    <span>vexo-agent@paper-26.3-survival: ~</span>
                  </div>
                  <div className="flex items-center space-x-1.5 font-mono text-[11px] text-[#2DEB90] bg-[#2DEB90]/10 border border-[#2DEB90]/20 px-2 py-0.5 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2DEB90] animate-pulse" />
                    <span>TPS RECOVERY: +11.6</span>
                  </div>
                </div>

                {/* Monospace Terminal Body */}
                <div className="p-5 font-mono text-xs leading-relaxed space-y-3.5 text-[#8B949E]">
                  {/* Step 1: Admin Command */}
                  <div className="flex items-center space-x-2 text-white">
                    <span className="text-[#2DEB90] font-bold">admin@server:~$</span>
                    <span className="bg-white/[0.05] px-2 py-0.5 rounded text-white font-medium">
                      "Fix the Nether hub entity lag immediately."
                    </span>
                  </div>

                  {/* Step 2: AI Diagnostic */}
                  <div className="text-[#8B949E] pl-2 border-l border-white/[0.1] space-y-1">
                    <div className="text-white flex items-center space-x-2">
                      <span className="text-[#2DEB90]">⚡ Vexo AI:</span>
                      <span>Profiling live JVM tick stack...</span>
                    </div>
                    <div className="text-[#64748B]">
                      Villager brain ticking (Chunk [-14, 22]): consuming 41.2% tick budget.
                    </div>
                  </div>

                  {/* Step 3: Verified Diff */}
                  <div className="bg-[#05070B] border border-white/[0.06] rounded-xl p-3.5 space-y-1.5">
                    <div className="text-[11px] text-[#64748B] pb-1 border-b border-white/[0.05] flex justify-between">
                      <span>paper-world-defaults.yml (atomic patch)</span>
                      <span className="text-[#2DEB90]">Auto-Backup Created</span>
                    </div>
                    <div className="text-[#EF4444] bg-[#EF4444]/10 px-2 py-0.5 rounded">
                      - entity-activation-range.animals: 32
                    </div>
                    <div className="text-[#2DEB90] bg-[#2DEB90]/10 px-2 py-0.5 rounded">
                      + entity-activation-range.animals: 16
                    </div>
                    <div className="text-[#EF4444] bg-[#EF4444]/10 px-2 py-0.5 rounded">
                      - despawn-ranges.monster.hard: 128
                    </div>
                    <div className="text-[#2DEB90] bg-[#2DEB90]/10 px-2 py-0.5 rounded">
                      + despawn-ranges.monster.hard: 96 (despawn soft: 32)
                    </div>
                    <div className="text-[#2DEB90] bg-[#2DEB90]/10 px-2 py-0.5 rounded">
                      + tick-inactive-villagers: false
                    </div>
                  </div>

                  {/* Step 4: Synchronous Execution Results */}
                  <div className="space-y-1 text-xs">
                    <div className="text-[#8B949E] flex items-center space-x-2">
                      <span className="text-[#2DEB90]">✓</span>
                      <span>Backup: <span className="text-white">paper-world-defaults.yml.vexo.bak</span> written to disk.</span>
                    </div>
                    <div className="text-[#8B949E] flex items-center space-x-2">
                      <span className="text-[#2DEB90]">✓</span>
                      <span>Dispatched <code className="text-white bg-white/[0.08] px-1 rounded">/paper reload</code> synchronously.</span>
                    </div>
                    <div className="text-[#2DEB90] font-semibold flex items-center space-x-2 pt-1">
                      <span>✓</span>
                      <span>Server stabilized at 20.00 TPS (0.0ms tick jitter, 0 players dropped).</span>
                    </div>
                  </div>
                </div>

                {/* Footer status indicator */}
                <div className="px-4 py-2 border-t border-white/[0.04] bg-white/[0.01] flex items-center justify-between text-[11px] font-mono text-[#64748B]">
                  <span>SFTP Direct Socket: Port 22</span>
                  <span>RCON Handshake: Verified</span>
                  <span>JVM: OpenJDK 21 64-Bit</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SECTION 3: RUNTIME BENTO GRID (Rule 5: 4-Column Responsive Layout)      */}
      {/* ========================================================================= */}
      <section id="runtimes" className="relative z-10 py-20 px-4 sm:px-6 border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center space-x-2 font-mono text-xs text-[#2DEB90]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2DEB90]" />
              <span className="tracking-wider uppercase">// MULTI-VERSION MATRIX</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Universal Native Coverage
            </h2>
            <p className="text-base text-[#8B949E]">
              From legacy 1.7.10 PvP classic to cutting-edge Minecraft 26.3. Precompiled runtime bridge binaries engineered for zero port overhead.
            </p>
          </div>

          {/* 4-Column Bento Grid (Rule 5) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Paper */}
            <div className="glass-card rounded-2xl p-6 flex flex-col justify-between text-left transition duration-300">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[11px] font-semibold text-[#2DEB90] uppercase tracking-wider">
                    BUKKIT / SPIGOT / PAPER
                  </span>
                  <span className="h-2 w-2 rounded-full bg-[#2DEB90]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">VexoBridge Paper</h3>
                <p className="text-xs text-[#8B949E] leading-relaxed mb-6">
                  Direct hook into Bukkit event scheduler and spark profiler. Zero overhead for survival SMP and minigame networks.
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.06] font-mono text-xs space-y-2">
                <div className="flex justify-between items-center text-[#8B949E]">
                  <span>Support:</span>
                  <span className="text-white font-medium">1.7.10 — 26.3</span>
                </div>
                <div className="flex justify-between items-center text-[#8B949E]">
                  <span>Tag:</span>
                  <span className="rounded bg-white/[0.04] px-2 py-0.5 text-[#2DEB90] text-[11px]">
                    Paper 1.20+
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Fabric */}
            <div className="glass-card rounded-2xl p-6 flex flex-col justify-between text-left transition duration-300">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[11px] font-semibold text-[#06B6D4] uppercase tracking-wider">
                    FABRIC SERVER MOD
                  </span>
                  <span className="h-2 w-2 rounded-full bg-[#06B6D4]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">VexoBridge Fabric</h3>
                <p className="text-xs text-[#8B949E] leading-relaxed mb-6">
                  Lightweight Mixin bytecode hook into dedicated server tick loop. Compatible with Lithium and FerriteCore.
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.06] font-mono text-xs space-y-2">
                <div className="flex justify-between items-center text-[#8B949E]">
                  <span>Support:</span>
                  <span className="text-white font-medium">1.14.4 — 26.3</span>
                </div>
                <div className="flex justify-between items-center text-[#8B949E]">
                  <span>Tag:</span>
                  <span className="rounded bg-white/[0.04] px-2 py-0.5 text-[#06B6D4] text-[11px]">
                    Fabric 0.16+
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Forge & NeoForge */}
            <div className="glass-card rounded-2xl p-6 flex flex-col justify-between text-left transition duration-300">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[11px] font-semibold text-[#F59E0B] uppercase tracking-wider">
                    FORGE & NEOFORGE
                  </span>
                  <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">VexoBridge Forge</h3>
                <p className="text-xs text-[#8B949E] leading-relaxed mb-6">
                  Engineered for ATM9, DawnCraft, and heavy modpacks. Automates mod config reloads and entity crash guards.
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.06] font-mono text-xs space-y-2">
                <div className="flex justify-between items-center text-[#8B949E]">
                  <span>Support:</span>
                  <span className="text-white font-medium">1.7.10 — 26.3</span>
                </div>
                <div className="flex justify-between items-center text-[#8B949E]">
                  <span>Tag:</span>
                  <span className="rounded bg-white/[0.04] px-2 py-0.5 text-[#F59E0B] text-[11px]">
                    Forge 1.20+
                  </span>
                </div>
              </div>
            </div>

            {/* Card 4: Velocity Proxy */}
            <div className="glass-card rounded-2xl p-6 flex flex-col justify-between text-left transition duration-300">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[11px] font-semibold text-[#A855F7] uppercase tracking-wider">
                    PROXY NETWORKS
                  </span>
                  <span className="h-2 w-2 rounded-full bg-[#A855F7]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Velocity & Bungee</h3>
                <p className="text-xs text-[#8B949E] leading-relaxed mb-6">
                  Controls routing, multi-server permissions, and global cross-server chat across Velocity 3.x networks.
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.06] font-mono text-xs space-y-2">
                <div className="flex justify-between items-center text-[#8B949E]">
                  <span>Support:</span>
                  <span className="text-white font-medium">Cross-Server Sync</span>
                </div>
                <div className="flex justify-between items-center text-[#8B949E]">
                  <span>Tag:</span>
                  <span className="rounded bg-white/[0.04] px-2 py-0.5 text-[#A855F7] text-[11px]">
                    Velocity 3.3+
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SECTION 4: AIRGAP ENCLAVE & ZERO-KNOWLEDGE BYOK                        */}
      {/* ========================================================================= */}
      <section id="airgap" className="relative z-10 py-20 px-4 sm:px-6 border-t border-white/[0.06]">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center space-x-2 font-mono text-xs text-[#2DEB90] mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2DEB90]" />
            <span className="tracking-wider uppercase">// SOVEREIGN ARCHITECTURE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Your Server. Your Keys. <span className="text-[#2DEB90]">Zero Lock-in.</span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-base text-[#8B949E]">
            Never pay a monthly per-server fee or upload server credentials to a third-party SaaS database.
          </p>

          {/* Interactive Airgap Switcher Box */}
          <div className="mx-auto mt-8 max-w-2xl glass-card rounded-2xl p-6 text-left">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
              <span className="font-mono text-xs text-[#8B949E]">ENCLAVE MODE:</span>
              <div className="inline-flex rounded-lg border border-white/[0.08] bg-[#05070B] p-1 font-mono text-xs">
                <button
                  onClick={() => setAirgapMode('byok')}
                  className={`px-3 py-1 rounded-md transition ${
                    airgapMode === 'byok'
                      ? 'bg-[#2DEB90] text-[#05080A] font-bold shadow-sm'
                      : 'text-[#8B949E] hover:text-white'
                  }`}
                >
                  100% BYOK Airgap
                </button>
                <button
                  onClick={() => setAirgapMode('cloud')}
                  className={`px-3 py-1 rounded-md transition ${
                    airgapMode === 'cloud'
                      ? 'bg-red-500/80 text-white font-bold shadow-sm'
                      : 'text-[#8B949E] hover:text-white'
                  }`}
                >
                  SaaS Cloud
                </button>
              </div>
            </div>

            <div className="pt-4 font-mono text-xs leading-relaxed">
              {airgapMode === 'byok' ? (
                <div className="space-y-2 text-[#2DEB90]">
                  <div className="flex items-center space-x-2">
                    <span>✓</span>
                    <span>ENCLAVE STATUS: AES-GCM Client-Side Isolation Active.</span>
                  </div>
                  <div className="text-[#8B949E] flex items-center space-x-2">
                    <span className="text-[#2DEB90]">✓</span>
                    <span>LLM Keys (Gemini, Claude, OpenAI, Ollama) stored exclusively in your browser localStorage.</span>
                  </div>
                  <div className="text-[#8B949E] flex items-center space-x-2">
                    <span className="text-[#2DEB90]">✓</span>
                    <span>SFTP & RCON connect directly between your machine and your Minecraft host. Zero intermediary servers.</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-red-400">
                  <div className="flex items-center space-x-2">
                    <span>⚠️</span>
                    <span>CENTRALIZED CLOUD MODE:</span>
                  </div>
                  <div className="text-[#8B949E]">
                    ✗ Your server credentials and AI API tokens pass through a centralized cloud relay.
                  </div>
                  <div className="text-[#8B949E]">
                    ✗ Monthly recurring subscription fees applied per server instance.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Final Call to Action Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <MagneticButton strength={0.3}>
              <button 
                onClick={() => alert('Launching Vexo Studio: Ready for Minecraft 1.7.10 — 26.3.')}
                className="flex items-center space-x-2 rounded-xl bg-[#2DEB90] px-8 py-3.5 font-sans font-bold text-[#05080A] shadow-lg shadow-[#2DEB90]/15 transition hover:brightness-105 active:scale-[0.98]"
              >
                <span>Launch Vexo Studio</span>
                <span>→</span>
              </button>
            </MagneticButton>

            <a 
              href="#hero"
              className="flex items-center space-x-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] px-6 py-3.5 font-sans font-semibold text-white transition active:scale-[0.98]"
            >
              <span>Back to Top ↑</span>
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. MINIMALIST FOOTER                                                      */}
      {/* ========================================================================= */}
      <footer className="relative z-10 border-t border-white/[0.06] bg-[#05070B] py-8 px-4 sm:px-6 font-mono text-xs text-[#64748B]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white">Vexo AI</span>
            <span>—</span>
            <span>Open BYOK Edition</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Paper • Fabric • Forge • Velocity</span>
            <span>//</span>
            <span className="text-[#2DEB90]">MC 1.7.10 — 26.3 Verified</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
