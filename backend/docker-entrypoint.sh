#!/bin/sh
# This script is the entrypoint for the backend Docker container.
# It runs the database migration and seeding script before starting the main application.

echo "--- Running database migration script ---"
node scripts/migrate.js
echo "--- Migration script finished ---"

# The 'exec "$@"' command will then execute the CMD from the Dockerfile (e.g., "npm start")
# as the main process of the container.
exec "$@"
