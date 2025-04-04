#!/usr/bin/env node

/**
 * Example of how to use the Subgraph Finder with Roo Code
 * 
 * This script demonstrates how to configure Roo Code to use the Subgraph Finder API.
 * It provides a sample configuration that can be used with Gemini and Roo Code.
 */

// Sample Roo Code configuration for Subgraph Finder
const rooCodeConfig = {
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

// Print the configuration
console.log("Roo Code Configuration for Subgraph Finder:");
console.log(JSON.stringify(rooCodeConfig, null, 2));

console.log("\n");
console.log("To use this configuration with Roo Code:");
console.log("1. Start the Subgraph Finder standalone server: npm start");
console.log("2. Configure Roo Code with the above configuration");
console.log("3. Use Gemini with Roo Code to interact with the Subgraph Finder");
console.log("\n");
console.log("Example prompts for Gemini:");
console.log("- \"List all networks in The Graph ecosystem\"");
console.log("- \"Find subgraphs that index the contract 0xd829c1d3649dbc3fd96d3d22500ef33a46daae46\"");
console.log("- \"Get the schema for subgraph QmXKwSEMirgWVn41nRzkT3hpUBw29cp619Gx1BfmLvPNGy\"");
console.log("- \"I want trading volume and liquidity for a DEX on Arbitrum\"");
