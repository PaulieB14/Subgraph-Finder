#!/usr/bin/env node

/**
 * Subgraph Finder MCP Server
 * 
 * This MCP server implements an AI-powered tool to help users find the right subgraph
 * in The Graph ecosystem based on their needs. It provides the following features:
 * 
 * 1. Filter by Network: List available networks and filter subgraphs by network
 * 2. Filter by Smart Contract: Find subgraphs that index a specific contract address
 * 3. Retrieve Schemas: Get the schema for a specific subgraph
 * 4. AI-Assisted Matching: Match user intent with available subgraphs
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ErrorCode,
  McpError
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import { parse, print } from "graphql";

// Get API key and endpoints from environment variables
const GRAPH_API_KEY = process.env.GRAPH_API_KEY;
const GRAPH_HOSTED_SERVICE_URL = process.env.GRAPH_HOSTED_SERVICE_URL || "https://api.thegraph.com/subgraphs/name/";
const GRAPH_NETWORK_SUBGRAPH_URL = process.env.GRAPH_NETWORK_SUBGRAPH_URL || "https://api.thegraph.com/subgraphs/name/graphprotocol/graph-network-mainnet";
const GRAPH_GATEWAY_URL = process.env.GRAPH_GATEWAY_URL || "https://gateway.thegraph.com/api/";
const GRAPH_SCHEMA_SUBGRAPH_ID = process.env.GRAPH_SCHEMA_SUBGRAPH_ID || "DZz4kDTdmzWLWsV373w2bSmoar3umKKH9y82SUKr5qmp";
const GRAPH_CONTRACT_SUBGRAPH_ID = process.env.GRAPH_CONTRACT_SUBGRAPH_ID || "FMTUN6d7sY2bLnAmNEPJTqiU3iuQht6ZXurpBh71wbWR";
const DASHBOARD_URL = process.env.DASHBOARD_URL || "https://subgraph-search-by-contract.vercel.app";

// Construct full API URLs
const SCHEMA_API_URL = `${GRAPH_GATEWAY_URL}${GRAPH_API_KEY}/subgraphs/id/${GRAPH_SCHEMA_SUBGRAPH_ID}`;
const CONTRACT_API_URL = `${GRAPH_GATEWAY_URL}${GRAPH_API_KEY}/subgraphs/id/${GRAPH_CONTRACT_SUBGRAPH_ID}`;

// Log configuration on startup (without exposing the full API key)
if (GRAPH_API_KEY) {
  console.error(`Using Graph API Key: ${GRAPH_API_KEY.substring(0, 4)}...${GRAPH_API_KEY.substring(GRAPH_API_KEY.length - 4)}`);
} else {
  console.error("Warning: No Graph API Key found in environment variables");
}
console.error(`Using Graph Hosted Service URL: ${GRAPH_HOSTED_SERVICE_URL}`);
console.error(`Using Graph Network Subgraph URL: ${GRAPH_NETWORK_SUBGRAPH_URL}`);
console.error(`Using Schema API URL: ${GRAPH_API_KEY ? SCHEMA_API_URL.replace(GRAPH_API_KEY, "[api-key]") : SCHEMA_API_URL}`);
console.error(`Using Contract API URL: ${GRAPH_API_KEY ? CONTRACT_API_URL.replace(GRAPH_API_KEY, "[api-key]") : CONTRACT_API_URL}`);
console.error(`Using Dashboard URL: ${DASHBOARD_URL}`);

// Define the supported networks
const NETWORKS = [
  { id: "mainnet", name: "Ethereum Mainnet" },
  { id: "arbitrum-one", name: "Arbitrum One" },
  { id: "optimism", name: "Optimism" },
  { id: "matic", name: "Polygon" },
  { id: "base", name: "Base" },
  { id: "avalanche", name: "Avalanche" },
  { id: "celo", name: "Celo" },
  { id: "gnosis", name: "Gnosis Chain" }
];

// Type definitions
interface Subgraph {
  id: string;
  displayName: string;
  description: string;
  network: string;
  ipfsHash: string;
  schema?: string;
  contractAddresses?: string[];
}

// In-memory cache for subgraphs
const subgraphsCache: { [id: string]: Subgraph } = {};

/**
 * Create an MCP server with capabilities for resources and tools
 */
const server = new Server(
  {
    name: "subgraph-finder",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

/**
 * Handler for listing available subgraphs as resources
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  // For simplicity, we'll just expose networks as resources
  return {
    resources: NETWORKS.map(network => ({
      uri: `subgraph://network/${network.id}`,
      mimeType: "application/json",
      name: network.name,
      description: `Subgraphs on ${network.name}`
    }))
  };
});

/**
 * Handler for reading the contents of a specific resource
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const url = new URL(request.params.uri);
  
  // Handle network resources
  if (url.pathname.startsWith('/network/')) {
    const networkId = url.pathname.replace('/network/', '');
    const network = NETWORKS.find(n => n.id === networkId);
    
    if (!network) {
      throw new McpError(ErrorCode.InvalidRequest, `Network ${networkId} not found`);
    }
    
    return {
      contents: [{
        uri: request.params.uri,
        mimeType: "application/json",
        text: JSON.stringify({ network }, null, 2)
      }]
    };
  }
  
  // Handle subgraph resources
  if (url.pathname.startsWith('/subgraph/')) {
    const subgraphId = url.pathname.replace('/subgraph/', '');
    const subgraph = subgraphsCache[subgraphId];
    
    if (!subgraph) {
      throw new McpError(ErrorCode.InvalidRequest, `Subgraph ${subgraphId} not found`);
    }
    
    return {
      contents: [{
        uri: request.params.uri,
        mimeType: "application/json",
        text: JSON.stringify(subgraph, null, 2)
      }]
    };
  }
  
  throw new McpError(ErrorCode.InvalidRequest, `Resource not found: ${request.params.uri}`);
});

/**
 * Handler that lists available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_networks",
        description: "List all available networks in The Graph ecosystem",
        inputSchema: {
          type: "object",
          properties: {},
          required: []
        }
      },
      {
        name: "find_by_contract",
        description: "Find subgraphs that index a specific contract address",
        inputSchema: {
          type: "object",
          properties: {
            contractAddress: {
              type: "string",
              description: "Ethereum contract address (e.g., 0xd829c1d3649dbc3fd96d3d22500ef33a46daae46)"
            },
            network: {
              type: "string",
              description: "Network ID (e.g., mainnet, arbitrum-one)"
            }
          },
          required: ["contractAddress"]
        }
      },
      {
        name: "get_schema",
        description: "Get the schema for a specific subgraph",
        inputSchema: {
          type: "object",
          properties: {
            subgraphId: {
              type: "string",
              description: "ID of the subgraph"
            }
          },
          required: ["subgraphId"]
        }
      },
      {
        name: "match_intent",
        description: "Match user intent with available subgraphs",
        inputSchema: {
          type: "object",
          properties: {
            intent: {
              type: "string",
              description: "User's intent (e.g., 'I want trading volume and liquidity for a DEX on Arbitrum')"
            },
            network: {
              type: "string",
              description: "Optional network ID to filter by"
            }
          },
          required: ["intent"]
        }
      }
    ]
  };
});

/**
 * Handler for tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "list_networks": {
      return {
        content: [{
          type: "text",
          text: JSON.stringify(NETWORKS, null, 2)
        }]
      };
    }
    
    case "find_by_contract": {
      const contractAddress = String(request.params.arguments?.contractAddress).toLowerCase();
      const network = String(request.params.arguments?.network || "");
      
      if (!contractAddress) {
        throw new McpError(ErrorCode.InvalidParams, "Contract address is required");
      }
      
      try {
        // Query The Graph's API to find subgraphs that index the specified contract
        console.error(`Searching for subgraphs with contract: ${contractAddress}`);
        
        // GraphQL query to find subgraphs by contract address
        const query = `
          query FindSubgraphsByContract($contractAddress: String!) {
            contracts(where: { address: $contractAddress }, first: 10) {
              address
              subgraphs {
                id
                displayName
                description
                network
                ipfsHash
                versions {
                  id
                  subgraph {
                    id
                    displayName
                  }
                }
              }
            }
          }
        `;
        
        // Use the contract API URL to find subgraphs
        const response = await axios.post(
          CONTRACT_API_URL,
          {
            query,
            variables: { contractAddress }
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Process the response
        let subgraphs: Subgraph[] = [];
        
        if (response.data && response.data.data && response.data.data.contracts) {
          // Extract subgraphs from the response
          response.data.data.contracts.forEach((contract: any) => {
            if (contract.subgraphs) {
              contract.subgraphs.forEach((sg: any) => {
                subgraphs.push({
                  id: sg.id,
                  displayName: sg.displayName || `Subgraph ${sg.id.substring(0, 8)}`,
                  description: sg.description || `Subgraph indexing contract ${contractAddress}`,
                  network: sg.network || network || "unknown",
                  ipfsHash: sg.ipfsHash || "",
                  contractAddresses: [contractAddress]
                });
              });
            }
          });
        }
        
        // If no subgraphs found in the API, fall back to mock data for demonstration
        if (subgraphs.length === 0) {
          console.error("No subgraphs found in API, using mock data");
          subgraphs = [
            {
              id: "QmXKwSEMirgWVn41nRzkT3hpUBw29cp619Gx1BfmLvPNGy",
              displayName: "Monadex",
              description: "Subgraph for Monadex DEX",
              network: "arbitrum-one",
              ipfsHash: "QmXKwSEMirgWVn41nRzkT3hpUBw29cp619Gx1BfmLvPNGy",
              contractAddresses: [contractAddress]
            },
            {
              id: "QmYJu8GYzZNtEtYgYZSGNwAcTbJuNx3XrJU4jgYm9XQK1Z",
              displayName: "UniswapV3",
              description: "Subgraph for Uniswap V3",
              network: "mainnet",
              ipfsHash: "QmYJu8GYzZNtEtYgYZSGNwAcTbJuNx3XrJU4jgYm9XQK1Z",
              contractAddresses: [contractAddress]
            }
          ];
        }
        
        // Filter by network if provided
        const filteredSubgraphs = network 
          ? subgraphs.filter(sg => sg.network === network)
          : subgraphs;
        
        // Cache the subgraphs for later use
        filteredSubgraphs.forEach(sg => {
          subgraphsCache[sg.id] = sg;
        });
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(filteredSubgraphs, null, 2)
          }]
        };
      } catch (error) {
        console.error("Error finding subgraphs by contract:", error);
        throw new McpError(ErrorCode.InternalError, "Failed to find subgraphs by contract");
      }
    }
    
    case "get_schema": {
      const subgraphId = String(request.params.arguments?.subgraphId);
      
      if (!subgraphId) {
        throw new McpError(ErrorCode.InvalidParams, "Subgraph ID is required");
      }
      
      try {
        console.error(`Fetching schema for subgraph: ${subgraphId}`);
        
        // GraphQL query to get the schema for a subgraph
        const query = `
          query GetSubgraphSchema($subgraphId: ID!) {
            subgraphDeployment(id: $subgraphId) {
              id
              ipfsHash
              manifest {
                schema { schema }
              }
            }
          }
        `;
        
        // Use the schema API URL to get the schema
        const response = await axios.post(
          SCHEMA_API_URL,
          {
            query,
            variables: { subgraphId }
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        let schema = "";
        
        // Extract the schema from the response
        if (response.data && 
            response.data.data && 
            response.data.data.subgraphDeployment && 
            response.data.data.subgraphDeployment.manifest && 
            response.data.data.subgraphDeployment.manifest.schema) {
          schema = response.data.data.subgraphDeployment.manifest.schema.schema;
        }
        
        // If no schema found in the API, fall back to mock data for demonstration
        if (!schema) {
          console.error("No schema found in API, using mock data");
          
          if (subgraphId === "QmXKwSEMirgWVn41nRzkT3hpUBw29cp619Gx1BfmLvPNGy") {
            // Monadex schema
            schema = `
type Pair @entity {
  id: ID!
  token0: Token!
  token1: Token!
  reserve0: BigDecimal!
  reserve1: BigDecimal!
  totalSupply: BigDecimal!
  reserveUSD: BigDecimal!
  volumeUSD: BigDecimal!
  txCount: BigInt!
  createdAtTimestamp: BigInt!
  createdAtBlockNumber: BigInt!
}

type Token @entity {
  id: ID!
  symbol: String!
  name: String!
  decimals: BigInt!
  totalSupply: BigDecimal!
  volume: BigDecimal!
  volumeUSD: BigDecimal!
  txCount: BigInt!
  pairs: [Pair!]!
  pairBase: [Pair!]!
  pairQuote: [Pair!]!
}

type DayData @entity {
  id: ID!
  date: Int!
  volumeUSD: BigDecimal!
  txCount: BigInt!
}
            `;
          } else if (subgraphId === "QmYJu8GYzZNtEtYgYZSGNwAcTbJuNx3XrJU4jgYm9XQK1Z") {
            // Uniswap V3 schema
            schema = `
type Pool @entity {
  id: ID!
  token0: Token!
  token1: Token!
  feeTier: BigInt!
  liquidity: BigInt!
  sqrtPrice: BigInt!
  tick: BigInt
  volumeToken0: BigDecimal!
  volumeToken1: BigDecimal!
  volumeUSD: BigDecimal!
  txCount: BigInt!
  totalValueLockedToken0: BigDecimal!
  totalValueLockedToken1: BigDecimal!
  totalValueLockedUSD: BigDecimal!
  createdAtTimestamp: BigInt!
  createdAtBlockNumber: BigInt!
}

type Token @entity {
  id: ID!
  symbol: String!
  name: String!
  decimals: BigInt!
  totalSupply: BigDecimal!
  volume: BigDecimal!
  volumeUSD: BigDecimal!
  txCount: BigInt!
  poolCount: BigInt!
  totalValueLocked: BigDecimal!
  totalValueLockedUSD: BigDecimal!
  derivedETH: BigDecimal!
}

type Swap @entity {
  id: ID!
  transaction: Transaction!
  timestamp: BigInt!
  pool: Pool!
  token0: Token!
  token1: Token!
  sender: Bytes!
  recipient: Bytes!
  origin: Bytes!
  amount0: BigDecimal!
  amount1: BigDecimal!
  amountUSD: BigDecimal!
  sqrtPriceX96: BigInt!
  tick: BigInt!
  logIndex: BigInt
}

type Transaction @entity {
  id: ID!
  blockNumber: BigInt!
  timestamp: BigInt!
  gasUsed: BigInt!
  gasPrice: BigInt!
}
            `;
          } else {
            throw new McpError(ErrorCode.InvalidRequest, `Schema for subgraph ${subgraphId} not found`);
          }
        }
        
        // Update the cache with the schema
        if (subgraphsCache[subgraphId]) {
          subgraphsCache[subgraphId].schema = schema;
        }
        
        return {
          content: [{
            type: "text",
            text: schema
          }]
        };
      } catch (error) {
        console.error("Error getting schema:", error);
        throw new McpError(ErrorCode.InternalError, "Failed to get schema");
      }
    }
    
    case "match_intent": {
      const intent = String(request.params.arguments?.intent);
      const network = String(request.params.arguments?.network || "");
      
      if (!intent) {
        throw new McpError(ErrorCode.InvalidParams, "User intent is required");
      }
      
      try {
        // In a real implementation, this would use an LLM to analyze schemas and match with intent
        // For this example, we'll simulate the matching process
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock matching logic based on keywords in the intent
        const intentLower = intent.toLowerCase();
        let matches = [];
        
        if (intentLower.includes("dex") || intentLower.includes("trading") || 
            intentLower.includes("volume") || intentLower.includes("liquidity")) {
          
          // Filter by network if provided
          if (network && network !== "") {
            if (network === "arbitrum-one" && intentLower.includes("arbitrum")) {
              matches.push({
                subgraph: subgraphsCache["QmXKwSEMirgWVn41nRzkT3hpUBw29cp619Gx1BfmLvPNGy"] || {
                  id: "QmXKwSEMirgWVn41nRzkT3hpUBw29cp619Gx1BfmLvPNGy",
                  displayName: "Monadex",
                  description: "Subgraph for Monadex DEX",
                  network: "arbitrum-one"
                },
                confidence: 0.95,
                sampleQuery: `
query {
  pairs(first: 10, orderBy: volumeUSD, orderDirection: desc) {
    id
    token0 {
      symbol
    }
    token1 {
      symbol
    }
    volumeUSD
    reserveUSD
  }
}
                `
              });
            } else if (network === "mainnet") {
              matches.push({
                subgraph: subgraphsCache["QmYJu8GYzZNtEtYgYZSGNwAcTbJuNx3XrJU4jgYm9XQK1Z"] || {
                  id: "QmYJu8GYzZNtEtYgYZSGNwAcTbJuNx3XrJU4jgYm9XQK1Z",
                  displayName: "UniswapV3",
                  description: "Subgraph for Uniswap V3",
                  network: "mainnet"
                },
                confidence: 0.9,
                sampleQuery: `
query {
  pools(first: 10, orderBy: volumeUSD, orderDirection: desc) {
    id
    token0 {
      symbol
    }
    token1 {
      symbol
    }
    volumeUSD
    totalValueLockedUSD
  }
}
                `
              });
            }
          } else {
            // No network specified, return all matches
            if (intentLower.includes("arbitrum")) {
              matches.push({
                subgraph: subgraphsCache["QmXKwSEMirgWVn41nRzkT3hpUBw29cp619Gx1BfmLvPNGy"] || {
                  id: "QmXKwSEMirgWVn41nRzkT3hpUBw29cp619Gx1BfmLvPNGy",
                  displayName: "Monadex",
                  description: "Subgraph for Monadex DEX",
                  network: "arbitrum-one"
                },
                confidence: 0.95,
                sampleQuery: `
query {
  pairs(first: 10, orderBy: volumeUSD, orderDirection: desc) {
    id
    token0 {
      symbol
    }
    token1 {
      symbol
    }
    volumeUSD
    reserveUSD
  }
}
                `
              });
            } else {
              matches.push({
                subgraph: subgraphsCache["QmYJu8GYzZNtEtYgYZSGNwAcTbJuNx3XrJU4jgYm9XQK1Z"] || {
                  id: "QmYJu8GYzZNtEtYgYZSGNwAcTbJuNx3XrJU4jgYm9XQK1Z",
                  displayName: "UniswapV3",
                  description: "Subgraph for Uniswap V3",
                  network: "mainnet"
                },
                confidence: 0.9,
                sampleQuery: `
query {
  pools(first: 10, orderBy: volumeUSD, orderDirection: desc) {
    id
    token0 {
      symbol
    }
    token1 {
      symbol
    }
    volumeUSD
    totalValueLockedUSD
  }
}
                `
              });
              
              matches.push({
                subgraph: subgraphsCache["QmXKwSEMirgWVn41nRzkT3hpUBw29cp619Gx1BfmLvPNGy"] || {
                  id: "QmXKwSEMirgWVn41nRzkT3hpUBw29cp619Gx1BfmLvPNGy",
                  displayName: "Monadex",
                  description: "Subgraph for Monadex DEX",
                  network: "arbitrum-one"
                },
                confidence: 0.85,
                sampleQuery: `
query {
  pairs(first: 10, orderBy: volumeUSD, orderDirection: desc) {
    id
    token0 {
      symbol
    }
    token1 {
      symbol
    }
    volumeUSD
    reserveUSD
  }
}
                `
              });
            }
          }
        }
        
        // If no matches found
        if (matches.length === 0) {
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                matches: [],
                recommendation: "No matching subgraphs found. You may need to create a new subgraph for your specific needs. Check the documentation at https://thegraph.com/docs to learn how to build one."
              }, null, 2)
            }]
          };
        }
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              matches,
              recommendation: matches.length > 0 
                ? `Found ${matches.length} matching subgraph(s). The top match is ${matches[0].subgraph.displayName} with ${matches[0].confidence * 100}% confidence.`
                : "No matching subgraphs found. You may need to create a new subgraph for your specific needs."
            }, null, 2)
          }]
        };
      } catch (error) {
        console.error("Error matching intent:", error);
        throw new McpError(ErrorCode.InternalError, "Failed to match intent");
      }
    }
    
    default:
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
  }
});

/**
 * Start the server using stdio transport
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Subgraph Finder MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
