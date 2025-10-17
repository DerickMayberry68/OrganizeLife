# 🛠️ Development Commands - The Butler

Quick reference for common development tasks and commands.

---

## 🚀 Starting the Application

### Development Server
```bash
# Start Angular development server
npm start

# Or with explicit command
ng serve

# Application runs at: http://localhost:4200
```

### Build Commands
```bash
# Development build
npm run build

# Production build
ng build --configuration production

# Watch mode (auto-rebuild on changes)
npm run watch
```

---

## 🛑 Stopping the Application

### Stop Angular Dev Server on Windows

#### Method 1: Find and Kill Process by Port
```powershell
# Find the process running on port 4200
netstat -ano | findstr :4200

# Kill the process (replace PID with actual Process ID from above)
taskkill /PID <PID> /F

# Example:
# netstat -ano | findstr :4200
# Output: TCP [::1]:4200 [::]:0 LISTENING 34992
# taskkill /PID 34992 /F
```

#### Method 2: Kill All Node Processes (Use with caution!)
```powershell
# This will kill ALL Node.js processes
taskkill /IM node.exe /F
```

#### Method 3: Use Ctrl+C
If you have the terminal window where `npm start` is running:
```
Press: Ctrl + C
```

### Stop Angular Dev Server on Mac/Linux

#### Method 1: Find and Kill Process by Port
```bash
# Find the process running on port 4200
lsof -i :4200

# Kill the process (replace PID with actual Process ID)
kill -9 <PID>

# Or one-liner:
kill -9 $(lsof -t -i:4200)
```

#### Method 2: Use Ctrl+C
```bash
# In the terminal where npm start is running
Ctrl + C
```

---

## 🔍 Port Management

### Check What's Running on Port 4200

**Windows:**
```powershell
netstat -ano | findstr :4200
```

**Mac/Linux:**
```bash
lsof -i :4200
# or
netstat -tuln | grep 4200
```

### Change Default Port (if needed)

**Option 1: Command Line**
```bash
ng serve --port 4300
```

**Option 2: Update angular.json**
```json
{
  "projects": {
    "the-butler": {
      "architect": {
        "serve": {
          "options": {
            "port": 4300
          }
        }
      }
    }
  }
}
```

---

## 📦 Package Management

### Install Dependencies
```bash
# Install all dependencies
npm install

# Install specific package
npm install <package-name>

# Install as dev dependency
npm install --save-dev <package-name>
```

### Update Dependencies
```bash
# Check for outdated packages
npm outdated

# Update all packages (careful!)
npm update

# Update Angular CLI
npm install -g @angular/cli@latest
```

### Clean Install
```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Windows PowerShell:
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

---

## 🧪 Testing

### Run Tests
```bash
# Run unit tests
npm test

# Run tests with coverage
ng test --code-coverage

# Run tests in headless mode
ng test --browsers=ChromeHeadless --watch=false
```

---

## 🔧 Code Quality

### Linting
```bash
# Run linter
ng lint

# Fix auto-fixable issues
ng lint --fix
```

### Format Code
```bash
# Format all files (if prettier is configured)
npx prettier --write .

# Format specific files
npx prettier --write "src/**/*.{ts,html,scss}"
```

---

## 📱 Mobile Development Testing

### Test Responsive Design
```bash
# Start server with network access
ng serve --host 0.0.0.0

# Access from mobile device:
# http://<your-computer-ip>:4200
```

### Find Your IP Address

**Windows:**
```powershell
ipconfig

# Look for "IPv4 Address" under your active network adapter
```

**Mac/Linux:**
```bash
ifconfig
# or
ip addr show
```

---

## 🐛 Debugging

### Enable Source Maps
Already enabled in development mode. To debug:
1. Open browser DevTools (F12)
2. Go to Sources tab
3. Find your TypeScript files under `webpack://`

### Clear Angular Cache
```bash
# Clear Angular build cache
rm -rf .angular

# Windows PowerShell:
Remove-Item -Recurse -Force .angular
```

### Clear Browser Cache
- **Chrome**: Ctrl+Shift+Delete (Windows) / Cmd+Shift+Delete (Mac)
- **Firefox**: Ctrl+Shift+Delete (Windows) / Cmd+Shift+Delete (Mac)

---

## 📊 Performance Analysis

### Analyze Bundle Size
```bash
# Build with stats
ng build --stats-json

# Install webpack-bundle-analyzer
npm install -g webpack-bundle-analyzer

# Analyze
webpack-bundle-analyzer dist/TheButler/stats.json
```

### Production Build Stats
```bash
ng build --configuration production --stats-json
```

---

## 🗄️ Database Commands

### PostgreSQL (if using local database)

**Windows:**
```powershell
# Start PostgreSQL service
net start postgresql-x64-14

# Stop PostgreSQL service
net stop postgresql-x64-14

# Connect to database
psql -U postgres -d thebutler
```

**Mac:**
```bash
# Start PostgreSQL
brew services start postgresql

# Stop PostgreSQL
brew services stop postgresql

# Connect to database
psql -U postgres -d thebutler
```

---

## 🔐 Environment Management

### Environment Files
```
src/environments/
├── environment.ts           # Development
└── environment.prod.ts      # Production
```

### Switch Environments
```bash
# Development (default)
ng serve

# Production
ng serve --configuration production
```

---

## 🚢 Deployment

### Build for Production
```bash
# Create optimized production build
ng build --configuration production

# Output location: dist/TheButler/
```

### Preview Production Build Locally
```bash
# Install http-server globally
npm install -g http-server

# Serve production build
cd dist/TheButler/browser
http-server -p 8080

# Open: http://localhost:8080
```

---

## 📸 Screenshots for Marketing

### Start App for Screenshots
```bash
# Start development server
npm start

# Open in browser at: http://localhost:4200

# Follow instructions in screenshots/README.md
```

### Optimal Browser Settings for Screenshots
- Zoom: 100%
- Window size: 1920x1080 (desktop) or 375x667 (mobile)
- Clear cache and cookies
- Use incognito/private mode for clean state

---

## 🔄 Git Commands (Quick Reference)

### Common Workflow
```bash
# Check status
git status

# Stage changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to remote
git push origin main

# Pull latest changes
git pull origin main
```

### Branch Management
```bash
# Create new branch
git checkout -b feature/new-feature

# Switch branches
git checkout main

# List branches
git branch

# Delete branch
git branch -d feature/old-feature
```

---

## 🧹 Cleanup Commands

### Clear Build Artifacts
```bash
# Remove dist folder
rm -rf dist

# Windows PowerShell:
Remove-Item -Recurse -Force dist
```

### Clear All Generated Files
```bash
# Remove all generated files and dependencies
rm -rf node_modules dist .angular

# Windows PowerShell:
Remove-Item -Recurse -Force node_modules, dist, .angular
```

### Reset to Clean State
```bash
# Full cleanup and reinstall
rm -rf node_modules dist .angular package-lock.json
npm install

# Windows PowerShell:
Remove-Item -Recurse -Force node_modules, dist, .angular, package-lock.json
npm install
```

---

## 🆘 Troubleshooting

### Port Already in Use
```powershell
# Windows: Kill process on port 4200
netstat -ano | findstr :4200
taskkill /PID <PID> /F
```

### Angular CLI Not Found
```bash
# Install Angular CLI globally
npm install -g @angular/cli
```

### Module Not Found Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Clear Angular cache
rm -rf .angular
ng serve
```

### TypeScript Errors
```bash
# Check TypeScript version
npx tsc --version

# Reinstall TypeScript
npm install typescript@~5.8.2
```

---

## 📝 Quick Tips

### Keyboard Shortcuts (VS Code)
- `Ctrl+` ` - Toggle terminal
- `Ctrl+Shift+P` - Command palette
- `Ctrl+P` - Quick file open
- `F12` - Go to definition
- `Alt+Shift+F` - Format document

### Browser DevTools
- `F12` - Open DevTools
- `Ctrl+Shift+C` - Inspect element
- `Ctrl+Shift+I` - Toggle DevTools
- `F5` - Reload page
- `Ctrl+F5` - Hard reload (clear cache)

### Useful npm Scripts
```bash
# View all available scripts
npm run

# Run specific script
npm run <script-name>
```

---

## 🔗 Useful Links

- **Angular Documentation**: https://angular.io/docs
- **Syncfusion Documentation**: https://ej2.syncfusion.com/angular/documentation/
- **Bootstrap Documentation**: https://getbootstrap.com/docs/5.3/
- **TypeScript Documentation**: https://www.typescriptlang.org/docs/

---

## 📞 Need Help?

If you encounter issues:
1. Check the error message in the terminal
2. Search the error on Google or Stack Overflow
3. Check Angular documentation
4. Review this commands guide
5. Check project documentation in `/documents` folder

---

<div align="center">

**The Butler - Development Commands**

*Last updated: October 17, 2025*

**Happy Coding! 💻**

</div>

