import { useState } from 'react';
import { Plus, Calendar, MapPin, Edit2, Trash2, Eye } from 'lucide-react';

interface Schedule {
  id: string;
  name: string;
  location: string;
  zones: number;
  createdAt: string;
  lastModified: string;
}

interface ScheduleManagerProps {
  onCreateNew: () => void;
  onSelectSchedule: (id: string) => void;
}

export default function ScheduleManager({ onCreateNew, onSelectSchedule }: ScheduleManagerProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([
    {
      id: '1',
      name: 'Front Yard',
      location: 'San Diego, CA',
      zones: 5,
      createdAt: '2025-10-15',
      lastModified: '2025-10-20',
    },
    {
      id: '2',
      name: 'Backyard & Side',
      location: 'San Diego, CA',
      zones: 3,
      createdAt: '2025-10-10',
      lastModified: '2025-10-18',
    },
    {
      id: '3',
      name: 'Commercial Property',
      location: 'La Jolla, CA',
      zones: 12,
      createdAt: '2025-09-25',
      lastModified: '2025-10-15',
    },
  ]);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this schedule?')) {
      setSchedules(schedules.filter(s => s.id !== id));
    }
  };

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">My Irrigation Schedules</h1>
          <p className="text-gray-600">
            Manage multiple irrigation schedules for different properties or areas
          </p>
        </div>

        {/* Create New Button */}
        <button
          onClick={onCreateNew}
          className="w-full sm:w-auto mb-6 h-12 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Create New Schedule
        </button>

        {/* Schedules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schedules.map(schedule => (
            <div
              key={schedule.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-gray-200"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-gray-900 mb-1">{schedule.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{schedule.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onSelectSchedule(schedule.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
                    title="View Schedule"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onSelectSchedule(schedule.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors"
                    title="Edit Schedule"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(schedule.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600 hover:text-red-600 transition-colors"
                    title="Delete Schedule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-2xl text-blue-600 mb-1">{schedule.zones}</div>
                  <div className="text-xs text-gray-600">Zones</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-2xl text-green-600">Active</div>
                  <div className="text-xs text-gray-600">Status</div>
                </div>
              </div>

              {/* Dates */}
              <div className="text-xs text-gray-500 space-y-1 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span>Created:</span>
                  <span>{new Date(schedule.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Modified:</span>
                  <span>{new Date(schedule.lastModified).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {schedules.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-900 mb-2">No Schedules Yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first irrigation schedule to get started
            </p>
            <button
              onClick={onCreateNew}
              className="h-12 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200"
            >
              Create Schedule
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
