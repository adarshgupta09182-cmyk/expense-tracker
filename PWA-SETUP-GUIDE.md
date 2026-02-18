# Progressive Web App (PWA) Setup Guide

## ✅ What's Been Implemented

### 1. **Manifest.json** ✅
- Located: `client/public/manifest.json`
- Includes app metadata, icons, theme colors, and shortcuts
- Supports both Android and iOS

### 2. **Service Worker** ✅
- Located: `client/public/service-worker.js`
- Implements offline caching strategy
- Network-first for API calls
- Cache-first for static assets
- Automatic cache cleanup

### 3. **PWA Registration** ✅
- Located: `client/public/pwa-register.js`
- Registers service worker
- Handles install prompts
- Detects standalone mode
- Manages online/offline status

### 4. **Install Prompt Component** ✅
- Located: `client/src/components/PWAInstallPrompt.jsx`
- Beautiful install prompt UI
- Shows when app is installable
- Responsive design

### 5. **PWA Styling** ✅
- Located: `client/src/pwa.css`
- Safe area support (notch handling)
- Offline indicator
- Full-screen mode support
- Dark mode support

### 6. **Meta Tags** ✅
- Updated: `client/index.html`
- Theme color: #4F46E5
- Apple mobile web app support
- Windows tile support

---

## 🎨 Next Steps: Add App Icons

You need to create app icons and place them in `client/public/icons/`:

### Required Icon Files:
```
client/public/icons/
├── icon-192x192.png           (192x192 pixels)
├── icon-192x192-maskable.png  (192x192 pixels, maskable)
├── icon-512x512.png           (512x512 pixels)
├── icon-512x512-maskable.png  (512x512 pixels, maskable)
├── screenshot-540x720.png     (540x720 pixels, narrow)
└── screenshot-1280x720.png    (1280x720 pixels, wide)
```

### How to Create Icons:

#### Option 1: Using Online Tools (Easiest)
1. Go to: https://www.favicon-generator.org/
2. Upload your logo/image
3. Generate PWA icons
4. Download and place in `client/public/icons/`

#### Option 2: Using Figma
1. Create 512x512 design in Figma
2. Export as PNG
3. Use ImageMagick to resize:
   ```bash
   convert logo.png -resize 192x192 icon-192x192.png
   convert logo.png -resize 512x512 icon-512x512.png
   ```

#### Option 3: Using Python PIL
```python
from PIL import Image

img = Image.open('logo.png')
img.resize((192, 192)).save('icon-192x192.png')
img.resize((512, 512)).save('icon-512x512.png')
```

### Maskable Icons:
Maskable icons are used on devices that apply masks to app icons. They should have:
- Safe zone: 80% of the icon (center area)
- Full bleed: 100% of the icon (edges can be cut)

---

## 📱 Integration Steps

### Step 1: Add PWA Install Prompt to Navbar
Update `client/src/components/Navbar.jsx`:

```jsx
import PWAInstallPrompt from './PWAInstallPrompt';

export default function Navbar() {
  return (
    <>
      <nav>
        {/* Your navbar content */}
      </nav>
      <PWAInstallPrompt />
    </>
  );
}
```

### Step 2: Create Icons Directory
```bash
mkdir -p client/public/icons
```

### Step 3: Add Your Icons
Place the 6 icon files in `client/public/icons/`

### Step 4: Update Vite Config (if needed)
Ensure `client/vite.config.js` includes public folder:

```javascript
export default {
  server: {
    middlewareMode: true,
  },
  build: {
    outDir: 'dist',
  },
  publicDir: 'public',
}
```

---

## 🧪 Testing PWA

### Test Locally:
```bash
cd client
npm run build
npm run preview
```

Then open: `http://localhost:4173`

### Test on Android:
1. Open Chrome on Android
2. Go to your app URL
3. Tap menu (⋮) → "Install app"
4. Or wait for install prompt

### Test on iOS:
1. Open Safari on iOS
2. Go to your app URL
3. Tap Share → "Add to Home Screen"
4. Name the app and add

### Test Offline:
1. Install the app
2. Open DevTools (F12)
3. Go to Application → Service Workers
4. Check "Offline"
5. Refresh page - should still work

---

## 📊 Lighthouse PWA Audit

### Run Audit:
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Select "PWA"
4. Click "Analyze page load"

### Target Score: 90+

### Common Issues & Fixes:

| Issue | Fix |
|-------|-----|
| Missing manifest | ✅ Already added |
| Service worker not registered | ✅ Already added |
| No icons | Add icons to `client/public/icons/` |
| Not HTTPS | Deploy to production (Vercel/Railway) |
| Viewport not set | ✅ Already added |
| Theme color missing | ✅ Already added |

---

## 🚀 Deployment

### For Vercel (Frontend):
1. Push code to GitHub
2. Vercel auto-deploys
3. PWA works automatically

### For Railway (Backend):
No changes needed - backend serves API

### Verify PWA on Production:
1. Go to your production URL
2. Open DevTools → Application
3. Check Service Workers tab
4. Should show "active and running"

---

## 📋 Checklist

- [ ] Create app icons (6 files)
- [ ] Place icons in `client/public/icons/`
- [ ] Add PWAInstallPrompt to Navbar
- [ ] Test locally with `npm run preview`
- [ ] Test on Android device
- [ ] Test on iOS device
- [ ] Test offline functionality
- [ ] Run Lighthouse PWA audit
- [ ] Verify score is 90+
- [ ] Deploy to production
- [ ] Test on production URL

---

## 🔧 Troubleshooting

### Service Worker not registering:
- Check browser console for errors
- Ensure HTTPS (required for production)
- Clear browser cache and reload

### Install prompt not showing:
- App must be HTTPS
- Must have valid manifest.json
- Must have service worker
- Must have icons

### Offline not working:
- Check service worker in DevTools
- Verify cache names match
- Check network tab for cached requests

### Icons not showing:
- Verify file paths in manifest.json
- Check file sizes (should be PNG)
- Ensure files exist in `client/public/icons/`

---

## 📚 Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Manifest Spec](https://www.w3.org/TR/appmanifest/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Lighthouse PWA Audit](https://web.dev/lighthouse-pwa/)
- [Icon Generator](https://www.favicon-generator.org/)

---

## ✨ Features Enabled

✅ Offline support
✅ Install prompt
✅ App shortcuts
✅ Standalone mode
✅ Safe area support (notch)
✅ Online/offline detection
✅ Automatic updates
✅ Cache management
✅ Full-screen mode
✅ Theme color matching

---

**Your PWA is ready! Just add the icons and you're done!** 🎉
