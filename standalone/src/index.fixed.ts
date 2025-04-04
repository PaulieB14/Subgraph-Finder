/**
 * Subgraph Finder Standalone Server
 * 
 * This standalone server implements an HTTP API for the Subgraph Finder tool,
 * which helps users find the right subgraph in The Graph ecosystem based on their needs.
 * 
 * Features:
 * 1. Filter by Network: List available networks and filter subgraphs by network
 * 2. Filter by Smart Contract: Find subgraphs that index a specific contract address
 * 3. Retrieve Schemas: Get the schema for a specific subgraph
 * 4. AI-Assisted Matching: Match user intent with available subgraphs
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { networkRoutes } from './routes/networks.js';
import { subgraphRoutes } from './routes/subgraphs.js';
import { matchRoutes } from './routes/match.js';

// Load environment variables first, before any other code
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

// Routes
app.use('/api/networks', networkRoutes);
app.use('/api/subgraphs', subgraphRoutes);
app.use('/api/match', matchRoutes);

// Serve the dashboard
app.use('/dashboard', express.static(path.join(__dirname, '..', 'dashboard')));

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Subgraph Finder API',
    version: '0.1.0',
    description: 'An API to help users find the right subgraph in The Graph ecosystem',
    endpoints: [
      { path: '/api/networks', description: 'List all available networks' },
      { path: '/api/subgraphs/contract/:address', description: 'Find subgraphs by contract address' },
      { path: '/api/subgraphs/:id/schema', description: 'Get the schema for a specific subgraph' },
      { path: '/api/match', description: 'Match user intent with available subgraphs' }
    ]
  });
});

// Start server with error handling
try {
  app.listen(port, () => {
    console.log(`Subgraph Finder API running at http://localhost:${port}`);
    
    // Log configuration (without exposing the full API key)
    const apiKey = process.env.GRAPH_API_KEY;
    if (apiKey) {
      console.log(`Using Graph API Key: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);
    } else {
      console.log("Warning: No Graph API Key found in environment variables");
    }
    
    console.log(`Using Graph Hosted Service URL: ${process.env.GRAPH_HOSTED_SERVICE_URL || 'Not set'}`);
    console.log(`Using Graph Network Subgraph URL: ${process.env.GRAPH_NETWORK_SUBGRAPH_URL || 'Not set'}`);
  });
} catch (error) {
  console.error("Error starting server:", error);
  process.exit(1);
}
