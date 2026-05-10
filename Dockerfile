# Builder stage
FROM debian:13.4-slim@sha256:109e2c65005bf160609e4ba6acf7783752f8502ad218e298253428690b9eaa4b AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update \
  && apt-get -y --no-install-recommends install \
    curl git ca-certificates build-essential \
  && rm -rf /var/lib/apt/lists/*

# Configure Mise environment
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
ENV MISE_DATA_DIR="/app/.mise"
ENV MISE_CONFIG_DIR="/app/.mise/config"
ENV MISE_CACHE_DIR="/app/.mise/cache"
ENV MISE_INSTALL_PATH="/usr/local/bin/mise"
ENV PATH="/app/.mise/shims:$PATH"
# Disable SSL cert validation for Idle Champions API (expired certificate)
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

# Copy configuration files for Mise and project
COPY .mise.toml ./
COPY package.json ./
COPY .env.example .env
COPY bin/mise ./bin/mise

# Trust the .mise.toml configuration file
RUN bin/mise trust

# Install tools and dependencies via Mise
RUN bin/mise install

# Install all dependencies (including dev) for building
RUN bin/mise run install

# Copy TypeScript source files
COPY tsconfig.bot.json ./
COPY src/bot ./src/bot
COPY src/lib ./src/lib

# Build the production bundle
RUN bin/mise run prod:build

# Production stage — only needs the compiled binary, no Bun or node_modules required
FROM debian:13.4-slim@sha256:109e2c65005bf160609e4ba6acf7783752f8502ad218e298253428690b9eaa4b AS production

WORKDIR /app

# Install only ca-certificates for HTTPS (the bot calls external APIs)
RUN apt-get update \
  && apt-get -y --no-install-recommends install \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Disable SSL cert validation for Idle Champions API (expired certificate)
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

# Copy the self-contained compiled executable from builder
COPY --from=builder /app/dist-bundle/bot ./dist-bundle/bot

# Create data and logs directories
RUN mkdir -p /app/data /app/api-logs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD pgrep -f "dist-bundle/bot" || exit 1

# Run the self-contained executable directly — no Bun, no Node, no mise needed
CMD ["/app/dist-bundle/bot"]
