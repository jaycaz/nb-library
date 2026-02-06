# GitHub Actions Preview Setup

This repository uses GitHub Actions to automatically deploy PR previews to Netlify for easy testing on mobile devices.

## How It Works

When you open a PR that changes `web-app/` or `data.csv`:
1. GitHub Actions automatically builds the web app
2. Deploys it to Netlify as a preview
3. Posts a comment on the PR with the preview URL
4. You can open the URL on your phone to test immediately

## One-Time Setup Required

You need to configure Netlify secrets in your GitHub repository:

### Step 1: Create a Netlify Site

1. Go to [netlify.com](https://netlify.com) and sign in (or create free account)
2. Click "Add new site" → "Import an existing project"
3. Choose any deployment method (we'll use GitHub Actions, not their auto-deploy)
4. Note your **Site ID** from Settings → General → Site details → Site ID
5. Note your **Site name** (the part before `.netlify.app` in your URL)

### Step 2: Get Netlify Auth Token

1. In Netlify, go to User settings → Applications → Personal access tokens
2. Click "New access token"
3. Give it a name like "GitHub Actions"
4. Copy the token (save it somewhere safe, you'll only see it once)

### Step 3: Add Secrets to GitHub

1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Click "New repository secret" and add these three secrets:

   - **Name:** `NETLIFY_AUTH_TOKEN`
     **Value:** [paste your personal access token]

   - **Name:** `NETLIFY_SITE_ID`
     **Value:** [paste your site ID]

   - **Name:** `NETLIFY_SITE_NAME`
     **Value:** [your site name, e.g., "noisebridge-library"]

### Step 4: Test It!

1. Create a test PR (change something in `web-app/`)
2. GitHub Actions will run automatically
3. Check the PR comments for your preview URL
4. Open it on your phone and test!

## Preview URLs

Each PR gets its own unique URL:
```
https://pr-[NUMBER]--[YOUR-SITE-NAME].netlify.app
```

For example, PR #7 might be:
```
https://pr-7--noisebridge-library.netlify.app
```

## Troubleshooting

**Q: The workflow failed with "Missing Netlify secrets"**
A: Make sure you've added all three secrets (NETLIFY_AUTH_TOKEN, NETLIFY_SITE_ID, NETLIFY_SITE_NAME) to GitHub

**Q: Can I test locally first?**
A: Yes! Run `cd web-app && npm run build && npm run preview` to test the production build locally

**Q: Does this cost money?**
A: No! Netlify's free tier includes PR previews for open source projects

**Q: What about the main branch?**
A: This workflow only runs on PRs. You can set up a separate workflow for main branch deploys if needed
