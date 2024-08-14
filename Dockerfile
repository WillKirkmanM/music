# Stage 1: Build the Rust backend
FROM rust:slim-buster AS backend-builder
WORKDIR /usr/src

RUN apt-get update && apt-get install -y --no-install-recommends \
    sqlite3 libsqlite3-dev wget make build-essential pkg-config libssl-dev \
    && rm -rf /var/lib/apt/lists/*

RUN wget https://www.nasm.us/pub/nasm/releasebuilds/2.16/nasm-2.16.tar.gz \
    && tar xzf nasm-2.16.tar.gz \
    && cd nasm-2.16 \
    && ./configure \
    && make \
    && make install \
    && cd .. \
    && rm -rf nasm-2.16 nasm-2.16.tar.gz
    
RUN cargo install diesel_cli --no-default-features --features sqlite

COPY ./crates/backend /usr/src/crates/backend
COPY ./diesel.toml /usr/src/diesel.toml

WORKDIR /usr/src/crates/backend

ENV DATABASE_URL=sqlite:///usr/src/crates/backend/music.db

RUN diesel migration run --config-file /usr/src/diesel.toml

RUN cargo build --release

# Stage 2: Build the React frontend
FROM oven/bun:alpine AS frontend-builder
RUN apk update
RUN apk add --no-cache nodejs npm
WORKDIR /app
COPY . .

RUN bun install --ignore-scripts
RUN bun install -g turbo yarn
RUN turbo prune music --docker

# Stage 3: Install dependencies and build the project
FROM oven/bun:alpine AS installer
WORKDIR /app
COPY --from=frontend-builder /app/out/json/ . 
COPY --from=frontend-builder /app/out/yarn.lock ./yarn.lock

RUN bun install --ignore-scripts
COPY --from=frontend-builder /app/out/full/ . 
COPY ./package.json ./package.json
COPY ./bun.lockb ./bun.lockb
COPY ./bunfig.toml ./bunfig.toml
COPY ./yarn.lock ./yarn.lock

WORKDIR /app/apps/web
RUN bun run build

# Stage 4: Create the final image
FROM debian:bullseye-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libssl1.1 \
    sqlite3 \
    libsqlite3-dev \
    wget \
    && rm -rf /var/lib/apt/lists/*

RUN wget --no-check-certificate https://github.com/meilisearch/meilisearch/releases/download/v1.9.0/meilisearch-linux-amd64 \
    && chmod +x meilisearch-linux-amd64 \
    && mv meilisearch-linux-amd64 /usr/local/bin/meilisearch

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Change ownership of the /app directory to the nextjs user
RUN chown -R nextjs:nodejs /app

USER nextjs
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/out ./apps/web/out
COPY --from=backend-builder /usr/src/crates/backend/target/release/music-backend /usr/local/bin/music-backend
COPY --from=backend-builder /usr/src/crates/backend/music.db /usr/src/crates/backend/music.db

EXPOSE 80
EXPOSE 7700

# Run both Meilisearch and music-backend
CMD ["/bin/sh", "-c", "/usr/local/bin/meilisearch --http-addr 0.0.0.0:7700 & /usr/local/bin/music-backend --port 80"]