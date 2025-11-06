# 🚀 Quick Start Guide

## Production Build & Deployment

### Step 1: Build the Project
```bash
npm run build
```

### Step 2: Create WordPress Plugin Folder
```bash
mkdir irrigation-calculator
mkdir irrigation-calculator/build
```

### Step 3: Copy Files
```bash
# Copy main plugin file
cp wordpress-plugin/irrigation-calculator.php irrigation-calculator/

# Copy build files (update paths based on your build output)
cp dist/assets/index-*.js irrigation-calculator/build/app.js
cp dist/assets/index-*.css irrigation-calculator/build/app.css

# Copy README
cp wordpress-plugin/README.md irrigation-calculator/
```

### Step 4: Upload to WordPress
```bash
# Option 1: Create ZIP
zip -r irrigation-calculator.zip irrigation-calculator/
# Upload via WordPress Admin → Plugins → Add New → Upload

# Option 2: FTP
# Upload 'irrigation-calculator' folder to:
# wp-content/plugins/irrigation-calculator/
```

### Step 5: Activate & Configure
1. WordPress Admin → Plugins → Activate "Irrigation Schedule Calculator"
2. Go to Irrigation Calc → Settings
3. Add your API keys:
   - OpenWeatherMap API Key: https://openweathermap.org/api
   - Google Places API Key: https://console.cloud.google.com
4. Set email settings (From Email, From Name)
5. Save Changes

### Step 6: Add to Page
1. Create or edit a page
2. Add shortcode: `[irrigation_calculator]`
3. Publish and test

---

## API Keys Setup

### OpenWeatherMap (Required)
1. Sign up: https://openweathermap.org/api
2. Get API key from dashboard
3. Free tier: 60 calls/min, 1M calls/month
4. Add to WordPress settings

### Google Places (Required)
1. Go to: https://console.cloud.google.com
2. Create project → Enable "Places API"
3. Create credentials → API Key
4. Restrict to your domain
5. Add to WordPress settings

### SendGrid (Optional)
1. Sign up: https://sendgrid.com
2. Create API key
3. Free tier: 100 emails/day
4. Add to WordPress settings

---

## Testing Checklist

- [ ] Plugin activates without errors
- [ ] Shortcode displays calculator
- [ ] Location autocomplete works
- [ ] Weather displays correctly
- [ ] All 3 wizard steps work
- [ ] Schedule calculates properly
- [ ] Email sends successfully
- [ ] PDF downloads work
- [ ] Mobile responsive
- [ ] Admin analytics loads

---

## Troubleshooting

**Calculator not showing?**
- Clear WordPress cache
- Check build files are in `irrigation-calculator/build/`
- View browser console for errors

**Weather not loading?**
- Verify OpenWeatherMap API key in settings
- Plugin will use mock data as fallback

**Email not sending?**
- Use SendGrid API key
- Install WP Mail SMTP plugin

---

## Documentation

- **README.md** - Full project documentation
- **DEPLOYMENT.md** - Detailed deployment checklist
- **PRODUCTION_READY.md** - Production status
- **wordpress-plugin/README.md** - WordPress guide

---

**Need Help?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive guide.
