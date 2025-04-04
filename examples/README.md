# Subgraph Finder Examples

This directory contains examples of how to use the Subgraph Finder library.

## Directory Structure

- **basic/**: Simple examples to get started with the Subgraph Finder
  - `simple-test.js`: Basic usage of the Subgraph Finder
  - `client-example.js`: Example of using the Subgraph Finder client

- **contracts/**: Examples related to finding subgraphs by contract address
  - `test-contract.js`: Example of finding subgraphs by contract address
  - `test-contract-dist.js`: Example using the distributed version

- **schemas/**: Examples related to retrieving and working with subgraph schemas
  - `test-schema-dist.js`: Example of retrieving a subgraph schema
  - `test-uniswap-schema.js`: Example specific to Uniswap schemas

- **import/**: Examples showing how to import and use the Subgraph Finder
  - `import-test.js`: Example of importing the Subgraph Finder
  - `import-test-dist.js`: Example of importing the distributed version

## Running the Examples

To run an example, use Node.js:

```bash
node examples/basic/simple-test.js
```

Make sure you have installed the dependencies first:

```bash
npm install
```

## Environment Variables

Some examples may require environment variables to be set. Check the specific example for details.
