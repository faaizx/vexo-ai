// ==============================================================================
// Minecraft Server SFTP & RCON Connector + Built-in Sandbox Environment
// Supports: SFTP (File management), RCON (Console commands), Local Folder, & Sandbox
// ==============================================================================

const fs = require('fs');
const path = require('path');
const net = require('net');
const { execSync } = require('child_process');
const SftpClient = require('ssh2-sftp-client');

// -----------------------------------------------------------------------------
// 1. BUILT-IN SANDBOX SERVER (Zero-setup interactive simulation)
// -----------------------------------------------------------------------------
class SandboxServer {
    constructor() {
        this.status = {
            serverName: "Vexo Demo SMP (Sandbox)",
            version: "Paper 1.20.4-R0.1 (MC: 1.20.4)",
            online: true,
            players: {
                online: 6,
                max: 40,
                list: ["Alex", "Steve", "Notch", "Grian", "Mumbo", "Techno"]
            },
            tps: { "1m": 19.98, "5m": 20.00, "15m": 20.00 },
            memory: { usedMb: 1840, totalMb: 4096, maxMb: 8192 },
            loadedPlugins: 8
        };

        this.files = {
            "server.properties": `# Minecraft Server Properties - Simulated Sandbox
motd=§aVexo AI §7Demo Server §8| §ePowered by Vexo Open BYOK
server-port=25565
max-players=40
gamemode=survival
difficulty=hard
pvp=true
online-mode=true
enable-command-block=true
view-distance=10
simulation-distance=8
network-compression-threshold=256
white-list=false
spawn-protection=16
sync-chunk-writes=true
`,
            "paper-world-defaults.yml": `# Paper World Default Configuration
entities:
  spawning:
    despawn-ranges:
      ambient:
        hard: 56
        soft: 28
      monster:
        hard: 96
        soft: 32
chunks:
  auto-save-interval: 6000
  max-auto-save-chunks-per-tick: 24
`,
            "spigot.yml": `# Spigot Configuration
settings:
  save-user-cache-on-stop-only: false
  bungeecord: false
world-settings:
  default:
    entity-activation-range:
      animals: 16
      monsters: 24
      raiders: 36
      misc: 8
    merge-radius:
      item: 3.5
      exp: 4.0
`,
            "plugins/Essentials/config.yml": `# EssentialsX Configuration
ops-name-color: 'c'
nickname-prefix: '~'
max-nick-length: 15
teleport-cooldown: 3
teleport-delay: 3
spawn-delay: 0
auto-afk: 300
starting-balance: 500
currency-symbol: '$'
`,
            "plugins/LuckPerms/config.yml": `# LuckPerms Configuration
server: 'global'
storage-method: 'h2'
split-storage:
  enabled: false
default-group: 'default'
`
        };

        this.logs = [
            "[15:30:00 INFO]: Starting minecraft server version 1.20.4",
            "[15:30:01 INFO]: Loading libraries, please wait...",
            "[15:30:04 INFO]: [VexoBridge] Loading VexoBridge v1.0.0",
            "[15:30:05 INFO]: [VexoBridge] Embedded Web Bridge listening on port 25585",
            "[15:30:06 INFO]: [Essentials] Enabling Essentials v2.20.1",
            "[15:30:07 INFO]: [LuckPerms] Enabling LuckPerms v5.4.102",
            "[15:30:08 INFO]: Preparing start region for dimension minecraft:overworld",
            "[15:30:10 INFO]: Time elapsed: 6140 ms",
            "[15:30:10 INFO]: Done (9.842s)! For help, type \"help\"",
            "[15:30:15 INFO]: Player 'Alex' logged in with entity id 124 at ([world] 120.5, 68.0, -42.3)",
            "[15:30:22 INFO]: Player 'Steve' logged in with entity id 129 at ([world] 115.2, 64.0, -35.8)"
        ];
    }

    getStatus() {
        this.status.tps["1m"] = +(19.85 + Math.random() * 0.15).toFixed(2);
        this.status.memory.usedMb = Math.floor(1800 + Math.random() * 100);
        return { success: true, ...this.status };
    }

    executeCommand(cmd) {
        if (!cmd) return { success: false, output: "Empty command." };
        if (cmd.startsWith('/')) cmd = cmd.substring(1);

        const timestamp = new Date().toTimeString().split(' ')[0];
        this.logs.push(`[${timestamp} INFO]: [Console]: /${cmd}`);

        const parts = cmd.trim().split(' ');
        const root = parts[0].toLowerCase();
        let response = `[${timestamp} INFO]: Command '${cmd}' executed.`;

        if (root === 'tps') {
            response = `[${timestamp} INFO]: TPS from last 1m, 5m, 15m: §a${this.status.tps["1m"]}§r, §a20.00§r, §a20.00`;
        } else if (root === 'list') {
            response = `[${timestamp} INFO]: There are ${this.status.players.online} of a max of ${this.status.players.max} players online: ${this.status.players.list.join(', ')}`;
        } else if (root === 'say') {
            const msg = parts.slice(1).join(' ');
            response = `[${timestamp} INFO]: [Server] ${msg}`;
        } else if (root === 'whitelist') {
            response = `[${timestamp} INFO]: Whitelist has been updated.`;
        } else if (root === 'op' && parts[1]) {
            response = `[${timestamp} INFO]: Made ${parts[1]} a server operator`;
        } else if (root === 'difficulty' && parts[1]) {
            response = `[${timestamp} INFO]: The difficulty has been set to ${parts[1]}`;
        } else if (root === 'gamemode' && parts[1]) {
            response = `[${timestamp} INFO]: Set own game mode to ${parts[1]} Mode`;
        } else if (root === 'reload') {
            response = `[${timestamp} WARN]: Please consider restarting the server instead of reloading! Reloading configs...`;
        } else if (root === 'spark' || root === 'timings') {
            response = `[${timestamp} INFO]: [spark] Server health: 20.0 TPS (100%), CPU Usage: Process 14%, System 28%, Memory: 1.8GB / 4.0GB`;
        }

        this.logs.push(response);
        return { success: true, command: cmd, output: response };
    }

    getLogs(lines = 100) {
        return { success: true, lines: this.logs.slice(-lines) };
    }

    listFiles(dirPath = '') {
        const cleanPath = dirPath.replace(/^\/+/, '').replace(/\/+$/, '');
        const filesMap = new Map();

        for (const fullPath of Object.keys(this.files)) {
            if (!cleanPath) {
                const top = fullPath.split('/')[0];
                const isDir = fullPath.includes('/');
                if (!filesMap.has(top)) {
                    filesMap.set(top, {
                        name: top,
                        isDirectory: isDir,
                        size: isDir ? 0 : this.files[fullPath].length,
                        lastModified: Date.now() - 3600000
                    });
                }
            } else if (fullPath.startsWith(cleanPath + '/')) {
                const sub = fullPath.substring(cleanPath.length + 1);
                const seg = sub.split('/')[0];
                const isDir = sub.includes('/');
                if (!filesMap.has(seg)) {
                    filesMap.set(seg, {
                        name: seg,
                        isDirectory: isDir,
                        size: isDir ? 0 : (this.files[fullPath] ? this.files[fullPath].length : 0),
                        lastModified: Date.now() - 3600000
                    });
                }
            }
        }

        return {
            success: true,
            path: dirPath,
            files: Array.from(filesMap.values())
        };
    }

    readFile(filePath) {
        const clean = filePath.replace(/^\/+/, '');
        if (this.files[clean]) {
            return { success: true, path: filePath, content: this.files[clean] };
        }
        return { success: false, error: `File not found: ${filePath}` };
    }

    writeFile(filePath, content) {
        const clean = filePath.replace(/^\/+/, '');
        this.files[clean] = content;
        const ts = new Date().toTimeString().split(' ')[0];
        this.logs.push(`[${ts} INFO]: [Vexo AI] Updated server configuration file: ${clean} (${content.length} bytes)`);
        return { success: true, path: filePath, bytesWritten: content.length };
    }
}

// -----------------------------------------------------------------------------
// 2. REMOTE SERVER CLIENT (SFTP for Files + RCON for Commands)
// -----------------------------------------------------------------------------
class SftpRconClient {
    constructor(sftpConfig = {}, rconConfig = {}) {
        this.sftpConfig = {
            host: sftpConfig.host || '',
            port: parseInt(sftpConfig.port || 2022),
            username: sftpConfig.username || sftpConfig.user || '',
            password: sftpConfig.password || sftpConfig.pass || '',
            baseDir: (sftpConfig.baseDir || sftpConfig.path || '/').replace(/\\/g, '/').replace(/\/+$/, '') || '/'
        };
        this.rconConfig = {
            host: (rconConfig && rconConfig.host) ? rconConfig.host : (sftpConfig.host || '127.0.0.1'),
            port: parseInt((rconConfig && rconConfig.port) || 25575),
            password: (rconConfig && rconConfig.password) || ''
        };
    }

    // Helper: Safely executes an SFTP action with automatic connect & close
    async withSftp(action) {
        if (!this.sftpConfig.host) {
            throw new Error('SFTP Host is required.');
        }
        if (!this.sftpConfig.username) {
            throw new Error('SFTP Username is required.');
        }

        const client = new SftpClient();
        try {
            await client.connect({
                host: this.sftpConfig.host,
                port: this.sftpConfig.port,
                username: this.sftpConfig.username,
                password: this.sftpConfig.password,
                readyTimeout: 10000,
                retries: 1
            });
            return await action(client);
        } finally {
            try {
                await client.end();
            } catch (e) {
                // Ignore connection close errors
            }
        }
    }

    resolvePath(reqPath = '') {
        let clean = reqPath.replace(/\\/g, '/').replace(/^\/+/, '');
        if (!clean) return this.sftpConfig.baseDir || '/';
        const base = (this.sftpConfig.baseDir || '/').replace(/\/+$/, '');
        if (!base || base === '/') return '/' + clean;
        return `${base}/${clean}`;
    }

    // Tests SFTP connection and returns server status
    async getStatus() {
        let rootFiles = [];
        let serverPropsContent = null;

        try {
            rootFiles = await this.withSftp(async (sftp) => {
                const list = await sftp.list(this.sftpConfig.baseDir);
                const hasProps = list.some(f => f.name === 'server.properties');
                if (hasProps) {
                    try {
                        const propsPath = this.resolvePath('server.properties');
                        const buf = await sftp.get(propsPath);
                        serverPropsContent = buf.toString('utf8');
                    } catch (e) {}
                }
                return list;
            });
        } catch (err) {
            throw new Error(`SFTP Connection Failed (${this.sftpConfig.host}:${this.sftpConfig.port}): ${err.message}`);
        }

        // Parse server.properties if found
        let motd = "Minecraft Server (SFTP)";
        let maxPlayers = 20;
        let port = 25565;
        if (serverPropsContent) {
            const lines = serverPropsContent.split(/\r?\n/);
            lines.forEach(line => {
                const [k, v] = line.split('=');
                if (k && v) {
                    const key = k.trim();
                    const val = v.trim();
                    if (key === 'motd') motd = val;
                    if (key === 'max-players') maxPlayers = parseInt(val) || 20;
                    if (key === 'server-port') port = parseInt(val) || 25565;
                }
            });
        }

        // Count loaded plugins/mods
        let loadedPlugins = 0;
        const pluginsEntry = rootFiles.find(f => f.name === 'plugins' && (f.type === 'd' || f.isDirectory));
        const modsEntry = rootFiles.find(f => f.name === 'mods' && (f.type === 'd' || f.isDirectory));
        if (pluginsEntry || modsEntry) {
            try {
                await this.withSftp(async (sftp) => {
                    if (pluginsEntry) {
                        const pList = await sftp.list(this.resolvePath('plugins'));
                        loadedPlugins += pList.filter(f => f.name.endsWith('.jar')).length;
                    }
                    if (modsEntry) {
                        const mList = await sftp.list(this.resolvePath('mods'));
                        loadedPlugins += mList.filter(f => f.name.endsWith('.jar')).length;
                    }
                });
            } catch (e) {}
        }

        // Test RCON if configured
        let rconOnline = false;
        let playersOnline = 0;
        let playerNames = [];
        if (this.rconConfig.password) {
            try {
                const rconResult = await runRconCommand(this.rconConfig, 'list');
                if (rconResult && rconResult.success) {
                    rconOnline = true;
                    const match = rconResult.output.match(/There are (\d+) of a max(?:imum)? of (\d+)/i);
                    if (match) {
                        playersOnline = parseInt(match[1]);
                        maxPlayers = parseInt(match[2]);
                    }
                    const namesMatch = rconResult.output.split(':');
                    if (namesMatch.length > 1 && namesMatch[1].trim()) {
                        playerNames = namesMatch[1].split(',').map(n => n.trim()).filter(Boolean);
                    }
                }
            } catch (e) {}
        }

        return {
            success: true,
            online: true,
            serverName: this.sftpConfig.host,
            version: rconOnline ? "Online (SFTP + RCON Active)" : "Online (SFTP Active)",
            port: port,
            motd: motd,
            players: {
                online: playersOnline,
                max: maxPlayers,
                list: playerNames
            },
            tps: { "1m": 20.0, "5m": 20.0, "15m": 20.0 },
            memory: { usedMb: 2048, totalMb: 4096, maxMb: 8192 },
            loadedPlugins: loadedPlugins,
            sftpStatus: 'CONNECTED',
            rconStatus: rconOnline ? 'CONNECTED' : (this.rconConfig.password ? 'STANDBY' : 'NOT_CONFIGURED'),
            filesCount: rootFiles.length
        };
    }

    // List directory files via SFTP
    async listFiles(reqPath = '') {
        return await this.withSftp(async (sftp) => {
            const target = this.resolvePath(reqPath);
            const list = await sftp.list(target);
            const files = list.map(item => ({
                name: item.name,
                isDirectory: item.type === 'd',
                size: item.size,
                lastModified: item.modifyTime
            }));
            return {
                success: true,
                path: reqPath,
                files
            };
        });
    }

    // Read file via SFTP
    async readFile(reqPath) {
        return await this.withSftp(async (sftp) => {
            const target = this.resolvePath(reqPath);
            const buf = await sftp.get(target);
            return {
                success: true,
                path: reqPath,
                content: buf.toString('utf8')
            };
        });
    }

    // Write file via SFTP (with automatic backup)
    async writeFile(reqPath, content) {
        return await this.withSftp(async (sftp) => {
            const target = this.resolvePath(reqPath);
            const contentBuf = Buffer.from(content, 'utf8');

            try {
                const exists = await sftp.exists(target);
                if (exists) {
                    await sftp.copy(target, `${target}.vexo.bak`);
                }
            } catch (e) {}

            await sftp.put(contentBuf, target);
            return {
                success: true,
                path: reqPath,
                bytesWritten: contentBuf.length
            };
        });
    }

    // Send command to server via RCON
    async executeCommand(command) {
        if (!this.rconConfig.password) {
            return {
                success: false,
                output: "RCON is not configured for this server. Please enter RCON Host, Port (default 25575), and Password in Server Settings to execute live console commands."
            };
        }
        return await runRconCommand(this.rconConfig, command);
    }

    // Read logs from logs/latest.log via SFTP
    async getLogs(lines = 100) {
        try {
            const res = await this.readFile('logs/latest.log');
            if (res.success && res.content) {
                const all = res.content.split(/\r?\n/).filter(Boolean);
                return { success: true, lines: all.slice(-lines) };
            }
        } catch (e) {
            return { success: true, lines: [`[INFO] logs/latest.log could not be fetched via SFTP: ${e.message}`] };
        }
        return { success: true, lines: ["[INFO] No logs found."] };
    }
}

// -----------------------------------------------------------------------------
// 3. LOCAL FOLDER BRIDGE CLIENT (Direct zero-latency local disk access)
// -----------------------------------------------------------------------------
class LocalFolderBridgeClient {
    constructor(folderPath, rconConfig = null) {
        this.folderPath = path.resolve(folderPath || '.');
        this.rconConfig = rconConfig;
    }

    getStatus() {
        if (!fs.existsSync(this.folderPath)) {
            throw new Error(`Server folder does not exist: ${this.folderPath}`);
        }

        let maxPlayers = 20;
        let motd = "Minecraft Server";
        let port = 25565;

        const propPath = path.join(this.folderPath, 'server.properties');
        if (fs.existsSync(propPath)) {
            try {
                const props = fs.readFileSync(propPath, 'utf8');
                const pMap = {};
                props.split('\n').forEach(l => {
                    const [k, v] = l.split('=');
                    if (k && v) pMap[k.trim()] = v.trim();
                });
                if (pMap['max-players']) maxPlayers = parseInt(pMap['max-players']);
                if (pMap['motd']) motd = pMap['motd'];
                if (pMap['server-port']) port = parseInt(pMap['server-port']);
            } catch (e) {}
        }

        let loadedPlugins = 0;
        const pluginsDir = path.join(this.folderPath, 'plugins');
        const modsDir = path.join(this.folderPath, 'mods');
        if (fs.existsSync(pluginsDir)) {
            loadedPlugins += fs.readdirSync(pluginsDir).filter(f => f.endsWith('.jar')).length;
        }
        if (fs.existsSync(modsDir)) {
            loadedPlugins += fs.readdirSync(modsDir).filter(f => f.endsWith('.jar')).length;
        }

        return {
            success: true,
            online: true,
            serverName: path.basename(this.folderPath),
            version: "Local Server",
            port: port,
            motd: motd,
            players: { online: 0, max: maxPlayers, list: [] },
            tps: { "1m": 20.00, "5m": 20.00, "15m": 20.00 },
            memory: { usedMb: 1024, totalMb: 2048, maxMb: 4096 },
            loadedPlugins: loadedPlugins
        };
    }

    async executeCommand(command) {
        if (this.rconConfig && this.rconConfig.password) {
            return await runRconCommand(this.rconConfig, command);
        }
        return {
            success: false,
            output: "RCON is not configured for this local folder server. Please add RCON port & password in Server Settings to run live console commands."
        };
    }

    getLogs(lines = 100) {
        const logPath = path.join(this.folderPath, 'logs', 'latest.log');
        if (!fs.existsSync(logPath)) {
            return { success: true, lines: ["[INFO] logs/latest.log not found yet."] };
        }
        try {
            const raw = fs.readFileSync(logPath, 'utf8');
            const all = raw.split(/\r?\n/).filter(Boolean);
            return { success: true, lines: all.slice(-lines) };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    listFiles(reqPath = '') {
        const target = path.resolve(this.folderPath, reqPath);
        if (!target.startsWith(this.folderPath) || !fs.existsSync(target)) {
            throw new Error('Directory not found or access denied');
        }
        const items = fs.readdirSync(target);
        const files = items.map(name => {
            const full = path.join(target, name);
            const stat = fs.statSync(full);
            return {
                name,
                isDirectory: stat.isDirectory(),
                size: stat.size,
                lastModified: stat.mtimeMs
            };
        });
        return { success: true, path: reqPath, files };
    }

    readFile(reqPath) {
        const target = path.resolve(this.folderPath, reqPath);
        if (!target.startsWith(this.folderPath) || !fs.existsSync(target)) {
            throw new Error('File not found: ' + reqPath);
        }
        const content = fs.readFileSync(target, 'utf8');
        return { success: true, path: reqPath, content };
    }

    writeFile(reqPath, content) {
        const target = path.resolve(this.folderPath, reqPath);
        if (!target.startsWith(this.folderPath)) {
            throw new Error('Access denied to path: ' + reqPath);
        }
        fs.mkdirSync(path.dirname(target), { recursive: true });
        if (fs.existsSync(target)) {
            fs.copyFileSync(target, target + '.vexo.bak');
        }
        fs.writeFileSync(target, content, 'utf8');
        return { success: true, path: reqPath, bytesWritten: content.length };
    }
}

// -----------------------------------------------------------------------------
// 4. NODE.JS RCON CLIENT
// -----------------------------------------------------------------------------
function runRconCommand({ host = '127.0.0.1', port = 25575, password }, command) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(4000);

        let authenticated = false;
        let responseData = '';

        function makePacket(id, type, body) {
            const payload = Buffer.from(body + '\x00\x00', 'utf8');
            const length = 4 + 4 + payload.length;
            const buf = Buffer.alloc(4 + length);
            buf.writeInt32LE(length, 0);
            buf.writeInt32LE(id, 4);
            buf.writeInt32LE(type, 8);
            payload.copy(buf, 12);
            return buf;
        }

        socket.connect(port, host, () => {
            socket.write(makePacket(1, 3, password));
        });

        socket.on('data', (data) => {
            if (data.length < 12) return;
            const reqId = data.readInt32LE(4);

            if (!authenticated) {
                if (reqId === -1) {
                    socket.destroy();
                    return resolve({ success: false, output: "RCON Authentication failed: incorrect password" });
                }
                authenticated = true;
                socket.write(makePacket(2, 2, command));
            } else {
                const body = data.slice(12, data.length - 2).toString('utf8');
                responseData += body;
                socket.destroy();
                resolve({ success: true, command, output: responseData.trim() });
            }
        });

        socket.on('error', (err) => {
            resolve({ success: false, output: `RCON connection error (${host}:${port}): ${err.message}` });
        });

        socket.on('timeout', () => {
            socket.destroy();
            resolve({ success: false, output: `RCON connection timed out after 4 seconds.` });
        });
    });
}

// -----------------------------------------------------------------------------
// 5. JAVA PLUGIN SANDBOX COMPILER
// -----------------------------------------------------------------------------
function compileJavaPlugin({ name, packageName, mainClass, sourceCode, pluginYml, outputDir }) {
    const tempDir = path.join(__dirname, '..', 'temp_plugin_build', `${name}_${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    try {
        const packageDir = path.join(tempDir, 'src', ...packageName.split('.'));
        fs.mkdirSync(packageDir, { recursive: true });

        const javaFile = path.join(packageDir, `${mainClass}.java`);
        fs.writeFileSync(javaFile, sourceCode, 'utf-8');

        const classesDir = path.join(tempDir, 'classes');
        fs.mkdirSync(classesDir, { recursive: true });

        fs.writeFileSync(path.join(classesDir, 'plugin.yml'), pluginYml, 'utf-8');

        const libJar = path.join(__dirname, '..', '..', 'lib', 'paper-api.jar');
        const cmd = `javac -cp "${libJar}" -d "${classesDir}" "${javaFile}"`;
        execSync(cmd, { stdio: 'pipe' });

        const targetJarPath = path.join(outputDir || tempDir, `${name}.jar`);
        execSync(`jar cf "${targetJarPath}" -C "${classesDir}" .`, { stdio: 'pipe' });

        const jarBytes = fs.readFileSync(targetJarPath);
        return {
            success: true,
            jarPath: targetJarPath,
            sizeBytes: jarBytes.length,
            message: `Successfully compiled ${name}.jar (${jarBytes.length} bytes)`
        };
    } catch (e) {
        return {
            success: false,
            error: e.stderr ? e.stderr.toString() : e.message
        };
    }
}

module.exports = {
    SandboxServer,
    SftpRconClient,
    LocalFolderBridgeClient,
    runRconCommand,
    compileJavaPlugin
};
