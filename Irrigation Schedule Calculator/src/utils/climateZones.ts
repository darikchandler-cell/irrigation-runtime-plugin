// Climate zone detection and optimal irrigation parameters for US regions
// Based on OPTIMAL_IRRIGATION_SCHEDULING.md

export type ClimateZone = 
  | 'arid-desert'
  | 'mediterranean'
  | 'semi-arid'
  | 'humid-subtropical'
  | 'humid-continental'
  | 'pacific-northwest'
  | 'mountain';

export interface ClimateZoneData {
  zone: ClimateZone;
  name: string;
  description: string;
  baseETSummer: number; // inches per week
  baseETWinter: number;
  baseETSpring: number;
  baseETFall: number;
  optimalFrequency: number; // days per week in summer
  winterFrequency: number;
  seasonalMultipliers: {
    summer: number;
    spring: number;
    fall: number;
    winter: number;
  };
  recommendations: string[];
}

// Climate zone database with detailed parameters
const CLIMATE_ZONES: { [key in ClimateZone]: ClimateZoneData } = {
  'arid-desert': {
    zone: 'arid-desert',
    name: 'Arid Desert',
    description: 'Hot, dry summers (110°F+), mild winters. Cities: Phoenix, Las Vegas, Tucson',
    baseETSummer: 2.0, // 8-10 inches/month ÷ 4 weeks
    baseETWinter: 0.75,
    baseETSpring: 1.5,
    baseETFall: 1.5,
    optimalFrequency: 5,
    winterFrequency: 2,
    seasonalMultipliers: {
      summer: 1.4,
      spring: 1.0,
      fall: 1.0,
      winter: 0.5,
    },
    recommendations: [
      'Use cycle-and-soak to prevent runoff in extreme heat',
      'Water 5-6 days/week in peak summer (May-September)',
      'Consider drip irrigation for 50% water savings',
      'Mulch heavily to reduce evaporation',
    ],
  },
  'mediterranean': {
    zone: 'mediterranean',
    name: 'Mediterranean',
    description: 'Dry summers, mild wet winters. Cities: Los Angeles, San Diego, San Francisco',
    baseETSummer: 1.65, // 6-7 inches/month
    baseETWinter: 0.4,
    baseETSpring: 1.25,
    baseETFall: 1.25,
    optimalFrequency: 4,
    winterFrequency: 1,
    seasonalMultipliers: {
      summer: 1.3,
      spring: 0.9,
      fall: 0.9,
      winter: 0.3,
    },
    recommendations: [
      'Reduce watering in winter - rainfall usually sufficient',
      'Water 4-5 days/week in summer only',
      'Consider rain barrels to capture winter precipitation',
      'Native plants need minimal supplemental watering',
    ],
  },
  'semi-arid': {
    zone: 'semi-arid',
    name: 'Semi-Arid',
    description: 'Low humidity, moderate temps, low rainfall. Cities: Denver, Albuquerque, Boise',
    baseETSummer: 1.75, // 6-8 inches/month
    baseETWinter: 0.25,
    baseETSpring: 1.25,
    baseETFall: 1.0,
    optimalFrequency: 4,
    winterFrequency: 0, // dormant season
    seasonalMultipliers: {
      summer: 1.3,
      spring: 0.85,
      fall: 0.85,
      winter: 0.0,
    },
    recommendations: [
      'No irrigation needed November-March (dormant season)',
      'Water evergreens monthly in winter if no snow',
      'Intense UV increases evaporation despite cooler temps',
      'Adjust for altitude - higher = more frequent watering',
    ],
  },
  'humid-subtropical': {
    zone: 'humid-subtropical',
    name: 'Humid Subtropical',
    description: 'Hot humid summers, frequent rainfall. Cities: Atlanta, Houston, Orlando, Dallas',
    baseETSummer: 1.4, // 5-6 inches/month
    baseETWinter: 0.6,
    baseETSpring: 1.0,
    baseETFall: 1.0,
    optimalFrequency: 3,
    winterFrequency: 1,
    seasonalMultipliers: {
      summer: 1.2,
      spring: 0.85,
      fall: 0.85,
      winter: 0.5,
    },
    recommendations: [
      'Monitor rainfall closely - skip cycles after 0.5" rain',
      'Reduce frequency in summer due to afternoon thunderstorms',
      'Watch for fungal diseases from high humidity',
      'Water early morning (4-7 AM) to prevent disease',
    ],
  },
  'humid-continental': {
    zone: 'humid-continental',
    name: 'Humid Continental',
    description: 'Hot summers, cold winters. Cities: Chicago, Boston, Minneapolis, New York',
    baseETSummer: 1.4, // 5-6 inches/month
    baseETWinter: 0.0,
    baseETSpring: 1.0,
    baseETFall: 1.0,
    optimalFrequency: 3,
    winterFrequency: 0,
    seasonalMultipliers: {
      summer: 1.15,
      spring: 0.8,
      fall: 0.8,
      winter: 0.0,
    },
    recommendations: [
      'No irrigation November-March (frozen ground)',
      'Rainfall often adequate in summer - supplement only',
      'Water deeply before first freeze',
      'Cool-season grass thrives in spring/fall',
    ],
  },
  'pacific-northwest': {
    zone: 'pacific-northwest',
    name: 'Pacific Northwest',
    description: 'Dry summers, wet winters. Cities: Seattle, Portland, Eugene',
    baseETSummer: 1.15, // 4-5 inches/month
    baseETWinter: 0.0,
    baseETSpring: 0.75,
    baseETFall: 0.5,
    optimalFrequency: 3,
    winterFrequency: 0,
    seasonalMultipliers: {
      summer: 1.1,
      spring: 0.7,
      fall: 0.6,
      winter: 0.0,
    },
    recommendations: [
      'No irrigation October-May (30-50 inches rainfall)',
      'Water only July-September for most landscapes',
      'Check sheltered areas under eaves monthly',
      'Native plants need zero supplemental water',
    ],
  },
  'mountain': {
    zone: 'mountain',
    name: 'Mountain',
    description: 'High altitude, variable weather, intense sun. Cities: Aspen, Park City, Flagstaff',
    baseETSummer: 1.75, // 6-8 inches/month
    baseETWinter: 0.0,
    baseETSpring: 1.25,
    baseETFall: 1.0,
    optimalFrequency: 4,
    winterFrequency: 0,
    seasonalMultipliers: {
      summer: 1.3,
      spring: 0.85,
      fall: 0.85,
      winter: 0.0,
    },
    recommendations: [
      'No irrigation needed in winter (snow provides moisture)',
      'Intense UV increases evaporation despite cool temps',
      'Shorter growing season - focus on June-August',
      'Adjust for rapid temperature swings',
    ],
  },
};

// Detect climate zone based on latitude and longitude
export function detectClimateZone(lat: number, lon: number): ClimateZoneData {
  // Southwest Desert (Arizona, Southern Nevada, Southern California desert)
  if (lat >= 31 && lat <= 36 && lon >= -117 && lon <= -109) {
    return CLIMATE_ZONES['arid-desert'];
  }
  
  // California Coast (Mediterranean)
  if (lat >= 32 && lat <= 42 && lon >= -124 && lon <= -117) {
    return CLIMATE_ZONES['mediterranean'];
  }
  
  // Mountain West (Colorado, Utah, New Mexico mountains)
  if (lat >= 35 && lat <= 45 && lon >= -111 && lon <= -104 && lat > 5000) {
    return CLIMATE_ZONES['mountain'];
  }
  
  // Semi-Arid (Great Plains, Intermountain West)
  if (lat >= 35 && lat <= 48 && lon >= -111 && lon <= -98) {
    return CLIMATE_ZONES['semi-arid'];
  }
  
  // Pacific Northwest (Washington, Oregon, Northern California)
  if (lat >= 42 && lat <= 49 && lon >= -125 && lon <= -117) {
    return CLIMATE_ZONES['pacific-northwest'];
  }
  
  // Humid Subtropical (Southeast, Gulf Coast, Texas)
  if (lat >= 25 && lat <= 38 && lon >= -106 && lon <= -75) {
    return CLIMATE_ZONES['humid-subtropical'];
  }
  
  // Humid Continental (Midwest, Northeast)
  if (lat >= 37 && lat <= 49 && lon >= -98 && lon <= -67) {
    return CLIMATE_ZONES['humid-continental'];
  }
  
  // Default fallback - use humid continental as middle ground
  return CLIMATE_ZONES['humid-continental'];
}

// Get current season based on date and hemisphere
export function getCurrentSeason(date: Date = new Date()): 'spring' | 'summer' | 'fall' | 'winter' {
  const month = date.getMonth(); // 0-11
  
  if (month >= 2 && month <= 4) return 'spring'; // Mar-May
  if (month >= 5 && month <= 7) return 'summer'; // Jun-Aug
  if (month >= 8 && month <= 10) return 'fall'; // Sep-Nov
  return 'winter'; // Dec-Feb
}

// Get optimal watering frequency for plant type and climate
export function getOptimalFrequency(
  plantType: string,
  climateZone: ClimateZoneData,
  season: 'spring' | 'summer' | 'fall' | 'winter'
): number {
  // Get base frequency for the climate and season
  let baseFrequency = season === 'summer' 
    ? climateZone.optimalFrequency 
    : climateZone.winterFrequency;
  
  // Adjust for plant type
  if (plantType === 'vegetables') {
    return Math.min(6, baseFrequency + 2); // Vegetables need more frequent watering
  } else if (plantType === 'succulents') {
    return Math.max(1, baseFrequency - 2); // Succulents need less
  } else if (plantType === 'trees') {
    return Math.max(2, baseFrequency - 1); // Trees need deep, infrequent
  }
  
  return baseFrequency;
}

// Get season end date
export function getSeasonEndDate(
  season: 'spring' | 'summer' | 'fall' | 'winter',
  currentDate: Date = new Date()
): Date {
  const year = currentDate.getFullYear();
  
  switch (season) {
    case 'spring':
      return new Date(year, 5, 21); // June 21
    case 'summer':
      return new Date(year, 8, 21); // September 21
    case 'fall':
      return new Date(year, 11, 21); // December 21
    case 'winter':
      return new Date(year + 1, 2, 21); // March 21 next year
  }
}

// Calculate days until season change
export function getDaysUntilSeasonChange(currentDate: Date = new Date()): number {
  const season = getCurrentSeason(currentDate);
  const seasonEnd = getSeasonEndDate(season, currentDate);
  const diffTime = seasonEnd.getTime() - currentDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
