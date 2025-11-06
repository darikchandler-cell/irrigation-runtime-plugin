# Complete WordPress Plugin Deployment Guide

## Overview
This guide will help you convert the React irrigation calculator into a fully functional WordPress plugin.

## Current Status ✅

Your plugin foundation is **READY**! Here's what's already complete:

### ✅ Completed Components
- Main plugin PHP file with all WordPress hooks
- Database schema for storing schedules
- AJAX endpoints for schedule submission and weather
- Admin dashboard integration
- Email functionality
- Shortcode support
- API key configuration
- Security (nonces, sanitization, escaping)
- Analytics and reporting

### 🔨 What You Need to Do

## Step 1: Build the React Application

First, you need to compile your React app into production-ready files.

### Option A: Vite Build (Recommended)
Since this appears to be a Vite project, create a `vite.config.ts` if you don't have one:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'wordpress-plugin/build',
    rollupOptions: {
      output: {
        entryFileNames: 'app.js',
        chunkFileNames: 'chunks/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'app.css';
          }
          return 'assets/[name].[ext]';
        }
      }
    }
  }
});
```

Then run:
```bash
npm run build
# or
vite build
```

### Option B: Manual Build Setup
Add this to your `package.json`:

```json
{
  "scripts": {
    "build": "vite build",
    "build:wordpress": "vite build && npm run copy-to-plugin",
    "copy-to-plugin": "node scripts/copy-build.js"
  }
}
```

Create `scripts/copy-build.js`:
```javascript
const fs = require('fs-extra');
const path = require('path');

const distDir = path.join(__dirname, '../dist');
const pluginBuildDir = path.join(__dirname, '../wordpress-plugin/build');

// Create build directory
fs.ensureDirSync(pluginBuildDir);

// Copy all dist files
fs.copySync(distDir, pluginBuildDir);

// Rename main files to expected names
const files = fs.readdirSync(path.join(pluginBuildDir, 'assets'));

files.forEach(file => {
  if (file.endsWith('.js') && !file.includes('chunk')) {
    fs.renameSync(
      path.join(pluginBuildDir, 'assets', file),
      path.join(pluginBuildDir, 'app.js')
    );
  }
  if (file.endsWith('.css')) {
    fs.renameSync(
      path.join(pluginBuildDir, 'assets', file),
      path.join(pluginBuildDir, 'app.css')
    );
  }
});

console.log('✅ Build files copied to wordpress-plugin/build/');
```

## Step 2: Handle Image Assets

The React app uses Figma assets. You have two options:

### Option A: Bundle Images in Build
Update your build to include images:
- Images will be copied to `wordpress-plugin/build/assets/`
- Update image references to use WordPress URL

### Option B: Upload to WordPress Media Library
- Upload all images to WordPress Media Library
- Update image references to use WordPress media URLs

## Step 3: Update API Endpoints

The React app currently uses mock APIs. Update these files to use WordPress AJAX:

### Update `/utils/wordpressAPI.ts`:
```typescript
export const submitSchedule = async (data: any) => {
  const formData = new FormData();
  formData.append('action', 'submit_irrigation_schedule');
  formData.append('nonce', window.irrigationCalcData.nonce);
  
  Object.keys(data).forEach(key => {
    if (typeof data[key] === 'object') {
      formData.append(key, JSON.stringify(data[key]));
    } else {
      formData.append(key, data[key]);
    }
  });

  const response = await fetch(window.irrigationCalcData.ajaxUrl, {
    method: 'POST',
    body: formData,
  });

  return response.json();
};
```

### Update `/utils/weatherAPI.ts`:
```typescript
export const getWeatherForecast = async (lat: number, lon: number): Promise<WeatherData[]> => {
  if (!window.irrigationCalcData.hasWeatherAPI) {
    // Return mock data if no API key
    return getMockWeatherData();
  }

  const formData = new FormData();
  formData.append('action', 'get_weather_forecast');
  formData.append('nonce', window.irrigationCalcData.nonce);
  formData.append('latitude', lat.toString());
  formData.append('longitude', lon.toString());

  const response = await fetch(window.irrigationCalcData.ajaxUrl, {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();
  
  if (result.success) {
    return parseOpenWeatherData(result.data);
  }
  
  return getMockWeatherData();
};
```

## Step 4: Add TypeScript Declarations

Create `/types/wordpress.d.ts`:
```typescript
interface WordPressData {
  ajaxUrl: string;
  nonce: string;
  hasWeatherAPI: boolean;
  hasPlacesAPI: boolean;
}

declare global {
  interface Window {
    irrigationCalcData: WordPressData;
  }
}

export {};
```

## Step 5: Package the Plugin

Create the final plugin structure:

```
wordpress-plugin/
├── irrigation-calculator.php          ✅ (already exists)
├── build/
│   ├── app.js                        🔨 (needs build)
│   ├── app.css                       🔨 (needs build)
│   └── assets/                       🔨 (images/fonts)
├── languages/
│   └── irrigation-calculator.pot     📝 (optional)
├── README.md                         ✅ (already exists)
└── screenshot.png                    📝 (optional)
```

## Step 6: Create Plugin Package Script

Add to `package.json`:
```json
{
  "scripts": {
    "build:plugin": "vite build && node scripts/package-plugin.js"
  }
}
```

Create `scripts/package-plugin.js`:
```javascript
const fs = require('fs-extra');
const archiver = require('archiver');
const path = require('path');

const pluginDir = path.join(__dirname, '../wordpress-plugin');
const zipPath = path.join(__dirname, '../irrigation-calculator.zip');

// Create zip file
const output = fs.createWriteStream(zipPath);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`✅ Plugin packaged: ${archive.pointer()} bytes`);
  console.log(`📦 Ready to upload: irrigation-calculator.zip`);
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);
archive.directory(pluginDir, 'irrigation-calculator');
archive.finalize();
```

## Step 7: WordPress Installation

### Upload Plugin
1. Build the plugin: `npm run build:plugin`
2. Go to WordPress Admin → Plugins → Add New
3. Click "Upload Plugin"
4. Choose `irrigation-calculator.zip`
5. Click "Install Now"
6. Click "Activate Plugin"

### Configure Settings
1. Go to **Irrigation Calc → Settings**
2. Add your API keys:
   - OpenWeatherMap API Key (get from https://openweathermap.org/api)
   - Google Places API Key (get from https://console.cloud.google.com)
3. Set email settings:
   - From Email
   - From Name
4. Save settings

### Add to Page
1. Create a new page: "Water Calculator"
2. Add the shortcode: `[irrigation_calculator]`
3. Publish the page
4. Visit the page to test

## Step 8: Testing Checklist

### Frontend Tests
- [ ] Calculator loads on page
- [ ] Location autocomplete works (requires Google API)
- [ ] Weather data displays (requires OpenWeather API)
- [ ] Form validation works
- [ ] All 3 steps navigate correctly
- [ ] Email submission works
- [ ] PDF generation works
- [ ] Print functionality works
- [ ] Mobile responsive
- [ ] Keyboard shortcuts work
- [ ] Offline indicator appears when offline

### Backend Tests
- [ ] Schedule saves to database
- [ ] Email sends successfully
- [ ] Admin analytics shows data
- [ ] CSV export works
- [ ] API status check works
- [ ] Settings save correctly

### Security Tests
- [ ] Nonces verify correctly
- [ ] Input sanitization works
- [ ] SQL injection protected
- [ ] XSS protected
- [ ] CSRF protected

## Step 9: Production Optimization

### Performance
```php
// Add to irrigation-calculator.php

// Minify output
add_action('init', function() {
    if (!is_admin()) {
        ob_start('ob_gzhandler');
    }
});

// Add caching headers
add_filter('wp_headers', function($headers) {
    if (is_page_template('irrigation-calculator')) {
        $headers['Cache-Control'] = 'public, max-age=3600';
    }
    return $headers;
});
```

### Database Optimization
```sql
-- Add indexes for better performance
ALTER TABLE wp_irrigation_schedules 
ADD INDEX idx_location (location(100)),
ADD INDEX idx_company (company(100));
```

## Step 10: Advanced Features (Optional)

### Add Cron Job for Auto-Cleanup
```php
// In irrigation-calculator.php

// Register cron
register_activation_hook(__FILE__, function() {
    if (!wp_next_scheduled('irrigation_calc_cleanup')) {
        wp_schedule_event(time(), 'daily', 'irrigation_calc_cleanup');
    }
});

add_action('irrigation_calc_cleanup', function() {
    global $wpdb;
    $table = $wpdb->prefix . 'irrigation_schedules';
    
    // Delete records older than 1 year
    $wpdb->query("DELETE FROM $table WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR)");
});
```

### Add REST API Support
```php
// Register REST routes
add_action('rest_api_init', function() {
    register_rest_route('irrigation-calc/v1', '/schedules', array(
        'methods' => 'GET',
        'callback' => 'get_schedules_rest',
        'permission_callback' => function() {
            return current_user_can('manage_options');
        }
    ));
});
```

## Troubleshooting

### Build Issues
**Error: "Cannot find module '@vitejs/plugin-react'"**
```bash
npm install -D @vitejs/plugin-react vite
```

**Build output is too large**
- Enable code splitting in vite.config.ts
- Use dynamic imports for large components
- Remove unused dependencies

### WordPress Issues
**Calculator doesn't appear**
- Check browser console for errors
- Verify build files exist in `build/` folder
- Clear WordPress cache
- Disable other plugins to check conflicts

**Weather not loading**
- Verify API key in settings
- Check API key has not exceeded limits
- Check browser console for CORS errors

**Email not sending**
- Test with WP Mail SMTP plugin
- Configure SendGrid for better deliverability
- Check WordPress email logs

## Security Best Practices

### Before Going Live
1. ✅ Add rate limiting for form submissions
2. ✅ Implement CAPTCHA (reCAPTCHA v3)
3. ✅ Add GDPR compliance checkboxes
4. ✅ Create privacy policy page
5. ✅ Add data retention policy
6. ✅ Implement "Right to be Forgotten"
7. ✅ Add SSL requirement check
8. ✅ Sanitize ALL user inputs
9. ✅ Escape ALL outputs
10. ✅ Use prepared statements

### Recommended Plugins
- **Wordfence Security** - Firewall and malware scanning
- **WP Mail SMTP** - Reliable email delivery
- **WP Super Cache** - Page caching
- **Yoast SEO** - SEO optimization

## Next Steps

1. **Build the app**: `npm run build`
2. **Package plugin**: `npm run build:plugin`
3. **Upload to WordPress**
4. **Configure API keys**
5. **Test thoroughly**
6. **Go live!**

## Support

For questions or issues:
- Check browser console
- Check WordPress debug.log
- Review AJAX responses in Network tab
- Test with WordPress default theme
- Disable other plugins

## License

GPL v2 or later - Compatible with WordPress

---

**Ready to deploy?** Start with Step 1 above! 🚀
