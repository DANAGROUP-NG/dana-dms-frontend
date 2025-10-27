# Why Vercel Isn't Auto-Deploying on Git Push

## Possible Causes & Solutions

### 1. Vercel Not Connected to GitHub ❌

**Check this first:**
- Go to https://vercel.com/dashboard
- Click on your project
- Go to **Settings** → **Git**
- Verify a repository is connected

**Fix:**
- If no repository is connected:
  1. Click **Connect Git Repository**
  2. Install Vercel GitHub App (if prompted)
  3. Select your repository
  4. Choose the branch to deploy from (usually `main` or `master`)

### 2. Wrong Root Directory Setting

If your Root Directory is not set to `dana-dms-frontend`, Vercel can't find your project files.

**Check:**
- Settings → General → Root Directory should be: `dana-dms-frontend`

### 3. Production Branch Mismatch

Vercel only auto-deploys from the branch you specify.

**Check:**
- Settings → Git → Production Branch
- Should match your Git branch (usually `main` or `master`)

**Fix:**
- Make sure you're pushing to the correct branch
- Or configure Vercel to deploy from your branch

### 4. Vercel GitHub App Not Installed

**Check:**
- Go to https://github.com/settings/installations
- Look for "Vercel" app
- Make sure it has access to your repository

**Fix:**
1. Go to https://vercel.com/dashboard
2. Click your project
3. Go to Settings → Git
4. If you see "Install Vercel GitHub App", click it
5. Grant permissions to your repository

### 5. Branch Protection Rules

If your repository has branch protection, you might need to configure Vercel differently.

**Check your GitHub repository:**
- Settings → Branches
- See if there are protection rules requiring status checks

### 6. No Build Triggering

Vercel might be configured to not auto-deploy.

**Check:**
- Settings → Git → Deploy Hooks
- Make sure **Automatic deployments from Production Branch** is enabled

## Quick Fix Steps

### Option 1: Disconnect and Reconnect (Recommended)

1. Go to your Vercel project
2. Settings → Git
3. Click **Disconnect** from repository
4. Click **Connect Git Repository** again
5. Select your repository
6. When prompted:
   - **Framework Preset**: Vite
   - **Root Directory**: `dana-dms-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Option 2: Manual Trigger

If auto-deploy is still not working, trigger manually:

1. Go to Vercel Dashboard
2. Click on your project
3. Go to **Deployments** tab
4. Click **Redeploy** on the latest deployment
5. Or push an empty commit to trigger:

```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

### Option 3: Check Webhook in GitHub

Verify the webhook is set up:

1. Go to your GitHub repository
2. Settings → Webhooks
3. Look for a webhook pointing to Vercel (should be from `vercel.app`)
4. If missing, see "Reconnect Repository" above

## Testing Auto-Deploy

After fixing, test it:

1. Make a small change (add a comment to a file)
2. Commit and push:
   ```bash
   git add .
   git commit -m "Test auto-deploy"
   git push
   ```
3. Go to Vercel dashboard
4. You should see a new deployment starting automatically
5. Wait ~2-3 minutes
6. Check if the site updated

## Current Status

Check these in your Vercel project:

- [ ] Git repository is connected
- [ ] Root Directory is set to `dana-dms-frontend`
- [ ] Production Branch matches your Git branch
- [ ] Vercel GitHub App is installed with proper permissions
- [ ] Auto-deploy is enabled

## Most Common Issue

**99% of the time, the issue is:**

> **Repository isn't connected to Vercel, or Root Directory isn't set**

Make sure:
1. Vercel project → Settings → Git → Shows your repository name
2. Vercel project → Settings → General → Root Directory = `dana-dms-frontend`

## Still Not Working?

1. Go to Vercel Dashboard
2. Click on your project
3. Click **Settings** → **Logs**
4. Check for any errors or warnings
5. Take a screenshot and share the error message

