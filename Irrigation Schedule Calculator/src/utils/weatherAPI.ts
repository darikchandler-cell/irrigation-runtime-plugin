// OpenWeatherMap API integration for real weather data
// Free tier: 1,000 calls/day, 60 calls/minute

// Get API key from WordPress settings (if available)
const getApiKey = (): string => {
  if (typeof window !== 'undefined' && (window as any).irrigationCalcData?.hasWeatherAPI) {
    // In WordPress environment, API key is managed server-side
    // The backend will handle the API calls
    return 'WORDPRESS_MANAGED';
  }
  return '';
};

const OPENWEATHER_API_KEY = getApiKey();
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
  date: string;
  temp: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  windSpeed: number;
  precipitation: number; // % chance of rain
  precipAmount: number; // inches expected
  weatherIcon: string;
  weatherDescription: string;
  skipWatering: boolean;
  adjustmentFactor: number; // multiplier for runtime (0.7-1.3)
}

export interface CurrentWeather {
  temp: number;
  humidity: number;
  windSpeed: number;
  description: string;
}

// Fetch 7-day weather forecast
export async function getWeatherForecast(lat: number, lon: number): Promise<WeatherData[]> {
  try {
    // Use demo/mock data if no API key configured
    if (!OPENWEATHER_API_KEY) {
      return getMockWeatherForecast(lat, lon);
    }

    const url = `${OPENWEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=imperial`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Process 7-day forecast (API returns 5-day forecast in 3-hour intervals)
    return processWeatherData(data);
  } catch (error) {
    // Fallback to mock data
    return getMockWeatherForecast(lat, lon);
  }
}

// Fetch current weather conditions
export async function getCurrentWeather(lat: number, lon: number): Promise<CurrentWeather | null> {
  try {
    if (!OPENWEATHER_API_KEY) {
      return null;
    }

    const url = `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=imperial`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      temp: Math.round(data.main.temp),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed),
      description: data.weather[0].description,
    };
  } catch (error) {
    return null;
  }
}

// Process OpenWeatherMap data into our format
function processWeatherData(apiData: any): WeatherData[] {
  const dailyData: { [key: string]: any[] } = {};
  
  // Group 3-hour forecasts by day
  apiData.list.forEach((item: any) => {
    const date = new Date(item.dt * 1000).toLocaleDateString();
    if (!dailyData[date]) {
      dailyData[date] = [];
    }
    dailyData[date].push(item);
  });
  
  // Convert to daily summaries (take first 7 days)
  const weatherForecast: WeatherData[] = [];
  const dates = Object.keys(dailyData).slice(0, 7);
  
  dates.forEach((date) => {
    const dayData = dailyData[date];
    
    // Calculate daily averages
    const temps = dayData.map((d: any) => d.main.temp);
    const avgTemp = Math.round(temps.reduce((a: number, b: number) => a + b, 0) / temps.length);
    const maxTemp = Math.round(Math.max(...temps));
    const minTemp = Math.round(Math.min(...temps));
    
    const humidity = Math.round(
      dayData.reduce((sum: number, d: any) => sum + d.main.humidity, 0) / dayData.length
    );
    
    const windSpeed = Math.round(
      dayData.reduce((sum: number, d: any) => sum + d.wind.speed, 0) / dayData.length
    );
    
    // Calculate precipitation probability (highest chance during the day)
    const precipChances = dayData.map((d: any) => (d.pop || 0) * 100);
    const maxPrecipChance = Math.round(Math.max(...precipChances));
    
    // Estimate precipitation amount (inches)
    const precipAmount = dayData.reduce((sum: number, d: any) => {
      const rain = d.rain?.['3h'] || 0;
      const snow = d.snow?.['3h'] || 0;
      return sum + (rain + snow) / 25.4; // Convert mm to inches
    }, 0);
    
    // Get weather icon and description (most common during day)
    const weatherCodes = dayData.map((d: any) => d.weather[0].main);
    const mostCommonWeather = weatherCodes.sort((a: string, b: string) =>
      weatherCodes.filter((v: string) => v === a).length - 
      weatherCodes.filter((v: string) => v === b).length
    ).pop();
    
    const weatherIcon = getWeatherEmoji(mostCommonWeather);
    
    // Determine if we should skip watering
    const skipWatering = maxPrecipChance > 70 || precipAmount > 0.5;
    
    // Calculate runtime adjustment factor
    const adjustmentFactor = calculateAdjustmentFactor(
      avgTemp,
      humidity,
      windSpeed,
      maxPrecipChance
    );
    
    weatherForecast.push({
      date,
      temp: avgTemp,
      tempMin: minTemp,
      tempMax: maxTemp,
      humidity,
      windSpeed,
      precipitation: maxPrecipChance,
      precipAmount: Math.round(precipAmount * 100) / 100,
      weatherIcon,
      weatherDescription: mostCommonWeather,
      skipWatering,
      adjustmentFactor,
    });
  });
  
  return weatherForecast;
}

// Calculate runtime adjustment factor based on weather
function calculateAdjustmentFactor(
  temp: number,
  humidity: number,
  windSpeed: number,
  precipChance: number
): number {
  let factor = 1.0;
  
  // Temperature adjustments
  if (temp > 95) {
    factor *= 1.2; // +20% for extreme heat
  } else if (temp > 85) {
    factor *= 1.15; // +15% for hot days
  } else if (temp < 70) {
    factor *= 0.85; // -15% for cool days
  } else if (temp < 60) {
    factor *= 0.7; // -30% for cold days
  }
  
  // Humidity adjustments
  if (humidity > 70) {
    factor *= 0.9; // -10% for high humidity
  } else if (humidity < 30) {
    factor *= 1.1; // +10% for low humidity (dry air)
  }
  
  // Wind adjustments
  if (windSpeed > 15) {
    factor *= 0.8; // -20% for high wind (or skip)
  } else if (windSpeed > 10) {
    factor *= 0.9; // -10% for moderate wind
  }
  
  // Precipitation probability adjustments
  if (precipChance > 40 && precipChance <= 70) {
    factor *= 0.75; // -25% if moderate rain expected
  }
  
  // Ensure factor stays within reasonable bounds
  return Math.max(0.5, Math.min(1.3, factor));
}

// Convert weather codes to emojis
function getWeatherEmoji(weatherCode: string): string {
  const emojiMap: { [key: string]: string } = {
    'Clear': '☀️',
    'Clouds': '⛅',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Fog': '🌫️',
    'Haze': '🌫️',
  };
  
  return emojiMap[weatherCode] || '☀️';
}

// Mock weather data for testing/fallback
function getMockWeatherForecast(lat: number, lon: number): WeatherData[] {
  const today = new Date();
  const mockData: WeatherData[] = [];
  
  // Generate realistic mock data based on latitude (simpler climate zones)
  const isHot = lat < 35; // Southern states
  const isHumid = lon > -100; // Eastern states
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Vary temperature realistically
    const baseTemp = isHot ? 85 : 75;
    const temp = baseTemp + Math.sin(i * 0.5) * 8;
    
    // Vary precipitation
    const precipChance = isHumid ? 20 + Math.random() * 60 : 5 + Math.random() * 30;
    
    mockData.push({
      date: date.toLocaleDateString(),
      temp: Math.round(temp),
      tempMin: Math.round(temp - 8),
      tempMax: Math.round(temp + 5),
      humidity: isHumid ? 60 + Math.random() * 30 : 30 + Math.random() * 30,
      windSpeed: Math.round(5 + Math.random() * 10),
      precipitation: Math.round(precipChance),
      precipAmount: precipChance > 60 ? 0.3 + Math.random() * 0.5 : 0,
      weatherIcon: precipChance > 60 ? '🌧️' : (precipChance > 30 ? '⛅' : '☀️'),
      weatherDescription: precipChance > 60 ? 'Rain' : (precipChance > 30 ? 'Clouds' : 'Clear'),
      skipWatering: precipChance > 70,
      adjustmentFactor: calculateAdjustmentFactor(
        temp,
        isHumid ? 70 : 40,
        8,
        precipChance
      ),
    });
  }
  
  return mockData;
}

// Get historical rainfall data (last 7 days)
export async function getRecentRainfall(lat: number, lon: number): Promise<number> {
  // This would require a different API endpoint or service
  // For now, return 0 (would need historical weather API)
  return 0;
}
