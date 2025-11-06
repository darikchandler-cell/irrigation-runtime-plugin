# Quick Start: Testing the Fixed Plugin

## ⚠️ Docker Required

Docker Desktop must be running to test the plugin locally.

## 🚀 Steps to Test

### 1. Start Docker Desktop
- Open **Docker Desktop** application on your Mac
- Wait for it to fully start (green icon in menu bar)
- Verify it's running: Docker icon should be active in menu bar

### 2. Run Test Script
```bash
cd /Users/workstationa/Library/CloudStorage/OneDrive-Personal/Cursor/irrigation-runtime-plugin
./test-plugin.sh
```

### 3. Start WordPress Containers
```bash
docker-compose up -d
```

Wait ~10-15 seconds for containers to start.

### 4. Access WordPress
- **Admin**: http://localhost:8081/wp-admin
- **Site**: http://localhost:8081

### 5. Activate Plugin
1. Go to **Plugins → Installed Plugins**
2. Find **"Irrigation Schedule Calculator"**
3. Click **"Activate"**
4. ✅ **Should activate WITHOUT white screen**

### 6. Verify It Works
- ✅ Check for "Irrigation Calc" menu in admin sidebar
- ✅ Click "Settings" - should show settings form
- ✅ Click "Analytics" - should load (may be blank if no data)
- ✅ Create a page with `[irrigation_calculator]` shortcode
- ✅ View page - calculator should render

## 🔍 If Docker Won't Start

**Check Docker Desktop:**
- Open Docker Desktop app
- Check if it's running (green icon)
- If not, click "Start" button
- Wait for "Docker Desktop is running" message

**Troubleshoot:**
```bash
# Check Docker status
docker ps

# If error, check Docker Desktop is installed
open -a Docker
```

## ✅ Static Validation (Already Done)

These checks have already been completed:
- ✅ PHP syntax is valid
- ✅ All required files exist
- ✅ Code fix applied (admin assets)
- ✅ Plugin structure is correct

## 📝 What to Look For

### ✅ Success Indicators:
- Plugin activates without white screen
- Admin menu appears
- No PHP errors in logs
- No JavaScript errors in browser console

### ❌ Failure Indicators:
- White screen after activation
- Plugin not appearing in plugins list
- PHP errors in WordPress logs
- JavaScript errors in browser console

## 🐛 If Issues Persist

**Check WordPress logs:**
```bash
docker-compose logs wordpress | grep -i error
```

**Check browser console:**
- Press F12 to open developer tools
- Look for red error messages in Console tab

**Check file permissions:**
```bash
docker exec irrigation-calc-wordpress ls -la /var/www/html/wp-content/plugins/irrigation-calculator/
```

---

**Status**: Code fix is complete. Ready for Docker testing.


