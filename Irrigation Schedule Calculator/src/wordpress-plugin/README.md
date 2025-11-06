# WordPress Plugin Integration Guide

## Installation Steps

### 1. Build the React App
```bash
# In your project root
npm run build
```

### 2. Plugin Structure
Create this folder structure in your WordPress plugins directory:

```
wp-content/plugins/irrigation-calculator/
├── irrigation-calculator.php (main plugin file)
├── build/
│   ├── app.js (compiled React app)
│   ├── app.css (compiled styles)
│   └── admin.js (admin dashboard)
├── languages/
│   └── irrigation-calculator.pot
└── README.md
```

### 3. Copy Build Files
After running `npm run build`, copy the compiled files:
- Copy `dist/assets/*.js` to `build/app.js`
- Copy `dist/assets/*.css` to `build/app.css`
- Copy admin build to `build/admin.js`

### 4. Activate Plugin
1. Upload the plugin folder to `wp-content/plugins/`
2. Go to WordPress Admin → Plugins
3. Activate "Big Irrigation Schedule Calculator"

### 5. Configure API Keys
1. Go to Irrigation Calc → Settings
2. Add your API keys:
   - **OpenWeatherMap API Key** (required for weather)
   - **Google Places API Key** (required for location autocomplete)
   - **SendGrid API Key** (optional, for better email delivery)
3. Set "From Email" and "From Name"
4. Click "Save Changes"

### 6. Add to Page
Add this shortcode to any page:
```
[irrigation_calculator]
```

## API Keys Setup

### OpenWeatherMap (Required)
1. Go to https://openweathermap.org/api
2. Sign up for free account
3. Get API key from dashboard
4. **Free Tier:** 60 calls/minute, 1M calls/month
5. Paste in plugin settings

### Google Places (Required)
1. Go to https://console.cloud.google.com
2. Create new project
3. Enable "Places API"
4. Create credentials → API Key
5. **Pricing:** $200 free credit monthly
6. Restrict key to your domain
7. Paste in plugin settings

### SendGrid (Optional)
1. Go to https://sendgrid.com
2. Sign up for free account
3. Create API key
4. **Free Tier:** 100 emails/day
5. Paste in plugin settings

## Database Tables

The plugin creates this table on activation:
- `wp_irrigation_schedules` - Stores all user submissions

## AJAX Endpoints

The plugin registers these endpoints:
- `wp_ajax_submit_irrigation_schedule` - Save schedule
- `wp_ajax_get_weather_forecast` - Fetch weather data

## Admin Dashboard

Access analytics at:
- WordPress Admin → Irrigation Calc → Analytics

## Shortcode

Use anywhere:
```
[irrigation_calculator]
```

## Testing Checklist

- [ ] Shortcode displays calculator
- [ ] Location autocomplete works
- [ ] Weather forecast displays
- [ ] Form submission saves to database
- [ ] Email is sent with schedule
- [ ] Admin analytics shows submissions
- [ ] Mobile responsive

## Troubleshooting

**Calculator doesn't display:**
- Check browser console for errors
- Verify build files are in correct location
- Clear WordPress cache

**Location autocomplete not working:**
- Verify Google Places API key is set
- Check API key restrictions
- Enable Places API in Google Cloud Console

**Weather not loading:**
- Verify OpenWeatherMap API key is set
- Check API usage limits
- Look for errors in browser console

**Email not sending:**
- Check WordPress email settings
- Try SendGrid integration
- Test with WP Mail SMTP plugin

## Security Notes

⚠️ **Before Production:**
1. Add GDPR consent checkbox
2. Add privacy policy link
3. Implement data retention policy
4. Add "Right to be Forgotten" feature
5. Review data selling compliance

## Support

For issues:
1. Check browser console
2. Check WordPress debug.log
3. Verify API keys are correct
4. Test with default WordPress theme
