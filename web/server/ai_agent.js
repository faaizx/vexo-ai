// ==============================================================================
// Vexo AI Agent Orchestrator - Multi-Provider BYOK Engine
// Supports: Gemini, NVIDIA NIM, OpenAI, Claude, DeepSeek, Groq, Ollama, OpenRouter, Custom
// ==============================================================================

const SYSTEM_PROMPT = `You are Vexo, an elite autonomous Minecraft Server AI Administrator and Java Plugin Developer.
You are directly connected to the user's Minecraft server using SFTP (for reading/writing configs, plugins, and logs) and RCON (for executing live in-game commands).
No bridge plugin or custom open ports are required.

Your Core Capabilities:
1. Server Configuration & Tuning:
   - Deep expertise in server.properties, spigot.yml, paper-world-defaults.yml, bukkit.yml, purpur.yml, velocity.toml.
   - You know optimal settings for TPS lag reduction, entity ticking optimization, chunk view distance vs simulation distance, and Aikar's flags.
2. Custom Java Plugin Development & Skript:
   - You can design, write, and compile production-ready Bukkit/Paper plugins in Java 17/21.
   - You write plugin.yml, event listeners, commands with tab completion, permission checks, and configuration handlers.
   - You can also write Skript (.sk) scripts for quick custom server mechanics.
3. Crash & Lag Diagnostics:
   - You analyze logs/latest.log, crash-reports/, spark profilers, and timings reports via SFTP.
   - You detect null pointer exceptions, missing dependencies, chunk corruptions, port conflicts, and runaway entity spawns.
4. Plugin Administration & Live Commands:
   - Expert in LuckPerms (ranks, permissions, meta, contexts), EssentialsX, WorldGuard, WorldEdit, Vault, GeyserMC, ProtocolLib, DecentHolograms.
   - You execute live server commands via RCON (e.g. /say, /op, /whitelist, /reload, /difficulty, /spark).

Tool Usage Protocol:
When you need to inspect files, modify configs, check logs, execute commands, or build plugins, output an explicit tool call in valid JSON using this format:
\`\`\`json:tool
{
  "tool": "read_file" | "write_file" | "list_files" | "execute_command" | "get_server_status" | "read_logs" | "create_java_plugin" | "create_skript" | "optimize_server_configs",
  "parameters": { ... }
}
\`\`\`

Available Tools:
- get_server_status: {} -> Returns live server info via SFTP / RCON.
- read_file: { "path": "server.properties" } -> Reads content of any server file via SFTP.
- write_file: { "path": "server.properties", "content": "..." } -> Writes or updates file via SFTP with automatic backup.
- list_files: { "path": "plugins" } -> Lists files and directories in given folder via SFTP.
- read_logs: { "lines": 100 } -> Fetches recent console logs from logs/latest.log via SFTP.
- execute_command: { "command": "say Hello World" } -> Dispatches command to server console via RCON.
- create_java_plugin: { "name": "DoubleJump", "package": "com.example.doublejump", "mainClass": "DoubleJumpPlugin", "sourceCode": "...", "pluginYml": "..." } -> Compiles and saves plugin jar.
- create_skript: { "fileName": "welcome.sk", "content": "..." } -> Saves skript into plugins/Skript/scripts/ via SFTP.
- optimize_server_configs: { "profile": "high-performance" | "vanilla-friendly" | "low-ram" } -> Auto-optimizes paper and server settings via SFTP.

Safety Guardrails:
If a command or action is destructive (e.g. stopping the server, reloading all plugins, wiping worlds, deleting files, or de-opping), warn the user and clearly specify what will happen.
Keep your explanations concise, professional, friendly, and gamer/developer-oriented.`;

async function callProvider({ provider, apiKey, model, baseUrl, messages }) {
    provider = (provider || 'gemini').toLowerCase();

    // Default models per provider
    const DEFAULT_MODELS = {
        gemini: 'gemini-1.5-flash',
        nvidia: 'nvidia/nemotron-3-super-120b-a12b',
        openai: 'gpt-4o',
        claude: 'claude-3-5-sonnet-latest',
        deepseek: 'deepseek-chat',
        groq: 'llama-3.3-70b-versatile',
        ollama: 'llama3:latest',
        openrouter: 'nvidia/nemotron-3-super-120b-a12b'
    };

    const targetModel = model || DEFAULT_MODELS[provider] || 'gpt-4o';

    // 1. GOOGLE GEMINI
    if (provider === 'gemini') {
        const cleanModel = targetModel.replace(/^models\//, '');
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;
        
        // Convert messages to Gemini format
        const contents = [];
        for (const msg of messages) {
            contents.push({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            });
        }

        const payload = {
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: contents,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 4096
            }
        };

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Gemini API error (${res.status}): ${err}`);
        }

        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return text;
    }

    // 2. ANTHROPIC CLAUDE
    if (provider === 'claude') {
        const url = 'https://api.anthropic.com/v1/messages';
        const anthropicMessages = messages.map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content
        }));

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: targetModel,
                max_tokens: 4096,
                system: SYSTEM_PROMPT,
                messages: anthropicMessages
            })
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Claude API error (${res.status}): ${err}`);
        }

        const data = await res.json();
        return data.content?.[0]?.text || '';
    }

    // 3. OLLAMA (Local LLM - 100% Free / Offline)
    if (provider === 'ollama') {
        const host = baseUrl || 'http://localhost:11434';
        const url = `${host.replace(/\/$/, '')}/api/chat`;

        const ollamaMessages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages
        ];

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: targetModel,
                messages: ollamaMessages,
                stream: false
            })
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Ollama error (${res.status}): ${err}`);
        }

        const data = await res.json();
        return data.message?.content || '';
    }

    // 4. OPENAI-COMPATIBLE (NVIDIA NIM, OpenAI, DeepSeek, Groq, OpenRouter, Custom)
    let endpoint = 'https://api.openai.com/v1/chat/completions';
    if (provider === 'nvidia') endpoint = 'https://integrate.api.nvidia.com/v1/chat/completions';
    if (provider === 'deepseek') endpoint = 'https://api.deepseek.com/v1/chat/completions';
    if (provider === 'groq') endpoint = 'https://api.groq.com/openai/v1/chat/completions';
    if (provider === 'openrouter') endpoint = 'https://openrouter.ai/api/v1/chat/completions';
    if (baseUrl) endpoint = `${baseUrl.replace(/\/$/, '')}/chat/completions`;

    const formattedMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
    ];

    const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: targetModel,
            messages: formattedMessages,
            temperature: 0.7
        })
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`${provider.toUpperCase()} API error (${res.status}): ${err}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
}

// Parses JSON tool calls from markdown code blocks
function extractToolCalls(aiText) {
    const toolRegex = /```json:tool\s*([\s\S]*?)\s*```/g;
    const tools = [];
    let match;
    while ((match = toolRegex.exec(aiText)) !== null) {
        try {
            const parsed = JSON.parse(match[1]);
            tools.push(parsed);
        } catch (e) {
            // invalid JSON tool block
        }
    }
    return tools;
}

module.exports = {
    SYSTEM_PROMPT,
    callProvider,
    extractToolCalls
};
