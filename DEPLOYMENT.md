# Deployment Configuration

## Important: Update After First Deploy

### 1. Update Backend URL in `frontend/vercel.json`

After deploying to Render, update line 4 with your actual backend URL:

```json
"destination": "https://YOUR-ACTUAL-BACKEND-URL.onrender.com/api/:path*"
```

### 2. Update CORS in Render Dashboard

After deploying to Vercel, add your frontend URL to `CORS_ALLOWED_ORIGINS`:
```
https://your-app.vercel.app
```

### 3. Update `VITE_API_URL` in Vercel

Set environment variable in Vercel dashboard:
```
VITE_API_URL=https://YOUR-ACTUAL-BACKEND-URL.onrender.com
```

## Deployment Order

1. **Database (Neon)** - Run SQL scripts
2. **Backend (Render)** - Deploy first, note the URL
3. **Update `frontend/vercel.json`** - Replace backend URL
4. **Frontend (Vercel)** - Deploy with correct backend URL
5. **Update CORS** - Add frontend URL to backend env vars

