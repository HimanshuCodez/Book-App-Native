# Base Image for Building the App
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./


RUN npm install --only=production

COPY . .


FROM node:18-alpine

# Set working directory
WORKDIR /app

COPY --from=builder /app /app

# Expose the backend port
EXPOSE 4000

# Set environment to production
ENV NODE_ENV=production

# Start backend in production mode
CMD ["npm", "start"]
