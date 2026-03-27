# 🚀 Deployment Guide

This guide will help you deploy your Smart POS application to production.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure:

- ✅ All features work locally
- ✅ Environment variables are configured
- ✅ MongoDB connection is set up
- ✅ JWT secret is strong and random
- ✅ CORS settings allow your frontend domain
- ✅ Build process completes without errors

---

## 🌐 Option 1: Deploy to Render (Recommended - Free Tier Available)

### Backend Deployment

1. **Create a Render account** at https://render.com

2. **Create a new Web Service**
   - Connect your GitHub repository
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `npm start`

3. **Add Environment Variables**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-pos
   JWT_SECRET=your-super-secret-random-key
   NODE_ENV=production
   PORT=5000
   ```

4. **Get your backend URL** (e.g., `https://smart-pos-backend.onrender.com`)

### Frontend Deployment

1. **Create another Web Service** for frontend
   - Root directory: `frontend`
   - Build command: `npm install && npm run build`
   - Start command: `npx serve -s build`

2. **Add Environment Variable**
   ```
   REACT_APP_API_URL=https://smart-pos-backend.onrender.com/api
   ```

3. **Deploy!** Your app will be live at `https://smart-pos.onrender.com`

---

## 🔵 Option 2: Deploy to Railway

### Backend Deployment

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Deploy Backend**
   ```bash
   cd backend
   railway init
   railway up
   ```

3. **Add Environment Variables**
   ```bash
   railway variables set MONGODB_URI=mongodb+srv://...
   railway variables set JWT_SECRET=your-secret-key
   railway variables set NODE_ENV=production
   ```

4. **Get deployment URL**
   ```bash
   railway domain
   ```

### Frontend Deployment

1. **Deploy Frontend**
   ```bash
   cd frontend
   railway init
   railway up
   ```

2. **Set API URL**
   ```bash
   railway variables set REACT_APP_API_URL=https://your-backend-url.railway.app/api
   ```

---

## 🟣 Option 3: Deploy Backend to Heroku, Frontend to Vercel

### Backend to Heroku

1. **Install Heroku CLI** from https://devcenter.heroku.com/articles/heroku-cli

2. **Create and deploy**
   ```bash
   cd backend
   heroku login
   heroku create smart-pos-backend
   
   # Add MongoDB addon
   heroku addons:create mongolab:sandbox
   
   # Set environment variables
   heroku config:set JWT_SECRET=your-secret-key
   heroku config:set NODE_ENV=production
   
   # Deploy
   git init
   git add .
   git commit -m "Initial commit"
   heroku git:remote -a smart-pos-backend
   git push heroku main
   ```

### Frontend to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd frontend
   
   # Add .env.production
   echo "REACT_APP_API_URL=https://smart-pos-backend.herokuapp.com/api" > .env.production
   
   # Deploy
   vercel --prod
   ```

---

## 🗄️ MongoDB Atlas Setup (Free Database)

1. **Create account** at https://www.mongodb.com/cloud/atlas

2. **Create a cluster** (Free tier - M0)

3. **Create database user**
   - Database Access → Add New User
   - Username: `smartpos`
   - Password: Generate secure password

4. **Whitelist IP addresses**
   - Network Access → Add IP Address
   - Allow access from anywhere: `0.0.0.0/0` (for development)
   - Or add specific IPs for production

5. **Get connection string**
   - Clusters → Connect → Connect your application
   - Copy connection string:
   ```
   mongodb+srv://smartpos:<password>@cluster0.xxxxx.mongodb.net/smart-pos?retryWrites=true&w=majority
   ```

6. **Replace `<password>` with your database user password**

---

## 🔒 Production Security Checklist

### Backend

- [ ] Use strong JWT secret (min 32 characters)
- [ ] Enable HTTPS only
- [ ] Set proper CORS origins (not `*`)
- [ ] Add rate limiting
- [ ] Enable helmet for security headers
- [ ] Validate all inputs
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB authentication
- [ ] Set up proper error logging

### Frontend

- [ ] Remove console.logs
- [ ] Enable production build optimizations
- [ ] Set proper API URL
- [ ] Add Google Analytics (optional)
- [ ] Test on multiple browsers
- [ ] Optimize images
- [ ] Add error boundaries

---

## 📊 Monitoring & Logging

### Recommended Tools

**Backend Monitoring:**
- Sentry (Error tracking)
- LogRocket (Session replay)
- New Relic (Performance monitoring)

**Database Monitoring:**
- MongoDB Atlas built-in monitoring
- DataDog

**Uptime Monitoring:**
- UptimeRobot (Free)
- Pingdom

---

## 🔧 Production Environment Variables

### Backend `.env.production`
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/smart-pos
JWT_SECRET=super-secret-jwt-key-min-32-chars-random
CORS_ORIGIN=https://your-frontend-domain.com
```

### Frontend `.env.production`
```env
REACT_APP_API_URL=https://your-backend-domain.com/api
```

---

## 🔄 CI/CD Setup (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        run: |
          # Add your deployment commands here
          
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: |
          # Add your deployment commands here
```

---

## 📱 Custom Domain Setup

### Render
1. Go to Settings → Custom Domains
2. Add your domain (e.g., `api.yourstore.com`)
3. Update DNS records with provided values

### Vercel
1. Project Settings → Domains
2. Add your domain (e.g., `yourstore.com`)
3. Follow DNS configuration instructions

---

## 🐛 Troubleshooting Deployment

### Common Issues

**Issue: MongoDB connection timeout**
```
Solution: Check IP whitelist in MongoDB Atlas
```

**Issue: CORS errors in production**
```
Solution: Update CORS_ORIGIN in backend .env
```

**Issue: Build fails with memory error**
```
Solution: Increase Node memory limit
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

**Issue: Environment variables not loading**
```
Solution: Ensure .env files are not in .gitignore for deployment platforms
Or set them in platform's dashboard
```

---

## 📈 Performance Optimization

### Backend
- Enable gzip compression
- Use connection pooling for MongoDB
- Add Redis for caching (optional)
- Optimize database queries
- Add indexes to frequently queried fields

### Frontend
- Enable code splitting
- Lazy load routes
- Optimize images (WebP format)
- Use CDN for static assets
- Enable service workers for PWA

---

## 🔐 SSL Certificate

Most hosting platforms provide free SSL certificates automatically:
- ✅ Render: Automatic
- ✅ Vercel: Automatic
- ✅ Railway: Automatic
- ✅ Heroku: Automatic (with custom domain)

---

## 📞 Support

For deployment issues:
1. Check platform documentation
2. Review error logs in platform dashboard
3. Test locally with production environment variables
4. Contact platform support

---

**Good luck with your deployment! 🚀**
