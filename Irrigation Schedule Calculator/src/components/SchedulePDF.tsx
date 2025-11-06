import { Zone, WateringRestrictions, AppSettings } from '../App';
import { MapPin, Droplet, Clock, Calendar, Info, AlertTriangle } from 'lucide-react';

interface SchedulePDFProps {
  zones: Zone[];
  restrictions: WateringRestrictions;
  appSettings: AppSettings;
  schedule: any[];
}

// Plant watering recommendations with explanations
const plantRecommendations: Record<string, { name: string; why: string; frequency: string }> = {
  'lawn-cool': {
    name: 'Lawn/Turf',
    why: 'Grass requires consistent moisture for root development and drought resistance. Deep, infrequent watering encourages deeper roots.',
    frequency: '3-4 times per week in summer, 1-2 times in cooler months'
  },
  'shrubs': {
    name: 'Shrubs',
    why: 'Established shrubs need less frequent but deeper watering to develop strong root systems. Shallow watering leads to weak surface roots.',
    frequency: '1-2 times per week, adjusting for rainfall'
  },
  'trees': {
    name: 'Trees',
    why: 'Trees need deep watering to reach extensive root systems. Mature trees are drought-tolerant but young trees need regular moisture.',
    frequency: 'Every 7-14 days for established trees, 2-3 times weekly for new plantings'
  },
  'vegetables': {
    name: 'Vegetables',
    why: 'Vegetables need consistent moisture for optimal growth and fruit production. Irregular watering causes stress and reduces yield.',
    frequency: 'Daily in hot weather, every 2-3 days in moderate conditions'
  },
  'flowers': {
    name: 'Flowers',
    why: 'Flowering plants need regular water to support blooms. Stress from irregular watering reduces flowering and plant health.',
    frequency: '2-3 times per week, more in containers'
  },
  'succulents': {
    name: 'Succulents',
    why: 'Succulents store water in leaves and need infrequent watering. Overwatering is the primary cause of succulent failure.',
    frequency: 'Every 7-14 days in growing season, monthly in winter'
  }
};

export default function SchedulePDF({ zones, restrictions, appSettings, schedule }: SchedulePDFProps) {
  const printDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const validityEndDate = new Date();
  validityEndDate.setDate(validityEndDate.getDate() + 30); // Schedule valid for 30 days
  
  const validityEndString = validityEndDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Get unique plant types from zones
  const uniquePlantTypes = [...new Set(zones.map(z => z.plantType))];

  return (
    <div className="pdf-container bg-white p-8 max-w-[8.5in] mx-auto" style={{ fontSize: '12pt' }}>
      {/* Big Irrigation Header */}
      <div className="border-b-4 pb-6 mb-6" style={{ borderColor: '#0066CC' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0066CC, #00A859)' }}>
              <Droplet className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl mb-1" style={{ color: '#0066CC' }}>Big Irrigation</h1>
              <p className="text-sm text-gray-600">Professional Irrigation Solutions</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">www.bigirrigation.com</p>
            <p className="text-sm text-gray-600">Professional Schedule Report</p>
          </div>
        </div>
        <h2 className="text-2xl mb-2 text-gray-900">Irrigation Schedule</h2>
        {appSettings.scheduleName && (
          <h3 className="text-xl text-gray-700 mb-2">{appSettings.scheduleName}</h3>
        )}
        <p className="text-gray-600">Generated on {printDate}</p>
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded text-sm text-white" style={{ backgroundColor: '#00A859' }}>
          <Calendar className="w-4 h-4" />
          Valid through {validityEndString}
        </div>
      </div>

      {/* Validity Notice */}
      <div className="border-l-4 p-4 mb-6" style={{ backgroundColor: '#E6F7FF', borderColor: '#0066CC' }}>
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#0066CC' }} />
          <div className="text-sm" style={{ color: '#003D7A' }}>
            <p className="mb-2">
              <strong>Schedule Validity:</strong> This irrigation schedule is calculated based on current weather patterns and seasonal conditions. 
              The schedule is valid for 30 days from the generation date. After this period, weather conditions may change significantly, 
              and a new schedule should be generated for optimal water efficiency.
            </p>
            <p>
              The schedule automatically adjusts watering times based on forecasted rainfall and temperature. Check your email for updates 
              when significant weather changes occur.
            </p>
          </div>
        </div>
      </div>

      {/* Property Information */}
      <div className="mb-8">
        <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-500" />
          Property Information
        </h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Location</div>
              <div className="text-gray-900">{restrictions.location || 'Not specified'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Zones</div>
              <div className="text-gray-900">{zones.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Watering Restrictions */}
      <div className="mb-8">
        <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          Watering Restrictions
        </h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="mb-3">
            <div className="text-sm text-gray-600">Allowed Days</div>
            <div className="text-gray-900">
              {restrictions.allDaysAvailable 
                ? 'All days available' 
                : restrictions.allowedDays.join(', ')}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Watering Times</div>
            <div className="text-gray-900">
              {restrictions.allTimesAvailable 
                ? 'All times available' 
                : `${restrictions.startTime} - ${restrictions.endTime}`}
            </div>
          </div>
        </div>
      </div>

      {/* Zone Details */}
      <div className="mb-8 page-break-before">
        <h2 className="text-xl text-gray-900 mb-4">Zone Details</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left">Zone</th>
              <th className="border border-gray-300 px-3 py-2 text-left">Name</th>
              <th className="border border-gray-300 px-3 py-2 text-left">Plant Type</th>
              <th className="border border-gray-300 px-3 py-2 text-left">Soil</th>
              <th className="border border-gray-300 px-3 py-2 text-left">Spray Head</th>
              <th className="border border-gray-300 px-3 py-2 text-left">Sequencing</th>
            </tr>
          </thead>
          <tbody>
            {zones.map((zone, index) => (
              <tr key={zone.id}>
                <td className="border border-gray-300 px-3 py-2">{index + 1}</td>
                <td className="border border-gray-300 px-3 py-2">{zone.name || '-'}</td>
                <td className="border border-gray-300 px-3 py-2 capitalize">{zone.plantType.replace('-', ' ')}</td>
                <td className="border border-gray-300 px-3 py-2 capitalize">{zone.soilType}</td>
                <td className="border border-gray-300 px-3 py-2 capitalize">{zone.sprayHeadType}</td>
                <td className="border border-gray-300 px-3 py-2 capitalize">
                  {appSettings.sequencing}
                  {appSettings.sequencing === 'simultaneous' && ` (${appSettings.simultaneousZones})`}
                  {zone.cycleAndSoak && ' • C&S'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {zones.some(z => z.cycleAndSoak) && (
          <p className="text-xs text-gray-600 mt-2">
            C&S = Cycle and Soak enabled for runoff prevention
          </p>
        )}
      </div>

      {/* Plant Watering Recommendations */}
      {uniquePlantTypes.length > 0 && (
        <div className="mb-8 page-break-before">
          <h2 className="text-xl text-gray-900 mb-4">Plant Watering Recommendations</h2>
          <p className="text-sm text-gray-600 mb-4">
            Understanding why different plants need specific watering schedules helps optimize your irrigation system
          </p>
          {uniquePlantTypes.map(plantType => {
            const rec = plantRecommendations[plantType];
            if (!rec) return null;
            
            return (
              <div key={plantType} className="mb-4 bg-gray-50 rounded-lg p-4 break-inside-avoid">
                <h3 className="text-base mb-2">{rec.name}</h3>
                <div className="text-sm space-y-2">
                  <div>
                    <span className="text-gray-600">Why: </span>
                    <span className="text-gray-800">{rec.why}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Recommended Frequency: </span>
                    <span className="text-gray-800">{rec.frequency}</span>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 text-sm text-gray-700 mt-4">
            <Info className="w-4 h-4 inline mr-1 text-blue-600" />
            These are general guidelines. Your actual schedule has been customized based on your specific soil type, 
            sunlight exposure, slope, and local weather conditions for optimal results.
          </div>
        </div>
      )}

      {/* 7-Day Schedule */}
      <div className="mb-8 page-break-before">
        <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          7-Day Watering Schedule
        </h2>
        {schedule.map((day, dayIndex) => (
          <div key={dayIndex} className="mb-6 break-inside-avoid">
            <div className="bg-blue-50 border-l-4 border-blue-500 px-4 py-2 mb-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{day.day}</span>
                  <span className="text-gray-600 ml-2">{day.date}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {day.weatherIcon} {day.temp}°F • {day.precipitation}% rain
                </div>
              </div>
            </div>
            {day.zoneSchedules.length > 0 ? (
              <table className="w-full border-collapse mb-2">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-3 py-1 text-left text-sm">Zone</th>
                    <th className="border border-gray-300 px-3 py-1 text-left text-sm">Start Time</th>
                    <th className="border border-gray-300 px-3 py-1 text-left text-sm">Duration</th>
                    <th className="border border-gray-300 px-3 py-1 text-left text-sm">Adjustment</th>
                  </tr>
                </thead>
                <tbody>
                  {day.zoneSchedules.map((zoneSchedule: any, zIndex: number) => (
                    <tr key={zIndex}>
                      <td className="border border-gray-300 px-3 py-1 text-sm">
                        Zone {zoneSchedule.zoneNumber}
                      </td>
                      <td className="border border-gray-300 px-3 py-1 text-sm">
                        {zoneSchedule.startTime}
                      </td>
                      <td className="border border-gray-300 px-3 py-1 text-sm">
                        {zoneSchedule.duration} min
                      </td>
                      <td className="border border-gray-300 px-3 py-1 text-sm">
                        {zoneSchedule.adjustment !== 0 
                          ? `${zoneSchedule.adjustment > 0 ? '+' : ''}${zoneSchedule.adjustment}%`
                          : 'None'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-sm text-gray-500 italic px-3 py-2">No watering scheduled</div>
            )}
          </div>
        ))}
      </div>

      {/* Controller Programming Instructions */}
      <div className="mb-8 page-break-before">
        <h2 className="text-xl text-gray-900 mb-4">Controller Programming Guide</h2>
        <p className="text-sm text-gray-600 mb-4">
          Program your controller with these settings. Zones with Cycle & Soak need special programming.
        </p>
        
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ backgroundColor: '#0066CC', color: 'white' }}>
              <th className="border border-gray-300 px-3 py-2 text-left text-sm">Zone</th>
              <th className="border border-gray-300 px-3 py-2 text-left text-sm">Name</th>
              <th className="border border-gray-300 px-3 py-2 text-left text-sm">Start Time</th>
              <th className="border border-gray-300 px-3 py-2 text-left text-sm">Runtime</th>
              <th className="border border-gray-300 px-3 py-2 text-left text-sm">Cycle & Soak</th>
              <th className="border border-gray-300 px-3 py-2 text-left text-sm">Notes</th>
            </tr>
          </thead>
          <tbody>
            {zones.map((zone, index) => {
              const baseStartMinutes = 6 * 60 + (index * 30);
              const startHour = Math.floor(baseStartMinutes / 60);
              const startMinute = baseStartMinutes % 60;
              const startTime = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
              const runtime = 25;
              const needsCycleAndSoak = zone.cycleAndSoak;
              
              return (
                <tr key={zone.id} style={{ backgroundColor: index % 2 === 0 ? '#F9FAFB' : 'white' }}>
                  <td className="border border-gray-300 px-3 py-2 text-sm">{index + 1}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">
                    <div>{zone.name || zone.plantType.replace('-', ' ')}</div>
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm font-mono">{startTime}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm" style={{ color: '#0066CC' }}>
                    {runtime} min
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">
                    {needsCycleAndSoak ? (
                      <div>
                        <div style={{ color: '#16A34A', fontWeight: 'bold' }}>✓ Required</div>
                        <div style={{ fontSize: '11px', color: '#374151' }}>
                          <span style={{ color: '#16A34A' }}>{zone.cycleMinutes}m ON</span>
                          {' / '}
                          <span style={{ color: '#2563EB' }}>{zone.soakMinutes}m OFF</span>
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: '#6B7280' }}>Standard</span>
                    )}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-xs text-gray-600">
                    {zone.landscapeType === 'new' && <div>• New landscape</div>}
                    {zone.soilType === 'clay' && <div>• Clay soil</div>}
                    {(zone.slope === 'moderate' || zone.slope === 'steep') && <div>• {zone.slope} slope</div>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {zones.some(z => z.cycleAndSoak) && (
          <div className="mt-4 border-l-4 p-3 text-sm" style={{ backgroundColor: '#F0FDF4', borderColor: '#16A34A' }}>
            <p className="mb-2" style={{ color: '#15803D' }}>
              <strong>Cycle & Soak Programming:</strong>
            </p>
            <p style={{ color: '#166534' }}>
              For zones marked "Required", program your controller to run the specified cycle time (ON), 
              then pause for the soak time (OFF), and repeat until the total runtime is reached. 
              This prevents runoff and improves water penetration.
            </p>
          </div>
        )}
      </div>

      {/* Big Irrigation Company Info */}
      <div className="border-t-2 pt-6 mt-8" style={{ borderColor: '#0066CC' }}>
        <div className="rounded-lg p-6 mb-6" style={{ backgroundColor: '#F0F8FF' }}>
          <h3 className="text-base mb-3" style={{ color: '#0066CC' }}>Provided by Big Irrigation</h3>
          <p className="text-sm text-gray-700 mb-2">
            Big Irrigation specializes in professional irrigation solutions, system design, and water management. 
            For questions about your irrigation system or to schedule a professional consultation, visit us at:
          </p>
          <p className="text-sm mb-2">
            <strong style={{ color: '#0066CC' }}>Website:</strong>{' '}
            <a href="https://bigirrigation.com" className="text-blue-600 underline">www.bigirrigation.com</a>
          </p>
          <p className="text-xs text-gray-600 mt-3">
            This schedule calculator is provided as a free tool to help property owners optimize their irrigation systems. 
            For commercial applications or complex irrigation needs, please consult with our professional team.
          </p>
        </div>
      </div>

      {/* Liability Disclaimer */}
      <div className="border-t-2 border-gray-300 pt-6 mt-6 page-break-before">
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <h3 className="text-base text-gray-900">Important Disclaimer and Limitations of Liability</h3>
          </div>
          
          <div className="text-xs text-gray-700 space-y-3">
            <p>
              <strong>General Information:</strong> This irrigation schedule is provided for informational purposes only and is generated 
              based on general horticultural principles, weather data, and user-provided information. It is not intended to replace 
              professional landscape or irrigation advice.
            </p>
            
            <p>
              <strong>No Warranty:</strong> This schedule is provided "as is" without any warranty of any kind, either expressed or implied, 
              including but not limited to warranties of accuracy, reliability, or fitness for a particular purpose. The creators and 
              distributors of this calculator make no representations about the suitability of this schedule for any purpose.
            </p>
            
            <p>
              <strong>Weather Variability:</strong> Weather conditions are unpredictable and can change rapidly. While this schedule 
              incorporates weather forecasts, actual conditions may vary. Users should monitor their landscape and adjust watering as needed 
              based on observed conditions, plant health, and local water restrictions.
            </p>
            
            <p>
              <strong>Property Damage:</strong> Users are solely responsible for monitoring their irrigation systems and ensuring proper 
              operation. The creators are not liable for any property damage, water waste, plant loss, or other damages resulting from 
              following this schedule, including but not limited to overwatering, underwatering, system malfunction, or water restrictions violations.
            </p>
            
            <p>
              <strong>Local Regulations:</strong> Users must comply with all local water use regulations, restrictions, and ordinances. 
              This schedule does not guarantee compliance with local water use rules. It is the user's responsibility to verify and follow 
              all applicable regulations.
            </p>
            
            <p>
              <strong>Professional Advice:</strong> For specific landscape needs, soil testing, drainage issues, or system design, 
              please consult a licensed landscape professional or certified irrigation specialist in your area.
            </p>
            
            <p>
              <strong>Limitation of Liability:</strong> In no event shall the creators, developers, or distributors of this irrigation 
              calculator be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising out of or 
              related to the use or inability to use this schedule, even if advised of the possibility of such damages.
            </p>
            
            <p className="mt-4 pt-3 border-t border-gray-400">
              By using this irrigation schedule, you acknowledge that you have read this disclaimer and agree to its terms. 
              You accept full responsibility for monitoring your irrigation system and landscape health.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t pt-6 mt-6" style={{ borderColor: '#0066CC' }}>
        <div className="text-center mb-3">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0066CC, #00A859)' }}>
              <Droplet className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg" style={{ color: '#0066CC' }}>Big Irrigation</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 text-center mb-2">
          This schedule is automatically adjusted based on weather conditions. 
          Check your email for updates when significant changes occur.
        </p>
        <p className="text-xs text-gray-500 text-center">
          www.bigirrigation.com • Professional Irrigation Solutions • {new Date().getFullYear()}
        </p>
      </div>

      <style jsx>{`
        @media print {
          .pdf-container {
            padding: 0.5in;
          }
          .page-break-before {
            page-break-before: always;
          }
          .break-inside-avoid {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
