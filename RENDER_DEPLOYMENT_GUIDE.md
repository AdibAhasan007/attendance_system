# Render Deployment Guide for Attendance System

## Step 1: Prepare Your Project

1. Push your code to GitHub (Render requires a GitHub repository)
2. Ensure all files are committed

## Step 2: Deploy Backend (FastAPI)

### 2.1 Create a PostgreSQL Database on Render
1. Go to https://dashboard.render.com
2. Click "New +" → "PostgreSQL"
3. Fill in details:
   - Name: `attendance-db`
   - Region: Select your region
4. Create the database
5. Copy the **Internal Database URL** (you'll need this)

### 2.2 Deploy Backend Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Fill in deployment details:
   - Name: `attendance-backend`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Plan: Free (or paid for production)
4. Add Environment Variables:
   - `DATABASE_URL`: Paste the PostgreSQL URL from Step 2.1
   - `SECRET_KEY`: Generate a strong random key (e.g., using `python -c "import secrets; print(secrets.token_urlsafe(32))"`)
   - `ZK_API_KEY`: Leave empty (or add if using IoT hardware)
5. Click "Create Web Service"
6. Wait for deployment (~5-10 minutes)
7. Copy your backend URL (e.g., `https://attendance-backend.onrender.com`)

### 2.3 Update Backend CORS Settings
Once your frontend URL is ready, update the CORS origins in [app/main.py](backend/app/main.py):

```python
origins = [
    "http://localhost:5173",  # Local dev
    "http://localhost:3000",  # Local dev
    "https://your-frontend-domain.onrender.com"  # Your deployed frontend
]
```

## Step 3: Deploy Frontend (React + Vite)

### 3.1 Deploy Frontend Static Site
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Fill in deployment details:
   - Name: `attendance-frontend`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: Leave empty (static site)
   - Plan: Free (or paid for production)
4. Add Environment Variables:
   - `VITE_API_URL`: Your backend URL (e.g., `https://attendance-backend.onrender.com`)
5. Click "Create Web Service"
6. Wait for deployment (~3-5 minutes)
7. Your frontend will be available at `https://attendance-frontend.onrender.com`

### 3.2 Update Frontend API Configuration
Ensure your [frontend/src/services/api.js](frontend/src/services/api.js) uses:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

## Step 4: Test Your Deployment

1. Visit your frontend: `https://attendance-frontend.onrender.com`
2. Try logging in
3. Check browser console for any errors
4. Verify API calls reach your backend

## Step 5: Important Notes for Production

### Database Backups
- Render PostgreSQL Free tier has limited backup options
- Consider upgrading for production

### SSL/HTTPS
- Render automatically provides SSL certificates

### Rate Limiting
- Free tier has limited resources
- Consider upgrading for production usage

### Environment Variables
- Never commit `.env` files with real credentials
- Always set variables in Render Dashboard

## Troubleshooting

### Backend not starting?
1. Check logs in Render Dashboard
2. Verify `DATABASE_URL` is correctly set
3. Ensure `SECRET_KEY` is set

### Frontend showing blank page?
1. Check browser console for errors
2. Verify `VITE_API_URL` is correctly set
3. Check CORS settings in backend

### CORS errors?
1. Update origins in [app/main.py](backend/app/main.py)
2. Restart backend service after changes

### Database connection issues?
1. Verify `DATABASE_URL` format
2. Check if PostgreSQL service is running
3. Ensure database credentials are correct

## Updating Your Deployment

Simply push new changes to your GitHub repository. Render automatically rebuilds and redeploys:
1. Backend: When Python files or requirements.txt change
2. Frontend: When JavaScript/CSS or package.json change

---

**Need Help?** Check Render documentation: https://render.com/docs
