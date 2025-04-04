# Subgraph Finder Scripts

This directory contains utility scripts for the Subgraph Finder project.

## Available Scripts

- **run-local.sh**: Sets up and runs the server locally to test the deployment
  ```bash
  ./scripts/run-local.sh
  ```

- **fix-and-test.sh**: Fixes TypeScript errors and runs tests
  ```bash
  ./scripts/fix-and-test.sh
  ```

- **quick-fix.sh**: Quickly fixes common issues in the codebase
  ```bash
  ./scripts/quick-fix.sh
  ```

## Running Scripts

Make sure to make the scripts executable before running them:

```bash
chmod +x scripts/*.sh
```

Then you can run a script using:

```bash
./scripts/script-name.sh
```

## Adding New Scripts

When adding new scripts to this directory, please follow these guidelines:

1. Use descriptive names that indicate the purpose of the script
2. Add proper documentation at the beginning of the script
3. Make the script executable (`chmod +x script-name.sh`)
4. Update this README.md file with information about the new script
