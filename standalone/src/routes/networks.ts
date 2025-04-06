/**
 * Routes for network-related endpoints
 */

import express from 'express';
import { getNetworks } from '../services/graph-service.js';

export const networkRoutes = express.Router();

/**
 * @route   GET /networks
 * @desc    Get all networks
 * @access  Public
 */
networkRoutes.get('/', async (req, res) => {
  try {
    const networks = await getNetworks();
    res.json({ networks });
  } catch (error) {
    console.error('Error getting networks:', error);
    res.status(500).json({ error: 'Server error', message: 'Failed to get networks' });
  }
});
