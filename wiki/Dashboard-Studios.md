# 🎛️ Web Dashboard Feature Studios Guide

In-depth guide for the 9 dedicated feature studios in the Master-Bot Web Dashboard:

---

## The 9 Feature Studios

1. **🎵 Audio & Music Studio** (`/dashboard/music`):
   - Real-time Lavalink player state, track search, queue browser.
   - Interactive DSP audio filters (Bassboost, Nightcore, Vaporwave, Karaoke).
   - Volume sliders & user playlist synchronizer.

2. **📢 WYSIWYG Broadcaster** (`/dashboard/broadcast`):
   - Real-time side-by-side visual Discord embed composer.
   - Title, description, colors, fields, thumbnails, and footer designer.
   - Direct Discord API v10 channel message dispatcher.

3. **📜 18-Event Audit Stream** (`/dashboard/logs`):
   - Comprehensive event logging categorized by Moderation, Messages, Members, Channels, and Voice.

4. **🎫 Support Ticket Suite** (`/dashboard/[server_id]/tickets`):
   - Ticket manager roles, dynamic transcript routing, custom panel greeting messages.

5. **📺 Twitch Integrations** (`/dashboard/integrations`):
   - Live streamer tracking and notification routing.

6. **⚡ Cluster Telemetry** (`/dashboard/system`):
   - Live PostgreSQL query latency (`SELECT 1`), gateway WebSocket ping, shard metrics, ecosystem statistics.

7. **⏰ Reminders Studio** (`/dashboard/reminders`):
   - Multi-channel reminder manager and recurring scheduler.

8. **👋 Welcome & Leave Greetings** (`/dashboard/[server_id]/welcome-message`):
   - Welcome embed designer with dynamic template variables (`{user}`, `{server}`, `{position}`).

9. **⚙️ Command Controls** (`/dashboard/[server_id]/commands`):
   - Guild-level command overrides and permission bit management.
