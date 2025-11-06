# Testing Guide - Irrigation Calculator Plugin

## ✅ Issues Fixed

1. **Critical Fix**: Admin asset loading now checks for file existence before enqueueing
   - Previously tried to load non-existent `admin.js` and `admin.css`
   - Now gracefully falls back to `app.js`/`app.css` if admin files don't exist
   - Settings page works without JS (plain PHP form)
   - Analytics page uses React from `app.js` if admin files missing

2. **PHP Syntax**: Verified - No syntax errors
3. **File Structure**: All required files present
4. **ABSPATH Guard**: Properly implemented

## 🚀 Quick Start Testing

### Prerequisites
1. **Start Docker Desktop** (required for local testing)
2. Docker and Docker Compose installed

### Step 1: Start Local WordPress

```bash
cd /Users/workstationa/Library/CloudStorage/OneDrive-Personal/Cursor/irrigation-runtime-plugin
docker-compose up -d
```

Wait ~10-15 seconds for WordPress to initialize.

### Step 2: Run Test Script

```bash
./test-plugin.sh
```

This will verify:
- ✅ All plugin files exist
- ✅ PHP syntax is valid
- ✅ WordPress is accessible
- ✅ Docker containers are running

### Step 3: Access WordPress Admin

1. Open: http://localhost:8081/wp-admin
2. If first time setup:
   - Complete WordPress installation
   - Create admin account
   - Remember credentials
3. If already installed:
   - Login with your admin credentials

### Step 4: Activate Plugin

1. Go to **Plugins → Installed Plugins**
2. Find **"Irrigation Schedule Calculator"**
3. Click **"Activate"**
4. **Expected Result**: ✅ Plugin activates without white screen
5. **If white screen appears**: See Troubleshooting section below

### Step 5: Verify Admin Menu

1. Look for **"Irrigation Calc"** menu in admin sidebar
2. Should have submenus:
   - Analytics
   - Settings
3. Click **"Analytics"** - should load without errors
4. Click **"Settings"** - should show settings form

### Step 6: Test Frontend Shortcode

1. Create a new page: **Pages → Add New**
2. Title: "Irrigation Calculator"
3. Add shortcode: `[irrigation_calculator]`
4. Publish page
5. View page (click "View Page" or visit frontend)
6. **Expected Result**: ✅ Calculator interface loads
7. Open browser console (F12) - should see no errors

## 🔍 Troubleshooting

### White Screen After Activation

**Check WordPress Debug Log:**
```bash
docker-compose logs wordpress | grep -i error
```

**Enable Debug Mode:**
The Docker setup already has debug enabled. Check logs:
```bash
docker-compose logs wordpress
```

**Common Causes:**
1. **Missing build files** - Check `irrigation-calculator-plugin/build/` exists
2. **PHP version** - Requires PHP 7.4+ (Docker uses 8.1 ✅)
3. **WordPress version** - Requires 5.8+ (Docker uses 6.4 ✅)
4. **Memory limit** - Check wp-config.php

### Plugin Not Appearing in Plugins List

**Check plugin directory:**
```bash
docker exec irrigation-calc-wordpress ls -la /var/www/html/wp-content/plugins/
```

Should see: `irrigation-calculator/` directory

**Verify plugin header:**
The plugin header in `irrigation-calculator.php` should be correct:
```php
Plugin Name: Irrigation Schedule Calculator
```

### Settings Page Not Loading

The settings page is a plain PHP form and should work without JavaScript. If it doesn't load:
1. Check for PHP errors in logs
2. Verify file permissions
3. Check browser console for any errors

### Analytics Page Not Loading

The analytics page needs React. If it shows blank:
1. Check browser console (F12) for JavaScript errors
2. Verify `build/app.js` exists
3. Check network tab for failed file loads
4. Verify `irrigationCalcAdminData` is available in console

### Frontend Shortcode Not Working

1. **Check shortcode is added**: `[irrigation_calculator]`
2. **Check browser console**: Look for JavaScript errors
3. **Verify build files**: Check Network tab shows `app.js` and `app.css` loading
4. **Check root element**: Should see `<div id="irrigation-calculator-root"></div>` in page source

## 📊 Verification Checklist

After testing, verify:

- [ ] Plugin appears in plugins list
- [ ] Plugin activates without white screen
- [ ] No PHP errors in WordPress logs
- [ ] "Irrigation Calc" menu appears in admin
- [ ] Analytics page loads (may be blank if no data, but no errors)
- [ ] Settings page loads and shows form
- [ ] Settings can be saved
- [ ] Shortcode renders on frontend
- [ ] No JavaScript errors in browser console
- [ ] Calculator interface is interactive

## 🐛 Debug Commands

**View WordPress logs:**
```bash
docker-compose logs wordpress
```

**View specific errors:**
```bash
docker-compose logs wordpress | grep -i "fatal\|error\|warning"
```

**Check plugin files in container:**
```bash
docker exec irrigation-calc-wordpress ls -la /var/www/html/wp-content/plugins/irrigation-calculator/
```

**Check PHP errors:**
```bash
docker exec irrigation-calc-wordpress tail -f /var/www/html/wp-content/debug.log
```

**Restart containers:**
```bash
docker-compose restart
```

**Full reset (⚠️ deletes data):**
```bash
docker-compose down -v
docker-compose up -d
```

## 📝 Expected Behavior

### Successful Activation
- ✅ Plugin appears in "Active" plugins list
- ✅ No white screen
- ✅ Admin menu "Irrigation Calc" appears
- ✅ No errors in browser console
- ✅ No errors in WordPress logs

### Successful Frontend Rendering
- ✅ Shortcode renders calculator interface
- ✅ All JavaScript loads (check Network tab)
- ✅ No console errors
- ✅ Calculator is interactive
- ✅ Styles are applied correctly

## 🔗 Useful URLs

- **WordPress Site**: http://localhost:8081
- **WordPress Admin**: http://localhost:8081/wp-admin
- **phpMyAdmin**: http://localhost:8080
- **WordPress Debug Log**: Inside container at `/var/www/html/wp-content/debug.log`

## 🎯 Next Steps After Testing

Once everything works:
1. Test all calculator features
2. Test settings save functionality
3. Test email functionality (if API keys configured)
4. Test analytics page with data
5. Test on different browsers
6. Test mobile responsiveness

---

**Note**: If Docker is not running, start Docker Desktop first, then run the test script.



