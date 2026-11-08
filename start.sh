#!/usr/bin/env bash
echo "====================================================================="
echo "  VEXO AI (OPEN BYOK EDITION) - MINECRAFT SERVER DEVELOPER & ADMIN"
echo "====================================================================="
echo ""

if [ ! -d "web/node_modules" ]; then
    echo "Installing web dependencies..."
    (cd web && npm install)
fi

echo "Access Vexo AI Studio at: http://localhost:3000"
node web/server/server.js
