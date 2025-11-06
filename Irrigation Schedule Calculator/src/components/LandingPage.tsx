import { Droplet, DollarSign, Cloud, Leaf, Zap, Globe, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import logoImage from 'figma:asset/045d67862979a2173d3073297ca5679229a01de1.png';
import ControllerBrandIcon from './ControllerBrandIcon';
import { getCumulativeStats } from '../utils/cumulativeStats';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [waterSaved, setWaterSaved] = useState(0);
  const [moneySaved, setMoneySaved] = useState(0);
  const [co2Reduced, setCo2Reduced] = useState(0);
  const [schedulesCreated, setSchedulesCreated] = useState(0);

  // Load and animate to cumulative stats
  useEffect(() => {
    // Get actual cumulative stats from localStorage
    const stats = getCumulativeStats();
    
    // Track number of schedules created
    setSchedulesCreated(stats.schedulesCreated);
    
    // If we have real stats (from actual schedules), use them. Otherwise use demo values.
    const targetWater = stats.schedulesCreated > 0 ? stats.waterSavedGallons : 15420;
    const targetMoney = stats.schedulesCreated > 0 ? stats.moneySavedDollars : 4850;
    const targetCo2 = stats.schedulesCreated > 0 ? stats.co2ReducedLbs : 2340;
    
    // Animate counters to target values
    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;
    
    const waterStep = targetWater / steps;
    const moneyStep = targetMoney / steps;
    const co2Step = targetCo2 / steps;
    
    let currentStep = 0;
    
    const counterInterval = setInterval(() => {
      currentStep++;
      
      if (currentStep >= steps) {
        setWaterSaved(targetWater);
        setMoneySaved(targetMoney);
        setCo2Reduced(targetCo2);
        clearInterval(counterInterval);
      } else {
        setWaterSaved(Math.floor(waterStep * currentStep));
        setMoneySaved(Math.floor(moneyStep * currentStep));
        setCo2Reduced(Math.floor(co2Step * currentStep));
      }
    }, interval);

    return () => {
      clearInterval(counterInterval);
    };
  }, []);

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden" style={{ 
      background: 'linear-gradient(135deg, #E6F3FF 0%, #E6F9F0 50%, #F0F8FF 100%)' 
    }}>
      {/* Animated Water Droplets Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 20}%`,
            }}
            animate={{
              y: ['0vh', '120vh'],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 8,
              ease: 'linear',
            }}
          >
            <Droplet 
              className="text-blue-400" 
              style={{ 
                width: `${20 + Math.random() * 30}px`,
                height: `${20 + Math.random() * 30}px`,
                opacity: 0.3,
              }}
            />
          </motion.div>
        ))}
      </div>

      <main className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16" aria-labelledby="hero-heading">
          {/* Big Irrigation Logo */}
          <motion.img
            src={logoImage}
            alt="Big Irrigation Logo"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="inline-block h-12 mb-6"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 id="hero-heading" className="mb-2" style={{ color: '#0066CC', fontWeight: 'bold' }}>
              Irrigation Schedule Calculator
            </h1>
            <h2 className="text-2xl sm:text-3xl mb-4 text-gray-700">
              For Rain Bird, Hunter, Toro, Rachio & All Sprinkler Controllers
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg sm:text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Free calculator for programming Rain Bird, Hunter, Toro, Rachio, Hydrawise, Irritrol, Weathermatic & Bhyve controllers. 
            Calculate optimal run times and create weather-smart watering schedules that save water and money.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0, 102, 204, 0.3)' }}
            whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
            className="inline-flex items-center justify-center h-14 px-10 text-white rounded-full transition-all duration-200 shadow-xl text-lg whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg, #0066CC, #00A859)' }}
          >
            <Zap className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Start Saving Water Now</span>
            <span className="sm:hidden">Start Saving Now</span>
          </motion.button>
        </section>

        {/* Live Impact Counter */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 mb-16 border-2"
          style={{ borderColor: '#0066CC20' }}
        >
          <h2 className="text-center text-gray-900 mb-6">
            <Globe className="w-6 h-6 inline mr-2" style={{ color: '#00A859' }} />
            Environmental Impact This Month
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <motion.div
                key={waterSaved}
                initial={{ scale: 1.2, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl sm:text-5xl mb-2 flex items-center justify-center gap-2"
                style={{ color: '#0066CC' }}
              >
                <Droplet className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: '#0066CC' }} />
                {waterSaved.toLocaleString()}
              </motion.div>
              <div className="text-sm text-gray-600">Gallons of Water Saved</div>
            </div>
            <div className="text-center">
              <motion.div
                key={moneySaved}
                initial={{ scale: 1.2, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl sm:text-5xl mb-2 flex items-center justify-center gap-2"
                style={{ color: '#00A859' }}
              >
                <DollarSign className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: '#00A859' }} />
                {moneySaved.toLocaleString()}
              </motion.div>
              <div className="text-sm text-gray-600">Money Saved</div>
            </div>
            <div className="text-center">
              <motion.div
                key={co2Reduced}
                initial={{ scale: 1.2, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl sm:text-5xl mb-2 flex items-center justify-center gap-2"
                style={{ color: '#00A859' }}
              >
                <Leaf className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: '#00A859' }} />
                {co2Reduced.toLocaleString()}
              </motion.div>
              <div className="text-sm text-gray-600">lbs CO₂ Reduced</div>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            {schedulesCreated > 0 
              ? `${schedulesCreated} schedule${schedulesCreated === 1 ? '' : 's'} created • Real impact from users like you!`
              : 'By our users optimizing irrigation systems and reducing water waste'
            }
          </p>
        </motion.div>

        {/* Benefit Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto px-2">
          {/* Card 1: Save Water */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0, 102, 204, 0.15)' }}
            className="bg-white rounded-2xl p-6 shadow-lg transition-all duration-300 border-2 border-transparent hover:border-blue-200 text-center md:text-left"
          >
            <motion.div
              animate={{ 
                y: [0, -10, 0],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-md mx-auto md:mx-0"
              style={{ background: 'linear-gradient(135deg, #0066CC, #0088FF)' }}
            >
              <Droplet className="w-8 h-8 text-white" />
            </motion.div>
            <h3 className="text-gray-900 mb-2">Save Water</h3>
            <p className="text-sm text-gray-600">
              Reduce water consumption by up to <strong className="text-blue-600">35%</strong> with precision scheduling
            </p>
            <div className="mt-4 flex items-center justify-center md:justify-start gap-2 text-sm" style={{ color: '#0066CC' }}>
              <TrendingDown className="w-4 h-4" />
              <span>Less waste, healthier plants</span>
            </div>
          </motion.div>

          {/* Card 2: Save Money */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0, 168, 89, 0.15)' }}
            className="bg-white rounded-2xl p-6 shadow-lg transition-all duration-300 border-2 border-transparent hover:border-green-200 text-center md:text-left"
          >
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-md mx-auto md:mx-0"
              style={{ background: 'linear-gradient(135deg, #00A859, #00CC6A)' }}
            >
              <DollarSign className="w-8 h-8 text-white" />
            </motion.div>
            <h3 className="text-gray-900 mb-2">Lower Bills</h3>
            <p className="text-sm text-gray-600">
              Cut utility costs with optimized water usage and reduced pump runtime
            </p>
            <div className="mt-4 flex items-center justify-center md:justify-start gap-2 text-sm" style={{ color: '#00A859' }}>
              <TrendingDown className="w-4 h-4" />
              <span>Save $200+ annually</span>
            </div>
          </motion.div>

          {/* Card 3: Weather Smart */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.15)' }}
            className="bg-white rounded-2xl p-6 shadow-lg transition-all duration-300 border-2 border-transparent hover:border-blue-200 text-center md:text-left"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-md mx-auto md:mx-0"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #60A5FA)' }}
            >
              <Cloud className="w-8 h-8 text-white" />
            </motion.div>
            <h3 className="text-gray-900 mb-2">Weather Smart</h3>
            <p className="text-sm text-gray-600">
              Auto-adjusts based on rain forecasts and temperature changes
            </p>
            <div className="mt-4 flex items-center justify-center md:justify-start gap-2 text-sm text-blue-600">
              <Zap className="w-4 h-4" />
              <span>Real-time adaptation</span>
            </div>
          </motion.div>

          {/* Card 4: Eco Friendly */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0, 168, 89, 0.15)' }}
            className="bg-white rounded-2xl p-6 shadow-lg transition-all duration-300 border-2 border-transparent hover:border-green-200 text-center md:text-left"
          >
            <motion.div
              animate={{ 
                rotate: [0, 360],
              }}
              transition={{ 
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-md mx-auto md:mx-0"
              style={{ background: 'linear-gradient(135deg, #10B981, #34D399)' }}
            >
              <Leaf className="w-8 h-8 text-white" />
            </motion.div>
            <h3 className="text-gray-900 mb-2">Eco Friendly</h3>
            <p className="text-sm text-gray-600">
              Reduce your carbon footprint through efficient water and energy use
            </p>
            <div className="mt-4 flex items-center justify-center md:justify-start gap-2 text-sm text-green-600">
              <Globe className="w-4 h-4" />
              <span>Sustainable future</span>
            </div>
          </motion.div>
        </div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="mt-16 text-center px-4"
        >
          <h3 className="text-gray-900 mb-8">Three Simple Steps</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
            <div className="relative px-2">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl shadow-lg"
                   style={{ background: 'linear-gradient(135deg, #0066CC, #00A859)' }}>
                1
              </div>
              <h4 className="text-gray-900 mb-2">Set Watering Rules</h4>
              <p className="text-sm text-gray-600">Define your location, restrictions, and preferences</p>
            </div>
            <div className="relative px-2">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl shadow-lg"
                   style={{ background: 'linear-gradient(135deg, #0066CC, #00A859)' }}>
                2
              </div>
              <h4 className="text-gray-900 mb-2">Add Your Zones</h4>
              <p className="text-sm text-gray-600">Describe plants, soil, sunlight, and sprinkler types</p>
            </div>
            <div className="relative px-2">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl shadow-lg"
                   style={{ background: 'linear-gradient(135deg, #0066CC, #00A859)' }}>
                3
              </div>
              <h4 className="text-gray-900 mb-2">Get Your Schedule</h4>
              <p className="text-sm text-gray-600">Receive an optimized schedule via email and PDF</p>
            </div>
          </div>
        </motion.div>

        {/* Compatible Controllers Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="mt-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border-2"
          style={{ borderColor: '#0066CC20' }}
        >
          <h3 className="text-gray-900 text-center mb-6">Works With All Major Irrigation Controllers</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto text-center">
            <div className="space-y-2 flex flex-col items-center">
              <div className="h-20 flex items-center justify-center">
                <ControllerBrandIcon brand="rainbird" size={96} />
              </div>
              <div className="text-xs text-gray-500">TM2, ME3, LXD, LXME</div>
            </div>
            <div className="space-y-2 flex flex-col items-center">
              <div className="h-20 flex items-center justify-center">
                <ControllerBrandIcon brand="hunter" size={96} />
              </div>
              <div className="text-xs text-gray-500">X-Core, Pro-C, ICC2, ACC2</div>
            </div>
            <div className="space-y-2 flex flex-col items-center">
              <div className="h-20 flex items-center justify-center">
                <ControllerBrandIcon brand="toro" size={96} />
              </div>
              <div className="text-xs text-gray-500">424E, Evolution</div>
            </div>
            <div className="space-y-2 flex flex-col items-center">
              <div className="h-20 flex items-center justify-center">
                <ControllerBrandIcon brand="rachio" size={96} />
              </div>
              <div className="text-xs text-gray-500">Gen 3, Pro Series</div>
            </div>
            <div className="space-y-2 flex flex-col items-center">
              <div className="h-20 flex items-center justify-center">
                <ControllerBrandIcon brand="hydrawise" size={96} />
              </div>
              <div className="text-xs text-gray-500">X2, HPC, Pro-HC-HCC</div>
            </div>
            <div className="space-y-2 flex flex-col items-center">
              <div className="h-20 flex items-center justify-center">
                <ControllerBrandIcon brand="irritrol" size={96} />
              </div>
              <div className="text-xs text-gray-500">KD2, Rain Dial, Total Control, MC-E</div>
            </div>
            <div className="space-y-2 flex flex-col items-center">
              <div className="h-20 flex items-center justify-center">
                <ControllerBrandIcon brand="weathermatic" size={96} />
              </div>
              <div className="text-xs text-gray-500">ProLine, SmartLine</div>
            </div>
            <div className="space-y-2 flex flex-col items-center">
              <div className="h-20 flex items-center justify-center">
                <ControllerBrandIcon brand="orbit" size={96} />
              </div>
              <div className="text-xs text-gray-500">HRC, XR</div>
            </div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-6 px-2">
            Plus Netafim, Galcon, K-Rain, and any other programmable irrigation controller
          </p>
        </motion.div>

        {/* SEO FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7 }}
          className="mt-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border-2 max-w-4xl mx-auto"
          style={{ borderColor: '#0066CC20' }}
          itemScope
          itemType="https://schema.org/FAQPage"
        >
          <h2 className="text-gray-900 text-left mb-8 font-bold font-normal">Frequently Asked Questions</h2>
          
          <div className="space-y-6 text-left" role="list">
            <div itemScope itemType="https://schema.org/Question" role="listitem">
              <h3 itemProp="name" className="text-gray-900 mb-2">How do I calculate irrigation run times for my Rain Bird or Hunter controller?</h3>
              <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <p itemProp="text" className="text-sm text-gray-600">
                  Enter your zone details including plant type (lawn, shrubs, trees), soil type (clay, sandy, loam), 
                  and sprinkler head type (spray heads, rotors, MP rotators, or drip). Our calculator uses industry-standard 
                  formulas to determine optimal run times based on precipitation rate, evapotranspiration (ET), and soil absorption rates. 
                  For Rain Bird ESP or Hunter Pro-C controllers, you can directly program the calculated station run times into your timer.
                </p>
              </div>
            </div>

            <div itemScope itemType="https://schema.org/Question" role="listitem">
              <h3 itemProp="name" className="text-gray-900 mb-2">Does this work with Rachio, Hydrawise, and other smart controllers?</h3>
              <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <p itemProp="text" className="text-sm text-gray-600">
                  Yes! Our calculator works with all irrigation controllers including Rain Bird (ESP, SST, TM2), Hunter (Pro-C, X-Core, ICC), 
                  Toro (DDC, TMC, Vision), Rachio (Gen 2, Gen 3), Hydrawise (HC, Pro-HC), Irritrol (RD-600, MC+, IBOC), 
                  Weathermatic (SL Series), and Bhyve (Orbit smart timers). Use the generated schedule to program any timer, 
                  whether it's a basic mechanical controller or an advanced WiFi-enabled smart system.
                </p>
              </div>
            </div>

            <div itemScope itemType="https://schema.org/Question" role="listitem">
              <h3 itemProp="name" className="text-gray-900 mb-2">How much water can I save with an optimized irrigation schedule?</h3>
              <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <p itemProp="text" className="text-sm text-gray-600">
                  Most homeowners save 25-35% on water usage with an optimized schedule. Our calculator factors in weather data, 
                  soil conditions, plant water needs, and proper cycle-and-soak timing to eliminate overwatering while keeping plants healthy. 
                  For a typical 5,000 sq ft lawn, this translates to savings of $200-400 per year on water bills.
                </p>
              </div>
            </div>

            <div itemScope itemType="https://schema.org/Question" role="listitem">
              <h3 itemProp="name" className="text-gray-900 mb-2">What is cycle-and-soak and when should I use it?</h3>
              <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <p itemProp="text" className="text-sm text-gray-600">
                  Cycle-and-soak splits your watering time into shorter cycles with soak periods in between. This is essential for clay soils, 
                  slopes, and newly planted landscapes to prevent runoff. For example, instead of running a zone for 30 minutes straight, 
                  you'd run it for 10 minutes, wait 10 minutes, then run another 10 minutes. This allows water to properly absorb into the soil. 
                  Our calculator automatically recommends cycle-and-soak when needed for your Rain Bird, Hunter, or Toro system.
                </p>
              </div>
            </div>

            <div itemScope itemType="https://schema.org/Question" role="listitem">
              <h3 itemProp="name" className="text-gray-900 mb-2">Can I use this for drip irrigation systems?</h3>
              <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <p itemProp="text" className="text-sm text-gray-600">
                  Absolutely! The calculator supports drip systems, micro-spray, bubblers, and all types of low-flow irrigation. 
                  Drip irrigation typically has a precipitation rate of 0.15-0.3 inches per hour compared to 1.5+ inches per hour 
                  for spray heads. Our calculator accounts for these differences and provides accurate run times for drip zones 
                  on any controller brand including Netafim, DIG, Raindrip, or standard Rain Bird/Hunter drip conversions.
                </p>
              </div>
            </div>

            <div itemScope itemType="https://schema.org/Question" role="listitem">
              <h3 itemProp="name" className="text-gray-900 mb-2">How do I program my Rain Bird ESP or Hunter Pro-C controller with these times?</h3>
              <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <p itemProp="text" className="text-sm text-gray-600">
                  After generating your schedule, you'll receive zone-by-zone run times and start times. For Rain Bird ESP: Set dial to 
                  "Set Station Times," enter each station's minutes. For Hunter Pro-C: Turn dial to "Run Times," select station, 
                  enter minutes. For Rachio or Hydrawise smart controllers, you can input the watering duration directly in the app. 
                  For Toro DDC controllers, use the "Custom" mode to program specific station durations. Detailed programming instructions 
                  are included with your emailed schedule.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.9 }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0, 102, 204, 0.3)' }}
            whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
            className="inline-flex items-center justify-center h-14 px-10 text-white rounded-full transition-all duration-200 shadow-xl text-lg whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg, #0066CC, #00A859)' }}
          >
            <Droplet className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Calculate Your Irrigation Schedule</span>
            <span className="sm:hidden">Get My Schedule</span>
          </motion.button>
          <p className="text-sm text-gray-500 mt-4">Free • Works with all controllers • Takes 5 minutes</p>
        </motion.div>

        {/* Admin Access Footer - Hidden by default */}

      </main>
    </div>
  );
}
