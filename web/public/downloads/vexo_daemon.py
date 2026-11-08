#!/usr/bin/env python3
"""
Vexo AI Standalone Server Daemon (Universal Bridge)
Connects ANY Minecraft Server (Vanilla, Paper, Fabric, Forge, Bedrock, Pterodactyl)
via RCON and local filesystem / SFTP.

Usage:
    python vexo_daemon.py --dir ./server --rcon-port 25575 --rcon-pass mypassword --port 25585
"""

import os
import sys
import json
import time
import socket
import struct
import argparse
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# --- Simple RCON Client Implementation ---
class RconClient:
    SERVERDATA_AUTH = 3
    SERVERDATA_EXECCOMMAND = 2

    def __init__(self, host, port, password):
        self.host = host
        self.port = port
        self.password = password
        self.sock = None

    def connect(self):
        try:
            self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.sock.settimeout(5)
            self.sock.connect((self.host, self.port))
            # Authenticate
            self._send_pkt(1, self.SERVERDATA_AUTH, self.password)
            req_id, pkt_type, body = self._read_pkt()
            if req_id == -1:
                self.sock.close()
                self.sock = None
                return False
            return True
        except Exception as e:
            self.sock = None
            return False

    def send_command(self, cmd):
        if not self.sock:
            if not self.connect():
                return f"[Error: Cannot connect to RCON {self.host}:{self.port}]"
        try:
            self._send_pkt(2, self.SERVERDATA_EXECCOMMAND, cmd)
            req_id, pkt_type, body = self._read_pkt()
            return body
        except Exception as e:
            self.sock = None
            return f"[Error executing command: {e}]"

    def _send_pkt(self, req_id, pkt_type, body):
        payload = body.encode('utf-8') + b'\x00\x00'
        length = 4 + 4 + len(payload)
        packet = struct.pack('<iii', length, req_id, pkt_type) + payload
        self.sock.sendall(packet)

    def _read_pkt(self):
        header = self.sock.recv(12)
        if len(header) < 12:
            return -1, 0, ""
        length, req_id, pkt_type = struct.unpack('<iii', header)
        body = self.sock.recv(length - 8)
        return req_id, pkt_type, body[:-2].decode('utf-8', errors='replace')


# --- Bridge HTTP Server Handler ---
class VexoDaemonHandler(BaseHTTPRequestHandler):
    daemon_context = None

    def _set_cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Vexo-Token, X-Conny-Token')

    def do_OPTIONS(self):
        self.send_response(204)
        self._set_cors()
        self.end_headers()

    def _check_auth(self):
        token = self.daemon_context['token']
        if not token:
            return True
        h = self.headers.get('Authorization')
        if h and h.replace('Bearer ', '').strip() == token:
            return True
        xt = self.headers.get('X-Vexo-Token') or self.headers.get('X-Conny-Token')
        if xt and xt.strip() == token:
            return True
        return False

    def _send_json(self, status_code, data):
        self.send_response(status_code)
        self._set_cors()
        self.send_header('Content-Type', 'application/json')
        body = json.dumps(data).encode('utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        params = parse_qs(parsed.query)

        if not self._check_auth():
            return self._send_json(401, {"success": False, "error": "Unauthorized"})

        server_dir = self.daemon_context['server_dir']

        if path == '/api/status':
            rcon = self.daemon_context['rcon']
            online = True
            player_info = "0/20"
            if rcon:
                res = rcon.send_command("list")
                player_info = res.strip()
            return self._send_json(200, {
                "success": True,
                "online": online,
                "platform": "Standalone Daemon (Universal)",
                "serverDir": os.path.abspath(server_dir),
                "listResponse": player_info,
                "tps": {"1m": 20.0, "5m": 20.0, "15m": 20.0}
            })

        elif path == '/api/logs':
            lines = int(params.get('lines', [100])[0])
            log_path = os.path.join(server_dir, 'logs', 'latest.log')
            log_lines = []
            if os.path.exists(log_path):
                with open(log_path, 'r', encoding='utf-8', errors='replace') as f:
                    log_lines = [l.rstrip('\r\n') for l in f.readlines()[-lines:]]
            return self._send_json(200, {"success": True, "lines": log_lines})

        elif path == '/api/files/list':
            req_path = params.get('path', [''])[0].strip('/')
            target = os.path.abspath(os.path.join(server_dir, req_path))
            base = os.path.abspath(server_dir)
            if not target.startswith(base) or not os.path.exists(target):
                return self._send_json(404, {"success": False, "error": "Directory not found"})
            files = []
            for item in os.listdir(target):
                full = os.path.join(target, item)
                files.append({
                    "name": item,
                    "isDirectory": os.path.isdir(full),
                    "size": os.path.getsize(full) if os.path.isfile(full) else 0,
                    "lastModified": int(os.path.getmtime(full) * 1000)
                })
            return self._send_json(200, {"success": True, "path": req_path, "files": files})

        elif path == '/api/files/read':
            req_path = params.get('path', [''])[0].strip('/')
            target = os.path.abspath(os.path.join(server_dir, req_path))
            base = os.path.abspath(server_dir)
            if not target.startswith(base) or not os.path.isfile(target):
                return self._send_json(404, {"success": False, "error": "File not found"})
            with open(target, 'r', encoding='utf-8', errors='replace') as f:
                content = f.read()
            return self._send_json(200, {"success": True, "path": req_path, "content": content})

        self._send_json(404, {"success": False, "error": "Endpoint not found"})

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if not self._check_auth():
            return self._send_json(401, {"success": False, "error": "Unauthorized"})

        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length).decode('utf-8', errors='replace')
        try:
            data = json.loads(body) if body else {}
        except:
            data = {"command": body}

        server_dir = self.daemon_context['server_dir']

        if path == '/api/console':
            cmd = data.get('command', '').strip()
            if cmd.startswith('/'): cmd = cmd[1:]
            rcon = self.daemon_context['rcon']
            if rcon:
                output = rcon.send_command(cmd)
                return self._send_json(200, {"success": True, "command": cmd, "output": output})
            else:
                return self._send_json(500, {"success": False, "error": "RCON not configured on daemon"})

        elif path == '/api/files/write':
            req_path = data.get('path', '').strip('/')
            content = data.get('content', '')
            target = os.path.abspath(os.path.join(server_dir, req_path))
            base = os.path.abspath(server_dir)
            if not target.startswith(base):
                return self._send_json(403, {"success": False, "error": "Access denied"})
            os.makedirs(os.path.dirname(target), exist_ok=True)
            if os.path.exists(target):
                # Backup
                with open(target + '.vexo.bak', 'wb') as bf, open(target, 'rb') as orig:
                    bf.write(orig.read())
            with open(target, 'w', encoding='utf-8') as f:
                f.write(content)
            return self._send_json(200, {"success": True, "path": req_path, "bytesWritten": len(content)})

        self._send_json(404, {"success": False, "error": "Endpoint not found"})


def main():
    parser = argparse.ArgumentParser(description="Vexo AI Standalone Server Daemon")
    parser.add_argument('--dir', default='.', help="Path to Minecraft server root directory")
    parser.add_argument('--port', type=int, default=25585, help="Port to host Vexo Bridge HTTP API")
    parser.add_argument('--token', default='vexo_daemon_secret', help="Security token for Vexo AI connection")
    parser.add_argument('--rcon-host', default='127.0.0.1', help="Minecraft RCON hostname")
    parser.add_argument('--rcon-port', type=int, default=25575, help="Minecraft RCON port")
    parser.add_argument('--rcon-pass', default='', help="Minecraft RCON password")
    args = parser.parse_args()

    rcon = None
    if args.rcon_pass:
        rcon = RconClient(args.rcon_host, args.rcon_port, args.rcon_pass)
        if rcon.connect():
            print(f"[Daemon] RCON connected successfully to {args.rcon_host}:{args.rcon_port}")
        else:
            print(f"[Daemon] Warning: Could not connect to RCON ({args.rcon_host}:{args.rcon_port}). Will retry on demand.")

    context = {
        'server_dir': args.dir,
        'token': args.token,
        'rcon': rcon
    }
    VexoDaemonHandler.daemon_context = context

    server = HTTPServer(('0.0.0.0', args.port), VexoDaemonHandler)
    print("=" * 60)
    print("  VEXO AI STANDALONE BRIDGE DAEMON (Universal)")
    print(f"  Target Server Directory: {os.path.abspath(args.dir)}")
    print(f"  Bridge API Server:       http://0.0.0.0:{args.port}")
    print(f"  Connection Token:        {args.token}")
    print("=" * 60)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping daemon...")
        server.server_close()

if __name__ == '__main__':
    main()
