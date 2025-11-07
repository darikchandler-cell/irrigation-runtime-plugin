const puppeteer = require('puppeteer');

(async () => {
  console.log('🌐 Starting Quick Browser Test...\n');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    const errors = [];
    const consoleErrors = [];
    
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Test 1: Load WordPress homepage
    console.log('📄 Test 1: Loading WordPress...');
    await page.goto('http://localhost:8081', { waitUntil: 'networkidle2', timeout: 30000 });
    const title = await page.title();
    console.log(`   ✅ WordPress loaded: "${title}"\n`);

    // Test 2: Check for calculator root
    console.log('🔍 Test 2: Checking for calculator...');
    await page.waitForTimeout(3000);
    const root = await page.$('#irrigation-calculator-root');
    if (root) {
      console.log('   ✅ Calculator root element found');
      const hasContent = await page.evaluate(() => {
        const root = document.getElementById('irrigation-calculator-root');
        return root && root.children.length > 0;
      });
      console.log(hasContent ? '   ✅ React app mounted' : '   ⚠️  Root exists but empty (create page with shortcode)');
    } else {
      console.log('   ⚠️  Calculator root not found');
      console.log('   💡 Create a page with: [irrigation_calculator]');
    }
    console.log('');

    // Test 3: Check for logo (should NOT exist)
    console.log('🖼️  Test 3: Checking for logo...');
    const logos = await page.$$eval('img', imgs => 
      imgs.filter(img => 
        img.alt.toLowerCase().includes('logo') || 
        img.alt.toLowerCase().includes('irrigation') ||
        img.src.includes('logo')
      ).map(img => ({ alt: img.alt, src: img.src.substring(0, 50) }))
    );
    console.log(logos.length === 0 ? '   ✅ No logo found (correct!)' : `   ⚠️  Found ${logos.length} logo(s)`);
    console.log('');

    // Test 4: Check errors
    console.log('🚨 Test 4: Checking for errors...');
    await page.waitForTimeout(2000);
    console.log(`   Page errors: ${errors.length}`);
    console.log(`   Console errors: ${consoleErrors.length}`);
    
    if (errors.length > 0) {
      console.log('   ❌ Page errors found:');
      errors.slice(0, 3).forEach((e, i) => console.log(`      ${i+1}. ${e.substring(0, 100)}`));
    }
    
    if (consoleErrors.length > 0) {
      console.log('   ⚠️  Console errors:');
      consoleErrors.slice(0, 5).forEach((e, i) => {
        if (!e.includes('favicon') && !e.includes('ERR_BLOCKED_BY_CLIENT')) {
          console.log(`      ${i+1}. ${e.substring(0, 100)}`);
        }
      });
    }
    
    // Check for specific fixed issues
    const hasPlacesError = consoleErrors.some(e => e.includes('places') && e.includes('undefined'));
    const hasSettingsError = consoleErrors.some(e => e.includes('Settings loaded: undefined'));
    
    console.log('');
    console.log('🔧 Test 5: Verifying fixes...');
    console.log(hasPlacesError ? '   ❌ Google Places error still present' : '   ✅ Google Places error fixed');
    console.log(hasSettingsError ? '   ⚠️  Settings may be undefined' : '   ✅ Settings loading correctly');
    console.log('');

    // Test 5: Take screenshot
    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: 'browser-test-screenshot.png', fullPage: true });
    console.log('   ✅ Screenshot saved: browser-test-screenshot.png\n');

    // Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 Test Summary');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`✅ WordPress: Accessible`);
    console.log(`✅ Calculator Root: ${root ? 'Found' : 'Not found (create page)'}`);
    console.log(`✅ Logo Removed: ${logos.length === 0 ? 'Yes' : 'No'}`);
    console.log(`❌ Page Errors: ${errors.length}`);
    console.log(`⚠️  Console Errors: ${consoleErrors.filter(e => !e.includes('favicon') && !e.includes('ERR_BLOCKED')).length}`);
    console.log(`✅ Google Places Fix: ${!hasPlacesError ? 'Working' : 'Failed'}`);
    console.log(`✅ Settings Fix: ${!hasSettingsError ? 'Working' : 'Failed'}`);
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('👀 Browser will stay open for 20 seconds...');
    await new Promise(resolve => setTimeout(resolve, 20000));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) await browser.close();
  }
})();

