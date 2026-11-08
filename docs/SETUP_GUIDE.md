# 🛠️ Server Setup & Connection Guide

Connect any Minecraft server software to Vexo AI Studio in under 60 seconds.

---

## ⚡ 1. SFTP + RCON Direct Mode (Recommended — No Custom Ports or Jars Needed!)

Most Minecraft hosts (Pterodactyl, Shockbyte, Apex, Bisect, PebbleHost, etc.) provide SFTP and RCON:
1. Open Vexo AI Studio (`http://localhost:3000` or on your Netlify domain).
2. Click **+ Connect Server** (or **Add New Server**).
3. Select **SFTP + RCON**:
   - **SFTP Host**: Your server host address or IP.
   - **SFTP Port**: Usually `2022` or `22`.
   - **SFTP Username & Password**: Your panel credentials.
   - **RCON Port (25575) & Password**: Your `rcon.password` from `server.properties`.
4. Click **Save & Connect**! Vexo AI connects directly to manage configs and execute console commands.

---

## 📁 2. Direct Local Server Folder Mode (Zero Port-Forwarding!)

If you run your Minecraft server on the same PC as Vexo AI Studio:
1. In Vexo Studio, click **+ Connect Server**.
2. Select the **Local Folder** tab.
3. Enter your server's folder path on disk (e.g. `D:\Servers\Survival-1.20` or `C:\Minecraft`).
4. (Optional) Provide your RCON port & password from `server.properties` to enable console commands.
5. Click **Save & Connect**! Vexo AI will directly read and edit your server files with zero latency.

---

## 🧪 3. Instant Built-in Sandbox Mode

Want to test Vexo AI right away without even launching a Minecraft server?
1. Open Vexo Studio at `http://localhost:3000`.
2. The default server is set to **Demo SMP (Sandbox Mode)**.
3. You can run commands (`tps`, `gamemode`, `op`), optimize configs, generate Java plugins, and view logs immediately!
