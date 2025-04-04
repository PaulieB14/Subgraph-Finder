#!/usr/bin/env node

/**
 * Test script to verify the fix for findSubgraphsByContract function
 */

import { findSubgraphsByContract } from '../dist/services/graph-service.js';

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

// Run the test
testFindSubgraphsByContract().catch(console.error);
