import React from 'react';
import type { Metadata } from 'next';
import SmoothScrolling from '@/components/SmoothScrolling';
import CustomCursor from '@/components/CustomCursor';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vexo AI — The Autonomous Minecraft Server AI Developer',
  description:
    'Awwwards-winning 3D Mission Control for Minecraft Servers. Autonomous config tuning, crash analysis, and Java bytecode compilation.',
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
      <body className="bg-[#050505] text-gray-100 font-sans antialiased overflow-x-hidden selection:bg-[#00FF9D] selection:text-black">
        <CustomCursor />
        <SmoothScrolling>
          <div className="relative min-h-screen bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
            {children}
          </div>
        </SmoothScrolling>
      </body>
    </html>
  );
}
