/**
 * WordPress AJAX API Helper
 * 
 * This file provides functions to communicate with WordPress backend.
 * It checks if running in WordPress environment and falls back to mock data for development.
 */

// Type definitions
interface WordPressData {
  ajaxUrl: string;
  nonce: string;
  hasWeatherAPI: boolean;
  hasPlacesAPI: boolean;
}

// Check if we're in WordPress environment
const isWordPress = typeof (window as any).irrigationCalcData !== 'undefined';

// Get WordPress data (if available)
const wpData: WordPressData | null = isWordPress 
  ? (window as any).irrigationCalcData 
  : null;

// Development mode flag - set to false for production
const DEV_MODE = !isWordPress;
const DEBUG_LOGGING = DEV_MODE && false; // Set to true to enable debug logs in dev mode

/**
 * Submit irrigation schedule to WordPress backend
 */
export async function submitSchedule(data: {
  name: string;
  email: string;
  phone: string;
  company: string;
  location: string;
  address: string;
  latitude: number;
  longitude: number;
  scheduleName: string;
  zones: any[];
  restrictions: any;
  settings: any;
  consent: boolean;
}): Promise<{ success: boolean; message?: string; scheduleId?: number }> {
  
  if (!isWordPress || !wpData) {
    // Development mode - return mock success
    if (DEBUG_LOGGING) {
      console.log('📧 SCHEDULE SUBMISSION (DEV MODE):', data);
      console.log('⚠️ In production, this will be saved to WordPress database');
    }
    return { 
      success: true, 
      message: 'Schedule logged to console (dev mode)',
      scheduleId: Math.floor(Math.random() * 10000)
    };
  }

  // WordPress production mode
  const formData = new FormData();
  formData.append('action', 'submit_irrigation_schedule');
  formData.append('nonce', wpData.nonce);
  
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });

  try {
    const response = await fetch(wpData.ajaxUrl, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    
    if (result.success) {
      return {
        success: true,
        message: result.data.message,
        scheduleId: result.data.schedule_id,
      };
    } else {
      throw new Error(result.data.message || 'Submission failed');
    }
  } catch (error) {
    // Silent error handling - error already shown to user via UI
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get weather forecast from OpenWeatherMap via WordPress
 */
export async function getWeatherForecast(
  latitude: number, 
  longitude: number
): Promise<any | null> {
  
  if (!isWordPress || !wpData || !wpData.hasWeatherAPI) {
    // Development mode - return mock weather data
    if (DEBUG_LOGGING) {
      console.log('🌤️ WEATHER REQUEST (DEV MODE):', { latitude, longitude });
      console.log('⚠️ Using mock weather data. Set OpenWeatherMap API key in WordPress settings.');
    }
    return generateMockWeather();
  }

  // WordPress production mode
  const formData = new FormData();
  formData.append('action', 'get_weather_forecast');
  formData.append('nonce', wpData.nonce);
  formData.append('latitude', String(latitude));
  formData.append('longitude', String(longitude));

  try {
    const response = await fetch(wpData.ajaxUrl, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      return generateMockWeather(); // Fallback to mock data
    }
  } catch (error) {
    return generateMockWeather(); // Fallback to mock data
  }
}

/**
 * Generate mock weather data for development
 */
function generateMockWeather() {
  const days = 7;
  const list = [];
  
  for (let i = 0; i < days * 8; i++) { // 8 forecasts per day (3-hour intervals)
    const date = new Date();
    date.setHours(date.getHours() + (i * 3));
    
    list.push({
      dt: Math.floor(date.getTime() / 1000),
      main: {
        temp: 70 + Math.random() * 20,
        feels_like: 70 + Math.random() * 20,
        humidity: 40 + Math.random() * 30,
      },
      weather: [{
        id: Math.random() > 0.7 ? 500 : 800,
        main: Math.random() > 0.7 ? 'Rain' : 'Clear',
        description: Math.random() > 0.7 ? 'light rain' : 'clear sky',
        icon: Math.random() > 0.7 ? '10d' : '01d',
      }],
      pop: Math.random(), // Probability of precipitation
      rain: Math.random() > 0.7 ? { '3h': Math.random() * 5 } : undefined,
    });
  }
  
  return { list };
}

/**
 * Check if Google Places API is available
 */
export function isGooglePlacesAvailable(): boolean {
  if (isWordPress && wpData) {
    return wpData.hasPlacesAPI && typeof (window as any).google !== 'undefined';
  }
  return typeof (window as any).google !== 'undefined';
}

/**
 * Get environment info for debugging
 */
export function getEnvironmentInfo() {
  return {
    isWordPress,
    hasAjaxUrl: !!wpData?.ajaxUrl,
    hasNonce: !!wpData?.nonce,
    hasWeatherAPI: wpData?.hasWeatherAPI || false,
    hasPlacesAPI: wpData?.hasPlacesAPI || false,
    mode: isWordPress ? 'production' : 'development',
  };
}

/**
 * Log environment info to console (dev mode only)
 */
export function logEnvironmentInfo() {
  if (!DEBUG_LOGGING) return;
  
  const info = getEnvironmentInfo();
  console.log('🔧 Irrigation Calculator Environment:', info);
  
  if (!info.isWordPress) {
    console.log('⚠️ Running in DEVELOPMENT mode - data will not be saved');
    console.log('📝 To use in production: Install as WordPress plugin and configure API keys');
  } else {
    if (!info.hasWeatherAPI) {
      console.warn('⚠️ OpenWeatherMap API key not configured - using mock weather data');
    }
    if (!info.hasPlacesAPI) {
      console.warn('⚠️ Google Places API key not configured - location autocomplete disabled');
    }
  }
}

/**
 * Get admin analytics data
 */
export async function getAdminAnalytics(
  dateRange: string = '30days',
  page: number = 1
): Promise<any> {
  if (!isWordPress || !wpData) {
    if (DEBUG_LOGGING) console.log('📊 ADMIN ANALYTICS (DEV MODE)');
    return null;
  }

  const formData = new FormData();
  formData.append('action', 'get_admin_analytics');
  formData.append('nonce', wpData.nonce);
  formData.append('dateRange', dateRange);
  formData.append('page', String(page));

  try {
    const response = await fetch(wpData.ajaxUrl, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

/**
 * Save plugin settings
 */
export async function savePluginSettings(
  settingsType: 'general' | 'api' | 'email',
  settings: any
): Promise<{ success: boolean; message?: string }> {
  if (!isWordPress || !wpData) {
    if (DEBUG_LOGGING) console.log('💾 SAVE SETTINGS (DEV MODE):', { settingsType, settings });
    return { success: true, message: 'Settings logged (dev mode)' };
  }

  const formData = new FormData();
  formData.append('action', 'save_plugin_settings');
  formData.append('nonce', wpData.nonce);
  formData.append('settingsType', settingsType);
  
  Object.entries(settings).forEach(([key, value]) => {
    formData.append(key, String(value));
  });

  try {
    const response = await fetch(wpData.ajaxUrl, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    
    if (result.success) {
      return { success: true, message: result.data.message };
    } else {
      throw new Error(result.data.message || 'Save failed');
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Export schedules to CSV
 */
export async function exportSchedulesCSV(dateRange: string = '30days'): Promise<void> {
  if (!isWordPress || !wpData) {
    if (DEBUG_LOGGING) console.log('📥 CSV EXPORT (DEV MODE)');
    alert('CSV export is only available in WordPress');
    return;
  }

  const formData = new FormData();
  formData.append('action', 'export_schedules_csv');
  formData.append('nonce', wpData.nonce);
  formData.append('dateRange', dateRange);

  try {
    const response = await fetch(wpData.ajaxUrl, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    
    if (result.success) {
      // Create blob and download
      const blob = new Blob([result.data.csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else {
      throw new Error(result.data.message || 'Export failed');
    }
  } catch (error) {
    alert('Failed to export CSV');
  }
}

/**
 * Resend schedule email
 */
export async function resendScheduleEmail(scheduleId: number): Promise<{ success: boolean; message?: string }> {
  if (!isWordPress || !wpData) {
    if (DEBUG_LOGGING) console.log('📧 RESEND EMAIL (DEV MODE):', scheduleId);
    return { success: true, message: 'Email logged (dev mode)' };
  }

  const formData = new FormData();
  formData.append('action', 'resend_schedule_email');
  formData.append('nonce', wpData.nonce);
  formData.append('scheduleId', String(scheduleId));

  try {
    const response = await fetch(wpData.ajaxUrl, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    
    if (result.success) {
      return { success: true, message: result.data.message };
    } else {
      throw new Error(result.data.message || 'Resend failed');
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send test email
 */
export async function sendTestEmail(testEmail: string): Promise<{ success: boolean; message?: string }> {
  if (!isWordPress || !wpData) {
    if (DEBUG_LOGGING) console.log('✉️ TEST EMAIL (DEV MODE):', testEmail);
    return { success: true, message: 'Test email logged (dev mode)' };
  }

  const formData = new FormData();
  formData.append('action', 'test_email');
  formData.append('nonce', wpData.nonce);
  formData.append('testEmail', testEmail);

  try {
    const response = await fetch(wpData.ajaxUrl, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    
    if (result.success) {
      return { success: true, message: result.data.message };
    } else {
      throw new Error(result.data.message || 'Send failed');
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Geocode address to coordinates
 */
export async function geocodeAddress(address: string): Promise<{
  lat: number;
  lng: number;
  formattedAddress: string;
} | null> {
  if (!isWordPress || !wpData) {
    if (DEBUG_LOGGING) console.log('🗺️ GEOCODE (DEV MODE):', address);
    // Return mock coordinates for San Diego
    return {
      lat: 32.7157,
      lng: -117.1611,
      formattedAddress: address,
    };
  }

  const formData = new FormData();
  formData.append('action', 'geocode_address');
  formData.append('nonce', wpData.nonce);
  formData.append('address', address);

  try {
    const response = await fetch(wpData.ajaxUrl, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

/**
 * Check API status
 */
export async function checkAPIStatus(): Promise<any> {
  if (!isWordPress || !wpData) {
    if (DEBUG_LOGGING) console.log('🔌 API STATUS CHECK (DEV MODE)');
    return {
      openweather: { configured: false, connected: false },
      googlePlaces: { configured: false, connected: false },
      waterRates: { configured: false, connected: false },
    };
  }

  const formData = new FormData();
  formData.append('action', 'check_api_status');
  formData.append('nonce', wpData.nonce);

  try {
    const response = await fetch(wpData.ajaxUrl, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}
