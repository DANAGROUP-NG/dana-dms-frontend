# Quick Vercel Setup Guide

## What's Been Done ✅

1. **Created `vercel.json`** - Configuration file for Vercel deployment
2. **Created `DEPLOYMENT.md`** - Detailed deployment documentation

## What You Need to Do Next 🚀

### Step 1: Update Backend URL

Open `vercel.json` and replace line 10:

```json
"destination": "https://your-backend-url.vercel.app/api/:path*"
```

Replace `your-backend-url.vercel.app` with your actual backend URL.

**Example:**
- If your backend is at `https://dana-dms-api.vercel.app`, change it to:
  ```json
  "destination": "https://dana-dms-api.vercel.app/api/:path*"
  ```
- If your backend is at `https://api.example.com`, change it to:
  ```json
  "destination": "https://api.example.com/api/:path*"
  ```

### Step 2: Commit and Push

```bash
git add vercel.json
git commit -m "Add Vercel configuration"
git push
```

### Step 3: Deploy to Vercel

#### Option A: Using Vercel Dashboard (Easiest)
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your repository
4. Vercel will automatically detect the configuration
5. Click "Deploy"

#### Option B: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd dana-dms-frontend
vercel

# For production
vercel --prod
```

## How It Works 🔧

The `vercel.json` configuration:
- ✅ Routes all pages to `index.html` (for React Router client-side routing)
- ✅ Proxies `/api/*` requests to your backend
- ✅ Caches static assets for optimal performance
- ✅ Configures proper build settings for Vite

## Testing After Deployment

1. Visit your Vercel URL (e.g., `https://dana-dms-frontend.vercel.app`)
2. You should see your app instead of the 404 error
3. Test navigation between pages
4. Verify API calls are working by checking the network tab

## Troubleshooting

### Still seeing 404?
- Make sure you updated the backend URL in `vercel.json`
- Redeploy after making changes to `vercel.json`

### API not working?
- Verify your backend URL is correct
- Check if backend is accessible
- Verify CORS settings on backend allow requests from your Vercel domain

## Need Help?

See `DEPLOYMENT.md` for detailed documentation.

