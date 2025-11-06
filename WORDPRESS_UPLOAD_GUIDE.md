# 📦 WordPress Upload Guide

## Which File to Upload?

**✅ Upload this file to WordPress:**

```
irrigation-calculator-plugin.zip
```

This file is located in the **root directory** of your project.

---

## 📋 Quick Upload Steps

### Option 1: WordPress Admin (Recommended)

1. **Log in to WordPress Admin**
   - Go to your WordPress site: `https://yoursite.com/wp-admin`

2. **Navigate to Plugins**
   - Click **Plugins** → **Add New**

3. **Upload Plugin**
   - Click **Upload Plugin** button (at the top)
   - Click **Choose File**
   - Select `irrigation-calculator-plugin.zip`
   - Click **Install Now**

4. **Activate Plugin**
   - After installation, click **Activate Plugin**

5. **Configure**
   - Go to **Irrigation Calc** → **Settings**
   - Add your API keys (OpenWeatherMap, Google Places)
   - Configure email settings

6. **Add Shortcode**
   - Create or edit a page
   - Add shortcode: `[irrigation_calculator]`
   - Publish the page

---

### Option 2: FTP/SSH Upload

1. **Extract the ZIP file locally**
   ```bash
   unzip irrigation-calculator-plugin.zip
   ```

2. **Upload via FTP or SSH**
   ```bash
   # FTP: Upload the folder to:
   /wp-content/plugins/irrigation-calculator/
   
   # SSH: Extract directly
   scp irrigation-calculator-plugin.zip user@yoursite.com:/tmp/
   ssh user@yoursite.com
   cd /var/www/html/wp-content/plugins/
   unzip /tmp/irrigation-calculator-plugin.zip -d irrigation-calculator
   ```

3. **Activate in WordPress**
   - Go to WordPress Admin → Plugins
   - Find "Irrigation Schedule Calculator"
   - Click **Activate**

---

## ✅ Verify Installation

After uploading, check:

- ✅ Plugin appears in **Plugins** list
- ✅ Can activate without errors
- ✅ **Irrigation Calc** menu appears in admin sidebar
- ✅ Build files exist in `/wp-content/plugins/irrigation-calculator/build/`
- ✅ Shortcode works on frontend

---

## 🔧 If You Need to Create a Fresh ZIP

If `irrigation-calculator-plugin.zip` doesn't exist or is outdated:

```bash
# Navigate to React source directory
cd "Irrigation Schedule Calculator/src"

# Install dependencies (if needed)
npm install

# Build for WordPress
npm run build:wordpress

# Package the plugin
npm run package:plugin

# The ZIP will be created at:
# Irrigation Schedule Calculator/src/irrigation-calculator.zip
```

---

## 📁 File Structure in ZIP

The ZIP should contain:

```
irrigation-calculator/
├── irrigation-calculator.php    # Main plugin file ✅
├── readme.txt                   # WordPress readme ✅
└── build/                       # Compiled React assets ✅
    ├── app.js
    ├── app.css
    └── assets/
```

**❌ Should NOT contain:**
- Test files (`*test*.php`)
- Debug files
- Node modules
- Source code (.tsx files)

---

## 🚨 Troubleshooting

### "Plugin could not be activated because it triggered a fatal error"

**Check:**
- PHP version is 7.4 or higher
- WordPress version is 5.8 or higher
- Build files exist in `build/` folder

**Fix:**
- Rebuild the plugin: `npm run build:wordpress`
- Re-package: `npm run package:plugin`
- Upload fresh ZIP

### "Build files are missing"

**Check:**
- Open `/wp-content/plugins/irrigation-calculator/build/`
- Verify `app.js` and `app.css` exist

**Fix:**
- Rebuild and re-upload the plugin

### Calculator doesn't appear on frontend

**Check:**
- Browser console for JavaScript errors
- Plugin is activated
- Shortcode is correct: `[irrigation_calculator]`
- Page/post is published (not draft)

**Fix:**
- Clear WordPress cache
- Clear browser cache
- Check browser console for errors

---

## 📞 Need Help?

- Check the **README.md** for more details
- Review **PRODUCTION_READINESS_REPORT.md** for security info
- See **TESTING_GUIDE.md** for testing procedures

---

**✅ Ready to upload?** Use `irrigation-calculator-plugin.zip` from the root directory!


