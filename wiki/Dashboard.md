# 🌐 Web Dashboard

The **Master-Bot Dashboard** is a Next.js 15 management console where you configure everything `/set` can — plus studios that live better on a big screen.

## 🧱 Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 15 (App Router), React 18 |
| API | tRPC v11 (client/react-query/server) + `superjson` |
| Data fetching | TanStack React Query 5 |
| Auth | NextAuth v5 (beta) via `@master-bot/auth` — Discord OAuth (`identify guilds email` scopes) |
| Styling | Tailwind CSS 3.4, Radix UI primitives, custom UI components |
| Backend data | Prisma Client (`@master-bot/db`) — reads the same SQLite database the bot writes |

## 🔐 Authentication

```mermaid
sequenceDiagram
    participant U as User
    participant D as Dashboard
    participant A as NextAuth (Discord)
    U->>D: Visit /dashboard
    D->>A: Sign in with Discord
    A->>D: Session (id, discordId, avatar)
    D->>D: List servers where bot is present
```

- Discord OAuth grants the `identify`, `guilds`, and `email` scopes.
- `packages/auth` uses a custom Prisma adapter whose `createUser` **upserts by Discord ID**, linking dashboard users to the same `User` rows the bot manages.
- The `Session` type is augmented with `user.id` and `user.discordId` for API calls.

## 🗺️ Pages

| Route | Studio |
| --- | --- |
| `/` | Landing page with features + invite. |
| `/dashboard` | Server hub — pick a server where the bot is present. |
| `/dashboard/[server_id]` | Server layout with per-guild navigation. |
| `…/welcome-message` | Welcome channel, template editor, toggle, and send-test actions. |
| `…/log-channel` | Audit-log channel + the full **20-event trigger switchboard** (`log-events-form`). |
| `…/tickets` | Ticket channel/role/transcript configuration. |
| `…/reminders` | View and manage server reminders. |
| `…/commands/[command_id]` | Per-command info and per-server command toggles. |
| `/dashboard/music` | Global music settings. |
| `/dashboard/broadcast` | Rich broadcast composer for announcements. |
| `/dashboard/integrations` | Link external services / manage credentials. |
| `/dashboard/system` | Runtime health, version, uptime telemetry. |

## 🎨 Visual Themes & Accent Schemes

The dashboard features **7 visual themes** and **10 accent color schemes**:

- **Visual Themes:**
  - **Dark** (Default): Slate and charcoal midnight aesthetic.
  - **Light**: Crisp daylight contrast.
  - **Glassmorphism**: Translucent frosted cards with ambient radial glow gradients.
  - **Cyberpunk**: Neon yellow, electric cyan border highlights, and tech grid styling.
  - **Dracula**: Classic dark gothic purple with neon pink accents.
  - **Nord**: Arctic frost palette with muted polar blue hues.
  - **Emerald**: Deep evergreen forest with glowing mint highlights.

- **Accent Color Schemes:**
  - **Theme Default**, **Amethyst Purple**, **Ocean Blue**, **Emerald Green**, **Rose Pink**, **Amber Gold**, **Indigo Violet**, **Crimson Ruby**, **Teal Aqua**, **Sunset Coral**, **Electric Cyan**.

Themes and accents can be selected dynamically from the header dropdown menu. Preferences are preserved in `localStorage` and can be set server-side via `DASHBOARD_THEME` and `DASHBOARD_COLOR_SCHEME`.

## ⚙️ Data Flow

```mermaid
flowchart LR
    SUB["Studio forms (client)"] --> RQ["React Query mutations"]
    RQ --> T["tRPC router"]
    T --> P["Prisma Client"]
    P --> DB[("SQLite: /data/db.sqlite")]
    DB --> SM["Bot SessionManager<br/>(hydrated at boot)"]
    SM --> B["Discord bot behavior"]
```

Because the bot **hydrates from the database at every boot**, a setting you save in the dashboard is live the next time the bot picks it up (and vice versa for `/set`).

> ⚠️ **Tip:** In container setups, mount `/data` as a persistent volume — see [Deployment](Deployment).