#!/usr/bin/env node

/**
 * Test script that writes output to a file
 */

import fs from 'fs';
import { findSubgraphsByContract } from '../build/services/graph-service.js';

async function testFindSubgraphsByContract() {
  let output = 'Testing findSubgraphsByContract with Uniswap V3 contract...\n';
  
  try {
    // Test with the Uniswap V3 contract address
    const contractAddress = '0x1F98431c8aD98523631AE4a59f267346ea31F984';
    const subgraphs = await findSubgraphsByContract(contractAddress);
    
    output += `Found ${subgraphs.length} subgraphs for contract ${contractAddress}\n`;
    output += `Subgraphs: ${JSON.stringify(subgraphs, null, 2)}\n`;
    
    // Write the output to a file
    fs.writeFileSync('test-output.txt', output);
    console.log('Test completed. Output written to test-output.txt');
  } catch (error) {
    output += `Error testing findSubgraphsByContract: ${error}\n`;
    fs.writeFileSync('test-output.txt', output);
    console.error('Test failed. Error written to test-output.txt');
  }
}

// Run the test
testFindSubgraphsByContract().catch(error => {
  fs.writeFileSync('test-output.txt', `Unhandled error: ${error}`);
  console.error('Unhandled error. Written to test-output.txt');
});
