# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

RUN apk add --no-cache dumb-init

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy built assets from builder
COPY --from=builder --chown=nodejs:nodejs /app/build ./build
COPY --chown=nodejs:nodejs package*.json ./

# Install serve to run the static files
RUN npm install -g serve

EXPOSE 3000

USER nodejs

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

ENTRYPOINT ["dumb-init", "--"]

CMD ["serve", "-s", "build", "-l", "3000"]
