#!/usr/bin/env node

/**
 * Test script to verify the fix for getSubgraphSchema function for Uniswap V3 Optimism subgraph
 */

import { getSubgraphSchema } from '../dist/services/graph-service.js';

async function testGetUniswapSchema() {
  console.log('Testing getSubgraphSchema with Uniswap V3 Optimism subgraph ID...');
  
  try {
    // Test with the Uniswap V3 Optimism subgraph ID
    const subgraphId = '6ZM4U5FkFLop2Fjtaz4q8Q7zwDvEVJQhWpAPBy6vT632';
    const schema = await getSubgraphSchema(subgraphId);
    
    if (schema) {
      console.log('✅ Successfully retrieved schema for Uniswap V3 Optimism subgraph', subgraphId);
      console.log('Schema preview (first 200 chars):', schema.substring(0, 200) + '...');
    } else {
      console.log('❌ Failed to retrieve schema for Uniswap V3 Optimism subgraph', subgraphId);
    }
  } catch (error) {
    console.error('Error testing getSubgraphSchema:', error);
  }
}

// Run the test
testGetUniswapSchema().catch(console.error);
