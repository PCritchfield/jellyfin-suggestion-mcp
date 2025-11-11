# Release Pipeline Setup Guide

## Problem
Your release pipeline was failing because GitHub branch protection rules block direct pushes to `master`, even from CI/CD workflows using the default `GITHUB_TOKEN`.

## Solution
Configure semantic-release to work with branch protection by using a Personal Access Token (PAT) or GitHub App that can bypass branch protection rules.

---

## Setup Instructions

### Step 1: Create a Personal Access Token (PAT)

1. Go to GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens**
2. Click **Generate new token**
3. Configure the token:
   - **Token name:** `semantic-release-bot`
   - **Expiration:** Choose an appropriate expiration (90 days or 1 year recommended)
   - **Repository access:** Only select `jellyfin-suggestion-mcp`
   - **Repository permissions:**
     - **Contents:** Read and write
     - **Pull requests:** Read and write
     - **Metadata:** Read-only (automatically selected)
     - **Workflows:** Read and write (if you want semantic-release to trigger workflows)
4. Click **Generate token**
5. **IMPORTANT:** Copy the token immediately (you won't be able to see it again)

### Step 2: Add the PAT to Repository Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Configure the secret:
   - **Name:** `GH_PAT`
   - **Value:** Paste the token you copied in Step 1
5. Click **Add secret**

### Step 3: Import Branch Protection Ruleset

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Rules** → **Rulesets**
3. Click **New ruleset** → **Import a ruleset**
4. Upload the `branchprotection.json` file from this repository
5. Review the settings:
   - **Bypass actors:** Admin users can bypass (actor_id: 5)
   - **Required status checks:** Adjust to match your actual CI job names
   - **Pull request requirements:** At least 1 approval required
6. Click **Create** to apply the ruleset

### Step 4: Grant PAT Bypass Permissions

After importing the ruleset, you need to add your PAT/bot as a bypass actor:

1. In **Settings** → **Rules** → **Rulesets**, click on "Protect master branch"
2. Scroll to **Bypass list**
3. Click **Add bypass**
4. Select **Repository admin** or the specific user/app that owns the PAT
5. Set **Bypass mode** to **Always**
6. Click **Save changes**

**Important:** The PAT must be owned by a user with admin permissions on the repository to bypass branch protection.

---

## Alternative: Use a GitHub App (Recommended for Organizations)

Instead of a PAT, you can create a GitHub App for better security and auditing:

1. Go to GitHub → **Settings** → **Developer settings** → **GitHub Apps**
2. Click **New GitHub App**
3. Configure the app:
   - **Name:** `semantic-release-bot`
   - **Permissions:**
     - Contents: Read and write
     - Pull requests: Read and write
     - Metadata: Read-only
4. Install the app on your repository
5. Generate a private key and add it to repository secrets
6. Update the workflow to authenticate using the GitHub App

For GitHub App authentication, you'll need to use an action like `tibdex/github-app-token@v2` in your workflow.

---

## Updated Configuration Summary

### `.releaserc.json`
- Removed the incorrect `@saithodev/semantic-release-backmerge` plugin
- Reverted to standard `@semantic-release/git` and `@semantic-release/github` plugins
- These plugins will now push directly to `master` using the PAT

### `.github/workflows/release.yml`
- Updated `checkout` action to use `GH_PAT` if available, fallback to `GITHUB_TOKEN`
- Updated `semantic-release` step to use `GH_PAT` if available, fallback to `GITHUB_TOKEN`

### `branchprotection.json`
- Configured to require PRs with at least 1 approval
- Requires status checks to pass (build, test, CodeQL)
- Allows admin users to bypass for automated releases
- Prevents force pushes and branch deletion

---

## Testing the Release Pipeline

After completing the setup:

1. Create a commit on `master` with a conventional commit message:
   ```bash
   git commit -m "feat: add new feature"
   ```
2. Push to `master` (or merge a PR)
3. The release workflow should:
   - Run tests and build
   - Create a new version with semantic-release
   - Update CHANGELOG.md and package.json
   - Push the changes back to `master` (bypassing branch protection)
   - Create a GitHub release
   - Publish to npm

---

## Troubleshooting

### Error: "push declined due to repository rule violations"
- Ensure the `GH_PAT` secret is set correctly
- Verify the PAT has admin permissions on the repository
- Check that the PAT is added to the bypass list in branch protection rules

### Error: "Resource not accessible by integration"
- The default `GITHUB_TOKEN` doesn't have sufficient permissions
- You must use a PAT or GitHub App with bypass permissions

### Workflow doesn't trigger
- Check that your commit message doesn't contain `[skip ci]`
- Verify the workflow is enabled in **Actions** settings
- Ensure you're pushing to the `master` branch

---

## Security Considerations

- **PAT Expiration:** Set a reasonable expiration and rotate regularly
- **Least Privilege:** Only grant the minimum permissions needed
- **Audit Logs:** Review GitHub audit logs periodically
- **GitHub App Preferred:** Use a GitHub App instead of a PAT for better security and auditing in production environments
