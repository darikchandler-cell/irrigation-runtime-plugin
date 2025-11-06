/**
 * Cumulative Statistics Tracker
 * Manages running totals of water saved, money saved, and CO2 reduced across all schedules
 */

export interface CumulativeStats {
  waterSavedGallons: number;
  moneySavedDollars: number;
  co2ReducedLbs: number;
  schedulesCreated: number;
  lastUpdated: string;
}

const STORAGE_KEY = 'irrigation-calculator-cumulative-stats';

/**
 * Get current cumulative stats from localStorage
 */
export const getCumulativeStats = (): CumulativeStats => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading cumulative stats:', error);
  }
  
  // Return default values if nothing stored
  return {
    waterSavedGallons: 0,
    moneySavedDollars: 0,
    co2ReducedLbs: 0,
    schedulesCreated: 0,
    lastUpdated: new Date().toISOString(),
  };
};

/**
 * Calculate savings from a schedule
 */
export interface ScheduleSavings {
  waterSavedGallons: number;
  moneySavedDollars: number;
  co2ReducedLbs: number;
}

export const calculateScheduleSavings = (
  weeklyWaterUseGallons: number,
  annualWaterCostDollars: number
): ScheduleSavings => {
  // Industry standard: Smart weather-based schedules save 20-30% compared to timer-based systems
  // Sources: EPA WaterSense, Irrigation Association, independent studies
  // Conservative estimate used for reliability
  const savingsPercentage = 0.25; // 25% average savings
  
  // Weekly water saved
  const weeklyWaterSaved = weeklyWaterUseGallons * savingsPercentage;
  
  // Annual water saved (52 weeks, accounting for seasonal variation)
  const annualWaterSaved = weeklyWaterSaved * 52;
  
  // Money saved annually (based on regional water rates)
  const annualMoneySaved = annualWaterCostDollars * savingsPercentage;
  
  // CO2 reduction calculation:
  // Water treatment and distribution generates ~0.0082 lbs CO2 per gallon
  // Source: EPA water-energy calculator, River Network carbon footprint data
  const co2PerGallon = 0.0082;
  const annualCo2Reduced = annualWaterSaved * co2PerGallon;
  
  return {
    waterSavedGallons: Math.round(annualWaterSaved),
    moneySavedDollars: Math.round(annualMoneySaved),
    co2ReducedLbs: Math.round(annualCo2Reduced),
  };
};

/**
 * Add new schedule savings to cumulative totals
 */
export const addScheduleSavings = (savings: ScheduleSavings): CumulativeStats => {
  const current = getCumulativeStats();
  
  const updated: CumulativeStats = {
    waterSavedGallons: current.waterSavedGallons + savings.waterSavedGallons,
    moneySavedDollars: current.moneySavedDollars + savings.moneySavedDollars,
    co2ReducedLbs: current.co2ReducedLbs + savings.co2ReducedLbs,
    schedulesCreated: current.schedulesCreated + 1,
    lastUpdated: new Date().toISOString(),
  };
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving cumulative stats:', error);
  }
  
  return updated;
};

/**
 * Reset cumulative stats (for admin/testing purposes)
 */
export const resetCumulativeStats = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error resetting cumulative stats:', error);
  }
};

/**
 * Calculate weekly water usage from zones
 */
export const calculateWeeklyWaterUsage = (
  zones: Array<{
    squareFeet: number;
    sprayHeadType: string;
    useCustomPrecip?: boolean;
    customPrecipRate?: number;
  }>,
  averageRuntimeMinutes: number,
  daysPerWeek: number
): number => {
  let totalGallons = 0;
  
  zones.forEach(zone => {
    // Get precipitation rate (inches per hour)
    let precipRate = 1.5; // Default for spray heads
    
    if (zone.useCustomPrecip && zone.customPrecipRate) {
      precipRate = zone.customPrecipRate;
    } else {
      const precipRates: Record<string, number> = {
        'spray': 1.5,
        'mp-rotator': 0.4,
        'rotor': 0.6,
        'drip': 0.2,
      };
      precipRate = precipRates[zone.sprayHeadType] || 1.5;
    }
    
    // Calculate water applied per watering session
    const hoursRuntime = averageRuntimeMinutes / 60;
    const inchesApplied = precipRate * hoursRuntime;
    
    // Convert to gallons: 1 inch over 1 sq ft = 0.623 gallons
    const gallonsPerSession = zone.squareFeet * inchesApplied * 0.623;
    
    // Multiply by days per week
    const weeklyGallons = gallonsPerSession * daysPerWeek;
    
    totalGallons += weeklyGallons;
  });
  
  return Math.round(totalGallons);
};

/**
 * Get regional water rate based on climate zone
 * Water rates vary significantly by region due to scarcity and infrastructure
 * 
 * Sources: 
 * - Circle of Blue Water Pricing Report (2024)
 * - American Water Works Association (AWWA) Rate Survey
 * - Municipal utility data from major US cities
 * 
 * Note: Rates represent typical residential outdoor water use pricing.
 * Many utilities use tiered pricing where higher usage = higher rates.
 */
export const getRegionalWaterRate = (climateZone?: string): number => {
  // Water rates in dollars per 1000 gallons (2024-2025 estimates)
  const regionalRates: Record<string, number> = {
    'arid-desert': 8.50,        // Phoenix, Las Vegas (high due to scarcity)
    'mediterranean': 7.00,       // California (high due to drought)
    'semi-arid': 5.50,          // Denver, Albuquerque
    'humid-subtropical': 4.50,  // Atlanta, Houston (ample water)
    'humid-continental': 5.00,  // Chicago, Boston
    'pacific-northwest': 4.00,  // Seattle, Portland (abundant water)
    'mountain': 6.00,           // Mountain cities
  };
  
  // Default to national average if zone not detected
  return regionalRates[climateZone || ''] || 5.00;
};

/**
 * Estimate annual water cost based on weekly usage and climate zone
 * Note: Actual costs vary by municipality, tier pricing, and seasonal rates
 */
export const estimateAnnualWaterCost = (
  weeklyGallons: number, 
  climateZone?: string
): number => {
  const waterRatePerThousandGallons = getRegionalWaterRate(climateZone);
  const annualGallons = weeklyGallons * 52;
  const annualCost = (annualGallons / 1000) * waterRatePerThousandGallons;
  return Math.round(annualCost);
};
