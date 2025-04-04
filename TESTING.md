# Testing Guide for Subgraph Finder

This guide explains how to test both the MCP server and the standalone server implementations of Subgraph Finder.

## Testing the MCP Server

### Prerequisites
- Claude Desktop installed
- Node.js and npm installed

### Steps

1. **Build the MCP server**
   ```bash
   npm install
   npm run build
   ```

2. **Configure Claude Desktop**
   
   Add the Subgraph Finder MCP server to your Claude Desktop configuration file:
   
   ```json
   {
     "mcpServers": {
       "subgraph-finder": {
         "command": "node",
         "args": [
           "/absolute/path/to/subgraph-finder/build/index.js"
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
   
   Replace `/absolute/path/to/subgraph-finder` with the actual path to your project.

3. **Restart Claude Desktop**
   
   Close and reopen Claude Desktop to load the MCP server.

4. **Test with Claude**
   
   Ask Claude to use the Subgraph Finder with prompts like:
   
   - "List all networks in The Graph ecosystem"
   - "Find subgraphs that index the contract 0xd829c1d3649dbc3fd96d3d22500ef33a46daae46"
   - "Get the schema for subgraph QmXKwSEMirgWVn41nRzkT3hpUBw29cp619Gx1BfmLvPNGy"
   - "I want trading volume and liquidity for a DEX on Arbitrum"

5. **Run the example script**
   
   You can also test the MCP server directly using the example script:
   
   ```bash
   cd examples
   ./use-subgraph-finder.js
   ```

## Testing the Standalone Server

### Prerequisites
- Node.js and npm installed

### Steps

1. **Build and start the standalone server**
   ```bash
   cd standalone
   npm install
   cp .env.example .env
   # Edit .env to add your Graph API key if needed
   npm run build
   npm start
   ```

   The server will start on http://localhost:3000 by default.

2. **Test with the client example**
   
   In a new terminal window:
   
   ```bash
   cd standalone
   npm run example:client
   ```
   
   This will run the client example script, which demonstrates all the API endpoints.

3. **Test with curl**
   
   You can also test the API endpoints directly using curl:
   
   ```bash
   # List all networks
   curl http://localhost:3000/api/networks
   
   # Find subgraphs by contract address
   curl http://localhost:3000/api/subgraphs/contract/0xd829c1d3649dbc3fd96d3d22500ef33a46daae46
   
   # Get schema for a subgraph
   curl http://localhost:3000/api/subgraphs/QmXKwSEMirgWVn41nRzkT3hpUBw29cp619Gx1BfmLvPNGy/schema
   
   # Match intent with available subgraphs
   curl -X POST -H "Content-Type: application/json" -d '{"intent":"I want trading volume and liquidity for a DEX on Arbitrum","network":"arbitrum-one"}' http://localhost:3000/api/match
   ```

4. **Test with a web browser**
   
   You can also test the GET endpoints by visiting them in a web browser:
   
   - http://localhost:3000/api/networks
   - http://localhost:3000/api/subgraphs/contract/0xd829c1d3649dbc3fd96d3d22500ef33a46daae46
   - http://localhost:3000/api/subgraphs/QmXKwSEMirgWVn41nRzkT3hpUBw29cp619Gx1BfmLvPNGy/schema
   - http://localhost:3000/api/match?intent=I%20want%20trading%20volume%20and%20liquidity%20for%20a%20DEX%20on%20Arbitrum&network=arbitrum-one

## Testing with Gemini and Roo Code

### Prerequisites
- Gemini Pro access
- Roo Code installed and configured
- Standalone server running

### Steps

1. **Configure Roo Code**
   
   Use the configuration from the Roo Code example:
   
   ```bash
   cd standalone
   npm run example:roo
   ```
   
   This will output the configuration you need to add to Roo Code.

2. **Start a conversation with Gemini**
   
   Once Roo Code is configured, start a conversation with Gemini and ask it to use the Subgraph Finder:
   
   - "List all networks in The Graph ecosystem"
   - "Find subgraphs that index the contract 0xd829c1d3649dbc3fd96d3d22500ef33a46daae46"
   - "Get the schema for subgraph QmXKwSEMirgWVn41nRzkT3hpUBw29cp619Gx1BfmLvPNGy"
   - "I want trading volume and liquidity for a DEX on Arbitrum"

## Testing with Local Roo Code CLI

### Prerequisites
- Node.js and npm installed
- Standalone server running
- Roo CLI installed locally (see [Roo Code documentation](https://docs.roocode.com/getting-started/installation) for installation instructions)

### Steps

1. **Run the local Roo test script**

   The project includes a script that helps you test with local Roo Code:

   ```bash
   cd standalone
   npm run test:local-roo
   ```

   This script will:
   - Check if the standalone server is running
   - Generate a Roo configuration file
   - Provide instructions for setting up Roo Code
   - Show example commands for testing

2. **Set up Roo Code configuration**

   Follow the instructions provided by the script to set up your Roo Code configuration.

3. **Test with Roo CLI directly**

   You can test the tools directly using the Roo CLI:

   ```bash
   # List all networks
   roo tools subgraph-finder list_networks

   # Find subgraphs by contract
   roo tools subgraph-finder find_by_contract --contractAddress 0xd829c1d3649dbc3fd96d3d22500ef33a46daae46

   # Get schema for a subgraph
   roo tools subgraph-finder get_schema --subgraphId QmXKwSEMirgWVn41nRzkT3hpUBw29cp619Gx1BfmLvPNGy

   # Match intent with available subgraphs
   roo tools subgraph-finder match_intent --intent "I want trading volume and liquidity for a DEX on Arbitrum"
   ```

4. **Test with Roo Chat**

   You can also test in an interactive chat session:

   ```bash
   roo chat
   ```

   Then try the example prompts provided in the test script.

## Troubleshooting

### MCP Server Issues

- **Claude doesn't recognize the MCP server**: Make sure the configuration path is correct and Claude Desktop has been restarted.
- **Error in MCP server**: Check the Claude Desktop logs for error messages.

### Standalone Server Issues

- **Server won't start**: Make sure all dependencies are installed and the port (default 3000) is not in use.
- **API returns errors**: Check the server logs for error messages.
- **CORS errors**: If you're accessing the API from a web application, you may need to configure CORS settings.

### API Key Issues

- Both implementations require a Graph API key for production use. If you're getting authentication errors, make sure your API key is correctly configured.
