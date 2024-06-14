# Stage 1: Build the Rust backend
FROM rust:1-alpine as backend-builder
WORKDIR /usr/src
# Copy your source code
COPY ./apps/web/backend /usr/src/backend
WORKDIR /usr/src/backend
RUN apk add --no-cache libressl-dev musl-dev
# Build the application
RUN cargo build --release

# Stage 2: Build the React frontend
FROM node:18-alpine as frontend-builder
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY . .

RUN if [[ $(uname -m) == "aarch64" ]] ; then \
    wget https://raw.githubusercontent.com/squishyu/alpine-pkg-glibc-aarch64-bin/master/glibc-2.26-r1.apk ; \
    apk add --no-cache --allow-untrusted --force-overwrite glibc-2.26-r1.apk ; \
    rm glibc-2.26-r1.apk ; \
    else \
    wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.28-r0/glibc-2.28-r0.apk ; \
    wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub ; \
    apk add --no-cache --force-overwrite glibc-2.28-r0.apk ; \
    rm glibc-2.28-r0.apk ; \
    fi
RUN npm install -g bun turbo@^2

# RUN yarn install
# RUN yarn global add turbo@^2

RUN bun install
RUN turbo prune music --docker

# Stage 3: Install dependencies and build the project
FROM node:18-alpine as installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY --from=frontend-builder /app/out/json/ .
COPY --from=frontend-builder /app/out/yarn.lock ./yarn.lock
# RUN yarn install

RUN if [[ $(uname -m) == "aarch64" ]] ; then \
    wget https://raw.githubusercontent.com/squishyu/alpine-pkg-glibc-aarch64-bin/master/glibc-2.26-r1.apk ; \
    apk add --no-cache --allow-untrusted --force-overwrite glibc-2.26-r1.apk ; \
    rm glibc-2.26-r1.apk ; \
    else \
    wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.28-r0/glibc-2.28-r0.apk ; \
    wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub ; \
    apk add --no-cache --force-overwrite glibc-2.28-r0.apk ; \
    rm glibc-2.28-r0.apk ; \
    fi

RUN npm install -g bun
RUN bun install
COPY --from=frontend-builder /app/out/full/ .
RUN yarn run push 
RUN yarn run generate
RUN yarn turbo run build --filter=music

# Stage 4: Create the final image
FROM node:18-alpine as runner
WORKDIR /app

RUN if [[ $(uname -m) == "aarch64" ]] ; then \
    wget https://raw.githubusercontent.com/squishyu/alpine-pkg-glibc-aarch64-bin/master/glibc-2.26-r1.apk ; \
    apk add --no-cache --allow-untrusted --force-overwrite glibc-2.26-r1.apk ; \
    rm glibc-2.26-r1.apk ; \
    else \
    wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.28-r0/glibc-2.28-r0.apk ; \
    wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub ; \
    apk add --no-cache --force-overwrite glibc-2.28-r0.apk ; \
    rm glibc-2.28-r0.apk ; \
    fi

RUN npm install -g bun

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs
COPY --from=installer /app/apps/web/next.config.mjs .
COPY --from=installer /app/apps/web/package.json .
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/prisma ./apps/web/prisma
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/websocket ./apps/web/websocket
COPY --from=backend-builder /usr/src/backend/target/release/music-backend /usr/local/bin/music-backend

ENV PORT=80
EXPOSE 80
CMD ["sh", "-c", "/usr/local/bin/music-backend & node apps/web/server.js --port 80"]