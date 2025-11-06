#!/bin/bash

# Irrigation Calculator - Local WordPress Debug Setup
# This script sets up a local WordPress environment for debugging the plugin

echo "🚀 Setting up Local WordPress Environment for Irrigation Calculator Debug"
echo "=================================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first:"
    echo "   https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create plugin directory if it doesn't exist
if [ ! -d "irrigation-calculator-plugin" ]; then
    echo "📁 Creating irrigation-calculator-plugin directory..."
    mkdir -p irrigation-calculator-plugin
fi

# Copy plugin files to irrigation-calculator-plugin directory
echo "📋 Copying plugin files..."
cp -r "Irrigation Schedule Calculator/src/wordpress-plugin/"* irrigation-calculator-plugin/

# Check if plugin files exist
if [ ! -f "irrigation-calculator-plugin/irrigation-calculator.php" ]; then
    echo "❌ Plugin files not found. Please ensure the plugin is built first."
    echo "   Run: cd 'Irrigation Schedule Calculator' && npm run build"
    exit 1
fi

echo "✅ Plugin files copied successfully"

# Create WordPress configuration
echo "⚙️  Creating WordPress configuration..."
cat > wp-config.php << 'EOF'
<?php
// WordPress Local Debug Configuration
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', true);
define('SCRIPT_DEBUG', true);

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('memory_limit', '512M');

// Database configuration
define('DB_HOST', 'db:3306');
define('DB_NAME', 'wordpress');
define('DB_USER', 'wordpress');
define('DB_PASSWORD', 'wordpress');

// WordPress URLs
define('WP_HOME', 'http://localhost:8081');
define('WP_SITEURL', 'http://localhost:8081');

// Security keys (local development only)
define('AUTH_KEY',         'local-dev-key-change-in-production');
define('SECURE_AUTH_KEY',  'local-dev-key-change-in-production');
define('LOGGED_IN_KEY',    'local-dev-key-change-in-production');
define('NONCE_KEY',        'local-dev-key-change-in-production');
define('AUTH_SALT',        'local-dev-key-change-in-production');
define('SECURE_AUTH_SALT', 'local-dev-key-change-in-production');
define('LOGGED_IN_SALT',   'local-dev-key-change-in-production');
define('NONCE_SALT',       'local-dev-key-change-in-production');

// Additional debugging
define('WP_CACHE', false);
define('COMPRESS_CSS', false);
define('COMPRESS_SCRIPTS', false);
define('CONCATENATE_SCRIPTS', false);
define('SAVEQUERIES', true);

// Plugin debugging
define('IRRIGATION_CALC_DEBUG', true);

$table_prefix = 'wp_';

if (!defined('ABSPATH')) {
    define('ABSPATH', __DIR__ . '/');
}

require_once ABSPATH . 'wp-settings.php';
EOF

echo "✅ WordPress configuration created"

# Start Docker containers
echo "🐳 Starting Docker containers..."
docker-compose down 2>/dev/null || true
docker-compose up -d

# Wait for WordPress to be ready
echo "⏳ Waiting for WordPress to be ready..."
sleep 10

# Check if WordPress is running
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:8081 > /dev/null; then
        echo "✅ WordPress is running!"
        break
    fi
    echo "⏳ Waiting for WordPress... (attempt $((attempt + 1))/$max_attempts)"
    sleep 2
    attempt=$((attempt + 1))
done

if [ $attempt -eq $max_attempts ]; then
    echo "❌ WordPress failed to start. Check Docker logs:"
    echo "   docker-compose logs wordpress"
    exit 1
fi

echo ""
echo "🎉 Local WordPress Environment Ready!"
echo "======================================"
echo ""
echo "📱 WordPress Site: http://localhost:8081"
echo "🔧 WordPress Admin: http://localhost:8081/wp-admin"
echo "   Username: admin"
echo "   Password: admin"
echo ""
echo "🗄️  phpMyAdmin: http://localhost:8080"
echo "   Username: wordpress"
echo "   Password: wordpress"
echo ""
echo "🔌 Plugin Location: irrigation-calculator-plugin/"
echo "📊 Debug Logs: Check Docker logs with: docker-compose logs wordpress"
echo ""
echo "🚀 Next Steps:"
echo "   1. Go to http://localhost:8081/wp-admin"
echo "   2. Activate the 'Irrigation Schedule Calculator' plugin"
echo "   3. Create a page with shortcode: [irrigation_calculator]"
echo "   4. Open browser console (F12) to debug"
echo ""
echo "🛑 To stop: docker-compose down"
echo "🔄 To restart: docker-compose restart"
echo ""

# Show plugin status
echo "📋 Plugin Status:"
if [ -f "irrigation-calculator-plugin/irrigation-calculator.php" ]; then
    echo "   ✅ Main plugin file exists"
else
    echo "   ❌ Main plugin file missing"
fi

if [ -f "irrigation-calculator-plugin/build/app.js" ]; then
    echo "   ✅ JavaScript build file exists"
else
    echo "   ❌ JavaScript build file missing"
fi

if [ -f "irrigation-calculator-plugin/build/app.css" ]; then
    echo "   ✅ CSS build file exists"
else
    echo "   ❌ CSS build file missing"
fi

echo ""
echo "🔍 Debug Information:"
echo "   - WordPress Debug: ENABLED"
echo "   - Error Display: ENABLED"
echo "   - Debug Logging: ENABLED"
echo "   - Script Debug: ENABLED"
echo ""
echo "Happy debugging! 🐛"



