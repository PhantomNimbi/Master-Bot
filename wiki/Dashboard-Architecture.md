# 🏛️ Web Dashboard Technical Architecture

Technical architecture of `apps/dashboard`, `packages/api`, and `packages/auth`.

---

## Architecture Flow

```mermaid
flowchart TD
    subgraph Client["Next.js 15 App Router (apps/dashboard)"]
        UI["React 19 Glassmorphism Components"]
        tRPCClient["@tanstack/react-query & tRPC Client"]
        NextAuth["NextAuth.js v5 Client"]
    end

    subgraph API["Backend API Layer (packages/api)"]
        Router["tRPC v11 appRouter"]
        AuthMiddleware["Protected Procedure Auth Middleware"]
        MusicRouter["music router (Lavalink State)"]
        BroadcastRouter["broadcast router (Discord API v10)"]
        SystemRouter["system router (PostgreSQL Latency Ping)"]
    end

    subgraph DB["Database Layer (packages/db)"]
        Prisma["Prisma ORM Client"]
    end

    UI --> tRPCClient
    UI --> NextAuth
    tRPCClient --> Router
    Router --> AuthMiddleware
    AuthMiddleware --> MusicRouter
    AuthMiddleware --> BroadcastRouter
    AuthMiddleware --> SystemRouter
    MusicRouter --> Prisma
    BroadcastRouter --> Prisma
    SystemRouter --> Prisma
```

---

## Core Packages

1. **`apps/dashboard`**: Next.js 15 App Router with Server Components and Client Components.
2. **`packages/api`**: End-to-end type-safe tRPC v11 API procedures across 15 router namespaces.
3. **`packages/auth`**: Shared NextAuth.js v5 configuration with Discord OAuth2 provider.
