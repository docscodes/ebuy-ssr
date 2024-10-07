# Builder stage
FROM node:18-alpine AS base
FROM base AS builder
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=catalog --docker


# Installer stage
FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app

# First install the dependencies
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN yarn global add pnpm
RUN pnpm install --no-frozen-lockfile

# Build the project
COPY --from=builder /app/out/full/ ./
COPY turbo.json turbo.json
RUN ENV=PROD yarn turbo run build --filter=catalog...


### Runner stage
FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs
COPY --from=installer /app/apps/catalog/next.config.js .
COPY --from=installer /app/apps/catalog/package.json .

# Automatically leverage output traces to reduce image size
COPY --from=installer --chown=nextjs:nodejs /app/apps/catalog/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/catalog/.next/static ./apps/catalog/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/catalog/public ./apps/catalog/public
CMD node apps/catalog/server.js