#!/bin/bash

echo "🔍 Comprehensive Plugin Verification"
echo "═══════════════════════════════════════════════════════"
echo ""

PASSED=0
FAILED=0
WARNINGS=0

# Test 1: Docker
echo "1. Docker Containers"
if docker ps | grep -q "irrigation-calc-wordpress"; then
    echo "   ✅ WordPress container running"
    ((PASSED++))
else
    echo "   ❌ WordPress container not running"
    ((FAILED++))
fi

# Test 2: WordPress Access
echo ""
echo "2. WordPress Accessibility"
if curl -s http://localhost:8081 > /dev/null 2>&1; then
    echo "   ✅ WordPress accessible at http://localhost:8081"
    ((PASSED++))
else
    echo "   ❌ WordPress not accessible"
    ((FAILED++))
fi

# Test 3: Plugin Files
echo ""
echo "3. Plugin Files"
if docker exec irrigation-calc-wordpress test -f /var/www/html/wp-content/plugins/irrigation-calculator/irrigation-calculator.php; then
    echo "   ✅ irrigation-calculator.php exists"
    ((PASSED++))
else
    echo "   ❌ irrigation-calculator.php missing"
    ((FAILED++))
fi

if docker exec irrigation-calc-wordpress test -f /var/www/html/wp-content/plugins/irrigation-calculator/build/app.js; then
    JS_SIZE=$(docker exec irrigation-calc-wordpress stat -c%s /var/www/html/wp-content/plugins/irrigation-calculator/build/app.js 2>/dev/null || docker exec irrigation-calc-wordpress stat -f%z /var/www/html/wp-content/plugins/irrigation-calculator/build/app.js 2>/dev/null)
    echo "   ✅ app.js exists ($(echo "scale=1; $JS_SIZE/1024/1024" | bc)MB)"
    ((PASSED++))
else
    echo "   ❌ app.js missing"
    ((FAILED++))
fi

if docker exec irrigation-calc-wordpress test -f /var/www/html/wp-content/plugins/irrigation-calculator/build/app.css; then
    echo "   ✅ app.css exists"
    ((PASSED++))
else
    echo "   ❌ app.css missing"
    ((FAILED++))
fi

# Test 4: PHP Syntax
echo ""
echo "4. PHP Syntax"
SYNTAX_CHECK=$(docker exec irrigation-calc-wordpress php -l /var/www/html/wp-content/plugins/irrigation-calculator/irrigation-calculator.php 2>&1)
if echo "$SYNTAX_CHECK" | grep -q "No syntax errors"; then
    echo "   ✅ PHP syntax valid"
    ((PASSED++))
else
    echo "   ❌ PHP syntax errors"
    echo "   $SYNTAX_CHECK"
    ((FAILED++))
fi

# Test 5: Class Loading
echo ""
echo "5. Plugin Class Loading"
CLASS_CHECK=$(docker exec irrigation-calc-wordpress php -r "require '/var/www/html/wp-load.php'; if (class_exists('Irrigation_Calculator')) { echo 'OK'; }" 2>&1)
if echo "$CLASS_CHECK" | grep -q "OK"; then
    echo "   ✅ Plugin class loads successfully"
    ((PASSED++))
else
    echo "   ❌ Plugin class failed to load"
    echo "   $CLASS_CHECK"
    ((FAILED++))
fi

# Test 6: HTTP Access
echo ""
echo "6. HTTP File Access"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/wp-content/plugins/irrigation-calculator/build/app.js | grep -q "200"; then
    echo "   ✅ app.js accessible via HTTP"
    ((PASSED++))
else
    echo "   ⚠️  app.js HTTP access issue"
    ((WARNINGS++))
fi

if curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/wp-content/plugins/irrigation-calculator/build/app.css | grep -q "200"; then
    echo "   ✅ app.css accessible via HTTP"
    ((PASSED++))
else
    echo "   ⚠️  app.css HTTP access issue"
    ((WARNINGS++))
fi

# Test 7: Code Fixes
echo ""
echo "7. Code Fixes Verification"
if docker exec irrigation-calc-wordpress grep -q "class_exists.*Irrigation_Calculator" /var/www/html/wp-content/plugins/irrigation-calculator/irrigation-calculator.php; then
    echo "   ✅ Class protection implemented"
    ((PASSED++))
else
    echo "   ❌ Class protection missing"
    ((FAILED++))
fi

if docker exec irrigation-calc-wordpress grep -q "!defined.*IRRIGATION_CALC_VERSION" /var/www/html/wp-content/plugins/irrigation-calculator/irrigation-calculator.php; then
    echo "   ✅ Constant protection implemented"
    ((PASSED++))
else
    echo "   ❌ Constant protection missing"
    ((FAILED++))
fi

# Summary
echo ""
echo "═══════════════════════════════════════════════════════"
echo "📊 Test Summary"
echo "═══════════════════════════════════════════════════════"
echo "✅ Passed: $PASSED"
echo "⚠️  Warnings: $WARNINGS"
echo "❌ Failed: $FAILED"
echo ""

TOTAL=$((PASSED + WARNINGS + FAILED))
if [ $FAILED -eq 0 ]; then
    echo "🎯 Status: ✅ PLUGIN READY"
    echo ""
    echo "Next Steps:"
    echo "  1. Go to http://localhost:8081/wp-admin"
    echo "  2. Activate 'Irrigation Schedule Calculator' plugin"
    echo "  3. Create page with [irrigation_calculator] shortcode"
    echo "  4. Test in browser"
else
    echo "🎯 Status: ❌ NEEDS FIXES"
    echo ""
    echo "Please fix the failed tests above."
fi
echo "═══════════════════════════════════════════════════════"

