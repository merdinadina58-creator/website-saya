#!/bin/bash
# Watchdog script to keep Next.js dev server running
# Automatically restarts if it dies

LOG="/home/z/my-project/dev.log"
PID_FILE="/home/z/my-project/.next-dev.pid"

while true; do
  # Check if server is responding
  if ! curl -sS --max-time 5 http://127.0.0.1:3000/ -o /dev/null 2>/dev/null; then
    echo "[$(date)] Server not responding, restarting..." >> "$LOG"
    
    # Kill any existing processes
    pkill -f "next dev" 2>/dev/null
    pkill -f "next-server" 2>/dev/null
    sleep 2
    
    # Start fresh
    cd /home/z/my-project
    npx next dev -p 3000 >> "$LOG" 2>&1 &
    echo $! > "$PID_FILE"
    disown
    
    # Wait for server to be ready
    for i in $(seq 1 30); do
      sleep 1
      if curl -sS --max-time 3 http://127.0.0.1:3000/ -o /dev/null 2>/dev/null; then
        echo "[$(date)] Server restarted successfully" >> "$LOG"
        break
      fi
    done
  fi
  
  sleep 10
done
