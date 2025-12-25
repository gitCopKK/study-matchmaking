# Study Match Deployment Guide

This guide walks you through deploying Study Match to production using free-tier services.

## Architecture

```
                    ┌─────────────────────┐
                    │   Cloudflare Pages  │
                    │     (Frontend)      │
                    │        FREE         │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       Render        │
                    │     (Backend)       │
                    │        FREE         │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
    ┌─────────────────┐ ┌─────────────┐ ┌─────────────┐
    │      Neon       │ │   Google    │ │    Groq     │
    │   PostgreSQL    │ │   OAuth     │ │     AI      │
    │      FREE       │ │    FREE     │ │    FREE     │
    └─────────────────┘ └─────────────┘ └─────────────┘
```

## Cost Summary

| Users | Monthly Cost | Notes |
|-------|--------------|-------|
| 5-10 | $0 | Cold starts after 15min inactivity |
| 10-50 | $0 | Same as above |
| 50-100 | $7 | Upgrade Render to Starter (no cold starts) |
| 100-300 | $44 | + Upgrade Neon to Launch ($19) |
| 300+ | $179+ | Scale all services |

---

## Step 1: Set Up Neon PostgreSQL Database

1. Go to [neon.tech](https://neon.tech) and sign up (free)

2. Click "Create a project"
   - Name: `studymatch`
   - Region: Choose closest to your users

3. Copy the connection string from the dashboard
   - Use the **Pooled connection** string for better performance
   - Format: `postgresql://user:password@host.neon.tech/studymatch?sslmode=require`

4. Save these values for later:
   ```
   DATABASE_URL=postgresql://[user]:[password]@[host].neon.tech/studymatch?sslmode=require
   DATABASE_USERNAME=[user]
   DATABASE_PASSWORD=[password]
   ```

---

## Step 2: Set Up Google OAuth (Optional but Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com)

2. Create a new project (or select existing)
   - Name: `StudyMatch`

3. Navigate to **APIs & Services > OAuth consent screen**
   - User Type: External
   - App name: Study Match
   - Support email: Your email
   - Developer contact: Your email
   - Click "Save and Continue" through all steps

4. Navigate to **APIs & Services > Credentials**

5. Click **Create Credentials > OAuth 2.0 Client ID**
   - Application type: Web application
   - Name: Study Match
   - Authorized JavaScript origins: (leave empty for now)
   - Authorized redirect URIs:
     - `http://localhost:8080/login/oauth2/code/google` (for local testing)
     - `https://YOUR-BACKEND.onrender.com/login/oauth2/code/google` (add after deploying backend)

6. Save the credentials:
   ```
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

---

## Step 3: Get Groq API Key (Optional - for AI Matching)

1. Go to [console.groq.com](https://console.groq.com)

2. Sign up or log in

3. Navigate to API Keys

4. Create a new API key

5. Save the key:
   ```
   GROQ_API_KEY=gsk_your_key_here
   ```

Free tier includes 14,400 requests/day - plenty for 100+ active users.

---

## Step 4: Deploy Backend to Render

1. Push your code to GitHub (if not already)

2. Go to [render.com](https://render.com) and sign up

3. Click **New > Web Service**

4. Connect your GitHub repository

5. Configure the service:
   - **Name**: `studymatch-backend`
   - **Region**: Choose closest to your Neon database
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Runtime**: Docker (or Java if available)
   - **Build Command**: 
     ```
     cd backend && ./mvnw clean package -DskipTests
     ```
   - **Start Command**: 
     ```
     java -jar backend/target/studymatch-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
     ```
   - **Instance Type**: Free

6. Add Environment Variables (click "Advanced" > "Add Environment Variable"):
   
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | `jdbc:postgresql://your-host.neon.tech:5432/studymatch?sslmode=require` |
   | `DATABASE_USERNAME` | Your Neon username |
   | `DATABASE_PASSWORD` | Your Neon password |
   | `JWT_SECRET` | Generate with: `openssl rand -base64 32` |
   | `CORS_ORIGINS` | `https://studymatch.pages.dev` (update after frontend deploy) |
   | `GOOGLE_CLIENT_ID` | Your Google Client ID (optional) |
   | `GOOGLE_CLIENT_SECRET` | Your Google Client Secret (optional) |
   | `GROQ_API_KEY` | Your Groq API key (optional) |

7. Click **Create Web Service**

8. Wait for deployment (5-10 minutes for first build)

9. Note your backend URL: `https://studymatch-backend.onrender.com`

---

## Step 5: Deploy Frontend to Cloudflare Pages

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com) and sign up

2. Click **Create a project > Connect to Git**

3. Select your GitHub repository

4. Configure the build:
   - **Project name**: `studymatch`
   - **Production branch**: `main`
   - **Framework preset**: Vite
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Build output directory**: `frontend/dist`

5. Add Environment Variable:
   - Click **Environment variables**
   - Add: `VITE_API_URL` = `https://studymatch-backend.onrender.com` (your Render URL)

6. Click **Save and Deploy**

7. Wait for deployment (2-3 minutes)

8. Your frontend URL: `https://studymatch.pages.dev` (or custom domain)

---

## Step 6: Update Configuration

After both deployments are complete:

### Update Render CORS
1. Go to your Render dashboard
2. Select your backend service
3. Go to Environment
4. Update `CORS_ORIGINS` to your actual Cloudflare URL
5. Click "Save Changes" (triggers redeploy)

### Update Google OAuth Redirect
1. Go to Google Cloud Console > Credentials
2. Edit your OAuth client
3. Add to Authorized redirect URIs:
   - `https://studymatch-backend.onrender.com/login/oauth2/code/google`
4. Save

---

## Step 7: Initialize Database

On first deployment, Hibernate will create the tables automatically (`ddl-auto: validate` in prod profile expects tables to exist).

**Option A: Let Hibernate Create Tables (First Time Only)**

Temporarily change in Render environment:
1. Add: `SPRING_JPA_HIBERNATE_DDL_AUTO=update`
2. Wait for redeploy
3. Remove the variable after tables are created

**Option B: Run Schema Manually**

Connect to Neon and run the schema. Tables will be auto-created by Spring Boot on first run.

---

## Testing Your Deployment

1. **Test Frontend**: Visit `https://studymatch.pages.dev`
   - Page should load without errors

2. **Test Backend Health**: Visit `https://studymatch-backend.onrender.com/api/profiles/options`
   - Should return JSON (after cold start of ~30 seconds)

3. **Test Registration**: Create a new account
   - Should work end-to-end

4. **Test Google OAuth**: Click "Sign in with Google"
   - Should redirect and authenticate

5. **Test Chat**: Create two accounts and test messaging
   - WebSocket should connect and messages should appear in real-time

---

## Troubleshooting

### Backend won't start
- Check Render logs for errors
- Verify DATABASE_URL is correct (use JDBC format: `jdbc:postgresql://...`)
- Ensure JWT_SECRET is at least 32 characters

### CORS errors
- Update CORS_ORIGINS in Render to match your frontend URL exactly
- Don't include trailing slash

### OAuth not working
- Verify redirect URI in Google Console matches your backend URL exactly
- Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set

### Cold starts too slow
- Upgrade to Render Starter ($7/month) for always-on service
- Or set up a free cron job to ping your backend every 10 minutes (UptimeRobot)

### Database connection issues
- Use the **pooled** connection string from Neon
- Ensure sslmode=require is in the URL

---

## Optional: Custom Domain

### Frontend (Cloudflare)
1. Go to Pages > Your project > Custom domains
2. Add your domain
3. Follow DNS instructions

### Backend (Render)
1. Go to your service > Settings > Custom Domains
2. Add your domain
3. Follow DNS instructions

---

## Monitoring (Free)

Set up [UptimeRobot](https://uptimerobot.com) (free tier):
1. Create monitors for:
   - Frontend: `https://studymatch.pages.dev`
   - Backend: `https://studymatch-backend.onrender.com/api/profiles/options`
2. Set 5-minute intervals
3. This also helps prevent cold starts!

---

## Security Checklist

- [ ] JWT_SECRET is unique and at least 32 characters
- [ ] DATABASE_PASSWORD is strong and unique
- [ ] GOOGLE_CLIENT_SECRET is not exposed in frontend
- [ ] CORS_ORIGINS only includes your frontend domain
- [ ] No secrets in Git repository

