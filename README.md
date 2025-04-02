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

## Installation

This is a Model Context Protocol (MCP) server designed to work with Claude. To install:

1. Clone this repository:
   ```
   git clone https://github.com/PaulieB14/Subgraph-Finder.git
   cd Subgraph-Finder
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Build the server:
   ```
   npm run build
   ```

4. Configure in Claude Desktop:
   - Edit `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Add the following configuration:
     ```json
     {
       "mcpServers": {
         "subgraph-finder": {
           "command": "node",
           "args": ["/path/to/Subgraph-Finder/build/index.js"]
         }
       }
     }
     ```

## Usage

Once installed, you can interact with the Subgraph Finder through Claude using natural language:

1. **List available networks**:
   "What networks are available in The Graph ecosystem?"

2. **Find subgraphs by contract**:
   "Find subgraphs that index the contract 0xd829c1d3649dbc3fd96d3d22500ef33a46daae46"

3. **Get schema information**:
   "Show me the schema for the Monadex subgraph"

4. **Match intent with subgraphs**:
   "I want trading volume and liquidity data for a DEX on Arbitrum"

## Development

### Project Structure

- `src/index.ts`: Main server implementation
- `package.json`: Project dependencies and scripts

### Available Scripts

- `npm run build`: Build the project
- `npm run watch`: Watch for changes and rebuild
- `npm run inspector`: Run the MCP inspector for debugging

## Future Enhancements

- Integration with The Graph's API for real-time subgraph data
- Enhanced AI matching using more sophisticated schema analysis
- Support for more complex filtering options
- Performance optimizations and caching

## License

MIT

## Acknowledgements

- [The Graph](https://thegraph.com/) for creating an amazing decentralized indexing protocol
- [Model Context Protocol](https://modelcontextprotocol.io/) for enabling tool integration with Claude
