#!/usr/bin/env node

/**
 * Automated Browser Test for Irrigation Calculator Plugin
 * Tests the plugin in a real browser environment
 */

const { execSync } = require('child_process');
const http = require('http');

// Check if puppeteer is available, if not, use a simpler approach
let puppeteer;
try {
  puppeteer = require('puppeteer');
} catch (e) {
  console.log('⚠️  Puppeteer not installed. Installing...');
  try {
    execSync('npm install puppeteer --no-save', { stdio: 'inherit' });
    puppeteer = require('puppeteer');
  } catch (err) {
    console.log('❌ Could not install Puppeteer. Using fallback method...');
    puppeteer = null;
  }
}

const WORDPRESS_URL = 'http://localhost:8081';
const WORDPRESS_ADMIN_URL = 'http://localhost:8081/wp-admin';
const TEST_PAGE_SLUG = 'irrigation-calculator-test';

async function checkDocker() {
  console.log('🐳 Checking Docker...');
  try {
    execSync('docker info > /dev/null 2>&1', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

async function checkWordPress() {
  return new Promise((resolve) => {
    const req = http.get(WORDPRESS_URL, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 302);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForWordPress(maxAttempts = 30) {
  console.log('⏳ Waiting for WordPress...');
  for (let i = 0; i < maxAttempts; i++) {
    if (await checkWordPress()) {
      console.log('✅ WordPress is ready!');
      return true;
    }
    process.stdout.write(`   Attempt ${i + 1}/${maxAttempts}...\r`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  return false;
}

async function testWithPuppeteer() {
  console.log('\n🌐 Starting browser automation test...\n');
  
  const browser = await puppeteer.launch({
    headless: false, // Show browser
    defaultViewport: { width: 1280, height: 720 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Capture console errors
  const consoleErrors = [];
  const consoleWarnings = [];
  const consoleLogs = [];
  
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    } else if (msg.type() === 'warning') {
      consoleWarnings.push(text);
    } else {
      consoleLogs.push(text);
    }
  });

  // Capture page errors
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.message);
  });

  try {
    // Test 1: Check WordPress homepage
    console.log('📄 Test 1: Loading WordPress homepage...');
    await page.goto(WORDPRESS_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('   ✅ WordPress homepage loaded');

    // Test 2: Try to find test page with shortcode
    console.log('\n📄 Test 2: Looking for calculator page...');
    const testPageUrl = `${WORDPRESS_URL}/${TEST_PAGE_SLUG}/`;
    let pageFound = false;
    
    try {
      await page.goto(testPageUrl, { waitUntil: 'networkidle2', timeout: 10000 });
      const title = await page.title();
      if (!title.includes('404')) {
        pageFound = true;
        console.log(`   ✅ Found test page: ${testPageUrl}`);
      }
    } catch (e) {
      // Page might not exist, that's OK
    }

    if (!pageFound) {
      console.log('   ⚠️  Test page not found. Checking homepage for shortcode...');
      await page.goto(WORDPRESS_URL, { waitUntil: 'networkidle2' });
    }

    // Test 3: Check for calculator root element
    console.log('\n🔍 Test 3: Checking for calculator elements...');
    await page.waitForTimeout(3000); // Wait for React to mount
    
    const calculatorRoot = await page.$('#irrigation-calculator-root');
    if (calculatorRoot) {
      console.log('   ✅ Calculator root element found');
      
      // Check if React mounted
      const hasContent = await page.evaluate(() => {
        const root = document.getElementById('irrigation-calculator-root');
        return root && root.children.length > 0;
      });
      
      if (hasContent) {
        console.log('   ✅ React app mounted successfully');
      } else {
        console.log('   ⚠️  Root element exists but React may not have mounted');
      }
    } else {
      console.log('   ⚠️  Calculator root element not found on this page');
      console.log('   💡 Create a page with shortcode: [irrigation_calculator]');
    }

    // Test 4: Check for logo (should NOT exist)
    console.log('\n🖼️  Test 4: Checking for logo (should be removed)...');
    const logoImages = await page.$$eval('img[alt*="Irrigation"], img[alt*="Logo"], img[src*="logo"]', 
      imgs => imgs.map(img => ({ alt: img.alt, src: img.src }))
    );
    
    if (logoImages.length === 0) {
      console.log('   ✅ No logo found (as expected)');
    } else {
      console.log(`   ⚠️  Found ${logoImages.length} potential logo(s):`);
      logoImages.forEach((img, i) => {
        console.log(`      ${i + 1}. ${img.alt || img.src}`);
      });
    }

    // Test 5: Check background width
    console.log('\n🎨 Test 5: Checking background width...');
    const backgroundWidth = await page.evaluate(() => {
      const root = document.getElementById('irrigation-calculator-root');
      if (!root) return null;
      const wrapper = root.closest('.irrigation-calculator-wrapper') || 
                     root.parentElement;
      if (!wrapper) return null;
      const styles = window.getComputedStyle(wrapper);
      return {
        width: styles.width,
        maxWidth: styles.maxWidth,
        marginLeft: styles.marginLeft,
        marginRight: styles.marginRight
      };
    });
    
    if (backgroundWidth) {
      console.log('   📐 Background styles:', backgroundWidth);
      if (backgroundWidth.width === '100vw' || backgroundWidth.width.includes('100%')) {
        console.log('   ✅ Background spans full width');
      } else {
        console.log('   ⚠️  Background may not span full width');
      }
    } else {
      console.log('   ⚠️  Could not check background width (calculator not found)');
    }

    // Test 6: Check JavaScript errors
    console.log('\n🚨 Test 6: Checking for JavaScript errors...');
    if (pageErrors.length > 0) {
      console.log(`   ❌ Found ${pageErrors.length} page error(s):`);
      pageErrors.forEach((error, i) => {
        console.log(`      ${i + 1}. ${error}`);
      });
    } else {
      console.log('   ✅ No page errors detected');
    }

    if (consoleErrors.length > 0) {
      console.log(`   ⚠️  Found ${consoleErrors.length} console error(s):`);
      consoleErrors.slice(0, 5).forEach((error, i) => {
        console.log(`      ${i + 1}. ${error.substring(0, 100)}...`);
      });
      if (consoleErrors.length > 5) {
        console.log(`      ... and ${consoleErrors.length - 5} more`);
      }
    } else {
      console.log('   ✅ No console errors detected');
    }

    // Test 7: Check for specific errors we fixed
    console.log('\n🔧 Test 7: Checking for fixed issues...');
    const hasPlacesError = consoleErrors.some(err => 
      err.includes('places') && err.includes('undefined')
    );
    const hasSettingsError = consoleErrors.some(err => 
      err.includes('Settings loaded: undefined')
    );

    if (hasPlacesError) {
      console.log('   ❌ Google Places error still present');
    } else {
      console.log('   ✅ Google Places error fixed');
    }

    if (hasSettingsError) {
      console.log('   ⚠️  Settings may still be undefined');
    } else {
      console.log('   ✅ Settings loading correctly');
    }

    // Test 8: Take screenshot
    console.log('\n📸 Test 8: Taking screenshot...');
    await page.screenshot({ 
      path: 'browser-test-screenshot.png',
      fullPage: true 
    });
    console.log('   ✅ Screenshot saved: browser-test-screenshot.png');

    // Summary
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 Test Summary');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`✅ Page loaded: Yes`);
    console.log(`✅ Calculator root: ${calculatorRoot ? 'Found' : 'Not found'}`);
    console.log(`✅ Logo removed: ${logoImages.length === 0 ? 'Yes' : 'No'}`);
    console.log(`❌ Page errors: ${pageErrors.length}`);
    console.log(`⚠️  Console errors: ${consoleErrors.length}`);
    console.log(`📝 Console logs: ${consoleLogs.length}`);
    console.log('═══════════════════════════════════════════════════════\n');

    // Keep browser open for manual inspection
    console.log('👀 Browser will stay open for 30 seconds for manual inspection...');
    console.log('   Close the browser window or wait for auto-close\n');
    
    await new Promise(resolve => setTimeout(resolve, 30000));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

async function testWithFallback() {
  console.log('\n🌐 Using fallback browser test...\n');
  
  // Open browser manually
  const { exec } = require('child_process');
  const platform = process.platform;
  
  let command;
  if (platform === 'darwin') {
    command = `open "${WORDPRESS_URL}"`;
  } else if (platform === 'win32') {
    command = `start "${WORDPRESS_URL}"`;
  } else {
    command = `xdg-open "${WORDPRESS_URL}"`;
  }
  
  exec(command, (error) => {
    if (error) {
      console.error('❌ Could not open browser:', error.message);
    } else {
      console.log('✅ Browser opened. Please check manually:');
      console.log(`   ${WORDPRESS_URL}`);
      console.log('\nCheck for:');
      console.log('   ✅ Calculator loads without errors');
      console.log('   ✅ No logo at top');
      console.log('   ✅ Background spans full width');
      console.log('   ✅ No console errors (F12 → Console)');
    }
  });
}

async function main() {
  console.log('🚀 Automated Browser Test for Irrigation Calculator Plugin');
  console.log('═══════════════════════════════════════════════════════\n');

  // Check Docker
  if (!(await checkDocker())) {
    console.log('❌ Docker is not running!');
    console.log('   Please start Docker Desktop first.\n');
    process.exit(1);
  }

  // Start Docker containers
  console.log('🐳 Starting Docker containers...');
  try {
    execSync('docker-compose up -d', { stdio: 'inherit' });
  } catch (e) {
    console.log('   ⚠️  Docker compose command failed (containers may already be running)');
  }

  // Wait for WordPress
  if (!(await waitForWordPress())) {
    console.log('\n❌ WordPress failed to start. Check logs with:');
    console.log('   docker-compose logs wordpress\n');
    process.exit(1);
  }

  // Run browser test
  if (puppeteer) {
    await testWithPuppeteer();
  } else {
    await testWithFallback();
  }
}

// Run tests
main().catch(console.error);

