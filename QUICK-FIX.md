# Quick Fix Guide

## Issue 1: `npm start` not working in root directory

The `npm start` command needs to be run from the `standalone` directory, not the root directory:

```bash
cd standalone
npm start
```

This is because the start script is defined in the standalone/package.json file, not in the root package.json.

## Issue 2: Roo CLI package not available

The `@anthropic/roo-cli` package is not available in the public npm registry. This suggests that Roo Code might:

1. Be in a private registry
2. Require special access
3. Have a different package name
4. Not be available as an npm package

## Testing the Standalone Server Without Roo

You can test the standalone server using these methods:

1. **Start the server**:
   ```bash
   cd standalone
   npm install
   npm run build
   npm start
   ```

2. **Test with curl** (in a new terminal):
   ```bash
   # List all networks
   curl http://localhost:3002/api/networks
   
   # Find subgraphs by contract address
   curl http://localhost:3002/api/subgraphs/contract/0xd829c1d3649dbc3fd96d3d22500ef33a46daae46
   ```

3. **Test with the client example**:
   ```bash
   cd standalone
   npm run example:client
   ```

4. **Test with a web browser** by visiting:
   - http://localhost:3002/api/networks
   - http://localhost:3002/api/subgraphs/contract/0xd829c1d3649dbc3fd96d3d22500ef33a46daae46

## Issue 3: Port already in use

You're seeing an error like this:
```
Error: listen EADDRINUSE: address already in use :::3001
```

This means the port is already in use, likely by another instance of the server that's already running. You have two options:

1. **Kill the existing process using the port**:
   ```bash
   # Find the process using the port (e.g., 3001)
   lsof -i :3001
   
   # Kill the process (replace PID with the process ID from the previous command)
   kill -9 PID
   
   # Then try starting the server again
   npm start
   ```

2. **Change the port in the server**:
   Edit `standalone/.env` to change the PORT variable:
   ```
   PORT=3002
   ```
   Then restart the server:
   ```bash
   npm start
   ```
   Now the server will run on port 3002 instead of 3001.

## Running the MCP Server

To run the MCP server (for Claude Desktop):

```bash
# In the root directory
npm install
npm run build
```

Then configure Claude Desktop as described in the README.md file.

## Testing the Server

Since the server is already running (that's why you got the port in use error), you can test it right away:

```bash
# Test with curl
curl http://localhost:3002/api/networks

# Or run the client example
cd standalone
npm run example:client
```

You can also visit http://localhost:3002/api/networks in your web browser.

## Using the Dashboard

I've created a web-based dashboard for testing the API:

1. Start the API server (if it's not already running):
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

The dashboard provides a user-friendly interface for:
- Listing networks
- Finding subgraphs by contract address
- Getting schemas
- Matching intent with subgraphs

See the dashboard README for more details: `standalone/dashboard/README.md`
