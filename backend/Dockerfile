# --- Stage 1: The "Builder" ---
# This stage installs dependencies and builds our application.
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy the rest of the application source code
COPY . .

# --- Stage 2: The Final "Runner" ---
# This stage creates the final, lightweight image.
FROM node:20-alpine

WORKDIR /app

# Copy the installed node_modules from the "builder" stage
COPY --from=builder /app/node_modules ./node_modules

# Copy the application code from the "builder" stage
COPY --from=builder /app ./

# Expose the port the app runs on
EXPOSE 5000

# The command to start the application in production
CMD ["npm", "start"]
