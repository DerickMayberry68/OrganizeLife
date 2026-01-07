# HomeSynchronicity - Deployment Guide 🚀

## 📋 Prerequisites

Before deploying, ensure you have:
- [x] GitHub account with repository access
- [x] Supabase account with database configured
- [x] Deployment platform accounts (see options below)

## 🎯 Recommended Deployment Stack

### **Option 1: Vercel + Railway (Recommended)**

**Frontend:** Vercel (FREE)  
**Backend:** Railway (~$5/month)  
**Database:** Supabase (FREE tier)

**Total Cost:** ~$5/month

---

## 🌐 Frontend Deployment (Vercel)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy
```bash
cd frontend
vercel
```

### Step 4: Configure Environment
In Vercel Dashboard:
1. Go to your project settings
2. Add Environment Variable:
   - `API_URL` = Your Railway API URL (e.g., `https://your-api.railway.app/api`)

### Step 5: Redeploy
```bash
vercel --prod
```

**Your frontend will be live at:** `https://organizelife-xxx.vercel.app`

---

## 🔧 Backend Deployment (Railway)

### Step 1: Install Railway CLI
```bash
# Windows (PowerShell)
iwr https://railway.app/install.ps1 | iex

# Or use npm
npm install -g @railway/cli
```

### Step 2: Login to Railway
```bash
railway login
```

### Step 3: Create Dockerfile

Create `backend/Dockerfile`:
```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copy solution and project files
COPY src/HomeSynchronicity.Api/*.csproj ./src/HomeSynchronicity.Api/
COPY src/HomeSynchronicity.Core/*.csproj ./src/HomeSynchronicity.Core/
COPY src/HomeSynchronicity.Infrastructure/*.csproj ./src/HomeSynchronicity.Infrastructure/
COPY HomeSynchronicityApi.sln ./

# Restore dependencies
RUN dotnet restore

# Copy everything else
COPY . ./

# Build
RUN dotnet publish src/HomeSynchronicity.Api/HomeSynchronicity.Api.csproj -c Release -o out

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/out .

EXPOSE 8080
ENTRYPOINT ["dotnet", "HomeSynchronicity.Api.dll"]
```

### Step 4: Initialize Railway Project
```bash
cd backend
railway init
```

### Step 5: Add Environment Variables in Railway Dashboard

1. Go to your Railway project
2. Navigate to Variables tab
3. Add these variables:
   ```
   ConnectionStrings__DefaultConnection=YOUR_SUPABASE_CONNECTION_STRING
   Supabase__Url=https://YOUR_PROJECT.supabase.co
   Supabase__AnonKey=YOUR_SUPABASE_ANON_KEY
   Supabase__JwtSecret=YOUR_SUPABASE_JWT_SECRET
   ASPNETCORE_URLS=http://0.0.0.0:8080
   ```

### Step 6: Deploy
```bash
railway up
```

**Your API will be live at:** `https://your-project.railway.app`

### Step 7: Update CORS in Program.cs

Update your `Program.cs` to include your Vercel domain:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins(
            "http://localhost:4200", 
            "https://localhost:4200",
            "https://organizelife-xxx.vercel.app"  // Add your Vercel URL
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});
```

---

## 🔐 Security Checklist

Before going live:

- [ ] Update CORS to only allow your frontend domain
- [ ] Verify Supabase RLS (Row Level Security) is enabled
- [ ] Remove any console.log statements with sensitive data
- [ ] Set strong JWT secrets
- [ ] Enable HTTPS only
- [ ] Review and test all authentication flows

---

## 🧪 Testing Your Deployment

### Test Frontend
1. Visit your Vercel URL
2. Try to register a new user
3. Login with credentials
4. Navigate through the app

### Test API
1. Visit `https://your-api.railway.app/swagger`
2. Test the `/api/setup/test-config` endpoint
3. Test authentication endpoints

### Test Integration
1. Open browser DevTools → Network tab
2. Login to your app
3. Verify API calls are hitting your Railway URL
4. Check for any CORS errors

---

## 📊 Monitoring & Logs

### Vercel
- Dashboard: https://vercel.com/dashboard
- Logs: Click on your project → Deployments → Select deployment → Logs

### Railway
- Dashboard: https://railway.app/dashboard
- Logs: Click on your project → Select service → Logs tab

### Supabase
- Dashboard: https://supabase.com/dashboard
- Database logs and metrics available in the dashboard

---

## 🔄 Continuous Deployment (CI/CD)

### Automatic Deployments

Both Vercel and Railway can automatically deploy when you push to GitHub:

1. **Connect GitHub in Vercel:**
   - Go to Vercel Dashboard
   - Import Project → Select your GitHub repo
   - Choose `frontend` directory

2. **Connect GitHub in Railway:**
   - Go to Railway Dashboard
   - New Project → Deploy from GitHub
   - Select your repo and `backend` directory

Now every push to `main` will automatically deploy! 🎉

---

## 🆘 Troubleshooting

### Frontend won't connect to API
- Check `API_URL` environment variable in Vercel
- Verify CORS settings in backend
- Check browser console for errors

### API authentication failing
- Verify Supabase JWT secret is correct
- Check that Supabase URL is correct (including `/auth/v1`)
- Test JWT token locally first

### Database connection issues
- Verify connection string in Railway
- Check Supabase database is running
- Ensure firewall allows Railway's IP addresses

---

## 💰 Cost Breakdown

| Service | Tier | Cost |
|---------|------|------|
| **Vercel** | Hobby | FREE |
| **Railway** | Developer | ~$5/month |
| **Supabase** | Free | FREE (up to 500MB, 2GB bandwidth) |
| **Total** | | **~$5/month** |

### When to Upgrade

**Supabase Pro ($25/month):**
- More than 500MB database
- Need more than 2GB bandwidth
- Want daily backups

**Railway Pro ($20/month):**
- Need more resources
- Want priority support

---

## 🎓 Next Steps

After deployment:

1. ✅ Set up custom domain (optional)
2. ✅ Configure email notifications (Supabase)
3. ✅ Set up monitoring/alerts
4. ✅ Add error tracking (Sentry, etc.)
5. ✅ Implement automated backups

---

## 📞 Support

Having issues? Check:
1. [Vercel Documentation](https://vercel.com/docs)
2. [Railway Documentation](https://docs.railway.app)
3. [Supabase Documentation](https://supabase.com/docs)

---

**Happy Deploying! 🚀**

