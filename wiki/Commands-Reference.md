# Complete Commands Reference

Master-Bot features **66 slash commands** organized cleanly into categories. Use `/help` in Discord to open the interactive category browser or view specific parameter details.

---

## 🎵 Music & Audio Commands

| Command | Description | Usage |
|---|---|---|
| `/play` | Play any song or playlist from YouTube, Spotify and more | `/play query: darude sandstorm` |
| `/pause` | Pause the music | `/pause` |
| `/resume` | Resume the music | `/resume` |
| `/skip` | Skip the current song playing | `/skip` |
| `/skipto` | Skip to a track in queue | `/skipto position: 4` |
| `/queue` | Get a list of the music queue | `/queue` |
| `/shuffle` | Shuffle the music queue | `/shuffle` |
| `/seek` | Seek to a desired point in a track | `/seek` |
| `/remove` | Remove a track from the queue | `/remove position: 3` |
| `/move` | Move a track to a different position in queue | `/move` |
| `/leave` | Make the bot leave its voice channel and stop playing music | `/leave` |
| `/volume` | Set the volume | `/volume setting: 80` |
| `/lyrics` | Get the lyrics of any song or the currently playing song | `/lyrics title: Hotel California` |
| `/bassboost` | Boost the bass of the playing track | `/bassboost` |
| `/karaoke` | Turn the playing track into karaoke | `/karaoke` |
| `/nightcore` | Enable or disable the Nightcore filter | `/nightcore` |
| `/vaporwave` | Apply vaporwave to the playing track | `/vaporwave` |
| `/create-playlist` | Create a custom playlist that you can play anytime | `/create-playlist playlist-name: Favorites` |
| `/save-to-playlist` | Save a song or playlist to a custom playlist | `/save-to-playlist playlist-name: Favorites url: <url>` |
| `/my-playlists` | Display your custom playlists | `/my-playlists` |
| `/display-playlist` | Display a saved playlist | `/display-playlist playlist-name: Favorites` |
| `/delete-playlist` | Delete a playlist from your saved playlists | `/delete-playlist playlist-name: Favorites` |
| `/remove-from-playlist` | Remove a song from a saved playlist | `/remove-from-playlist` |
| `/music-trivia` | Start an interactive Music Trivia game in your voice channel | `/music-trivia rounds: 5 category: 90s` |
| `/stop-trivia` | Stop the active Music Trivia game in this server | `/stop-trivia` |

---

## 🖼️ Reaction GIFs & Media (Powered by Klipy & Waifu.im)

| Command | Description | Usage |
|---|---|---|
| `/gif` | Reply with a random GIF | `/gif` |
| `/anime` | Reply with a random anime GIF | `/anime` |
| `/amongus` | Reply with a random Among Us GIF | `/amongus` |
| `/baka` | Reply with a random baka GIF | `/baka` |
| `/gintama` | Reply with a random Gintama GIF | `/gintama` |
| `/jojo` | Reply with a random JoJo GIF | `/jojo` |
| `/hug` | Reply with a random hug GIF | `/hug` |
| `/slap` | Reply with a random slap GIF | `/slap` |
| `/cat` | Reply with a random cat GIF | `/cat` |
| `/doggo` | Reply with a random doggo GIF | `/doggo` |
| `/waifu` | Reply with a random waifu image (waifu.im) | `/waifu` |

---

## 🔨 Moderation & Server Management

| Command | Description | Usage |
|---|---|---|
| `/ban` | Ban a member from the server | `/ban user: @User reason: Spam delete-messages: 24h` |
| `/kick` | Kick a member from the server | `/kick user: @User reason: Rule violation` |
| `/timeout` | Timeout (mute) a member or remove an active timeout | `/timeout user: @User duration: 5m reason: Spam` |
| `/slowmode` | Set the slowmode message rate limit for a text channel | `/slowmode seconds: 10 channel: #general` |
| `/purge` | Bulk delete messages from the current channel | `/purge amount: 25 user: @User` |

---

## 🎮 Gaming, Info & Fun Utilities

| Command | Description | Usage |
|---|---|---|
| `/game-search` | Search for video game information using IGDB | `/game-search game: Elden Ring` |
| `/tv-show-search` | Get TV show information (TVMaze) | `/tv-show-search query: Breaking Bad` |
| `/twitch-status` | Check the status of your favorite streamer | `/twitch-status streamer: shroud` |
| `/speedrun` | Look for the world record of a game | `/speedrun game: Mario` |
| `/urban` | Get definitions from Urban Dictionary | `/urban query: typescript` |
| `/translate` | Translate text using Google Translate | `/translate target: es text: Hello` |
| `/8ball` | Get the answer to anything | `/8ball question: Will I win?` |
| `/reddit` | Get posts from Reddit by subreddit | `/reddit subreddit: memes sort: hot` |
| `/random` | Generate a random number between two inputs | `/random min: 1 max: 10` |
| `/games` | Play games like Connect 4 and Tic Tac Toe | `/games` |
| `/rockpaperscissors` | Play rock paper scissors | `/rockpaperscissors` |
| `/activity` | Generate an invite link to your voice channel | `/activity` |
| `/kanye` | Reply with a random Kanye quote | `/kanye` |
| `/trump` | Reply with a random Trump quote | `/trump` |
| `/advice` | Get some advice | `/advice` |
| `/motivation` | Reply with a motivational quote | `/motivation` |
| `/fortune` | Reply with a fortune cookie tip | `/fortune` |
| `/chucknorris` | Get a satirical fact about Chuck Norris | `/chucknorris` |
| `/insult` | Reply with a mean insult | `/insult` |

---

## ⚙️ Utilities & Owner Commands

| Command | Description | Usage |
|---|---|---|
| `/help` | Explore the command list or view detailed info for a specific command | `/help` |
| `/set` | Configure server settings (Welcome, Logging, Tickets, Twitch, Volume) | `/set <subcommand>` |
| `/youtube-auth` | Authorize YouTube playback via Device Flow (Owner Only) | `/youtube-auth` |
| `/avatar` | Reply with a user's Discord avatar | `/avatar user: @User` |
| `/about` | Display info about the bot | `/about` |
| `/ping` | Reply with pong! | `/ping` |

---

## 🔧 Server Settings (`/set` Subcommands)

| Subcommand | Description |
|---|---|
| `/set view` | Display the current server settings overview |
| `/set welcome-channel` | Set the channel for member welcome greetings |
| `/set welcome-message` | Set a custom welcome message (`{user}`, `{username}`, `{server}`, `{position}`) |
| `/set welcome-toggle` | Enable or disable automatic welcome greetings |
| `/set welcome-test` | Test the welcome greeting in the current channel |
| `/set log-channel` | Set the channel for server audit & event logging |
| `/set log-toggle` | Enable or disable audit & event logging |
| `/set log-disable` | Disable audit logging and clear the channel |
| `/set ticket-channel` | Set the channel for the support ticket panel |
| `/set ticket-toggle` | Enable or disable the support ticket system |
| `/set ticket-panel` | Post or update the interactive ticket creation panel |
| `/set ticket-transcript` | Set the channel for closed ticket transcript archival |
| `/set ticket-transcript-disable` | Disable ticket transcript archiving |
| `/set twitch-add` | Add a Twitch streamer to the live notification monitor |
| `/set twitch-remove` | Remove a Twitch streamer from the monitor |
| `/set twitch-list` | Display monitored Twitch channels |
| `/set default-volume` | Set the default audio playback volume |

---

## 🎫 Support Ticket Buttons & Thread Workflow

Master-Bot utilizes button listeners to eliminate command bloat:
1. **Open Ticket (`ticket_create`):** Clicking the button on the panel creates a dedicated Discord Thread (`🎫・ticket-username`), mentions the ticket creator, and presents the greeting embed with a **Close Ticket** button.
2. **Close Ticket (`ticket_close`):** Clicking the button marks the ticket closed, compiles a full `.txt` chat transcript if a transcript channel is configured, posts it with audit metadata, and locks/archives the thread.
