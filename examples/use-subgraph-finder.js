#!/usr/bin/env node

/**
 * Example script demonstrating how to use the Subgraph Finder MCP server programmatically
 * 
 * This script shows how to:
 * 1. List all networks
 * 2. Find subgraphs by contract address
 * 3. Get a subgraph schema
 * 4. Match user intent with available subgraphs
 * 5. Query network statistics for all networks
 * 6. Query network statistics for a specific network (e.g., Scroll)
 */

import { spawn } from 'child_process';
import { createInterface } from 'readline';

// Path to the Subgraph Finder MCP server
const SERVER_PATH = '../build/index.js';

// Start the MCP server as a child process
const server = spawn('node', [SERVER_PATH], {
  stdio: ['pipe', 'pipe', process.stderr]
});

// Create readline interface for reading from the server
const rl = createInterface({
  input: server.stdout,
  crlfDelay: Infinity
});

// Set up event listeners
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});

// Parse JSON messages from the server
rl.on('line', (line) => {
  try {
    const message = JSON.parse(line);
    handleMessage(message);
  } catch (error) {
    console.error('Error parsing message:', error);
  }
});

// Handle messages from the server
function handleMessage(message) {
  if (message.jsonrpc !== '2.0') return;
  
  if (message.result) {
    console.log('Received result:');
    console.log(JSON.stringify(message.result, null, 2));
    
    // Continue with the next example after receiving a result
    nextExample();
  } else if (message.error) {
    console.error('Received error:');
    console.error(JSON.stringify(message.error, null, 2));
  }
}

// Send a JSON-RPC request to the server
function sendRequest(method, params) {
  const request = {
    jsonrpc: '2.0',
    id: Date.now(),
    method,
    params
  };
  
  console.log(`\nSending request: ${method}`);
  console.log(JSON.stringify(params, null, 2));
  
  server.stdin.write(JSON.stringify(request) + '\n');
}

// Example requests to demonstrate the server's capabilities
const examples = [
  // List all networks
  () => sendRequest('list_tools', {}),
  
  // List all networks
  () => sendRequest('call_tool', {
    name: 'list_networks',
    arguments: {}
  }),
  
  // Find subgraphs by contract address
  () => sendRequest('call_tool', {
    name: 'find_by_contract',
    arguments: {
      contractAddress: '0xd829c1d3649dbc3fd96d3d22500ef33a46daae46',
      network: 'arbitrum-one'
    }
  }),
  
  // Get a subgraph schema
  () => sendRequest('call_tool', {
    name: 'get_schema',
    arguments: {
      subgraphId: 'QmXKwSEMirgWVn41nRzkT3hpUBw29cp619Gx1BfmLvPNGy'
    }
  }),
  
  // Match user intent with available subgraphs
  () => sendRequest('call_tool', {
    name: 'match_intent',
    arguments: {
      intent: 'I want trading volume and liquidity for a DEX on Arbitrum',
      network: 'arbitrum-one'
    }
  }),
  
  // Query network statistics for all networks
  () => sendRequest('call_tool', {
    name: 'query_network_stats',
    arguments: {}
  }),
  
  // Query network statistics for a specific network
  () => sendRequest('call_tool', {
    name: 'query_network_stats',
    arguments: {
      network: 'scroll'
    }
  }),
  
  // Exit after all examples are done
  () => {
    console.log('\nAll examples completed!');
    server.stdin.end();
    process.exit(0);
  }
];

let currentExample = 0;

// Run the next example
function nextExample() {
  if (currentExample < examples.length) {
    examples[currentExample]();
    currentExample++;
  }
}

// Start the first example
console.log('Starting Subgraph Finder examples...');
nextExample();
