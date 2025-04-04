#!/bin/bash

# Stop the script if any command fails
set -e

echo "Applying quick fix to the subgraph-finder standalone server..."

# Create a minimal index.js file directly in the dist directory
mkdir -p dist

cat > dist/index.js << 'EOF'
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

console.log(`Starting server on port ${port}`);

// Middleware
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Subgraph Finder API',
    version: '0.1.0',
    description: 'An API to help users find the right subgraph in The Graph ecosystem',
    status: 'Running in minimal mode due to quick fix'
  });
});

// Start server with error handling
try {
  app.listen(port, () => {
    console.log(`Subgraph Finder API running at http://localhost:${port}`);
    console.log('Running in minimal mode due to quick fix');
  });
} catch (error) {
  console.error("Error starting server:", error);
  process.exit(1);
}
EOF

echo "✅ Created minimal index.js file"
echo "You can now run the server with: cd standalone && node dist/index.js"
