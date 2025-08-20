#!/bin/bash

# Script to update backend configuration in one place
# Usage: ./update-config.sh <host> <port>
# Example: ./update-config.sh localhost 8000
# Example: ./update-config.sh my-production-server.com 80

if [ $# -eq 0 ]; then
    echo "Usage: $0 <host> [port]"
    echo "Examples:"
    echo "  $0 localhost 8000"
    echo "  $0 my-production-server.com 80"
    echo "  $0 192.168.1.100 5000"
    exit 1
fi

HOST=$1
PORT=${2:-8000}  # Default to 8000 if no port specified

echo "Updating backend configuration to: $HOST:$PORT"

# Update the root config.js file
sed -i.bak "s/host: process.env.BACKEND_HOST || '[^']*'/host: process.env.BACKEND_HOST || '$HOST'/" config.js
sed -i.bak "s/port: process.env.BACKEND_PORT || [0-9]*/port: process.env.BACKEND_PORT || $PORT/" config.js

echo "✅ Updated config.js"
echo ""
echo "🎉 Configuration updated successfully!"
echo "📝 Backend will now use: http://$HOST:$PORT"
echo ""
echo "💡 To apply changes:"
echo "   1. Restart your backend server"
echo "   2. Restart your frontend development server"
echo ""
echo "🌍 You can also set environment variables:"
echo "   export BACKEND_HOST=$HOST"
echo "   export BACKEND_PORT=$PORT"
echo ""
echo "📖 Or create a .env file in the root directory with:"
echo "   BACKEND_HOST=$HOST"
echo "   BACKEND_PORT=$PORT"
