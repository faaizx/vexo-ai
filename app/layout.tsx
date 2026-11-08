import React from 'react';
import type { Metadata } from 'next';
import SmoothScrolling from '@/components/SmoothScrolling';
import CustomCursor from '@/components/CustomCursor';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vexo AI — The Autonomous Minecraft Server AI Developer & Admin',
  description:
    'Autonomous AI administrator & Java plugin builder for Minecraft servers (1.7.10 — 26.3). Diagnose TPS lag, patch YAML configs in plain English, and deploy 100% BYOK privacy over standard SFTP & RCON.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        {/* Google Fonts: Space Grotesk & JetBrains Mono */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#08090C] text-[#F8FAFC] font-sans antialiased overflow-x-hidden selection:bg-[#2DEB90] selection:text-[#05080A]">
        <CustomCursor />
        <SmoothScrolling>
          <div className="relative min-h-screen">
            {children}
          </div>
        </SmoothScrolling>
      </body>
    </html>
  );
}
