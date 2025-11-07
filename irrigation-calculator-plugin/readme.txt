=== Irrigation Schedule Calculator ===
Contributors: Vonareva
Tags: irrigation, sprinkler, watering, schedule, calculator, lawn, garden, water-saving
Requires at least: 5.8
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.0.1
License: MIT
License URI: https://opensource.org/licenses/MIT

Professional irrigation schedule calculator for Rain Bird, Hunter, Toro, Rachio & all sprinkler controllers. Weather-smart watering that saves water and money.

== Description ==

The **Irrigation Schedule Calculator** is a professional-grade tool designed for landscape contractors, irrigation professionals, and homeowners to create optimized watering schedules. Built with research-backed algorithms from EPA WaterSense, UC Davis, and the Irrigation Association.

### Key Features

**Smart Schedule Creation**
* 3-step wizard interface for easy schedule creation
* Climate zone detection for 7 US regions
* Real-time weather integration (7-day forecast)
* Soil type, slope, and sunlight exposure calculations
* Cycle & soak functionality to prevent runoff

**Controller Compatibility**
Works with all major irrigation controllers:
* Rain Bird
* Hunter (Pro-C, X-Core, I-Core, Hydrawise)
* Toro (TMC, Evolution, Vision)
* Rachio (Smart Controllers)
* Irritrol
* Weathermatic
* Bhyve
* Generic timers

**Water & Cost Savings**
* EPA WaterSense certified methodology
* Regional water rate calculations
* Saves 20-30% water vs traditional timers
* CO₂ reduction tracking
* Monthly impact dashboard

**Professional Features**
* PDF schedule export
* Email delivery system
* Multi-schedule management
* Admin analytics dashboard
* Mobile-responsive design
* WCAG 2.1 AA accessible

### How It Works

1. **Enter Watering Restrictions** - Days allowed, times, and location
2. **Configure Zones** - Plant type, soil, slope, spray heads
3. **Get Smart Schedule** - Weather-optimized runtime calculations

The calculator uses advanced evapotranspiration (ET) algorithms based on UC Davis CIMIS data, adjusting for your specific climate zone, season, and local weather conditions.

### Use Cases

* Landscape contractors creating client proposals
* Irrigation installers programming new systems
* Property managers optimizing water usage
* Homeowners reducing water bills
* HOA communities managing common areas

### Technical Specifications

* Climate Zones: 7 US regions (Arid Desert, Mediterranean, Semi-Arid, Humid Subtropical, Humid Continental, Pacific Northwest, Mountain)
* Precipitation Rates: Spray heads (1.5 in/hr), MP Rotators (0.4 in/hr), Rotors (0.6 in/hr), Drip (0.2 in/hr)
* Water Rates: Regional ($4-8.50 per 1000 gallons)
* Crop Coefficients: Based on ASABE standards
* Seasonal Multipliers: Research-validated

### Privacy & Data

* No personal data stored on external servers
* Email submissions stored locally in WordPress
* Optional weather API (OpenWeatherMap) for forecast data
* GDPR compliant with user consent
* Honeypot spam protection

== Installation ==

### Automatic Installation

1. Log in to your WordPress admin panel
2. Navigate to Plugins → Add New
3. Search for "Irrigation Schedule Calculator"
4. Click "Install Now" then "Activate"
5. Add shortcode `[irrigation_calculator]` to any page

### Manual Installation

1. Download the plugin ZIP file
2. Log in to WordPress admin panel
3. Navigate to Plugins → Add New → Upload Plugin
4. Choose the ZIP file and click "Install Now"
5. Activate the plugin
6. Add shortcode `[irrigation_calculator]` to any page

### Configuration

**Optional: Weather API Setup**
1. Get free API key from [OpenWeatherMap](https://openweathermap.org/api)
2. Go to Settings → Irrigation Calculator
3. Enter API key
4. Save settings

The calculator works without the API key but won't show real-time weather data.

== Frequently Asked Questions ==

= Is this compatible with my irrigation controller? =

Yes! The calculator generates standard watering schedules that work with all irrigation controllers including Rain Bird, Hunter, Toro, Rachio, and generic timers.

= Do I need a weather API key? =

No, the API key is optional. The calculator will use climate-zone-specific defaults if no API key is provided. With an API key, you get real-time 7-day weather forecasts for more accurate scheduling.

= How accurate are the water savings estimates? =

Savings estimates are based on EPA WaterSense research showing smart irrigation saves 20-30% compared to traditional timer-based systems. Actual savings vary by location, weather, and current usage patterns.

= Can I use this for commercial properties? =

Absolutely! The calculator is designed for both residential and commercial applications. Many landscape contractors use it to create professional proposals for clients.

= Does it work on mobile devices? =

Yes, the calculator is fully responsive and works on all devices from 375px (mobile) to 1200px+ (desktop).

= Is my data secure? =

Yes. All data is stored locally in your WordPress database. No information is sent to external servers except the optional weather API (for forecast data only).

= Can I customize the email templates? =

Email templates can be customized by editing the plugin files or using WordPress email customization plugins.

= What climate zones are supported? =

Currently supports 7 US climate zones:
* Arid Desert (Phoenix, Las Vegas)
* Mediterranean (Los Angeles, San Diego)
* Semi-Arid (Denver, Albuquerque)
* Humid Subtropical (Atlanta, Houston)
* Humid Continental (Chicago, New York)
* Pacific Northwest (Seattle, Portland)
* Mountain (High altitude cities)

International zones planned for future releases.

== Screenshots ==

1. Landing page with impact tracker
2. Step 1: Watering restrictions setup
3. Step 2: Zone configuration with plant/soil data
4. Step 3: Smart schedule preview with weather integration
5. PDF export example
6. Admin analytics dashboard
7. Mobile responsive design

== Changelog ==

= 1.0.0 - 2025-01-XX =
* Initial release
* 3-step wizard interface
* Climate zone detection (7 US zones)
* Weather API integration
* Regional water rate calculations
* PDF export & email delivery
* Admin analytics dashboard
* Multi-schedule management
* WCAG 2.1 AA accessibility
* Mobile-first responsive design

== Changelog ==

= 1.0.1 =
* Fixed Google Places API initialization error (proper error handling)
* Fixed settings loading issue (settings now properly passed to frontend)
* Removed hard-coded logo from landing page
* Fixed background to span full width of window
* Added error boundaries for better error handling
* Improved WordPress integration and compatibility

= 1.0.0 =
Initial release of the Irrigation Schedule Calculator. Creates professional, weather-smart watering schedules for all major irrigation controllers.

== Upgrade Notice ==

= 1.0.1 =
Bug fixes and improvements: Fixed Google Places API errors, settings loading, removed logo, full-width background, and improved error handling.

= 1.0.0 =
Initial release of the Irrigation Schedule Calculator. Creates professional, weather-smart watering schedules for all major irrigation controllers.

== Additional Information ==

**Research Sources:**
* EPA WaterSense Program
* Irrigation Association Best Practices
* UC Davis CIMIS (California Irrigation Management Information System)
* ASABE (American Society of Agricultural and Biological Engineers)
* Texas A&M AgriLife Extension
* Colorado State University Extension

**Support:**
For support, feature requests, or bug reports, please visit our support forum or contact the developer.

**Credits:**
Developed by Vonareva with research-backed algorithms from leading irrigation and agricultural institutions.

== Privacy Policy ==

This plugin:
* Stores schedule data locally in WordPress database
* Optionally uses OpenWeatherMap API for weather data
* Does not sell or share user data
* Includes opt-in email collection with user consent
* Is GDPR compliant
* Uses honeypot spam protection (no third-party services)

For detailed privacy information, see the Privacy Policy modal within the calculator interface.
