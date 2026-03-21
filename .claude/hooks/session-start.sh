#!/bin/bash
set -euo pipefail

# Only run in remote (web) environments
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

HUGO_VERSION="0.147.8"

# Check if Hugo is already installed at the right version
if command -v hugo &>/dev/null && hugo version 2>/dev/null | grep -q "${HUGO_VERSION}"; then
  exit 0
fi

# Install Hugo extended edition
wget -q -O /tmp/hugo.deb "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-amd64.deb" \
  && sudo dpkg -i /tmp/hugo.deb \
  && rm -f /tmp/hugo.deb
