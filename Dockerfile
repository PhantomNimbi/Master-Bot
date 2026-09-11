FROM --platform=linux/amd64 node:20-slim
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:./db.sqlite"
WORKDIR "/Master-Bot"

# Default service port
EXPOSE 3000
ENV PORT=3000

# Install prerequisites and native dependencies for canvas and SSL
RUN apt-get update && apt-get upgrade -y -q && \
    apt-get install -y -q openssl && \
    apt-get install -y -q --no-install-recommends libfontconfig1 && \
    apt-get clean && rm -rf /var/lib/apt/lists/* && \
    npm install -g pnpm@8.6.7

# Copy repository contents into container
COPY ./ ./

# Install all workspace dependencies
RUN pnpm install

# Build all workspace packages, Prisma Client, and Next.js dashboard
RUN pnpm build

# At container launch, sync database schema and start the unified service
CMD ["sh", "-c", "pnpm db:push && pnpm start"]