# ⌨️ Commands Reference

Master-Bot ships **74 slash commands** across five categories. All commands are slash-command native; `GIFS_ENABLED`, `TWITCH_ENABLED`, `NEWS_ENABLED`, and `IGDB_ENABLED` hide their categories when disabled.

## 🎵 Music — 25 commands

Requires Lavalink (`LAVA_ENABLED=true`) and the bot to be in a voice channel.

| Command | Description |
| --- | --- |
| `/play` | Play a track, playlist, or search query (YouTube, Spotify, SoundCloud, Twitch, Vimeo). |
| `/pause` | Pause the current track. |
| `/resume` | Resume the paused track. |
| `/queue` | Show the current queue with paginated pages and the now-playing embed. |
| `/jump` | Jump to a specific position in the queue. |
| `/shuffle` | Randomly reorder the queue. |
| `/seek` | Seek within the current track to a given timestamp. |
| `/remove` | Remove a track by its queue position. |
| `/move` | Move a track to a different queue position. |
| `/leave` | Disconnect the bot and clear the queue. |
| `/volume` | Set or view playback volume (server-wide). |
| `/lyrics` | Fetch the current track's lyrics via Genius. |
| `/bassboost` | Toggle the bassboost DSP filter. |
| `/karaoke` | Toggle karaoke/vocal-removal filtering. |
| `/nightcore` | Toggle the nightcore (pitch-shifted) effect. |
| `/vaporwave` | Toggle the vaporwave (slowed, reverb) effect. |
| `/music-trivia` | Start a guess-the-song trivia game from the current queue's artists. |
| `/stop-trivia` | End the trivia game and reveal the scoreboard. |
| `/create-playlist` | Create a custom playlist scoped to the current server. |
| `/save-to-playlist` | Add the currently playing track to one of your playlists. |
| `/my-playlists` | List your playlists on this server. |
| `/display-playlist` | Show the tracks in a playlist (paginated). |
| `/delete-playlist` | Delete one of your playlists on this server. |
| `/remove-from-playlist` | Remove a specific track from one of your playlists. |
| `/youtube-auth` | Authorize a streaming YouTube account via OAuth (see [Music & Lavalink](Music.md#youtube-oauth)). |

## 🔨 Moderation — 5 commands

All moderation commands validate member **roles** (target can't be the guild owner, the bot, or a higher-ranked member).

| Command | Description |
| --- | --- |
| `/ban` | Ban a member by ID or mention with an optional reason. |
| `/kick` | Kick a member with an optional reason. |
| `/timeout` | Time out a member for a duration (and optionally a reason). |
| `/slowmode` | Set the channel slowmode to a duration. |
| `/purge` | Bulk-delete up to 100 recent messages in the current channel. |

## 🎲 Other / Utility — 31 commands

| Command | Description |
| --- | --- |
| `/help` | Interactive paginated embed: category menu, command lookup, navigation. |
| `/about` | Bot info, stats, and invite links. |
| `/ping` | Bot + API latency. |
| `/avatar` | Enlarged avatar for a user. |
| `/set` | The server configuration command — [see below](#set-subcommands). |
| `/dashboard` | Link to the web dashboard for the current server. |
| `/reminder` | Schedule a one-off or repeating reminder (DM delivery). |
| `/activity` | Set the bot's custom activity status. |
| `/poll` | Start an emoji-reactions poll with a custom question. |
| `/random` | True random numbers via `random.org`. |
| `/8ball` | Magic 8-ball fortune. |
| `/reddit` | Random post from a subreddit. |
| `/urban` | Urban Dictionary definition lookup. |
| `/translate` | Translate text between languages. |
| `/weather` | Current weather for a city. |
| `/world-news` | Global headline search via NewsAPI. |
| `/game-search` | IGDB game database lookup. |
| `/games` | List all playable mini-games. |
| `/connect-four` | Play Connect Four against the bot (reaction-based). |
| `/tic-tac-toe` | Play Tic-Tac-Toe against the bot (reaction-based). |
| `/rockpaperscissors` | Rock-paper-scissors duel with the bot. |
| `/speedrun` | Fetch speedrun records. |
| `/tv-show-search` | TV show details lookup. |
| `/chucknorris` | Random Chuck Norris fact. |
| `/advice` | Random life advice. |
| `/motivation` | Random motivational quote. |
| `/kanye` | Random Kanye West quote. |
| `/trump` | Random Donald Trump quote. |
| `/bored` | Random activity when you're bored. |
| `/fortune` | Random fortune cookie. |
| `/insult` | Amusing insult for a member. |

## 😂 GIFs & Reactions — 12 commands

Requires `GIFS_ENABLED=true` and a GIF API key (`KLIPY_API`). Animated tenor/GIPHY-style GIFs and anime reactions:

| Command | Command | Command |
| --- | --- | --- |
| `/gif` | `/anime` | `/cat` |
| `/waifu` | `/slap` | `/doggo` |
| `/hug` | `/pat` | `/gintama` |
| `/jojo` | `/baka` | `/amongus` |

## 🟣 Twitch — 1 command

| Command | Description |
| --- | --- |
| `/twitch-status` | Check if one or more streamers are currently live. |

---

## `/set` Subcommands

`/set` is the server configuration hub. Requires `ManageGuild` permission.

| Subcommand | Options | What it does |
| --- | --- | --- |
| `/set welcome set-channel` | `channel` | Set the welcome message channel. |
| `/set welcome set-message` | `message` | Set the welcome message template (`{user}`, `{server}`, `{position}`). |
| `/set welcome toggle` | — | Enable/disable welcome messages. |
| `/set twitch add` | `streamer` + options | Add a streamer to live-alert monitoring. |
| `/set twitch remove` | `streamer` | Stop monitoring a streamer. |
| `/set twitch list` | — | Paginated list of monitored streamers. |
| `/set logging set-channel` | `channel` | Set the audit-log channel. |
| `/set logging toggle-log-channel` | — | Enable/disable audit logs. |
| `/set tickets set-ticket-channel` | `channel` | Where ticket panels/buttons are posted. |
| `/set tickets set-transcript-channel` | `channel` | Where ticket transcripts are archived. |
| `/set tickets set-ticket-role` | `role` | Role allowed to manage/view tickets. |
| `/set tickets toggle-tickets` | — | Enable/disable the ticket system. |
| `/set volume` | `0–200` | Server-wide player volume. |
| `/set view` | — | Review all current server settings in a panel. |

> The interactive **web dashboard** mirrors every `/set` setting for servers where the bot is present — see [Web Dashboard](Dashboard.md).