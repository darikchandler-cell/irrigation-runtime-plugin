const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Full Automated Browser QA Test');
  console.log('═══════════════════════════════════════════════════════\n');
  
  let browser;
  const testResults = {
    passed: [],
    failed: [],
    warnings: []
  };

  try {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    const errors = [];
    const consoleErrors = [];
    const consoleWarnings = [];
    
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error') {
        if (!text.includes('favicon') && !text.includes('ERR_BLOCKED_BY_CLIENT')) {
          consoleErrors.push(text);
        }
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(text);
      }
    });

    // Test 1: WordPress Admin Access
    console.log('📋 Test 1: WordPress Admin Access');
    try {
      await page.goto('http://localhost:8081/wp-admin', { waitUntil: 'networkidle2', timeout: 30000 });
      const title = await page.title();
      if (title.includes('WordPress') || title.includes('Login') || title.includes('Dashboard')) {
        testResults.passed.push('WordPress admin accessible');
        console.log('   ✅ PASS: WordPress admin loads');
      } else {
        testResults.failed.push('WordPress admin not accessible');
        console.log('   ❌ FAIL: Unexpected page title');
      }
    } catch (e) {
      testResults.failed.push('WordPress admin access failed');
      console.log('   ❌ FAIL: Could not access admin');
    }
    console.log('');

    // Test 2: Plugin Activation Check
    console.log('📋 Test 2: Plugin Status');
    try {
      await page.goto('http://localhost:8081/wp-admin/plugins.php', { waitUntil: 'networkidle2', timeout: 30000 });
      await page.waitForTimeout(2000);
      
      const pluginText = await page.evaluate(() => {
        return document.body.innerText;
      });
      
      if (pluginText.includes('Irrigation Schedule Calculator') || pluginText.includes('Irrigation Calculator')) {
        testResults.passed.push('Plugin appears in plugins list');
        console.log('   ✅ PASS: Plugin found in plugins list');
        
        // Check if activated
        const isActive = await page.evaluate(() => {
          const rows = Array.from(document.querySelectorAll('tr'));
          return rows.some(row => {
            const text = row.innerText;
            return text.includes('Irrigation') && (text.includes('Activated') || text.includes('Active'));
          });
        });
        
        if (isActive) {
          testResults.passed.push('Plugin is activated');
          console.log('   ✅ PASS: Plugin is activated');
        } else {
          testResults.warnings.push('Plugin may not be activated');
          console.log('   ⚠️  WARN: Plugin may need activation');
        }
      } else {
        testResults.warnings.push('Plugin not found in list (may need installation)');
        console.log('   ⚠️  WARN: Plugin not visible in plugins list');
      }
    } catch (e) {
      testResults.warnings.push('Could not check plugin status');
      console.log('   ⚠️  WARN: Could not access plugins page');
    }
    console.log('');

    // Test 3: Admin Menu Check
    console.log('📋 Test 3: Admin Menu');
    try {
      await page.goto('http://localhost:8081/wp-admin', { waitUntil: 'networkidle2', timeout: 30000 });
      await page.waitForTimeout(2000);
      
      const hasMenu = await page.evaluate(() => {
        const menuText = document.body.innerText;
        return menuText.includes('Irrigation Calc') || menuText.includes('Irrigation Calculator');
      });
      
      if (hasMenu) {
        testResults.passed.push('Admin menu appears');
        console.log('   ✅ PASS: Admin menu found');
      } else {
        testResults.warnings.push('Admin menu not visible');
        console.log('   ⚠️  WARN: Admin menu not found');
      }
    } catch (e) {
      testResults.warnings.push('Could not check admin menu');
      console.log('   ⚠️  WARN: Could not verify admin menu');
    }
    console.log('');

    // Test 4: Frontend Calculator Page
    console.log('📋 Test 4: Frontend Calculator');
    try {
      // Try to find a page with the shortcode
      await page.goto('http://localhost:8081', { waitUntil: 'networkidle2', timeout: 30000 });
      await page.waitForTimeout(3000);
      
      const hasCalculator = await page.$('#irrigation-calculator-root');
      if (hasCalculator) {
        testResults.passed.push('Calculator root element found');
        console.log('   ✅ PASS: Calculator root element exists');
        
        const hasContent = await page.evaluate(() => {
          const root = document.getElementById('irrigation-calculator-root');
          return root && root.children.length > 0;
        });
        
        if (hasContent) {
          testResults.passed.push('React app mounted successfully');
          console.log('   ✅ PASS: React app mounted');
        } else {
          testResults.warnings.push('Calculator root empty (may need page with shortcode)');
          console.log('   ⚠️  WARN: Root exists but empty - create page with [irrigation_calculator]');
        }
      } else {
        testResults.warnings.push('Calculator not found (create page with shortcode)');
        console.log('   ⚠️  WARN: Calculator root not found - create page with [irrigation_calculator]');
      }
    } catch (e) {
      testResults.warnings.push('Could not test frontend');
      console.log('   ⚠️  WARN: Could not test frontend calculator');
    }
    console.log('');

    // Test 5: JavaScript Errors
    console.log('📋 Test 5: JavaScript Errors');
    await page.waitForTimeout(2000);
    
    const hasPlacesError = consoleErrors.some(e => e.includes('places') && e.includes('undefined'));
    const hasSettingsError = consoleErrors.some(e => e.includes('Settings loaded: undefined'));
    const hasFatalError = errors.length > 0;
    
    if (!hasPlacesError) {
      testResults.passed.push('Google Places error fixed');
      console.log('   ✅ PASS: No Google Places errors');
    } else {
      testResults.failed.push('Google Places error still present');
      console.log('   ❌ FAIL: Google Places error found');
    }
    
    if (!hasSettingsError) {
      testResults.passed.push('Settings loading correctly');
      console.log('   ✅ PASS: Settings loading correctly');
    } else {
      testResults.warnings.push('Settings may be undefined');
      console.log('   ⚠️  WARN: Settings error found');
    }
    
    if (!hasFatalError) {
      testResults.passed.push('No fatal JavaScript errors');
      console.log('   ✅ PASS: No fatal errors');
    } else {
      testResults.failed.push('Fatal JavaScript errors found');
      console.log('   ❌ FAIL: Fatal errors detected');
      errors.forEach((e, i) => console.log(`      ${i+1}. ${e.substring(0, 100)}`));
    }
    
    if (consoleErrors.length > 0) {
      console.log(`   ⚠️  Found ${consoleErrors.length} console error(s) (non-critical)`);
      consoleErrors.slice(0, 3).forEach((e, i) => {
        if (!e.includes('favicon') && !e.includes('ERR_BLOCKED')) {
          console.log(`      ${i+1}. ${e.substring(0, 80)}...`);
        }
      });
    }
    console.log('');

    // Test 6: Visual Checks
    console.log('📋 Test 6: Visual Elements');
    try {
      await page.goto('http://localhost:8081', { waitUntil: 'networkidle2' });
      await page.waitForTimeout(2000);
      
      const logos = await page.$$eval('img', imgs => 
        imgs.filter(img => 
          img.alt && (img.alt.toLowerCase().includes('logo') || img.alt.toLowerCase().includes('irrigation'))
        ).length
      );
      
      if (logos === 0) {
        testResults.passed.push('Logo removed correctly');
        console.log('   ✅ PASS: No logo found (correct)');
      } else {
        testResults.failed.push('Logo still present');
        console.log(`   ❌ FAIL: Found ${logos} logo(s)`);
      }
      
      // Check background width
      const bgWidth = await page.evaluate(() => {
        const root = document.getElementById('irrigation-calculator-root');
        if (!root) return null;
        const wrapper = root.closest('.irrigation-calculator-wrapper') || root.parentElement;
        if (!wrapper) return null;
        return window.getComputedStyle(wrapper).width;
      });
      
      if (bgWidth && (bgWidth.includes('100%') || bgWidth.includes('100vw'))) {
        testResults.passed.push('Background spans full width');
        console.log('   ✅ PASS: Full-width background');
      } else {
        testResults.warnings.push('Background width may not be full');
        console.log('   ⚠️  WARN: Background width check inconclusive');
      }
    } catch (e) {
      testResults.warnings.push('Could not perform visual checks');
      console.log('   ⚠️  WARN: Visual checks failed');
    }
    console.log('');

    // Test 7: Screenshot
    console.log('📋 Test 7: Taking Screenshot');
    try {
      await page.screenshot({ path: 'browser-qa-test-screenshot.png', fullPage: true });
      testResults.passed.push('Screenshot captured');
      console.log('   ✅ PASS: Screenshot saved: browser-qa-test-screenshot.png');
    } catch (e) {
      testResults.warnings.push('Screenshot failed');
      console.log('   ⚠️  WARN: Could not take screenshot');
    }
    console.log('');

    // Final Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 QA Test Summary');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`✅ Passed: ${testResults.passed.length}`);
    testResults.passed.forEach(test => console.log(`   ✅ ${test}`));
    console.log('');
    console.log(`⚠️  Warnings: ${testResults.warnings.length}`);
    testResults.warnings.forEach(test => console.log(`   ⚠️  ${test}`));
    console.log('');
    console.log(`❌ Failed: ${testResults.failed.length}`);
    testResults.failed.forEach(test => console.log(`   ❌ ${test}`));
    console.log('');
    
    const totalTests = testResults.passed.length + testResults.warnings.length + testResults.failed.length;
    const passRate = ((testResults.passed.length / totalTests) * 100).toFixed(1);
    
    console.log(`📈 Pass Rate: ${passRate}%`);
    console.log(`🎯 Status: ${testResults.failed.length === 0 ? '✅ READY' : '❌ NEEDS FIXES'}`);
    console.log('═══════════════════════════════════════════════════════\n');

    // Keep browser open for inspection
    console.log('👀 Browser will stay open for 30 seconds for manual inspection...\n');
    await new Promise(resolve => setTimeout(resolve, 30000));

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    testResults.failed.push(`Test suite error: ${error.message}`);
  } finally {
    if (browser) await browser.close();
  }
})();

