# WordPress Plugin - Quick Start Guide

**Transform your React app into a WordPress plugin in 3 commands!** 🚀

## Prerequisites

- Node.js 16+ installed
- WordPress 5.8+ site
- Access to WordPress admin panel

## Installation Steps

### 1️⃣ Install Dependencies

```bash
npm install
```

### 2️⃣ Build WordPress Plugin

```bash
npm run build:wordpress
```

This will:
- ✅ Compile React app to production code
- ✅ Create optimized JavaScript bundle
- ✅ Generate CSS files
- ✅ Copy everything to `wordpress-plugin/build/`

### 3️⃣ Package as ZIP (Optional)

```bash
npm run package:plugin
```

This creates `irrigation-calculator.zip` ready to upload!

---

## WordPress Installation

### Method A: Upload ZIP (Easiest)

1. Run `npm run package:plugin`
2. Go to **WordPress Admin → Plugins → Add New**
3. Click **"Upload Plugin"**
4. Choose `irrigation-calculator.zip`
5. Click **"Install Now"**
6. Click **"Activate"**

### Method B: Manual Installation

1. Run `npm run build:wordpress`
2. Copy the `wordpress-plugin` folder
3. Paste into `wp-content/plugins/`
4. Rename to `irrigation-calculator`
5. Go to **WordPress Admin → Plugins**
6. Click **"Activate"** on Irrigation Calculator

---

## Configuration

### Step 1: Get API Keys

#### OpenWeatherMap (Required)
1. Go to https://openweathermap.org/api
2. Sign up for free account
3. Copy your API key
4. **Free tier:** 1,000,000 calls/month

#### Google Places (Required)
1. Go to https://console.cloud.google.com
2. Create new project
3. Enable "Places API" and "Geocoding API"
4. Create API key
5. **Free tier:** $200 credit/month

### Step 2: Configure Plugin

1. Go to **WordPress Admin → Irrigation Calc → Settings**
2. Paste your API keys:
   - **OpenWeatherMap API Key**
   - **Google Places API Key**
3. Set email settings:
   - From Email: `noreply@yoursite.com`
   - From Name: `Your Site Name`
4. Click **Save Changes**

### Step 3: Add to Your Site

**Create a new page:**
1. Pages → Add New
2. Title: "Water Calculator" (or your choice)
3. In content editor, add: `[irrigation_calculator]`
4. Publish!

**Or add to existing page:**
- Edit any page/post
- Add the shortcode: `[irrigation_calculator]`

---

## Testing

Visit your page! You should see:

✅ Beautiful landing page with animated stats  
✅ "Get Started" button  
✅ 3-step wizard interface  
✅ Location autocomplete (if Google API configured)  
✅ Weather data (if OpenWeather API configured)  
✅ Email delivery after form submission  

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run development server |
| `npm run build` | Build for production |
| `npm run build:wordpress` | Build WordPress plugin |
| `npm run package:plugin` | Create installable ZIP |
| `npm run preview` | Preview production build |

---

## File Structure After Build

```
wordpress-plugin/
├── irrigation-calculator.php    # Main plugin file
├── build/
│   ├── app.js                  # Compiled React app
│   ├── app.css                 # Compiled styles
│   └── assets/                 # Images, fonts, etc.
├── languages/
│   └── (translation files)
└── README.md
```

---

## Troubleshooting

### ❌ Plugin doesn't appear after activation

**Solution:**
- Clear WordPress cache
- Check `build/` folder contains `app.js` and `app.css`
- Check browser console for errors

### ❌ Location autocomplete not working

**Solution:**
- Verify Google Places API key is correct
- Check API is enabled in Google Cloud Console
- Verify billing is set up (even for free tier)

### ❌ Weather not loading

**Solution:**
- Verify OpenWeatherMap API key is correct
- Check you haven't exceeded API limits
- Wait 10 minutes for new API keys to activate

### ❌ Email not sending

**Solution:**
- Test WordPress email with WP Mail SMTP plugin
- Check spam folder
- Configure SendGrid for production

---

## Admin Dashboard

Access analytics at: **WordPress Admin → Irrigation Calc → Analytics**

View:
- 📊 Total schedules created
- 📈 Growth trends
- 📍 User locations on map
- 📋 Recent submissions
- 💾 Export to CSV
- 📧 Resend emails

---

## Security Notes

The plugin includes:

✅ Nonce verification for all AJAX requests  
✅ Input sanitization and escaping  
✅ SQL injection protection  
✅ XSS protection  
✅ CSRF protection  
✅ Honeypot spam protection  

**Before going live:**
- Add reCAPTCHA v3 for extra spam protection
- Review GDPR compliance
- Add privacy policy link
- Configure data retention policy

---

## Advanced Features

### Custom Email Template

Edit in WordPress Admin → Irrigation Calc → Settings:

```php
Hello {{name}},

Your irrigation schedule for {{location}} is ready!

Total Zones: {{zone_count}}
Weekly Water Usage: {{water_usage}} gallons
Estimated Savings: {{savings}}

Best regards,
{{site_name}}
```

### Custom Styling

Add custom CSS in WordPress Customizer:

```css
/* Customize calculator colors */
#irrigation-calculator-root {
  --primary-color: #0066CC;
  --secondary-color: #00A859;
}
```

### Shortcode Parameters

```
[irrigation_calculator]                          Default
[irrigation_calculator show_admin="true"]        Show admin view
```

---

## Support & Documentation

### Documentation
- 📖 [Full Deployment Guide](wordpress-plugin/WORDPRESS_DEPLOYMENT.md)
- 📖 [Plugin README](wordpress-plugin/README.md)
- 📖 [API Documentation](guidelines/Guidelines.md)

### Common Issues
- Check browser console (F12)
- Check WordPress debug.log
- Review Network tab for API errors
- Test with default WordPress theme

### Get Help
1. Check documentation above
2. Review browser console errors
3. Check WordPress error logs
4. Verify API keys are correct
5. Test with all other plugins disabled

---

## Performance Tips

### Enable Caching
```php
// Add to wp-config.php
define('WP_CACHE', true);
```

### Recommended Plugins
- **WP Super Cache** - Page caching
- **Autoptimize** - Minify CSS/JS
- **Smush** - Image optimization
- **WP Rocket** - Premium caching (paid)

---

## Production Checklist

Before launching:

- [ ] Tested on staging site
- [ ] API keys configured
- [ ] Email sending works
- [ ] Tested on mobile devices
- [ ] Checked all browsers (Chrome, Firefox, Safari)
- [ ] Privacy policy updated
- [ ] GDPR compliance checked
- [ ] SSL certificate installed
- [ ] Backup plugin configured
- [ ] Analytics/tracking added

---

## What's Included

### Frontend Features
✅ 3-step wizard interface  
✅ Location autocomplete with geocoding  
✅ Weather-smart scheduling  
✅ Real-time water/cost/CO2 calculations  
✅ Controller brand instructions (Rain Bird, Hunter, Toro, etc.)  
✅ PDF generation and download  
✅ Print functionality  
✅ Email delivery  
✅ Mobile responsive design  
✅ Offline detection  
✅ Keyboard shortcuts  
✅ Loading states and skeletons  
✅ Toast notifications  
✅ Error boundaries  
✅ Confirmation dialogs  

### Backend Features
✅ WordPress database integration  
✅ AJAX endpoints for all operations  
✅ Admin analytics dashboard  
✅ CSV export  
✅ Email templates  
✅ API key management  
✅ Settings page  
✅ Security (nonces, sanitization)  
✅ Caching for API calls  
✅ Rate limiting ready  

### Admin Dashboard
✅ Real-time analytics  
✅ Interactive charts  
✅ Map visualization  
✅ Schedule management  
✅ User data export  
✅ Email resend functionality  
✅ API status monitoring  

---

## Quick Reference

### Important URLs
- Plugin Settings: `/wp-admin/admin.php?page=irrigation-calculator-settings`
- Analytics: `/wp-admin/admin.php?page=irrigation-calculator`
- Database Table: `wp_irrigation_schedules`

### Important Files
- Main Plugin: `irrigation-calculator.php`
- React App: `build/app.js`
- Styles: `build/app.css`

### Shortcode
```
[irrigation_calculator]
```

---

## Need More Help?

📧 Check the detailed guides:
- [Complete Deployment Guide](wordpress-plugin/WORDPRESS_DEPLOYMENT.md)
- [Plugin README](wordpress-plugin/README.md)

🎉 **You're ready to go!** Run `npm run package:plugin` and upload to WordPress!
