#!/bin/bash
# Load environment variables from .env.mcp and launch Claude Code

# Load all variables from .env.mcp
if [ -f ".env.mcp" ]; then
    export $(grep -v '^#' .env.mcp | grep -v '^$' | xargs)
    echo "✓ Loaded environment variables from .env.mcp"
else
    echo "✗ .env.mcp not found"
    exit 1
fi

# Launch Claude Code
echo "Starting Claude Code..."
claude-code

# Note: Replace 'claude-code' above with the actual command you use to launch Claude Code
# It might be 'code' or something else depending on your setup
