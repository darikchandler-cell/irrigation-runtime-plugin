# Automated Browser Testing

## Quick Start

Run the automated browser test:

```bash
./run-browser-test.sh
```

This script will:
1. ✅ Check if Docker is running
2. ✅ Start WordPress containers
3. ✅ Wait for WordPress to be ready
4. ✅ Launch automated browser tests
5. ✅ Take screenshots
6. ✅ Report errors and issues

## What Gets Tested

### Automated Checks:
- ✅ WordPress loads correctly
- ✅ Calculator root element exists
- ✅ React app mounts successfully
- ✅ Logo is removed (should not exist)
- ✅ Background spans full width
- ✅ No JavaScript errors
- ✅ No Google Places API errors
- ✅ Settings load correctly

### Visual Verification:
- 📸 Screenshot saved to `browser-test-screenshot.png`
- 🌐 Browser stays open for 30 seconds for manual inspection

## Manual Testing

After automated tests complete:

1. **Check the Screenshot:**
   - Open `browser-test-screenshot.png`
   - Verify layout looks correct

2. **Test the Calculator:**
   - Visit: http://localhost:8081
   - Look for page with `[irrigation_calculator]` shortcode
   - Or create a new page with the shortcode

3. **Check Browser Console:**
   - Open Developer Tools (F12)
   - Check Console tab for errors
   - Should see: "Irrigation Calculator: Mounting App component"

4. **Test Features:**
   - Click "Start Saving Water Now"
   - Go through wizard steps
   - Verify no errors occur

## Troubleshooting

### Docker Not Running
```bash
# Start Docker Desktop, then:
./run-browser-test.sh
```

### Puppeteer Installation Issues
```bash
# Install manually:
npm install puppeteer
```

### WordPress Not Starting
```bash
# Check logs:
docker-compose logs wordpress

# Restart:
docker-compose restart
```

### Test Page Not Found
Create a test page manually:
1. Go to http://localhost:8081/wp-admin
2. Pages → Add New
3. Add shortcode: `[irrigation_calculator]`
4. Publish

## Test Output

The script provides detailed output:
- ✅ Green checkmarks for passed tests
- ⚠️ Yellow warnings for potential issues
- ❌ Red X for failures
- 📊 Summary at the end

## Continuous Testing

For CI/CD, run in headless mode by modifying `automate-browser-test.js`:

```javascript
const browser = await puppeteer.launch({
  headless: true, // Change to true for CI
  // ...
});
```

