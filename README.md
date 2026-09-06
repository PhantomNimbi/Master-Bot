# A Discord Music Bot written in TypeScript using Sapphire, discord.js, Next.js and React

[![image](https://img.shields.io/badge/language-typescript-blue)](https://www.typescriptlang.org)
[![image](https://img.shields.io/badge/node-%3E%3D%2018.0.0-blue)](https://nodejs.org/)
[![image](https://img.shields.io/badge/pnpm-%3E%3D%208.0.0-orange)](https://pnpm.io/)
[![image](https://img.shields.io/badge/license-MIT-yellow)](LICENSE.md)

## System dependencies

- [Node.js LTS or latest](https://nodejs.org/en/download/) (>= 18.0.0)
- [Java 17+](https://www.azul.com/downloads/?package=jdk#download-openjdk) (Required for Lavalink v4)
- [PostgreSQL](https://www.postgresql.org/) (Local, Docker, or Cloud)
- [Redis](https://redis.io/) (Local, Docker, or Cloud)
- [pnpm](https://pnpm.io/) (Package manager)

## Setup bot

Create an [application.yml](application.yml.example) file in the root folder.

Download the latest Lavalink jar from [here](https://github.com/Cog-Creators/Lavalink-Jars/releases) and also place it in the root folder.

### PostgreSQL

#### Linux

Either from the official site or follow the tutorial for your [distro](https://www.digitalocean.com/community/tutorial_collections/how-to-install-and-use-postgresql).

#### MacOS

Get [brew](https://brew.sh), then enter `brew install postgresql`.

#### Windows

Getting Postgres and Prisma to work together on Windows is easy with native PostgreSQL, Docker, or cloud databases. See the [Setup Guide](wiki/Setup.md) or [Cloud Hosting Guide](wiki/Hosting.md) for step-by-step instructions.

### Redis

#### MacOS

`brew install redis`.

#### Windows

Download from [here](https://redis.io/download/) or use Memurai / WSL.

#### Linux

Follow the instructions [here](https://redis.io/docs/getting-started/installation/install-redis-on-linux/).

### Settings (env)

Create a `.env` file in the root directory and copy the contents of `.env.example` to it.
Note: if you are not hosting postgres with a shadow database you do not need the `SHADOW_DB_URL` variable.

```env
# DB URL
DATABASE_URL="postgresql://john:doe@localhost:5432/master-bot?schema=public"
SHADOW_DB_URL="postgresql://john:doe@localhost:5432/master-bot-shadow?schema=public"

# Bot Token & Owner
DISCORD_TOKEN=""
DISCORD_OWNER_ID=""

# NextAuth & Web Dashboard
NEXTAUTH_SECRET="somesupersecrettwelvelengthword"
NEXTAUTH_URL=
NEXTAUTH_URL_INTERNAL=http://localhost:3000
NEXT_PUBLIC_INVITE_URL="https://discord.com/api/oauth2/authorize?client_id=yourclientid&permissions=8&scope=bot"

# Next Auth Discord Provider
DISCORD_CLIENT_ID=""
DISCORD_CLIENT_SECRET=""

# Redis Cache
REDIS_HOST="127.0.0.1"
REDIS_PORT=6379
REDIS_PASSWORD=""

# Lavalink v4 Audio Engine
LAVA_ENABLED=true
LAVA_HOST="127.0.0.1"
LAVA_PASS="youshallnotpass"
LAVA_PORT=2333
LAVA_SECURE=false

# Spotify Metadata
SPOTIFY_CLIENT_ID=""
SPOTIFY_CLIENT_SECRET=""

# Twitch Stream Alerts
TWITCH_ENABLED=false
TWITCH_CLIENT_ID=""
TWITCH_CLIENT_SECRET=""

# Media & Search APIs
KLIPY_API=""
NEWS_ENABLED=false
NEWS_API=""
GENIUS_API=""
IGDB_ENABLED=false
IGDB_CLIENT_ID=""
IGDB_CLIENT_SECRET=""
```

#### Gif features

If you have no use in the gif commands, leave `KLIPY_API` empty. Same applies for Twitch, News, and IGDB; everything else is needed for core music and dashboard features.

#### DB URL

Change 'john' to your pc username and 'doe' to some password, or set the name and password you created when you installed Postgres.

#### Bot Token

Generate a token in your Discord developer portal.

#### Next Auth

You can leave everything as is, just change 'yourclientid' in `NEXT_PUBLIC_INVITE_URL` to your Discord bot id and then change 'domain' in `NEXTAUTH_URL` to your domain or public ip. You can find your public ip by going to [whatismyip.com](https://www.whatismyip.com/).

#### Next Auth Discord Provider

Go to the OAuth2 tab in the developer portal, copy the Client ID to `DISCORD_CLIENT_ID` and generate a secret to place in `DISCORD_CLIENT_SECRET`. Also, set the following URLs under 'Redirects':

- `http://localhost:3000/api/auth/callback/discord`
- `http://domain:3000/api/auth/callback/discord`

Make sure to change 'domain' in `http://domain:3000/api/auth/callback/discord` to your domain or public ip.

#### Lavalink

You can leave this as long as the values match your `application.yml`.

#### Spotify and Twitch

Create an application in each platform's developer portal and paste the relevant values.

#### Pnpm

Install pnpm:
`npm install -g pnpm` or on Windows `iwr https://get.pnpm.io/install.ps1 -useb | iex` or on Mac using Homebrew `brew install pnpm`

# Running the bot

1. If you followed everything right, hit `pnpm i` in the root folder. When it finishes make sure prisma didn't error.
2. Open a separate terminal in the root folder and run `java -jar Lavalink.jar` (must be running all the time for music).
3. Wait a few seconds and run `pnpm dev` in the root folder in another terminal window.
4. If everything works, your bot and dashboard should be running.
5. (Optional) Run the Vitest test suite with `pnpm test`.
6. Enjoy!

# Commands

A full list of commands for use with Master Bot

## Music

| Command               | Description                                                                                                               | Usage                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| /play                 | Play any song or playlist from youtube, you can do it by searching for a song by name or song url or playlist url         | /play darude sandstorm                                |
| /pause                | Pause the current playing song                                                                                            | /pause                                                |
| /resume               | Resume the current paused song                                                                                            | /resume                                               |
| /leave                | Leaves voice channel if in one                                                                                            | /leave                                                |
| /remove               | Remove a specific song from queue by its number in queue                                                                  | /remove 4                                             |
| /queue                | Display the song queue                                                                                                    | /queue                                                |
| /shuffle              | Shuffle the song queue                                                                                                    | /shuffle                                              |
| /skip                 | Skip the current playing song                                                                                             | /skip                                                 |
| /skipall              | Skip all songs in queue                                                                                                   | /skipall                                              |
| /skipto               | Skip to a specific song in the queue, provide the song number as an argument                                              | /skipto 5                                             |
| /volume               | Adjust song volume                                                                                                        | /volume 80                                            |
| /music-trivia         | Engage in a music trivia with your friends. You can add more songs to the trivia pool in resources/music/musictrivia.json | /music-trivia                                         |
| /loop                 | Loop the currently playing song or queue                                                                                  | /loop                                                 |
| /lyrics               | Get lyrics of any song or the lyrics of the currently playing song                                                        | /lyrics song-name                                     |
| /jump                 | Jump to a specific position in the track queue                                                                            | /jump 3                                               |
| /seek                 | Seek to a specific timestamp in the current song                                                                          | /seek 1:30                                            |
| /bassboost            | Apply bassboost audio filter                                                                                              | /bassboost level: high                                |
| /nightcore            | Apply nightcore audio filter                                                                                              | /nightcore                                            |
| /vaporwave            | Apply vaporwave audio filter                                                                                              | /vaporwave                                            |
| /karaoke              | Apply karaoke audio filter                                                                                                | /karaoke                                              |
| /create-playlist      | Create a custom playlist                                                                                                  | /create-playlist 'playlistname'                       |
| /save-to-playlist     | Add a song or playlist to a custom playlist                                                                               | /save-to-playlist 'playlistname' 'yt or spotify url'  |
| /remove-from-playlist | Remove a track from a custom playlist                                                                                     | /remove-from-playlist 'playlistname' 'track location' |
| /my-playlists         | Display your custom playlists                                                                                             | /my-playlists                                         |
| /display-playlist     | Display a custom playlist                                                                                                 | /display-playlist 'playlistname'                      |
| /delete-playlist      | Remove a custom playlist                                                                                                  | /delete-playlist 'playlistname'                       |

## Gifs

| Command    | Description                | Usage      |
| ---------- | -------------------------- | ---------- |
| /gif       | Get a random gif           | /gif       |
| /jojo      | Get a random jojo gif      | /jojo      |
| /gintama   | Get a random gintama gif   | /gintama   |
| /anime     | Get a random anime gif     | /anime     |
| /baka      | Get a random baka gif      | /baka      |
| /cat       | Get a cute cat picture     | /cat       |
| /doggo     | Get a cute dog picture     | /doggo     |
| /hug       | Get a random hug gif       | /hug       |
| /slap      | Get a random slap gif      | /slap      |
| /pat       | Get a random pat gif       | /pat       |
| /triggered | Get a random triggered gif | /triggered |
| /amongus   | Get a random Among Us gif  | /amongus   |
| /waifu     | Get a random waifu picture | /waifu     |
| /smug      | Get a random smug gif      | /smug      |
| /kiss      | Get a random kiss gif      | /kiss      |
| /cuddle    | Get a random cuddle gif    | /cuddle    |

## Moderation

| Command   | Description                            | Usage                  |
| --------- | -------------------------------------- | ---------------------- |
| /ban      | Ban a user from the server             | /ban @user spamming    |
| /kick     | Kick a user from the server            | /kick @user breaking rules |
| /timeout  | Timeout (mute) a user for a duration   | /timeout @user 10m     |
| /slowmode | Set slowmode rate limit for a channel  | /slowmode 5s           |
| /purge    | Bulk delete a number of messages       | /purge 25              |

## Other

| Command           | Description                                                                                                                                                        | Usage                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- |
| /set              | Configure server settings (logging, tickets, welcome messages, suggestions, etc.)                                                                                   | /set logs #audit-log                    |
| /poll             | Create an interactive multi-choice poll with buttons                                                                                                               | /poll title: "Favorite color?"          |
| /reminder         | Set, list, or delete personal and server reminders                                                                                                                 | /reminder set 1h "Check pizza"          |
| /weather          | Get current weather and forecast for any location                                                                                                                  | /weather London                         |
| /fortune          | Get a fortune cookie tip                                                                                                                                           | /fortune                                |
| /insult           | Generate an evil insult                                                                                                                                            | /insult                                 |
| /chucknorris      | Get a satirical fact about Chuck Norris                                                                                                                            | /chucknorris                            |
| /motivation       | Get a random motivational quote                                                                                                                                    | /motivation                             |
| /random           | Generate a random number between two provided numbers                                                                                                              | /random 0 100                           |
| /8ball            | Get the answer to anything!                                                                                                                                        | /8ball Is this bot awesome?             |
| /rps              | Rock Paper Scissors                                                                                                                                                | /rps                                    |
| /bored            | Generate a random activity!                                                                                                                                        | /bored                                  |
| /advice           | Get some advice!                                                                                                                                                   | /advice                                 |
| /connect-four     | Play Connect Four interactively with buttons                                                                                                                       | /connect-four @opponent                 |
| /tic-tac-toe      | Play Tic-Tac-Toe interactively with buttons                                                                                                                        | /tic-tac-toe @opponent                  |
| /game-search      | Search for game information                                                                                                                                        | /game-search super-metroid              |
| /tv-show-search   | Search for TV show information                                                                                                                                     | /tv-show-search "Breaking Bad"          |
| /kanye            | Get a random Kanye quote                                                                                                                                           | /kanye                                  |
| /world-news       | Latest headlines from world news via NewsAPI                                                                                                                       | /world-news                             |
| /translate        | Translate to any language using Google translate (only supported languages)                                                                                        | /translate english ありがとう           |
| /about            | Info about the bot and the repository                                                                                                                              | /about                                  |
| /urban            | Get definitions from urban dictionary                                                                                                                              | /urban javascript                       |
| /activity         | Generate an invite link to your voice channel's activity                                                                                                           | /activity Chill                         |
| /twitch-status    | Check the status of a Twitch streamer                                                                                                                              | /twitch-status streamer: bacon_fixation |
| /dashboard        | Get the link to the web dashboard                                                                                                                                  | /dashboard                              |
| /youtube-auth     | Re-trigger YouTube OAuth Device Flow (Owner only)                                                                                                                  | /youtube-auth                           |

## Resources

[Master Documentation Wiki](wiki/Home.md)

[Getting Started & Setup Guide](wiki/Setup.md)

[Cloud & Platform Hosting Guide](wiki/Hosting.md)

[Lavalink v4 Audio Engine Guide](wiki/Lavalink.md)

[Web Dashboard Guide](wiki/Dashboard.md)

[Configuration & API Keys Guide](wiki/Configuration.md)

[Complete Commands Reference](wiki/Commands.md)

[Testing & Quality Assurance Guide](wiki/Testing.md)

## Contributing

Fork it and submit a pull request!
Anyone is welcome to suggest new features and improve code quality!
See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines.

## Contributors ❤️

**⭐ [Bacon Fixation](https://github.com/Bacon-Fixation) ⭐ - Countless contributions**

[ModoSN](https://github.com/ModoSN) - 'resolve-ip', 'rps', '8ball', 'bored', 'trump', 'advice', 'kanye', 'urban dictionary' commands and visual updates

[PhantomNimbi](https://github.com/PhantomNimbi) - bring back gif commands, lavalink config tweaks, next.js 15 dashboard rewrite, vitest test suite, moderation & ticket system, cloud hosting guides

[Natemo6348](https://github.com/Natemo6348) - 'mute', 'unmute'

[kfirmeg](https://github.com/kfirmeg) - play command flags, dockerization, docker wiki

[rafaeldamasceno](https://github.com/rafaeldamasceno) - 'music-trivia' and Dockerfile improvements, minor tweaks

[navidmafi](https://github.com/navidmafi) - 'LeaveTimeOut' and 'MaxResponseTime' options, update issue template, fix leave command

[Kyoyo](https://github.com/NotKyoyo) - added back 'now-playing'

[MontejoJorge](https://github.com/MontejoJorge) - added back 'remind'

[malokdev](https://github.com/malokdev) - 'uptime' command

[chimaerra](https://github.com/chimaerra) - minor command tweaks
