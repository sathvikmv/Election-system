# DEFINITIVE Node 20 Dockerfile for Next.js 15
FROM node:20-bullseye
WORKDIR /app

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Set Port
ENV PORT=8080
EXPOSE 8080

# Start application
CMD ["npm", "start"]
