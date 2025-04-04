# Quickstart Guide for Subgraph Finder Standalone Server

This guide provides step-by-step instructions to get the Subgraph Finder standalone server up and running quickly.

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

## Installation and Setup

1. **Install dependencies**

   ```bash
   cd standalone
   npm install
   ```

2. **Create environment file**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` if you have a Graph API key (optional for testing).

3. **Build the project**

   ```bash
   npm run build
   ```

   This step is crucial! It compiles the TypeScript code to JavaScript in the `dist` directory.

4. **Start the server**

   ```bash
   npm start
   ```

   You should see output indicating the server is running on http://localhost:3000.

## Testing the Server

1. **In a new terminal window, run the test script**

   ```bash
   cd standalone
   npm run test:local-roo
   ```

   This will check if the server is running and provide instructions for testing with Roo Code.

2. **Test with curl**

   ```bash
   # List all networks
   curl http://localhost:3000/api/networks
   ```

   You should see a JSON response with a list of networks.

## Troubleshooting

### Error: Cannot find module 'dist/index.js'

If you see this error, it means you haven't built the project yet. Run:

```bash
npm run build
```

### Server won't start

Make sure:
- Port 3000 is not in use by another application
- You've installed all dependencies with `npm install`
- You've built the project with `npm run build`

### Other Issues

See the full [Testing Guide](../TESTING.md) for more detailed troubleshooting information.
