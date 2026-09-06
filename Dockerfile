FROM --platform=linux/amd64 node:22-slim
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR "/Master-Bot"

# Single unified HTTP port shared by the bot, embedded dashboard and OAuth2
# callback server (HELIX single-process model)
EXPOSE 3000
ENV PORT 3000

# Install pnpm matching the repository's packageManager field
RUN npm install -g pnpm@8.6.7

# Copy files to Container (Excluding whats in .dockerignore)
COPY ./ ./
RUN pnpm install --ignore-scripts && pnpm build && pnpm --filter @master-bot/bot copy-scripts

# If you are running Master-Bot in a Standalone Container and need to connect
# to Lavalink on the container's host, uncomment the following ENV:
# ENV LAVA_HOST="host.docker.internal"

CMD ["pnpm", "start"]