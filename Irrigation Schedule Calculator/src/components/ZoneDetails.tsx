import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, Copy, ChevronLeft, Info, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import WizardProgress from './WizardProgress';
import { Zone, AppSettings } from '../App';
import { ImageWithFallback } from './figma/ImageWithFallback';

// SVG Slope Icons
const FlatDirtIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="20" width="30" height="12" fill="#8B4513" rx="1"/>
    <rect x="5" y="24" width="30" height="8" fill="#654321" rx="1"/>
    <circle cx="10" cy="26" r="1" fill="#A0522D" opacity="0.6"/>
    <circle cx="15" cy="28" r="0.8" fill="#A0522D" opacity="0.6"/>
    <circle cx="22" cy="27" r="1.2" fill="#A0522D" opacity="0.6"/>
    <circle cx="30" cy="26" r="1" fill="#A0522D" opacity="0.6"/>
  </svg>
);

const ModerateSlopeIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 30 L20 15 L35 25 L35 32 L5 32 Z" fill="#8B4513"/>
    <path d="M5 30 L20 18 L35 27 L35 32 L5 32 Z" fill="#654321"/>
    <circle cx="12" cy="28" r="1" fill="#A0522D" opacity="0.6"/>
    <circle cx="18" cy="24" r="0.8" fill="#A0522D" opacity="0.6"/>
    <circle cx="26" cy="27" r="1.2" fill="#A0522D" opacity="0.6"/>
    <line x1="5" y1="30" x2="35" y2="25" stroke="#D2691E" strokeWidth="0.5" opacity="0.4"/>
  </svg>
);

const SteepSlopeIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 32 L25 8 L35 20 L35 32 Z" fill="#8B4513"/>
    <path d="M5 32 L25 12 L35 23 L35 32 Z" fill="#654321"/>
    <circle cx="10" cy="30" r="1" fill="#A0522D" opacity="0.6"/>
    <circle cx="20" cy="20" r="0.8" fill="#A0522D" opacity="0.6"/>
    <circle cx="28" cy="26" r="1.2" fill="#A0522D" opacity="0.6"/>
    <line x1="5" y1="32" x2="35" y2="20" stroke="#D2691E" strokeWidth="0.5" opacity="0.4"/>
    <line x1="10" y1="28" x2="30" y2="22" stroke="#D2691E" strokeWidth="0.5" opacity="0.3"/>
  </svg>
);

// SVG Soil Type Icons
const ClayIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="10" width="24" height="20" fill="#654321" rx="2"/>
    <rect x="8" y="14" width="24" height="3" fill="#4A2511" opacity="0.4"/>
    <rect x="8" y="20" width="24" height="2" fill="#4A2511" opacity="0.3"/>
    <rect x="8" y="25" width="24" height="3" fill="#4A2511" opacity="0.4"/>
    <circle cx="12" cy="16" r="0.8" fill="#4A2511" opacity="0.5"/>
    <circle cx="28" cy="22" r="0.8" fill="#4A2511" opacity="0.5"/>
    <circle cx="18" cy="27" r="0.8" fill="#4A2511" opacity="0.5"/>
  </svg>
);

const SandyIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="10" width="24" height="20" fill="#F4A460" rx="2"/>
    <circle cx="12" cy="14" r="1.2" fill="#DAA520"/>
    <circle cx="18" cy="16" r="1" fill="#DAA520"/>
    <circle cx="24" cy="14" r="1.3" fill="#DAA520"/>
    <circle cx="15" cy="20" r="1.1" fill="#DAA520"/>
    <circle cx="28" cy="18" r="1" fill="#DAA520"/>
    <circle cx="20" cy="24" r="1.2" fill="#DAA520"/>
    <circle cx="12" cy="26" r="1" fill="#DAA520"/>
    <circle cx="26" cy="26" r="1.1" fill="#DAA520"/>
    <circle cx="16" cy="28" r="0.9" fill="#DAA520"/>
    <circle cx="22" cy="22" r="0.8" fill="#DAA520"/>
  </svg>
);

const LoamIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="10" width="24" height="20" fill="#8B6914" rx="2"/>
    <rect x="8" y="16" width="24" height="2.5" fill="#654321" opacity="0.3"/>
    <rect x="8" y="23" width="24" height="2" fill="#654321" opacity="0.3"/>
    <circle cx="14" cy="13" r="1" fill="#DAA520" opacity="0.6"/>
    <circle cx="22" cy="15" r="0.9" fill="#DAA520" opacity="0.6"/>
    <circle cx="27" cy="20" r="1.1" fill="#DAA520" opacity="0.6"/>
    <circle cx="16" cy="25" r="0.8" fill="#DAA520" opacity="0.6"/>
    <circle cx="24" cy="27" r="1" fill="#DAA520" opacity="0.6"/>
  </svg>
);

const RockyIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="10" width="24" height="20" fill="#696969" rx="2"/>
    <path d="M 14 14 L 17 12 L 20 14 L 18 17 Z" fill="#A9A9A9"/>
    <path d="M 24 16 L 27 14 L 29 17 L 26 19 Z" fill="#A9A9A9"/>
    <path d="M 12 22 L 15 20 L 17 23 L 14 25 Z" fill="#A9A9A9"/>
    <path d="M 22 24 L 26 22 L 28 26 L 24 28 Z" fill="#A9A9A9"/>
    <circle cx="19" cy="20" r="0.8" fill="#5A5A5A"/>
    <circle cx="16" cy="27" r="0.7" fill="#5A5A5A"/>
  </svg>
);

const HeavyClayIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="10" width="24" height="20" fill="#4A2511" rx="2"/>
    <rect x="8" y="13" width="24" height="4" fill="#2A1505" opacity="0.6"/>
    <rect x="8" y="19" width="24" height="3" fill="#2A1505" opacity="0.5"/>
    <rect x="8" y="24" width="24" height="4" fill="#2A1505" opacity="0.6"/>
    <line x1="8" y1="15" x2="32" y2="15" stroke="#2A1505" strokeWidth="0.5" opacity="0.7"/>
    <line x1="8" y1="21" x2="32" y2="21" stroke="#2A1505" strokeWidth="0.5" opacity="0.7"/>
    <line x1="8" y1="27" x2="32" y2="27" stroke="#2A1505" strokeWidth="0.5" opacity="0.7"/>
  </svg>
);

const SandyLoamIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="10" width="24" height="20" fill="#D2B48C" rx="2"/>
    <rect x="8" y="18" width="24" height="2" fill="#8B6914" opacity="0.3"/>
    <circle cx="13" cy="13" r="1" fill="#DAA520" opacity="0.7"/>
    <circle cx="19" cy="15" r="1.1" fill="#DAA520" opacity="0.7"/>
    <circle cx="26" cy="14" r="0.9" fill="#DAA520" opacity="0.7"/>
    <circle cx="15" cy="22" r="1" fill="#DAA520" opacity="0.7"/>
    <circle cx="23" cy="24" r="1.2" fill="#DAA520" opacity="0.7"/>
    <circle cx="28" cy="26" r="0.8" fill="#DAA520" opacity="0.7"/>
  </svg>
);

const SiltIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="10" width="24" height="20" fill="#C19A6B" rx="2"/>
    <rect x="8" y="15" width="24" height="0.8" fill="#8B7355" opacity="0.4"/>
    <rect x="8" y="18" width="24" height="0.8" fill="#8B7355" opacity="0.4"/>
    <rect x="8" y="21" width="24" height="0.8" fill="#8B7355" opacity="0.4"/>
    <rect x="8" y="24" width="24" height="0.8" fill="#8B7355" opacity="0.4"/>
    <rect x="8" y="27" width="24" height="0.8" fill="#8B7355" opacity="0.4"/>
  </svg>
);

const CompactedIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="10" width="24" height="20" fill="#3A3A3A" rx="2"/>
    <rect x="8" y="12" width="24" height="5" fill="#2A2A2A" opacity="0.8"/>
    <rect x="8" y="18" width="24" height="4" fill="#2A2A2A" opacity="0.8"/>
    <rect x="8" y="23" width="24" height="5" fill="#2A2A2A" opacity="0.8"/>
    <line x1="8" y1="14" x2="32" y2="14" stroke="#1A1A1A" strokeWidth="1" opacity="0.9"/>
    <line x1="8" y1="20" x2="32" y2="20" stroke="#1A1A1A" strokeWidth="1" opacity="0.9"/>
    <line x1="8" y1="26" x2="32" y2="26" stroke="#1A1A1A" strokeWidth="1" opacity="0.9"/>
  </svg>
);

const AmendedSoilIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="10" width="24" height="20" fill="#3D2817" rx="2"/>
    <circle cx="12" cy="13" r="1" fill="#8B4513" opacity="0.8"/>
    <circle cx="20" cy="15" r="1.2" fill="#228B22" opacity="0.6"/>
    <circle cx="27" cy="14" r="0.9" fill="#8B4513" opacity="0.8"/>
    <rect x="14" y="19" width="3" height="1.5" fill="#228B22" opacity="0.5" rx="0.5"/>
    <circle cx="24" cy="22" r="1.1" fill="#8B4513" opacity="0.8"/>
    <rect x="16" y="25" width="4" height="1" fill="#228B22" opacity="0.5" rx="0.5"/>
    <circle cx="28" cy="26" r="0.8" fill="#8B4513" opacity="0.8"/>
    <circle cx="12" cy="27" r="1" fill="#228B22" opacity="0.6"/>
  </svg>
);

interface ZoneDetailsProps {
  zones: Zone[];
  onUpdate: (zones: Zone[]) => void;
  appSettings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onNext: () => void;
  onBack: () => void;
}

const plantTypes = [
  { id: 'lawn-cool', label: 'Lawn/Turf', icon: '🌱', advanced: false },
  { id: 'shrubs', label: 'Shrubs', icon: '🌿', advanced: false },
  { id: 'trees', label: 'Trees', icon: '🌳', advanced: false },
  { id: 'vegetables', label: 'Vegetables', icon: '🥕', advanced: false },
  { id: 'flowers', label: 'Flowers', icon: '🌸', advanced: false },
  { id: 'succulents', label: 'Succulents', icon: '🌵', advanced: false },
];

const advancedPlantTypes = [
  { id: 'lawn-cool-season', label: 'Cool Season Turf', sublabel: 'Fescue, Bluegrass, Ryegrass', icon: '🌱', advanced: true },
  { id: 'lawn-warm-season', label: 'Warm Season Turf', sublabel: 'Bermuda, Zoysia, St. Augustine', icon: '🌿', advanced: true },
  { id: 'native-plants', label: 'Native Plants', sublabel: 'Drought-tolerant natives', icon: '🏜️', advanced: true },
  { id: 'groundcover', label: 'Groundcover', sublabel: 'Low-growing spreaders', icon: '🍀', advanced: true },
  { id: 'ornamental-grasses', label: 'Ornamental Grasses', sublabel: 'Decorative grasses', icon: '🌾', advanced: true },
  { id: 'perennials', label: 'Perennials', sublabel: 'Multi-year flowering plants', icon: '🌺', advanced: true },
];

const soilTypes = [
  { id: 'clay', label: 'Clay', iconComponent: ClayIcon, advanced: false },
  { id: 'sandy', label: 'Sandy', iconComponent: SandyIcon, advanced: false },
  { id: 'loam', label: 'Loam', iconComponent: LoamIcon, advanced: false },
  { id: 'rocky', label: 'Rocky', iconComponent: RockyIcon, advanced: false },
];

const advancedSoilTypes = [
  { id: 'clay-heavy', label: 'Heavy Clay', sublabel: 'Very slow drainage', iconComponent: HeavyClayIcon, advanced: true },
  { id: 'sandy-loam', label: 'Sandy Loam', sublabel: 'Fast draining mix', iconComponent: SandyLoamIcon, advanced: true },
  { id: 'silt', label: 'Silt', sublabel: 'Fine particles', iconComponent: SiltIcon, advanced: true },
  { id: 'compacted', label: 'Compacted Soil', sublabel: 'Poor infiltration', iconComponent: CompactedIcon, advanced: true },
  { id: 'amended', label: 'Amended Soil', sublabel: 'Improved with compost', iconComponent: AmendedSoilIcon, advanced: true },
];

const slopes = [
  { id: 'flat', label: 'Flat', sublabel: '0-5%', iconComponent: FlatDirtIcon },
  { id: 'moderate', label: 'Moderate', sublabel: '5-15%', iconComponent: ModerateSlopeIcon },
  { id: 'steep', label: 'Steep', sublabel: '15%+', iconComponent: SteepSlopeIcon },
];

const sunlightLevels = [
  { id: 'full', label: 'Full Sun', sublabel: '6+ hours', icon: '☀️', advanced: false },
  { id: 'partial', label: 'Partial Sun', sublabel: '3-6 hours', icon: '🌤️', advanced: false },
  { id: 'shade', label: 'Shade', sublabel: '<3 hours', icon: '☁️', advanced: false },
];

const advancedSunlightLevels = [
  { id: 'full-sun-8plus', label: 'Full Sun - Hot', sublabel: '8+ hours direct', icon: '☀️', advanced: true },
  { id: 'full-sun-6-8', label: 'Full Sun - Moderate', sublabel: '6-8 hours direct', icon: '☀️', advanced: true },
  { id: 'partial-sun-morning', label: 'Partial - Morning Sun', sublabel: 'Morning light only', icon: '🌤️', advanced: true },
  { id: 'partial-sun-afternoon', label: 'Partial - Afternoon Sun', sublabel: 'Afternoon light only', icon: '🌤️', advanced: true },
  { id: 'dappled-shade', label: 'Dappled Shade', sublabel: 'Filtered through trees', icon: '🌳', advanced: true },
  { id: 'full-shade', label: 'Full Shade', sublabel: 'No direct sun', icon: '☁️', advanced: true },
];

const landscapeTypes = [
  { id: 'established', label: 'Established Landscape', sublabel: 'Mature plants, 1+ years old', icon: '🌳', advanced: false },
  { id: 'new', label: 'New Landscape', sublabel: 'Recently planted, needs extra water', icon: '🌱', advanced: false },
];

const advancedLandscapeTypes = [
  { id: 'established-3plus', label: 'Well Established', sublabel: '3+ years, fully mature', icon: '🌳', advanced: true },
  { id: 'established-1-3', label: 'Established', sublabel: '1-3 years old', icon: '🌲', advanced: true },
  { id: 'new-6-12mo', label: 'New - 6-12 months', sublabel: 'First growing season', icon: '🌱', advanced: true },
  { id: 'new-0-6mo', label: 'New - 0-6 months', sublabel: 'Just planted, critical period', icon: '🌿', advanced: true },
  { id: 'renovation', label: 'Renovation', sublabel: 'Replanted or overseeded', icon: '🔄', advanced: true },
];

// Irrigation Spray Head Types with images
const sprayHeadTypes = [
  { 
    id: 'spray', 
    label: 'Spray Heads', 
    sublabel: 'Fixed pattern spray nozzles',
    precipRate: 1.5,
    image: 'https://www.hunterirrigation.com/sites/default/files/styles/product_landing_thumb/public/2023/06/23/pro-he-nozzle-app_0.png?itok=nzJmq5Ce',
    advanced: false
  },
  { 
    id: 'mp-rotator', 
    label: 'MP Rotator', 
    sublabel: 'Multi-stream rotating nozzles',
    precipRate: 0.4,
    image: 'https://www.hunterirrigation.com/sites/default/files/inline-images/MP-Rotator-Learn-More_0.jpg',
    advanced: false
  },
  { 
    id: 'rotor', 
    label: 'Rotors', 
    sublabel: 'Rotating stream heads for larger areas',
    precipRate: 0.6,
    image: 'https://www.hunterirrigation.com/sites/default/files/styles/product_landing_thumb/public/pl-pgp-adj.jpg?itok=lntV9sv2',
    advanced: false
  },
  { 
    id: 'drip', 
    label: 'Drip System', 
    sublabel: 'Low-flow emitters or drip line',
    precipRate: 0.2,
    image: 'https://www.hunterirrigation.com/sites/default/files/styles/product_landing_thumb/public/pl_micro_hdl.jpg?itok=Wj0onW3y',
    advanced: false
  },
];

// Advanced Sprinkler Types for professionals
const advancedSprayHeadTypes = [
  { 
    id: 'spray-he-van', 
    label: 'HE-VAN Spray Nozzles', 
    sublabel: 'High efficiency variable arc',
    precipRate: 1.5,
    radius: '4-15 ft',
    image: 'https://www.hunterirrigation.com/sites/default/files/styles/product_landing_thumb/public/2023/06/23/pro-he-nozzle-app_0.png?itok=nzJmq5Ce',
    advanced: true
  },
  { 
    id: 'spray-pro', 
    label: 'PRO-Spray PRS40', 
    sublabel: 'Pressure regulated 40 PSI',
    precipRate: 1.6,
    radius: '6-18 ft',
    image: 'https://www.hunterirrigation.com/sites/default/files/styles/product_landing_thumb/public/2023/06/23/pro-he-nozzle-app_0.png?itok=nzJmq5Ce',
    advanced: true
  },
  { 
    id: 'mp-1000', 
    label: 'MP1000', 
    sublabel: 'MP Rotator 90-210°',
    precipRate: 0.4,
    radius: '8-15 ft',
    image: 'https://www.hunterirrigation.com/sites/default/files/inline-images/MP-Rotator-Learn-More_0.jpg',
    advanced: true
  },
  { 
    id: 'mp-2000', 
    label: 'MP2000', 
    sublabel: 'MP Rotator 90-210°',
    precipRate: 0.4,
    radius: '13-21 ft',
    image: 'https://www.hunterirrigation.com/sites/default/files/inline-images/MP-Rotator-Learn-More_0.jpg',
    advanced: true
  },
  { 
    id: 'mp-3000', 
    label: 'MP3000', 
    sublabel: 'MP Rotator 90-360°',
    precipRate: 0.4,
    radius: '22-30 ft',
    image: 'https://www.hunterirrigation.com/sites/default/files/inline-images/MP-Rotator-Learn-More_0.jpg',
    advanced: true
  },
  { 
    id: 'pgp-adj', 
    label: 'PGP-ADJ Rotor', 
    sublabel: 'Adjustable arc gear drive',
    precipRate: 0.6,
    radius: '25-50 ft',
    image: 'https://www.hunterirrigation.com/sites/default/files/styles/product_landing_thumb/public/pl-pgp-adj.jpg?itok=lntV9sv2',
    advanced: true
  },
  { 
    id: 'pgp-ultra', 
    label: 'PGP-ULTRA Rotor', 
    sublabel: 'High efficiency gear drive',
    precipRate: 0.5,
    radius: '32-52 ft',
    image: 'https://www.hunterirrigation.com/sites/default/files/styles/product_landing_thumb/public/pl-pgp-adj.jpg?itok=lntV9sv2',
    advanced: true
  },
  { 
    id: 'i20-rotor', 
    label: 'I-20 Rotor', 
    sublabel: 'Ultra rotor 40-70 PSI',
    precipRate: 0.6,
    radius: '20-42 ft',
    image: 'https://www.hunterirrigation.com/sites/default/files/styles/product_landing_thumb/public/pl-pgp-adj.jpg?itok=lntV9sv2',
    advanced: true
  },
  { 
    id: 'drip-05gph', 
    label: 'Drip 0.5 GPH', 
    sublabel: 'Pressure compensating',
    precipRate: 0.15,
    radius: 'Point source',
    image: 'https://www.hunterirrigation.com/sites/default/files/styles/product_landing_thumb/public/pl_micro_hdl.jpg?itok=Wj0onW3y',
    advanced: true
  },
  { 
    id: 'drip-1gph', 
    label: 'Drip 1.0 GPH', 
    sublabel: 'Pressure compensating',
    precipRate: 0.2,
    radius: 'Point source',
    image: 'https://www.hunterirrigation.com/sites/default/files/styles/product_landing_thumb/public/pl_micro_hdl.jpg?itok=Wj0onW3y',
    advanced: true
  },
  { 
    id: 'drip-2gph', 
    label: 'Drip 2.0 GPH', 
    sublabel: 'Pressure compensating',
    precipRate: 0.3,
    radius: 'Point source',
    image: 'https://www.hunterirrigation.com/sites/default/files/styles/product_landing_thumb/public/pl_micro_hdl.jpg?itok=Wj0onW3y',
    advanced: true
  },
  { 
    id: 'drip-line', 
    label: 'Drip Line 12" spacing', 
    sublabel: 'Inline emitters 0.6 GPH',
    precipRate: 0.25,
    radius: 'Linear',
    image: 'https://www.hunterirrigation.com/sites/default/files/styles/product_landing_thumb/public/pl_micro_hdl.jpg?itok=Wj0onW3y',
    advanced: true
  },
  { 
    id: 'bubbler', 
    label: 'Bubbler', 
    sublabel: 'Flood bubbler 0.5-2.0 GPM',
    precipRate: 2.5,
    radius: '1-3 ft',
    image: 'https://www.hunterirrigation.com/sites/default/files/styles/product_landing_thumb/public/pl_micro_hdl.jpg?itok=Wj0onW3y',
    advanced: true
  },
  { 
    id: 'stream-rotor', 
    label: 'Stream Rotor', 
    sublabel: 'Multi-stream low angle',
    precipRate: 0.5,
    radius: '15-30 ft',
    image: 'https://www.hunterirrigation.com/sites/default/files/styles/product_landing_thumb/public/pl-pgp-adj.jpg?itok=lntV9sv2',
    advanced: true
  },
];

// Advanced precipitation rate presets for irrigation professionals
const advancedPrecipPresets = [
  { id: 'spray-5', label: 'Spray 5\' radius', rate: 2.0 },
  { id: 'spray-8', label: 'Spray 8\' radius', rate: 1.75 },
  { id: 'spray-12', label: 'Spray 12\' radius', rate: 1.5 },
  { id: 'spray-15', label: 'Spray 15\' radius', rate: 1.3 },
  { id: 'mp-1000', label: 'MP1000 (8-15\')', rate: 0.4 },
  { id: 'mp-2000', label: 'MP2000 (13-21\')', rate: 0.4 },
  { id: 'mp-3000', label: 'MP3000 (22-30\')', rate: 0.4 },
  { id: 'mp-3500', label: 'MP3500 (28-35\')', rate: 0.4 },
  { id: 'rotor-small', label: 'Rotor 15-25\'', rate: 0.7 },
  { id: 'rotor-medium', label: 'Rotor 25-35\'', rate: 0.6 },
  { id: 'rotor-large', label: 'Rotor 35-50\'', rate: 0.5 },
  { id: 'drip-05', label: 'Drip 0.5 GPH', rate: 0.15 },
  { id: 'drip-1', label: 'Drip 1.0 GPH', rate: 0.2 },
  { id: 'drip-2', label: 'Drip 2.0 GPH', rate: 0.3 },
  { id: 'bubbler', label: 'Bubbler', rate: 2.5 },
  { id: 'stream', label: 'Stream rotor', rate: 0.5 },
];

export default function ZoneDetails({ zones, onUpdate, appSettings, onUpdateSettings, onNext, onBack }: ZoneDetailsProps) {
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone>({
    id: '',
    name: '',
    plantType: '',
    soilType: '',
    slope: '',
    sunlight: '',
    sprayHeadType: '',
    cycleAndSoak: false,
    cycleMinutes: 10,
    soakMinutes: 10,
    customPrecipRate: 1.0,
    useCustomPrecip: false,
    landscapeType: 'established',
  });
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | null>(null);

  // Auto-save when all required fields are filled
  useEffect(() => {
    if (!activeZoneId) return;
    
    const isComplete = editingZone.plantType && 
                       editingZone.soilType && 
                       editingZone.slope && 
                       editingZone.sunlight && 
                       editingZone.sprayHeadType &&
                       editingZone.landscapeType;
    
    if (isComplete) {
      const timer = setTimeout(() => {
        handleAutoSave();
      }, 800); // Debounce auto-save
      
      return () => clearTimeout(timer);
    }
  }, [editingZone, activeZoneId]);

  const handleAutoSave = () => {
    setSaveStatus('saving');
    
    // Auto-recommend Cycle and Soak for clay/loam and slopes
    const shouldUseCycleAndSoak = 
      editingZone.soilType === 'clay' || 
      editingZone.soilType === 'loam' || 
      editingZone.slope === 'moderate' || 
      editingZone.slope === 'steep';
    
    // Calculate cycle and soak times based on conditions
    let cycleMinutes = 10;
    let soakMinutes = 10;
    
    if (shouldUseCycleAndSoak) {
      // Clay soil needs shorter cycles
      if (editingZone.soilType === 'clay') {
        cycleMinutes = 8;
        soakMinutes = 12;
      }
      // Steep slopes need more soak time
      if (editingZone.slope === 'steep') {
        cycleMinutes = 7;
        soakMinutes = 15;
      }
      // New landscape needs gentler application
      if (editingZone.landscapeType === 'new') {
        cycleMinutes = 6;
        soakMinutes = 12;
      }
    }
    
    const finalZone = {
      ...editingZone,
      cycleAndSoak: shouldUseCycleAndSoak,
      cycleMinutes,
      soakMinutes,
    };
    
    const existingIndex = zones.findIndex(z => z.id === editingZone.id);
    if (existingIndex >= 0) {
      const updatedZones = [...zones];
      updatedZones[existingIndex] = finalZone;
      onUpdate(updatedZones);
    } else {
      onUpdate([...zones, finalZone]);
    }
    
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus(null), 2000);
    
    // Show save toast
    const zoneName = editingZone.name || 'Zone';
    toast.success(`${zoneName} saved!`, {
      description: 'Your zone configuration has been saved.',
      duration: 3000,
    });
  };

  const handleAddZone = () => {
    const newZone: Zone = {
      id: `zone-${Date.now()}`,
      name: '',
      plantType: '',
      soilType: '',
      slope: '',
      sunlight: '',
      sprayHeadType: '',
      cycleAndSoak: false,
      cycleMinutes: 10,
      soakMinutes: 10,
      customPrecipRate: 1.0,
      useCustomPrecip: false,
      landscapeType: 'established',
    };
    setEditingZone(newZone);
    setActiveZoneId(newZone.id);
    setShowAdvanced(false);
    
    toast.success('New zone created!', {
      description: 'Configure your zone settings below.',
      duration: 2500,
    });
  };

  const handleEditZone = (zone: Zone) => {
    setEditingZone({
      ...zone,
      landscapeType: zone.landscapeType || 'established', // Default if not set
    });
    setActiveZoneId(zone.id);
    
    toast.info('Editing zone', {
      description: `Make changes to ${zone.name || 'this zone'}.`,
      duration: 2000,
    });
  };

  const handleDuplicateZone = () => {
    const duplicatedZone: Zone = {
      ...editingZone,
      id: `zone-${Date.now()}`,
      name: editingZone.name ? `${editingZone.name} (Copy)` : '',
    };
    onUpdate([...zones, duplicatedZone]);
    setEditingZone(duplicatedZone);
    setActiveZoneId(duplicatedZone.id);
    
    toast.success('Zone duplicated!', {
      description: `Created a copy of ${editingZone.name || 'zone'}.`,
      duration: 3000,
    });
  };

  const handleDeleteZone = (zoneId: string) => {
    const deletedZone = zones.find(z => z.id === zoneId);
    const zoneName = deletedZone?.name || 'Zone';
    
    onUpdate(zones.filter(z => z.id !== zoneId));
    if (activeZoneId === zoneId) {
      setActiveZoneId(null);
      setEditingZone({
        id: '',
        name: '',
        plantType: '',
        soilType: '',
        slope: '',
        sunlight: '',
        sprayHeadType: '',
        cycleAndSoak: false,
        cycleMinutes: 10,
        soakMinutes: 10,
        customPrecipRate: 1.0,
        useCustomPrecip: false,
        landscapeType: 'established',
      });
      setShowAdvanced(false);
    }
    
    toast.error(`${zoneName} deleted`, {
      description: 'The zone has been removed from your schedule.',
      duration: 3000,
    });
  };

  const handleAddAnotherSchedule = () => {
    // In future, this will open schedule manager
    toast.info('Coming Soon!', {
      description: 'Multi-schedule support will be available in a future update.',
      duration: 3000,
    });
  };

  const handleNext = () => {
    toast.success('Zones configured!', {
      description: `${zones.length} zone${zones.length > 1 ? 's' : ''} ready for scheduling.`,
      duration: 2500,
    });
    onNext();
  };

  const handleToggleAdvanced = () => {
    const newAdvancedState = !showAdvanced;
    setShowAdvanced(newAdvancedState);
    
    if (newAdvancedState) {
      toast.info('Advanced mode enabled', {
        description: 'Access professional-grade irrigation settings.',
        duration: 2000,
      });
    } else {
      toast.info('Basic mode enabled', {
        description: 'Simplified irrigation settings.',
        duration: 2000,
      });
    }
  };

  const getPlantTypeLabel = (id: string) => {
    return plantTypes.find(p => p.id === id)?.label || 'Zone';
  };

  const isZoneComplete = (zone: Zone) => {
    return zone.plantType && zone.soilType && zone.slope && zone.sunlight && zone.sprayHeadType && zone.landscapeType;
  };

  const hasCompleteZone = zones.some(zone => isZoneComplete(zone));
  const isCurrentZoneComplete = editingZone.plantType && 
                                 editingZone.soilType && 
                                 editingZone.slope && 
                                 editingZone.sunlight && 
                                 editingZone.sprayHeadType &&
                                 editingZone.landscapeType;

  // Calculate cycle and soak recommendation details
  const getCycleAndSoakDetails = () => {
    const shouldUseCycleAndSoak = 
      editingZone.soilType === 'clay' || 
      editingZone.soilType === 'loam' || 
      editingZone.slope === 'moderate' || 
      editingZone.slope === 'steep';
    
    if (!shouldUseCycleAndSoak) return null;
    
    let cycleMinutes = 10;
    let soakMinutes = 10;
    let reasons = [];
    
    if (editingZone.soilType === 'clay') {
      cycleMinutes = 8;
      soakMinutes = 12;
      reasons.push('Clay soil absorbs water slowly');
    } else if (editingZone.soilType === 'loam') {
      cycleMinutes = 10;
      soakMinutes = 10;
      reasons.push('Loam soil benefits from periodic breaks');
    }
    
    if (editingZone.slope === 'moderate') {
      cycleMinutes = Math.min(cycleMinutes, 10);
      soakMinutes = Math.max(soakMinutes, 10);
      reasons.push('Moderate slope increases runoff risk');
    } else if (editingZone.slope === 'steep') {
      cycleMinutes = 7;
      soakMinutes = 15;
      reasons.push('Steep slope requires extra soak time');
    }
    
    if (editingZone.landscapeType === 'new') {
      cycleMinutes = Math.min(cycleMinutes, 6);
      soakMinutes = 12;
      reasons.push('New landscape needs gentle watering');
    }
    
    return { cycleMinutes, soakMinutes, reasons };
  };

  const cycleAndSoakDetails = getCycleAndSoakDetails();

  return (
    <div className="bg-gray-50 py-8">
      <WizardProgress currentStep={2} />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-gray-900 mb-2">Zone Details</h1>
            <p className="text-gray-600">Add your irrigation zones</p>
          </div>
          <div className="flex items-center gap-4">
            {saveStatus && (
              <div className="flex items-center gap-2 text-sm">
                {saveStatus === 'saved' ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Saved</span>
                  </>
                ) : (
                  <span className="text-gray-500">Saving...</span>
                )}
              </div>
            )}
            <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              {zones.length} of 99 zones
            </div>
          </div>
        </div>

        {/* Schedule Name */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h3 className="text-gray-900 mb-4">Schedule Name</h3>
          <input
            type="text"
            placeholder="e.g., Front Yard, Backyard, Main Property"
            value={appSettings.scheduleName}
            onChange={e => onUpdateSettings({ ...appSettings, scheduleName: e.target.value })}
            className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
          />
          <p className="text-sm text-gray-500 mt-2">
            Give this schedule a name to easily identify it when managing multiple schedules
          </p>
        </div>

        {/* Add Another Schedule Button - Only show when at least one zone is complete */}
        {hasCompleteZone && (
          <div className="mb-6">
            <button
              onClick={handleAddAnotherSchedule}
              className="w-full sm:w-auto h-12 px-6 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
            >
              <Calendar className="w-5 h-5" />
              <span>Add Another Schedule</span>
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Create multiple schedules for different properties or seasonal variations
            </p>
          </div>
        )}

        {/* Zone Sequencing - Global Setting */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h3 className="text-gray-900 mb-4">Zone Sequencing</h3>
          <p className="text-sm text-gray-600 mb-4">
            Choose how your irrigation zones will run
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <button
              onClick={() => onUpdateSettings({ ...appSettings, sequencing: 'sequential' })}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200 text-left
                ${
                  appSettings.sequencing === 'sequential'
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }
              `}
            >
              <div className="text-base mb-1">Sequential</div>
              <div className="text-sm text-gray-600">Run one zone at a time (recommended for most systems)</div>
            </button>
            <button
              onClick={() => onUpdateSettings({ ...appSettings, sequencing: 'simultaneous' })}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200 text-left
                ${
                  appSettings.sequencing === 'simultaneous'
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }
              `}
            >
              <div className="text-base mb-1">Simultaneous</div>
              <div className="text-sm text-gray-600">Run multiple zones at the same time</div>
            </button>
          </div>
          
          {appSettings.sequencing === 'simultaneous' && (
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Number of zones that can run simultaneously
              </label>
              <select
                value={appSettings.simultaneousZones}
                onChange={e => onUpdateSettings({ ...appSettings, simultaneousZones: parseInt(e.target.value) })}
                className="w-full md:w-64 h-12 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              >
                {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num}>{num} zones</option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-2">
                <Info className="w-4 h-4 inline mr-1" />
                Ensure your water pressure can support running multiple zones at once
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Zone List - Left Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-sm p-4 max-h-[600px] overflow-y-auto">
              <div className="space-y-2">
                {zones.map(zone => {
                  const complete = isZoneComplete(zone);
                  return (
                    <div
                      key={zone.id}
                      onClick={() => handleEditZone(zone)}
                      className={`
                        p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 relative
                        ${
                          activeZoneId === zone.id
                            ? 'bg-blue-50 border-blue-500 border-l-4'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }
                      `}
                    >
                      {complete && (
                        <div className="absolute top-2 right-2">
                          <Check className="w-5 h-5 text-green-600" />
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">
                          {zones.indexOf(zone) + 1}
                        </div>
                        <span className="text-gray-900">
                          {zone.name || getPlantTypeLabel(zone.plantType)}
                        </span>
                      </div>
                      {zone.plantType && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{plantTypes.find(p => p.id === zone.plantType)?.icon}</span>
                          <span>{getPlantTypeLabel(zone.plantType)}</span>
                        </div>
                      )}
                      {zone.landscapeType === 'new' && (
                        <div className="mt-2 text-xs text-orange-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>New landscape</span>
                        </div>
                      )}
                      {zone.cycleAndSoak && (
                        <div className="mt-2 text-xs text-green-600">
                          Cycle & Soak: {zone.cycleMinutes}m / {zone.soakMinutes}m
                        </div>
                      )}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteZone(zone.id);
                        }}
                        className="absolute bottom-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}

                <button
                  onClick={handleAddZone}
                  className="hidden sm:flex w-full p-4 rounded-lg border-2 border-dashed border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Zone</span>
                </button>
              </div>
            </div>
          </div>

          {/* Zone Form - Right Panel */}
          <div className="lg:col-span-8">
            {activeZoneId ? (
              <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                {/* Zone Header with Advanced Toggle */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <h3 className="text-gray-900">Zone Configuration</h3>
                  <button
                    onClick={handleToggleAdvanced}
                    className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${
                      showAdvanced 
                        ? 'bg-blue-500 text-white hover:bg-blue-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Info className="w-4 h-4" />
                    {showAdvanced ? 'Advanced' : 'Basic'}
                  </button>
                </div>

                {/* Zone Information */}
                <div>
                  <h3 className="text-gray-900 mb-4">Zone Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Zone Number</label>
                      <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full">
                        Zone {zones.findIndex(z => z.id === editingZone.id) + 1 || zones.length + 1}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Zone Name <span className="text-gray-500">(optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Front Lawn"
                        value={editingZone.name}
                        onChange={e => setEditingZone({ ...editingZone, name: e.target.value })}
                        className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Landscape Type */}
                <div>
                  <h3 className="text-gray-900 mb-4">Landscape Type <span className="text-red-500">*</span></h3>
                  {!showAdvanced ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {landscapeTypes.map(type => (
                          <button
                            key={type.id}
                            onClick={() => setEditingZone({ ...editingZone, landscapeType: type.id as 'established' | 'new' })}
                            className={`
                              p-4 rounded-lg border-2 transition-all duration-200 flex items-start gap-3 text-left
                              ${
                                editingZone.landscapeType === type.id
                                  ? 'bg-blue-50 border-blue-500'
                                  : 'bg-white border-gray-200 hover:bg-gray-50'
                              }
                            `}
                          >
                            <span className="text-2xl flex-shrink-0">{type.icon}</span>
                            <div>
                              <div className="text-sm mb-1">{type.label}</div>
                              <div className="text-xs text-gray-600">{type.sublabel}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        <Info className="w-3 h-3 inline mr-1" />
                        New landscapes require 2-3x more water during establishment (first 6-12 months)
                      </p>
                    </>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {advancedLandscapeTypes.map(type => (
                        <button
                          key={type.id}
                          onClick={() => setEditingZone({ ...editingZone, landscapeType: type.id as 'established' | 'new' })}
                          className={`
                            p-4 rounded-lg border-2 transition-all duration-200 flex items-start gap-3 text-left
                            ${
                              editingZone.landscapeType === type.id
                                ? 'bg-blue-50 border-blue-500'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }
                          `}
                        >
                          <span className="text-2xl flex-shrink-0">{type.icon}</span>
                          <div>
                            <div className="text-sm mb-1">{type.label}</div>
                            <div className="text-xs text-gray-600">{type.sublabel}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Plant Type */}
                <div>
                  <h3 className="text-gray-900 mb-4">Plant Type <span className="text-red-500">*</span></h3>
                  {!showAdvanced ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {plantTypes.map(type => (
                        <button
                          key={type.id}
                          onClick={() => setEditingZone({ ...editingZone, plantType: type.id })}
                          className={`
                            p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2
                            ${
                              editingZone.plantType === type.id
                                ? 'bg-blue-50 border-blue-500'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }
                          `}
                        >
                          <span className="text-2xl">{type.icon}</span>
                          <span className="text-sm text-center">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {advancedPlantTypes.map(type => (
                        <button
                          key={type.id}
                          onClick={() => setEditingZone({ ...editingZone, plantType: type.id })}
                          className={`
                            p-4 rounded-lg border-2 transition-all duration-200 flex items-start gap-3 text-left
                            ${
                              editingZone.plantType === type.id
                                ? 'bg-blue-50 border-blue-500'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }
                          `}
                        >
                          <span className="text-2xl flex-shrink-0">{type.icon}</span>
                          <div>
                            <div className="text-sm mb-1">{type.label}</div>
                            <div className="text-xs text-gray-600">{type.sublabel}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Soil Type */}
                <div>
                  <h3 className="text-gray-900 mb-4">Soil Type <span className="text-red-500">*</span></h3>
                  {!showAdvanced ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {soilTypes.map(type => {
                        const IconComponent = type.iconComponent;
                        return (
                          <button
                            key={type.id}
                            onClick={() => setEditingZone({ ...editingZone, soilType: type.id })}
                            className={`
                              p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2
                              ${
                                editingZone.soilType === type.id
                                  ? 'bg-blue-50 border-blue-500'
                                  : 'bg-white border-gray-200 hover:bg-gray-50'
                              }
                            `}
                          >
                            <IconComponent />
                            <span className="text-sm">{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {advancedSoilTypes.map(type => {
                        const IconComponent = type.iconComponent;
                        return (
                          <button
                            key={type.id}
                            onClick={() => setEditingZone({ ...editingZone, soilType: type.id })}
                            className={`
                              p-4 rounded-lg border-2 transition-all duration-200 flex items-start gap-3 text-left
                              ${
                                editingZone.soilType === type.id
                                  ? 'bg-blue-50 border-blue-500'
                                  : 'bg-white border-gray-200 hover:bg-gray-50'
                              }
                            `}
                          >
                            <IconComponent />
                            <div>
                              <div className="text-sm mb-1">{type.label}</div>
                              <div className="text-xs text-gray-600">{type.sublabel}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Slope */}
                <div>
                  <h3 className="text-gray-900 mb-4">Slope <span className="text-red-500">*</span></h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {slopes.map(slope => {
                      const IconComponent = slope.iconComponent;
                      return (
                        <button
                          key={slope.id}
                          onClick={() => setEditingZone({ ...editingZone, slope: slope.id })}
                          className={`
                            p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2
                            ${
                              editingZone.slope === slope.id
                                ? 'bg-blue-50 border-blue-500'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }
                          `}
                        >
                          <IconComponent />
                          <span className="text-sm">{slope.label}</span>
                          <span className="text-xs text-gray-500">{slope.sublabel}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sunlight Exposure */}
                <div>
                  <h3 className="text-gray-900 mb-4">Sunlight Exposure <span className="text-red-500">*</span></h3>
                  {!showAdvanced ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {sunlightLevels.map(level => (
                        <button
                          key={level.id}
                          onClick={() => setEditingZone({ ...editingZone, sunlight: level.id })}
                          className={`
                            p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-1
                            ${
                              editingZone.sunlight === level.id
                                ? 'bg-blue-50 border-blue-500'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }
                          `}
                        >
                          <span className="text-2xl">{level.icon}</span>
                          <span className="text-sm">{level.label}</span>
                          <span className="text-xs text-gray-500">{level.sublabel}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {advancedSunlightLevels.map(level => (
                        <button
                          key={level.id}
                          onClick={() => setEditingZone({ ...editingZone, sunlight: level.id })}
                          className={`
                            p-4 rounded-lg border-2 transition-all duration-200 flex items-start gap-3 text-left
                            ${
                              editingZone.sunlight === level.id
                                ? 'bg-blue-50 border-blue-500'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }
                          `}
                        >
                          <span className="text-2xl flex-shrink-0">{level.icon}</span>
                          <div>
                            <div className="text-sm mb-1">{level.label}</div>
                            <div className="text-xs text-gray-600">{level.sublabel}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Spray Head Type */}
                <div>
                  <h3 className="text-gray-900 mb-4">Sprinkler Type <span className="text-red-500">*</span></h3>
                  <p className="text-sm text-gray-600 mb-4">Select the type of sprinkler for this zone</p>
                  {!showAdvanced ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {sprayHeadTypes.map(type => (
                        <button
                          key={type.id}
                          onClick={() => setEditingZone({ ...editingZone, sprayHeadType: type.id })}
                          className={`
                            rounded-lg border-2 transition-all duration-200 overflow-hidden
                            ${
                              editingZone.sprayHeadType === type.id
                                ? 'border-blue-500 ring-2 ring-blue-200'
                                : 'border-gray-200 hover:border-gray-300'
                            }
                          `}
                        >
                          <div className="aspect-square relative bg-gray-100">
                            <ImageWithFallback
                              src={type.image}
                              alt={type.label}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-3 text-left bg-white">
                            <div className="text-sm mb-1">{type.label}</div>
                            <div className="text-xs text-gray-600">{type.sublabel}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto bg-gray-50 rounded-lg p-4 border border-gray-200">
                      {advancedSprayHeadTypes.map(type => (
                        <label
                          key={type.id}
                          className={`
                            flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 border-2
                            ${
                              editingZone.sprayHeadType === type.id
                                ? 'bg-blue-50 border-blue-500'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }
                          `}
                        >
                          <input
                            type="radio"
                            name="sprayHeadType"
                            value={type.id}
                            checked={editingZone.sprayHeadType === type.id}
                            onChange={() => setEditingZone({ ...editingZone, sprayHeadType: type.id })}
                            className="w-5 h-5 mt-0.5 text-blue-500 border-gray-300 focus:ring-2 focus:ring-blue-200"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="text-sm mb-1">{type.label}</div>
                                <div className="text-xs text-gray-600">{type.sublabel}</div>
                              </div>
                              {type.radius && (
                                <div className="text-xs text-blue-600 whitespace-nowrap px-2 py-1 bg-blue-100 rounded">
                                  {type.radius}
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Precip Rate: {type.precipRate} in/hr
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cycle and Soak Notice - Show only when zone is complete */}
                {isCurrentZoneComplete && cycleAndSoakDetails && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <div className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="text-green-900 mb-1">
                          <strong>Cycle and Soak Will Be Applied</strong>
                        </p>
                        <p className="text-green-800">
                          Based on your zone conditions, we'll apply Cycle and Soak watering. 
                          You'll see the specific controller settings in the final schedule preview.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Auto-save Status */}
                {isCurrentZoneComplete && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <div className="flex items-center gap-2 text-sm text-blue-900">
                      <Check className="w-4 h-4 text-blue-600" />
                      <span>Zone configuration complete - Auto-saved!</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleDuplicateZone}
                    disabled={!isCurrentZoneComplete}
                    className="h-12 px-6 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </button>
                  <button
                    onClick={() => handleDeleteZone(editingZone.id)}
                    className="h-12 px-6 bg-white border-2 border-red-500 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-gray-900 mb-2">No Zone Selected</h3>
                <p className="text-gray-600 mb-6">Add a new zone or select an existing one to edit</p>
                <button
                  onClick={handleAddZone}
                  className="h-12 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200"
                >
                  Add Your First Zone
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
          <button
            onClick={onBack}
            className="order-3 sm:order-1 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {/* Add Zone button - visible on mobile, hidden on desktop */}
          <button
            onClick={handleAddZone}
            className="order-1 sm:hidden w-full h-12 px-6 bg-white border-2 border-dashed border-blue-500 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Zone</span>
          </button>
          
          <button
            onClick={handleNext}
            disabled={zones.length === 0 || !zones.every(zone => isZoneComplete(zone))}
            className="order-2 sm:order-2 w-full sm:w-auto h-12 px-8 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {zones.length === 0 
              ? 'Add at least one zone to continue' 
              : zones.every(zone => isZoneComplete(zone))
                ? 'Next: View Schedule'
                : 'Complete all zones to continue'
            }
          </button>
        </div>
      </div>
    </div>
  );
}
