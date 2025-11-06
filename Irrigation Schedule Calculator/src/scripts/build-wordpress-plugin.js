/**
 * Build WordPress Plugin
 * 
 * This script builds the React app and packages it for WordPress
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper functions to replace fs-extra functionality
const ensureDirSync = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const emptyDirSync = (dir) => {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        emptyDirSync(filePath);
        fs.rmdirSync(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    });
  }
};

const copySync = (src, dest) => {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    ensureDirSync(dest);
    const files = fs.readdirSync(src);
    files.forEach(file => {
      copySync(path.join(src, file), path.join(dest, file));
    });
  } else {
    ensureDirSync(path.dirname(dest));
    fs.copyFileSync(src, dest);
  }
};

const removeSync = (filePath) => {
  if (fs.existsSync(filePath)) {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      emptyDirSync(filePath);
      fs.rmdirSync(filePath);
    } else {
      fs.unlinkSync(filePath);
    }
  }
};

const distDir = path.join(__dirname, '../../build');
const pluginDir = path.join(__dirname, '../wordpress-plugin');
const buildDir = path.join(pluginDir, 'build');

console.log('🚀 Building WordPress Plugin...\n');

// Step 1: Build React app
console.log('📦 Step 1/4: Building React application...');
try {
  execSync('npm run build', { stdio: 'inherit', cwd: path.join(__dirname, '../..') });
  console.log('✅ React build complete\n');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 2: Create build directory
console.log('📁 Step 2/4: Creating plugin build directory...');
ensureDirSync(buildDir);
emptyDirSync(buildDir);
console.log('✅ Build directory ready\n');

// Step 3: Copy and rename dist files
console.log('📋 Step 3/4: Copying build files...');

try {
  // Copy entire dist to build
  copySync(distDir, buildDir);
  
  // Find and rename main JS file to app.js
  const assetsDir = path.join(buildDir, 'assets');
  if (fs.existsSync(assetsDir)) {
    const files = fs.readdirSync(assetsDir);
    
    // Find main JS file (not a chunk)
    const mainJs = files.find(f => f.match(/^index-.*\.js$/) || f.match(/^main-.*\.js$/));
    if (mainJs) {
      copySync(
        path.join(assetsDir, mainJs),
        path.join(buildDir, 'app.js')
      );
      console.log(`  ✓ Copied ${mainJs} → app.js`);
    }
    
    // Find main CSS file
    const mainCss = files.find(f => f.match(/^index-.*\.css$/) || f.match(/^main-.*\.css$/));
    if (mainCss) {
      copySync(
        path.join(assetsDir, mainCss),
        path.join(buildDir, 'app.css')
      );
      console.log(`  ✓ Copied ${mainCss} → app.css`);
    }
    
    // Keep assets folder for images/fonts
    console.log(`  ✓ Copied assets directory`);
  }
  
  // Copy index.html as reference (optional)
  if (fs.existsSync(path.join(buildDir, 'index.html'))) {
    removeSync(path.join(buildDir, 'index.html'));
  }
  
  console.log('✅ Build files copied successfully\n');
} catch (error) {
  console.error('❌ Copy failed:', error.message);
  process.exit(1);
}

// Step 4: Create README in build dir
console.log('📝 Step 4/4: Creating build info...');
const buildInfo = {
  buildDate: new Date().toISOString(),
  version: '1.0.0',
  files: {
    main: 'app.js',
    styles: 'app.css',
    assets: 'assets/',
  },
  instructions: 'Upload the wordpress-plugin folder to wp-content/plugins/ and activate in WordPress admin.',
};

fs.writeFileSync(
  path.join(buildDir, 'build-info.json'),
  JSON.stringify(buildInfo, null, 2)
);
console.log('✅ Build info created\n');

// Final summary
console.log('═══════════════════════════════════════');
console.log('✨ WordPress Plugin Build Complete! ✨');
console.log('═══════════════════════════════════════\n');

console.log('📂 Plugin location:');
console.log(`   ${pluginDir}\n`);

console.log('📦 Next steps:');
console.log('   1. Copy wordpress-plugin/ folder to WordPress');
console.log('   2. Place in: wp-content/plugins/irrigation-calculator/');
console.log('   3. Activate plugin in WordPress admin');
console.log('   4. Configure API keys in Settings');
console.log('   5. Add shortcode [irrigation_calculator] to any page\n');

console.log('🔑 Required API Keys:');
console.log('   • OpenWeatherMap API (https://openweathermap.org/api)');
console.log('   • Google Places API (https://console.cloud.google.com)\n');

console.log('═══════════════════════════════════════\n');
