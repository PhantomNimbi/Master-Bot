# ⚙️ Getting Started & Setup Guide

This guide covers system prerequisites, monorepo architecture, and local environment setup for Master-Bot.

---

## 📋 System Prerequisites

| Dependency | Minimum Version | Recommended Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>=18.0.0` | `20.x` or `22.x LTS` | JavaScript/TypeScript runtime |
| **pnpm** | `>=8.0.0` | `9.x` (`npm i -g pnpm`) | Monorepo package manager & workspace manager |
| **Java** | `Java 17+` | `Java 21 LTS` | Lavalink v4 audio engine runtime |
| **SQLite** | `Built-in` | `file:./db.sqlite` | Zero-config embedded relational database |
| **Audio Queue** | `Built-in` | `In-Memory` | Zero-dependency high performance queue |

---

## 🖥️ Operating System Guides

Choose the dedicated guide for your operating system:

- [🪟 **Windows Setup Guide**](Setup-Windows): Step-by-step setup using PowerShell and `pnpm`.
- [🍎 **macOS Setup Guide**](Setup-macOS): Installation using Homebrew and OpenJDK 21.
- [🐧 **Linux Setup Guide**](Setup-Linux): Installation for Ubuntu, Debian, Arch Linux, and Fedora/RHEL.
- [🍓 **Raspberry Pi Setup Guide**](Setup-Raspberry-Pi): ARM64 Linux setup and performance tuning.
- [🐳 **Docker Deployment Guide**](Docker-Deployment): Containerized local and server stack deployment.

---

## 🚀 Unified Monorepo Launchers

Master-Bot provides intelligent cross-platform launchers that automatically manage ports, run database schema syncs, spawn services concurrently, and isolate process logs:

```bash
# Run full development stack (Bot + Dashboard + Lavalink)
pnpm dev

# Run in production mode
pnpm start
```
