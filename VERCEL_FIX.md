# Fixing Vercel Deployment Issues

## The Problem
You're seeing 404 or routing issues because Vercel needs to be configured properly for a monorepo setup.

## Solution

### Step 1: Configure Root Directory in Vercel

**IMPORTANT**: Since your frontend is in a subdirectory (`dana-dms-frontend`), you MUST configure this in Vercel:

1. Go to your Vercel project dashboard
2. Click on **Settings**
3. Scroll down to **Root Directory**
4. Click **Edit** and set it to: `dana-dms-frontend`
5. Click **Save**

### Step 2: Update Backend URL

Edit `vercel.json` and replace the backend URL:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-actual-backend-url.vercel.app/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Replace `your-actual-backend-url.vercel.app` with your real backend URL**

### Step 3: Commit and Redeploy

```bash
cd dana-dms-frontend

# Commit the vercel.json
git add vercel.json
git commit -m "Configure Vercel for SPA routing"
git push

# Or manually trigger redeploy in Vercel dashboard
```

### Step 4: Verify Deployment Settings

In your Vercel project settings, verify:
- **Framework Preset**: Vite
- **Build Command**: `npm run build` (or leave empty for auto-detect)
- **Output Directory**: `dist`
- **Root Directory**: `dana-dms-frontend`
- **Install Command**: `npm install`

## Alternative: Deploy Only the Frontend Directory

If configuring root directory doesn't work, you can:

1. Create a separate repository with just the frontend code
2. OR use Vercel's monorepo configuration
3. OR connect your Git repository and specify `dana-dms-frontend` as the root during import

## Verification

After deploying, check:
1. ✅ Homepage loads (https://your-app.vercel.app/)
2. ✅ Navigation works (click on Documents, Folders, etc.)
3. ✅ No 404 errors
4. ✅ Browser console shows no errors

## Common Issues

### Still seeing 404?
- ✅ Make sure Root Directory is set to `dana-dms-frontend` in Vercel
- ✅ Verify `vercel.json` exists and is committed
- ✅ Check build logs in Vercel dashboard

### Build failing?
- Check that all dependencies are in `package.json`
- Verify `npm run build` works locally

### Routing not working?
- Verify `vercel.json` has the SPA rewrite rule
- Check browser console for errors
- Ensure React Router is properly initialized

## Quick Test Locally

Before deploying, test the build locally:

```bash
cd dana-dms-frontend
npm run build
npm run preview
```

Visit `http://localhost:4173` and test navigation. If it works locally, it should work on Vercel (assuming correct configuration).

