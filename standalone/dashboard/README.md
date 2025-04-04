# Subgraph Finder Dashboard

A web-based dashboard for testing the Subgraph Finder API.

## Overview

This dashboard provides a user-friendly interface for interacting with the Subgraph Finder API. It allows you to:

- List all networks in The Graph ecosystem
- Find subgraphs that index a specific contract address
- Get the schema for a specific subgraph
- Match user intent with available subgraphs

## Getting Started

### Prerequisites

- Node.js and npm installed
- Subgraph Finder API running (on port 3002 by default)

### Running the Dashboard

1. Start the Subgraph Finder API:
   ```bash
   cd standalone
   npm start
   ```

2. In a new terminal, start the dashboard:
   ```bash
   cd standalone
   npm run dashboard
   ```

   This will start a simple HTTP server on port 8080 and open the dashboard in your default web browser.

## Using the Dashboard

The dashboard is organized into tabs, each corresponding to a different API endpoint:

### Networks Tab

- Click the "List Networks" button to get a list of all available networks.

### Find by Contract Tab

- Enter a contract address (e.g., `0xd829c1d3649dbc3fd96d3d22500ef33a46daae46`).
- Optionally select a network to filter by.
- Click "Find Subgraphs" to search for subgraphs that index the specified contract.

### Get Schema Tab

- Enter a subgraph ID (e.g., `QmXKwSEMirgWVn41nRzkT3hpUBw29cp619Gx1BfmLvPNGy`).
- Click "Get Schema" to retrieve the schema for the specified subgraph.

### Match Intent Tab

- Enter your intent in natural language (e.g., "I want trading volume and liquidity for a DEX on Arbitrum").
- Optionally select a network to filter by.
- Click "Match Intent" to find subgraphs that match your intent.

## Troubleshooting

- If you see connection errors, make sure the Subgraph Finder API is running on port 3002.
- If the API is running on a different port, update the `API_BASE_URL` in the dashboard's JavaScript code.

## Customizing the Dashboard

You can customize the dashboard by editing the `index.html` file. The dashboard is built with plain HTML, CSS, and JavaScript, so it's easy to modify.
