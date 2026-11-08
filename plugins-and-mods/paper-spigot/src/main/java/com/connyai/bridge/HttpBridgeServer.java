package com.connyai.bridge;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import org.bukkit.Bukkit;
import org.bukkit.plugin.Plugin;

import java.io.*;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.*;

public class HttpBridgeServer {

    private final ConnyBridgePlugin plugin;
    private final int port;
    private HttpServer server;
    private final ExecutorService threadPool = Executors.newCachedThreadPool();

    public HttpBridgeServer(ConnyBridgePlugin plugin, int port) {
        this.plugin = plugin;
        this.port = port;
    }

    public void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress("0.0.0.0", port), 0);
        server.setExecutor(threadPool);

        // Register endpoints
        server.createContext("/api/status", new StatusHandler());
        server.createContext("/api/console", new ConsoleHandler());
        server.createContext("/api/logs", new LogsHandler());
        server.createContext("/api/files/list", new FileListHandler());
        server.createContext("/api/files/read", new FileReadHandler());
        server.createContext("/api/files/write", new FileWriteHandler());
        server.createContext("/api/plugins/list", new PluginListHandler());

        server.start();
    }

    public void stop() {
        if (server != null) {
            server.stop(1);
            server = null;
        }
        threadPool.shutdownNow();
    }

    private boolean checkAuth(HttpExchange exchange) {
        String expectedToken = plugin.getAuthToken();
        if (expectedToken == null || expectedToken.isEmpty()) return true;

        String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
        if (authHeader != null) {
            if (authHeader.startsWith("Bearer ")) {
                authHeader = authHeader.substring(7).trim();
            }
            if (authHeader.equals(expectedToken)) return true;
        }

        String connyToken = exchange.getRequestHeaders().getFirst("X-Conny-Token");
        if (connyToken != null && connyToken.trim().equals(expectedToken)) {
            return true;
        }

        // Check query param
        String query = exchange.getRequestURI().getQuery();
        if (query != null && query.contains("token=" + expectedToken)) {
            return true;
        }

        return false;
    }

    private void handleCors(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Conny-Token");
    }

    private void sendJson(HttpExchange exchange, int statusCode, String jsonResponse) throws IOException {
        handleCors(exchange);
        byte[] bytes = jsonResponse.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private void sendError(HttpExchange exchange, int statusCode, String message) throws IOException {
        String json = "{\"error\": \"" + escapeJson(message) + "\", \"success\": false}";
        sendJson(exchange, statusCode, json);
    }

    private static String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\b", "\\b")
                .replace("\f", "\\f")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    private static Map<String, String> parseQueryParams(String query) {
        Map<String, String> map = new HashMap<>();
        if (query == null || query.isEmpty()) return map;
        for (String param : query.split("&")) {
            String[] pair = param.split("=", 2);
            if (pair.length > 0) {
                try {
                    String key = URLDecoder.decode(pair[0], StandardCharsets.UTF_8.name());
                    String value = pair.length > 1 ? URLDecoder.decode(pair[1], StandardCharsets.UTF_8.name()) : "";
                    map.put(key, value);
                } catch (Exception ignored) {}
            }
        }
        return map;
    }

    private static String readBody(HttpExchange exchange) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }
            return sb.toString().trim();
        }
    }

    private File getSafeServerFile(String relativePath) {
        if (relativePath == null || relativePath.isEmpty()) {
            relativePath = ".";
        }
        File serverDir = new File(".").getAbsoluteFile();
        File targetFile = new File(serverDir, relativePath).getAbsoluteFile();
        try {
            String serverPath = serverDir.getCanonicalPath();
            String targetPath = targetFile.getCanonicalPath();
            if (!targetPath.startsWith(serverPath)) {
                return null; // path traversal attempt
            }
            return targetFile;
        } catch (IOException e) {
            return null;
        }
    }

    // Handlers
    private class StatusHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            handleCors(exchange);
            if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            if (!checkAuth(exchange)) {
                sendError(exchange, 401, "Unauthorized: Invalid or missing X-Conny-Token");
                return;
            }

            Runtime runtime = Runtime.getRuntime();
            long maxMem = runtime.maxMemory() / (1024 * 1024);
            long totalMem = runtime.totalMemory() / (1024 * 1024);
            long freeMem = runtime.freeMemory() / (1024 * 1024);
            long usedMem = totalMem - freeMem;

            double[] tps = new double[]{20.0, 20.0, 20.0};
            try {
                tps = Bukkit.getTPS();
            } catch (Throwable ignored) {}

            int onlinePlayers = Bukkit.getOnlinePlayers().size();
            int maxPlayers = Bukkit.getMaxPlayers();
            String mcVersion = Bukkit.getVersion();
            String serverName = Bukkit.getServer().getName();

            StringBuilder sb = new StringBuilder();
            sb.append("{");
            sb.append("\"success\":true,");
            sb.append("\"online\":true,");
            sb.append("\"serverName\":\"").append(escapeJson(serverName)).append("\",");
            sb.append("\"version\":\"").append(escapeJson(mcVersion)).append("\",");
            sb.append("\"players\":{");
            sb.append("\"online\":").append(onlinePlayers).append(",");
            sb.append("\"max\":").append(maxPlayers);
            sb.append("},");
            sb.append("\"tps\":{");
            sb.append("\"1m\":").append(String.format(Locale.US, "%.2f", Math.min(20.0, tps[0]))).append(",");
            sb.append("\"5m\":").append(String.format(Locale.US, "%.2f", Math.min(20.0, tps[1]))).append(",");
            sb.append("\"15m\":").append(String.format(Locale.US, "%.2f", Math.min(20.0, tps[2])));
            sb.append("},");
            sb.append("\"memory\":{");
            sb.append("\"usedMb\":").append(usedMem).append(",");
            sb.append("\"totalMb\":").append(totalMem).append(",");
            sb.append("\"maxMb\":").append(maxMem);
            sb.append("},");
            sb.append("\"loadedPlugins\":").append(Bukkit.getPluginManager().getPlugins().length);
            sb.append("}");

            sendJson(exchange, 200, sb.toString());
        }
    }

    private class ConsoleHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            handleCors(exchange);
            if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            if (!checkAuth(exchange)) {
                sendError(exchange, 401, "Unauthorized");
                return;
            }
            if (!exchange.getRequestMethod().equalsIgnoreCase("POST")) {
                sendError(exchange, 405, "Method Not Allowed. Use POST.");
                return;
            }

            String body = readBody(exchange);
            String command = "";
            if (body.startsWith("{") && body.contains("\"command\"")) {
                int start = body.indexOf("\"command\"");
                int colon = body.indexOf(":", start);
                int quote1 = body.indexOf("\"", colon);
                int quote2 = body.indexOf("\"", quote1 + 1);
                if (quote1 != -1 && quote2 != -1) {
                    command = body.substring(quote1 + 1, quote2);
                }
            } else {
                command = body;
            }

            if (command.startsWith("/")) {
                command = command.substring(1);
            }

            final String cmd = command;
            Future<Boolean> future = Bukkit.getScheduler().callSyncMethod(plugin, () -> Bukkit.dispatchCommand(Bukkit.getConsoleSender(), cmd));

            boolean success = false;
            try {
                success = future.get(5, TimeUnit.SECONDS);
            } catch (Exception e) {
                // error dispatching
            }

            String json = "{\"success\": " + success + ", \"command\": \"" + escapeJson(cmd) + "\"}";
            sendJson(exchange, 200, json);
        }
    }

    private class LogsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            handleCors(exchange);
            if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            if (!checkAuth(exchange)) {
                sendError(exchange, 401, "Unauthorized");
                return;
            }

            Map<String, String> params = parseQueryParams(exchange.getRequestURI().getQuery());
            int lines = 100;
            if (params.containsKey("lines")) {
                try { lines = Integer.parseInt(params.get("lines")); } catch (Exception ignored) {}
            }

            List<String> logList = plugin.getLogCapture().getRecentLogs(lines);
            if (logList.isEmpty()) {
                logList = ConsoleLogCapture.readLatestLogFile(lines);
            }

            StringBuilder sb = new StringBuilder();
            sb.append("{\"success\":true,\"lines\":[");
            for (int i = 0; i < logList.size(); i++) {
                sb.append("\"").append(escapeJson(logList.get(i))).append("\"");
                if (i < logList.size() - 1) sb.append(",");
            }
            sb.append("]}");

            sendJson(exchange, 200, sb.toString());
        }
    }

    private class FileListHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            handleCors(exchange);
            if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            if (!checkAuth(exchange)) {
                sendError(exchange, 401, "Unauthorized");
                return;
            }

            Map<String, String> params = parseQueryParams(exchange.getRequestURI().getQuery());
            String path = params.getOrDefault("path", "");
            File targetDir = getSafeServerFile(path);
            if (targetDir == null || !targetDir.exists()) {
                sendError(exchange, 404, "Directory not found or access denied.");
                return;
            }

            File[] files = targetDir.listFiles();
            if (files == null) files = new File[0];

            StringBuilder sb = new StringBuilder();
            sb.append("{\"success\":true,\"path\":\"").append(escapeJson(path)).append("\",\"files\":[");
            for (int i = 0; i < files.length; i++) {
                File f = files[i];
                sb.append("{");
                sb.append("\"name\":\"").append(escapeJson(f.getName())).append("\",");
                sb.append("\"isDirectory\":").append(f.isDirectory()).append(",");
                sb.append("\"size\":").append(f.length()).append(",");
                sb.append("\"lastModified\":").append(f.lastModified());
                sb.append("}");
                if (i < files.length - 1) sb.append(",");
            }
            sb.append("]}");

            sendJson(exchange, 200, sb.toString());
        }
    }

    private class FileReadHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            handleCors(exchange);
            if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            if (!checkAuth(exchange)) {
                sendError(exchange, 401, "Unauthorized");
                return;
            }

            Map<String, String> params = parseQueryParams(exchange.getRequestURI().getQuery());
            String path = params.get("path");
            if (path == null) {
                sendError(exchange, 400, "Missing 'path' parameter");
                return;
            }

            File file = getSafeServerFile(path);
            if (file == null || !file.exists() || !file.isFile()) {
                sendError(exchange, 404, "File not found or inaccessible: " + path);
                return;
            }

            if (file.length() > 5 * 1024 * 1024) { // 5MB limit
                sendError(exchange, 413, "File too large to read via web bridge");
                return;
            }

            String content = new String(Files.readAllBytes(file.toPath()), StandardCharsets.UTF_8);
            String json = "{\"success\":true,\"path\":\"" + escapeJson(path) + "\",\"content\":\"" + escapeJson(content) + "\"}";
            sendJson(exchange, 200, json);
        }
    }

    private class FileWriteHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            handleCors(exchange);
            if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            if (!checkAuth(exchange)) {
                sendError(exchange, 401, "Unauthorized");
                return;
            }
            if (!exchange.getRequestMethod().equalsIgnoreCase("POST")) {
                sendError(exchange, 405, "Method Not Allowed. Use POST.");
                return;
            }

            String body = readBody(exchange);
            // Parse path and content from json
            String path = null;
            String content = null;

            int pathIdx = body.indexOf("\"path\"");
            if (pathIdx != -1) {
                int c = body.indexOf(":", pathIdx);
                int q1 = body.indexOf("\"", c);
                int q2 = body.indexOf("\"", q1 + 1);
                path = body.substring(q1 + 1, q2);
            }

            int contentIdx = body.indexOf("\"content\"");
            if (contentIdx != -1) {
                int c = body.indexOf(":", contentIdx);
                int q1 = body.indexOf("\"", c);
                // Find closing quote that is not escaped
                int q2 = q1 + 1;
                while (q2 < body.length()) {
                    if (body.charAt(q2) == '"' && body.charAt(q2 - 1) != '\\') {
                        break;
                    }
                    q2++;
                }
                if (q2 < body.length()) {
                    content = body.substring(q1 + 1, q2)
                            .replace("\\n", "\n")
                            .replace("\\r", "\r")
                            .replace("\\t", "\t")
                            .replace("\\\"", "\"")
                            .replace("\\\\", "\\");
                }
            }

            if (path == null || content == null) {
                sendError(exchange, 400, "Missing 'path' or 'content' in JSON body");
                return;
            }

            File file = getSafeServerFile(path);
            if (file == null) {
                sendError(exchange, 403, "Access denied to path: " + path);
                return;
            }

            if (file.getParentFile() != null) {
                file.getParentFile().mkdirs();
            }

            // Create backup if modifying existing config
            if (file.exists() && (path.endsWith(".yml") || path.endsWith(".properties") || path.endsWith(".json"))) {
                File backup = new File(file.getParentFile(), file.getName() + ".conny.bak");
                Files.copy(file.toPath(), backup.toPath(), java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            }

            Files.write(file.toPath(), content.getBytes(StandardCharsets.UTF_8));
            sendJson(exchange, 200, "{\"success\":true,\"path\":\"" + escapeJson(path) + "\",\"bytesWritten\":" + content.length() + "}");
        }
    }

    private class PluginListHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            handleCors(exchange);
            if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }
            if (!checkAuth(exchange)) {
                sendError(exchange, 401, "Unauthorized");
                return;
            }

            Plugin[] plugins = Bukkit.getPluginManager().getPlugins();
            StringBuilder sb = new StringBuilder();
            sb.append("{\"success\":true,\"plugins\":[");
            for (int i = 0; i < plugins.length; i++) {
                Plugin p = plugins[i];
                sb.append("{");
                sb.append("\"name\":\"").append(escapeJson(p.getName())).append("\",");
                sb.append("\"version\":\"").append(escapeJson(p.getDescription().getVersion())).append("\",");
                sb.append("\"enabled\":").append(p.isEnabled()).append(",");
                sb.append("\"authors\":[\"").append(escapeJson(String.join("\", \"", p.getDescription().getAuthors()))).append("\"]");
                sb.append("}");
                if (i < plugins.length - 1) sb.append(",");
            }
            sb.append("]}");

            sendJson(exchange, 200, sb.toString());
        }
    }
}
