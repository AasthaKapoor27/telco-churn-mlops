# # ─── Stage 1: builder ─────────────────────────────────────────────────────────
# FROM node:20-alpine AS builder
# WORKDIR /app
# COPY package.json .
# RUN npm install
# COPY . .
# ENV VITE_API_URL=http://localhost:8000
# RUN npm run build

# # ─── Stage 2: nginx serve ─────────────────────────────────────────────────────
# FROM nginx:alpine
# COPY --from=builder /app/dist /usr/share/nginx/html
# RUN echo 'server { listen 80; root /usr/share/nginx/html; index index.html; location / { try_files $uri $uri/ /index.html; } }' \
#     > /etc/nginx/conf.d/default.conf
# EXPOSE 80
# Build stage

#new file
FROM node:18-alpine as builder

WORKDIR /app

# Only copy package files first
COPY package.json package-lock.json ./

# Install fresh dependencies (no local pollution)
RUN npm install

# Copy rest of code
COPY . .

# FIX permissions explicitly
RUN chmod -R 755 node_modules/.bin

# Build app
RUN npx vite build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]