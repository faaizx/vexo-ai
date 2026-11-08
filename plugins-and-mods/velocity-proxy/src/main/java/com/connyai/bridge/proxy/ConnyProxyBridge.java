package com.connyai.bridge.proxy;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.*;
import java.util.concurrent.ConcurrentLinkedDeque;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

/**
 * Universal Conny Bridge for Velocity 3.x and BungeeCord proxy networks.
 * Provides network topology discovery, global player counts, proxy routing info,
 * and proxy console command execution.
 */
public class ConnyProxyBridge {

    private final String proxyType;
    private final int port;
    private final String token;
    private HttpServer server;
    private final Deque<String> logQueue = new ConcurrentLinkedDeque<>();
    private final CommandDispatcher dispatcher;

    public interface CommandDispatcher {
        boolean dispatch(String command);
        Map<String, Object> getNetworkStats();
    }

    public ConnyProxyBridge(String proxyType, int port, String token, CommandDispatcher dispatcher) {
        this.proxyType = proxyType;
        this.port = port;
        this.token = (token == null || token.isEmpty() || token.equals("auto")) ? generateToken() : token;
        this.dispatcher = dispatcher;
    }

    private static String generateToken() {
        String chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder("conny_proxy_");
        for (int i = 0; i < 20; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    public void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress("0.0.0.0", port), 0);
        server.createContext("/api/status", exchange -> {
            addCors(exchange);
            if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            if (!validateToken(exchange)) {
                sendError(exchange, 401, "Unauthorized");
                return;
            }
            Map<String, Object> stats = dispatcher != null ? dispatcher.getNetworkStats() : new HashMap<>();
            Runtime rt = Runtime.getRuntime();
            long used = (rt.totalMemory() - rt.freeMemory()) / (1024 * 1024);
            long total = rt.totalMemory() / (1024 * 1024);

            String json = "{"
                    + "\"success\": true,"
                    + "\"proxyType\": \"" + proxyType + "\","
                    + "\"status\": \"ONLINE\","
                    + "\"memory\": {\"usedMb\": " + used + ", \"totalMb\": " + total + "},"
                    + "\"network\": " + mapToJson(stats)
                    + "}";
            sendJson(exchange, 200, json);
        });

        server.createContext("/api/console", exchange -> {
            addCors(exchange);
            if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            if (!validateToken(exchange)) {
                sendError(exchange, 401, "Unauthorized");
                return;
            }
            String body = readBody(exchange);
            String cmd = extractCommand(body);
            boolean executed = dispatcher != null && dispatcher.dispatch(cmd);
            sendJson(exchange, 200, "{\"success\": " + executed + ", \"command\": \"" + escape(cmd) + "\"}");
        });

        server.start();
    }

    public void stop() {
        if (server != null) {
            server.stop(0);
        }
    }

    public String getToken() {
        return token;
    }

    public int getPort() {
        return port;
    }

    private boolean validateToken(HttpExchange exchange) {
        String auth = exchange.getRequestHeaders().getFirst("Authorization");
        if (auth != null && auth.replace("Bearer ", "").trim().equals(token)) return true;
        String xToken = exchange.getRequestHeaders().getFirst("X-Conny-Token");
        return xToken != null && xToken.trim().equals(token);
    }

    private static void addCors(HttpExchange ex) {
        ex.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        ex.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        ex.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Conny-Token");
    }

    private static void sendJson(HttpExchange ex, int code, String json) throws IOException {
        byte[] b = json.getBytes(StandardCharsets.UTF_8);
        ex.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        ex.sendResponseHeaders(code, b.length);
        try (OutputStream os = ex.getResponseBody()) { os.write(b); }
    }

    private static void sendError(HttpExchange ex, int code, String msg) throws IOException {
        sendJson(ex, code, "{\"success\":false,\"error\":\"" + escape(msg) + "\"}");
    }

    private static String escape(String s) {
        return s == null ? "" : s.replace("\"", "\\\"").replace("\n", "\\n");
    }

    private static String extractCommand(String body) {
        if (body.contains("\"command\"")) {
            int i = body.indexOf("\"command\"");
            int q1 = body.indexOf("\"", body.indexOf(":", i));
            int q2 = body.indexOf("\"", q1 + 1);
            if (q1 != -1 && q2 != -1) return body.substring(q1 + 1, q2);
        }
        return body.trim();
    }

    private static String readBody(HttpExchange ex) throws IOException {
        try (BufferedReader r = new BufferedReader(new InputStreamReader(ex.getRequestBody(), StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            String l;
            while ((l = r.readLine()) != null) sb.append(l).append("\n");
            return sb.toString().trim();
        }
    }

    private static String mapToJson(Map<String, Object> map) {
        StringBuilder sb = new StringBuilder("{");
        int i = 0;
        for (Map.Entry<String, Object> e : map.entrySet()) {
            if (i > 0) sb.append(",");
            sb.append("\"").append(escape(e.getKey())).append("\":");
            if (e.getValue() instanceof Number || e.getValue() instanceof Boolean) {
                sb.append(e.getValue());
            } else {
                sb.append("\"").append(escape(String.valueOf(e.getValue()))).append("\"");
            }
            i++;
        }
        sb.append("}");
        return sb.toString();
    }
}
