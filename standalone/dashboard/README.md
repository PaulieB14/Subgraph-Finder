# Subgraph Finder Chat Interface

A chat-based interface for interacting with the Subgraph Finder API, powered by Gemini and Roo Code.

## Overview

This chat interface provides a conversational way to interact with the Subgraph Finder API. It allows you to:

- Ask questions about networks in The Graph ecosystem
- Find subgraphs that index specific contract addresses
- Get schemas for subgraphs
- Match your intent with available subgraphs using natural language

## Getting Started

### Prerequisites

- Node.js and npm installed
- Subgraph Finder API running (on port 3000 by default)
- For full functionality: Gemini API key and Roo Code configured

### Running the Chat Interface

1. Start the Subgraph Finder API:
   ```bash
   cd standalone
   npm start
   ```

2. Access the chat interface:
   ```bash
   cd standalone
   npm run dashboard
   ```

   This will start a simple HTTP server and open the chat interface in your default web browser.

## Using the Chat Interface

The chat interface is designed to be intuitive and conversational:

1. Type your query in natural language in the input box at the bottom of the screen
2. Press Enter or click the Send button to submit your query
3. The system will process your query and display the response in the chat

### Example Queries

- "List all networks in The Graph ecosystem"
- "Find subgraphs that index contract 0xd829c1d3649dbc3fd96d3d22500ef33a46daae46"
- "Get schema for subgraph QmXKwSEMirgWVn41nRzkT3hpUBw29cp619Gx1BfmLvPNGy"
- "I want trading volume and liquidity for a DEX on Arbitrum"

### Settings

Click the gear icon (⚙️) in the top right corner to access settings:

- **API URL**: Configure the URL of the Subgraph Finder API
- **Roo API Key**: Add your Roo API key if needed

## How It Works

The chat interface works by:

1. Parsing your natural language query
2. Determining which API endpoint to call based on the content of your query
3. Making the appropriate API request
4. Formatting the response in a human-readable way
5. Displaying the response in the chat

For more complex queries, it uses the `/match` endpoint which leverages Gemini's AI capabilities to understand your intent and find relevant subgraphs.

## Troubleshooting

- If you see connection errors, make sure the Subgraph Finder API is running.
- If the API is running on a different port or host, update the API URL in the settings.
- For full AI functionality, ensure your Gemini API key is properly configured in the Subgraph Finder API.

## Legacy Dashboard

The original tab-based dashboard is still available in the codebase but has been replaced by this chat interface. If you prefer the original dashboard, you can modify the `index.html` file to remove the redirect to `chat.html`.
