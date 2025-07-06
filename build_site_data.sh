#!/bin/bash

# Script that generates site data (git history) before Hugo build

echo "Generating site data..."

# Generate git history for all prompts
./scripts/generate-all-prompt-history.sh

echo "Site data generation complete!"