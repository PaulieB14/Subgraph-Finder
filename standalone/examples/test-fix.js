#!/usr/bin/env node

/**
 * Test script to verify the fixes for:
 * 1. findSubgraphsByContract function not returning the correct network ID
 * 2. getSubgraphSchema function not working with the correct query format
 */

import { findSubgraphsByContract, getSubgraphSchema } from '../build/services/graph-service.js';

async function testFindSubgraphsByContract() {
  console.log('Testing findSubgraphsByContract with Uniswap V3 contract...');
  
  try {
    // Test with the Uniswap V3 contract address
    const contractAddress = '0x1F98431c8aD98523631AE4a59f267346ea31F984';
    const subgraphs = await findSubgraphsByContract(contractAddress);
    
    console.log(`Found ${subgraphs.length} subgraphs for contract ${contractAddress}`);
    
    // Check if we found the expected subgraph with the correct network ID
    const uniswapOptimism = subgraphs.find(sg => 
      sg.id === '6ZM4U5FkFLop2Fjtaz4q8Q7zwDvEVJQhWpAPBy6vT632' && 
      sg.network === 'optimism'
    );
    
    if (uniswapOptimism) {
      console.log('✅ Successfully found Uniswap V3 Optimism subgraph with correct network ID');
      console.log('Subgraph details:', uniswapOptimism);
    } else {
      console.log('❌ Failed to find Uniswap V3 Optimism subgraph with correct network ID');
      console.log('Found subgraphs:', subgraphs);
    }
  } catch (error) {
    console.error('Error testing findSubgraphsByContract:', error);
  }
}

async function testGetSubgraphSchema() {
  console.log('\nTesting getSubgraphSchema with a subgraph ID...');
  
  try {
    // Test with a subgraph ID (using the Uniswap V3 Optimism ID from the user's example)
    const subgraphId = 'A3Np3RQbaBA6oKJgiwDJeo5T3zrYfGHPWFYayMwtNDum';
    const schema = await getSubgraphSchema(subgraphId);
    
    if (schema) {
      console.log('✅ Successfully retrieved schema for subgraph', subgraphId);
      console.log('Schema preview (first 200 chars):', schema.substring(0, 200) + '...');
    } else {
      console.log('❌ Failed to retrieve schema for subgraph', subgraphId);
    }
  } catch (error) {
    console.error('Error testing getSubgraphSchema:', error);
  }
}

// Run the tests
async function runTests() {
  await testFindSubgraphsByContract();
  await testGetSubgraphSchema();
}

runTests().catch(console.error);
