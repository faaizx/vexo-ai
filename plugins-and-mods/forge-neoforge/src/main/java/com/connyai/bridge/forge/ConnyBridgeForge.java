package com.connyai.bridge.forge;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import net.minecraftforge.common.MinecraftForge;
import net.minecraftforge.event.server.ServerStartingEvent;
import net.minecraftforge.event.server.ServerStoppingEvent;
import net.minecraftforge.eventbus.api.SubscribeEvent;
import net.minecraftforge.fml.common.Mod;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.security.SecureRandom;
import java.util.Properties;

/**
 * Conny AI Universal Bridge for Minecraft Forge 1.20.1 Dedicated Servers.
 * Annotated with @Mod("connybridge") to match mods.toml modId exactly.
 */
@Mod("connybridge")
public class ConnyBridgeForge {

    public static final String MOD_ID = "connybridge";
    private static ConnyBridgeForge instance;
    private HttpServer server;
    private int port = 25585;
    private String token;

    public ConnyBridgeForge() {
        instance = this;
        MinecraftForge.EVENT_BUS.register(this);
        initBridge();
    }

    @SubscribeEvent
    public void onServerStarting(ServerStartingEvent event) {
        System.out.println("[ConnyBridge-Forge] ServerStartingEvent received. Bridge is listening on port " + port);
    }

    @SubscribeEvent
    public void onServerStopping(ServerStoppingEvent event) {
        stopServer();
    }

    private void initBridge() {
        File cfg = new File("config/conny-forge.properties");
        Properties p = new Properties();
        if (cfg.exists()) {
            try (FileInputStream in = new FileInputStream(cfg)) {
                p.load(in);
                port = Integer.parseInt(p.getProperty("port", "25585"));
                token = p.getProperty("token", "");
            } catch (Exception ignored) {}
        }
        if (token == null || token.isEmpty()) {
            token = "conny_forge_" + Long.toHexString(new SecureRandom().nextLong());
            p.setProperty("port", String.valueOf(port));
            p.setProperty("token", token);
            cfg.getParentFile().mkdirs();
            try (FileOutputStream out = new FileOutputStream(cfg)) {
                p.store(out, "Conny Forge Configuration");
            } catch (Exception ignored) {}
        }

        try {
            startServer();
            System.out.println("=================================================");
            System.out.println("  CONNY AI FORGE BRIDGE ONLINE (Forge 1.20.1)");
            System.out.println("  Listening on port: " + port);
            System.out.println("  Auth Token:        " + token);
            System.out.println("=================================================");
        } catch (IOException e) {
            System.err.println("[ConnyBridge-Forge] Failed to initialize HTTP bridge: " + e.getMessage());
        }
    }

    private void startServer() throws IOException {
        server = HttpServer.create(new InetSocketAddress("0.0.0.0", port), 0);
        server.createContext("/api/status", exchange -> {
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            Runtime rt = Runtime.getRuntime();
            long max = rt.maxMemory() / (1024 * 1024);
            long total = rt.totalMemory() / (1024 * 1024);
            long used = total - (rt.freeMemory() / (1024 * 1024));

            String json = "{"
                    + "\"success\": true,"
                    + "\"platform\": \"Forge 1.20.1\","
                    + "\"status\": \"ONLINE\","
                    + "\"memory\": {\"usedMb\": " + used + ", \"totalMb\": " + total + ", \"maxMb\": " + max + "},"
                    + "\"tps\": {\"1m\": 20.0, \"5m\": 20.0, \"15m\": 20.0}"
                    + "}";
            exchange.sendResponseHeaders(200, json.length());
            try (OutputStream os = exchange.getResponseBody()) { os.write(json.getBytes(StandardCharsets.UTF_8)); }
        });
        server.start();
    }

    public void stopServer() {
        if (server != null) {
            server.stop(0);
            server = null;
        }
    }
}
