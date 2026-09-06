# 🍎 macOS Setup Guide

Detailed instructions for installing and running Master-Bot locally on macOS using [Homebrew](https://brew.sh/).

---

## 1. Install Prerequisites via Homebrew

```bash
# Install Node.js LTS, pnpm, OpenJDK 21, PostgreSQL, and Redis
brew install node@20 pnpm openjdk@21 postgresql@16 redis

# Link OpenJDK 21 to system Java wrappers
sudo ln -sfn /opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-21.jdk

# Add Node.js to your shell path (add to ~/.zshrc)
echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

---

## 2. Start Background Services

```bash
brew services start postgresql@16
brew services start redis
```

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
