# Azure App Service Deployment Guide

Complete guide for deploying TheButler .NET 9 API to Azure App Service.

---

## 📋 Prerequisites

- ✅ Azure account ([Create free account](https://azure.microsoft.com/free/))
- ✅ Visual Studio 2022 or Azure CLI installed
- ✅ .NET 9 SDK installed
- ✅ Supabase account with your database credentials
- ✅ GitHub repository (optional, for CI/CD)

---

## 🚀 Deployment Methods

Choose one of the following methods:

### Method 1: Visual Studio (Easiest)
### Method 2: Azure Portal + GitHub Actions (Best for CI/CD)
### Method 3: Azure CLI (Most Flexible)

---

## Method 1: Deploy via Visual Studio

### Step 1: Prepare Your Project

1. **Ensure your project builds successfully**
   ```bash
   cd src/TheButler.Api
   dotnet build -c Release
   ```

2. **Test locally first**
   ```bash
   dotnet run
   ```

### Step 2: Publish to Azure

1. **Right-click** on `TheButler.Api` project in Solution Explorer
2. Select **Publish...**
3. Choose **Azure** → Click **Next**
4. Select **Azure App Service (Windows)** or **Azure App Service (Linux)**
   - *Recommendation: Use Linux for better performance and lower cost*
5. Click **Next**

### Step 3: Create App Service

1. Click **Create New**
2. Fill in the details:
   ```
   Name: thebutler-api (or your preferred name)
   Subscription: [Your Azure Subscription]
   Resource Group: Create new → "TheButler-RG"
   Hosting Plan: Create new
     - Name: TheButler-Plan
     - Location: West US 2 (or closest to you)
     - Size: Free (F1) or Basic (B1)
   ```
3. Click **Create**
4. Wait for Azure to provision the resources (~2 minutes)
5. Click **Finish**

### Step 4: Configure Settings

1. In the Publish profile, click **Edit**
2. Under **Settings**:
   - Configuration: **Release**
   - Target Framework: **net9.0**
   - Target Runtime: **Portable** (or linux-x64 for Linux)
3. Click **Save**

### Step 5: Publish

1. Click **Publish** button
2. Wait for deployment to complete (~2-5 minutes)
3. Your browser will open to your deployed API

### Step 6: Configure Environment Variables

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your App Service (thebutler-api)
3. Go to **Settings → Environment variables**
4. Click **+ Add** and add these:

```
Name: ConnectionStrings__DefaultConnection
Value: Host=db.cwvkrkiejntyexfxzxpx.supabase.co;Database=postgres;Username=postgres;Password=YOUR_PASSWORD;SSL Mode=Require;Trust Server Certificate=true

Name: Supabase__Url
Value: https://cwvkrkiejntyexfxzxpx.supabase.co

Name: Supabase__AnonKey
Value: YOUR_SUPABASE_ANON_KEY

Name: Supabase__JwtSecret
Value: YOUR_SUPABASE_JWT_SECRET

Name: ASPNETCORE_ENVIRONMENT
Value: Production
```

5. Click **Apply** → **Confirm**
6. Your app will restart automatically

---

## Method 2: Deploy via Azure Portal + GitHub Actions

### Step 1: Create App Service in Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Click **Create a resource** → Search for **Web App**
3. Click **Create**

### Step 2: Configure Basic Settings

**Basics Tab:**
```
Subscription: [Your subscription]
Resource Group: Create new → "TheButler-RG"
Name: thebutler-api
Publish: Code
Runtime stack: .NET 9 (STS)
Operating System: Linux (recommended)
Region: West US 2 (or closest to you)
```

**App Service Plan:**
```
- Click "Create new"
- Name: TheButler-Plan
- Pricing plan: Free F1 (or Basic B1 for production)
```

### Step 3: Deployment Settings

1. Click **Deployment** tab
2. Enable **Continuous deployment**
3. Choose **GitHub** as source
4. Sign in to GitHub
5. Select:
   ```
   Organization: [Your GitHub username]
   Repository: TheButler
   Branch: main
   ```
6. Click **Review + create** → **Create**

### Step 4: Configure Build Settings

Azure will automatically create a GitHub Actions workflow, but we need to customize it:

1. Go to your repository on GitHub
2. Navigate to `.github/workflows/` folder
3. You'll see a new workflow file (e.g., `main_thebutler-api.yml`)
4. Edit it to look like this:

```yaml
name: Build and deploy ASP.Net Core app to Azure Web App

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up .NET Core
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '9.0.x'

      - name: Build with dotnet
        run: dotnet build --configuration Release
        working-directory: ./backend

      - name: dotnet publish
        run: dotnet publish -c Release -o ${{env.DOTNET_ROOT}}/myapp
        working-directory: ./backend/src/TheButler.Api

      - name: Upload artifact for deployment job
        uses: actions/upload-artifact@v4
        with:
          name: .net-app
          path: ${{env.DOTNET_ROOT}}/myapp

  deploy:
    runs-on: ubuntu-latest
    needs: build
    environment:
      name: 'Production'
      url: ${{ steps.deploy-to-webapp.outputs.webapp-url }}

    steps:
      - name: Download artifact from build job
        uses: actions/download-artifact@v4
        with:
          name: .net-app

      - name: Deploy to Azure Web App
        id: deploy-to-webapp
        uses: azure/webapps-deploy@v3
        with:
          app-name: 'thebutler-api'
          slot-name: 'Production'
          publish-profile: ${{ secrets.AZUREAPPSERVICE_PUBLISHPROFILE }}
          package: .
```

### Step 5: Add Environment Variables

Same as Method 1, Step 6 above.

---

## Method 3: Deploy via Azure CLI

### Step 1: Install Azure CLI

**Windows:**
```bash
winget install Microsoft.AzureCLI
```

**Or download from:** https://aka.ms/installazurecliwindows

### Step 2: Login to Azure

```bash
az login
```

### Step 3: Create Resource Group

```bash
az group create --name TheButler-RG --location westus2
```

### Step 4: Create App Service Plan

**Free tier:**
```bash
az appservice plan create --name TheButler-Plan --resource-group TheButler-RG --sku F1 --is-linux
```

**Basic tier (better performance):**
```bash
az appservice plan create --name TheButler-Plan --resource-group TheButler-RG --sku B1 --is-linux
```

### Step 5: Create Web App

```bash
az webapp create --resource-group TheButler-RG --plan TheButler-Plan --name thebutler-api --runtime "DOTNET:9.0"
```

### Step 6: Configure App Settings

```bash
# Set connection string
az webapp config connection-string set --resource-group TheButler-RG --name thebutler-api --settings DefaultConnection="Host=db.cwvkrkiejntyexfxzxpx.supabase.co;Database=postgres;Username=postgres;Password=YOUR_PASSWORD;SSL Mode=Require;Trust Server Certificate=true" --connection-string-type SQLAzure

# Set Supabase settings
az webapp config appsettings set --resource-group TheButler-RG --name thebutler-api --settings Supabase__Url="https://cwvkrkiejntyexfxzxpx.supabase.co" Supabase__AnonKey="YOUR_ANON_KEY" Supabase__JwtSecret="YOUR_JWT_SECRET" ASPNETCORE_ENVIRONMENT="Production"
```

### Step 7: Deploy from Local

```bash
# Navigate to backend directory
cd backend

# Publish the app
dotnet publish -c Release -o ./publish

# Create deployment package
cd publish
zip -r ../deploy.zip .
cd ..

# Deploy to Azure
az webapp deployment source config-zip --resource-group TheButler-RG --name thebutler-api --src deploy.zip
```

---

## 🔒 Security Best Practices

### 1. Use Azure Key Vault (Recommended)

Instead of storing secrets in App Settings, use Azure Key Vault:

```bash
# Create Key Vault
az keyvault create --name thebutler-vault --resource-group TheButler-RG --location westus2

# Add secrets
az keyvault secret set --vault-name thebutler-vault --name "SupabaseJwtSecret" --value "YOUR_JWT_SECRET"

# Enable managed identity for your app
az webapp identity assign --resource-group TheButler-RG --name thebutler-api

# Grant access to Key Vault
az keyvault set-policy --name thebutler-vault --object-id [APP_IDENTITY_PRINCIPAL_ID] --secret-permissions get list
```

### 2. Enable HTTPS Only

```bash
az webapp update --resource-group TheButler-RG --name thebutler-api --https-only true
```

### 3. Configure CORS

In Azure Portal → App Service → CORS:
```
Allowed Origins: https://your-angular-app.azurewebsites.net
                 http://localhost:4200 (for development)
```

Or via CLI:
```bash
az webapp cors add --resource-group TheButler-RG --name thebutler-api --allowed-origins "https://your-angular-app.azurewebsites.net"
```

---

## 🔍 Monitoring & Troubleshooting

### View Logs

**Azure Portal:**
1. Go to your App Service
2. **Monitoring → Log stream**

**Azure CLI:**
```bash
az webapp log tail --resource-group TheButler-RG --name thebutler-api
```

### Enable Application Insights

```bash
# Create Application Insights
az monitor app-insights component create --app thebutler-insights --location westus2 --resource-group TheButler-RG --application-type web

# Link to Web App
az monitor app-insights component connect-webapp --app thebutler-insights --resource-group TheButler-RG --web-app thebutler-api
```

### Common Issues

**Issue: 500 Internal Server Error**
- Check logs in Log Stream
- Verify environment variables are set correctly
- Ensure database connection string is correct

**Issue: Authentication not working**
- Verify JWT Secret matches your Supabase settings
- Check CORS configuration
- Ensure HTTPS is enforced

**Issue: App won't start**
- Check you're using .NET 9 runtime
- Verify all dependencies are included in publish
- Check startup logs for errors

---

## 🌐 Configure Custom Domain (Optional)

### Step 1: Add Custom Domain

```bash
az webapp config hostname add --webapp-name thebutler-api --resource-group TheButler-RG --hostname api.yourdomain.com
```

### Step 2: Add SSL Certificate

```bash
az webapp config ssl bind --certificate-thumbprint [THUMBPRINT] --ssl-type SNI --name thebutler-api --resource-group TheButler-RG
```

---

## 📊 Scaling Options

### Scale Up (Vertical Scaling)

```bash
# Upgrade to Basic B1
az appservice plan update --name TheButler-Plan --resource-group TheButler-RG --sku B1

# Upgrade to Standard S1
az appservice plan update --name TheButler-Plan --resource-group TheButler-RG --sku S1
```

### Scale Out (Horizontal Scaling)

```bash
# Add more instances (requires Standard tier or higher)
az appservice plan update --name TheButler-Plan --resource-group TheButler-RG --number-of-workers 3
```

---

## 💰 Cost Management

**Free Tier (F1):**
- ✅ Great for development/testing
- ✅ $0/month
- ❌ Limited to 60 minutes/day compute time
- ❌ No custom domains
- ❌ No SSL

**Basic Tier (B1):**
- ✅ Production-ready
- ✅ ~$13/month
- ✅ Always on
- ✅ Custom domains + SSL
- ✅ 1.75 GB RAM

**Standard Tier (S1):**
- ✅ Best for production
- ✅ ~$70/month
- ✅ Auto-scaling
- ✅ Staging slots
- ✅ 1.75 GB RAM

---

## ✅ Post-Deployment Checklist

- [ ] API is accessible at `https://thebutler-api.azurewebsites.net`
- [ ] Swagger UI works at `https://thebutler-api.azurewebsites.net/swagger`
- [ ] Environment variables are configured
- [ ] Database connection is working
- [ ] Authentication endpoints work
- [ ] CORS is configured for your frontend
- [ ] HTTPS is enforced
- [ ] Monitoring/logging is enabled
- [ ] CI/CD pipeline is working (if using GitHub Actions)

---

## 🔗 Useful Links

- [Azure Portal](https://portal.azure.com)
- [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Azure Pricing Calculator](https://azure.microsoft.com/en-us/pricing/calculator/)
- [Azure CLI Reference](https://docs.microsoft.com/en-us/cli/azure/webapp)

---

## 📞 Need Help?

- Azure Support: https://azure.microsoft.com/support/
- Documentation: See `GETTING-STARTED.md` for local development
- API Documentation: `https://thebutler-api.azurewebsites.net/swagger`

---

**Last Updated**: 2025-10-18  
**Version**: 1.0.0  
**Status**: ✅ Ready for Production



