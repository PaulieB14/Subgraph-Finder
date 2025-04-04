#!/bin/bash

# Exit on error
set -e

echo "Starting build process..."

# Navigate to standalone directory
cd standalone

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the TypeScript code
echo "Building TypeScript code..."
npm run build

# Create necessary directories
echo "Creating output directories..."
mkdir -p dist

# Ensure the dashboard directory exists
if [ ! -d "dist/dashboard" ]; then
  echo "Copying dashboard files..."
  mkdir -p dist/dashboard
  cp -r dashboard/* dist/dashboard/
fi

echo "Build completed successfully!"
