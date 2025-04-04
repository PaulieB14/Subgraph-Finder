#!/usr/bin/env node

/**
 * Test script to verify the fix for findSubgraphsByContract function
 */

import { findSubgraphsByContract } from '../build/services/graph-service.js';

async function testFindSubgraphsByContract() {
  console.log('Testing findSubgraphsByContract with Uniswap V3 contract...');
  
  try {
    // Test with the Uniswap V3 contract address
    const contractAddress = '0x1F98431c8aD98523631AE4a59f267346ea31F984';
    const subgraphs = await findSubgraphsByContract(contractAddress);
    
    console.log(`Found ${subgraphs.length} subgraphs for contract ${contractAddress}`);
    console.log('Subgraphs:', JSON.stringify(subgraphs, null, 2));
  } catch (error) {
    console.error('Error testing findSubgraphsByContract:', error);
  }
}

// Run the test
testFindSubgraphsByContract().catch(console.error);
