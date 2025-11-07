const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  console.log('📸 Taking Screenshots to Verify Plugin Works\n');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true, // Use headless for screenshots
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Screenshot 1: WordPress Admin
    console.log('📸 Screenshot 1: WordPress Admin...');
    try {
      await page.goto('http://localhost:8081/wp-admin', { waitUntil: 'networkidle2', timeout: 30000 });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screenshot-1-wordpress-admin.png', fullPage: true });
      console.log('   ✅ Saved: screenshot-1-wordpress-admin.png');
    } catch (e) {
      console.log('   ⚠️  Could not access admin (may need login)');
    }

    // Screenshot 2: Plugins Page
    console.log('📸 Screenshot 2: Plugins Page...');
    try {
      await page.goto('http://localhost:8081/wp-admin/plugins.php', { waitUntil: 'networkidle2', timeout: 30000 });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screenshot-2-plugins-page.png', fullPage: true });
      console.log('   ✅ Saved: screenshot-2-plugins-page.png');
    } catch (e) {
      console.log('   ⚠️  Could not access plugins page');
    }

    // Screenshot 3: Homepage
    console.log('📸 Screenshot 3: WordPress Homepage...');
    try {
      await page.goto('http://localhost:8081', { waitUntil: 'networkidle2', timeout: 30000 });
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'screenshot-3-homepage.png', fullPage: true });
      console.log('   ✅ Saved: screenshot-3-homepage.png');
      
      // Check for calculator
      const hasCalculator = await page.$('#irrigation-calculator-root');
      if (hasCalculator) {
        const hasContent = await page.evaluate(() => {
          const root = document.getElementById('irrigation-calculator-root');
          return root && root.children.length > 0;
        });
        if (hasContent) {
          console.log('   ✅ Calculator found and loaded!');
        }
      }
    } catch (e) {
      console.log('   ⚠️  Could not access homepage');
    }

    // Screenshot 4: Plugin Files Check
    console.log('📸 Screenshot 4: Checking Plugin Files...');
    try {
      await page.goto('http://localhost:8081/wp-content/plugins/irrigation-calculator/build/app.js', { waitUntil: 'networkidle2', timeout: 10000 });
      const content = await page.content();
      if (content.length > 1000) {
        console.log('   ✅ app.js is accessible and contains code');
      }
    } catch (e) {
      console.log('   ⚠️  Could not verify app.js');
    }

    // Screenshot 5: Try to find calculator page
    console.log('📸 Screenshot 5: Looking for Calculator...');
    const testUrls = [
      'http://localhost:8081/?page_id=5',
      'http://localhost:8081/irrigation-calculator-test/',
      'http://localhost:8081/',
    ];
    
    for (const url of testUrls) {
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });
        await page.waitForTimeout(3000);
        const hasRoot = await page.$('#irrigation-calculator-root');
        if (hasRoot) {
          await page.screenshot({ path: 'screenshot-5-calculator-found.png', fullPage: true });
          console.log(`   ✅ Calculator found at: ${url}`);
          console.log('   ✅ Saved: screenshot-5-calculator-found.png');
          break;
        }
      } catch (e) {
        // Try next URL
      }
    }

    console.log('\n✅ Screenshots Complete!');
    console.log('\n📁 Screenshot Files:');
    const screenshots = fs.readdirSync('.').filter(f => f.startsWith('screenshot-') && f.endsWith('.png'));
    screenshots.forEach(f => {
      const stats = fs.statSync(f);
      console.log(`   📸 ${f} (${(stats.size / 1024).toFixed(1)} KB)`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (browser) await browser.close();
  }
})();

