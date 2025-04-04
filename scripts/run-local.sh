#!/bin/bash

# This script sets up and runs the server locally to test the deployment

# Create the public directory structure
mkdir -p public/api
mkdir -p public/dashboard

# Build the server
cd standalone
npm install
npm run build

# Copy files to the public directory
cp -r dist/* ../public/api/
cp -r dashboard/* ../public/dashboard/
cd ..

# Copy the index.html to the public directory
cp public/index.html public/index.html.bak
cp public/dashboard/index.html public/index.html

# Install a simple HTTP server if not already installed
if ! command -v http-server &> /dev/null; then
    echo "Installing http-server..."
    npm install -g http-server
fi

# Run the server
echo "Starting API server..."
node public/api/index.js &
API_PID=$!

echo "Starting HTTP server for static files..."
http-server public -p 8080

# Clean up
kill $API_PID
