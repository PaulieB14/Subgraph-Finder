#!/usr/bin/env node

/**
 * Example client for the Subgraph Finder Standalone Server
 * 
 * This script demonstrates how to use the Subgraph Finder API programmatically.
 * It makes requests to the API endpoints and displays the results.
 */

import axios from 'axios';

// API base URL
const API_BASE_URL = 'http://localhost:3002/api';

// Helper function to make API requests
async function makeRequest(endpoint, method = 'GET', data = null) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error making request to ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
}

// Example 1: List all networks
async function listNetworks() {
  console.log('\n=== Example 1: List all networks ===\n');
  
  try {
    const result = await makeRequest('/networks');
    console.log('Networks:');
    console.log(JSON.stringify(result.networks, null, 2));
  } catch (error) {
    console.error('Failed to list networks');
  }
}

// Example 2: Find subgraphs by contract address
async function findSubgraphsByContract() {
  console.log('\n=== Example 2: Find subgraphs by contract address ===\n');
  
  const contractAddress = '0xd829c1d3649dbc3fd96d3d22500ef33a46daae46';
  const network = 'arbitrum-one';
  
  try {
    const result = await makeRequest(`/subgraphs/contract/${contractAddress}?network=${network}`);
    console.log(`Subgraphs for contract ${contractAddress} on ${network}:`);
    console.log(JSON.stringify(result.subgraphs, null, 2));
  } catch (error) {
    console.error('Failed to find subgraphs by contract');
  }
}

// Example 3: Get schema for a subgraph
async function getSchema() {
  console.log('\n=== Example 3: Get schema for a subgraph ===\n');
  
  const subgraphId = 'QmXKwSEMirgWVn41nRzkT3hpUBw29cp619Gx1BfmLvPNGy';
  
  try {
    const result = await makeRequest(`/subgraphs/${subgraphId}/schema`);
    console.log(`Schema for subgraph ${subgraphId}:`);
    console.log(result.schema);
  } catch (error) {
    console.error('Failed to get schema');
  }
}

// Example 4: Match intent with available subgraphs
async function matchIntent() {
  console.log('\n=== Example 4: Match intent with available subgraphs ===\n');
  
  const intent = 'Get volume yesterday';
  const network = 'All Networks';
  
  try {
    const result = await makeRequest('/match', 'POST', { intent, network });
    console.log('Intent matching results:');
    console.log(`Recommendation: ${result.recommendation}`);
    console.log('Matches:');
    console.log(JSON.stringify(result.matches, null, 2));
  } catch (error) {
    console.error('Failed to match intent');
  }
}

// Run all examples
async function runExamples() {
  console.log('Subgraph Finder API Client Example\n');
  console.log('Make sure the Subgraph Finder server is running on http://localhost:3002\n');
  
  try {
    await listNetworks();
    await findSubgraphsByContract();
    await getSchema();
    await matchIntent();
    
    console.log('\nAll examples completed!');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Run the examples
runExamples();
