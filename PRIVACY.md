# 🛡️ Privacy Policy for Master-Bot

**Last Updated:** September 16, 2026

Welcome to **Master-Bot** ("we", "our", or "the Bot"). This Privacy Policy explains how Master-Bot collects, uses, stores, and protects information when you invite, configure, or interact with our Discord bot application and associated web dashboard.

By inviting Master-Bot to your Discord server or using any of its features, you agree to the collection and use of information in accordance with this policy and the [Discord Developer Terms of Service](https://discord.com/developers/docs/policies-and-agreements/developer-terms-of-service).

---

## 1. 📊 Information We Collect

Master-Bot collects only the minimum necessary data required to deliver music playback, server moderation, support ticketing, reminders, and dashboard configuration services.

### A. Information Stored in Persistent Database (`Prisma / SQLite / PostgreSQL`)
- **User Information**:
  - Discord User ID (snowflake identifier).
  - Discord Username and Avatar hash (used for session display on the dashboard and audit logging).
- **Guild (Server) Information**:
  - Discord Guild ID (snowflake identifier) and Guild Name.
  - Guild Owner ID.
  - Server-specific preferences (volume settings, log channel ID, welcome channel ID, enabled log event masks, staff ticket manager role IDs).
- **Guild Membership Information**:
  - Composite linkage of `GuildId` and `UserId` to maintain server-scoped records.
- **Custom Playlists**:
  - Playlist name, track titles, track durations, and media identifiers created via `/create-playlist` or the music dashboard.
- **Support Tickets**:
  - Ticket thread ID, creator User ID, guild ID, open/closed status, and creation timestamps.
- **Reminders**:
  - Target User ID, Guild ID, scheduled timestamp, recurring interval rules, and reminder message text.
- **Twitch Stream Alerts**:
  - Subscribed Twitch streamer usernames and designated alert text channel IDs.

### B. Transient / In-Memory Data (`SessionManager & ioredis-mock`)
- Real-time voice channel session states (active voice connection, channel ID).
- In-flight music queue and player status.
- Interactive game state (Connect 4, Tic-Tac-Toe boards) during active matches.
- Web dashboard OAuth session tokens (encrypted using NextAuth with `NEXTAUTH_SECRET`).

### C. Information We DO NOT Collect
- We **do not** read, record, or store the content of general chat messages across your server. Messages are only processed ephemerally when an explicit slash command (e.g., `/ban`, `/poll`, `/reminder`) is invoked.
- We **do not** listen to, record, or store voice audio packets. The audio engine functions strictly in playback/transmit mode.
- We **do not** collect financial information, billing details, real-world addresses, or government identification.

---

## 2. ⚙️ How We Use Collected Information

The data collected is used strictly to provide and maintain the features of Master-Bot:
1. **Music Playback**: Managing per-guild queues, playback loops, and resolving tracks via Lavalink v4.
2. **Server Moderation & Logging**: Emitting server audit logs (role changes, member joins/leaves, voice movements) to designated channels as configured by server administrators.
3. **Support Tickets**: Generating isolated thread discussions and exporting `.txt` transcript summaries for server staff.
4. **Reminders & Alerts**: Notifying users at their requested times and alerting servers when configured Twitch streamers go live.
5. **Dashboard Management**: Allowing verified server administrators to configure features securely through Discord OAuth2 authentication.

---

## 3. 💾 Data Storage, Retention & Security

- **Location**: Master-Bot operates under a self-hosted architecture. All persistent data resides within the local database instance (`packages/db/prisma/db.sqlite` or the server operator's configured PostgreSQL database).
- **Data Retention**:
  - Guild configurations persist as long as the bot remains installed in the server.
  - **Automatic Member Purge**: When a user leaves a Discord guild, Master-Bot's `clearUserGuildData` lifecycle service automatically cascades and deletes the user's tickets, temporary voice channels, playlists, reminders, and Twitch subscriptions associated with that guild.
  - Reminder records are automatically marked completed or removed upon execution.
- **Security Safeguards**:
  - Access to the administrative dashboard is gated by Discord OAuth2 session tokens with CSRF and cookie encryption.
  - Database interactions utilize parameterized queries via Prisma ORM to prevent injection attacks.

---

## 4. 🌐 Third-Party Services & Integrations

Master-Bot interfaces with external APIs to provide specific functionality. These third parties operate under their respective privacy policies:
- **Discord API** ([Discord Privacy Policy](https://discord.com/privacy)): Primary platform for message gateway and voice transport.
- **YouTube / Google** ([Google Privacy Policy](https://policies.google.com/privacy)): Used for authorized music resolution via the device-flow OAuth plugin (`.youtube-oauth.json`).
- **Spotify** ([Spotify Privacy Policy](https://www.spotify.com/legal/privacy-policy/)): Used solely for playlist and track metadata resolution via Spotify Developer API.
- **Twitch** ([Twitch Privacy Notice](https://www.twitch.tv/p/legal/privacy-notice/)): Used for checking live broadcaster statuses.
- **Klipy / Waifu.im / NewsAPI**: Used for fetching reaction GIFs and public news headlines.

We **do not** sell, rent, monetize, or trade your personal data to any third party, marketing firm, or data broker.

---

## 5. 🗑️ Your Data Rights & Deletion Requests

You have full control over your stored data:
- **User-Initiated Deletion**:
  - Delete saved playlists anytime using `/delete-playlist`.
  - Delete individual playlist songs using `/remove-from-playlist`.
  - Delete active reminders using the reminder controls.
- **Complete Guild Deletion**: Removing the bot from your Discord server halts all data collection immediately. Server owners may request a complete database purge of their guild records by opening a request on our issue tracker or contacting the instance administrator.
- **Data Inquiries**: You may request an export or deletion of all records associated with your Discord `UserId` by submitting a request to the repository administrators.

---

## 6. 👶 Children's Online Privacy Protection

Master-Bot is intended for users who meet the minimum age required to use Discord (13 years of age, or the applicable legal age in your jurisdiction). We do not knowingly collect personal data from children under 13. If you become aware that a child has provided us with personal data, please contact us for immediate removal.

---

## 7. 🔄 Changes to This Policy

We may update this Privacy Policy from time to time. Any changes will be reflected with an updated "Last Updated" date at the top of this document. Continued use of Master-Bot following any revisions constitutes acceptance of the updated terms.

---

## 📬 Contact & Inquiries

If you have any questions, concerns, or data deletion requests regarding this Privacy Policy, please reach out through:
- **GitHub Repository**: [https://github.com/galnir/Master-Bot](https://github.com/galnir/Master-Bot)
- **Issue Tracker**: [https://github.com/galnir/Master-Bot/issues](https://github.com/galnir/Master-Bot/issues)
