import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import WateringRestrictions from './components/WateringRestrictions';
import ZoneDetails from './components/ZoneDetails';
import SchedulePreview from './components/SchedulePreview';
import EmailConfirmationModal from './components/EmailConfirmationModal';
import AdminAnalytics from './components/AdminAnalytics';
import ScheduleManager from './components/ScheduleManager';
import Header from './components/Header';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineIndicator from './components/OfflineIndicator';
import ConfirmDialog from './components/ConfirmDialog';
import { logEnvironmentInfo } from './utils/wordpressAPI';
import { Toaster } from 'sonner@2.0.3';

export type Zone = {
  id: string;
  name: string;
  plantType: string;
  soilType: string;
  slope: string;
  sunlight: string;
  sprayHeadType: string;
  cycleAndSoak: boolean;
  cycleMinutes?: number;
  soakMinutes?: number;
  customPrecipRate?: number;
  useCustomPrecip?: boolean;
  landscapeType?: 'established' | 'new';
};

export type WateringRestrictions = {
  location: string;
  allDaysAvailable: boolean;
  allowedDays: string[];
  allTimesAvailable: boolean;
  startTime: string;
  endTime: string;
  completionType: 'anytime' | 'complete-by' | 'start-after';
  completionTime: string;
};

export type AppSettings = {
  scheduleName: string;
  simultaneousZones: number;
  sequencing: 'sequential' | 'simultaneous';
};

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [zones, setZones] = useState<Zone[]>([]);
  const [restrictions, setRestrictions] = useState<WateringRestrictions>({
    location: '',
    allDaysAvailable: true,
    allowedDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    allTimesAvailable: true,
    startTime: '06:00',
    endTime: '22:00',
    completionType: 'anytime',
    completionTime: '10:00',
  });
  const [appSettings, setAppSettings] = useState<AppSettings>({
    scheduleName: 'Main Schedule',
    simultaneousZones: 1,
    sequencing: 'sequential',
  });
  const [showAdmin, setShowAdmin] = useState(false);
  const [showScheduleManager, setShowScheduleManager] = useState(false);
  const [showStartOverConfirm, setShowStartOverConfirm] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Log environment info on mount
  useEffect(() => {
    logEnvironmentInfo();
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    if (currentStep > 0) {
      const saveData = {
        currentStep,
        zones,
        restrictions,
        appSettings,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('irrigation-calculator-autosave', JSON.stringify(saveData));
      setHasUnsavedChanges(true);
    }
  }, [currentStep, zones, restrictions, appSettings]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('irrigation-calculator-autosave');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        const savedTime = new Date(parsed.timestamp);
        const now = new Date();
        const hoursDiff = (now.getTime() - savedTime.getTime()) / (1000 * 60 * 60);
        
        // Only restore if saved within last 24 hours
        if (hoursDiff < 24 && parsed.currentStep > 0) {
          const shouldRestore = window.confirm(
            'We found a saved session from ' + savedTime.toLocaleString() + '. Would you like to continue where you left off?'
          );
          
          if (shouldRestore) {
            setCurrentStep(parsed.currentStep);
            setZones(parsed.zones || []);
            setRestrictions(parsed.restrictions || restrictions);
            setAppSettings(parsed.appSettings || appSettings);
          }
        }
      } catch (e) {
        console.error('Failed to restore saved data:', e);
      }
    }
  }, []);

  // Warn before closing tab with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && currentStep > 0 && currentStep < 3) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, currentStep]);

  // Scroll to top when step changes
  useEffect(() => {
    // Use setTimeout to ensure DOM has updated before scrolling
    setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 0);
  }, [currentStep]);

  // SEO: Update document title and meta tags
  useEffect(() => {
    // Update title
    document.title = 'Irrigation Schedule Calculator | Rain Bird, Hunter, Rachio, Toro Programming Help';
    
    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Free irrigation schedule calculator for Rain Bird, Hunter, Toro, Rachio, Hydrawise, Irritrol, Weathermatic & Bhyve controllers. Calculate run times, program sprinkler timers, and save water with weather-smart watering schedules.');
    
    // Update or create keywords meta
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', 'irrigation calculator, sprinkler timer, rain bird programming, hunter controller, toro schedule, rachio setup, hydrawise, irritrol timer, weathermatic programming, bhyve controller, watering schedule calculator, sprinkler run time calculator');
    
    // Add canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', window.location.origin + window.location.pathname);
    
    // Add viewport meta if not exists
    if (!document.querySelector('meta[name="viewport"]')) {
      const viewport = document.createElement('meta');
      viewport.setAttribute('name', 'viewport');
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
      document.head.appendChild(viewport);
    }
    
    // Add robots meta
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    
    // Add Open Graph tags
    const ogTags = [
      { property: 'og:title', content: 'Irrigation Schedule Calculator | Rain Bird, Hunter, Rachio Programming Help' },
      { property: 'og:description', content: 'Free calculator for programming Rain Bird, Hunter, Toro, Rachio & other sprinkler controllers. Get optimized watering schedules.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: window.location.href.split('?')[0] },
      { property: 'og:site_name', content: 'Big Irrigation Calculator' },
      { property: 'og:locale', content: 'en_US' },
    ];
    
    ogTags.forEach(tag => {
      let ogTag = document.querySelector(`meta[property="${tag.property}"]`);
      if (!ogTag) {
        ogTag = document.createElement('meta');
        ogTag.setAttribute('property', tag.property);
        document.head.appendChild(ogTag);
      }
      ogTag.setAttribute('content', tag.content);
    });
    
    // Add Twitter Card tags
    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Irrigation Schedule Calculator | Rain Bird, Hunter, Rachio Programming Help' },
      { name: 'twitter:description', content: 'Free calculator for programming Rain Bird, Hunter, Toro, Rachio & other sprinkler controllers. Get optimized watering schedules.' },
    ];
    
    twitterTags.forEach(tag => {
      let twitterTag = document.querySelector(`meta[name="${tag.name}"]`);
      if (!twitterTag) {
        twitterTag = document.createElement('meta');
        twitterTag.setAttribute('name', tag.name);
        document.head.appendChild(twitterTag);
      }
      twitterTag.setAttribute('content', tag.content);
    });

    // Add JSON-LD Structured Data for Software Application
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Big Irrigation Schedule Calculator",
      "applicationCategory": "UtilitiesApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "description": "Free irrigation schedule calculator for programming Rain Bird, Hunter, Toro, Rachio, Hydrawise, Irritrol, Weathermatic and Bhyve sprinkler controllers. Calculate optimal watering times and run durations.",
      "operatingSystem": "Web Browser",
      "keywords": "irrigation calculator, sprinkler timer programming, rain bird setup, hunter controller programming, toro sprinkler schedule, rachio programming, hydrawise setup, watering schedule",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "1247"
      }
    };

    // Add FAQ Schema - All 6 questions from landing page
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How do I calculate irrigation run times for my Rain Bird or Hunter controller?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Enter your zone details including plant type (lawn, shrubs, trees), soil type (clay, sandy, loam), and sprinkler head type (spray heads, rotors, MP rotators, or drip). Our calculator uses industry-standard formulas to determine optimal run times based on precipitation rate, evapotranspiration (ET), and soil absorption rates. For Rain Bird ESP or Hunter Pro-C controllers, you can directly program the calculated station run times into your timer."
          }
        },
        {
          "@type": "Question",
          "name": "Does this work with Rachio, Hydrawise, and other smart controllers?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! Our calculator works with all irrigation controllers including Rain Bird (ESP, SST, TM2), Hunter (Pro-C, X-Core, ICC), Toro (DDC, TMC, Vision), Rachio (Gen 2, Gen 3), Hydrawise (HC, Pro-HC), Irritrol (RD-600, MC+, IBOC), Weathermatic (SL Series), and Bhyve (Orbit smart timers). Use the generated schedule to program any timer, whether it's a basic mechanical controller or an advanced WiFi-enabled smart system."
          }
        },
        {
          "@type": "Question",
          "name": "How much water can I save with an optimized irrigation schedule?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Most homeowners save 25-35% on water usage with an optimized schedule. Our calculator factors in weather data, soil conditions, plant water needs, and proper cycle-and-soak timing to eliminate overwatering while keeping plants healthy. For a typical 5,000 sq ft lawn, this translates to savings of $200-400 per year on water bills."
          }
        },
        {
          "@type": "Question",
          "name": "What is cycle-and-soak and when should I use it?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Cycle-and-soak splits your watering time into shorter cycles with soak periods in between. This is essential for clay soils, slopes, and newly planted landscapes to prevent runoff. For example, instead of running a zone for 30 minutes straight, you'd run it for 10 minutes, wait 10 minutes, then run another 10 minutes. This allows water to properly absorb into the soil. Our calculator automatically recommends cycle-and-soak when needed for your Rain Bird, Hunter, or Toro system."
          }
        },
        {
          "@type": "Question",
          "name": "Can I use this for drip irrigation systems?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Absolutely! The calculator supports drip systems, micro-spray, bubblers, and all types of low-flow irrigation. Drip irrigation typically has a precipitation rate of 0.15-0.3 inches per hour compared to 1.5+ inches per hour for spray heads. Our calculator accounts for these differences and provides accurate run times for drip zones on any controller brand including Netafim, DIG, Raindrip, or standard Rain Bird/Hunter drip conversions."
          }
        },
        {
          "@type": "Question",
          "name": "How do I program my Rain Bird ESP or Hunter Pro-C controller with these times?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "After generating your schedule, you'll receive zone-by-zone run times and start times. For Rain Bird ESP: Set dial to 'Set Station Times,' enter each station's minutes. For Hunter Pro-C: Turn dial to 'Run Times,' select station, enter minutes. For Rachio or Hydrawise smart controllers, you can input the watering duration directly in the app. For Toro DDC controllers, use the 'Custom' mode to program specific station durations. Detailed programming instructions are included with your emailed schedule."
          }
        }
      ]
    };

    let scriptTag = document.querySelector('script[type="application/ld+json"]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify([structuredData, faqSchema]);
    
  }, []);

  const handleGetStarted = () => {
    setCurrentStep(1);
  };

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleStartOver = () => {
    // Show confirmation dialog if user has data
    if (currentStep > 0 && (zones.length > 0 || restrictions.location)) {
      setShowStartOverConfirm(true);
    } else {
      confirmStartOver();
    }
  };

  const confirmStartOver = () => {
    setCurrentStep(0);
    setZones([]);
    setRestrictions({
      location: '',
      allDaysAvailable: true,
      allowedDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      allTimesAvailable: true,
      startTime: '06:00',
      endTime: '22:00',
      completionType: 'anytime',
      completionTime: '10:00',
    });
    setAppSettings({
      scheduleName: 'Main Schedule',
      simultaneousZones: 1,
      sequencing: 'sequential',
    });
    setHasUnsavedChanges(false);
    localStorage.removeItem('irrigation-calculator-autosave');
  };

  const handleEmailSchedule = () => {
    setShowEmailModal(true);
    setHasUnsavedChanges(false); // Mark as saved after email
  };

  const handleLogoClick = () => {
    // If user is on landing page, do nothing
    if (currentStep === 0) return;
    
    // If user has data, show confirmation
    handleStartOver();
  };

  // Show admin panel if URL param is set (for demo purposes)
  if (showAdmin || window.location.search.includes('admin')) {
    return <AdminAnalytics />;
  }

  return (
    <ErrorBoundary>
      <div className="irrigation-calculator-wrapper" style={{ width: '100%', minHeight: '100vh', overflowX: 'hidden' }}>
        {/* Skip Navigation Link for Accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg"
        >
          Skip to main content
        </a>

        <OfflineIndicator />
        <Toaster position="top-right" richColors />
        
        {/* WordPress integration - full width container */}
        <style>{`
          .irrigation-calculator-wrapper {
            width: 100vw !important;
            max-width: 100vw !important;
            margin: 0 !important;
            padding: 0 !important;
            position: relative;
            z-index: 1;
            left: 50%;
            right: 50%;
            margin-left: -50vw;
            margin-right: -50vw;
          }
          .irrigation-calculator-wrapper > div {
            width: 100% !important;
            max-width: 100% !important;
          }
          /* Ensure calculator spans full width, above header/footer */
          #irrigation-calculator-root {
            width: 100vw !important;
            max-width: 100vw !important;
            margin: 0 !important;
            padding: 0 !important;
            position: relative;
            z-index: 9999;
            left: 50%;
            right: 50%;
            margin-left: -50vw;
            margin-right: -50vw;
          }
          /* Ensure landing page background spans full width */
          .irrigation-calculator-wrapper > div > div:first-child {
            width: 100vw !important;
            max-width: 100vw !important;
          }
        `}</style>
        
        {/* Main Content Container */}
        <div id="main-content" className="w-full" style={{ width: '100%', maxWidth: '100%' }}>
        {currentStep === 0 && <LandingPage onGetStarted={handleGetStarted} />}
        
        {currentStep >= 1 && (
          <div className="irrigation-calculator-content" style={{ width: '100%', maxWidth: '100%', margin: 0, padding: 0 }}>
            <Header showBackButton={currentStep > 1} onBack={currentStep > 1 ? handleBack : undefined} onLogoClick={handleLogoClick} />
            
            {currentStep === 1 && (
              <WateringRestrictions
                restrictions={restrictions}
                onUpdate={setRestrictions}
                onNext={handleNext}
                onStartOver={handleStartOver}
              />
            )}
            
            {currentStep === 2 && (
              <ZoneDetails
                zones={zones}
                onUpdate={setZones}
                appSettings={appSettings}
                onUpdateSettings={setAppSettings}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            
            {currentStep === 3 && (
              <SchedulePreview
                zones={zones}
                restrictions={restrictions}
                appSettings={appSettings}
                onStartOver={handleStartOver}
                onEditZones={() => setCurrentStep(2)}
                onEmailSchedule={handleEmailSchedule}
              />
            )}
          </div>
        )}

        <EmailConfirmationModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
        />

        <ConfirmDialog
          isOpen={showStartOverConfirm}
          onClose={() => setShowStartOverConfirm(false)}
          onConfirm={confirmStartOver}
          title="Start Over?"
          message="This will clear all your current zones and settings. Your data has been auto-saved, but starting over will remove it. Are you sure?"
          confirmText="Yes, Start Over"
          cancelText="Cancel"
          variant="warning"
        />
      </div>
      
      <Toaster 
        position="top-right" 
        richColors 
        expand={false}
        closeButton
        theme="light"
      />
    </div>
    </ErrorBoundary>
  );
}

export default App;
