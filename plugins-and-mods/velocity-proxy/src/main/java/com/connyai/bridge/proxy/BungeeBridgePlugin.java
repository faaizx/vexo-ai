package com.connyai.bridge.proxy;

import net.md_5.bungee.api.ProxyServer;
import net.md_5.bungee.api.plugin.Plugin;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class BungeeBridgePlugin extends Plugin {

    private ConnyProxyBridge bridge;

    @Override
    public void onEnable() {
        getLogger().info("Initializing Conny AI BungeeCord Bridge...");
        int port = 25586;
        String token = "auto";

        bridge = new ConnyProxyBridge("BungeeCord", port, token, new ConnyProxyBridge.CommandDispatcher() {
            @Override
            public boolean dispatch(String command) {
                return ProxyServer.getInstance().getPluginManager().dispatchCommand(ProxyServer.getInstance().getConsole(), command);
            }

            @Override
            public Map<String, Object> getNetworkStats() {
                Map<String, Object> stats = new HashMap<>();
                stats.put("totalPlayers", ProxyServer.getInstance().getOnlineCount());
                stats.put("registeredServersCount", ProxyServer.getInstance().getServers().size());
                return stats;
            }
        });

        try {
            bridge.start();
            getLogger().info("Conny BungeeCord Bridge listening on port " + bridge.getPort() + " (Token: " + bridge.getToken() + ")");
        } catch (IOException e) {
            getLogger().severe("Could not launch BungeeCord Bridge: " + e.getMessage());
        }
    }

    @Override
    public void onDisable() {
        if (bridge != null) {
            bridge.stop();
        }
    }
}
