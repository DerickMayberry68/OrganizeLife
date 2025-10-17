# Screenshots Guide for The Butler

This directory contains marketing screenshots for The Butler application.

## Required Screenshots

To complete the marketing page, capture the following screenshots:

### 1. Dashboard Overview (`dashboard.png`)
- **What to show**: Main dashboard with stat cards, budget overview, and recent activity
- **Route**: `/dashboard`
- **Recommended size**: 1920x1080
- **Key elements**: Welcome message, stat cards, charts, upcoming bills

### 2. Financial Accounts (`accounts.png`)
- **What to show**: Accounts list with grid view
- **Route**: `/accounts`
- **Recommended size**: 1920x1080
- **Key elements**: Account cards, balance totals, recent transactions

### 3. Budget Tracking (`budgets.png`)
- **What to show**: Budget management interface with progress bars
- **Route**: `/budgets`
- **Recommended size**: 1920x1080
- **Key elements**: Budget categories, spending progress, visual indicators

### 4. Bill Management (`bills.png`)
- **What to show**: Bills list with upcoming and paid status
- **Route**: `/bills`
- **Recommended size**: 1920x1080
- **Key elements**: Bill cards, due dates, payment status

### 5. Event Calendar (`calendar.png`)
- **What to show**: Calendar view with events
- **Route**: `/dashboard` (scroll to calendar section)
- **Recommended size**: 1920x1080
- **Key elements**: Calendar grid, events, navigation

### 6. Document Vault (`documents.png`)
- **What to show**: Document management interface
- **Route**: `/documents`
- **Recommended size**: 1920x1080
- **Key elements**: Document list, categories, search/filter

### 7. Healthcare Management (`healthcare.png`)
- **What to show**: Healthcare tracking interface
- **Route**: `/healthcare`
- **Recommended size**: 1920x1080
- **Key elements**: Medical records, appointments, prescriptions

### 8. Mobile Experience (`mobile.png`)
- **What to show**: Responsive mobile view
- **Device**: iPhone or Android simulator (375px width)
- **Recommended size**: 750x1334
- **Key elements**: Mobile navigation, responsive layout

## How to Capture Screenshots

### Option 1: Browser Developer Tools (Recommended)
1. Open The Butler in your browser
2. Press `F12` to open Developer Tools
3. Press `Ctrl+Shift+M` (or `Cmd+Shift+M` on Mac) to toggle device toolbar
4. Select device: "Responsive" or specific device
5. Set dimensions: 1920x1080 for desktop, 375x667 for mobile
6. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
7. Type "screenshot" and select "Capture full size screenshot"
8. Save to this `screenshots/` directory

### Option 2: Windows Snipping Tool
1. Navigate to the page you want to capture
2. Press `Windows + Shift + S`
3. Select the area to capture
4. Open Paint or any image editor
5. Paste and save to `screenshots/` directory

### Option 3: macOS Screenshot
1. Navigate to the page you want to capture
2. Press `Cmd + Shift + 4`
3. Select the area to capture
4. Screenshot saved to Desktop, move to `screenshots/` directory

### Option 4: Third-party Tools
- **Awesome Screenshot** (Browser Extension)
- **Lightshot** (Windows/Mac)
- **Greenshot** (Windows)
- **Skitch** (Mac)

## Image Specifications

### Desktop Screenshots
- **Format**: PNG (best quality) or JPEG (smaller size)
- **Resolution**: 1920x1080 or higher
- **DPI**: 72-96 for web
- **Color Profile**: sRGB

### Mobile Screenshots
- **Format**: PNG (best quality) or JPEG (smaller size)
- **Resolution**: 750x1334 (iPhone 8) or 1080x1920 (Android)
- **DPI**: 72-96 for web
- **Color Profile**: sRGB

## Screenshot Checklist

Before capturing, ensure:
- [ ] App is running in production mode (`npm run build` then serve `dist/`)
- [ ] Browser zoom is at 100%
- [ ] No browser extensions or dev tools visible
- [ ] Sample data is loaded and looks realistic
- [ ] UI is in a clean state (no loading spinners unless intentional)
- [ ] No personal or sensitive information visible
- [ ] Theme is set to default (blue primary color)
- [ ] All elements are fully loaded

## Editing Tips

### Basic Editing
- **Crop**: Remove unnecessary browser chrome
- **Resize**: Ensure consistent dimensions
- **Compress**: Optimize file size without losing quality
- **Annotate**: Add arrows or highlights if needed (use Figma, Photoshop, or online tools)

### Tools for Editing
- **Online**: [Photopea](https://www.photopea.com/) (Free, Photoshop-like)
- **Desktop**: GIMP (Free), Photoshop, Affinity Photo
- **Compression**: [TinyPNG](https://tinypng.com/) for PNG optimization

## Privacy & Security

⚠️ **Important**: Before taking screenshots:
- Use demo/test data only
- Never include real account numbers, balances, or personal information
- Blur or mask any sensitive information
- Review each screenshot before publishing

## Alternative: Use Mockups

If you prefer not to use real screenshots, consider:
- Create mockups in Figma or Sketch
- Use [Mockuphone](https://mockuphone.com/) for device frames
- Generate UI mockups with [Placeit](https://placeit.net/)

## After Capturing Screenshots

1. Save all images to this `screenshots/` directory
2. Rename according to the list above
3. Verify all links in `MARKETING.md` work correctly
4. Optimize images for web (compress if > 500KB)
5. Consider adding device frames for mobile screenshots

## Image Optimization

Before publishing, optimize your screenshots:

```bash
# Install imagemagick (if not already)
# Windows: choco install imagemagick
# Mac: brew install imagemagick

# Resize and compress
magick dashboard.png -resize 1920x1080 -quality 85 dashboard-optimized.png
```

Or use online tools:
- [Squoosh](https://squoosh.app/) - Google's image optimizer
- [TinyPNG](https://tinypng.com/) - PNG compression
- [Optimizilla](https://imagecompressor.com/) - Batch optimization

---

## Need Help?

If you need assistance capturing or editing screenshots:
1. Check the [Marketing Guide](../MARKETING.md)
2. Review this README
3. Contact the development team

Happy screenshot capturing! 📸

