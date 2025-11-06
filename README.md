# Irrigation Runtime Plugin

Professional WordPress plugin for creating smart irrigation schedules. Built with React and WordPress best practices.

## 🚀 Features

- **Smart Schedule Creation**: 3-step wizard interface
- **Weather Integration**: Real-time 7-day forecast via OpenWeatherMap API
- **Controller Compatibility**: Works with Rain Bird, Hunter, Toro, Rachio, and all major controllers
- **Water & Cost Savings**: EPA WaterSense certified methodology
- **Admin Dashboard**: Analytics, schedule management, and CSV export
- **Email Delivery**: Automated schedule delivery via email

## 📦 Installation

### For WordPress Users:

1. Download `irrigation-calculator.zip` from releases
2. Go to WordPress Admin → Plugins → Add New
3. Click "Upload Plugin"
4. Choose the ZIP file and install
5. Activate the plugin
6. Configure API keys in Settings → Irrigation Calculator
7. Add `[irrigation_calculator]` shortcode to any page

### For Developers:

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/irrigation-runtime-plugin.git
cd irrigation-runtime-plugin

# Build the React application
cd "Irrigation Schedule Calculator/src"
npm install
npm run build:wordpress

# Package for WordPress
npm run package:plugin
```

## 🔧 Development

### Prerequisites

- Node.js 16+ 
- PHP 7.4+
- WordPress 5.8+

### Build Commands

```bash
# Development mode
npm run dev

# Production build
npm run build

# Build for WordPress
npm run build:wordpress

# Package plugin ZIP
npm run package:plugin
```

## 📁 Project Structure

```
irrigation-runtime-plugin/
├── irrigation-calculator-plugin/    # WordPress plugin (production ready)
│   ├── irrigation-calculator.php   # Main plugin file
│   ├── build/                       # Compiled React assets
│   └── readme.txt                   # WordPress readme
├── Irrigation Schedule Calculator/  # React source code
│   └── src/
│       ├── components/              # React components
│       ├── utils/                   # Utilities
│       └── wordpress-plugin/        # WordPress integration
└── README.md                        # This file
```

## 🔒 Security

- ✅ ABSPATH guards
- ✅ Nonce verification on all AJAX calls
- ✅ Input sanitization and output escaping
- ✅ SQL injection protection via prepared statements
- ✅ Capability checks for admin functions
- ✅ CSRF protection

## 📝 WordPress Standards

- Follows WordPress Coding Standards
- Proper hooks and filters usage
- Translation-ready (i18n)
- Conditional asset loading
- Proper error handling

## 🧪 Testing

Test files are excluded from production builds. See `.gitignore` for details.

For development testing, use:
- `verify-browser-test.php` - Browser verification script (dev only)
- `create-test-page.php` - Test page creator (dev only)

## 📄 License

GPL v2 or later

## 🙏 Credits

Developed with research-backed algorithms from:
- EPA WaterSense Program
- UC Davis CIMIS
- Irrigation Association Best Practices
- ASABE Standards

## 📞 Support

For issues, feature requests, or questions, please open an issue on GitHub.

---

**Version**: 1.0.0  
**Author**: Vonareva  
**Plugin URI**: https://vonareva.com/irrigation-calculator


