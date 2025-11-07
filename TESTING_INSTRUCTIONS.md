# Testing Irrigation Calculator Plugin in Local WordPress

## Prerequisites

1. **Docker Desktop** must be installed and running
   - Download from: https://www.docker.com/products/docker-desktop
   - Make sure Docker Desktop is running (check for whale icon in menu bar)

2. **Build files** must be present in `irrigation-calculator-plugin/build/`

## Quick Start

### Option 1: Use the Test Script (Recommended)

```bash
./test-wordpress-local.sh
```

This script will:
- Check if Docker is running
- Copy build files if needed
- Start WordPress containers
- Wait for WordPress to be ready
- Provide testing instructions

### Option 2: Manual Steps

1. **Start Docker Desktop** (if not already running)

2. **Start WordPress containers:**
   ```bash
   docker-compose up -d
   ```

3. **Wait for WordPress to be ready** (about 10-30 seconds):
   ```bash
   # Check if WordPress is running
   curl http://localhost:8081
   ```

4. **Access WordPress:**
   - **Site:** http://localhost:8081
   - **Admin:** http://localhost:8081/wp-admin
   - **phpMyAdmin:** http://localhost:8080

## Testing Steps

1. **Access WordPress Admin:**
   - Go to http://localhost:8081/wp-admin
   - If this is a fresh install, you'll need to complete the WordPress setup
   - Default credentials (if already set up):
     - Username: `admin`
     - Password: `admin`

2. **Activate the Plugin:**
   - Navigate to **Plugins → Installed Plugins**
   - Find **"Irrigation Schedule Calculator"**
   - Click **"Activate"**

3. **Create a Test Page:**
   - Go to **Pages → Add New**
   - Title: "Irrigation Calculator Test"
   - Add shortcode: `[irrigation_calculator]`
   - Click **"Publish"**

4. **View the Page:**
   - Click **"View Page"** or visit the page URL
   - Open browser Developer Tools (F12)
   - Check Console tab for any errors

5. **Test the Calculator:**
   - Verify the landing page loads without logo
   - Verify background spans full width
   - Click "Start Saving Water Now"
   - Go through the wizard steps
   - Check that Google Places API doesn't cause errors (if not configured)

## Troubleshooting

### Docker Not Running
```bash
# Check Docker status
docker info

# If error, start Docker Desktop application
```

### WordPress Not Accessible
```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs wordpress

# Restart containers
docker-compose restart
```

### Plugin Not Appearing
- Make sure `irrigation-calculator-plugin` folder exists in project root
- Verify build files exist: `irrigation-calculator-plugin/build/app.js`
- Check WordPress debug log: `docker-compose logs wordpress | grep -i error`

### Build Files Missing
```bash
# Rebuild the plugin
cd "Irrigation Schedule Calculator"
npm run build

# Copy files to plugin directory
cd ..
mkdir -p irrigation-calculator-plugin/build
cp "Irrigation Schedule Calculator/build/app.js" irrigation-calculator-plugin/build/
cp "Irrigation Schedule Calculator/build/app.css" irrigation-calculator-plugin/build/
cp -r "Irrigation Schedule Calculator/build/assets" irrigation-calculator-plugin/build/
```

### Clear WordPress Cache
If you see old code:
```bash
# Restart WordPress container
docker-compose restart wordpress

# Or rebuild containers
docker-compose down
docker-compose up -d
```

## Useful Commands

```bash
# View all logs
docker-compose logs

# View WordPress logs only
docker-compose logs wordpress

# Stop containers
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v

# Restart containers
docker-compose restart

# Access WordPress container shell
docker exec -it irrigation-calc-wordpress bash

# Access MySQL
docker exec -it irrigation-calc-mysql mysql -u wordpress -pwordpress wordpress
```

## Expected Results

✅ **Landing Page:**
- No logo at the top
- Background gradient spans full width
- All sections visible and functional

✅ **Calculator Wizard:**
- Step 1: Watering Restrictions loads correctly
- Location input works (Google Places if configured, or manual entry)
- No console errors about "places" property

✅ **Settings Page (Admin):**
- Accessible at: Irrigation Calc → Settings
- Settings load correctly
- No "Settings loaded: undefined" errors

✅ **Analytics Page (Admin):**
- Accessible at: Irrigation Calc → Analytics
- Dashboard loads without errors

## Next Steps

After confirming everything works locally:
1. Test all calculator features
2. Test admin settings and analytics
3. Verify email functionality (if configured)
4. Test on staging/production environment

