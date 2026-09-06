# 🎵 Music & Playlist Commands Reference

Complete reference for music playback and playlist management commands.

---

## Playback & Queue Commands

| Command | Description | Usage |
| :--- | :--- | :--- |
| `/play` | Play a song, playlist, or YouTube/Spotify query | `/play query: darude sandstorm` |
| `/pause` | Pause active song playback | `/pause` |
| `/resume` | Resume paused playback | `/resume` |
| `/skip` | Skip current song | `/skip` |
| `/skipto` | Skip to a specific track number in queue | `/skipto track: 5` |
| `/skipall` | Clear queue and stop playback | `/skipall` |
| `/queue` | View current song queue | `/queue` |
| `/shuffle` | Shuffle tracks in queue | `/shuffle` |
| `/volume` | Adjust volume (1-200%) | `/volume percent: 80` |
| `/loop` | Loop current song or queue | `/loop mode: song` |
| `/seek` | Seek to a specific timestamp | `/seek timestamp: 1:30` |
| `/lyrics` | Fetch lyrics for current or searched track | `/lyrics song: bohemian rhapsody` |
| `/music-trivia` | Start an interactive music trivia game | `/music-trivia` |
| `/leave` | Disconnect bot from voice channel | `/leave` |

---

## Audio DSP Filter Commands

| Command | Description | Usage |
| :--- | :--- | :--- |
| `/bassboost` | Apply bassboost audio filter | `/bassboost level: high` |
| `/nightcore` | Apply nightcore tempo/pitch filter | `/nightcore` |
| `/vaporwave` | Apply vaporwave tempo/pitch filter | `/vaporwave` |
| `/karaoke` | Apply vocal suppression filter | `/karaoke` |

---

## Playlist Management Commands

| Command | Description | Usage |
| :--- | :--- | :--- |
| `/create-playlist` | Create a new custom playlist | `/create-playlist name: "Favorites"` |
| `/save-to-playlist` | Save track to playlist | `/save-to-playlist name: "Favorites" query: "..."` |
| `/remove-from-playlist` | Remove track from playlist | `/remove-from-playlist name: "Favorites" index: 1` |
| `/my-playlists` | View all custom playlists | `/my-playlists` |
| `/display-playlist` | View tracks in playlist | `/display-playlist name: "Favorites"` |
| `/delete-playlist` | Delete a custom playlist | `/delete-playlist name: "Favorites"` |
