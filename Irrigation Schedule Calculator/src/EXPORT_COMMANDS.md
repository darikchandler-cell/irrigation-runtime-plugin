# WordPress Export Commands

## Single Command Export (Recommended)

```bash
npm run package:plugin
```

This command will:
1. ✅ Build the React application (`npm run build`)
2. ✅ Copy files to WordPress plugin structure
3. ✅ Create `irrigation-calculator.zip` ready for upload

**Output**: `irrigation-calculator.zip` in the root directory

---

## Step-by-Step Commands

If you prefer to run each step individually:

### 1. Build React App

```bash
npm run build
```

Creates optimized production build in `/dist` folder.

### 2. Build WordPress Plugin

```bash
npm run build:wordpress
```

Copies build files to `/wordpress-plugin/build/` and renames for WordPress.

### 3. Package as ZIP (optional)

```bash
node scripts/package-plugin.js
```

Creates `irrigation-calculator.zip` from the plugin folder.

---

## Installation Commands

### Upload to WordPress Server (via SSH/FTP)

```bash
# Upload the plugin folder
scp -r wordpress-plugin/ user@yoursite.com:/var/www/html/wp-content/plugins/irrigation-calculator/

# Or upload the ZIP and extract
scp irrigation-calculator.zip user@yoursite.com:/tmp/
ssh user@yoursite.com
cd /var/www/html/wp-content/plugins/
unzip /tmp/irrigation-calculator.zip
```

### Using WP-CLI

```bash
# Upload and install
wp plugin install irrigation-calculator.zip --activate

# Or if already uploaded to plugins directory
wp plugin activate irrigation-calculator
```

---

## Verification Commands

### Check Build Output

```bash
# List build files
ls -la wordpress-plugin/build/

# Should show:
# - app.js
# - app.css
# - assets/
# - build-info.json
```

### Verify ZIP Contents

```bash
# List contents of ZIP
unzip -l irrigation-calculator.zip

# Should contain:
# irrigation-calculator/
#   ├── irrigation-calculator.php
#   ├── README.md
#   ├── build/
#   └── languages/
```

---

## Development Commands

### Watch Mode (for development)

```bash
npm run dev
```

Starts Vite dev server at `http://localhost:5173`

### Preview Production Build

```bash
npm run build
npm run preview
```

Preview the production build locally before WordPress deployment.

---

## Clean Build Commands

### Remove Old Builds

```bash
# Remove dist folder
rm -rf dist/

# Remove WordPress build
rm -rf wordpress-plugin/build/

# Remove ZIP
rm -f irrigation-calculator.zip
```

### Fresh Build

```bash
# Clean and rebuild everything
rm -rf dist/ wordpress-plugin/build/ irrigation-calculator.zip
npm run package:plugin
```

---

## NPM Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build React app for production |
| `npm run build:wordpress` | Build and prepare for WordPress |
| `npm run package:plugin` | Build + package as ZIP |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## Quick Reference

**Fastest Export**:
```bash
npm run package:plugin
```

**Upload to WordPress**:
1. Go to WordPress Admin → Plugins → Add New
2. Click "Upload Plugin"
3. Choose `irrigation-calculator.zip`
4. Click "Install Now" → "Activate"

**Add to Page**:
```
[irrigation_calculator]
```

---

## Troubleshooting Build Commands

### Missing Dependencies

```bash
npm install
```

### Permission Errors

```bash
# Make script executable
chmod +x scripts/build-wordpress-plugin.js
chmod +x scripts/package-plugin.js
```

### Build Fails

```bash
# Check Node version (need 16+)
node --version

# Clear cache and rebuild
rm -rf node_modules/
npm install
npm run build
```

### ZIP Creation Fails

```bash
# Install archiver if missing
npm install archiver --save-dev

# Run packaging script directly
node scripts/package-plugin.js
```

---

## Environment-Specific Builds

### Development Build

```bash
npm run dev
```

Local development with hot reload.

### Production Build

```bash
npm run build
```

Optimized, minified production build.

### WordPress Build

```bash
npm run build:wordpress
```

Production build + WordPress plugin structure.

---

## File Size Optimization

Check build sizes:

```bash
# After building
du -sh dist/
du -sh wordpress-plugin/build/
du -sh irrigation-calculator.zip
```

Typical sizes:
- React build: ~500KB - 1MB
- WordPress plugin (ZIP): ~1-2MB

---

## Deployment Workflow

**Local Development → WordPress**

```bash
# 1. Test locally
npm run dev

# 2. Build for production
npm run build

# 3. Test production build
npm run preview

# 4. Package for WordPress
npm run package:plugin

# 5. Upload irrigation-calculator.zip to WordPress

# 6. Activate and configure
```

---

## CI/CD Integration

For automated builds:

```yaml
# Example GitHub Actions
- name: Build WordPress Plugin
  run: |
    npm install
    npm run package:plugin
    
- name: Upload Artifact
  uses: actions/upload-artifact@v2
  with:
    name: wordpress-plugin
    path: irrigation-calculator.zip
```

---

## Command Aliases (Optional)

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
# Quick WordPress build
alias wpbuild="npm run package:plugin"

# Deploy to local WordPress
alias wpdeploy="npm run package:plugin && cp irrigation-calculator.zip ~/Local\ Sites/mysite/app/public/wp-content/plugins/"
```

---

That's it! Use `npm run package:plugin` and you're ready to deploy to WordPress! 🚀
