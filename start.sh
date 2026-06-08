#!/bin/bash
# Start the Xtara web app on port 5077

# Increase file descriptor limit to avoid EMFILE errors
ulimit -n 10240

# Clear stale Next.js cache
rm -rf .next

PORT=5077 npm run dev
