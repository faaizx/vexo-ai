---
name: Vexo AI Dark Cyber-Tactical
version: 1.0.0
description: High-density mission-control HUD and developer studio design system for Vexo AI (Autonomous Minecraft Server AI Developer & Administrator).
tokens:
  colors:
    background:
      root: "#080C14"
      surface: "#0B0F19"
      card: "#0F172A"
      card-hover: "#1E293B"
      terminal: "#05080E"
      glass: "rgba(11, 15, 25, 0.85)"
    border:
      default: "#1E293B"
      subtle: "#162032"
      active: "#334155"
      focus: "rgba(16, 185, 129, 0.45)"
      danger: "rgba(239, 68, 68, 0.4)"
    brand:
      50: "#ecfdf5"
      100: "#d1fae5"
      200: "#a7f3d0"
      300: "#6ee7b7"
      400: "#34d399"
      500: "#10b981"
      600: "#059669"
      700: "#047857"
      800: "#065f46"
      900: "#064e3b"
      950: "#022c22"
      dark: "#0B0F19"
      darker: "#06090F"
      card: "#0F172A"
      border: "#1E293B"
      terminal: "#05080E"
    accents:
      emerald: "#10B981"
      cyan: "#06B6D4"
      amber: "#F59E0B"
      rose: "#EF4444"
      violet: "#8B5CF6"
      blue: "#3B82F6"
    text:
      primary: "#F8FAFC"
      secondary: "#94A3B8"
      muted: "#64748B"
      dim: "#475569"
      accent: "#34D399"
  typography:
    fonts:
      sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      mono: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace"
    weights:
      normal: 400
      medium: 500
      semibold: 600
      bold: 700
      extrabold: 800
  radii:
    xs: "4px"
    sm: "6px"
    md: "8px"
    lg: "10px"
    xl: "12px"
    2xl: "16px"
    full: "9999px"
  shadows:
    card: "0 10px 30px -10px rgba(0, 0, 0, 0.7)"
    glow-emerald: "0 0 35px -8px rgba(16, 185, 129, 0.35)"
    glow-cyan: "0 0 35px -8px rgba(6, 182, 212, 0.35)"
    glow-rose: "0 0 35px -8px rgba(239, 68, 68, 0.35)"
---

# DESIGN.md — Vexo AI Dark Cyber-Tactical Design System

> **Single Source of Truth** for UI/UX generation, component authoring, and styling in Vexo AI (Open BYOK Edition).

---

## 1. Visual Philosophy & Design Identity

Vexo AI is an **autonomous mission control center** for Minecraft server administration and AI plugin development. The interface bridges the gap between deep infrastructure (SFTP, RCON, Java bytecode, ANSI terminal streams) and modern agentic AI interaction.

- **Aesthetic**: Dark Cyber-Tactical Bento HUD (Inspired by Linear, Raycast, and Supabase).
- **Core Mood**: Mission-critical, precise, highly responsive, high information density.
- **Visual Tenet**: Zero frivolous decoration. Every glow, badge, border, and color carries clear operational meaning (server health, latency, stream status, or safety guardrail).

---

## 2. Color System & Semantic Intent

| Token | Hex | Semantic Meaning / Role |
| :--- | :--- | :--- |
| **`bg-root`** | `#080C14` | The outermost canvas background. Deep space navy to prevent pitch-black eye strain. |
| **`bg-surface`** | `#0B0F19` | Elevated containers, sidebars, navigation bars, and sticky toolbars. |
| **`bg-card`** | `#0F172A` | Bento grid cards, telemetry widgets, inspector panes, and modal backgrounds. |
| **`bg-terminal`** | `#05080E` | High-contrast black terminal background for raw ANSI log outputs and live RCON stream. |
| **`brand-500` / Emerald** | `#10B981` | Online servers, healthy TPS (19.8 - 20.0), successful plugin builds, primary CTAs. |
| **Cyan (`#06B6D4`)** | `#06B6D4` | AI thinking state, active BYOK model streaming, WebSocket bridge heartbeat. |
| **Amber (`#F59E0B`)** | `#F59E0B` | Degraded server state, low TPS (<16.0), high MSPT (>45ms), missing API key, pending diffs. |
| **Rose (`#EF4444`)** | `#EF4444` | Server crashed, critical exception, destructive action alert (delete/stop), RCON authentication failure. |
| **Violet (`#8B5CF6`)** | `#8B5CF6` | Java bytecode compiling, Paper/Fabric plugin packaging, local JDK actions. |
| **Border Default** | `#1E293B` | Clean 1px structural dividing lines. Never exceed 1px for card borders. |

---

## 3. Typography Hierarchy

### Font Families
- **Prose & UI**: `'Inter', -apple-system, sans-serif`
  - Body text is optimized for legibility at small sizes: `text-xs` (12px) and `text-sm` (14px).
  - Headers emphasize clarity and confidence: `font-semibold` or `font-extrabold`, tracking `tracking-tight` (`-0.025em`).
- **Telemetry & Code**: `'JetBrains Mono', monospace`
  - Strictly enforced for:
    - Minecraft server commands (`/say`, `/whitelist`, `/spark`)
    - Console terminal outputs and stack traces
    - SFTP file directory paths (`plugins/WorldEdit/config.yml`)
    - Live numeric stats (TPS `20.0`, MSPT `14.2ms`, RAM `3.4 / 8.0 GB`)
    - Java code snippets and YAML key-values

---

## 4. Component Standards & Layout Blueprints

### 4.1 Bento Grid Telemetry Cards
- **Container**: `bg-[#0F172A] border border-gray-800/80 rounded-xl p-4 shadow-xl hover:border-gray-700/80 transition-all`
- **Header**: Icon (16px) + Category label (`text-xs font-semibold tracking-wider uppercase text-gray-400`) + Status badge.
- **Value**: Bold scalar value (`text-2xl font-bold font-mono text-gray-100`) accompanied by real-time indicator dot.

### 4.2 Live Console & ANSI Terminal
- **Background**: `#05080E` with fine 1px `#1E293B` border.
- **Scrollbar**: Minimalist 6px track `#0B0F19`, thumb `#1F2937` with hover `#374151`.
- **Text Rendering**: JetBrains Mono with 1.4 line-height and authentic ANSI-to-HTML Minecraft color codes (`§a` green, `§c` red, `§e` yellow, `§b` aqua).
- **Prompt Input**: Border-top `#1E293B`, monospace prompt prefix `❯`, automatic autocomplete for registered server commands.

### 4.3 AI Chat & Autonomous Agent Interface
- **Agent Message Bubble**: Background `bg-gray-900/60`, border `border-gray-800`, subtle left accent strip (`border-l-2 border-l-emerald-500`).
- **Action Cards**: When the AI proposes an action (e.g. modify `server.properties`, compile `.jar`, or run `/whitelist add`), render as an embedded interactive confirmation widget with:
  1. File/command target path.
  2. Syntax-highlighted diff preview.
  3. Green **Approve & Execute** button and Gray **Reject** button.
- **Streaming State**: Pulsing cyan status beacon (`bg-cyan-400 animate-pulse`).

### 4.4 Destructive Safety Guardrails
- Whenever an operation involves deleting files, rolling back databases, stopping the live server, or editing world regions:
  - Trigger high-contrast warning modal with `border-rose-500/40` and `glow-rose`.
  - Require explicit user confirmation before SFTP or RCON dispatch.
  - Automatically create safety backups (`*.vexo.bak`).

---

## 5. Micro-Interactions & Styling Classes

```css
/* Custom Glow Accents */
.glow-emerald {
  box-shadow: 0 0 35px -8px rgba(16, 185, 129, 0.35);
}
.glow-cyan {
  box-shadow: 0 0 35px -8px rgba(6, 182, 212, 0.35);
}
.glow-rose {
  box-shadow: 0 0 35px -8px rgba(239, 68, 68, 0.35);
}
.glow-card {
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.7);
}

/* Subtle Matrix / HUD Grid Background */
.grid-bg {
  background-size: 32px 32px;
  background-image: 
    linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
}
```

---

## 6. Implementation Checklist for AI Agents
When generating or modifying UI components in this workspace, follow these mandatory rules:
1. **Always use dark-first styling**: All surfaces must use `#080C14` (canvas), `#0B0F19` (header/nav), or `#0F172A` (card). Never introduce light gray or white page backgrounds.
2. **Preserve High Information Density**: Do not introduce oversized padding. Keep control rows compact (`h-9` or `h-10` for inputs, `px-3 py-1.5` for buttons).
3. **Monospace for System Entities**: Always wrap server paths, command tokens, ports, IP addresses, and TPS metrics in `font-mono`.
4. **Use Lucide Icons**: Maintain standard 16px (`w-4 h-4`) or 18px icons with `stroke-width="2"`.
5. **No Token Drift**: Keep emerald `#10B981` as the primary brand/status accent, cyan `#06B6D4` for AI actions, and amber/rose strictly for health alerts.
