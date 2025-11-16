# -------------------------------
# Stage 1: Build the frontend
# -------------------------------
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json & package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy all source files
COPY . .

# Build the frontend
RUN npm run build

# -------------------------------
# Stage 2: Serve with Nginx
# -------------------------------
FROM nginx:alpine

# Remove default static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx config
#COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose ports
EXPOSE 443

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
