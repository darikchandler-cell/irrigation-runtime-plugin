// Controller-specific programming instructions for major brands

export interface ControllerBrand {
  id: string;
  name: string;
  models: string[];
  instructions: ProgrammingInstructions;
  tips: string[];
  videoUrl?: string;
  manualUrl?: string;
}

export interface ProgrammingInstructions {
  setStationRuntime: string[];
  setWateringDays: string[];
  setStartTime: string[];
  enableCycleAndSoak?: string[];
  setSeasonalAdjust?: string[];
}

export const CONTROLLER_BRANDS: { [key: string]: ControllerBrand } = {
  'rainbird': {
    id: 'rainbird',
    name: 'Rain Bird',
    models: ['ESP-Me', 'ESP-TM2', 'ESP-4M', 'ESP-6TM', 'ST8', 'SST'],
    instructions: {
      setStationRuntime: [
        'Turn dial to "Set Station Times"',
        'Press + or - to select station number (Zone 1, Zone 2, etc.)',
        'Press "Minutes" button',
        'Use + or - to set runtime in minutes',
        'Press "Minutes" again to confirm',
        'Repeat for each station',
      ],
      setWateringDays: [
        'Turn dial to "Set Programs"',
        'Select Program A, B, or C',
        'Press "Days" button',
        'Use + or - to select watering schedule:',
        '  - "Custom" = choose specific days',
        '  - "Odd" = odd numbered days',
        '  - "Even" = even numbered days',
        'If Custom, press each day button (S M T W T F S) to toggle',
      ],
      setStartTime: [
        'Turn dial to "Set Programs"',
        'Press "Start Time" button',
        'Use + or - to set hour (AM/PM)',
        'Press "Start Time" again to set minutes',
        'Use + or - to adjust minutes',
        'Press "Start Time" to confirm',
      ],
      enableCycleAndSoak: [
        'ESP-Me: Turn dial to "Cycle+Soak"',
        'Select station number',
        'Set number of cycles (2-4 recommended)',
        'Set soak time between cycles (10-15 min)',
        'Older models: May need to create multiple start times',
      ],
      setSeasonalAdjust: [
        'Turn dial to "Seasonal Adjust"',
        'Use + or - to set percentage (50%-150%)',
        '  - 100% = normal (spring/fall)',
        '  - 130% = summer peak',
        '  - 60% = winter',
        'Affects all stations proportionally',
      ],
    },
    tips: [
      'Use Seasonal Adjust to make quick changes without reprogramming',
      'Program C is often used for drip zones with different schedules',
      'Install a rain sensor (connect to "SEN" terminals)',
      'Battery backup keeps settings during power outages',
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=rain+bird+esp+programming',
    manualUrl: 'https://www.rainbird.com/professionals/irrigation-controllers',
  },
  
  'hunter': {
    id: 'hunter',
    name: 'Hunter',
    models: ['Pro-C', 'X-Core', 'XC Hybrid', 'X2', 'ICC', 'I-Core'],
    instructions: {
      setStationRuntime: [
        'Turn dial to "Run Times"',
        'Press station number button (1-12)',
        'Use + or - to set minutes',
        'Press "Next" to move to next station',
        'Repeat for all stations',
      ],
      setWateringDays: [
        'Turn dial to "Water Days"',
        'Select program A, B, or C',
        'Choose schedule type:',
        '  - "Odd" = odd calendar days',
        '  - "Even" = even calendar days',  
        '  - "Interval" = every X days',
        '  - "Custom" = specific weekdays',
        'For Custom: Press day buttons to select (M T W T F S S)',
      ],
      setStartTime: [
        'Turn dial to "Start Times"',
        'Select Program A, B, or C',
        'Press + or - to set start time #1',
        'Can add up to 4 start times per program',
        'Use multiple start times for cycle-and-soak',
      ],
      setSeasonalAdjust: [
        'Turn dial to "Seasonal Adjust"',
        'Use + or - to adjust water budget (10%-200%)',
        '  - 100% = baseline',
        '  - 130% = hot summer months',
        '  - 50-70% = cool/rainy seasons',
        'Adjust monthly as weather changes',
      ],
    },
    tips: [
      'Use Water Budget (Seasonal Adjust) to fine-tune monthly',
      'Pro-C requires 24V AC power (use included transformer)',
      'Install Solar Sync sensor for automatic weather adjustments',
      'Multiple start times = automatic cycle-and-soak',
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=hunter+pro-c+programming',
    manualUrl: 'https://www.hunterindustries.com/irrigation-product/controllers/pro-c',
  },
  
  'rachio': {
    id: 'rachio',
    name: 'Rachio',
    models: ['Rachio 3', 'Rachio 3e', 'Rachio Pro'],
    instructions: {
      setStationRuntime: [
        'Open Rachio app on smartphone',
        'Tap "Zones"',
        'Select zone to edit',
        'Tap "Advanced Settings"',
        'Enter "Available Water" or custom runtime',
        'App will calculate optimal runtime automatically',
      ],
      setWateringDays: [
        'Tap "Schedules" in app',
        'Create new Fixed Schedule',
        'Select "Custom" for specific days',
        'Tap each day to enable/disable',
        'Or choose "Flex Daily" for AI-powered scheduling',
      ],
      setStartTime: [
        'In Schedule settings, tap "Start Time"',
        'Use time picker to set start time',
        'Rachio recommends 4-6 AM for optimal efficiency',
        'Can set multiple schedules with different start times',
      ],
      enableCycleAndSoak: [
        'Tap zone settings',
        'Enable "Cycle and Soak"',
        'Rachio automatically calculates optimal cycles',
        'Based on slope, soil type, and nozzle type',
      ],
      setSeasonalAdjust: [
        'Not needed - Rachio auto-adjusts with weather',
        'Manual override: Tap schedule > Advanced > Seasonal Shift',
        'Adjust +/- percentage if needed',
        'Weather Intelligence handles most adjustments',
      ],
    },
    tips: [
      'Enable Weather Intelligence for automatic rain skip',
      'Use "Flex Daily" schedule for maximum water savings (30-50%)',
      'Accurate zone setup is critical - measure area, set soil type',
      'Connect to local weather station for best accuracy',
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=rachio+3+setup',
    manualUrl: 'https://support.rachio.com/',
  },
  
  'toro': {
    id: 'toro',
    name: 'Toro',
    models: ['DDC', 'TMC-212', 'Vision', 'Evolution', 'Precision'],
    instructions: {
      setStationRuntime: [
        'Press "Custom" button',
        'Select station number (1-12)',
        'Use arrow keys to set minutes',
        'Press "Enter" to save',
        'Repeat for each station',
      ],
      setWateringDays: [
        'Press "Program" button',
        'Select Program 1, 2, or 3',
        'Press "Days" button',
        'Choose "Custom" days',
        'Press day buttons to toggle (S M T W T F S)',
        'Press "Enter" to save',
      ],
      setStartTime: [
        'Press "Start Time" button',
        'Use arrows to set hour and minute',
        'Press AM or PM',
        'Press "Enter" to confirm',
        'Can set up to 4 start times',
      ],
      enableCycleAndSoak: [
        'Use multiple start times on same day',
        'Example: 5:00 AM, 5:15 AM, 5:30 AM',
        'DDC calculates soak time automatically',
        'Or manually program shorter runtimes with gaps',
      ],
    },
    tips: [
      'Toro DDC has flow monitoring - alerts you to leaks',
      'Precision model allows 1-second runtime increments',
      'Use "Smart Connect" app for remote programming',
      'Weather sensor integration available on newer models',
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=toro+ddc+programming',
    manualUrl: 'https://www.toro.com/en/professional-contractor/irrigation',
  },
  
  'hydrawise': {
    id: 'hydrawise',
    name: 'Hydrawise',
    models: ['HC Pro', 'HC', 'HPC', 'WiFi Controllers'],
    instructions: {
      setStationRuntime: [
        'Log into Hydrawise app or web portal',
        'Click "Zones"',
        'Select zone to edit',
        'Set "Watering Time" in minutes',
        'Or use "Predictive Watering" for auto-calculation',
      ],
      setWateringDays: [
        'Click "Schedules"',
        'Create new schedule',
        'Choose "Fixed" schedule type',
        'Select specific days of week',
        'Or use "Smart Watering" for automatic scheduling',
      ],
      setStartTime: [
        'In schedule settings, set start time',
        'Hydrawise recommends 4-6 AM',
        'Can stagger zones automatically',
        'Set "Run Before" time if needed',
      ],
      enableCycleAndSoak: [
        'Edit zone settings',
        'Enable "Cycle & Soak"',
        'Set soil type (clay, loam, sand)',
        'Hydrawise calculates optimal cycles automatically',
      ],
      setSeasonalAdjust: [
        'Auto-adjusts with Predictive Watering enabled',
        'Manual: Set "Watering Adjustment" percentage',
        'Weather-based adjustments happen automatically',
        'Can override with local weather station data',
      ],
    },
    tips: [
      'Predictive Watering reduces water use by 30-50%',
      'Connect to local PWS for hyperlocal weather data',
      'Flow meter integration detects leaks and breaks',
      'Remote access from anywhere via app or web',
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=hydrawise+setup',
    manualUrl: 'https://support.hydrawise.com/',
  },
  
  'orbit': {
    id: 'orbit',
    name: 'Orbit B-hyve',
    models: ['B-hyve Smart', 'B-hyve XR', 'B-hyve XD'],
    instructions: {
      setStationRuntime: [
        'Open B-hyve app',
        'Tap "Zones"',
        'Select zone',
        'Tap "Run Time"',
        'Set minutes using slider or number pad',
        'Save changes',
      ],
      setWateringDays: [
        'Tap "Programs"',
        'Create or edit program',
        'Select "Custom" schedule',
        'Tap each day to enable/disable',
        'Or use "Smart Watering" for automatic scheduling',
      ],
      setStartTime: [
        'In program settings, tap "Start Time"',
        'Use time picker',
        'Can add multiple start times',
        'App recommends early morning (4-7 AM)',
      ],
      enableCycleAndSoak: [
        'Edit zone settings',
        'Set "Soil Type" (determines cycle duration)',
        'Set "Slope" (determines soak time)',
        'App automatically enables cycle-and-soak if needed',
      ],
    },
    tips: [
      'WeatherSense feature auto-adjusts for rain',
      'Very affordable smart controller option',
      'Easy DIY installation with step-by-step app guide',
      'Compatible with Alexa and Google Home',
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=orbit+bhyve+setup',
    manualUrl: 'https://bhyve.orbitonline.com/support/',
  },
};

// Get controller by name (fuzzy match)
export function getControllerByName(name: string): ControllerBrand | null {
  const searchTerm = name.toLowerCase();
  
  for (const controller of Object.values(CONTROLLER_BRANDS)) {
    if (controller.name.toLowerCase().includes(searchTerm)) {
      return controller;
    }
    
    // Check model numbers
    for (const model of controller.models) {
      if (model.toLowerCase().includes(searchTerm)) {
        return controller;
      }
    }
  }
  
  return null;
}

// Get all controller brands for selection
export function getAllControllers(): ControllerBrand[] {
  return Object.values(CONTROLLER_BRANDS);
}

// Detect likely controller from location/description
export function detectController(description: string): ControllerBrand | null {
  const lower = description.toLowerCase();
  
  const keywords = {
    rainbird: ['rain bird', 'rainbird', 'esp', 'tm2', 'sst'],
    hunter: ['hunter', 'pro-c', 'x-core', 'icc'],
    rachio: ['rachio', 'smart controller', 'wifi controller'],
    toro: ['toro', 'ddc', 'vision', 'evolution'],
    hydrawise: ['hydrawise', 'hunter wifi'],
    orbit: ['orbit', 'bhyve', 'b-hyve'],
  };
  
  for (const [key, terms] of Object.entries(keywords)) {
    if (terms.some(term => lower.includes(term))) {
      return CONTROLLER_BRANDS[key];
    }
  }
  
  return null;
}
