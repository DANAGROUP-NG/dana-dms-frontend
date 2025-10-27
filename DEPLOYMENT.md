# Vercel Deployment Guide

## Overview
This guide will help you deploy your Dana DMS frontend application to Vercel.

## Prerequisites
- A Vercel account (sign up at https://vercel.com)
- Your backend API deployed and accessible
- Git repository pushed to GitHub/GitLab/Bitbucket

## Deployment Steps

### 1. Configure Backend URL

Edit `vercel.json` and replace the backend URL in the API rewrite:

```json
{
  "source": "/api/:path*",
  "destination": "https://your-backend-api-url.com/api/:path*"
}
```

**Replace `your-backend-api-url.com` with your actual backend URL.**

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd dana-dms-frontend
vercel

# For production deployment
vercel --prod
```

#### Option B: Using GitHub Integration
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your Git repository
4. Configure:
   - Framework Preset: **Vite**
   - Root Directory: `dana-dms-frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Click Deploy

### 3. Environment Variables (Optional)

If you need to configure environment variables for your backend URL, add them in Vercel:

1. Go to your project in Vercel dashboard
2. Navigate to Settings → Environment Variables
3. Add:
   - `VITE_API_URL` (if you want to override the default `/api`)

### 4. Configure Custom Domain (Optional)

1. Go to your project in Vercel dashboard
2. Navigate to Settings → Domains
3. Add your custom domain
4. Follow the DNS configuration instructions

## Troubleshooting

### 404 Errors
If you're seeing 404 errors after deployment:
- ✅ Verify `vercel.json` exists in the `dana-dms-frontend` directory
- ✅ Check that the backend URL is correct in `vercel.json`
- ✅ Ensure you've run `npm run build` successfully locally

### API Not Working
If API calls aren't working:
- Verify the backend URL in `vercel.json`
- Check if your backend is deployed and accessible
- Ensure CORS is configured on your backend for the Vercel domain

### Build Errors
- Check that all dependencies are listed in `package.json`
- Run `npm install` and `npm run build` locally to verify

## Architecture

```
┌─────────────────────────┐
│   Vercel (Frontend)     │
│   dana-dms-frontend     │
│                         │
│  Routes:                │
│  / → index.html         │
│  /api/* → Backend API   │
└─────────────────────────┘
           │
           │ proxy
           ▼
┌─────────────────────────┐
│   Your Backend API      │
│   NestJS + Prisma       │
└─────────────────────────┘
```

## Next Steps

1. Update `vercel.json` with your backend URL
2. Deploy using one of the methods above
3. Test your deployed application
4. Configure environment variables if needed
5. Set up a custom domain (optional)

## Support

If you encounter issues:
- Check Vercel logs in the dashboard
- Review the `vercel.json` configuration
- Ensure backend API is accessible
- Verify CORS settings on backend

