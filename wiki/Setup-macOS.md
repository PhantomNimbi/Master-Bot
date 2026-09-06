# 🍎 macOS Setup Guide

Detailed instructions for installing and running Master-Bot locally on macOS using [Homebrew](https://brew.sh/).

---

## 1. Install Prerequisites via Homebrew

```bash
# Install Node.js LTS, pnpm, and OpenJDK 21
brew install node@20 pnpm openjdk@21

# Link OpenJDK 21 to system Java wrappers
sudo ln -sfn /opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-21.jdk

# Add Node.js to your shell path (add to ~/.zshrc)
echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

---

## 2. Database & Audio Queue

Master-Bot uses **SQLite** and an **In-Memory Audio Queue** out of the box. No PostgreSQL or Redis background services are needed!

---

## 3. Launch Master-Bot

```bash
git clone https://github.com/galnir/Master-Bot.git
cd Master-Bot
pnpm install
cp .env.example .env
# Edit .env with your credentials
pnpm dev
```
