import { useState, useEffect } from 'react';
import { MapPin, TrendingDown, Droplet, Clock, Printer, Mail, FileText, Calendar, ThermometerSun, Leaf, CheckCircle2, Info, Download, Wind, CloudRain, Thermometer } from 'lucide-react';
import WizardProgress from './WizardProgress';
import SchedulePDF from './SchedulePDF';
import ControllerBrandIcon, { ControllerBrandName } from './ControllerBrandIcon';
import LegalModal from './LegalModal';
import { Zone, WateringRestrictions, AppSettings } from '../App';
import { submitSchedule } from '../utils/wordpressAPI';
import { getWeatherForecast, WeatherData } from '../utils/weatherAPI';
import { detectClimateZone, getCurrentSeason, ClimateZoneData } from '../utils/climateZones';
import { selectOptimalWateringDays } from '../utils/scheduleOptimizer';
import { toast } from 'sonner';
import { 
  addScheduleSavings, 
  calculateScheduleSavings, 
  calculateWeeklyWaterUsage, 
  estimateAnnualWaterCost 
} from '../utils/cumulativeStats';

interface SchedulePreviewProps {
  zones: Zone[];
  restrictions: WateringRestrictions;
  appSettings: AppSettings;
  onStartOver: () => void;
  onEditZones: () => void;
  onEmailSchedule: () => void;
}

// Helper function to convert 24-hour time to 12-hour format
const convertTo12Hour = (time24: string): string => {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Helper function to get precipitation rate from spray head type
const getPrecipRate = (zone: Zone): number => {
  if (zone.useCustomPrecip && zone.customPrecipRate) {
    return zone.customPrecipRate;
  }
  
  const precipRates: Record<string, number> = {
    'spray': 1.5,       // Fixed spray heads
    'mp-rotator': 0.4,  // MP Rotator nozzles
    'rotor': 0.6,       // Gear-drive rotors
    'drip': 0.2,        // Drip irrigation
  };
  
  return precipRates[zone.sprayHeadType] || 1.5;
};

// Helper function to calculate optimal runtime for a zone (in minutes)
const calculateZoneRuntime = (
  zone: Zone, 
  weatherMultiplier: number = 1.0,
  climateData?: ClimateZoneData | null
): number => {
  const today = new Date();
  const currentMonth = today.getMonth();
  
  // Determine season
  const getSeason = (month: number) => {
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  };
  
  const season = getSeason(currentMonth);
  
  // Crop coefficients (based on UC Davis CIMIS)
  const cropCoefficients: Record<string, number> = {
    'lawn-cool': 0.8,
    'shrubs': 0.6,
    'trees': 0.5,
    'vegetables': 0.9,
    'flowers': 0.7,
    'succulents': 0.3,
  };
  
  // Use climate-zone-specific ET values if available, otherwise use temperate defaults
  let baseETInchesPerWeek: number;
  let seasonalMultiplier: number;
  
  if (climateData) {
    // Use climate-zone-specific values for more accurate calculations
    switch (season) {
      case 'summer':
        baseETInchesPerWeek = climateData.baseETSummer;
        seasonalMultiplier = climateData.seasonalMultipliers.summer;
        break;
      case 'spring':
        baseETInchesPerWeek = climateData.baseETSpring;
        seasonalMultiplier = climateData.seasonalMultipliers.spring;
        break;
      case 'fall':
        baseETInchesPerWeek = climateData.baseETFall;
        seasonalMultiplier = climateData.seasonalMultipliers.fall;
        break;
      case 'winter':
        baseETInchesPerWeek = climateData.baseETWinter;
        seasonalMultiplier = climateData.seasonalMultipliers.winter;
        break;
      default:
        baseETInchesPerWeek = 1.2;
        seasonalMultiplier = 1.0;
    }
  } else {
    // Fallback to temperate US climate defaults
    baseETInchesPerWeek = season === 'summer' ? 1.75 : 
                         season === 'winter' ? 0.5 : 1.2;
    const defaultMultipliers: Record<string, number> = {
      'summer': 1.3,
      'spring': 0.85,
      'fall': 0.85,
      'winter': 0.5,
    };
    seasonalMultiplier = defaultMultipliers[season];
  }
  
  // Get crop coefficient for this plant type
  const cropCoeff = cropCoefficients[zone.plantType] || 0.7;
  
  // Calculate actual water need (inches per week)
  let waterNeedInches = baseETInchesPerWeek * cropCoeff * seasonalMultiplier;
  
  // New landscapes need 50% more water for establishment
  if (zone.landscapeType === 'new') {
    waterNeedInches *= 1.5;
  }
  
  // Get precipitation rate
  const precipRate = getPrecipRate(zone);
  
  // Calculate base runtime for ONE watering session
  const wateringFrequency = zone.plantType === 'vegetables' ? 6 : 3;
  const inchesPerSession = waterNeedInches / wateringFrequency;
  
  // Runtime = (inches needed ÷ precip rate) × 60 minutes
  let runtime = (inchesPerSession / precipRate) * 60;
  
  // Soil type adjustments
  if (zone.soilType === 'clay') {
    runtime *= 1.1;
  } else if (zone.soilType === 'sandy') {
    runtime *= 0.9;
  }
  
  // Slope adjustments
  if (zone.slope === 'moderate') {
    runtime *= 1.15;
  } else if (zone.slope === 'steep') {
    runtime *= 1.25;
  }
  
  // Apply weather-based multiplier
  runtime *= weatherMultiplier;
  
  // Ensure minimum/maximum practical runtimes
  runtime = Math.max(5, Math.min(runtime, 120));
  
  return Math.round(runtime);
};

// Research-backed irrigation scheduling based on industry best practices
// Sources: Irrigation Association, EPA WaterSense, UC Davis, Texas A&M
const generateMockSchedule = (zones: Zone[], restrictions: WateringRestrictions) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  const currentMonth = today.getMonth(); // 0-11
  
  // Determine season for water requirement adjustments
  const getSeason = (month: number) => {
    if (month >= 2 && month <= 4) return 'spring'; // Mar-May
    if (month >= 5 && month <= 7) return 'summer'; // Jun-Aug
    if (month >= 8 && month <= 10) return 'fall'; // Sep-Nov
    return 'winter'; // Dec-Feb
  };
  
  const season = getSeason(currentMonth);
  
  // Seasonal multipliers based on research (OPTIMAL_IRRIGATION_SCHEDULING.md)
  const seasonalMultiplier: Record<string, number> = {
    'summer': 1.3,   // 30% increase for peak heat
    'spring': 0.85,  // 15% decrease for moderate temps
    'fall': 0.85,    // 15% decrease for moderate temps
    'winter': 0.5,   // 50% decrease for dormancy/cool temps
  };
  
  // Crop coefficients (water need multiplier by plant type)
  // Based on UC Davis CIMIS and ASABE standards
  const cropCoefficients: Record<string, number> = {
    'lawn-cool': 0.8,      // Cool-season grass (Kentucky Bluegrass, Fescue)
    'shrubs': 0.6,         // Established shrubs
    'trees': 0.5,          // Mature trees (deep roots)
    'vegetables': 0.9,     // High water vegetables
    'flowers': 0.7,        // Mixed perennials
    'succulents': 0.3,     // Drought-tolerant plants
  };
  
  // Calculate optimal runtime for a zone (in minutes)
  const calculateRuntime = (zone: Zone, weatherMultiplier: number = 1.0): number => {
    // Base ET (Evapotranspiration) for temperate US climate
    // Summer peak: ~7 inches/month, converted to weekly need
    const baseETInchesPerWeek = season === 'summer' ? 1.75 : 
                                 season === 'winter' ? 0.5 : 1.2;
    
    // Get crop coefficient for this plant type
    const cropCoeff = cropCoefficients[zone.plantType] || 0.7;
    
    // Calculate actual water need (inches per week)
    let waterNeedInches = baseETInchesPerWeek * cropCoeff * seasonalMultiplier[season];
    
    // New landscapes need 50% more water for establishment
    if (zone.landscapeType === 'new') {
      waterNeedInches *= 1.5;
    }
    
    // Get precipitation rate
    const precipRate = getPrecipRate(zone);
    
    // Calculate base runtime for ONE watering session
    // Assuming 3x per week watering (standard best practice)
    const wateringFrequency = zone.plantType === 'vegetables' ? 6 : 3; // vegetables 6x/week, others 3x/week
    const inchesPerSession = waterNeedInches / wateringFrequency;
    
    // Runtime = (inches needed ÷ precip rate) × 60 minutes
    let runtime = (inchesPerSession / precipRate) * 60;
    
    // Soil type adjustments (affects water holding capacity)
    if (zone.soilType === 'clay') {
      runtime *= 1.1; // Clay holds water better, but needs more time to penetrate
    } else if (zone.soilType === 'sandy') {
      runtime *= 0.9; // Sandy drains fast, needs less per session (more frequency)
    }
    
    // Slope adjustments (accounts for runoff losses)
    if (zone.slope === 'moderate') {
      runtime *= 1.15; // 15% more for moderate slopes
    } else if (zone.slope === 'steep') {
      runtime *= 1.25; // 25% more for steep slopes
    }
    
    // Apply weather-based multiplier (temperature, humidity adjustments)
    runtime *= weatherMultiplier;
    
    // Ensure minimum/maximum practical runtimes
    runtime = Math.max(5, Math.min(runtime, 120)); // Between 5-120 minutes
    
    return Math.round(runtime);
  };
  
  // Determine if zone should water on this day
  const shouldWaterToday = (dayIndex: number, zone: Zone): boolean => {
    // Standard 3-day/week schedule: Mon/Wed/Fri (indices 1,3,5)
    // Vegetables get daily watering in summer
    if (zone.plantType === 'vegetables' && season === 'summer') {
      return true; // Daily
    }
    
    // Standard schedule: 3 days per week
    return [1, 3, 5].includes(dayIndex); // Mon, Wed, Fri
  };
  
  return days.map((day, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    
    // Mock weather data (realistic patterns)
    const temps = [78, 82, 75, 68, 85, 80, 77];
    const precipitation = [10, 60, 15, 5, 85, 20, 10]; // % chance of rain
    const weatherIcons = ['☀️', '🌧️', '⛅', '☀️', '🌧️', '⛅', '☀️'];
    
    // Calculate weather-based runtime adjustment
    let weatherMultiplier = 1.0;
    const temp = temps[index];
    const rainChance = precipitation[index];
    
    // Temperature adjustments (OPTIMAL_IRRIGATION_SCHEDULING.md)
    if (temp > 95) {
      weatherMultiplier = 1.2; // +20% for extreme heat
    } else if (temp > 85) {
      weatherMultiplier = 1.15; // +15% for hot days
    } else if (temp < 60) {
      weatherMultiplier = 0.7; // -30% for cool days
    }
    
    // Calculate if this day is allowed by restrictions
    const dayAbbr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index];
    const isAllowed = restrictions.allowedDays.includes(dayAbbr);
    
    // Generate zone schedules for this day
    let cumulativeMinutes = 0; // Track total time elapsed
    const zoneSchedules = isAllowed ? zones.map((zone, zoneIndex) => {
      // Skip if heavy rain expected (>70% chance)
      if (rainChance > 70) {
        return null;
      }
      
      // Check if this zone should water today based on frequency
      if (!shouldWaterToday(index, zone)) {
        return null;
      }
      
      // Reduce runtime if moderate rain expected (40-70% chance)
      let dayWeatherMultiplier = weatherMultiplier;
      if (rainChance > 40) {
        dayWeatherMultiplier *= 0.75; // Reduce by 25%
      }
      
      // Calculate runtime for this zone
      let duration = calculateRuntime(zone, dayWeatherMultiplier);
      
      // OPTIMAL START TIME: 5:00-7:00 AM (industry best practice)
      // Calculate start time based on cumulative runtime of previous zones
      const baseStartHour = 5; // 5:00 AM
      const baseStartMinute = 0;
      
      // Calculate this zone's start time
      let totalStartMinutes = (baseStartHour * 60) + baseStartMinute + cumulativeMinutes;
      let startHour = Math.floor(totalStartMinutes / 60);
      let startMinutes = totalStartMinutes % 60;
      
      // Calculate total time including cycle & soak if applicable
      let totalZoneTime = duration;
      if (zone.cycleAndSoak && zone.cycleMinutes && zone.soakMinutes) {
        // Calculate how many cycle & soak iterations needed
        const cycleTime = zone.cycleMinutes + zone.soakMinutes;
        const numCycles = Math.ceil(duration / zone.cycleMinutes);
        totalZoneTime = numCycles * cycleTime;
      }
      
      // Add this zone's total time to cumulative
      cumulativeMinutes += totalZoneTime;
      
      // Calculate adjustment percentage for display
      const baseRuntime = calculateRuntime(zone, 1.0); // without weather
      const adjustment = Math.round(((duration - baseRuntime) / baseRuntime) * 100);
      
      // Convert to 12-hour format
      const time24 = `${startHour.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}`;
      
      return {
        zoneNumber: zoneIndex + 1,
        zoneName: zone.name || getPlantTypeLabel(zone.plantType),
        startTime: convertTo12Hour(time24),
        duration: Math.round(duration),
        adjustment,
        plantIcon: getPlantIcon(zone.plantType),
        cycleAndSoak: zone.cycleAndSoak,
        cycleMinutes: zone.cycleMinutes,
        soakMinutes: zone.soakMinutes,
      };
    }).filter(Boolean) : [];
    
    return {
      day,
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      temp: temps[index],
      precipitation: precipitation[index],
      weatherIcon: weatherIcons[index],
      zoneSchedules,
    };
  });
};

const getPlantTypeLabel = (plantType: string) => {
  const labels: Record<string, string> = {
    'lawn-cool': 'Lawn',
    'shrubs': 'Shrubs',
    'trees': 'Trees',
    'vegetables': 'Vegetables',
    'flowers': 'Flowers',
    'succulents': 'Succulents',
  };
  return labels[plantType] || 'Zone';
};

const getPlantIcon = (plantType: string) => {
  const icons: Record<string, string> = {
    'lawn-cool': '🌱',
    'shrubs': '🌿',
    'trees': '🌳',
    'vegetables': '🥕',
    'flowers': '🌸',
    'succulents': '🌵',
  };
  return icons[plantType] || '💧';
};

export default function SchedulePreview({
  zones,
  restrictions,
  appSettings,
  onStartOver,
  onEditZones,
  onEmailSchedule,
}: SchedulePreviewProps) {
  // State for weather and climate data
  const [weatherForecast, setWeatherForecast] = useState<WeatherData[]>([]);
  const [climateZone, setClimateZone] = useState<ClimateZoneData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(true);
  
  // State for legal modals
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms'>('privacy');
  
  // Email and user data collection state
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [includePdf, setIncludePdf] = useState(true);
  const [agreeToMarketing, setAgreeToMarketing] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [honeypot, setHoneypot] = useState(''); // Bot protection
  const [expandedController, setExpandedController] = useState<string | null>(null);
  
  // Handler functions (defined before useEffect hooks that reference them)
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      // Import html2pdf library dynamically
      const html2pdf = (await import('html2pdf.js')).default;
      
      // Get the PDF container element
      const element = document.querySelector('.pdf-container');
      
      if (!element) {
        toast.error('PDF container not found. Please try printing instead.');
        return;
      }
      
      toast.loading('Generating PDF...');
      
      // Configure PDF options
      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `${appSettings.scheduleName || 'irrigation-schedule'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      
      // Generate and download PDF
      await html2pdf().set(opt).from(element).save();
      toast.dismiss();
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to generate PDF. Please try printing instead.');
    }
  };

  const handleViewPDF = () => {
    setShowPDF(true);
  };
  
  const handleClosePDF = () => {
    setShowPDF(false);
  };
  
  // Fetch weather data and detect climate zone on mount
  useEffect(() => {
    const fetchWeatherAndClimate = async () => {
      // Extract coordinates from restrictions (if geocoded)
      const lat = (restrictions as any).latitude;
      const lon = (restrictions as any).longitude;
      
      // Only fetch weather if coordinates are provided
      if (!lat || !lon) {
        setIsLoadingWeather(false);
        return;
      }
      
      try {
        // Detect climate zone
        const zone = detectClimateZone(lat, lon);
        setClimateZone(zone);
        
        // Fetch weather forecast
        const forecast = await getWeatherForecast(lat, lon);
        setWeatherForecast(forecast);
      } catch (error) {
        // Error fetching weather data - will fall back to defaults
      } finally {
        setIsLoadingWeather(false);
      }
    };
    
    fetchWeatherAndClimate();
  }, [restrictions]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key to close PDF view
      if (e.key === 'Escape' && showPDF) {
        setShowPDF(false);
      }
      // Escape key to close legal modal
      if (e.key === 'Escape' && legalModalOpen) {
        setLegalModalOpen(false);
      }
      // Ctrl/Cmd + P to print
      if ((e.ctrlKey || e.metaKey) && e.key === 'p' && !showPDF) {
        e.preventDefault();
        handlePrint();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPDF, legalModalOpen]);
  
  // Check if location coordinates are available
  const hasLocation = !!(restrictions as any).latitude && !!(restrictions as any).longitude;
  
  const schedule = generateMockSchedule(zones, restrictions);
  
  // REAL Water Savings Calculations
  // Based on industry standards and research from irrigation.org and EPA WaterSense
  
  const calculateWaterSavings = () => {
    // Constants
    const AVG_ZONE_AREA_SQFT = 1000; // Average zone size in sq ft
    const TRADITIONAL_OVERWATERING = 0.40; // Traditional systems overwater by 40%
    const SMART_WEATHER_SAVINGS = 0.25; // Weather-smart reduces by 25%
    const CYCLE_SOAK_SAVINGS = 0.20; // Cycle & soak prevents 20% runoff
    const AVG_WATER_COST_PER_CCF = 5.50; // $5.50 per 100 cubic feet (national avg)
    const GALLONS_PER_CCF = 748; // 1 CCF = 748 gallons
    const WEEKS_PER_MONTH = 4.33;
    
    let totalTraditionalGallons = 0;
    let totalSmartGallons = 0;
    
    zones.forEach(zone => {
      // Get precipitation rate (inches per hour)
      const precipRate = zone.precipitationRate || 1.5; // Default to 1.5 in/hr
      
      // Calculate runtime per week (mock: 3x per week, 25 min per session)
      const runtimeMinutesPerWeek = 25 * 3; // 75 minutes total per week
      const runtimeHoursPerWeek = runtimeMinutesPerWeek / 60; // 1.25 hours
      
      // Traditional watering (overwatered)
      // Formula: Area (sq ft) × Precip Rate (in/hr) × Runtime (hrs) × 0.623 (conversion to gallons)
      const weeklyGallonsBase = AVG_ZONE_AREA_SQFT * precipRate * runtimeHoursPerWeek * 0.623;
      let traditionalWeeklyGallons = weeklyGallonsBase * (1 + TRADITIONAL_OVERWATERING);
      
      // Smart watering
      let smartWeeklyGallons = weeklyGallonsBase;
      
      // Apply weather-smart reduction
      smartWeeklyGallons *= (1 - SMART_WEATHER_SAVINGS);
      
      // Apply cycle & soak savings if enabled
      if (zone.cycleAndSoak) {
        smartWeeklyGallons *= (1 - CYCLE_SOAK_SAVINGS);
      }
      
      // New landscapes need 50% more water for establishment (first year)
      if (zone.landscapeType === 'new') {
        smartWeeklyGallons *= 1.5;
        traditionalWeeklyGallons *= 1.5;
      }
      
      totalTraditionalGallons += traditionalWeeklyGallons;
      totalSmartGallons += smartWeeklyGallons;
    });
    
    // Monthly calculations
    const monthlyTraditionalGallons = totalTraditionalGallons * WEEKS_PER_MONTH;
    const monthlySmartGallons = totalSmartGallons * WEEKS_PER_MONTH;
    const monthlyGallonsSaved = monthlyTraditionalGallons - monthlySmartGallons;
    
    // Cost savings
    const ccfSaved = monthlyGallonsSaved / GALLONS_PER_CCF;
    const monthlyCostSavings = ccfSaved * AVG_WATER_COST_PER_CCF;
    
    // Time savings (automated vs manual watering)
    // Assume manual watering takes 15 min per zone, 3x per week
    const monthlyTimeSavedHours = (zones.length * 15 * 3 * WEEKS_PER_MONTH) / 60;
    
    // Efficiency improvement
    const efficiencyGain = ((monthlyGallonsSaved / monthlyTraditionalGallons) * 100);
    
    return {
      monthlySavings: monthlyCostSavings,
      gallonsSaved: Math.round(monthlyGallonsSaved),
      timeSaved: monthlyTimeSavedHours,
      efficiency: Math.round(efficiencyGain),
    };
  };
  
  const { monthlySavings, gallonsSaved, timeSaved, efficiency } = calculateWaterSavings();
  
  // Calculate schedule details
  const calculateScheduleDetails = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    
    // Determine season based on current month
    const getSeason = (month: number) => {
      if (month >= 2 && month <= 4) return 'spring';
      if (month >= 5 && month <= 7) return 'summer';
      if (month >= 8 && month <= 10) return 'fall';
      return 'winter';
    };
    
    const currentSeason = getSeason(currentMonth);
    
    // Calculate season end date
    const getSeasonEndDate = (season: string) => {
      const year = today.getFullYear();
      switch (season) {
        case 'spring': return new Date(year, 4, 31); // End of May
        case 'summer': return new Date(year, 8, 21); // Sept 21
        case 'fall': return new Date(year, 11, 21); // Dec 21
        case 'winter': return new Date(year + 1, 2, 21); // Mar 21 next year
        default: return new Date(year, currentMonth + 3, 1);
      }
    };
    
    const seasonEndDate = getSeasonEndDate(currentSeason);
    const daysUntilSeasonChange = Math.ceil((seasonEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate total runtime per zone and overall schedule timing
    const totalZonesPerDay = zones.length;
    
    // Calculate actual runtime for each zone and cumulative time
    let totalRuntimeMinutes = 0;
    zones.forEach(zone => {
      const runtime = calculateZoneRuntime(zone, 1.0, climateZone);
      
      // Add cycle & soak time if applicable
      if (zone.cycleAndSoak && zone.cycleMinutes && zone.soakMinutes) {
        const cycleTime = zone.cycleMinutes + zone.soakMinutes;
        const numCycles = Math.ceil(runtime / zone.cycleMinutes);
        totalRuntimeMinutes += numCycles * cycleTime;
      } else {
        totalRuntimeMinutes += runtime;
      }
    });
    
    const totalRuntimePerDay = Math.round(totalRuntimeMinutes);
    
    // Recommended start time is 5:00 AM (optimal for irrigation)
    const recommendedStartTime24 = '05:00';
    const earliestStart = convertTo12Hour(recommendedStartTime24);
    
    // Calculate end time by adding total runtime to start time
    const startHour = 5;
    const startMinute = 0;
    const endTotalMinutes = (startHour * 60) + startMinute + totalRuntimeMinutes;
    const endHour = Math.floor(endTotalMinutes / 60);
    const endMinute = endTotalMinutes % 60;
    const latestEnd24 = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
    const latestEnd = convertTo12Hour(latestEnd24);
    
    // Calculate watering days per week
    const daysPerWeek = restrictions.allowedDays.length;
    const daysPerMonth = Math.round((daysPerWeek / 7) * 30);
    
    // Generate recommendation reasons
    const reasons = [];
    
    if (zones.some(z => z.soilType === 'clay' || z.soilType === 'loam')) {
      reasons.push('Cycle and Soak applied to prevent runoff on clay/loam soil');
    }
    
    if (zones.some(z => z.landscapeType === 'new')) {
      reasons.push('Extended watering times for new landscape establishment');
    }
    
    if (zones.some(z => z.slope === 'moderate' || z.slope === 'steep')) {
      reasons.push('Adjusted for slope to minimize erosion');
    }
    
    if (currentSeason === 'summer') {
      reasons.push('Increased frequency due to summer heat and evaporation');
    } else if (currentSeason === 'winter') {
      reasons.push('Reduced frequency for cooler winter months');
    }
    
    if (daysPerWeek < 7) {
      reasons.push(`Optimized for ${daysPerWeek}-day watering restrictions`);
    }
    
    reasons.push('Weather-based adjustments to prevent overwatering');
    
    return {
      earliestStart,
      latestEnd,
      totalRuntimePerDay,
      totalZones: totalZonesPerDay,
      daysPerWeek,
      daysPerMonth,
      currentSeason: currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1),
      seasonEndDate: seasonEndDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      daysUntilSeasonChange,
      reasons,
      sequencing: appSettings.sequencing,
      simultaneousZones: appSettings.simultaneousZones,
    };
  };
  
  const scheduleDetails = calculateScheduleDetails();

  // Email validation function
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Bot protection - if honeypot is filled, reject submission
    if (honeypot) {
      return;
    }
    
    // Validate email
    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (!email || !name) {
      toast.error('Please fill in your name and email address');
      return;
    }
    
    // Prepare submission data
    const submissionData = {
      name,
      email,
      phone,
      company,
      location: restrictions.location,
      address: restrictions.location,
      latitude: (restrictions as any).latitude || 0,
      longitude: (restrictions as any).longitude || 0,
      scheduleName: appSettings.scheduleName,
      zones: zones.map(zone => ({
        name: zone.name,
        plantType: zone.plantType,
        soilType: zone.soilType,
        slope: zone.slope,
        sunExposure: zone.sunExposure,
        sprayHeadType: zone.sprayHeadType,
        precipRate: zone.precipRate,
        landscapeType: zone.landscapeType,
      })),
      restrictions: {
        allowedDays: restrictions.allowedDays,
        startTime: restrictions.startTime,
        endTime: restrictions.endTime,
        completionType: restrictions.completionType,
        completionTime: restrictions.completionTime,
      },
      settings: {
        simultaneousZones: appSettings.simultaneousZones,
        sequencing: appSettings.sequencing,
      },
      consent: agreeToMarketing,
    };
    
    // Submit to WordPress backend
    try {
      const result = await submitSchedule(submissionData);
      
      if (result.success) {
        // Calculate and track cumulative savings
        try {
          // Calculate average runtime across all zones
          let totalRuntime = 0;
          zones.forEach(zone => {
            const runtime = calculateZoneRuntime(zone, 1.0);
            totalRuntime += runtime;
          });
          const averageRuntime = totalRuntime / zones.length;
          
          // Get days per week from schedule details
          const daysPerWeek = scheduleDetails.daysPerWeek;
          
          // Calculate weekly water usage
          const weeklyGallons = calculateWeeklyWaterUsage(
            zones.map(z => ({
              squareFeet: z.squareFeet,
              sprayHeadType: z.sprayHeadType,
              useCustomPrecip: z.useCustomPrecip,
              customPrecipRate: z.customPrecipRate,
            })),
            averageRuntime,
            daysPerWeek
          );
          
          // Estimate annual water cost (with regional rate based on climate zone)
          const annualCost = estimateAnnualWaterCost(
            weeklyGallons, 
            climateZone?.zone
          );
          
          // Calculate savings from smart scheduling
          const savings = calculateScheduleSavings(weeklyGallons, annualCost);
          
          // Add to cumulative totals
          const updatedStats = addScheduleSavings(savings);
          
          console.log('Cumulative stats updated:', updatedStats);
        } catch (statsError) {
          console.error('Error updating cumulative stats:', statsError);
          // Don't fail the whole submission if stats tracking fails
        }
        
        toast.success('Schedule submitted successfully! Check your email.');
        onEmailSchedule();
      } else {
        toast.error('Failed to submit schedule. Please try again.');
      }
    } catch (error) {
      toast.error('Network error. Please check your connection and try again.');
    }
  };

  if (showPDF) {
    return (
      <div className="bg-gray-50 py-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => setShowPDF(false)}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
            >
              ← Back to Schedule
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadPDF}
                className="h-10 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button
                onClick={handlePrint}
                className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print PDF
              </button>
            </div>
          </div>
          <SchedulePDF zones={zones} restrictions={restrictions} appSettings={appSettings} schedule={schedule} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-8">
      <WizardProgress currentStep={3} />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Your Irrigation Schedule</h1>
          <p className="text-gray-600">Review your smart watering schedule for {appSettings.scheduleName}</p>
        </div>

        {/* Climate Zone & Weather Info - Only show if location is entered */}
        {restrictions.location && restrictions.location.trim() !== '' && (
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg border-2" style={{ borderColor: '#0066CC20' }}>
            {isLoadingWeather ? (
              // Loading skeleton
              <div className="animate-pulse">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200" />
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-48 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-full mb-3" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="h-4 bg-gray-200 rounded" />
                      <div className="h-4 bg-gray-200 rounded" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="h-4 bg-gray-200 rounded w-40 mb-3" />
                  <div className="grid grid-cols-7 gap-2">
                    {[...Array(7)].map((_, idx) => (
                      <div key={idx} className="bg-gray-100 rounded-lg p-2 h-20" />
                    ))}
                  </div>
                </div>
              </div>
            ) : climateZone ? (
              <>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #00A859, #10B981)' }}>
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-900 mb-1">Climate Zone: {climateZone.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{climateZone.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {climateZone.recommendations.slice(0, 2).map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Weather Forecast Preview */}
                {weatherForecast.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <CloudRain className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700">7-Day Weather Forecast</span>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {weatherForecast.map((day, idx) => (
                        <div key={idx} className="text-center bg-gray-50 rounded-lg p-2">
                          <div className="text-2xl mb-1">{day.weatherIcon}</div>
                          <div className="text-xs text-gray-900">{day.temp}°F</div>
                          <div className="text-xs text-gray-500">{day.precipitation}%</div>
                          {day.skipWatering && (
                            <div className="mt-1 text-xs text-orange-600 font-medium">Skip</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}

        {/* Schedule Summary - NEW */}
        <div className="bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 border-2 rounded-2xl p-6 mb-8 shadow-lg" style={{ borderColor: '#0066CC40' }}>
          <div className="flex items-start gap-3 mb-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-md"
                 style={{ background: 'linear-gradient(135deg, #0066CC, #00A859)' }}>
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-gray-900 mb-2">Schedule Overview</h2>
              <p className="text-gray-700 text-sm leading-relaxed">
                This schedule has been optimized for your specific conditions including soil type, plant needs, slope, 
                sunlight exposure, and local watering restrictions. It uses weather-smart technology to automatically 
                adjust watering based on rainfall and temperature forecasts.
              </p>
            </div>
          </div>

          {/* Key Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white bg-opacity-70 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <div className="text-xs text-gray-600">Start Time</div>
              </div>
              <div className="text-2xl text-gray-900">{scheduleDetails.earliestStart}</div>
            </div>
            
            <div className="bg-white bg-opacity-70 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <div className="text-xs text-gray-600">End Time</div>
              </div>
              <div className="text-2xl text-gray-900">{scheduleDetails.latestEnd}</div>
            </div>
            
            <div className="bg-white bg-opacity-70 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Droplet className="w-4 h-4 text-blue-600" />
                <div className="text-xs text-gray-600">Total Zones</div>
              </div>
              <div className="text-2xl text-gray-900">{scheduleDetails.totalZones}</div>
            </div>
            
            <div className="bg-white bg-opacity-70 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <div className="text-xs text-gray-600">Daily Runtime</div>
              </div>
              <div className="text-2xl text-gray-900">{scheduleDetails.totalRuntimePerDay}</div>
              <div className="text-xs text-gray-600">minutes</div>
            </div>
          </div>

          {/* Watering Frequency */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white bg-opacity-70 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-green-600" />
                <div className="text-xs text-gray-600">Days per Week</div>
              </div>
              <div className="text-3xl text-green-700 mb-1">{scheduleDetails.daysPerWeek}</div>
              <div className="text-xs text-gray-600">{scheduleDetails.daysPerMonth} days/month</div>
            </div>
            
            <div className="bg-white bg-opacity-70 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <ThermometerSun className="w-4 h-4 text-orange-600" />
                <div className="text-xs text-gray-600">Current Season</div>
              </div>
              <div className="text-2xl text-orange-700 mb-1">{scheduleDetails.currentSeason}</div>
              <div className="text-xs text-gray-600">Valid until {scheduleDetails.seasonEndDate}</div>
            </div>
            
            <div className="bg-white bg-opacity-70 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="w-4 h-4 text-blue-600" />
                <div className="text-xs text-gray-600">Zone Sequencing</div>
              </div>
              <div className="text-xl text-blue-700 mb-1">
                {scheduleDetails.sequencing === 'sequential' ? 'Sequential' : `${scheduleDetails.simultaneousZones} Simultaneous`}
              </div>
              <div className="text-xs text-gray-600">
                {scheduleDetails.sequencing === 'sequential' ? 'One zone at a time' : `${scheduleDetails.simultaneousZones} zones at once`}
              </div>
            </div>
          </div>

          {/* Why We Recommend This */}
          <div className="bg-white bg-opacity-70 rounded-lg p-5 border border-blue-200">
            <h3 className="text-gray-900 mb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Why We Recommend This Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {scheduleDetails.reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Season Change Warning */}
          {scheduleDetails.daysUntilSeasonChange < 30 && (
            <div className="mt-4 bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
              <div className="flex items-start gap-2">
                <ThermometerSun className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-orange-900 mb-1">
                    <strong>Seasonal Change Approaching</strong>
                  </p>
                  <p className="text-orange-800">
                    This schedule is valid for the current {scheduleDetails.currentSeason.toLowerCase()} season. 
                    We recommend updating your schedule in {scheduleDetails.daysUntilSeasonChange} days when the season changes 
                    to ensure optimal watering for {scheduleDetails.currentSeason === 'Spring' ? 'summer' : 
                    scheduleDetails.currentSeason === 'Summer' ? 'fall' : 
                    scheduleDetails.currentSeason === 'Fall' ? 'winter' : 'spring'} conditions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Seasonal Schedule Preview */}
        {climateZone && (
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg border-2" style={{ borderColor: '#0066CC20' }}>
            <h3 className="text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Seasonal Watering Adjustments
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Your watering schedule will automatically adjust throughout the year. Here's what to expect:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {(['summer', 'fall', 'winter', 'spring'] as const).map((season) => {
                const isCurrent = getCurrentSeason() === season;
                const multiplier = climateZone.seasonalMultipliers[season];
                const avgRuntime = 25; // base runtime
                const seasonRuntime = Math.round(avgRuntime * multiplier);
                
                return (
                  <div 
                    key={season} 
                    className={`rounded-lg p-4 border-2 transition-all ${
                      isCurrent 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <ThermometerSun className={`w-4 h-4 ${
                        isCurrent ? 'text-blue-600' : 'text-gray-500'
                      }`} />
                      <span className={`text-sm ${
                        isCurrent ? 'text-blue-900 font-semibold' : 'text-gray-700'
                      }`}>
                        {season.charAt(0).toUpperCase() + season.slice(1)}
                      </span>
                      {isCurrent && (
                        <span className="ml-auto text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <div className={`text-2xl mb-1 ${
                      isCurrent ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {seasonRuntime} min
                    </div>
                    <div className="text-xs text-gray-600">
                      {multiplier === 1.0 ? 'Baseline' : 
                       multiplier > 1.0 ? `+${Math.round((multiplier - 1) * 100)}%` :
                       `${Math.round((multiplier - 1) * 100)}%`}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-900">
                <strong>Tip:</strong> Update your schedule when seasons change for optimal efficiency and plant health.
              </p>
            </div>
          </div>
        )}

        {/* Weather Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span className="text-gray-900">
              {restrictions.location || 'Location not specified'}
            </span>
          </div>
          {hasLocation && (
            <div className="flex items-center gap-4 text-sm text-gray-700">
              <span>☀️ 78°F</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">Last updated: 5 minutes ago</span>
            </div>
          )}
        </div>

        {/* Schedule Calendar */}
        <div className="mb-8">
          <h2 className="text-gray-900 mb-4">7-Day Schedule</h2>
          <div className="flex lg:grid lg:grid-cols-7 gap-4 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0">
            {schedule.map((day, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-4 min-w-[200px] lg:min-w-0 flex-shrink-0">
                <div className={`mb-3 pb-3 ${hasLocation ? 'border-b border-gray-200' : ''}`}>
                  <div className="text-sm text-gray-600 mb-1">{day.day}</div>
                  <div className="text-sm text-gray-900 mb-2">{day.date}</div>
                  {hasLocation && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-2xl">{day.weatherIcon}</span>
                      <div className="text-right">
                        <div className="text-gray-900">{day.temp}°F</div>
                        <div className="text-blue-600">{day.precipitation}%</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {day.zoneSchedules.length > 0 ? (
                    day.zoneSchedules.map((zone: any, zIndex: number) => (
                      <div key={zIndex} className="text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                            {zone.zoneNumber}
                          </div>
                          <span className="text-xs">{zone.plantIcon}</span>
                        </div>
                        <div className="text-xs text-gray-900">{zone.startTime}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Clock className="w-3 h-3" />
                          <span>{zone.duration} min</span>
                          {hasLocation && zone.adjustment !== 0 && (
                            <span className={`ml-1 px-1.5 py-0.5 rounded ${
                              zone.adjustment > 0 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {zone.adjustment > 0 ? '↑' : '↓'}{Math.abs(zone.adjustment)}%
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 italic">No watering</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zone Controller Settings - Compact Table */}
        <div className="mb-8">
          <h2 className="text-gray-900 mb-2">Controller Programming Guide</h2>
          <p className="text-gray-600 text-sm mb-4">
            Program your controller with these settings. Zones with Cycle & Soak need special programming.
          </p>
          
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Zone</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Start Time</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Runtime</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Cycle & Soak</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(() => {
                    let cumulativeMinutes = 0;
                    return zones.map((zone, index) => {
                      // Calculate start time based on cumulative runtime
                      const baseStartHour = 5; // 5:00 AM
                      const totalStartMinutes = (baseStartHour * 60) + cumulativeMinutes;
                      const startHour = Math.floor(totalStartMinutes / 60);
                      const startMinute = totalStartMinutes % 60;
                      const startTime = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
                      
                      // Calculate runtime for this zone
                      const runtime = Math.round(calculateZoneRuntime(zone, 1.0));
                      
                      // Calculate total time including cycle & soak
                      let totalZoneTime = runtime;
                      if (zone.cycleAndSoak && zone.cycleMinutes && zone.soakMinutes) {
                        const cycleTime = zone.cycleMinutes + zone.soakMinutes;
                        const numCycles = Math.ceil(runtime / zone.cycleMinutes);
                        totalZoneTime = numCycles * cycleTime;
                      }
                      
                      // Add to cumulative time for next zone
                      cumulativeMinutes += totalZoneTime;
                      
                      const needsCycleAndSoak = zone.cycleAndSoak;
                    
                    return (
                      <tr key={zone.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm text-blue-700">{index + 1}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900">{zone.name || getPlantTypeLabel(zone.plantType)}</div>
                          <div className="text-xs text-gray-500 capitalize">{zone.plantType.replace('-', ' ')}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900 font-mono">{startTime}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-blue-600">{runtime} min</div>
                        </td>
                        <td className="px-4 py-3">
                          {needsCycleAndSoak ? (
                            <div className="space-y-1">
                              <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Required</span>
                              </div>
                              <div className="text-xs text-gray-700">
                                <span className="text-green-700 font-medium">{zone.cycleMinutes}m ON</span>
                                {' / '}
                                <span className="text-blue-700 font-medium">{zone.soakMinutes}m OFF</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">Standard</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-gray-600 space-y-0.5">
                            {zone.landscapeType === 'new' && (
                              <div className="text-orange-700">• New landscape</div>
                            )}
                            {zone.soilType === 'clay' && (
                              <div>• Clay soil</div>
                            )}
                            {(zone.slope === 'moderate' || zone.slope === 'steep') && (
                              <div>• {zone.slope} slope</div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {(() => {
              let cumulativeMinutes = 0;
              return zones.map((zone, index) => {
                // Calculate start time based on cumulative runtime
                const baseStartHour = 5; // 5:00 AM
                const totalStartMinutes = (baseStartHour * 60) + cumulativeMinutes;
                const startHour = Math.floor(totalStartMinutes / 60);
                const startMinute = totalStartMinutes % 60;
                const startTime = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
                
                // Calculate runtime for this zone
                const runtime = Math.round(calculateZoneRuntime(zone, 1.0));
                
                // Calculate total time including cycle & soak
                let totalZoneTime = runtime;
                if (zone.cycleAndSoak && zone.cycleMinutes && zone.soakMinutes) {
                  const cycleTime = zone.cycleMinutes + zone.soakMinutes;
                  const numCycles = Math.ceil(runtime / zone.cycleMinutes);
                  totalZoneTime = numCycles * cycleTime;
                }
                
                // Add to cumulative time for next zone
                cumulativeMinutes += totalZoneTime;
                
                const needsCycleAndSoak = zone.cycleAndSoak;
              
              return (
                <div key={zone.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  {/* Zone Header */}
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-700">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-900">{zone.name || getPlantTypeLabel(zone.plantType)}</div>
                      <div className="text-xs text-gray-500 capitalize">{zone.plantType.replace('-', ' ')}</div>
                    </div>
                  </div>

                  {/* Zone Details Grid */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Start Time:</span>
                      <span className="text-sm text-gray-900 font-mono">{startTime}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Runtime:</span>
                      <span className="text-sm text-blue-600">{runtime} min</span>
                    </div>
                    
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-gray-600">Cycle & Soak:</span>
                      <div className="text-right">
                        {needsCycleAndSoak ? (
                          <div className="space-y-1">
                            <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Required</span>
                            </div>
                            <div className="text-xs text-gray-700">
                              <span className="text-green-700 font-medium">{zone.cycleMinutes}m ON</span>
                              {' / '}
                              <span className="text-blue-700 font-medium">{zone.soakMinutes}m OFF</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">Standard</span>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    {(zone.landscapeType === 'new' || zone.soilType === 'clay' || zone.slope === 'moderate' || zone.slope === 'steep') && (
                      <div className="pt-2 border-t border-gray-100">
                        <span className="text-sm text-gray-600 block mb-1">Notes:</span>
                        <div className="text-xs text-gray-600 space-y-0.5">
                          {zone.landscapeType === 'new' && (
                            <div className="text-orange-700">• New landscape</div>
                          )}
                          {zone.soilType === 'clay' && (
                            <div>• Clay soil</div>
                          )}
                          {(zone.slope === 'moderate' || zone.slope === 'steep') && (
                            <div>• {zone.slope} slope</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
              });
            })()}
          </div>

          {/* Cycle & Soak Instructions */}
          {zones.some(z => z.cycleAndSoak) && (
            <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-green-900 mb-1">
                    <strong>Cycle & Soak Programming:</strong>
                  </p>
                  <p className="text-green-800">
                    For zones marked "Required", program your controller to run the specified cycle time (ON), 
                    then pause for the soak time (OFF), and repeat until the total runtime is reached. 
                    This prevents runoff and improves water penetration.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controller-Specific Instructions */}
        <div className="mb-8">
          <h2 className="text-gray-900 mb-2">How to Program Your Irrigation Controller</h2>
          <p className="text-gray-600 text-sm mb-4">
            Select your controller brand below for step-by-step programming instructions.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {(['rainbird', 'hunter', 'rachio', 'toro', 'hydrawise', 'orbit'] as const).map((brandId) => (
              <button
                key={brandId}
                onClick={() => {
                  setExpandedController(expandedController === brandId ? null : brandId);
                }}
                className={`flex flex-col items-center gap-3 p-4 bg-white rounded-lg border-2 transition-all group ${
                  expandedController === brandId 
                    ? 'border-blue-500 shadow-lg' 
                    : 'border-gray-200 hover:border-blue-500 hover:shadow-lg'
                }`}
              >
                <div className="transform group-hover:scale-110 transition-transform">
                  <ControllerBrandIcon brand={brandId} size={56} />
                </div>
                <span className="text-xs text-gray-700 text-center font-medium">
                  <ControllerBrandName brand={brandId} />
                </span>
              </button>
            ))}
          </div>

          {/* Rain Bird Instructions */}
          {expandedController === 'rainbird' && (
            <div id="controller-rainbird" className="bg-white rounded-xl p-6 mb-4 shadow-sm border-2 border-blue-500">
              <div className="flex items-center gap-4 mb-4">
                <ControllerBrandIcon brand="rainbird" size={64} />
                <div className="flex-1">
                  <h3 className="text-gray-900"><ControllerBrandName brand="rainbird" /> Controllers</h3>
                  <p className="text-sm text-gray-600">ESP-Me, ESP-TM2, ESP-4M, ST8, SST</p>
                </div>
                <button
                  onClick={() => setExpandedController(null)}
                  className="text-gray-400 hover:text-gray-600 text-sm ml-auto flex-shrink-0"
                >
                  Close ✕
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-gray-900 text-sm mb-2">Set Station Runtime:</h4>
                  <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                    <li>Turn dial to "Set Station Times"</li>
                    <li>Press +/- to select station number</li>
                    <li>Press "Minutes" button</li>
                    <li>Use +/- to set runtime</li>
                    <li>Press "Minutes" to confirm</li>
                  </ol>
                </div>
                <div>
                  <h4 className="text-gray-900 text-sm mb-2">Set Watering Days:</h4>
                  <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                    <li>Turn dial to "Set Programs"</li>
                    <li>Press "Days" button</li>
                    <li>Select "Custom"</li>
                    <li>Toggle days with S M T W T F S buttons</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Hunter Instructions */}
          {expandedController === 'hunter' && (
            <div id="controller-hunter" className="bg-white rounded-xl p-6 mb-4 shadow-sm border-2 border-green-500">
              <div className="flex items-center gap-4 mb-4">
                <ControllerBrandIcon brand="hunter" size={64} />
                <div className="flex-1">
                  <h3 className="text-gray-900"><ControllerBrandName brand="hunter" /> Controllers</h3>
                  <p className="text-sm text-gray-600">Pro-C, X-Core, XC Hybrid, X2</p>
                </div>
                <button
                  onClick={() => setExpandedController(null)}
                  className="text-gray-400 hover:text-gray-600 text-sm ml-auto flex-shrink-0"
                >
                  Close ✕
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-gray-900 text-sm mb-2">Set Station Runtime:</h4>
                  <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                    <li>Turn dial to "Run Times"</li>
                    <li>Press station number (1-12)</li>
                    <li>Use +/- to set minutes</li>
                    <li>Press "Next" for next station</li>
                  </ol>
                </div>
                <div>
                  <h4 className="text-gray-900 text-sm mb-2">Seasonal Adjust:</h4>
                  <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                    <li>Turn dial to "Seasonal Adjust"</li>
                    <li>Use +/- to set percentage (10-200%)</li>
                    <li>100% = baseline, 130% = summer</li>
                    <li>Adjust monthly as needed</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Rachio Instructions */}
          {expandedController === 'rachio' && (
            <div id="controller-rachio" className="bg-white rounded-xl p-6 mb-4 shadow-sm border-2 border-green-500">
              <div className="flex items-center gap-4 mb-4">
                <ControllerBrandIcon brand="rachio" size={64} />
                <div className="flex-1">
                  <h3 className="text-gray-900"><ControllerBrandName brand="rachio" /> Smart Controllers</h3>
                  <p className="text-sm text-gray-600">Rachio 3, 3e, Pro</p>
                </div>
                <button
                  onClick={() => setExpandedController(null)}
                  className="text-gray-400 hover:text-gray-600 text-sm ml-auto flex-shrink-0"
                >
                  Close ✕
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-gray-900 text-sm mb-2">Using the App:</h4>
                  <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                    <li>Open Rachio app</li>
                    <li>Tap "Zones" to set zone details</li>
                    <li>Tap "Schedules" to create new schedule</li>
                    <li>Choose "Fixed" for custom days/times</li>
                    <li>Or use "Flex Daily" for AI scheduling</li>
                  </ol>
                </div>
                <div>
                  <h4 className="text-gray-900 text-sm mb-2">Smart Features:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>✓ Weather Intelligence auto-skips rain</li>
                    <li>✓ Automatic cycle-and-soak</li>
                    <li>✓ Saves 30-50% water vs traditional</li>
                    <li>✓ Remote control from anywhere</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Toro Instructions */}
          {expandedController === 'toro' && (
            <div id="controller-toro" className="bg-white rounded-xl p-6 mb-4 shadow-sm border-2 border-red-500">
              <div className="flex items-center gap-4 mb-4">
                <ControllerBrandIcon brand="toro" size={64} />
                <div className="flex-1">
                  <h3 className="text-gray-900"><ControllerBrandName brand="toro" /> Controllers</h3>
                  <p className="text-sm text-gray-600">DDC, TMC-212, Vision, Evolution</p>
                </div>
                <button
                  onClick={() => setExpandedController(null)}
                  className="text-gray-400 hover:text-gray-600 text-sm ml-auto flex-shrink-0"
                >
                  Close ✕
                </button>
              </div>
              <div className="text-sm text-gray-700 space-y-2">
                <p><strong>Set Runtime:</strong> Press "Custom" → Select station → Use arrows → Press "Enter"</p>
                <p><strong>Set Days:</strong> Press "Program" → Press "Days" → Choose "Custom" → Toggle day buttons</p>
                <p><strong>Tip:</strong> Toro DDC has flow monitoring to detect leaks automatically</p>
              </div>
            </div>
          )}

          {/* Hydrawise Instructions */}
          {expandedController === 'hydrawise' && (
            <div id="controller-hydrawise" className="bg-white rounded-xl p-6 mb-4 shadow-sm border-2 border-blue-500">
              <div className="flex items-center gap-4 mb-4">
                <ControllerBrandIcon brand="hydrawise" size={64} />
                <div className="flex-1">
                  <h3 className="text-gray-900"><ControllerBrandName brand="hydrawise" /> Controllers</h3>
                  <p className="text-sm text-gray-600">HC Pro, HC, HPC, WiFi Controllers</p>
                </div>
                <button
                  onClick={() => setExpandedController(null)}
                  className="text-gray-400 hover:text-gray-600 text-sm ml-auto flex-shrink-0"
                >
                  Close ✕
                </button>
              </div>
              <div className="text-sm text-gray-700 space-y-2">
                <p><strong>Web/App Setup:</strong> Log into Hydrawise → Click "Zones" → Set watering time</p>
                <p><strong>Smart Watering:</strong> Enable "Predictive Watering" for automatic adjustments</p>
                <p><strong>Tip:</strong> Reduces water use by 30-50% with weather-based scheduling</p>
              </div>
            </div>
          )}

          {/* Orbit Instructions */}
          {expandedController === 'orbit' && (
            <div id="controller-orbit" className="bg-white rounded-xl p-6 mb-4 shadow-sm border-2 border-yellow-500">
              <div className="flex items-center gap-4 mb-4">
                <ControllerBrandIcon brand="orbit" size={64} />
                <div className="flex-1">
                  <h3 className="text-gray-900"><ControllerBrandName brand="orbit" /> Controllers</h3>
                  <p className="text-sm text-gray-600">B-hyve Smart, XR, XD</p>
                </div>
                <button
                  onClick={() => setExpandedController(null)}
                  className="text-gray-400 hover:text-gray-600 text-sm ml-auto flex-shrink-0"
                >
                  Close ✕
                </button>
              </div>
              <div className="text-sm text-gray-700 space-y-2">
                <p><strong>App Setup:</strong> Open B-hyve app → Tap "Zones" → Select zone → Set run time</p>
                <p><strong>Smart Schedule:</strong> Tap "Programs" → Create program → Enable "Smart Watering"</p>
                <p><strong>Tip:</strong> Very affordable smart controller with Alexa/Google Home integration</p>
              </div>
            </div>
          )}
        </div>

        {/* Two Column Layout for Adjustments and Savings */}
        <div className={`grid grid-cols-1 ${hasLocation ? 'lg:grid-cols-2' : ''} gap-6 mb-8`}>
          {/* Weather Adjustments Panel */}
          {hasLocation && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-gray-900 mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-orange-500" />
                Smart Adjustments
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Droplet className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-sm">
                    <div className="text-gray-900 mb-1">Reduced Monday by 25%</div>
                    <div className="text-gray-600">Rain expected (60% chance)</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingDown className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="text-sm">
                    <div className="text-gray-900 mb-1">Increased Thursday by 15%</div>
                    <div className="text-gray-600">High heat expected (85°F+)</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Droplet className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-sm">
                    <div className="text-gray-900 mb-1">Skipped Friday</div>
                    <div className="text-gray-600">Heavy rain expected (85% chance)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Water Savings Summary */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm p-6 border-2 border-green-200">
            <h2 className="text-gray-900 mb-6">Water Savings</h2>
            
            <div className="mb-6">
              <div className="text-5xl text-green-600 mb-2">
                ${monthlySavings.toFixed(2)}
              </div>
              <div className="text-gray-700">Estimated monthly savings</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white bg-opacity-60 rounded-lg p-4">
                <div className="text-2xl text-green-600 mb-1">
                  {gallonsSaved.toLocaleString()}
                </div>
                <div className="text-sm text-gray-700">Gallons saved/month</div>
              </div>

              <div className="bg-white bg-opacity-60 rounded-lg p-4">
                <div className="text-2xl text-green-600 mb-1">
                  {timeSaved.toFixed(1)} hrs
                </div>
                <div className="text-sm text-gray-700">Time saved/month</div>
              </div>
            </div>

            <div className="bg-white bg-opacity-60 rounded-lg p-4">
              <div className="text-2xl text-green-600 mb-1">{efficiency}%</div>
              <div className="text-sm text-gray-700">Efficiency gain</div>
            </div>

            <div className="mt-4 pt-4 border-t border-green-200">
              <p className="text-xs text-gray-600 italic">
                Compared to traditional watering methods
              </p>
            </div>
          </div>
        </div>

        {/* Email Schedule Section - Enhanced Data Collection */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-gray-900 mb-2 flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-500" />
            Get Your Schedule via Email
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Enter your information to receive your custom irrigation schedule and join our water-saving community
          </p>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Company/Organization
                </label>
                <input
                  type="text"
                  placeholder="Optional"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />
              </div>
            </div>

            {/* Honeypot field - hidden from users, catches bots */}
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={e => setHoneypot(e.target.value)}
              style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px' }}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />

            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePdf}
                  onChange={e => setIncludePdf(e.target.checked)}
                  className="w-5 h-5 text-blue-500 rounded mt-0.5"
                />
                <span>Include PDF attachment with complete programming guide</span>
              </label>
              
              <label className="flex items-start gap-3 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeToMarketing}
                  onChange={e => setAgreeToMarketing(e.target.checked)}
                  className="w-5 h-5 text-blue-500 rounded mt-0.5"
                />
                <span>
                  Yes, send me water-saving tips, seasonal reminders, and exclusive offers from Big Irrigation. 
                  You can unsubscribe anytime.
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full h-12 px-8 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <Mail className="w-5 h-5" />
              Send My Schedule
            </button>

            <p className="text-xs text-gray-500 text-center">
              By submitting, you agree to our{' '}
              <button 
                type="button"
                onClick={() => { setLegalModalType('privacy'); setLegalModalOpen(true); }}
                className="text-blue-600 underline hover:text-blue-700 text-[12px]"
              >
                Privacy Policy
              </button> and{' '}
              <button 
                type="button"
                onClick={() => { setLegalModalType('terms'); setLegalModalOpen(true); }}
                className="text-blue-600 underline hover:text-blue-700"
              >
                Terms of Service
              </button>.
              We'll use your information to send your schedule and improve our service.
            </p>
          </form>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={onStartOver}
            className="order-2 sm:order-1 text-gray-600 hover:text-gray-900 transition-colors"
          >
            Restart Calculator
          </button>
          
          <div className="order-1 sm:order-2 flex flex-nowrap gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={onEditZones}
              disabled={!isValidEmail(email)}
              className="h-12 px-3 sm:px-6 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none text-sm sm:text-base"
            >
              <span className="hidden sm:inline">Edit Zones</span>
              <span className="sm:hidden">Edit</span>
            </button>
            <button
              onClick={handleViewPDF}
              disabled={!isValidEmail(email)}
              className="h-12 px-3 sm:px-6 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2 flex-1 sm:flex-none text-sm sm:text-base"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">View PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
            <button
              onClick={handlePrint}
              disabled={!isValidEmail(email)}
              className="h-12 px-3 sm:px-6 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2 flex-1 sm:flex-none text-sm sm:text-base"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Schedule</span>
              <span className="sm:hidden">Print</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Legal Modals */}
      <LegalModal 
        isOpen={legalModalOpen} 
        onClose={() => setLegalModalOpen(false)} 
        type={legalModalType} 
      />
    </div>
  );
}
