import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// GET /networks
app.get('/networks', (req, res) => {
  res.json({
    networks: [
      { id: 'mainnet', name: 'Ethereum Mainnet' },
      { id: 'arbitrum-one', name: 'Arbitrum One' },
      { id: 'optimism', name: 'Optimism' },
      { id: 'matic', name: 'Polygon' },
      { id: 'base', name: 'Base' },
      { id: 'avalanche', name: 'Avalanche' },
      { id: 'celo', name: 'Celo' },
      { id: 'gnosis', name: 'Gnosis Chain' }
    ]
  });
});

// GET /subgraphs/contract/:address
app.get('/subgraphs/contract/:address', (req, res) => {
  const address = req.params.address;
  const network = req.query.network || 'mainnet';
  
  res.json({
    subgraphs: [
      {
        id: 'QmXKwSEMirgWVn41nRzkT3hpUBw29cp619Gx1BfmLvPNGy',
        displayName: 'Uniswap V3',
        description: 'Indexes Uniswap V3 contract data',
        network
      }
    ]
  });
});

// GET /subgraphs/:id/schema
app.get('/subgraphs/:id/schema', (req, res) => {
  const id = req.params.id;
  
  res.json({
    schema: {
      description: 'This schema contains entities for a decentralized exchange',
      raw: 'type Token @entity {\n  id: ID!\n  symbol: String!\n  name: String!\n}'
    }
  });
});

// POST /match
app.post('/match', (req, res) => {
  const intent = req.body.intent;
  const network = req.body.network || 'mainnet';
  
  res.json({
    matches: [
      {
        subgraph: {
          id: 'QmXKwSEMirgWVn41nRzkT3hpUBw29cp619Gx1BfmLvPNGy',
          displayName: 'Uniswap V3',
          network
        },
        confidence: 0.85,
        explanation: 'This subgraph indexes trading data for Uniswap V3',
        sampleQuery: '{\n  pools(first: 10) {\n    id\n    token0 {\n      symbol\n    }\n    token1 {\n      symbol\n    }\n    volumeUSD\n  }\n}'
      }
    ],
    recommendation: 'I found a subgraph that might help with your query.'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Subgraph Finder API',
    version: '0.1.0',
    description: 'An API to help users find the right subgraph in The Graph ecosystem',
    endpoints: [
      { path: '/networks', description: 'List all available networks' },
      { path: '/subgraphs/contract/:address', description: 'Find subgraphs by contract address' },
      { path: '/subgraphs/:id/schema', description: 'Get the schema for a specific subgraph' },
      { path: '/match', description: 'Match user intent with available subgraphs' }
    ]
  });
});

// Handle /api prefix for Vercel deployment
app.use('/api', (req, res, next) => {
  // Remove /api prefix from URL
  req.url = req.url.replace(/^\/api/, '');
  next();
});

// Start server
console.log('Starting server...');
try {
  app.listen(port, () => {
    console.log(`Subgraph Finder API running at http://localhost:${port}`);
  });
} catch (error) {
  console.error('Error starting server:', error);
}

export default app;
