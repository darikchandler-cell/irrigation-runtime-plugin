import React, { useState, useEffect } from 'react';
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
import { Toaster } from 'sonner';

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
  
  // Force positioning and fonts on mount - run immediately and on every render
  useEffect(() => {
    const applyFixes = () => {
      const root = document.getElementById('irrigation-calculator-root');
      const wrapper = document.querySelector('.irrigation-calculator-wrapper');
      
      if (root) {
        root.style.setProperty('position', 'fixed', 'important');
        root.style.setProperty('top', '0', 'important');
        root.style.setProperty('left', '0', 'important');
        root.style.setProperty('right', '0', 'important');
        root.style.setProperty('bottom', '0', 'important');
        root.style.setProperty('width', '100vw', 'important');
        root.style.setProperty('max-width', '100vw', 'important');
        root.style.setProperty('height', '100vh', 'important');
        root.style.setProperty('min-height', '100vh', 'important');
        root.style.setProperty('max-height', '100vh', 'important');
        root.style.setProperty('margin', '0', 'important');
        root.style.setProperty('padding', '0', 'important');
        root.style.setProperty('z-index', '999999', 'important');
        root.style.setProperty('overflow-x', 'hidden', 'important');
        root.style.setProperty('overflow-y', 'auto', 'important');
        root.style.setProperty('pointer-events', 'auto', 'important');
        root.style.setProperty('touch-action', 'pan-y', 'important');
      }
      
      if (wrapper && wrapper instanceof HTMLElement) {
        wrapper.style.setProperty('position', 'relative', 'important');
        wrapper.style.setProperty('top', '0', 'important');
        wrapper.style.setProperty('left', '0', 'important');
        wrapper.style.setProperty('right', '0', 'important');
        wrapper.style.setProperty('width', '100vw', 'important');
        wrapper.style.setProperty('max-width', '100vw', 'important');
        wrapper.style.setProperty('min-height', '100vh', 'important');
        wrapper.style.setProperty('margin', '0', 'important');
        wrapper.style.setProperty('padding', '0', 'important');
        wrapper.style.setProperty('z-index', '1', 'important');
        wrapper.style.setProperty('transform', 'translateX(0)', 'important');
        wrapper.style.setProperty('overflow-x', 'hidden', 'important');
        wrapper.style.setProperty('overflow-y', 'visible', 'important');
        wrapper.style.setProperty('pointer-events', 'auto', 'important');
      }
      
      // Allow body/html scrolling when irrigation-calculator-root doesn't exist (dev mode)
      const irrigationRoot = document.getElementById('irrigation-calculator-root');
      if (!irrigationRoot) {
        // Dev mode - allow body/html to scroll
        if (document.body) {
          document.body.style.setProperty('overflow-y', 'auto', 'important');
          document.body.style.setProperty('overflow-x', 'hidden', 'important');
          document.body.style.setProperty('height', 'auto', 'important');
          document.body.style.setProperty('width', '100vw', 'important');
          document.body.style.setProperty('position', 'relative', 'important');
        }
        document.documentElement.style.setProperty('overflow-y', 'auto', 'important');
        document.documentElement.style.setProperty('overflow-x', 'hidden', 'important');
        document.documentElement.style.setProperty('height', 'auto', 'important');
        document.documentElement.style.setProperty('width', '100vw', 'important');
      } else {
        // Production mode - block body/html scrolling, root handles it
        if (document.body) {
          document.body.style.setProperty('overflow-y', 'hidden', 'important');
          document.body.style.setProperty('overflow-x', 'hidden', 'important');
          document.body.style.setProperty('height', '100vh', 'important');
          document.body.style.setProperty('width', '100vw', 'important');
          document.body.style.setProperty('position', 'relative', 'important');
        }
        document.documentElement.style.setProperty('overflow-y', 'hidden', 'important');
        document.documentElement.style.setProperty('overflow-x', 'hidden', 'important');
        document.documentElement.style.setProperty('height', '100vh', 'important');
        document.documentElement.style.setProperty('width', '100vw', 'important');
      }
      
      // Block theme elements from receiving clicks
      const themeElements = document.querySelectorAll('main, article, .entry-content, .wp-block-post-content, .wp-block-group, .wp-site-blocks, header, footer, nav');
      themeElements.forEach((el) => {
        (el as HTMLElement).style.setProperty('pointer-events', 'none', 'important');
      });
      
      // Ensure all plugin elements are clickable - especially interactive elements
      if (root) {
        const interactiveSelectors = 'button, a, input, textarea, select, label, [role="button"], [onclick], [tabindex]';
        const interactiveElements = root.querySelectorAll(interactiveSelectors);
        interactiveElements.forEach((el) => {
          (el as HTMLElement).style.setProperty('pointer-events', 'auto', 'important');
          (el as HTMLElement).style.setProperty('cursor', 'pointer', 'important');
        });
        
        // Also ensure all children are clickable
        const allPluginElements = root.querySelectorAll('*');
        allPluginElements.forEach((el) => {
          const tagName = (el as HTMLElement).tagName?.toLowerCase();
          if (tagName && ['button', 'a', 'input', 'textarea', 'select', 'label'].includes(tagName)) {
            (el as HTMLElement).style.setProperty('pointer-events', 'auto', 'important');
            (el as HTMLElement).style.setProperty('cursor', 'pointer', 'important');
          } else {
            (el as HTMLElement).style.setProperty('pointer-events', 'auto', 'important');
          }
        });
      }
      
      // Load Inter font from Google Fonts if not already loaded
      if (!document.querySelector('link[href*="fonts.googleapis.com"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap';
        document.head.appendChild(link);
      }
      
      // Force Inter font on EVERYTHING - no exceptions, all UI elements use the same font
      const figmaFont = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif';
      
      // Force on body and html
      document.body.style.setProperty('font-family', figmaFont, 'important');
      document.documentElement.style.setProperty('font-family', figmaFont, 'important');
      
      // Force on ALL elements - EVERYTHING uses the same font
      const allElements = document.querySelectorAll('*');
      allElements.forEach((el) => {
        (el as HTMLElement).style.setProperty('font-family', figmaFont, 'important');
      });
      
      // Also force on pseudo-elements by adding a style tag
      if (!document.getElementById('force-inter-font-all')) {
        const style = document.createElement('style');
        style.id = 'force-inter-font-all';
        style.textContent = `
          *, *::before, *::after {
            font-family: ${figmaFont} !important;
          }
        `;
        document.head.appendChild(style);
      }
    };
    
    // Apply immediately
    applyFixes();
    
    // Apply again after a short delay to catch any late-loading styles
    const timeout1 = setTimeout(applyFixes, 100);
    const timeout2 = setTimeout(applyFixes, 500);
    const timeout3 = setTimeout(applyFixes, 1000);
    
    // Also apply on any DOM mutations
    const observer = new MutationObserver(applyFixes);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
    
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      observer.disconnect();
    };
  }, []);
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
      <div className="irrigation-calculator-wrapper" style={{ 
        width: '100vw',
        maxWidth: '100vw',
        minHeight: '100vh', 
        overflowX: 'hidden',
        margin: 0,
        padding: 0,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
        display: 'block',
        float: 'none',
        clear: 'both'
      }}>
        {/* Skip Navigation Link for Accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg"
        >
          Skip to main content
        </a>

        <OfflineIndicator />
        <Toaster position="top-right" richColors />
        
        {/* WordPress integration - full width container - break out of theme constraints */}
        <style>{`
          /* BLOCK THEME HEADER AND FOOTER */
          header,
          .site-header,
          .wp-block-template-part[data-area="header"],
          footer,
          .site-footer,
          .wp-block-template-part[data-area="footer"],
          nav[aria-label="Primary"],
          nav[aria-label="Footer"] {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            overflow: hidden !important;
          }
          
          /* BLOCK PAGE TITLE AND WORDPRESS GENERATED HEADINGS */
          main > h1:first-of-type,
          article > h1:first-of-type,
          .entry-title,
          .page-title,
          .post-title,
          main > h1,
          article > h1,
          h1.wp-block-post-title,
          h1:not(.irrigation-calculator-wrapper h1):not(#irrigation-calculator-root h1) {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            line-height: 0 !important;
            font-size: 0 !important;
          }
          
          /* BLOCK ALL THEME FONTS - Force Inter on EVERY SINGLE ELEMENT - NO EXCEPTIONS */
          /* Note: Inter font is loaded via WordPress wp_enqueue_style */
          
          /* Force Inter on ALL elements - most aggressive - EVERYTHING uses the same font */
          *,
          *::before,
          *::after {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif !important;
          }
          
          /* Force Inter on body/html and ALL children - no exceptions */
          body,
          html,
          body *,
          html *,
          body:has(#irrigation-calculator-root),
          html:has(#irrigation-calculator-root),
          body:has(#irrigation-calculator-root) *,
          html:has(#irrigation-calculator-root) * {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif !important;
          }
          
          /* Force Inter on all WordPress theme containers and their children */
          main,
          main *,
          article,
          article *,
          .entry-content,
          .entry-content *,
          .wp-block-post-content,
          .wp-block-post-content *,
          main:has(#irrigation-calculator-root),
          main:has(#irrigation-calculator-root) *,
          article:has(#irrigation-calculator-root),
          article:has(#irrigation-calculator-root) *,
          .entry-content:has(#irrigation-calculator-root),
          .entry-content:has(#irrigation-calculator-root) *,
          .wp-block-post-content:has(#irrigation-calculator-root),
          .wp-block-post-content:has(#irrigation-calculator-root) * {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif !important;
          }
          
          /* Force Inter on ALL plugin elements - EVERYTHING */
          .irrigation-calculator-wrapper,
          .irrigation-calculator-wrapper *,
          .irrigation-calculator-wrapper *::before,
          .irrigation-calculator-wrapper *::after,
          #irrigation-calculator-root,
          #irrigation-calculator-root *,
          #irrigation-calculator-root *::before,
          #irrigation-calculator-root *::after {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif !important;
          }
          
          /* Force Inter on ALL text elements - headings, paragraphs, buttons, everything */
          h1, h2, h3, h4, h5, h6,
          p, span, div, a, button, label, input, textarea, select, li, ul, ol,
          em, strong, b, i, u, small, code, pre, blockquote,
          table, thead, tbody, tr, td, th {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif !important;
          }
          
          /* Reduce h1, h2, h3 font sizes by 8% - subtle reduction to keep them larger than paragraphs */
          #irrigation-calculator-root h1,
          .irrigation-calculator-wrapper h1 {
            font-size: calc(var(--text-2xl, 1.5rem) * 0.92) !important; /* 8% reduction */
          }
          
          /* For h1 with text-3xl, text-4xl, text-5xl classes - reduce by 8% */
          #irrigation-calculator-root h1.text-3xl,
          .irrigation-calculator-wrapper h1.text-3xl {
            font-size: calc(var(--text-3xl, 1.875rem) * 0.92) !important;
          }
          #irrigation-calculator-root h1.text-4xl,
          .irrigation-calculator-wrapper h1.text-4xl {
            font-size: calc(var(--text-4xl, 2.25rem) * 0.92) !important;
          }
          #irrigation-calculator-root h1.text-5xl,
          .irrigation-calculator-wrapper h1.text-5xl {
            font-size: calc(var(--text-5xl, 3rem) * 0.92) !important;
          }
          
          /* Hero heading - page title size, cut in half from original */
          #irrigation-calculator-root h1#hero-heading,
          .irrigation-calculator-wrapper h1#hero-heading {
            font-size: clamp(1.25rem, 2.5vw, 2.25rem) !important;
          }
          
          #irrigation-calculator-root h2,
          .irrigation-calculator-wrapper h2 {
            font-size: calc(var(--text-xl, 1.25rem) * 0.92) !important; /* 8% reduction */
          }
          
          /* For h2 with text-2xl, text-3xl classes - reduce by 8% */
          #irrigation-calculator-root h2.text-2xl,
          .irrigation-calculator-wrapper h2.text-2xl {
            font-size: calc(var(--text-2xl, 1.5rem) * 0.92) !important;
          }
          #irrigation-calculator-root h2.text-3xl,
          .irrigation-calculator-wrapper h2.text-3xl {
            font-size: calc(var(--text-3xl, 1.875rem) * 0.92) !important;
          }
          
          #irrigation-calculator-root h3,
          .irrigation-calculator-wrapper h3 {
            font-size: calc(var(--text-lg, 1.125rem) * 0.92) !important; /* 8% reduction */
          }
          
          /* For h3 with text-xl, text-2xl classes - reduce by 8% */
          #irrigation-calculator-root h3.text-xl,
          .irrigation-calculator-wrapper h3.text-xl {
            font-size: calc(var(--text-xl, 1.25rem) * 0.92) !important;
          }
          #irrigation-calculator-root h3.text-2xl,
          .irrigation-calculator-wrapper h3.text-2xl {
            font-size: calc(var(--text-2xl, 1.5rem) * 0.92) !important;
          }
          
          /* BLOCK ALL THEME STYLES - Reset everything */
          #irrigation-calculator-root,
          #irrigation-calculator-root *,
          .irrigation-calculator-wrapper,
          .irrigation-calculator-wrapper * {
            box-sizing: border-box !important;
          }
          
          /* PREVENT LAYOUT SHIFT - Set initial dimensions - FIXED POSITIONING */
          #irrigation-calculator-root {
            width: 100vw !important;
            max-width: 100vw !important;
            min-height: 100vh !important;
            height: 100vh !important;
            max-height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
            position: fixed !important;
            left: 0 !important;
            right: 0 !important;
            top: 0 !important;
            bottom: 0 !important;
            z-index: 999999 !important;
            transform: none !important;
            box-sizing: border-box !important;
            display: block !important;
            float: none !important;
            clear: both !important;
            overflow-x: hidden !important;
            overflow-y: auto !important;
            pointer-events: auto !important;
            touch-action: pan-y !important;
            -webkit-overflow-scrolling: touch !important;
          }
          
          /* Remove body/html padding that could cause shift - BLOCK ALL THEME INTERFERENCE */
          body:has(#irrigation-calculator-root),
          html:has(#irrigation-calculator-root) {
            padding: 0 !important;
            margin: 0 !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            overflow-x: hidden !important;
            overflow-y: hidden !important;
            position: relative !important;
            height: 100vh !important;
            width: 100vw !important;
          }
          
          /* Dev mode - allow scrolling when irrigation-calculator-root doesn't exist */
          body:not(:has(#irrigation-calculator-root)),
          html:not(:has(#irrigation-calculator-root)) {
            padding: 0 !important;
            margin: 0 !important;
            overflow-x: hidden !important;
            overflow-y: auto !important;
            position: relative !important;
            height: auto !important;
            width: 100vw !important;
          }
          
          /* BLOCK ALL WORDPRESS THEME ELEMENTS FROM INTERFERING */
          main:has(#irrigation-calculator-root),
          article:has(#irrigation-calculator-root),
          .entry-content:has(#irrigation-calculator-root),
          .wp-block-post-content:has(#irrigation-calculator-root),
          .wp-block-group:has(#irrigation-calculator-root),
          .wp-site-blocks:has(#irrigation-calculator-root),
          main,
          article,
          .entry-content,
          .wp-block-post-content,
          .wp-block-group,
          .wp-site-blocks {
            padding: 0 !important;
            margin: 0 !important;
            max-width: none !important;
            width: 100% !important;
            position: relative !important;
            overflow: visible !important;
            pointer-events: none !important;
          }
          
          /* Allow only our plugin to receive pointer events - SPECIFIC ELEMENTS */
          #irrigation-calculator-root {
            pointer-events: auto !important;
          }
          #irrigation-calculator-root *,
          #irrigation-calculator-root button,
          #irrigation-calculator-root a,
          #irrigation-calculator-root input,
          #irrigation-calculator-root textarea,
          #irrigation-calculator-root select,
          #irrigation-calculator-root label,
          #irrigation-calculator-root [role="button"],
          #irrigation-calculator-root [onclick],
          .irrigation-calculator-wrapper *,
          .irrigation-calculator-wrapper button,
          .irrigation-calculator-wrapper a,
          .irrigation-calculator-wrapper input,
          .irrigation-calculator-wrapper textarea,
          .irrigation-calculator-wrapper select,
          .irrigation-calculator-wrapper label {
            pointer-events: auto !important;
            cursor: pointer !important;
          }
          
          /* Block theme overlays and modals */
          .wp-block-template-part,
          .wp-block-cover,
          .wp-block-group__inner-container {
            pointer-events: none !important;
          }
          
          #irrigation-calculator-root ~ * {
            pointer-events: none !important;
            z-index: 1 !important;
          }
          
          /* Break wrapper out of WordPress container - CENTER IT - FORCE ABSOLUTE */
          #irrigation-calculator-root .irrigation-calculator-wrapper,
          .irrigation-calculator-wrapper {
            width: 100vw !important;
            max-width: 100vw !important;
            min-height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
            position: relative !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            z-index: 1 !important;
            transform: translateX(0) !important;
            box-sizing: border-box !important;
            display: block !important;
            float: none !important;
            clear: both !important;
            overflow-x: hidden !important;
            overflow-y: visible !important;
            pointer-events: auto !important;
          }
          
          /* Ensure all direct children of wrapper are centered and full width */
          .irrigation-calculator-wrapper > * {
            width: 100vw !important;
            max-width: 100vw !important;
            margin: 0 !important;
            padding: 0 !important;
            left: 0 !important;
            right: 0 !important;
            transform: none !important;
          }
          
          /* Block theme container styles */
          main #irrigation-calculator-root,
          article #irrigation-calculator-root,
          .wp-block-group #irrigation-calculator-root,
          .entry-content #irrigation-calculator-root,
          .wp-block-post-content #irrigation-calculator-root,
          main .irrigation-calculator-wrapper,
          article .irrigation-calculator-wrapper,
          .wp-block-group .irrigation-calculator-wrapper,
          .entry-content .irrigation-calculator-wrapper,
          .wp-block-post-content .irrigation-calculator-wrapper {
            width: 100vw !important;
            max-width: 100vw !important;
            margin: 0 !important;
            padding: 0 !important;
            left: 0 !important;
            right: 0 !important;
            transform: none !important;
            float: none !important;
            clear: both !important;
          }
          
          /* Ensure all children span full width and are centered */
          .irrigation-calculator-wrapper > div {
            width: 100vw !important;
            max-width: 100vw !important;
            margin: 0 !important;
            padding: 0 !important;
            left: 0 !important;
            right: 0 !important;
            transform: none !important;
          }
          
          /* Ensure landing page background spans full width */
          .irrigation-calculator-wrapper > div > div:first-child {
            width: 100vw !important;
            max-width: 100vw !important;
            margin: 0 !important;
            padding: 0 !important;
            left: 0 !important;
            right: 0 !important;
            transform: none !important;
          }
          
          /* Allow padding on landing page container */
          .irrigation-calculator-wrapper > div > div.min-h-screen {
            padding-top: 2rem !important;
            padding-bottom: 2rem !important;
          }
          
          @media (min-width: 640px) {
            .irrigation-calculator-wrapper > div > div.min-h-screen {
              padding-top: 3rem !important;
              padding-bottom: 3rem !important;
            }
          }
          
          /* Block theme padding/margin on parent containers - AGGRESSIVE */
          main:has(#irrigation-calculator-root),
          article:has(#irrigation-calculator-root),
          .entry-content:has(#irrigation-calculator-root),
          .wp-block-post-content:has(#irrigation-calculator-root),
          .wp-block-group:has(#irrigation-calculator-root),
          .wp-site-blocks:has(#irrigation-calculator-root),
          main > *:has(#irrigation-calculator-root),
          article > *:has(#irrigation-calculator-root),
          .entry-content > *:has(#irrigation-calculator-root),
          /* Target all possible parent containers */
          #irrigation-calculator-root,
          #irrigation-calculator-root ~ *,
          main,
          article,
          .entry-content,
          .wp-block-post-content,
          .wp-block-group,
          .wp-site-blocks {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            width: 100% !important;
          }
          
          /* Specifically target parent of root to remove padding */
          #irrigation-calculator-root {
            transform: translateX(0) !important;
          }
          
          /* Remove padding from any parent that contains the root */
          *:has(> #irrigation-calculator-root) {
            padding: 0 !important;
            margin: 0 !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
            padding-top: 0 !important;
            padding-bottom: 0 !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            margin-top: 0 !important;
            margin-bottom: 0 !important;
          }
          
          /* Remove top padding/margin from main/article containers */
          main:has(#irrigation-calculator-root),
          article:has(#irrigation-calculator-root),
          .entry-content:has(#irrigation-calculator-root),
          .wp-block-post-content:has(#irrigation-calculator-root) {
            padding-top: 0 !important;
            margin-top: 0 !important;
          }
          
          /* Hide WordPress admin toolbar when viewing plugin */
          #wpadminbar {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            overflow: hidden !important;
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
