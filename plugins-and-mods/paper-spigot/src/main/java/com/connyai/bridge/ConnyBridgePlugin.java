package com.connyai.bridge;

import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.bukkit.plugin.Plugin;
import org.bukkit.plugin.java.JavaPlugin;

import java.io.File;
import java.io.IOException;
import java.security.SecureRandom;
import java.util.*;

public class ConnyBridgePlugin extends JavaPlugin implements CommandExecutor {

    private static ConnyBridgePlugin instance;
    private HttpBridgeServer bridgeServer;
    private String authToken;
    private int bridgePort;
    private ConsoleLogCapture logCapture;

    @Override
    public void onEnable() {
        instance = this;
        saveDefaultConfig();
        loadConfiguration();

        // Setup log capture
        logCapture = new ConsoleLogCapture();
        logCapture.start();

        // Start HTTP API Server
        try {
            bridgeServer = new HttpBridgeServer(this, bridgePort);
            bridgeServer.start();
            getLogger().info("=================================================");
            getLogger().info("  CONNY AI BRIDGE ONLINE (Open Edition)");
            getLogger().info("  Listening on: http://0.0.0.0:" + bridgePort);
            getLogger().info("  Auth Token:   " + authToken);
            getLogger().info("  Use this token to link your server in Conny AI Studio!");
            getLogger().info("=================================================");
        } catch (IOException e) {
            getLogger().severe("Failed to start Conny HTTP Bridge Server: " + e.getMessage());
            e.printStackTrace();
        }

        // Register command
        if (getCommand("conny") != null) {
            getCommand("conny").setExecutor(this);
        }
    }

    @Override
    public void onDisable() {
        if (bridgeServer != null) {
            bridgeServer.stop();
            bridgeServer = null;
        }
        if (logCapture != null) {
            logCapture.stop();
            logCapture = null;
        }
        getLogger().info("Conny AI Bridge disabled.");
    }

    public void loadConfiguration() {
        reloadConfig();
        this.bridgePort = getConfig().getInt("port", 25585);
        this.authToken = getConfig().getString("token", "");

        if (this.authToken == null || this.authToken.trim().isEmpty() || this.authToken.equals("auto")) {
            this.authToken = generateSecureToken();
            getConfig().set("token", this.authToken);
            saveConfig();
        }
    }

    private String generateSecureToken() {
        String chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder("conny_");
        for (int i = 0; i < 24; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (args.length == 0 || args[0].equalsIgnoreCase("help")) {
            sender.sendMessage(ChatColor.DARK_AQUA + "--- Conny AI Bridge ---");
            sender.sendMessage(ChatColor.AQUA + "/conny token " + ChatColor.GRAY + "- Display server link token");
            sender.sendMessage(ChatColor.AQUA + "/conny status " + ChatColor.GRAY + "- Check bridge server status");
            sender.sendMessage(ChatColor.AQUA + "/conny reload " + ChatColor.GRAY + "- Reload bridge config");
            sender.sendMessage(ChatColor.AQUA + "/conny link <new-token> " + ChatColor.GRAY + "- Set custom link token");
            return true;
        }

        if (args[0].equalsIgnoreCase("token")) {
            sender.sendMessage(ChatColor.GREEN + "[Conny] Server Auth Token: " + ChatColor.YELLOW + authToken);
            sender.sendMessage(ChatColor.GRAY + "Port: " + bridgePort + " (Enter this into Conny AI Studio)");
            return true;
        }

        if (args[0].equalsIgnoreCase("status")) {
            sender.sendMessage(ChatColor.GREEN + "[Conny] Bridge Status: " + (bridgeServer != null ? ChatColor.DARK_GREEN + "RUNNING (Port " + bridgePort + ")" : ChatColor.RED + "STOPPED"));
            sender.sendMessage(ChatColor.GRAY + "Online Players: " + Bukkit.getOnlinePlayers().size() + "/" + Bukkit.getMaxPlayers());
            return true;
        }

        if (args[0].equalsIgnoreCase("reload")) {
            loadConfiguration();
            sender.sendMessage(ChatColor.GREEN + "[Conny] Configuration reloaded successfully.");
            return true;
        }

        if (args[0].equalsIgnoreCase("link") && args.length > 1) {
            this.authToken = args[1];
            getConfig().set("token", this.authToken);
            saveConfig();
            sender.sendMessage(ChatColor.GREEN + "[Conny] Updated auth token to: " + ChatColor.YELLOW + this.authToken);
            return true;
        }

        sender.sendMessage(ChatColor.RED + "Unknown command. Use /conny help");
        return true;
    }

    public static ConnyBridgePlugin getInstance() {
        return instance;
    }

    public String getAuthToken() {
        return authToken;
    }

    public int getBridgePort() {
        return bridgePort;
    }

    public ConsoleLogCapture getLogCapture() {
        return logCapture;
    }
}
