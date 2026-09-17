# ⌨️ Commands Reference

Master-Bot ships **73 slash commands** across five categories. All commands are slash-command native; `GIFS_ENABLED`, `TWITCH_ENABLED`, `NEWS_ENABLED`, and `IGDB_ENABLED` hide their categories when disabled.

## 🎵 Music — 24 commands

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

## 🎭 Fun & Reactions — 1 consolidated command

Requires `GIFS_ENABLED=true` and a GIF API key (`KLIPY_API`). All GIF and reaction functionality is unified into a single `/gif` command with modular submodules in `src/lib/gifs/options/`:

| Command | Usage | Description |
| --- | --- | --- |
| `/gif` | `/gif [tag: Tag] [query: Keyword] [target: @User]` | Display a reaction GIF, search GIFs, or get a random GIF (default). |

**Available preset tags:**
`amongus`, `anime`, `baka`, `cat`, `doggo`, `gintama`, `hug`, `jojo`, `pat`, `slap`, `waifu`. Reaction tags support the optional `target: @User` parameter.

## 🟣 Twitch & YouTube Alerts — 1 command

| Command | Description |
| --- | --- |
| `/twitch-status` | Check if one or more streamers are currently live. |

---

## ⚙️ `/set` Configuration Hub — Single Command with Options

`/set` is the server configuration hub. Requires `ManageGuild` permission. To keep registered commands well within Discord limits, `/set` uses options instead of subcommands:

```txt
/set [setting: Setting] [channel: #channel] [value: Text] [enabled: True/False] [role: @Role] [number: 1-100] [alerts: Type]
```

Running `/set` with no options defaults to displaying the server settings overview (`view`).

| Setting Option | Required / Optional Parameters | What it does |
| --- | --- | --- |
| `view` | — | Review all current server settings in an overview panel (default). |
| `welcome-channel` | `channel: #channel` | Set the text channel for welcome greetings. |
| `welcome-message` | `value: "Message"` | Set custom welcome greeting (`{user}`, `{server}`, `{memberCount}`). |
| `welcome-toggle` | `enabled: True/False` | Enable or disable welcome greetings. |
| `welcome-test` | — | Send a test welcome greeting in the configured channel. |
| `twitch-add` | `value: "streamer"`, `channel: #channel` | Add streamer to alert monitoring (supports text & forum channels). |
| `twitch-remove` | `value: "streamer"`, `channel: #channel` | Remove streamer from alert monitoring. |
| `twitch-list` | — | List monitored Twitch streamers. |
| `youtube-add` | `value: "@channel"`, `channel: #channel`, `[alerts: all/streams/uploads]` | Add YouTube alert for streams and uploads (supports text & forum channels). |
| `youtube-remove` | `value: "@channel"`, `channel: #channel` | Remove YouTube alert subscription. |
| `youtube-list` | — | List monitored YouTube channels. |
| `log-channel` | `channel: #channel` | Set the audit/moderation log channel. |
| `log-toggle` | `enabled: True/False` | Enable or disable audit logging. |
| `log-disable` | — | Disable audit logging. |
| `ticket-channel` | `channel: #channel` | Set support ticket panel channel. |
| `ticket-toggle` | `enabled: True/False` | Enable or disable the support ticket system. |
| `ticket-panel` | — | Post the interactive support ticket creation embed panel. |
| `ticket-transcript` | `channel: #channel` | Set channel to archive closed ticket transcripts. |
| `ticket-transcript-disable` | — | Disable transcript archiving. |
| `ticket-role` | `role: @Role` | Set staff/moderator role with ticket management permissions. |
| `ticket-role-disable` | — | Remove assigned ticket staff role. |
| `default-volume` | `number: 1–100` | Set default playback volume for the server. |

> The interactive **web dashboard** mirrors every `/set` setting for servers where the bot is present — see [Web Dashboard](Dashboard).