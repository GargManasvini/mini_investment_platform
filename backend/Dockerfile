# --- Stage 1: The "Builder" ---
# This stage installs dependencies and builds our application.
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# --- Stage 2: The Final "Runner" ---
# This stage creates the final, lightweight image.
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

# --- NEW: Set up the entrypoint script ---
# Copy the entrypoint script into the image
COPY docker-entrypoint.sh /usr/local/bin/
# Make the script executable
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 5000

# Set the entrypoint script to be the first thing that runs
ENTRYPOINT ["docker-entrypoint.sh"]

# The default command to run *after* the entrypoint script finishes
CMD ["npm", "start"]

