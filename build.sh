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
mkdir -p ../public/api
mkdir -p ../public/dashboard

# Copy API files
echo "Copying API files..."
cp -r dist/* ../public/api/

# Copy dashboard files
echo "Copying dashboard files..."
cp -r dashboard/* ../public/dashboard/

echo "Build completed successfully!"
