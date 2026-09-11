#!/usr/bin/env sh
#
# Heroku prebuild step (package.json -> "heroku-prebuild"):
# downloads the latest Lavalink v4 jar and prepares application.yml so the
# audio engine runs inside the same dyno as the bot (eco dyno friendly).
#
# IMPORTANT: application.yml is created from OUR application.yml.example,
# which is a custom config with fixes (YouTube multi-client + OAuth,
# lavasrc Spotify resolution, tuned buffers). The stock application.yml
# shipped with the Lavalink release is NOT used.
#
# Runs on every Heroku build. Override the version via the LAVALINK_VERSION
# config var if a specific release is required.

set -eu

echo ":: resolving latest Lavalink v4 release from lavalink-devs/Lavalink..."
LAVALINK_VERSION="$(
	curl -fsSL https://api.github.com/repos/lavalink-devs/Lavalink/releases/latest |
		sed -n 's/.*"tag_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' |
		head -n1
)"

if [ -z "${LAVALINK_VERSION:-}" ]; then
	echo ":: could not resolve latest release, using 4.2.2"
	LAVALINK_VERSION="4.2.2"
fi

echo ":: downloading Lavalink ${LAVALINK_VERSION} (Lavalink.jar)..."
curl -fL --retry 3 -o Lavalink.jar \
	"https://github.com/lavalink-devs/Lavalink/releases/download/${LAVALINK_VERSION}/Lavalink.jar"

if [ ! -f application.yml ] && [ -f application.yml.example ]; then
	echo ":: creating application.yml from the repo template (application.yml.example)"
	cp application.yml.example application.yml
fi

ls -lh Lavalink.jar