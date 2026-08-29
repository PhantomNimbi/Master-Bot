# Lavalink v4 Setup & Deployment Guide

Master-Bot uses **Lavalink v4** for high-performance cross-platform audio streaming.

## 1. Download Lavalink.jar
- **Official Repository:** [lavalink-devs/Lavalink](https://github.com/lavalink-devs/Lavalink)
- **Releases Page:** [Download Latest Lavalink v4 Release](https://github.com/lavalink-devs/Lavalink/releases)

Download the latest `Lavalink.jar` (v4.x) into your server directory.

## 2. Configuration (`application.yml`)
Ensure `application.yml` is placed in the same directory as `Lavalink.jar`. The repository includes a preconfigured `application.yml` with support for:
- `youtube-plugin` (dev.lavalink.youtube:youtube-plugin)
- `lavasrc-plugin` (com.github.topi314.lavasrc:lavasrc-plugin for Spotify metadata resolution)

## 3. Running Lavalink

### Via Docker Compose (Recommended)
```bash
docker compose --env-file docker.env up -d --build
```

### Standalone (Java 17+ Required)
```bash
java -jar Lavalink.jar
```

## 4. Environment Variables
Make sure the following variables match in your `.env` or `docker.env`:
- `LAVA_HOST` (e.g. `localhost` or service name `lavalink`)
- `LAVA_PORT` (default `2333`)
- `LAVA_PASS` (must match `lavalink.server.password` in `application.yml`)
