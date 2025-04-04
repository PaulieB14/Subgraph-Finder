# Subgraph Finder Standalone Server

A standalone HTTP server for the Subgraph Finder tool, which helps users find the right subgraph in The Graph ecosystem based on their needs.

> **Quick Start**: For a quick setup guide, see the [Quickstart Guide](./QUICKSTART.md).

## Overview

This standalone server provides an HTTP API for the Subgraph Finder functionality, making it easy to integrate with any client application, including AI assistants like Gemini with Roo Code.

## Features

1. **Filter by Network**
   - List all available networks in The Graph ecosystem
   - Filter subgraphs by network

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

1. Clone the repository:
```bash
git clone https://github.com/YourUsername/subgraph-finder-standalone.git
cd subgraph-finder-standalone
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on the `.env.example` file:
```bash
cp .env.example .env
```

4. Edit the `.env` file to add your Graph API key and configure other settings.

5. Build the project:
```bash
npm run build
```

6. Start the server:
```bash
npm start
```

## Testing

For detailed instructions on how to test the standalone server, see the [Testing Guide](../TESTING.md).

## API Endpoints

### Networks

- `GET /api/networks` - List all available networks

### Subgraphs

- `GET /api/subgraphs/contract/:address` - Find subgraphs by contract address
  - Query params: `network` (optional) - Filter by network

- `GET /api/subgraphs/:id` - Get a subgraph by ID

- `GET /api/subgraphs/:id/schema` - Get the schema for a subgraph

### Intent Matching

- `POST /api/match` - Match user intent with available subgraphs
  - Body: `{ "intent": "string", "network": "string" (optional) }`

- `GET /api/match` - Match user intent with available subgraphs (query params version)
  - Query params: `intent` (required), `network` (optional)

## Using with Roo Code

This standalone server can be used with Gemini and Roo Code to provide subgraph finding capabilities to your AI assistant.

### Roo Code Configuration

1. Install Roo Code and set up Gemini integration.

2. Configure the Subgraph Finder API in your Roo Code configuration:

```json
{
  "tools": [
    {
      "name": "subgraph-finder",
      "description": "Find the right subgraph in The Graph ecosystem based on your needs",
      "api": {
        "type": "openapi",
        "url": "http://localhost:3000/api",
        "endpoints": [
          {
            "path": "/networks",
            "method": "GET",
            "description": "List all available networks in The Graph ecosystem"
          },
          {
            "path": "/subgraphs/contract/{address}",
            "method": "GET",
            "description": "Find subgraphs that index a specific contract address",
            "parameters": [
              {
                "name": "address",
                "description": "Ethereum contract address (e.g., 0xd829c1d3649dbc3fd96d3d22500ef33a46daae46)"
              },
              {
                "name": "network",
                "description": "Network ID (e.g., mainnet, arbitrum-one)",
                "required": false
              }
            ]
          },
          {
            "path": "/subgraphs/{id}/schema",
            "method": "GET",
            "description": "Get the schema for a specific subgraph",
            "parameters": [
              {
                "name": "id",
                "description": "ID of the subgraph"
              }
            ]
          },
          {
            "path": "/match",
            "method": "POST",
            "description": "Match user intent with available subgraphs",
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "intent": {
                        "type": "string",
                        "description": "User's intent (e.g., 'I want trading volume and liquidity for a DEX on Arbitrum')"
                      },
                      "network": {
                        "type": "string",
                        "description": "Optional network ID to filter by"
                      }
                    },
                    "required": ["intent"]
                  }
                }
              }
            }
          }
        ]
      }
    }
  ]
}
```

3. Start using the Subgraph Finder in your conversations with Gemini!

## Development

### Project Structure

- `src/index.ts`: Main server implementation
- `src/routes/`: API route handlers
- `src/services/`: Business logic and data access
- `src/types/`: TypeScript type definitions

### Available Scripts

- `npm run build`: Build the project
- `npm start`: Start the server
- `npm run dev`: Start the server in development mode with hot reloading
- `npm run example:client`: Run the client example
- `npm run example:roo`: Run the Roo Code configuration example
- `npm run test:local-roo`: Test with local Roo Code CLI

### Examples and Tools

The project includes several examples and tools to help you get started:

1. **Examples Directory**:
   - **client-example.js**: A Node.js client that demonstrates how to use the API programmatically
   - **roo-code-example.js**: A sample configuration for using the API with Gemini and Roo Code
   - **test-local-roo.js**: A script to test with local Roo Code installation

2. **Chat Interface**:
   A conversational chat interface powered by Gemini and Roo Code is available in the `dashboard` directory.
   
   To use the chat interface:
   ```bash
   npm run dashboard
   ```
   
   This will start a simple HTTP server and open the chat interface in your default web browser.
   
   The chat interface allows users to:
   - Ask questions about networks in The Graph ecosystem
   - Find subgraphs that index specific contract addresses
   - Get schemas for subgraphs
   - Match their intent with available subgraphs using natural language
   
   See the [Chat Interface README](./dashboard/README.md) for more details.

## License

MIT
