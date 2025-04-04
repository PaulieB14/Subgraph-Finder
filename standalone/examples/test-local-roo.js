#!/usr/bin/env node

/**
 * Test script for using Subgraph Finder with local Roo Code installation
 * 
 * This script demonstrates how to test the Subgraph Finder API with a local
 * Roo Code installation. It provides instructions and sample code for setting up
 * and testing the integration.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Configuration for Roo Code
const rooConfig = {
  "tools": [
    {
      "name": "subgraph-finder",
      "description": "Find the right subgraph in The Graph ecosystem based on your needs",
      "api": {
        "type": "openapi",
        "url": "http://localhost:3000/api",
        "endpoints": [
          {
            "path": "/networks",
            "method": "GET",
            "description": "List all available networks in The Graph ecosystem"
          },
          {
            "path": "/subgraphs/contract/{address}",
            "method": "GET",
            "description": "Find subgraphs that index a specific contract address",
            "parameters": [
              {
                "name": "address",
                "description": "Ethereum contract address (e.g., 0xd829c1d3649dbc3fd96d3d22500ef33a46daae46)"
              },
              {
                "name": "network",
                "description": "Network ID (e.g., mainnet, arbitrum-one)",
                "required": false
              }
            ]
          },
          {
            "path": "/subgraphs/{id}/schema",
            "method": "GET",
            "description": "Get the schema for a specific subgraph",
            "parameters": [
              {
                "name": "id",
                "description": "ID of the subgraph"
              }
            ]
          },
          {
            "path": "/match",
            "method": "POST",
            "description": "Match user intent with available subgraphs",
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "intent": {
                        "type": "string",
                        "description": "User's intent (e.g., 'I want trading volume and liquidity for a DEX on Arbitrum')"
                      },
                      "network": {
                        "type": "string",
                        "description": "Optional network ID to filter by"
                      }
                    },
                    "required": ["intent"]
                  }
                }
              }
            }
          }
        ]
      }
    }
  ]
};

// Sample test prompts
const testPrompts = [
  "List all networks in The Graph ecosystem",
  "Find subgraphs that index the contract 0xd829c1d3649dbc3fd96d3d22500ef33a46daae46",
  "Get the schema for subgraph QmXKwSEMirgWVn41nRzkT3hpUBw29cp619Gx1BfmLvPNGy",
  "I want trading volume and liquidity for a DEX on Arbitrum"
];

// Function to check if the Subgraph Finder server is running
function checkServerRunning() {
  try {
    execSync('curl -s http://localhost:3000/api/networks', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Main function
function main() {
  console.log('=== Subgraph Finder Local Roo Code Test ===\n');
  
  // Check if server is running
  if (!checkServerRunning()) {
    console.log('❌ Subgraph Finder server is not running!');
    console.log('Please start the server first:');
    console.log('  cd standalone');
    console.log('  npm start\n');
    process.exit(1);
  }
  
  console.log('✅ Subgraph Finder server is running\n');
  
  // Instructions for setting up Roo Code
  console.log('=== Setting up Roo Code ===\n');
  console.log('1. Install Roo Code if you haven\'t already:');
  console.log('   Visit https://docs.roocode.com/getting-started/installation for installation instructions\n');
  
  console.log('2. Create a Roo Code configuration file:');
  console.log('   mkdir -p ~/.roo');
  console.log('   touch ~/.roo/config.json\n');
  
  // Save the configuration to a local file
  const configPath = path.join(process.cwd(), 'roo-config.json');
  fs.writeFileSync(configPath, JSON.stringify(rooConfig, null, 2));
  console.log(`✅ Saved Roo configuration to: ${configPath}\n`);
  
  console.log('3. Copy this configuration to your Roo config file:');
  console.log(`   cat ${configPath} > ~/.roo/config.json\n`);
  
  console.log('=== Testing with Roo Code ===\n');
  console.log('1. Start a Roo session:');
  console.log('   roo chat\n');
  
  console.log('2. Try these test prompts:');
  testPrompts.forEach((prompt, index) => {
    console.log(`   ${index + 1}. "${prompt}"`);
  });
  console.log('\n');
  
  console.log('=== Manual Testing with Roo CLI ===\n');
  console.log('You can also test the tool directly with the Roo CLI:');
  console.log('   roo tools subgraph-finder list_networks\n');
  
  console.log('Or test finding subgraphs by contract:');
  console.log('   roo tools subgraph-finder find_by_contract --contractAddress 0xd829c1d3649dbc3fd96d3d22500ef33a46daae46\n');
  
  console.log('=== Troubleshooting ===\n');
  console.log('If you encounter issues:');
  console.log('1. Make sure the Subgraph Finder server is running');
  console.log('2. Check that your Roo configuration is correct');
  console.log('3. Verify that Roo can access the API (no firewall issues)');
  console.log('4. Try restarting the Roo CLI');
  console.log('\nFor more information, see the Roo documentation: https://docs.roocode.com/\n');
}

// Run the main function
main();
