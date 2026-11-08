# 🔑 Bring Your Own Key (BYOK) Guide — Vexo AI Open Edition

With Vexo AI Open Edition, you **never pay monthly subscription fees ($15-$75/month)**. You directly connect your own API key and pay only raw token costs (fractions of a cent), or run completely **100% free offline** using local models with Ollama.

---

## ⚡ Recommended Free & Ultra-Low-Cost Providers

### 1. NVIDIA NIM (Free API Access!)
- **Why**: Standard OpenAI-compatible format with fast, high-quality Nemotron reasoning models.
- **How to get your key**:
  1. Visit [NVIDIA build](https://build.nvidia.com/).
  2. Create a free API key.
  3. Paste the key into Vexo Studio BYOK settings.
- **Recommended Model**: `nvidia/nemotron-3-super-120b-a12b` (auto-imported).

---

### 2. Google Gemini (Recommended — Generous Free Tier!)
- **Why**: Fast, highly capable at code analysis and server configs, and offers a generous free tier!
- **How to get your key**:
  1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey).
  2. Click **Create API key**.
  3. Paste the key into Vexo Studio BYOK settings to dynamically import real models.
- **Recommended Model**: `gemini-2.5-flash` or `gemini-1.5-flash`.

---

### 3. Groq (100% Free Rate-Limited Tier — Ultra Fast!)
- **Why**: Fastest inference available (hundreds of tokens per second).
- **How to get your key**:
  1. Visit [Groq Console](https://console.groq.com/keys).
  2. Click **Create API Key**.
  3. Paste into Vexo Studio.
- **Recommended Model**: `llama-3.3-70b-versatile`.

---

### 4. Ollama (100% Free, Offline, Local GPU / CPU)
- **Why**: Zero cost, zero data sent to the cloud, complete privacy.
- **Setup**:
  1. Download and install [Ollama](https://ollama.com).
  2. Run `ollama run llama3` or `ollama run deepseek-coder` in your terminal.
  3. In Vexo Studio BYOK settings, select **Ollama** and leave Base URL as `http://localhost:11434`.
  4. Models will be dynamically detected.

---

### 4. DeepSeek
- **Why**: Industry-leading coding and reasoning performance at ultra-low prices.
- **How to get your key**:
  1. Visit [DeepSeek Platform](https://platform.deepseek.com/).
  2. Generate an API key.
- **Recommended Model**: `deepseek-chat` or `deepseek-reasoner` (R1).

---

### 5. OpenAI
- **How to get your key**:
  1. Visit [OpenAI API Keys](https://platform.openai.com/api-keys).
  2. Create an API key.
- **Recommended Model**: `gpt-4o` or `gpt-4o-mini`.

---

### 6. Anthropic Claude
- **How to get your key**:
  1. Visit [Anthropic Console](https://console.anthropic.com/).
  2. Generate a key.
- **Recommended Model**: `claude-3-5-sonnet-latest` or `claude-3-7-sonnet-latest`.

---

## 🔒 Security & Privacy
- Your API keys are stored **only in your browser's local storage** (`localStorage`).
- Keys are never logged, uploaded to remote databases, or shared with third parties.
- All requests are proxied locally by your own server directly to the model provider.
