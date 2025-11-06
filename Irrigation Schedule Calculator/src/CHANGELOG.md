# Changelog

All notable changes to the Irrigation Schedule Calculator will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-XX

### Initial Release

#### Added
- **3-Step Wizard Interface**
  - Step 1: Watering restrictions configuration with geocoding
  - Step 2: Irrigation zone management with detailed plant/soil/sunlight data
  - Step 3: Weather-smart schedule preview with savings calculations

- **Smart Water Calculations**
  - Climate zone detection (7 US climate zones)
  - Regional ET (evapotranspiration) values for accurate water requirements
  - Regional water rate calculations ($4-8.50 per 1000 gallons based on climate zone)
  - Crop coefficient-based calculations (UC Davis CIMIS standards)
  - Seasonal adjustments (summer, winter, spring, fall)
  - Soil type adjustments (clay, loam, sandy)
  - Slope adjustments (flat, moderate, steep)
  - Cycle & soak calculations for runoff prevention

- **Weather Integration**
  - OpenWeatherMap API integration for 7-day forecasts
  - Real-time weather-based runtime adjustments
  - Precipitation skip logic
  - Temperature-based multipliers

- **Controller Support**
  - Rain Bird
  - Hunter
  - Toro
  - Rachio
  - Hydrawise
  - Irritrol
  - Weathermatic
  - Bhyve
  - Generic controllers

- **Schedule Management**
  - Save/load multiple schedules (localStorage)
  - Schedule naming and organization
  - Export to PDF with professional formatting
  - Email schedule delivery
  - Print functionality

- **Environmental Impact Tracking**
  - Cumulative water savings tracker (gallons)
  - Cost savings calculator (dollars)
  - CO₂ reduction tracking (lbs)
  - Monthly impact dashboard on landing page

- **User Experience**
  - Mobile-first responsive design (375px to 1200px+)
  - Auto-save functionality
  - Offline indicator
  - Error boundary protection
  - WCAG 2.1 AA accessibility compliance
  - Keyboard shortcuts (Ctrl/Cmd + P for print, Escape to close modals)

- **WordPress Integration**
  - Complete WordPress plugin package
  - Custom post type for schedule submissions
  - Admin analytics dashboard
  - Email notification system
  - Shortcode support: `[irrigation_calculator]`

- **Legal & Privacy**
  - Privacy policy modal
  - Terms of service modal
  - Email confirmation with opt-out
  - Honeypot anti-spam protection

#### Technical Details
- React 18 with TypeScript
- Tailwind CSS v4.0 for styling
- Motion (Framer Motion) for animations
- Lucide React for icons
- Recharts for data visualization
- Vite build system
- WordPress REST API integration

#### Research-Based Features
- EPA WaterSense certified methodology
- Irrigation Association best practices
- UC Davis CIMIS evapotranspiration data
- ASABE (American Society of Agricultural and Biological Engineers) standards

### Known Limitations
- Weather API requires internet connection
- Geocoding requires valid street address
- Savings estimates are based on national averages and may vary by location
- Designed for US climate zones (international support planned for future release)

## [Unreleased]

### Planned Features
- Multi-language support
- International climate zone expansion
- Historical weather data integration
- Advanced cycle & soak optimization
- Mobile app version
- Integration with smart controller APIs (Rachio, Hunter Hydrawise)
- Soil moisture sensor integration
- Rain sensor integration
- Flow meter integration for leak detection

---

## Version History

- **1.0.0** - Initial production release
