#!/usr/bin/env node

/**
 * Test script to verify that we can import the functions from graph-service.js
 */

import * as graphService from '../build/services/graph-service.js';

console.log('Successfully imported graph-service.js');
console.log('Available functions:');
console.log(Object.keys(graphService));
