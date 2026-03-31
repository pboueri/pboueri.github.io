# CI Build Validation

## Background
The site currently only builds on push to main for deployment. There's no validation on pull requests, meaning broken builds can be merged. We need a GitHub Actions workflow that validates PRs before merge.

## Requirements
- GitHub Actions workflow that triggers on pull requests and pushes to main
- Runs the full Hugo build (including site data generation scripts)
- Validates the build succeeds before a PR can be merged
- Validates that all internal links resolve (no broken links)
- Checks that HTML output is well-formed
- Lightweight and fast — no deploy step on PRs, just validation
- Should reuse the same Hugo version as the deploy workflow
