# Quick Fix for Your Vercel Deployment

## The Issue
Your frontend is in the `dana-dms-frontend` subdirectory, but Vercel is looking at the root of your repository.

## The Solution (3 Steps)

### Step 1: Configure Root Directory in Vercel Dashboard

This is CRITICAL - you must do this first:

1. Go to https://vercel.com/dashboard
2. Click on your project (dana-dms-frontend)
3. Go to **Settings** tab
4. Scroll to **Build & Development Settings**
5. Find **Root Directory** section
6. Click **Edit**
7. Enter: `dana-dms-frontend`
8. Click **Save**

This tells Vercel where your frontend code lives!

### Step 2: Update Backend URL in vercel.json

Open `vercel.json` and replace line 5:

```json
"destination": "https://your-backend-url.vercel.app/api/$1"
```

Replace `your-backend-url.vercel.app` with your actual backend URL.

For example, if your backend is deployed at `https://dana-dms-api.vercel.app`, change it to:
```json
"destination": "https://dana-dms-api.vercel.app/api/$1"
```

### Step 3: Commit and Push

```bash
git add vercel.json
git commit -m "Add Vercel configuration"
git push
```

Vercel will automatically redeploy after you push.

## That's It!

After doing these three steps, your site should work at: https://dana-dms-frontend.vercel.app

## Still Not Working?

1. **Check Build Logs**: Go to your Vercel project → Deployments → Click on the latest deployment → View Function Logs
2. **Verify vercel.json exists**: In your repo, `dana-dms-frontend/vercel.json` should exist
3. **Check console**: Open your deployed site, press F12, check for errors in the console

## Common Mistake

❌ **Wrong**: Importing the entire repository without setting root directory
✅ **Right**: Set Root Directory to `dana-dms-frontend` in Vercel settings

## Testing Locally First

Before deploying, make sure build works:

```bash
cd dana-dms-frontend
npm run build
npm run preview
```

Visit http://localhost:4173 and verify routing works. If it works locally, it will work on Vercel (with proper configuration).

