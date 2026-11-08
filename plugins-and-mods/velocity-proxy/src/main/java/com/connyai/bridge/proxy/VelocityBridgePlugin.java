package com.connyai.bridge.proxy;

import com.google.inject.Inject;
import com.velocitypowered.api.event.Subscribe;
import com.velocitypowered.api.event.proxy.ProxyInitializeEvent;
import com.velocitypowered.api.event.proxy.ProxyShutdownEvent;
import com.velocitypowered.api.plugin.Plugin;
import com.velocitypowered.api.proxy.ProxyServer;
import com.velocitypowered.api.proxy.server.RegisteredServer;
import org.slf4j.Logger;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Plugin(
        id = "connybridge",
        name = "ConnyBridgeVelocity",
        version = "1.0.0",
        description = "Conny AI Proxy Bridge for Velocity",
        authors = {"Conny AI Open Edition"}
)
public class VelocityBridgePlugin {

    private final ProxyServer server;
    private final Logger logger;
    private ConnyProxyBridge bridge;

    @Inject
    public VelocityBridgePlugin(ProxyServer server, Logger logger) {
        this.server = server;
        this.logger = logger;
    }

    @Subscribe
    public void onProxyInitialization(ProxyInitializeEvent event) {
        logger.info("Initializing Conny AI Velocity Bridge...");
        int port = 25586;
        String token = "auto";

        bridge = new ConnyProxyBridge("Velocity", port, token, new ConnyProxyBridge.CommandDispatcher() {
            @Override
            public boolean dispatch(String command) {
                return server.getCommandManager().executeImmediatelyAsync(server.getConsoleCommandSource(), command).join();
            }

            @Override
            public Map<String, Object> getNetworkStats() {
                Map<String, Object> stats = new HashMap<>();
                stats.put("totalPlayers", server.getPlayerCount());
                stats.put("registeredServersCount", server.getAllServers().size());
                return stats;
            }
        });

        try {
            bridge.start();
            logger.info("Conny Velocity Bridge active on port {} with token: {}", bridge.getPort(), bridge.getToken());
        } catch (IOException e) {
            logger.error("Failed to start Conny Velocity Bridge: {}", e.getMessage());
        }
    }

    @Subscribe
    public void onProxyShutdown(ProxyShutdownEvent event) {
        if (bridge != null) {
            bridge.stop();
        }
    }
}
