# 🔧 White Screen Troubleshooting Guide

## 🚨 Issue: White Screen After Plugin Installation

If you're seeing a white screen after installing the Irrigation Calculator plugin, here are the steps to diagnose and fix the issue.

## 🔍 Step 1: Check Browser Console

**Most Important:** Open your browser's developer console to see JavaScript errors.

### How to Open Console:
- **Chrome/Edge:** Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- **Firefox:** Press `F12` or `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)
- **Safari:** Press `Cmd+Option+I` (Mac)

### Look for Errors:
- Red error messages in the Console tab
- Failed network requests in the Network tab
- Any messages about missing files or JavaScript errors

## 🔍 Step 2: Check WordPress Debug Log

Enable WordPress debug logging to see PHP errors:

### Add to wp-config.php:
```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

### Check the log file:
- Location: `/wp-content/debug.log`
- Look for errors related to the irrigation calculator plugin

## 🔍 Step 3: Verify Plugin Files

Check if all required files are present:

### Expected Files:
```
wp-content/plugins/irrigation-calculator/
├── irrigation-calculator.php
├── build/
│   ├── app.js
│   ├── app.css
│   └── assets/
└── readme.txt
```

### Check File Permissions:
- Plugin directory: `755`
- PHP files: `644`
- Build files: `644`

## 🔍 Step 4: Test with Debug Version

I've created a debug version that will help identify the issue:

### Upload Debug Version:
1. **Deactivate** the current plugin
2. **Upload** `irrigation-calculator-debug.zip`
3. **Activate** the debug version
4. **Check browser console** for detailed logs

### Debug Version Features:
- ✅ Detailed console logging
- ✅ Simple React test component
- ✅ File existence checks
- ✅ WordPress data validation
- ✅ Error handling and display

## 🔍 Step 5: Common Issues & Solutions

### Issue 1: JavaScript Not Loading
**Symptoms:** White screen, no console errors
**Causes:**
- Build files missing
- Incorrect file paths
- Plugin not properly activated

**Solutions:**
1. Check if `build/app.js` exists
2. Verify file permissions
3. Clear WordPress cache
4. Try debug version

### Issue 2: React Not Rendering
**Symptoms:** White screen, JavaScript loaded but no content
**Causes:**
- React root element not found
- JavaScript errors in React code
- Missing dependencies

**Solutions:**
1. Check console for React errors
2. Verify `#irrigation-calculator-root` element exists
3. Try debug version with simple React component

### Issue 3: WordPress Data Not Available
**Symptoms:** White screen, "WordPress data not available" in console
**Causes:**
- `wp_localize_script` not working
- Plugin not properly initialized
- Theme conflicts

**Solutions:**
1. Check if `window.irrigationCalcData` exists
2. Verify plugin activation
3. Test with default WordPress theme

### Issue 4: File Path Issues
**Symptoms:** 404 errors for CSS/JS files
**Causes:**
- Incorrect plugin URL
- Server configuration issues
- File permissions

**Solutions:**
1. Check Network tab for failed requests
2. Verify plugin URL in WordPress admin
3. Check file permissions

## 🔍 Step 6: Manual Testing

### Test 1: Check Plugin Activation
1. Go to **Plugins** in WordPress admin
2. Verify "Irrigation Schedule Calculator" is **Active**
3. Look for any error messages

### Test 2: Check Shortcode
1. Create a new page
2. Add shortcode: `[irrigation_calculator]`
3. Publish and view the page
4. Check browser console

### Test 3: Check Admin Settings
1. Go to **Irrigation Calc → Settings**
2. Verify settings page loads
3. Check for any error messages

## 🔍 Step 7: Server-Side Checks

### Check PHP Version:
- Minimum required: PHP 7.4
- Check in WordPress admin: **Tools → Site Health**

### Check WordPress Version:
- Minimum required: WordPress 5.8
- Check in WordPress admin: **Dashboard**

### Check Memory Limit:
- Recommended: 256MB or higher
- Add to wp-config.php: `ini_set('memory_limit', '256M');`

## 🔍 Step 8: Theme/Plugin Conflicts

### Test with Default Theme:
1. Switch to **Twenty Twenty-Four** theme
2. Test the calculator
3. If it works, the issue is theme-related

### Test with Other Plugins:
1. Deactivate all other plugins
2. Test the calculator
3. Reactivate plugins one by one to find conflicts

## 🔍 Step 9: Network Issues

### Check CDN/Proxy:
- If using Cloudflare or similar, try bypassing
- Check if JavaScript files are being blocked

### Check HTTPS:
- Ensure all resources load over HTTPS
- Check for mixed content warnings

## 🔍 Step 10: Advanced Debugging

### Enable WordPress Debug Display:
```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', true);
```

### Check Plugin Hooks:
Add this to your theme's functions.php temporarily:
```php
add_action('wp_footer', function() {
    if (is_page() && has_shortcode(get_post()->post_content, 'irrigation_calculator')) {
        echo '<!-- Irrigation Calculator: Shortcode detected -->';
        echo '<!-- Plugin URL: ' . plugin_dir_url(__FILE__) . ' -->';
        echo '<!-- Build files exist: ' . (file_exists(plugin_dir_path(__FILE__) . 'build/app.js') ? 'Yes' : 'No') . ' -->';
    }
});
```

## 🚀 Quick Fixes to Try

### Fix 1: Rebuild Plugin
1. Download the source code
2. Run `npm install && npm run build`
3. Upload the new build files

### Fix 2: Use Debug Version
1. Upload `irrigation-calculator-debug.zip`
2. Check browser console for detailed logs
3. Follow the error messages

### Fix 3: Check File Paths
1. Verify plugin is in correct directory
2. Check file permissions
3. Ensure all files uploaded completely

## 📞 Getting Help

### Information to Provide:
1. **Browser console errors** (screenshot or copy/paste)
2. **WordPress debug log** entries
3. **PHP version** and **WordPress version**
4. **Theme name** and **active plugins**
5. **Server environment** (shared hosting, VPS, etc.)

### Debug Information:
The debug version will provide detailed information in:
- Browser console
- WordPress admin notices
- Plugin settings page

## 🎯 Expected Behavior

### Working Plugin Should Show:
1. **Console logs:** "Irrigation Calculator: Script loaded"
2. **WordPress data:** Available in console
3. **React app:** Renders calculator interface
4. **No errors:** Clean console and network requests

### Debug Version Should Show:
1. **Simple interface:** Blue box with test button
2. **Console logs:** Detailed debugging information
3. **Error handling:** Clear error messages if something fails

## 🔧 Next Steps

1. **Try the debug version** first
2. **Check browser console** for errors
3. **Follow the error messages** to identify the issue
4. **Use this guide** to troubleshoot specific problems
5. **Contact support** with specific error information

---

**Remember:** The debug version is designed to help identify the exact issue. Use it to get detailed information about what's going wrong, then we can fix the specific problem.



