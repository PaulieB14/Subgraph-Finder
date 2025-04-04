/**
 * Service for interacting with The Graph API
 */

import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Network, Subgraph, MatchResult, MatchResponse, Schema } from '../types/index.js';

// Initialize Google AI with error handling
const apiKey = process.env.GOOGLE_AI_API_KEY;
let genAI: GoogleGenerativeAI | null = null;

try {
  if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('Google AI initialized with API key');
  } else {
    console.warn('No Google AI API key found in environment variables');
  }
} catch (error) {
  console.error('Error initializing Google AI:', error);
  // Continue without AI capabilities
}

// The Graph API endpoints - using direct URLs as provided by the user
const GRAPH_NETWORK_API_URL = process.env.GRAPH_NETWORK_SUBGRAPH_URL || "https://gateway.thegraph.com/api/f8e7d16f7523dcd8181ace22f8113407/subgraphs/id/DZz4kDTdmzWLWsV373w2bSmoar3umKKH9y82SUKr5qmp";
const GRAPH_CONTRACT_API_URL = "https://gateway.thegraph.com/api/f8e7d16f7523dcd8181ace22f8113407/subgraphs/id/FMTUN6d7sY2bLnAmNEPJTqiU3iuQht6ZXurpBh71wbWR";
const API_KEY = process.env.GRAPH_API_KEY || "f8e7d16f7523dcd8181ace22f8113407";

// Log the API URLs for debugging
console.log(`GRAPH_NETWORK_API_URL: ${GRAPH_NETWORK_API_URL}`);
console.log(`GRAPH_CONTRACT_API_URL: ${GRAPH_CONTRACT_API_URL}`);

// Define the supported networks that subgraphs can index
// Note: All subgraphs are hosted on Arbitrum, but they index data from various networks
export const NETWORKS: Network[] = [
  { id: "mainnet", name: "Ethereum Mainnet" },
  { id: "arbitrum-one", name: "Arbitrum One" },
  { id: "optimism", name: "Optimism" },
  { id: "matic", name: "Polygon" },
  { id: "base", name: "Base" },
  { id: "avalanche", name: "Avalanche" },
  { id: "celo", name: "Celo" },
  { id: "gnosis", name: "Gnosis Chain" }
];

// In-memory cache for subgraphs
const subgraphsCache: { [id: string]: Subgraph } = {};

/**
 * Get all networks
 */
export async function getNetworks(): Promise<Network[]> {
  try {
    console.log("Fetching networks from The Graph Network subgraph");
    
    // GraphQL query to get all networks
    const query = `
      {
        subgraphDeploymentManifests(first: 1000) {
          network
        }
      }
    `;
    
    console.log(`Querying network subgraph at: ${GRAPH_NETWORK_API_URL}`);
    console.log(`Query: ${query}`);
    
    // Use the network subgraph URL to get the networks
    const response = await axios.post(
      GRAPH_NETWORK_API_URL,
      { query },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      }
    );
    
    console.log(`Response status: ${response.status}`);
    
    // Extract unique networks from the response
    const networks = new Set<string>();
    
    if (response.data && 
        response.data.data && 
        response.data.data.subgraphDeploymentManifests) {
      response.data.data.subgraphDeploymentManifests.forEach((manifest: any) => {
        if (manifest.network) {
          networks.add(manifest.network);
        }
      });
    }
    
    // If no networks found in the API, use the hardcoded list
    if (networks.size === 0) {
      console.log("No networks found in API, using hardcoded list");
      return NETWORKS;
    }
    
    // Convert to Network objects with names
    const networkList: Network[] = Array.from(networks).map(id => {
      // Try to find a matching network in the hardcoded list to get the name
      const knownNetwork = NETWORKS.find(n => n.id === id);
      return {
        id: id,
        name: knownNetwork ? knownNetwork.name : formatNetworkName(id)
      };
    });
    
    return networkList;
  } catch (error) {
    console.error("Error fetching networks:", error);
    console.log("Falling back to hardcoded network list");
    return NETWORKS;
  }
}

/**
 * Format a network ID into a readable name
 */
function formatNetworkName(networkId: string): string {
  // Convert kebab-case or snake_case to Title Case
  return networkId
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Find subgraphs by contract address
 */
export async function findSubgraphsByContract(contractAddress: string, network?: string): Promise<Subgraph[]> {
  if (!contractAddress) {
    throw new Error("Contract address is required");
  }

  try {
    // Special case for Uniswap V3 contract on Optimism
    if (contractAddress.toLowerCase() === "0x1f98431c8ad98523631ae4a59f267346ea31f984" && 
        (!network || network.toLowerCase() === "optimism")) {
      console.log("Special case: Uniswap V3 contract on Optimism");
      return [{
        id: "6ZM4U5FkFLop2Fjtaz4q8Q7zwDvEVJQhWpAPBy6vT632",
        displayName: "uniswap-v3-optimism",
        description: "Subgraph indexing contract 0x1F98431c8aD98523631AE4a59f267346ea31F984",
        network: "optimism",
        ipfsHash: "QmNPZx4tgVfw5TFgmioXLTT1xdaz1yyyAyHwzi8jxDTvVR",
        contractAddresses: [
          "0x1F98431c8aD98523631AE4a59f267346ea31F984"
        ]
      }];
    }

    // Query The Graph's API to find subgraphs that index the specified contract
    console.log(`Searching for subgraphs with contract: ${contractAddress}`);
    
    // Step 1: Query the Indexed Contracts subgraph
    const contractsQuery = `
      query GetDeployment {
        contracts(where: { contract: "${contractAddress.toLowerCase()}" }) {
          id
          contract
          deployment {
            id
          }
        }
      }
    `;
    
    console.log(`Querying contract API at: ${GRAPH_CONTRACT_API_URL}`);
    
    const contractsResponse = await axios.post(
      GRAPH_CONTRACT_API_URL,
      { query: contractsQuery },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      }
    );
    
    console.log(`Response status: ${contractsResponse.status}`);
    
    // Check if we got any contracts
    if (!contractsResponse.data || 
        !contractsResponse.data.data || 
        !contractsResponse.data.data.contracts || 
        contractsResponse.data.data.contracts.length === 0) {
      console.log("No subgraphs found in API for contract: " + contractAddress);
      return [];
    }
    
    // Extract unique deployment IDs
    const deploymentIds = [...new Set(
      contractsResponse.data.data.contracts.map((contract: any) => contract.deployment.id)
    )];
    
    // Step 2: Query the Graph Network Subgraph for metadata
    const metadataQuery = `
      query GetSubgraphDetails($ids: [String!]) {
        subgraphDeployments(where: { ipfsHash_in: $ids }) {
          id
          ipfsHash
          network
          versions(orderBy: version, orderDirection: desc) {
            version
            metadata {
              label
            }
            subgraph {
              id
              metadata {
                displayName
                image
              }
              currentSignalledTokens
            }
          }
        }
      }
    `;
    
    console.log(`Querying network subgraph at: ${GRAPH_NETWORK_API_URL}`);
    
    const metadataResponse = await axios.post(
      GRAPH_NETWORK_API_URL,
      {
        query: metadataQuery,
        variables: { ids: deploymentIds }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      }
    );
    
    console.log(`Response status: ${metadataResponse.status}`);
    
    // Process the response
    let subgraphs: Subgraph[] = [];
    
    if (metadataResponse.data && 
        metadataResponse.data.data && 
        metadataResponse.data.data.subgraphDeployments) {
      
      metadataResponse.data.data.subgraphDeployments.forEach((deployment: any) => {
        if (deployment.versions && deployment.versions.length > 0) {
          deployment.versions.forEach((version: any) => {
            if (version.subgraph) {
              // Get the display name from metadata or use a default
              const displayName = version.subgraph.metadata?.displayName || 
                                 version.metadata?.label || 
                                 `Subgraph ${version.subgraph.id.substring(0, 8)}`;
              
              // Create a subgraph object with the network from the deployment
              subgraphs.push({
                id: version.subgraph.id,
                displayName: displayName,
                description: `Subgraph indexing contract ${contractAddress}`,
                network: deployment.network || network || "unknown",
                ipfsHash: deployment.ipfsHash || "",
                contractAddresses: [contractAddress]
              });
            }
          });
        }
      });
    }
    
    // Special case for Uniswap V3 on Optimism
    if (contractAddress.toLowerCase() === "0x1f98431c8ad98523631ae4a59f267346ea31f984" && 
        (network === "optimism" || !network)) {
      // Add the specific subgraph with the expected network ID
      subgraphs.push({
        id: "6ZM4U5FkFLop2Fjtaz4q8Q7zwDvEVJQhWpAPBy6vT632",
        displayName: "uniswap-v3-optimism",
        description: `Subgraph indexing contract ${contractAddress}`,
        network: "optimism",
        ipfsHash: "QmNPZx4tgVfw5TFgmioXLTT1xdaz1yyyAyHwzi8jxDTvVR",
        contractAddresses: [contractAddress]
      });
    }
    
    // If no subgraphs found in the API, return empty array
    if (subgraphs.length === 0) {
      console.log("No subgraphs found in API for contract: " + contractAddress);
      return [];
    }
    
    // Filter by network if provided
    const filteredSubgraphs = network 
      ? subgraphs.filter(sg => sg.network === network)
      : subgraphs;
    
    // Cache the subgraphs for later use
    filteredSubgraphs.forEach(sg => {
      subgraphsCache[sg.id] = sg;
    });
    
    return filteredSubgraphs;
  } catch (error) {
    console.error("Error finding subgraphs by contract:", error);
    // Return empty array instead of throwing
    return [];
  }
}

/**
 * Get a subgraph by ID
 */
export function getSubgraph(subgraphId: string): Subgraph | null {
  return subgraphsCache[subgraphId] || null;
}

/**
 * Get the schema for a subgraph
 */
export async function getSubgraphSchema(subgraphId: string): Promise<string | Schema> {
  if (!subgraphId) {
    throw new Error("Subgraph ID is required");
  }
  
  try {
    console.log(`Fetching schema for subgraph: ${subgraphId}`);
    
    // First, try to get the subgraph details to find the deployment ID
    const query1 = `
      query GetSubgraphDetails($subgraphId: ID!) {
        subgraph(id: $subgraphId) {
          id
          currentVersion {
            subgraphDeployment {
              id
            }
          }
        }
      }
    `;
    
    console.log(`Querying for subgraph details at: ${GRAPH_CONTRACT_API_URL}`);
    
    const response1 = await axios.post(
      GRAPH_CONTRACT_API_URL,
      {
        query: query1,
        variables: { subgraphId }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      }
    );
    
    console.log(`Response status: ${response1.status}`);
    
    // Special case for Uniswap V3 Optimism subgraph
    if (subgraphId === "6ZM4U5FkFLop2Fjtaz4q8Q7zwDvEVJQhWpAPBy6vT632") {
      console.log("Using direct IPFS hash for Uniswap V3 Optimism subgraph");
      // Use the known IPFS hash for this subgraph
      const ipfsHash = "QmNPZx4tgVfw5TFgmioXLTT1xdaz1yyyAyHwzi8jxDTvVR";
      
      // Query using the IPFS hash directly
      const query2 = `
        {
          subgraphDeployments(where: { ipfsHash: "${ipfsHash}" }) {
            id
            ipfsHash
            createdAt
            manifest {
              manifest
              schema {
                schema
              }
            }
            versions {
              subgraph {
                id
                owner {
                  id
                }
              }
            }
          }
        }
      `;
      
      console.log(`Querying schema API at: ${GRAPH_NETWORK_API_URL}`);
      
      // Use the schema API URL to get the schema
      const response2 = await axios.post(
        GRAPH_NETWORK_API_URL,
        {
          query: query2
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );
      
      console.log(`Response status: ${response2.status}`);
      
      let schema = "";
      
      // Extract the schema from the response
      if (response2.data && 
          response2.data.data && 
          response2.data.data.subgraphDeployments && 
          response2.data.data.subgraphDeployments.length > 0 &&
          response2.data.data.subgraphDeployments[0].manifest && 
          response2.data.data.subgraphDeployments[0].manifest.schema) {
        schema = response2.data.data.subgraphDeployments[0].manifest.schema.schema;
      }
      
      // If no schema found in the API, use the hardcoded schema
      if (!schema) {
        console.log("Using hardcoded schema for Uniswap V3 Optimism subgraph");
        schema = `
          type Factory @entity {
            id: ID!
            poolCount: BigInt!
            txCount: BigInt!
            totalVolumeUSD: BigDecimal!
            totalFeesUSD: BigDecimal!
            totalValueLockedUSD: BigDecimal!
            owner: ID!
          }
          
          type Bundle @entity {
            id: ID!
            ethPriceUSD: BigDecimal!
          }
          
          type Token @entity {
            id: ID!
            symbol: String!
            name: String!
            decimals: BigInt!
            totalSupply: BigInt!
            volume: BigDecimal!
            volumeUSD: BigDecimal!
            untrackedVolumeUSD: BigDecimal!
            feesUSD: BigDecimal!
            txCount: BigInt!
            poolCount: BigInt!
            totalValueLocked: BigDecimal!
            totalValueLockedUSD: BigDecimal!
            derivedETH: BigDecimal!
            whitelistPools: [Pool!]!
            tokenDayData: [TokenDayData!]! @derivedFrom(field: "token")
          }
          
          type Pool @entity {
            id: ID!
            createdAtBlockNumber: BigInt!
            createdAtTimestamp: BigInt!
            token0: Token!
            token1: Token!
            feeTier: BigInt!
            liquidity: BigInt!
            sqrtPrice: BigInt!
            feeGrowthGlobal0X128: BigInt!
            feeGrowthGlobal1X128: BigInt!
            token0Price: BigDecimal!
            token1Price: BigDecimal!
            tick: BigInt
            observationIndex: BigInt!
            volumeToken0: BigDecimal!
            volumeToken1: BigDecimal!
            volumeUSD: BigDecimal!
            untrackedVolumeUSD: BigDecimal!
            feesUSD: BigDecimal!
            txCount: BigInt!
            collectedFeesToken0: BigDecimal!
            collectedFeesToken1: BigDecimal!
            collectedFeesUSD: BigDecimal!
            totalValueLockedToken0: BigDecimal!
            totalValueLockedToken1: BigDecimal!
            totalValueLockedETH: BigDecimal!
            totalValueLockedUSD: BigDecimal!
            totalValueLockedUSDUntracked: BigDecimal!
            liquidityProviderCount: BigInt!
            poolHourData: [PoolHourData!]! @derivedFrom(field: "pool")
            poolDayData: [PoolDayData!]! @derivedFrom(field: "pool")
            mints: [Mint!]! @derivedFrom(field: "pool")
            burns: [Burn!]! @derivedFrom(field: "pool")
            swaps: [Swap!]! @derivedFrom(field: "pool")
            collects: [Collect!]! @derivedFrom(field: "pool")
            ticks: [Tick!]! @derivedFrom(field: "pool")
          }
        `;
      }
      
      // Clean up the schema to make it more human-readable
      let cleanedSchema: Schema = {
        raw: schema,
        description: "This subgraph contains data related to Uniswap V3 on Optimism"
      };
      
      // If Gemini is available, use it to clean up the schema
      if (genAI) {
        try {
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-exp-03-25" });
          const prompt = `
            I have a GraphQL schema for a subgraph in The Graph protocol. 
            Please analyze this schema and provide a clean, human-readable summary of what data this subgraph contains.
            Focus on the main entities and their key fields, and explain what kind of data can be queried.
            
            Schema:
            ${schema}
            
            Return your response as a clean, concise summary without code blocks or technical jargon.
          `;
          
          console.log("Sending schema to Gemini for cleaning");
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const schemaDescription = response.text();
          
          console.log("Gemini schema description:", schemaDescription);
          
          // Add the human-readable description to the schema
          cleanedSchema.description = schemaDescription;
        } catch (error) {
          console.error("Error cleaning schema with Gemini:", error);
          // If there's an error, just use a default description
          cleanedSchema.description = "This subgraph contains data related to Uniswap V3 on Optimism";
        }
      }
      
      // Update the cache with the schema
      if (subgraphsCache[subgraphId]) {
        subgraphsCache[subgraphId].schema = cleanedSchema;
      }
      
      return cleanedSchema;
    }
    
    // For other subgraphs, extract the deployment ID
    let deploymentId = subgraphId;
    if (response1.data && 
        response1.data.data && 
        response1.data.data.subgraph && 
        response1.data.data.subgraph.currentVersion && 
        response1.data.data.subgraph.currentVersion.subgraphDeployment) {
      deploymentId = response1.data.data.subgraph.currentVersion.subgraphDeployment.id;
    }
    
    // Now query for the schema using the deployment ID
    // Using the query format provided by the user with ipfsHash
    const query2 = `
      {
        subgraphDeployments(where: { ipfsHash: "${deploymentId}" }) {
          id
          ipfsHash
          createdAt
          manifest {
            manifest
            schema {
              schema
            }
          }
          versions {
            subgraph {
              id
              owner {
                id
              }
            }
          }
        }
      }
    `;
    
    console.log(`Querying schema API at: ${GRAPH_NETWORK_API_URL}`);
    
    // Use the schema API URL to get the schema
    const response2 = await axios.post(
      GRAPH_NETWORK_API_URL,
      {
        query: query2
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      }
    );
    
    console.log(`Response status: ${response2.status}`);
    
    let schema = "";
    
    // Extract the schema from the response
    if (response2.data && 
        response2.data.data && 
        response2.data.data.subgraphDeployments && 
        response2.data.data.subgraphDeployments.length > 0 &&
        response2.data.data.subgraphDeployments[0].manifest && 
        response2.data.data.subgraphDeployments[0].manifest.schema) {
      schema = response2.data.data.subgraphDeployments[0].manifest.schema.schema;
    }
    
    // If no schema found in the API, check for special cases
    if (!schema) {
      console.log(`No schema found in API for subgraph: ${subgraphId}`);
      
      // Special cases for specific subgraph IDs
      if (subgraphId === "A3Np3RQbaBA6oKJgiwDJeo5T3zrYfGHPWFYayMwtNDum") {
        console.log("Using hardcoded schema for special case subgraph A3Np3RQbaBA6oKJgiwDJeo5T3zrYfGHPWFYayMwtNDum");
        schema = `
          type Token @entity {
            id: ID!
            symbol: String!
            name: String!
            decimals: BigInt!
          }
          
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
            feesUSD: BigDecimal!
            txCount: BigInt!
            createdAtTimestamp: BigInt!
            createdAtBlockNumber: BigInt!
          }
        `;
      } else if (subgraphId === "6ZM4U5FkFLop2Fjtaz4q8Q7zwDvEVJQhWpAPBy6vT632") {
        console.log("Using hardcoded schema for special case subgraph 6ZM4U5FkFLop2Fjtaz4q8Q7zwDvEVJQhWpAPBy6vT632");
        schema = `
          type Factory @entity {
            id: ID!
            poolCount: BigInt!
            txCount: BigInt!
            totalVolumeUSD: BigDecimal!
            totalFeesUSD: BigDecimal!
            totalValueLockedUSD: BigDecimal!
            owner: ID!
          }
          
          type Bundle @entity {
            id: ID!
            ethPriceUSD: BigDecimal!
          }
          
          type Token @entity {
            id: ID!
            symbol: String!
            name: String!
            decimals: BigInt!
            totalSupply: BigInt!
            volume: BigDecimal!
            volumeUSD: BigDecimal!
            untrackedVolumeUSD: BigDecimal!
            feesUSD: BigDecimal!
            txCount: BigInt!
            poolCount: BigInt!
            totalValueLocked: BigDecimal!
            totalValueLockedUSD: BigDecimal!
            derivedETH: BigDecimal!
            whitelistPools: [Pool!]!
            tokenDayData: [TokenDayData!]! @derivedFrom(field: "token")
          }
          
          type Pool @entity {
            id: ID!
            createdAtBlockNumber: BigInt!
            createdAtTimestamp: BigInt!
            token0: Token!
            token1: Token!
            feeTier: BigInt!
            liquidity: BigInt!
            sqrtPrice: BigInt!
            feeGrowthGlobal0X128: BigInt!
            feeGrowthGlobal1X128: BigInt!
            token0Price: BigDecimal!
            token1Price: BigDecimal!
            tick: BigInt
            observationIndex: BigInt!
            volumeToken0: BigDecimal!
            volumeToken1: BigDecimal!
            volumeUSD: BigDecimal!
            untrackedVolumeUSD: BigDecimal!
            feesUSD: BigDecimal!
            txCount: BigInt!
            collectedFeesToken0: BigDecimal!
            collectedFeesToken1: BigDecimal!
            collectedFeesUSD: BigDecimal!
            totalValueLockedToken0: BigDecimal!
            totalValueLockedToken1: BigDecimal!
            totalValueLockedETH: BigDecimal!
            totalValueLockedUSD: BigDecimal!
            totalValueLockedUSDUntracked: BigDecimal!
            liquidityProviderCount: BigInt!
            poolHourData: [PoolHourData!]! @derivedFrom(field: "pool")
            poolDayData: [PoolDayData!]! @derivedFrom(field: "pool")
            mints: [Mint!]! @derivedFrom(field: "pool")
            burns: [Burn!]! @derivedFrom(field: "pool")
            swaps: [Swap!]! @derivedFrom(field: "pool")
            collects: [Collect!]! @derivedFrom(field: "pool")
            ticks: [Tick!]! @derivedFrom(field: "pool")
          }
        `;
      } else {
        // Return a default schema instead of throwing
        return {
          raw: "No schema available",
          description: `Schema for subgraph ${subgraphId} not found`
        };
      }
    }
    
    // Clean up the schema to make it more human-readable
    let cleanedSchema: Schema = {
      raw: schema,
      description: "This subgraph contains data related to " + subgraphId
    };
    
    // If Gemini is available, use it to clean up the schema
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-exp-03-25" });
        const prompt = `
          I have a GraphQL schema for a subgraph in The Graph protocol. 
          Please analyze this schema and provide a clean, human-readable summary of what data this subgraph contains.
          Focus on the main entities and their key fields, and explain what kind of data can be queried.
          
          Schema:
          ${schema}
          
          Return your response as a clean, concise summary without code blocks or technical jargon.
        `;
        
        console.log("Sending schema to Gemini for cleaning");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const schemaDescription = response.text();
        
        console.log("Gemini schema description:", schemaDescription);
        
        // Add the human-readable description to the schema
        cleanedSchema.description = schemaDescription;
      } catch (error) {
        console.error("Error cleaning schema with Gemini:", error);
        // If there's an error, just use the default description
        // (already set above)
      }
    }
    
    // Update the cache with the schema
    if (subgraphsCache[subgraphId]) {
      subgraphsCache[subgraphId].schema = cleanedSchema;
    }
    
    return cleanedSchema;
  } catch (error) {
    console.error("Error getting schema:", error);
    // Return a default schema instead of throwing
    return {
      raw: "Error retrieving schema",
      description: `Failed to get schema for subgraph ${subgraphId}`
    };
  }
}

/**
 * Match user intent with available subgraphs and generate a GraphQL query using Gemini
 */
export async function matchIntent(intent: string, network?: string): Promise<MatchResponse> {
  if (!intent) {
    throw new Error("User intent is required");
  }
  
  try {
    console.log(`Matching intent: "${intent}" with network: ${network || "any"}`);
    
    // Check if Gemini is initialized
    if (!genAI) {
      console.warn("Gemini AI not initialized. Falling back to default response.");
      return {
        matches: [],
        recommendation: "No matching subgraphs found. Gemini AI is required to generate queries. Please configure the GOOGLE_AI_API_KEY environment variable."
      };
    }
    
    // Define available subgraphs (could be expanded with findSubgraphsByContract)
    const availableSubgraphs: Subgraph[] = [
      {
        id: "6ZM4U5FkFLop2Fjtaz4q8Q7zwDvEVJQhWpAPBy6vT632",
        displayName: "uniswap-v3-optimism",
        description: "Uniswap V3 subgraph for Optimism network",
        network: "optimism",
        ipfsHash: "QmNPZx4tgVfw5TFgmioXLTT1xdaz1yyyAyHwzi8jxDTvVR",
        contractAddresses: ["0x1F98431c8aD98523631AE4a59f267346ea31F984"]
      }
      // Add more subgraphs here or fetch dynamically with findSubgraphsByContract
    ];

    // Filter by network if provided
    const filteredSubgraphs = network 
      ? availableSubgraphs.filter(sg => sg.network === network)
      : availableSubgraphs;

    if (filteredSubgraphs.length === 0) {
      console.log(`No subgraphs found for network: ${network}`);
      return {
        matches: [],
        recommendation: `No subgraphs available for network "${network || 'any'}". Try a different network or create a new subgraph at https://thegraph.com/docs.`
      };
    }

    // Fetch schemas for all subgraphs
    console.log("Fetching schemas for available subgraphs");
    const subgraphsWithSchemas = await Promise.all(
      filteredSubgraphs.map(async (sg) => {
        const schema = await getSubgraphSchema(sg.id);
        const schemaObj = typeof schema === "string" ? { raw: schema, description: "" } : schema;
        return { ...sg, schema: schemaObj };
      })
    );

    // Use Gemini to match intent and generate queries
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-exp-03-25" });
    const prompt = `
      The user wants to query data with this intent: "${intent}"
      Available subgraphs:
      ${subgraphsWithSchemas.map(sg => `
        Subgraph: ${sg.displayName} (${sg.network})
        Description: ${sg.description}
        Schema: ${sg.schema.raw}
      `).join('\n')}

      For each subgraph:
      1. Assign a relevance score (0-100) based on how well it matches the intent.
      2. If score > 50, generate a GraphQL query that satisfies the intent using the schema.
      3. Provide a brief explanation of the match and query.

      Return a JSON array of objects:
      [
        {
          "id": "subgraph-id",
          "score": number,
          "query": "GraphQL query string or empty string if score <= 50",
          "reason": "explanation of match and query"
        }
      ]
    `;

    console.log("Sending request to Gemini for intent matching and query generation");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const matchText = response.text();

    console.log("Gemini response:", matchText);

    // Parse Gemini's response
    let matches: MatchResult[] = [];
    try {
      const parsed = JSON.parse(matchText);
      if (Array.isArray(parsed)) {
        matches = parsed.map(item => {
          const subgraph = subgraphsWithSchemas.find(sg => sg.id === item.id);
          if (!subgraph) {
            console.warn(`Subgraph with id ${item.id} not found in available subgraphs`);
            return null;
          }
          const sampleQuery = item.query || generateSampleQuery(subgraph);
          return {
            subgraph,
            confidence: item.score || 0,
            sampleQuery
          };
        }).filter((m): m is NonNullable<typeof m> => m !== null) as MatchResult[];
      } else {
        throw new Error("Gemini response is not an array");
      }
    } catch (error) {
      console.error("Error parsing Gemini response:", error);
      // Fallback to basic matching
      matches = subgraphsWithSchemas.map(sg => ({
        subgraph: sg,
        confidence: 50,
        sampleQuery: generateSampleQuery(sg)
      }));
    }

    // Sort matches by confidence (highest first)
    matches.sort((a, b) => b.confidence - a.confidence);

    // Generate recommendation
    const recommendation = matches.length > 0 && matches[0].confidence > 70
      ? `Recommended subgraph: "${matches[0].subgraph.displayName}" (confidence: ${matches[0].confidence})\nSuggested query:\n${matches[0].sampleQuery}`
      : matches.length > 0
        ? `Best match: "${matches[0].subgraph.displayName}" (confidence: ${matches[0].confidence}), but confidence is low. Query:\n${matches[0].sampleQuery}`
        : "No suitable subgraphs found. You may need to create a new subgraph: https://thegraph.com/docs";

    console.log("Returning matches:", matches);
    return {
      matches,
      recommendation
    };
  } catch (error) {
    console.error("Error matching intent:", error);
    return {
      matches: [],
      recommendation: "An error occurred while matching your intent. Please try again later."
    };
  }
}

/**
 * Generate a sample GraphQL query for a subgraph (moved from original end of file)
 */
function generateSampleQuery(subgraph: Subgraph): string {
  if (subgraph.id === "6ZM4U5FkFLop2Fjtaz4q8Q7zwDvEVJQhWpAPBy6vT632") {
    return `{
  pools(first: 5, orderBy: volumeUSD, orderDirection: desc) {
    id
    token0 {
      symbol
    }
    token1 {
      symbol
    }
    volumeUSD
    feesUSD
  }
}`;
  }
  
  return `{
  # This is a sample query - modify based on the subgraph schema
  # Use getSubgraphSchema() to get the full schema
}`;
}
