// Smart watering day selection and schedule optimization

import { WeatherData } from './weatherAPI';
import { WateringRestrictions } from '../App';

export interface OptimizedWateringDay {
  dayIndex: number;
  dayName: string;
  shouldWater: boolean;
  reason: string;
}

// Select optimal watering days based on weather forecast and restrictions
export function selectOptimalWateringDays(
  weatherForecast: WeatherData[],
  restrictions: WateringRestrictions,
  desiredFrequency: number // days per week
): OptimizedWateringDay[] {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayAbbr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Get allowed day indices
  const allowedDayIndices = dayAbbr
    .map((abbr, index) => restrictions.allowedDays.includes(abbr) ? index : -1)
    .filter(index => index !== -1);
  
  if (allowedDayIndices.length === 0) {
    // No restrictions, use default Mon/Wed/Fri
    return days.map((day, index) => ({
      dayIndex: index,
      dayName: day,
      shouldWater: [1, 3, 5].includes(index),
      reason: 'Standard 3-day schedule',
    }));
  }
  
  // Score each allowed day based on weather conditions
  const dayScores = allowedDayIndices.map(dayIndex => {
    const weather = weatherForecast[dayIndex];
    let score = 100;
    
    if (weather) {
      // Penalize for rain
      if (weather.precipitation > 70) {
        score = 0; // Don't water if heavy rain expected
      } else if (weather.precipitation > 40) {
        score -= 50; // Significantly reduce score for moderate rain
      } else if (weather.precipitation > 20) {
        score -= 20; // Slightly reduce for light rain chance
      }
      
      // Penalize for wind
      if (weather.windSpeed > 15) {
        score -= 40; // High wind wastes water
      } else if (weather.windSpeed > 10) {
        score -= 15;
      }
      
      // Bonus for optimal temperatures
      if (weather.temp >= 70 && weather.temp <= 85) {
        score += 10; // Ideal watering temp
      }
      
      // Slight bonus for low humidity (higher evaporation = more water needed)
      if (weather.humidity < 40) {
        score += 5;
      }
    }
    
    return { dayIndex, score };
  });
  
  // Sort days by score (best to worst)
  dayScores.sort((a, b) => b.score - a.score);
  
  // Select top N days based on desired frequency
  const selectedDays = new Set<number>();
  
  // First pass: select best days that meet frequency requirement
  for (let i = 0; i < Math.min(desiredFrequency, dayScores.length); i++) {
    if (dayScores[i].score > 0) {
      selectedDays.add(dayScores[i].dayIndex);
    }
  }
  
  // If we don't have enough days (due to weather), add fallback days
  if (selectedDays.size < desiredFrequency) {
    for (const item of dayScores) {
      if (selectedDays.size >= desiredFrequency) break;
      selectedDays.add(item.dayIndex);
    }
  }
  
  // Ensure even spacing if possible
  const finalSelectedDays = ensureEvenSpacing(
    Array.from(selectedDays),
    allowedDayIndices,
    desiredFrequency
  );
  
  // Build result with reasons
  return days.map((day, index) => {
    const weather = weatherForecast[index];
    const isSelected = finalSelectedDays.includes(index);
    const isAllowed = allowedDayIndices.includes(index);
    
    let reason = '';
    
    if (!isAllowed) {
      reason = 'Not allowed by watering restrictions';
    } else if (!isSelected) {
      if (weather?.precipitation > 70) {
        reason = 'Heavy rain expected - skipping';
      } else if (weather?.windSpeed > 15) {
        reason = 'High wind conditions - skipping';
      } else {
        reason = 'Scheduled on alternate days';
      }
    } else {
      if (weather?.precipitation > 40) {
        reason = 'Watering with reduced runtime (rain expected)';
      } else {
        reason = 'Optimal watering day';
      }
    }
    
    return {
      dayIndex: index,
      dayName: day,
      shouldWater: isSelected,
      reason,
    };
  });
}

// Ensure watering days are evenly spaced across the week
function ensureEvenSpacing(
  selectedDays: number[],
  allowedDays: number[],
  desiredFrequency: number
): number[] {
  if (selectedDays.length === 0) {
    // Fallback to evenly spaced allowed days
    return distributeEvenly(allowedDays, desiredFrequency);
  }
  
  // Sort selected days
  const sorted = [...selectedDays].sort((a, b) => a - b);
  
  // Check if spacing is reasonably even (within 1 day tolerance)
  const gaps = [];
  for (let i = 0; i < sorted.length; i++) {
    const nextIndex = (i + 1) % sorted.length;
    const gap = (sorted[nextIndex] - sorted[i] + 7) % 7;
    gaps.push(gap);
  }
  
  const idealGap = 7 / desiredFrequency;
  const maxDeviation = Math.max(...gaps.map(g => Math.abs(g - idealGap)));
  
  // If spacing is good enough, return as-is
  if (maxDeviation <= 2) {
    return sorted;
  }
  
  // Otherwise, redistribute to get better spacing
  return distributeEvenly(allowedDays, desiredFrequency);
}

// Distribute N days evenly across allowed days
function distributeEvenly(allowedDays: number[], count: number): number[] {
  if (allowedDays.length <= count) {
    return allowedDays;
  }
  
  const result: number[] = [];
  const step = allowedDays.length / count;
  
  for (let i = 0; i < count; i++) {
    const index = Math.round(i * step) % allowedDays.length;
    result.push(allowedDays[index]);
  }
  
  return [...new Set(result)].sort((a, b) => a - b);
}

// Check if address is odd or even (for odd/even restrictions)
export function getAddressType(address: string): 'odd' | 'even' | 'unknown' {
  const match = address.match(/^(\d+)/);
  if (!match) return 'unknown';
  
  const number = parseInt(match[1]);
  return number % 2 === 0 ? 'even' : 'odd';
}

// Get recommended watering days based on common city restrictions
export function getCityRestrictions(cityName: string): {
  days: string[];
  description: string;
} {
  const city = cityName.toLowerCase();
  
  // California cities (drought restrictions)
  if (city.includes('los angeles') || city.includes('san diego') || city.includes('san jose')) {
    return {
      days: ['Mon', 'Thu'],
      description: 'California drought restriction: 2 days per week maximum',
    };
  }
  
  // Phoenix (even/odd system)
  if (city.includes('phoenix')) {
    return {
      days: ['Sun', 'Tue', 'Thu'],
      description: 'Phoenix: Even addresses Sun/Tue/Thu, Odd addresses Wed/Fri/Sat',
    };
  }
  
  // Las Vegas
  if (city.includes('las vegas')) {
    return {
      days: ['Mon', 'Thu', 'Sat'],
      description: 'Las Vegas: 3 assigned days per week based on address',
    };
  }
  
  // Austin (stage 2 restrictions)
  if (city.includes('austin')) {
    return {
      days: ['Sat'],
      description: 'Austin Stage 2: Once per week watering',
    };
  }
  
  // Denver
  if (city.includes('denver')) {
    return {
      days: ['Mon', 'Wed', 'Fri'],
      description: 'Denver: 3 days per week recommended',
    };
  }
  
  // Default: No restrictions
  return {
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    description: 'No local restrictions detected',
  };
}

// Calculate optimal start times for zones to avoid overlap
export function calculateZoneStartTimes(
  numberOfZones: number,
  averageRuntimeMinutes: number,
  earliestStart: string = '05:00',
  sequencing: 'sequential' | 'simultaneous' = 'sequential'
): string[] {
  const startTimes: string[] = [];
  
  // Parse earliest start time
  const [startHour, startMinute] = earliestStart.split(':').map(Number);
  let currentHour = startHour;
  let currentMinute = startMinute;
  
  for (let i = 0; i < numberOfZones; i++) {
    // Format time
    const hour12 = currentHour > 12 ? currentHour - 12 : currentHour;
    const period = currentHour >= 12 ? 'PM' : 'AM';
    const timeStr = `${hour12.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')} ${period}`;
    startTimes.push(timeStr);
    
    if (sequencing === 'sequential') {
      // Add runtime to get next zone start time
      currentMinute += averageRuntimeMinutes;
      
      // Handle hour overflow
      if (currentMinute >= 60) {
        currentHour += Math.floor(currentMinute / 60);
        currentMinute = currentMinute % 60;
      }
    }
    // For simultaneous, all zones start at the same time
  }
  
  return startTimes;
}
