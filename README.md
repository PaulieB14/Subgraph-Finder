# Subgraph Finder

An AI-powered tool to help users find the right subgraph in The Graph ecosystem based on their needs.

## Overview

As The Graph ecosystem grows with more subgraphs being deployed, it's becoming harder for users—especially newcomers—to find the right subgraph for their data needs or determine if they need to build one. Subgraph Finder addresses this challenge by providing an AI-powered tool that helps users discover relevant subgraphs based on their specific requirements.

## Features

1. **Filter by Network**
   - Select from various networks (Ethereum, Arbitrum, Optimism, etc.)
   - Narrow down subgraphs to a specific blockchain network

2. **Filter by Smart Contract**
   - Find subgraphs that index a specific contract address
   - Discover which subgraphs contain data for contracts you're interested in

3. **Retrieve Schemas**
   - Get detailed schema information for subgraphs
   - Understand what data is available without diving into the code

4. **AI-Assisted Matching**
   - Describe your needs in natural language
   - Get matched with relevant subgraphs based on your intent
   - Receive sample GraphQL queries to get started quickly

5. **Network Statistics**
   - Query statistics about networks and subgraphs
   - Find out how many subgraphs are on a specific network
   - Get total counts across all networks

## Installation

1. Clone the repository:
```bash
git clone https://github.com/PaulieB14/Subgraph-Finder.git
cd Subgraph-Finder
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Configuration

The server can be configured using environment variables:

- `GRAPH_API_KEY`: API key for The Graph (required for production use)
- `GRAPH_HOSTED_SERVICE_URL`: URL for The Graph's hosted service
- `GRAPH_NETWORK_SUBGRAPH_URL`: URL for The Graph's network subgraph
- `GRAPH_GATEWAY_URL`: URL for The Graph's gateway
- `GRAPH_SCHEMA_SUBGRAPH_ID`: ID of the subgraph that provides schema information
- `GRAPH_CONTRACT_SUBGRAPH_ID`: ID of the subgraph that provides contract information
- `DASHBOARD_URL`: URL for the subgraph search dashboard

## Usage with Claude Desktop

1. Add the server to your Claude Desktop configuration file:
```json
{
  "mcpServers": {
    "subgraph-finder": {
      "command": "node",
      "args": [
        "/path/to/subgraph-finder/build/index.js"
      ],
      "env": {
        "GRAPH_API_KEY": "your-api-key",
        "GRAPH_HOSTED_SERVICE_URL": "https://api.thegraph.com/subgraphs/name/",
        "GRAPH_NETWORK_SUBGRAPH_URL": "https://api.thegraph.com/subgraphs/name/graphprotocol/graph-network-mainnet",
        "GRAPH_GATEWAY_URL": "https://gateway.thegraph.com/api/",
        "GRAPH_SCHEMA_SUBGRAPH_ID": "DZz4kDTdmzWLWsV373w2bSmoar3umKKH9y82SUKr5qmp",
        "GRAPH_CONTRACT_SUBGRAPH_ID": "FMTUN6d7sY2bLnAmNEPJTqiU3iuQht6ZXurpBh71wbWR",
        "DASHBOARD_URL": "https://subgraph-search-by-contract.vercel.app"
      }
    }
  }
}
```

2. Restart Claude Desktop to load the server.

3. Ask Claude to use the Subgraph Finder:
   - "List all networks in The Graph ecosystem"
   - "Find subgraphs that index the contract 0xd829c1d3649dbc3fd96d3d22500ef33a46daae46"
   - "Get the schema for subgraph QmXKwSEMirgWVn41nRzkT3hpUBw29cp619Gx1BfmLvPNGy"
   - "I want trading volume and liquidity for a DEX on Arbitrum"

## Available Tools

### list_networks

Lists all available networks in The Graph ecosystem.

### find_by_contract

Finds subgraphs that index a specific contract address.

Parameters:
- `contractAddress`: Ethereum contract address (e.g., 0xd829c1d3649dbc3fd96d3d22500ef33a46daae46)
- `network`: (Optional) Network ID (e.g., mainnet, arbitrum-one)

### get_schema

Gets the schema for a specific subgraph.

Parameters:
- `subgraphId`: ID of the subgraph

### match_intent

Matches user intent with available subgraphs.

Parameters:
- `intent`: User's intent (e.g., 'I want trading volume and liquidity for a DEX on Arbitrum')
- `network`: (Optional) Network ID to filter by

### query_network_stats

Queries statistics about networks and subgraphs from The Graph Network.

Parameters:
- `network`: (Optional) Network ID to filter by (e.g., mainnet, arbitrum-one, scroll)

Example usage:
- "How many subgraphs are on Scroll?"
- "What are the network statistics for Arbitrum One?"
- "How many total subgraphs are there across all networks?"

## Development

### Project Structure

- `src/index.ts`: Main server implementation
- `build/index.js`: Compiled JavaScript server
- `examples/use-subgraph-finder.js`: Example usage script
- `package.json`: Project dependencies and scripts
- `tsconfig.json`: TypeScript configuration

### Available Scripts

- `npm run build`: Build the project
- `npm run watch`: Watch for changes and rebuild
- `npm run inspector`: Run the MCP inspector for debugging

### Running the Example Script

To see all the functionality in action:

```bash
cd examples
./use-subgraph-finder.js
```

This will demonstrate all the available functionality of the Subgraph Finder MCP server, including querying statistics for the Scroll network.

## Future Enhancements

- Integration with The Graph's API for real-time subgraph data
- Enhanced AI matching using more sophisticated schema analysis
- Support for more complex filtering options
- Performance optimizations and caching
- Historical data tracking for network statistics

## License

MIT

## Acknowledgements

- [The Graph](https://thegraph.com/) for creating an amazing decentralized indexing protocol
- [Model Context Protocol](https://modelcontextprotocol.io/) for enabling tool integration with Claude
