# Ironclad Dockerfile for Next.js 15 on Cloud Run
FROM node:20-slim AS builder
WORKDIR /app

# Disable telemetry and set build env
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Install dependencies with clean slate
COPY package.json package-lock.json* ./
RUN npm ci --only=production || npm install --only=production

# Copy source and build
COPY . .
RUN npm run build

# Final runner stage
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 8080

CMD ["npm", "start"]
