# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy custom nginx config
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
RUN echo 'server {\
    listen 80;\
    server_name localhost;\
    \
    location / {\
        root /usr/share/nginx/html;\
        index index.html index.htm;\
        try_files $uri $uri/ /index.html;\
    }\
    \
    location /static/ {\
        root /usr/share/nginx/html;\
        expires 1y;\
        add_header Cache-Control "public, immutable";\
    }\
    \
    # Security headers\
    add_header X-Frame-Options DENY;\
    add_header X-Content-Type-Options nosniff;\
    add_header X-XSS-Protection "1; mode=block";\
    add_header Referrer-Policy "strict-origin-when-cross-origin";\
}' > /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]