# White Screen Fix Guide

## Quick Fix Steps

1. **Delete the old plugin completely:**
   - WordPress Admin → Plugins → Deactivate
   - Delete the plugin
   - Or via FTP: Delete `/wp-content/plugins/irrigation-calculator/` folder

2. **Upload the NEW zip file:**
   - File: `irrigation-calculator-plugin-v1.0.1.zip`
   - Plugins → Add New → Upload Plugin
   - Install and Activate

3. **If still white screen, check:**
   - Enable WordPress debug: Add to `wp-config.php`:
     ```php
     define('WP_DEBUG', true);
     define('WP_DEBUG_LOG', true);
     define('WP_DEBUG_DISPLAY', true);
     ```
   - Check error logs: `/wp-content/debug.log`

## Common Causes

1. **Old version still installed** - Must delete completely
2. **Missing build files** - Verify `build/app.js` and `build/app.css` exist
3. **PHP version** - Requires PHP 7.4+
4. **Memory limit** - May need to increase PHP memory_limit

## Verification

After upload, verify files exist:
- `/wp-content/plugins/irrigation-calculator/irrigation-calculator.php`
- `/wp-content/plugins/irrigation-calculator/build/app.js`
- `/wp-content/plugins/irrigation-calculator/build/app.css`

