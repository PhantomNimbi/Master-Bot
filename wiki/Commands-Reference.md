# Complete Commands Reference

Master-Bot features over 60 slash commands organized cleanly into categories. Use `/help` in Discord to open the interactive category browser or view specific parameter details.

---

## 🎵 Music & Audio Commands

| Command | Description | Usage Example |
|---|---|---|
| `/play` | Search and play tracks or playlists from YouTube, Spotify, etc. | `/play query: darude sandstorm` |
| `/pause` | Pause currently playing track | `/pause` |
| `/resume` | Resume playback | `/resume` |
| `/skip` | Skip the current track | `/skip` |
| `/skipto` | Skip to a specific position in queue | `/skipto position: 4` |
| `/queue` | View current queue and upcoming tracks | `/queue` |
| `/nowplaying` | Display current track progress and metadata | `/nowplaying` |
| `/volume` | Set audio volume (1-100) | `/volume level: 80` |
| `/lyrics` | Search song lyrics or view lyrics for current track | `/lyrics song: Hotel California` |
| `/create-playlist` | Create a custom user playlist | `/create-playlist name: Favorites` |
| `/save-to-playlist` | Save track or URL to custom playlist | `/save-to-playlist name: Favorites url: <url>` |
| `/my-playlists` | View your saved playlists | `/my-playlists` |
| `/display-playlist` | Inspect tracks in a custom playlist | `/display-playlist name: Favorites` |
| `/delete-playlist` | Delete a custom playlist | `/delete-playlist name: Favorites` |
| `/music-trivia` | Start an interactive voice channel music trivia game | `/music-trivia rounds: 5 category: 90s` |
| `/stop-trivia` | Stop an ongoing music trivia game | `/stop-trivia` |

---

## 🖼️ Reaction GIFs (Powered by Klipy & Waifu.im)

| Command | Description | Usage Example |
|---|---|---|
| `/gif` | Search random GIFs | `/gif query: dance` |
| `/anime` | Search anime reaction GIFs | `/anime` |
| `/hug` | Send a hug reaction GIF to a user | `/hug user: @User` |
| `/slap` | Send a slap reaction GIF to a user | `/slap user: @User` |
| `/pat` | Send a headpat reaction GIF | `/pat user: @User` |
| `/cat` / `/doggo` | Display cute cat or dog photos | `/cat` |
| `/waifu` | Fetch random waifu images from waifu.im | `/waifu` |

---

## 🎮 Gaming, Info & Twitch

| Command | Description | Usage Example |
|---|---|---|
| `/game-search` | Search video game metadata via IGDB | `/game-search title: Elden Ring` |
| `/tv-show-search` | Search TV show details via TVMaze | `/tv-show-search query: Breaking Bad` |
| `/twitch-status` | Check live status of a Twitch channel | `/twitch-status channel: shroud` |
| `/urban` | Search Urban Dictionary definitions | `/urban term: typescript` |

---

## 🔨 Moderation & Server Management

| Command | Description | Usage Example |
|---|---|---|
| `/ban` | Ban a member with optional reason and message purge | `/ban user: @User reason: Spam delete-messages: Previous 24 Hours` |
| `/kick` | Kick a member from the server | `/kick user: @User reason: Rule violation` |
| `/timeout` | Timeout (mute) a member or remove active timeout | `/timeout user: @User duration: 5 Minutes reason: Spam` |
| `/slowmode` | Set text channel rate limit (0 to disable) | `/slowmode seconds: 10 channel: #general` |
| `/purge` | Bulk delete recent messages (optional user filter) | `/purge amount: 25 user: @User` |

---

## ⚙️ Utilities & Owner Commands

| Command | Description | Usage Example |
|---|---|---|
| `/help` | Open interactive category browser or detailed command help | `/help` |
| `/set` | Configure server settings (Welcome, Twitch, Logging, Tickets, Volume) | `/set <subcommand>` |
| `/youtube-auth` | Re-trigger YouTube OAuth Device Authorization (Owner Only) | `/youtube-auth` |
| `/avatar` | View a user's Discord profile avatar | `/avatar user: @User` |
| `/reddit` | Fetch hot posts from a subreddit | `/reddit subreddit: memes` |
| `/ping` | Check bot gateway latency | `/ping` |
| `/about` | View Master-Bot version, uptime, and system info | `/about` |
| `/activity` | Generate voice channel Discord Activity invite link | `/activity channel: Voice Channel` |
