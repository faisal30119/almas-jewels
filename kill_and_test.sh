#!/bin/bash
pkill -f "vite|tsx|node"
sleep 2
NODE_ENV=production node dist/server.cjs &
PID=$!
sleep 3
curl -s http://localhost:3000/api/products > test_prod_output.json
kill $PID
