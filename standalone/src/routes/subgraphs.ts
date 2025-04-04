/**
 * Routes for subgraph-related endpoints
 */

import express from 'express';
import { findSubgraphsByContract, getSubgraph, getSubgraphSchema } from '../services/graph-service.js';

export const subgraphRoutes = express.Router();

/**
 * @route   GET /api/subgraphs/contract/:address
 * @desc    Find subgraphs by contract address
 * @access  Public
 */
subgraphRoutes.get('/contract/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { network } = req.query;
    
    if (!address) {
      return res.status(400).json({ error: 'Bad request', message: 'Contract address is required' });
    }
    
    const subgraphs = await findSubgraphsByContract(
      address, 
      network ? String(network) : undefined
    );
    
    res.json({ subgraphs });
  } catch (error) {
    console.error('Error finding subgraphs by contract:', error);
    res.status(500).json({ error: 'Server error', message: 'Failed to find subgraphs by contract' });
  }
});

/**
 * @route   GET /api/subgraphs/:id
 * @desc    Get a subgraph by ID
 * @access  Public
 */
subgraphRoutes.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Bad request', message: 'Subgraph ID is required' });
    }
    
    const subgraph = getSubgraph(id);
    
    if (!subgraph) {
      return res.status(404).json({ error: 'Not found', message: `Subgraph ${id} not found` });
    }
    
    res.json({ subgraph });
  } catch (error) {
    console.error('Error getting subgraph:', error);
    res.status(500).json({ error: 'Server error', message: 'Failed to get subgraph' });
  }
});

/**
 * @route   GET /api/subgraphs/:id/schema
 * @desc    Get the schema for a subgraph
 * @access  Public
 */
subgraphRoutes.get('/:id/schema', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Bad request', message: 'Subgraph ID is required' });
    }
    
    const schema = await getSubgraphSchema(id);
    
    res.json({ schema });
  } catch (error) {
    console.error('Error getting schema:', error);
    res.status(500).json({ error: 'Server error', message: 'Failed to get schema' });
  }
});
