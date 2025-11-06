# WordPress Plugin Export Guide

## Quick Export

To export your Irrigation Schedule Calculator to WordPress, follow these steps:

### Step 1: Build the Plugin

Run the following command in your terminal:

```bash
npm run package:plugin
```

This will:
1. Build the React application
2. Copy files to the WordPress plugin structure
3. Create a `irrigation-calculator.zip` file ready for WordPress installation

### Step 2: Install in WordPress

#### Option A: Upload via WordPress Admin (Recommended)

1. Log in to your WordPress admin panel
2. Go to **Plugins** → **Add New**
3. Click **Upload Plugin**
4. Choose the `irrigation-calculator.zip` file
5. Click **Install Now**
6. Click **Activate Plugin**

#### Option B: Manual Installation via FTP

1. Extract `irrigation-calculator.zip`
2. Upload the `irrigation-calculator` folder to `/wp-content/plugins/`
3. Go to WordPress admin → **Plugins**
4. Find "Irrigation Schedule Calculator" and click **Activate**

### Step 3: Configure API Keys

1. In WordPress admin, go to **Irrigation Calc** → **Settings**
2. Add your API keys:
   - **OpenWeatherMap API Key** (required for weather features)
     - Get free key at: https://openweathermap.org/api
   - **Google Places API Key** (optional for address autocomplete)
     - Get key at: https://console.cloud.google.com
3. Configure email settings:
   - From Email
   - From Name
   - SendGrid API Key (optional for better deliverability)
4. Click **Save Settings**

### Step 4: Add to Your Website

Add the calculator to any page or post using the shortcode:

```
[irrigation_calculator]
```

Or use the block editor:
1. Add a new **Shortcode** block
2. Enter: `[irrigation_calculator]`
3. Publish the page

---

## Manual Build Process

If you want to build manually without creating a ZIP:

### 1. Build React App

```bash
npm run build
```

### 2. Build WordPress Plugin

```bash
npm run build:wordpress
```

This creates the `wordpress-plugin/build/` folder with:
- `app.js` - Main React application
- `app.css` - All styles
- `assets/` - Images, fonts, and other assets

### 3. Manual Installation

Copy the entire `wordpress-plugin/` folder to your WordPress installation at:
```
/wp-content/plugins/irrigation-calculator/
```

---

## Plugin Files Structure

```
irrigation-calculator/
├── irrigation-calculator.php  (Main plugin file)
├── README.md                  (Documentation)
├── WORDPRESS_DEPLOYMENT.md   (Deployment guide)
├── build/                     (Built React app)
│   ├── app.js
│   ├── app.css
│   └── assets/
└── languages/                 (Translation files)
```

---

## Required Configuration

### OpenWeatherMap API Setup

1. Go to https://openweathermap.org/api
2. Sign up for a free account
3. Navigate to **API Keys**
4. Copy your API key
5. Paste in WordPress admin → **Irrigation Calc** → **Settings**

### Google Places API Setup (Optional)

1. Go to https://console.cloud.google.com
2. Create a new project
3. Enable **Places API**
4. Create credentials (API Key)
5. Restrict the key to your domain
6. Paste in WordPress admin settings

---

## Testing the Installation

1. **Check Plugin Activation**
   - Go to **Plugins** → make sure it's activated
   - No errors should appear

2. **Test Shortcode**
   - Create a test page
   - Add `[irrigation_calculator]` shortcode
   - View the page
   - Calculator should load

3. **Test API Keys**
   - Try creating a schedule
   - Enter an address (tests Google Places API)
   - Verify weather data loads (tests OpenWeatherMap API)

4. **Test Email Delivery**
   - Complete a full schedule
   - Submit with email address
   - Check email delivery
   - Verify PDF attachment (if enabled)

---

## Admin Dashboard Features

After installation, you'll have access to:

### Analytics Dashboard
- Total schedules created
- Monthly/weekly statistics
- Zone averages
- Schedule activity chart
- Recent schedule list

### Settings Panel
- API key configuration
- Email settings
- General plugin options
- Email template customization

---

## Troubleshooting

### Plugin Not Appearing

**Issue**: Plugin doesn't show up in WordPress admin

**Solution**:
- Verify folder is in `/wp-content/plugins/`
- Check folder is named `irrigation-calculator`
- Ensure `irrigation-calculator.php` is in the root of the folder

### Calculator Not Loading

**Issue**: Shortcode appears as text `[irrigation_calculator]`

**Solution**:
- Verify plugin is activated
- Check for JavaScript errors in browser console
- Ensure build files exist in `build/` folder

### Weather Not Working

**Issue**: Weather data doesn't load

**Solution**:
- Verify OpenWeatherMap API key is entered
- Check API key is active (can take a few hours after creation)
- Test API key directly at OpenWeatherMap website

### Email Not Sending

**Issue**: Schedule emails not being delivered

**Solution**:
- Check WordPress can send emails (test with other plugins)
- Verify "From Email" in settings
- Consider using SendGrid for better deliverability
- Check spam folder

### Build Errors

**Issue**: `npm run package:plugin` fails

**Solution**:
```bash
# Install dependencies
npm install

# Try individual steps
npm run build
npm run build:wordpress

# Check for errors in build output
```

---

## Database Tables

The plugin creates one table: `wp_irrigation_schedules`

Stores:
- User contact information
- Schedule data (zones, restrictions)
- Location data (address, coordinates)
- Creation timestamps
- Consent tracking

---

## Security Features

- ✅ Nonce verification on all AJAX requests
- ✅ Capability checks for admin functions
- ✅ SQL injection protection via wpdb
- ✅ XSS protection via sanitization
- ✅ CSRF protection
- ✅ Input validation and sanitization
- ✅ Consent tracking for GDPR compliance

---

## Performance Optimizations

- Weather data cached for 3 hours
- Conditional script loading (only on pages with shortcode)
- Optimized database queries with indexes
- Minified and compressed assets

---

## Support & Documentation

### File Locations

- Main plugin: `/wordpress-plugin/irrigation-calculator.php`
- Build scripts: `/scripts/`
- React source: `/App.tsx` and `/components/`

### Additional Documentation

- `README.md` - General plugin information
- `WORDPRESS_DEPLOYMENT.md` - Detailed deployment guide
- `PRODUCTION_READY.md` - Production checklist

---

## Uninstallation

To completely remove the plugin:

1. Deactivate in WordPress admin
2. Click **Delete**
3. This will:
   - Remove plugin files
   - Keep database table (for safety)

To manually remove database:
```sql
DROP TABLE wp_irrigation_schedules;
DELETE FROM wp_options WHERE option_name LIKE 'irrigation_calc_%';
```

---

## Next Steps After Installation

1. ✅ Install and activate plugin
2. ✅ Configure API keys
3. ✅ Set up email settings
4. ✅ Create a test page with shortcode
5. ✅ Test complete workflow
6. ✅ Customize email templates (optional)
7. ✅ Review analytics dashboard
8. ✅ Add to your main website pages

---

## Production Deployment Checklist

- [ ] All API keys configured
- [ ] Email delivery tested
- [ ] Shortcode tested on live page
- [ ] Mobile responsiveness verified
- [ ] Weather integration working
- [ ] Email templates customized
- [ ] Privacy policy updated
- [ ] Terms of service reviewed
- [ ] Analytics tracking enabled
- [ ] Backup database before launch

---

## Version Information

- Plugin Version: 1.0.0
- WordPress Required: 5.8+
- PHP Required: 7.4+
- License: GPL v2 or later

---

**Need Help?**

Check the additional documentation files or contact support.
