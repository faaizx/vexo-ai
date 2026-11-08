# 📦 Java Plugin & Skript Development Guide — Vexo AI

Vexo AI includes a **built-in JDK Java compiler sandbox** that allows you to generate, compile, and deploy custom Minecraft plugins in seconds using plain English.

---

## ⚡ How It Works

1. **Natural Language Specification**: Describe the gameplay mechanics, events, or commands you want.
2. **Code Generation**: Vexo AI generates clean Bukkit/Paper API Java code and `plugin.yml`.
3. **On-Demand Compilation**: Vexo uses the local JDK `javac` compiler with `paper-api.jar` to compile your `.java` source directly into `.class` files.
4. **Jar Packaging**: Packages the classes and `plugin.yml` into a production-ready `.jar` ready to drop into your `plugins/` directory or hot-reloads it live!

---

## 💡 Example Prompts to Try in Vexo Studio

### 1. Double Jump Plugin
> *"Create a Java Paper plugin called DoubleJump with permission check `doublejump.use` and cloud particle effects when a player double jumps."*

### 2. Auto-Replant Crops
> *"Create a Paper plugin that automatically replants wheat, carrots, potatoes, and nether wart when harvested with a hoe, consuming a seed from the player's inventory."*

### 3. Custom Player Join & Kill Rewards
> *"Write a Java plugin that gives players 1 diamond and plays an anvil sound when they get a player kill, broadcasting a custom kill message in chat."*

### 4. Custom Skript (.sk)
> *"Create a Skript in `plugins/Skript/scripts/welcome.sk` that sends a welcome title screen with subtitle and firework to new players on their first join."*

---

## 🔨 Using the In-Studio Plugin Builder

In Vexo Studio:
1. Click the **Java Plugin Builder** tab.
2. Review or customize the Plugin Name, Package, and Main Class.
3. Edit the Java source or `plugin.yml` directly in the editor.
4. Click **Compile & Package .JAR**.
5. The compiled `.jar` is immediately built and validated!
