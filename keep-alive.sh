#!/bin/bash
# Keep-alive script that restarts the dev server when it dies
cd /home/z/my-project

while true; do
  echo "[$(date)] Starting dev server..."
  bun run dev > /home/z/my-project/dev.log 2>&1
  SERVER_PID=$!
  echo "[$(date)] Server started with PID $SERVER_PID"

  # Wait for the server to die
  wait $SERVER_PID 2>/dev/null
  EXIT_CODE=$?
  echo "[$(date)] Server exited with code $EXIT_CODE, restarting in 3s..."
  sleep 3
done
