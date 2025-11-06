# Irrigation Schedule Calculator

A professional WordPress plugin that helps contractors and homeowners create smart, weather-optimized irrigation schedules. Built with React, TypeScript, and Tailwind CSS.

## ✨ Features

- **3-Step Wizard Interface**: Intuitive step-by-step schedule creation
- **Weather Integration**: Real-time weather data from OpenWeatherMap API
- **Smart Scheduling**: Automatic adjustments based on soil type, slope, plant type, and climate
- **Multi-Controller Support**: Programming instructions for Rain Bird, Hunter, Toro, Rachio, Hydrawise, Irritrol, Weathermatic, and Bhyve
- **Water Savings Calculator**: Estimates monthly water and cost savings
- **Cycle & Soak Technology**: Prevents runoff on slopes and clay soil
- **Email Delivery**: Automated schedule delivery with PDF attachment
- **Mobile-First Design**: Fully responsive (375px to 1200px+)
- **WCAG 2.1 AA Compliant**: Accessible to all users
- **WordPress Conflict Prevention**: All CSS classes prefixed with 'irc-'

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- WordPress 5.8+
- PHP 7.4+

### Development Setup

```bash
# Clone the repository
git clone https://github.com/vonareva/irrigation-calculator.git
cd irrigation-calculator

# Install dependencies
npm install

# Start development server
npm run dev
```

### WordPress Plugin Installation

See [WordPress Plugin Guide](./wordpress-plugin/README.md) for detailed installation instructions.

## 📁 Project Structure

```
├── App.tsx                      # Main application component
├── components/                  # React components
│   ├── LandingPage.tsx         # Step 0: Welcome screen
│   ├── WateringRestrictions.tsx # Step 1: Location & restrictions
│   ├── ZoneDetails.tsx          # Step 2: Zone configuration
│   ├── SchedulePreview.tsx      # Step 3: Schedule output
│   ├── AdminAnalytics.tsx       # WordPress admin dashboard
│   └── ui/                      # shadcn/ui components
├── utils/                       # Utility functions
│   ├── weatherAPI.ts           # OpenWeatherMap integration
│   ├── climateZones.ts         # Climate zone detection
│   ├── scheduleOptimizer.ts    # Schedule optimization logic
│   └── wordpressAPI.ts         # WordPress backend integration
├── wordpress-plugin/            # WordPress plugin files
│   └── irrigation-calculator.php # Main plugin file
└── styles/
    └── globals.css             # Global styles and design tokens
```

## 🎨 Design System

### Color Palette

- **Primary Blue**: `#3B82F6` (Call-to-action, links)
- **Success Green**: `#10B981` (Water savings, positive actions)
- **Warning Orange**: `#F59E0B` (Alerts, important notices)
- **Error Red**: `#EF4444` (Errors, validation)
- **Neutral Gray**: `#6B7280` (Text, borders)

### Typography

- **Headings**: System font stack (San Francisco, Segoe UI, Roboto)
- **Body**: 16px base with 1.5 line height
- **Responsive scaling**: Defined in `globals.css`

### Responsive Breakpoints

- Mobile: 375px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

## 🔧 Configuration

### API Keys

The plugin requires three API keys (configured in WordPress admin):

1. **OpenWeatherMap API Key** (Required)
   - Sign up: https://openweathermap.org/api
   - Free tier: 1,000 calls/day

2. **Google Places API Key** (Required)
   - Enable: https://console.cloud.google.com
   - Free: $200 credit/month

3. **SendGrid API Key** (Optional)
   - Sign up: https://sendgrid.com
   - Free tier: 100 emails/day

### WordPress Settings

Access plugin settings: **WordPress Admin → Irrigation Calc → Settings**

- Configure API keys
- Set email sender name and address
- Customize email templates
- Enable/disable features

## 📊 Features Detail

### Step 1: Watering Restrictions
- Location autocomplete with Google Places API
- Custom watering day restrictions
- Time window constraints
- Completion type options (anytime, complete-by, start-after)

### Step 2: Zone Details
- Add unlimited irrigation zones
- Configure for each zone:
  - Plant type (grass, shrubs, trees, flowers, vegetables, mixed)
  - Soil type (sand, loam, clay)
  - Slope (flat, moderate, steep)
  - Sunlight exposure (full sun, partial shade, full shade)
  - Spray head type (rotary, fixed spray, drip, bubbler)
  - Cycle & Soak settings
  - Custom precipitation rates
  - New vs. established landscape

### Step 3: Schedule Preview
- Weather-smart 7-day forecast
- Zone-by-zone runtime calculations
- Water savings estimates
- Controller-specific programming instructions
- PDF download
- Email delivery
- Print-friendly format

## 🧪 Testing

### Browser Compatibility
- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

### Testing Checklist
- [ ] All form validations work correctly
- [ ] Weather API fails gracefully with mock data
- [ ] Email submission with honeypot bot protection
- [ ] PDF generation works
- [ ] Responsive design on all breakpoints
- [ ] Keyboard navigation throughout
- [ ] Screen reader compatibility

## 🔒 Security

- **Bot Protection**: Honeypot field in email forms
- **Input Sanitization**: All user inputs sanitized in WordPress
- **SQL Injection Prevention**: Using WordPress $wpdb prepared statements
- **XSS Protection**: All output escaped
- **CSRF Protection**: WordPress nonces on all AJAX requests

## 📈 Performance

- **Code Splitting**: Lazy loading for admin components
- **API Caching**: Weather data cached for 3 hours
- **Optimized Images**: All assets optimized
- **Minimal Dependencies**: Only essential libraries included

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

GPL v2 or later - See LICENSE file for details

## 🙏 Attributions

See [Attributions.md](./Attributions.md) for third-party libraries and resources used.

## 💬 Support

For issues and questions:
- GitHub Issues: https://github.com/vonareva/irrigation-calculator/issues
- Documentation: See [WordPress Plugin Guide](./wordpress-plugin/README.md)

## 🗺️ Roadmap

- [ ] Multi-language support (i18n)
- [ ] Advanced climate zone features
- [ ] Integration with smart controllers via API
- [ ] Historical water usage tracking
- [ ] Mobile app version
- [ ] Seasonal schedule templates

---

**Version**: 1.0.0  
**Last Updated**: October 2024  
**Requires WordPress**: 5.8+  
**Requires PHP**: 7.4+  
**License**: GPL v2 or later
