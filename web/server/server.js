// ==============================================================================
// Vexo AI (Open BYOK Edition) - Main Backend Server
// ==============================================================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { WebSocketServer } = require('ws');
const { callProvider, extractToolCalls } = require('./ai_agent');
const { SandboxServer, SftpRconClient, LocalFolderBridgeClient, compileJavaPlugin } = require('./minecraft_bridge');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Fallback to ensure req.body is always an object
app.use((req, res, next) => {
    if (!req.body) req.body = {};
    next();
});

// Global Sandbox instance
const sandbox = new SandboxServer();

// Active remote server clients cache: Map<key, SftpRconClient | LocalFolderBridgeClient>
const serverClients = new Map();

function getBridge(serverConfig) {
    if (!serverConfig || serverConfig.mode === 'sandbox') {
        return sandbox;
    }
    if (serverConfig.mode === 'local') {
        const key = `local_${serverConfig.folderPath}`;
        if (!serverClients.has(key)) {
            serverClients.set(key, new LocalFolderBridgeClient(serverConfig.folderPath, serverConfig.rcon));
        }
        return serverClients.get(key);
    }
    // Remote Server via SFTP & RCON
    const sftp = serverConfig.sftp || {};
    const rcon = serverConfig.rcon || {};
    const key = `sftp_${sftp.host}_${sftp.port}_${sftp.username || sftp.user}_${rcon.port}`;
    if (!serverClients.has(key)) {
        serverClients.set(key, new SftpRconClient(sftp, rcon));
    }
    return serverClients.get(key);
}

// -----------------------------------------------------------------------------
// Test Minecraft Server Connection Endpoint
// -----------------------------------------------------------------------------
app.post('/api/server/test-connection', async (req, res) => {
    const startTime = Date.now();
    try {
        const bridge = getBridge(req.body);
        const status = await bridge.getStatus();
        const latencyMs = Date.now() - startTime;
        res.json({
            success: true,
            latencyMs,
            serverInfo: status
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            latencyMs: Date.now() - startTime,
            error: err.message
        });
    }
});

// -----------------------------------------------------------------------------
// AI Chat Endpoint with Autonomous Multi-Step Tool Calling Loop
// -----------------------------------------------------------------------------
app.post('/api/ai/chat', async (req, res) => {
    try {
        const { provider, apiKey, model, baseUrl, messages, serverConfig } = req.body;

        if (!apiKey && provider !== 'ollama') {
            return res.status(400).json({
                error: 'Please configure your API key in the BYOK settings modal before chatting.'
            });
        }

        const bridge = getBridge(serverConfig);
        const toolExecutions = [];
        let currentMessages = [...messages];

        // Autonomous loop (up to 3 iterations for multi-step tool calls)
        let finalResponseText = '';
        for (let step = 0; step < 3; step++) {
            const aiReply = await callProvider({
                provider,
                apiKey,
                model,
                baseUrl,
                messages: currentMessages
            });

            const tools = extractToolCalls(aiReply);
            if (tools.length === 0) {
                finalResponseText = aiReply;
                break;
            }

            // Execute each tool
            let toolResultsText = '';
            for (const t of tools) {
                const toolName = t.tool;
                const params = t.parameters || {};
                let result = null;

                try {
                    if (toolName === 'get_server_status') {
                        result = await bridge.getStatus();
                    } else if (toolName === 'read_file') {
                        result = await bridge.readFile(params.path || 'server.properties');
                    } else if (toolName === 'write_file') {
                        result = await bridge.writeFile(params.path, params.content);
                    } else if (toolName === 'list_files') {
                        result = await bridge.listFiles(params.path || '');
                    } else if (toolName === 'read_logs') {
                        result = await bridge.getLogs(params.lines || 100);
                    } else if (toolName === 'execute_command') {
                        result = await bridge.executeCommand(params.command);
                    } else if (toolName === 'create_java_plugin') {
                        result = compileJavaPlugin({
                            name: params.name || 'CustomPlugin',
                            packageName: params.package || 'com.vexo.custom',
                            mainClass: params.mainClass || 'CustomPlugin',
                            sourceCode: params.sourceCode || '',
                            pluginYml: params.pluginYml || ''
                        });
                    } else if (toolName === 'create_skript') {
                        const skPath = `plugins/Skript/scripts/${params.fileName || 'custom.sk'}`;
                        result = await bridge.writeFile(skPath, params.content || '# Skript');
                    } else if (toolName === 'optimize_server_configs') {
                        // High performance optimizations
                        const optimizedProps = `motd=\u00A7aOptimized by Vexo AI\nview-distance=8\nsimulation-distance=6\nnetwork-compression-threshold=256\nsync-chunk-writes=true`;
                        await bridge.writeFile('server.properties', optimizedProps);
                        result = { success: true, message: "Applied optimized performance settings to server.properties" };
                    } else {
                        result = { error: `Unknown tool: ${toolName}` };
                    }
                } catch (err) {
                    result = { error: err.message };
                }

                toolExecutions.push({
                    tool: toolName,
                    parameters: params,
                    result: result
                });

                toolResultsText += `\n[Tool Execution: ${toolName}]\nResult:\n${JSON.stringify(result, null, 2)}\n`;
            }

            // Append assistant response and tool results to messages for the next turn
            currentMessages.push({ role: 'assistant', content: aiReply });
            currentMessages.push({
                role: 'user',
                content: `Tool Execution Results:\n${toolResultsText}\n\nPlease analyze the results and provide your final response or recommended next steps to the user.`
            });
        }

        res.json({
            success: true,
            text: finalResponseText || currentMessages[currentMessages.length - 1].content,
            toolExecutions
        });
    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// -----------------------------------------------------------------------------
// Dynamic Models Fetching Endpoint
// Supports: Gemini, NVIDIA NIM, OpenAI, Anthropic, DeepSeek, Groq, Ollama, Custom
// -----------------------------------------------------------------------------
app.post('/api/ai/models', async (req, res) => {
    try {
        let { provider, apiKey, baseUrl } = req.body;
        provider = (provider || 'gemini').toLowerCase();

        let models = [];

        if (provider === 'gemini') {
            if (!apiKey) {
                return res.status(400).json({ error: 'Please enter your Google Gemini API key to import models.' });
            }
            const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
            const apiRes = await fetch(url);
            if (!apiRes.ok) {
                const errText = await apiRes.text();
                let errMsg = `Gemini API error (${apiRes.status})`;
                try {
                    const parsed = JSON.parse(errText);
                    if (parsed.error && parsed.error.message) errMsg = parsed.error.message;
                } catch (e) {
                    errMsg += `: ${errText}`;
                }
                return res.status(apiRes.status).json({ error: errMsg });
            }
            const data = await apiRes.json();
            const list = data.models || [];
            models = list
                .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
                .map(m => {
                    const id = m.name.replace(/^models\//, '');
                    return {
                        id: id,
                        name: m.displayName || id,
                        description: m.description || ''
                    };
                });

            // Prioritize flash and pro models to the top
            models.sort((a, b) => {
                const aKey = a.id.toLowerCase();
                const bKey = b.id.toLowerCase();
                if (aKey.includes('flash') && !bKey.includes('flash')) return -1;
                if (!aKey.includes('flash') && bKey.includes('flash')) return 1;
                return bKey.localeCompare(aKey);
            });
        } else if (provider === 'nvidia') {
            const url = 'https://integrate.api.nvidia.com/v1/models';
            const headers = apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {};
            const apiRes = await fetch(url, { headers });
            if (!apiRes.ok) {
                const errText = await apiRes.text();
                return res.status(apiRes.status).json({ error: `NVIDIA API error (${apiRes.status}): ${errText}` });
            }
            const data = await apiRes.json();
            const list = data.data || [];
            models = list.map(m => ({
                id: m.id,
                name: m.id,
                description: m.owned_by ? `By ${m.owned_by}` : ''
            }));

            // Prioritize nvidia/nemotron-3-super-120b-a12b and other nemotron models
            models.sort((a, b) => {
                if (a.id === 'nvidia/nemotron-3-super-120b-a12b') return -1;
                if (b.id === 'nvidia/nemotron-3-super-120b-a12b') return 1;
                const aNem = a.id.includes('nemotron');
                const bNem = b.id.includes('nemotron');
                if (aNem && !bNem) return -1;
                if (!aNem && bNem) return 1;
                return a.id.localeCompare(b.id);
            });
        } else if (provider === 'openai') {
            if (!apiKey) return res.status(400).json({ error: 'Please enter your OpenAI API key to import models.' });
            const url = 'https://api.openai.com/v1/models';
            const apiRes = await fetch(url, {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });
            if (!apiRes.ok) {
                const errText = await apiRes.text();
                return res.status(apiRes.status).json({ error: `OpenAI error (${apiRes.status}): ${errText}` });
            }
            const data = await apiRes.json();
            const list = data.data || [];
            models = list
                .filter(m => m.id.startsWith('gpt') || m.id.startsWith('o1') || m.id.startsWith('o3') || m.id.startsWith('chatgpt'))
                .map(m => ({ id: m.id, name: m.id }));
            models.sort((a, b) => a.id.localeCompare(b.id));
        } else if (provider === 'claude') {
            if (!apiKey) return res.status(400).json({ error: 'Please enter your Claude API key to import models.' });
            try {
                const apiRes = await fetch('https://api.anthropic.com/v1/models', {
                    headers: {
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01'
                    }
                });
                if (apiRes.ok) {
                    const data = await apiRes.json();
                    models = (data.data || []).map(m => ({
                        id: m.id,
                        name: m.display_name ? `${m.display_name} (${m.id})` : m.id
                    }));
                }
            } catch (e) {}
            if (models.length === 0) {
                models = [
                    { id: 'claude-3-7-sonnet-latest', name: 'Claude 3.7 Sonnet (Latest)' },
                    { id: 'claude-3-5-sonnet-latest', name: 'Claude 3.5 Sonnet' },
                    { id: 'claude-3-5-haiku-latest', name: 'Claude 3.5 Haiku' },
                    { id: 'claude-3-opus-latest', name: 'Claude 3 Opus' }
                ];
            }
        } else if (provider === 'deepseek') {
            if (!apiKey) return res.status(400).json({ error: 'Please enter your DeepSeek API key.' });
            const apiRes = await fetch('https://api.deepseek.com/models', {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });
            if (!apiRes.ok) {
                const errText = await apiRes.text();
                return res.status(apiRes.status).json({ error: `DeepSeek error (${apiRes.status}): ${errText}` });
            }
            const data = await apiRes.json();
            models = (data.data || []).map(m => ({ id: m.id, name: m.id }));
        } else if (provider === 'groq') {
            if (!apiKey) return res.status(400).json({ error: 'Please enter your Groq API key.' });
            const apiRes = await fetch('https://api.groq.com/openai/v1/models', {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });
            if (!apiRes.ok) {
                const errText = await apiRes.text();
                return res.status(apiRes.status).json({ error: `Groq error (${apiRes.status}): ${errText}` });
            }
            const data = await apiRes.json();
            models = (data.data || []).map(m => ({ id: m.id, name: m.id }));
        } else if (provider === 'ollama') {
            const host = (baseUrl || 'http://localhost:11434').replace(/\/$/, '');
            const apiRes = await fetch(`${host}/api/tags`);
            if (!apiRes.ok) {
                const errText = await apiRes.text();
                return res.status(apiRes.status).json({ error: `Ollama connection error: ${errText}` });
            }
            const data = await apiRes.json();
            models = (data.models || []).map(m => ({ id: m.name, name: m.name }));
        } else if (provider === 'custom' || provider === 'openrouter') {
            const host = (baseUrl || 'https://openrouter.ai/api/v1').replace(/\/$/, '');
            const headers = apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {};
            const apiRes = await fetch(`${host}/models`, { headers });
            if (!apiRes.ok) {
                const errText = await apiRes.text();
                return res.status(apiRes.status).json({ error: `Custom endpoint error: ${errText}` });
            }
            const data = await apiRes.json();
            models = (data.data || []).map(m => ({ id: m.id, name: m.id }));
        }

        res.json({
            success: true,
            provider,
            count: models.length,
            models
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// -----------------------------------------------------------------------------
// Test API Key Endpoint
// -----------------------------------------------------------------------------
app.post('/api/ai/test-key', async (req, res) => {
    const startTime = Date.now();
    try {
        const { provider, apiKey, model, baseUrl } = req.body;
        const testMessages = [{ role: 'user', content: 'Ping! Respond with the word "PONG".' }];

        const reply = await callProvider({
            provider,
            apiKey,
            model,
            baseUrl,
            messages: testMessages
        });

        const latencyMs = Date.now() - startTime;
        res.json({
            success: true,
            provider,
            latencyMs,
            reply: reply.trim()
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            latencyMs: Date.now() - startTime,
            error: err.message
        });
    }
});

// -----------------------------------------------------------------------------
// Server & Console Endpoints
// -----------------------------------------------------------------------------
app.all('/api/server/status', async (req, res) => {
    try {
        const bridge = getBridge(req.body?.serverConfig);
        const status = await bridge.getStatus();
        res.json(status);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/server/command', async (req, res) => {
    try {
        const bridge = getBridge(req.body?.serverConfig);
        const result = await bridge.executeCommand(req.body?.command);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.all('/api/server/logs', async (req, res) => {
    try {
        const bridge = getBridge(req.body?.serverConfig);
        const logs = await bridge.getLogs(req.body?.lines || 100);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.all('/api/server/files/list', async (req, res) => {
    try {
        const bridge = getBridge(req.body?.serverConfig);
        const list = await bridge.listFiles(req.body?.path || '');
        res.json(list);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.all('/api/server/files/read', async (req, res) => {
    try {
        const bridge = getBridge(req.body?.serverConfig);
        const data = await bridge.readFile(req.body?.path || 'server.properties');
        res.json(data);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/server/files/write', async (req, res) => {
    try {
        const bridge = getBridge(req.body?.serverConfig);
        const result = await bridge.writeFile(req.body?.path, req.body?.content);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/builder/compile-plugin', (req, res) => {
    try {
        const { name, packageName, mainClass, sourceCode, pluginYml } = req.body;
        const result = compileJavaPlugin({
            name,
            packageName,
            mainClass,
            sourceCode,
            pluginYml
        });
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// WebSocket for real-time console streaming
wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ type: 'connected', message: 'Vexo AI Live Stream Connected' }));

    const interval = setInterval(() => {
        if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({
                type: 'metrics',
                data: sandbox.getStatus()
            }));
        }
    }, 3000);

    ws.on('close', () => clearInterval(interval));
});

if (require.main === module) {
    server.listen(PORT, () => {
        console.log('================================================================');
        console.log('  VEXO AI (OPEN BYOK EDITION) - WEB PLATFORM ONLINE');
        console.log(`  Access Web Studio at: http://localhost:${PORT}`);
        console.log('  Supports: OpenAI, Claude, Gemini, DeepSeek, Groq, Ollama');
        console.log('================================================================');
    });
}

module.exports = app;
