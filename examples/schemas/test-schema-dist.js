#!/usr/bin/env node

/**
 * Test script to verify the fix for getSubgraphSchema function
 */

import { getSubgraphSchema } from '../dist/services/graph-service.js';

async function testGetSubgraphSchema() {
  console.log('Testing getSubgraphSchema with a subgraph ID...');
  
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

// Run the test
testGetSubgraphSchema().catch(console.error);
