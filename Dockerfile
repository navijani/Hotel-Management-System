# ==========================================
# Stage 1: Build Vite Frontend
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Install dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source code and build
COPY frontend/ ./
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ==========================================
# Stage 2: Production Backend Server
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app/backend

ENV NODE_ENV=production
ENV PORT=5000

# Install production backend dependencies
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy backend application source code
COPY backend/ ./

# Copy compiled static frontend build from Stage 1 into backend/public
COPY --from=frontend-builder /app/frontend/dist ./public

# Ensure uploads directory exists
RUN mkdir -p uploads

# Expose default port (Render automatically overrides PORT env var at runtime)
EXPOSE 5000

# Start Express server
CMD ["node", "server.js"]
