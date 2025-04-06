/**
 * Routes for intent matching endpoints
 */

import express from 'express';
import { matchIntent } from '../services/graph-service.js';

export const matchRoutes = express.Router();

/**
 * @route   POST /match
 * @desc    Match user intent with available subgraphs
 * @access  Public
 */
matchRoutes.post('/', async (req, res) => {
  try {
    const { intent, network } = req.body;

    if (!intent) {
      return res.status(400).json({ error: 'Bad request', message: 'User intent is required' });
    }

    const result = await matchIntent(intent, network);

    res.json(result);
  } catch (error) {
    console.error('Error matching intent:', error);
    res.status(500).json({ error: 'Server error', message: 'Failed to match intent' });
  }
});

/**
 * @route   GET /match
 * @desc    Match user intent with available subgraphs (query params version)
 * @access  Public
 */
matchRoutes.get('/', async (req, res) => {
  try {
    const { intent, network } = req.query;

    if (!intent) {
      return res.status(400).json({ error: 'Bad request', message: 'User intent is required' });
    }

    const result = await matchIntent(
      String(intent),
      network ? String(network) : undefined
    );

    res.json(result);
  } catch (error) {
    console.error('Error matching intent:', error);
    res.status(500).json({ error: 'Server error', message: 'Failed to match intent' });
  }
});
