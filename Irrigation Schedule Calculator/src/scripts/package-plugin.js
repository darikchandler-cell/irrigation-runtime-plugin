/**
 * Package WordPress Plugin as ZIP
 * 
 * Creates a production-ready ZIP file for WordPress plugin installation
 */

const fs = require('fs-extra');
const archiver = require('archiver');
const path = require('path');

const pluginDir = path.join(__dirname, '../wordpress-plugin');
const outputDir = path.join(__dirname, '../');
const zipPath = path.join(outputDir, 'irrigation-calculator.zip');

console.log('📦 Packaging WordPress Plugin...\n');

// Check if build exists
const buildDir = path.join(pluginDir, 'build');
if (!fs.existsSync(buildDir) || !fs.existsSync(path.join(buildDir, 'app.js'))) {
  console.error('❌ Error: Build files not found!');
  console.error('   Run: npm run build:wordpress first\n');
  process.exit(1);
}

// Remove old zip if exists
if (fs.existsSync(zipPath)) {
  fs.removeSync(zipPath);
}

// Create zip file
const output = fs.createWriteStream(zipPath);
const archive = archiver('zip', {
  zlib: { level: 9 } // Maximum compression
});

let fileCount = 0;

output.on('close', () => {
  const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
  
  console.log('═══════════════════════════════════════');
  console.log('✨ Plugin Packaged Successfully! ✨');
  console.log('═══════════════════════════════════════\n');
  
  console.log(`📦 File: irrigation-calculator.zip`);
  console.log(`📊 Size: ${sizeInMB} MB`);
  console.log(`📁 Files: ${fileCount}\n`);
  
  console.log('🚀 Installation Instructions:');
  console.log('   1. Go to WordPress Admin → Plugins → Add New');
  console.log('   2. Click "Upload Plugin"');
  console.log('   3. Choose irrigation-calculator.zip');
  console.log('   4. Click "Install Now" → "Activate Plugin"');
  console.log('   5. Go to Irrigation Calc → Settings');
  console.log('   6. Add API keys and configure email');
  console.log('   7. Add [irrigation_calculator] shortcode to a page\n');
  
  console.log('═══════════════════════════════════════\n');
});

archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    console.warn('⚠️  Warning:', err);
  } else {
    throw err;
  }
});

archive.on('error', (err) => {
  console.error('❌ Error creating ZIP:', err);
  throw err;
});

archive.on('entry', (entry) => {
  fileCount++;
});

// Pipe archive data to the file
archive.pipe(output);

// Add all plugin files
console.log('Adding files to archive...');

// Add main plugin file
archive.file(path.join(pluginDir, 'irrigation-calculator.php'), {
  name: 'irrigation-calculator/irrigation-calculator.php'
});
console.log('  ✓ irrigation-calculator.php');

// Add README
archive.file(path.join(pluginDir, 'README.md'), {
  name: 'irrigation-calculator/README.md'
});
console.log('  ✓ README.md');

// Add deployment guide
archive.file(path.join(pluginDir, 'WORDPRESS_DEPLOYMENT.md'), {
  name: 'irrigation-calculator/WORDPRESS_DEPLOYMENT.md'
});
console.log('  ✓ WORDPRESS_DEPLOYMENT.md');

// Add entire build directory
archive.directory(buildDir, 'irrigation-calculator/build');
console.log('  ✓ build/ directory');

// Create languages directory (even if empty)
fs.ensureDirSync(path.join(pluginDir, 'languages'));
archive.directory(path.join(pluginDir, 'languages'), 'irrigation-calculator/languages');
console.log('  ✓ languages/ directory');

// Add screenshot if exists
const screenshotPath = path.join(pluginDir, 'screenshot.png');
if (fs.existsSync(screenshotPath)) {
  archive.file(screenshotPath, {
    name: 'irrigation-calculator/screenshot.png'
  });
  console.log('  ✓ screenshot.png');
}

console.log('\n⏳ Compressing files...\n');

// Finalize the archive
archive.finalize();
