# Release Instructions

## The Problem
Release-please requires **Conventional Commits** format to detect what should be released.

## Commit Format Required

Your commit messages MUST follow this format:

```
<type>: <description>

[optional body]

[optional footer]
```

### Valid Types:
- `feat:` - New feature (bumps MINOR version, e.g., 1.0.0 → 1.1.0)
- `fix:` - Bug fix (bumps PATCH version, e.g., 1.0.0 → 1.0.1)
- `docs:` - Documentation only changes
- `chore:` - Maintenance tasks
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `ci:` - CI/CD changes

### Examples of GOOD commits:
```bash
git commit -m "feat: add user authentication"
git commit -m "fix: resolve connection timeout issue"
git commit -m "docs: update API documentation"
git commit -m "feat!: breaking change to authentication API"
```

### Examples of BAD commits (won't trigger release):
```bash
git commit -m "Feat/improved auth"          # ❌ No colon, wrong format
git commit -m "fix/successful release"       # ❌ Using slash instead of colon
git commit -m "updated readme"               # ❌ No type prefix
```

## How to Trigger a Release

1. **Make commits following the format above** on feature branches
2. **Merge PRs to master** - the PR title should also follow conventional commits
3. **Release-please will automatically**:
   - Create a "Release PR" with updated CHANGELOG and version
   - When you merge that Release PR, it creates a GitHub release
   - The release triggers npm publish automatically

## Manual Release (if needed)

If you need to create a release for existing commits that don't follow the format:

1. Manually update `package.json` version
2. Manually update `CHANGELOG.md`
3. Manually update `.release-please-manifest.json` to match
4. Commit with: `git commit -m "chore: release v1.0.1"`
5. Push to master
6. Manually create GitHub release with tag matching version

## Fixing the Current Situation

Since your recent commits don't follow the format, release-please sees no releasable changes. You have two options:

### Option A: Create a manual release for current changes
```bash
# Update version in package.json to 1.0.1 (or whatever is next)
# Update .release-please-manifest.json to match
# Commit and push
git commit -m "chore: release v1.0.1"
git push origin master
# Then manually create GitHub release at https://github.com/PCritchfield/jellyfin-suggestion-mcp/releases/new
```

### Option B: Make a new proper conventional commit
```bash
# Make a small change or add something
git commit -m "fix: ensure non-interactive npm publish in CI"
git push origin master
# Release-please will now detect this and create a Release PR
```

## Pro Tips

1. **Use PR titles correctly**: When merging PRs, the PR title becomes the commit message, so make sure PR titles follow conventional commits format!

2. **Set up commitlint**: Your project has commitlint installed - make sure it's enforcing conventional commits

3. **Squash and merge**: When merging PRs, use "Squash and merge" and ensure the final commit message follows the format
