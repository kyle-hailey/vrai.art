#!/bin/bash

# Script to update backend URL configuration
# Usage: ./scripts/update-backend-url.sh <new-backend-url>

if [ $# -eq 0 ]; then
    echo "Usage: $0 <new-backend-url>"
    echo "Example: $0 http://localhost:5000"
    echo "Example: $0 https://my-production-backend.com"
    exit 1
fi

NEW_URL=$1
CURRENT_DIR=$(pwd)

echo "Updating backend URL to: $NEW_URL"

# Update package.json proxy
if [ -f "package.json" ]; then
    echo "Updating package.json proxy..."
    sed -i.bak "s|\"proxy\": \"[^\"]*\"|\"proxy\": \"$NEW_URL\"|" package.json
    echo "✅ Updated package.json proxy"
else
    echo "❌ package.json not found"
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOF
# Backend Configuration
REACT_APP_BACKEND_URL=$NEW_URL

# Frontend Configuration (optional)
REACT_APP_FRONTEND_URL=http://localhost:3000
EOF
    echo "✅ Created .env file"
else
    echo "⚠️  .env file already exists. Please update REACT_APP_BACKEND_URL manually."
fi

echo ""
echo "🎉 Backend URL updated successfully!"
echo "📝 Don't forget to restart your development server for changes to take effect."
echo "📖 See CONFIGURATION.md for more details."
