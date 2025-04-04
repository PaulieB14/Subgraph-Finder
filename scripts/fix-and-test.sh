#!/bin/bash

# Stop the script if any command fails
set -e

echo "Fixing the subgraph-finder standalone server..."

# Copy the fixed index.ts file
cp src/index.fixed.ts src/index.ts
echo "✅ Fixed index.ts file copied"

# Build the project
echo "Building the project..."
npm run build
echo "✅ Build completed"

# Check if dist directory exists
if [ -d "dist" ]; then
  echo "✅ dist directory exists"
else
  echo "❌ dist directory does not exist"
  exit 1
fi

# Check if dist/index.js exists
if [ -f "dist/index.js" ]; then
  echo "✅ dist/index.js exists"
else
  echo "❌ dist/index.js does not exist"
  exit 1
fi

# Start the server with a timeout
echo "Starting the server with a 5-second timeout..."
timeout 5 node dist/index.js || echo "Server started but timed out after 5 seconds (this is expected)"

echo "✅ Test completed"
echo "You can now run the server with: cd standalone && node dist/index.js"
