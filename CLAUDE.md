# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a personal portfolio/blog site built with Hugo static site generator and hosted on GitHub Pages. The site showcases projects, blog posts, and follows a unique "prompt-first" development philosophy where AI prompts drive the creation process.

## Core Technologies

- **Hugo** (v0.147.8) - Static site generator
- **Three.js** (r128) - For interactive web games
- **Vanilla JavaScript** - No build tools or modern frameworks
- **GitHub Pages** - Automated deployment via GitHub Actions

## Common Commands

```bash
# Build the site
hugo

# Build with minification (production)
hugo --minify

# Run local development server
hugo server

# Check Hugo can build after changes
hugo
```

## Architecture

The site follows Hugo's standard structure:
- `content/` - Markdown content (blog posts, projects, prompts)
- `layouts/` - Hugo templates for rendering
- `static/assets/` - Images, JavaScript, and other static files
- `prompts/` - Source AI prompts (not published directly)

## Development Guidelines

### Site Rules (Always Apply)
- Keep the site static - never rely on a backend server
- For authentication, prompt users for API keys on the frontend
- Validate Hugo builds after major changes: run `hugo` to check
- Use Hugo exclusively for site generation
- Store all assets in `static/assets/` with logical structure
- When creating games, use Three.js as the core engine

### Prompt Management
- Source prompts are in `prompts/` folder
- When a prompt is generated, copy to `content/prompts/` and mark as GENERATED with timestamp
- Prompts are single-shot task-oriented - not meant to be interlaced
- Do not auto-generate prompts in the `prompts/` folder

### Three.js Game Development
When working on games:
- Target 60 FPS on modern devices
- Implement proper memory management (call `dispose()` on resources)
- Support mobile, tablet, and desktop
- Store game assets in `static/assets/[game-name]/`
- Use object pooling for frequently created/destroyed objects
- Implement delta time for smooth movement
- Handle different input methods (keyboard, mouse, touch)

## Deployment

The site automatically deploys to GitHub Pages when pushing to the main branch. The GitHub Actions workflow handles:
1. Checking out code
2. Installing Hugo
3. Building with `hugo --minify`
4. Deploying to GitHub Pages

## Important Notes

- No package.json or npm tooling - kept intentionally simple
- No testing framework - quality assurance is manual
- No linting or formatting tools configured
- The development philosophy emphasizes AI-driven code generation through prompts