# Vexo AI (Open BYOK Edition) — The Autonomous Minecraft Server AI Developer & Admin

<div align="center">

![Vexo AI Open Edition](https://img.shields.io/badge/Minecraft-1.16--1.21+-brightgreen?style=for-the-badge&logo=minecraft)
![Platform](https://img.shields.io/badge/Platforms-SFTP%20%7C%20RCON%20%7C%20Paper%20%7C%20Fabric%20%7C%20Forge-blue?style=for-the-badge)
![BYOK](https://img.shields.io/badge/BYOK-OpenAI%20%7C%20NVIDIA%20%7C%20Claude%20%7C%20Gemini%20%7C%20Ollama-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)

**The autonomous Minecraft server AI developer and administrator with SFTP file access, RCON command dispatch, dynamic model importing, and Bring Your Own Key (BYOK) architecture.**

[Features](#-key-features) • [Quick Start](#-quick-start) • [BYOK Model Setup](#-supported-ai-providers-byok) • [Netlify Deployment](#-netlify-deployment) • [Documentation](#-documentation)

</div>

---

## 🌟 Key Features

- **Bring Your Own Key (BYOK) Freedom**: Connect **Google Gemini, NVIDIA NIM, OpenAI, Anthropic Claude, DeepSeek, Groq, or Ollama (100% free offline on your GPU)**. Dynamic model importing fetches real available models automatically.
- **Autonomous Server Configuration via SFTP**: Vexo reads and modifies `server.properties`, `spigot.yml`, `paper-world-defaults.yml`, `bukkit.yml`, and plugin configs over SFTP without syntax mistakes or needing extra open ports.
- **Console Commands via RCON**: Dispatches live commands (`/say`, `/whitelist`, `/reload`, `/op`) securely through standard Minecraft RCON.
- **Custom Java Plugin Builder**: Writes complete Java 17/21 Bukkit/Paper plugins, `plugin.yml`, and compiles them directly into `.jar` files using the local JDK compiler.
- **Crash Log & Lag Diagnostic**: Pinpoints bottlenecks in `logs/latest.log`, crash reports, and spark/timings profilers to fix low TPS and high MSPT.
- **Live Server Console & Guardrails**: Full ANSI color terminal streaming with destructive safety warnings before executing destructive commands or deleting critical files.
- **Multi-Server Workspaces**: Manage BungeeCord/Velocity proxy networks, Survival SMP, Skyblock, and Minigames servers from a single dashboard.
- **Instant Sandbox Mode**: Test and play with Vexo AI immediately in your browser with a simulated Minecraft server—even before running a real server!

---

## ⚡ Quick Start

### 1. Launch the Vexo AI Studio
Double-click **`start.bat`** (Windows) or run:

```bash
npm start
```

Open your browser to: **`http://localhost:3000`**

### 2. Connect Your API Key
1. Click **Connect API Key** in the top navigation.
2. Select your provider (**Google Gemini**, **NVIDIA NIM**, **OpenAI**, **Claude**, **DeepSeek**, **Groq**, or **Ollama**).
3. Paste your API key to automatically import live models, and click **Save Settings**.

### 3. Connect Your Minecraft Server (SFTP + RCON)
Enter your server credentials in the Connect Server modal:
- **SFTP Host & Port**: Default port `2022` or `22`.
- **Username & Password**: Your hosting provider's SFTP credentials.
- **RCON Host, Port (25575) & Password**: Your `rcon.password` from `server.properties`.

---

## 🚀 Netlify Deployment

Vexo AI is pre-configured for instant deployment on Netlify with Serverless Functions:
1. Connect your repository to [Netlify](https://app.netlify.com).
2. Netlify automatically reads `netlify.toml` (`publish = "web/public"` and `functions = "netlify/functions"`).
3. Click **Deploy Site** — your Vexo AI platform is live!

---

## 🤖 Supported AI Providers (BYOK)

- **Google Gemini**: Real-time models dynamically imported via Google AI Studio API
- **NVIDIA NIM**: Free OpenAI-compatible API featuring `nvidia/nemotron-3-super-120b-a12b`
- **OpenAI**: `gpt-4o`, `gpt-4o-mini`, `o1`, `o3-mini`
- **Anthropic Claude**: `claude-3-7-sonnet`, `claude-3-5-sonnet`
- **DeepSeek**: `deepseek-chat`, `deepseek-reasoner` (R1)
- **Groq**: `llama-3.3-70b-versatile` (free tier, ultra-low latency)
- **Ollama**: `llama3`, `deepseek-coder`, `mistral` (100% offline, free forever)
- **OpenRouter / Custom**: Any OpenAI-compatible endpoint

---

## 🔒 Security & Safety Guardrails

- **Local Storage Only**: Your API keys stay in your browser (`localStorage`).
- **Destructive Operation Prompts**: Critical operations like stopping the server or deleting files require explicit confirmation.
- **Automatic Backups**: Modifying configs automatically creates `.vexo.bak` safety copies.

---

## 📄 License

MIT License. Free for personal, commercial, and network server use.
