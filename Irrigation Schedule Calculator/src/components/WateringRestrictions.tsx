import { useState, useEffect, useRef } from 'react';
import { Check, Calendar, MapPin } from 'lucide-react';
import WizardProgress from './WizardProgress';
import TimePicker from './TimePicker';
import { WateringRestrictions as WateringRestrictionsType } from '../App';
import { geocodeAddress } from '../utils/wordpressAPI';

interface WateringRestrictionsProps {
  restrictions: WateringRestrictionsType;
  onUpdate: (restrictions: WateringRestrictionsType) => void;
  onNext: () => void;
  onStartOver: () => void;
}

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function WateringRestrictions({
  restrictions,
  onUpdate,
  onNext,
  onStartOver,
}: WateringRestrictionsProps) {
  const locationInputRef = useRef<HTMLInputElement>(null);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [geocodedData, setGeocodedData] = useState<{lat: number; lng: number} | null>(null);

  useEffect(() => {
    // Load Google Places Autocomplete (if available)
    // Wait for Google Maps API and Places library to be fully loaded
    const initGooglePlaces = () => {
      const google = (window as any).google;
      if (
        google &&
        google.maps &&
        google.maps.places &&
        google.maps.places.Autocomplete &&
        locationInputRef.current
      ) {
        try {
          const autocomplete = new google.maps.places.Autocomplete(locationInputRef.current);
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place && place.formatted_address) {
              handleLocationSelect(place.formatted_address);
            }
          });
        } catch (error) {
          console.warn('Failed to initialize Google Places Autocomplete:', error);
        }
      }
    };

    // Check if already loaded
    if (typeof (window as any).google !== 'undefined') {
      // Wait a bit for Places library to initialize
      setTimeout(initGooglePlaces, 100);
    } else {
      // Wait for Google Maps API to load
      const checkInterval = setInterval(() => {
        if (typeof (window as any).google !== 'undefined') {
          clearInterval(checkInterval);
          setTimeout(initGooglePlaces, 100);
        }
      }, 100);

      // Stop checking after 10 seconds
      setTimeout(() => clearInterval(checkInterval), 10000);
    }
  }, []);

  const toggleDay = (day: string) => {
    const newDays = restrictions.allowedDays.includes(day)
      ? restrictions.allowedDays.filter(d => d !== day)
      : [...restrictions.allowedDays, day];
    onUpdate({ ...restrictions, allowedDays: newDays });
  };

  const handleLocationChange = (value: string) => {
    onUpdate({ ...restrictions, location: value });
    // Clear suggestions - rely on Google Places API only
    setLocationSuggestions([]);
  };

  const handleLocationSelect = async (address: string) => {
    onUpdate({ ...restrictions, location: address });
    setLocationSuggestions([]);
    
    // Geocode the address to get coordinates
    const result = await geocodeAddress(address);
    if (result) {
      setGeocodedData({ lat: result.lat, lng: result.lng });
      // Store in restrictions for later use
      onUpdate({ 
        ...restrictions, 
        location: result.formattedAddress || address,
        latitude: result.lat,
        longitude: result.lng
      } as any);
    }
  };

  return (
    <div className="bg-gray-50 py-8">
      <WizardProgress currentStep={1} />

      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Watering Restrictions</h1>
          <p className="text-gray-600">Tell us about your location and local watering rules</p>
        </div>

        <div className="space-y-8">
          {/* Location Input - First Question */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-500" />
              Property Location
            </h3>
            <div className="relative">
              <input
                ref={locationInputRef}
                type="text"
                placeholder="Enter property address or ZIP code"
                value={restrictions.location}
                onChange={e => handleLocationChange(e.target.value)}
                className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
              {locationSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  {locationSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleLocationSelect(suggestion)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              <p className="text-sm text-gray-500 mt-2">
                We'll use this location to get weather data for smart watering adjustments
              </p>
            </div>
          </div>
          {/* Question 1: Days Available */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-gray-900 mb-4">Are all watering days available?</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => onUpdate({ ...restrictions, allDaysAvailable: true })}
                className={`
                  h-16 px-6 rounded-lg border-2 transition-all duration-200 flex items-center gap-3
                  ${
                    restrictions.allDaysAvailable
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <Check className="w-5 h-5" />
                <span>Yes</span>
              </button>

              <button
                onClick={() => onUpdate({ ...restrictions, allDaysAvailable: false })}
                className={`
                  h-16 px-6 rounded-lg border-2 transition-all duration-200 flex items-center gap-3
                  ${
                    !restrictions.allDaysAvailable
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <Calendar className="w-5 h-5" />
                <span>No</span>
              </button>
            </div>

            {!restrictions.allDaysAvailable && (
              <div>
                <p className="text-sm text-gray-600 mb-3">Select allowed watering days:</p>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map(day => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`
                        w-12 h-12 rounded-full border-2 transition-all duration-200 flex items-center justify-center
                        ${
                          restrictions.allowedDays.includes(day)
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      <span className="text-sm">{day}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Question 2: Times Available */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-gray-900 mb-4">Are all times available?</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => onUpdate({ ...restrictions, allTimesAvailable: true })}
                className={`
                  h-16 px-6 rounded-lg border-2 transition-all duration-200 flex items-center gap-3
                  ${
                    restrictions.allTimesAvailable
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <Check className="w-5 h-5" />
                <span>Yes</span>
              </button>

              <button
                onClick={() => onUpdate({ ...restrictions, allTimesAvailable: false })}
                className={`
                  h-16 px-6 rounded-lg border-2 transition-all duration-200 flex items-center gap-3
                  ${
                    !restrictions.allTimesAvailable
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <Calendar className="w-5 h-5" />
                <span>No</span>
              </button>
            </div>

            {!restrictions.allTimesAvailable && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={restrictions.startTime}
                    onChange={e => onUpdate({ ...restrictions, startTime: e.target.value })}
                    className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">End Time</label>
                  <input
                    type="time"
                    value={restrictions.endTime}
                    onChange={e => onUpdate({ ...restrictions, endTime: e.target.value })}
                    className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Question 3: Completion Time */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-gray-900 mb-4">When should irrigation complete?</h3>
            
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-gray-300 hover:bg-gray-50 cursor-pointer transition-all">
                <input
                  type="radio"
                  name="completion"
                  checked={restrictions.completionType === 'anytime'}
                  onChange={() => onUpdate({ ...restrictions, completionType: 'anytime' })}
                  className="mt-1 w-4 h-4 text-blue-500"
                />
                <div>
                  <span className="text-gray-900">All times available</span>
                  <p className="text-sm text-gray-600">(recommended)</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-gray-300 hover:bg-gray-50 cursor-pointer transition-all">
                <input
                  type="radio"
                  name="completion"
                  checked={restrictions.completionType === 'complete-by'}
                  onChange={() => onUpdate({ ...restrictions, completionType: 'complete-by' })}
                  className="mt-1 w-4 h-4 text-blue-500"
                />
                <div className="flex-1">
                  <span className="text-gray-900">Must complete by:</span>
                  {restrictions.completionType === 'complete-by' && (
                    <TimePicker
                      value={restrictions.completionTime}
                      onChange={time => onUpdate({ ...restrictions, completionTime: time })}
                      className="mt-2"
                    />
                  )}
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-gray-300 hover:bg-gray-50 cursor-pointer transition-all">
                <input
                  type="radio"
                  name="completion"
                  checked={restrictions.completionType === 'start-after'}
                  onChange={() => onUpdate({ ...restrictions, completionType: 'start-after' })}
                  className="mt-1 w-4 h-4 text-blue-500"
                />
                <div className="flex-1">
                  <span className="text-gray-900">Must start after:</span>
                  {restrictions.completionType === 'start-after' && (
                    <TimePicker
                      value={restrictions.completionTime}
                      onChange={time => onUpdate({ ...restrictions, completionTime: time })}
                      className="mt-2"
                    />
                  )}
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
          <button
            onClick={onStartOver}
            className="order-2 sm:order-1 text-gray-600 hover:text-gray-900 transition-colors"
          >
            Start Over
          </button>
          
          <button
            onClick={onNext}
            className="order-1 sm:order-2 w-full sm:w-auto h-12 px-8 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Next: Add Zones
          </button>
        </div>
      </div>
    </div>
  );
}
