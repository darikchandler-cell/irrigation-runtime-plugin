import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Users, Droplet, Download, ChevronDown, Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  getAdminAnalytics, 
  savePluginSettings, 
  exportSchedulesCSV, 
  resendScheduleEmail,
  sendTestEmail,
  checkAPIStatus 
} from '../utils/wordpressAPI';
import { toast } from 'sonner';

// Version number for the plugin
const PLUGIN_VERSION = '1.1.0';

interface SubmissionDetail {
  id: number;
  date: string;
  email: string;
  name?: string;
  phone?: string;
  company?: string;
  zones: number;
  location: string;
  address?: string;
  lat?: number;
  lng?: number;
  status: string;
  scheduleName?: string;
  zoneDetails?: Array<{
    name: string;
    plantType: string;
    soilType: string;
    slope: string;
    sunExposure: string;
    sprayHeadType: string;
    precipRate: number;
    landscapeType: string;
  }>;
  restrictions?: {
    allowedDays: string[];
    startTime: string;
    endTime: string;
  };
  ipAddress?: string;
  userAgent?: string;
}

// Animated counter component
function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000; // 1 second
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <>{decimals > 0 ? displayValue.toFixed(decimals) : Math.floor(displayValue).toLocaleString()}</>;
}

export default function AdminAnalytics() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [dateRange, setDateRange] = useState('30days');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<any>(null);

  // Real data states
  const [stats, setStats] = useState({
    totalSchedules: 0,
    totalSchedulesTrend: 0,
    thisMonth: 0,
    thisMonthTrend: 0,
    thisWeek: 0,
    thisWeekTrend: 0,
    avgZones: 0,
    avgZonesTrend: 0,
  });

  const [recentSchedules, setRecentSchedules] = useState<SubmissionDetail[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 10,
  });
  const [chartData, setChartData] = useState<any[]>([]);

  // Load settings from WordPress or use defaults
  const wpAdminData = typeof (window as any).irrigationCalcAdminData !== 'undefined' 
    ? (window as any).irrigationCalcAdminData 
    : null;

  // Debug: Log settings loading
  useEffect(() => {
    if (typeof (window as any).irrigationCalcAdminData !== 'undefined') {
      console.log('Settings loaded:', (window as any).irrigationCalcAdminData?.settings);
    } else {
      console.warn('Settings not found: irrigationCalcAdminData is undefined');
    }
  }, []);

  // Settings states
  const [generalSettings, setGeneralSettings] = useState(
    wpAdminData?.settings?.general || {
      pluginName: 'Irrigation Schedule Calculator',
      defaultScheduleName: 'My Irrigation Schedule',
      enableAutosave: true,
      showLandingPage: true,
      requireRegistration: false,
    }
  );

  const [apiSettings, setApiSettings] = useState(
    wpAdminData?.settings?.api || {
      openweatherApiKey: '',
      googlePlacesApiKey: '',
      waterRatesApi: '',
      enableWeatherAdjustments: true,
    }
  );

  const [emailSettings, setEmailSettings] = useState(
    wpAdminData?.settings?.email || {
      fromEmail: '',
      fromName: '',
      replyToEmail: '',
      adminEmail: '',
      sendAdminNotifications: true,
      attachPdf: true,
      emailSubject: 'Your Irrigation Schedule - {{schedule_name}}',
      emailTemplate: 'Hello {{name}},\n\nThank you for using our Irrigation Schedule Calculator!\n\nYour personalized watering schedule has been created for {{location}}.\n\nSchedule Details:\n- Schedule Name: {{schedule_name}}\n- Number of Zones: {{zone_count}}\n- Total Weekly Watering Time: {{total_time}}\n\nBest regards,\nIrrigation Calculator Team',
    }
  );

  const [testEmail, setTestEmail] = useState('');

  // Fetch analytics data
  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange, currentPage]);

  // Fetch API status when on API tab
  useEffect(() => {
    if (activeTab === 'api') {
      fetchAPIStatus();
    }
  }, [activeTab]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const data = await getAdminAnalytics(dateRange, currentPage);
      if (data) {
        setStats(data.stats || {});
        setRecentSchedules(data.schedules || []);
        setPagination(data.pagination || { currentPage: 1, totalPages: 1, totalItems: 0, perPage: 10 });
        setChartData(data.chartData || []);
      } else {
        // No data - show empty state or error
        console.warn('No analytics data received');
        toast.error('Failed to load analytics data. Check WordPress AJAX configuration.');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Error loading analytics data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAPIStatus = async () => {
    const status = await checkAPIStatus();
    if (status) {
      setApiStatus(status);
    }
  };

  const handleSaveSettings = async (settingsType: 'general' | 'api' | 'email', settings: any) => {
    const result = await savePluginSettings(settingsType, settings);
    if (result.success) {
      toast.success('Settings saved successfully!');
    } else {
      toast.error(result.message || 'Failed to save settings');
    }
  };

  const handleExportCSV = async () => {
    await exportSchedulesCSV(dateRange);
  };

  const handleResendEmail = async (scheduleId: number) => {
    const result = await resendScheduleEmail(scheduleId);
    if (result.success) {
      toast.success('Email sent successfully!');
    } else {
      toast.error(result.message || 'Failed to send email');
    }
  };

  const handleTestEmail = async (email: string) => {
    const result = await sendTestEmail(email);
    if (result.success) {
      toast.success('Test email sent!');
    } else {
      toast.error(result.message || 'Failed to send test email');
    }
  };

  return (
    <div className="irrigation-admin-container" style={{ width: '100%', margin: 0, padding: 0 }}>
      {/* WordPress admin already provides header and navigation - we just need content */}
      <div className="irrigation-admin-content" style={{ width: '100%', margin: 0, padding: 0 }}>
        {/* WordPress admin .wrap provides padding, we use full width */}
        <style>{`
          .irrigation-admin-container,
          .irrigation-admin-content {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .irrigation-admin-content > div {
            width: 100% !important;
            max-width: 100% !important;
          }
          /* WordPress admin compatibility */
          .wrap .irrigation-admin-container {
            padding: 0;
            margin: 0;
          }
          /* Ensure tabs and content fit WordPress admin */
          .irrigation-admin-content .bg-white {
            margin: 0;
          }
        `}</style>
        <div className="w-full" style={{ width: '100%', maxWidth: '100%' }}>
          {/* Tabs */}
          <div className="bg-white rounded-t-lg border-b border-gray-200 mb-0">
            <div className="flex gap-1 px-4 sm:px-6 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'analytics' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Analytics
            </button>
            <button 
              onClick={() => setActiveTab('general')}
              className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'general' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              General
            </button>
            <button 
              onClick={() => setActiveTab('api')}
              className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'api' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              API Settings
            </button>
            <button 
              onClick={() => setActiveTab('email')}
              className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'email' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Email
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-b-lg shadow-sm p-4 sm:p-6 overflow-hidden">
          <AnimatePresence mode="wait">
            {/* Analytics Tab Content */}
            {activeTab === 'analytics' && (
              <motion.div 
                key="analytics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="min-w-0"
              >
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-gray-600">Loading analytics data...</p>
                  </div>
                </div>
              ) : (
              <>
              {/* Header with Date Range */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-2xl text-gray-900">Schedule Analytics</h2>
              <p className="text-gray-600">Track and analyze irrigation schedules created by users</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={dateRange}
                onChange={e => setDateRange(e.target.value)}
                className="h-10 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              >
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 90 days</option>
                <option value="1year">Last year</option>
              </select>
              <button
                onClick={handleExportCSV}
                className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total Schedules */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${stats.totalSchedulesTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendingUp className="w-4 h-4" />
                  <span>{stats.totalSchedulesTrend > 0 ? '+' : ''}{stats.totalSchedulesTrend}%</span>
                </div>
              </div>
              <div className="text-3xl text-gray-900 mb-1">
                <AnimatedNumber value={stats.totalSchedules} />
              </div>
              <div className="text-sm text-gray-600">Total Schedules</div>
            </motion.div>

            {/* This Month */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${stats.thisMonthTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendingUp className="w-4 h-4" />
                  <span>{stats.thisMonthTrend > 0 ? '+' : ''}{stats.thisMonthTrend}%</span>
                </div>
              </div>
              <div className="text-3xl text-gray-900 mb-1">
                <AnimatedNumber value={stats.thisMonth} />
              </div>
              <div className="text-sm text-gray-600">This Month</div>
            </motion.div>

            {/* This Week */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${stats.thisWeekTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendingUp className="w-4 h-4" />
                  <span>{stats.thisWeekTrend > 0 ? '+' : ''}{stats.thisWeekTrend}%</span>
                </div>
              </div>
              <div className="text-3xl text-gray-900 mb-1">
                <AnimatedNumber value={stats.thisWeek} />
              </div>
              <div className="text-sm text-gray-600">This Week</div>
            </motion.div>

            {/* Average Zones */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Droplet className="w-5 h-5 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${stats.avgZonesTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendingUp className="w-4 h-4" />
                  <span>{stats.avgZonesTrend > 0 ? '+' : ''}{stats.avgZonesTrend}%</span>
                </div>
              </div>
              <div className="text-3xl text-gray-900 mb-1">
                <AnimatedNumber value={stats.avgZones} decimals={1} />
              </div>
              <div className="text-sm text-gray-600">Average Zones</div>
            </motion.div>
          </div>

          {/* Recent Schedules Table */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-6 w-full"
          >
            <h3 className="text-lg text-gray-900 mb-4">Recent Schedules</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden w-full">
              <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm text-gray-700">Date/Time</th>
                      <th className="px-4 py-3 text-left text-sm text-gray-700">Name</th>
                      <th className="px-4 py-3 text-left text-sm text-gray-700">Email</th>
                      <th className="px-4 py-3 text-left text-sm text-gray-700">Company</th>
                      <th className="px-4 py-3 text-left text-sm text-gray-700">Location</th>
                      <th className="px-4 py-3 text-left text-sm text-gray-700">Zones</th>
                      <th className="px-4 py-3 text-left text-sm text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-sm text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentSchedules.length > 0 ? recentSchedules.map((schedule, index) => (
                      <motion.tr 
                        key={schedule.id} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 + (index * 0.05) }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-sm text-gray-900">{schedule.date}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{schedule.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{schedule.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{schedule.company || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{schedule.location}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{schedule.zones}</td>
                        <td className="px-4 py-3">
                          <span className={`
                            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs
                            ${schedule.status === 'sent' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                            }
                          `}>
                            {schedule.status === 'sent' ? '✓ Sent' : '✗ Failed'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setSelectedSubmission(schedule)}
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        </td>
                      </motion.tr>
                    )) : (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center">
                          <div className="text-gray-400">
                            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-gray-600">No schedules found</p>
                            <p className="text-sm text-gray-500 mt-1">Schedules will appear here once users create them</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {recentSchedules.length > 0 && (
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.perPage + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(pagination.currentPage * pagination.perPage, pagination.totalItems)}</span> of{' '}
                  <span className="font-medium">{pagination.totalItems}</span> results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`
                        px-3 py-1 rounded border text-sm
                        ${currentPage === i + 1
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                    disabled={currentPage === pagination.totalPages}
                    className="px-3 py-1 rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
              )}
            </div>
          </motion.div>

          {/* Usage Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white rounded-lg p-6 border border-gray-200"
          >
            <h3 className="text-lg text-gray-900 mb-4">Schedule Creation Trends</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="schedules" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Schedules Created"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 text-sm">
                  No data available yet. Charts will appear once schedules are created.
                </p>
              </div>
            )}
          </motion.div>
              </>
              )}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {/* General Settings Tab Content */}
            {activeTab === 'general' && (
              <motion.div 
                key="general"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="min-w-0"
              >
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl text-gray-900">General Settings</h2>
                <p className="text-gray-600">Configure plugin behavior and default options</p>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Plugin Name
                  </label>
                  <input
                    type="text"
                    value={generalSettings.pluginName}
                    onChange={e => setGeneralSettings({...generalSettings, pluginName: e.target.value})}
                    className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <p className="text-sm text-gray-500 mt-1">Display name for the calculator</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Default Schedule Name
                  </label>
                  <input
                    type="text"
                    value={generalSettings.defaultScheduleName}
                    onChange={e => setGeneralSettings({...generalSettings, defaultScheduleName: e.target.value})}
                    className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <p className="text-sm text-gray-500 mt-1">Default name for new schedules</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={generalSettings.enableAutosave}
                      onChange={e => setGeneralSettings({...generalSettings, enableAutosave: e.target.checked})}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Enable auto-save functionality</span>
                  </label>
                  <p className="text-sm text-gray-500 mt-1 ml-6">Automatically save user progress</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={generalSettings.showLandingPage}
                      onChange={e => setGeneralSettings({...generalSettings, showLandingPage: e.target.checked})}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Show landing page</span>
                  </label>
                  <p className="text-sm text-gray-500 mt-1 ml-6">Display the marketing landing page or go directly to Step 1</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={generalSettings.requireRegistration}
                      onChange={e => setGeneralSettings({...generalSettings, requireRegistration: e.target.checked})}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Require user registration</span>
                  </label>
                  <p className="text-sm text-gray-500 mt-1 ml-6">Force users to create an account before using calculator</p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button 
                    onClick={() => handleSaveSettings('general', generalSettings)}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {/* API Settings Tab Content */}
            {activeTab === 'api' && (
              <motion.div 
                key="api"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="min-w-0"
              >
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl text-gray-900">API Settings</h2>
                <p className="text-gray-600">Manage external API integrations and connections</p>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    OpenWeatherMap API Key
                  </label>
                  <input
                    type="password"
                    value={apiSettings.openweatherApiKey}
                    onChange={e => setApiSettings({...apiSettings, openweatherApiKey: e.target.value})}
                    placeholder="Enter your API key"
                    className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Get your free API key from{' '}
                    <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      OpenWeatherMap.org
                    </a>
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={apiSettings.enableWeatherAdjustments}
                      onChange={e => setApiSettings({...apiSettings, enableWeatherAdjustments: e.target.checked})}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Enable weather-based adjustments</span>
                  </label>
                  <p className="text-sm text-gray-500 mt-1 ml-6">Use real-time weather data to adjust watering schedules</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Google Maps API Key (Optional)
                  </label>
                  <input
                    type="password"
                    value={apiSettings.googlePlacesApiKey}
                    onChange={e => setApiSettings({...apiSettings, googlePlacesApiKey: e.target.value})}
                    placeholder="Enter your API key"
                    className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
                  />
                  <p className="text-sm text-gray-500 mt-1">For geocoding and address autocomplete features</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Water Rates API Endpoint (Optional)
                  </label>
                  <input
                    type="text"
                    value={apiSettings.waterRatesApi}
                    onChange={e => setApiSettings({...apiSettings, waterRatesApi: e.target.value})}
                    placeholder="https://api.example.com/water-rates"
                    className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
                  />
                  <p className="text-sm text-gray-500 mt-1">Custom API for local water utility rates</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm text-blue-900 mb-2">API Status</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${apiStatus?.openweather?.connected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span className="text-gray-700">
                        OpenWeatherMap: {apiStatus?.openweather?.connected ? 'Connected' : (apiStatus?.openweather?.configured ? 'Configured but not connected' : 'Not configured')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${apiStatus?.googlePlaces?.connected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span className="text-gray-700">
                        Google Maps: {apiStatus?.googlePlaces?.connected ? 'Connected' : 'Not configured'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${apiStatus?.waterRates?.connected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span className="text-gray-700">
                        Water Rates API: {apiStatus?.waterRates?.connected ? 'Connected' : 'Not configured'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 flex gap-3 items-center">
                  <button 
                    onClick={() => handleSaveSettings('api', apiSettings)}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    Save
                  </button>
                  <button 
                    onClick={fetchAPIStatus}
                    className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Test Connections
                  </button>
                </div>
              </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {/* Email Settings Tab Content */}
            {activeTab === 'email' && (
              <motion.div 
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="min-w-0"
              >
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl text-gray-900">Email Settings</h2>
                <p className="text-gray-600">Configure email notifications and templates</p>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    From Email Address
                  </label>
                  <input
                    type="email"
                    value={emailSettings.fromEmail}
                    onChange={e => setEmailSettings({...emailSettings, fromEmail: e.target.value})}
                    className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <p className="text-sm text-gray-500 mt-1">Email address for outgoing schedule emails</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    From Name
                  </label>
                  <input
                    type="text"
                    value={emailSettings.fromName}
                    onChange={e => setEmailSettings({...emailSettings, fromName: e.target.value})}
                    className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <p className="text-sm text-gray-500 mt-1">Display name for outgoing emails</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Reply-To Email Address
                  </label>
                  <input
                    type="email"
                    value={emailSettings.replyToEmail}
                    onChange={e => setEmailSettings({...emailSettings, replyToEmail: e.target.value})}
                    className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <p className="text-sm text-gray-500 mt-1">Where users can reply with questions</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Admin Notification Email
                  </label>
                  <input
                    type="email"
                    value={emailSettings.adminEmail}
                    onChange={e => setEmailSettings({...emailSettings, adminEmail: e.target.value})}
                    className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <p className="text-sm text-gray-500 mt-1">Receive notifications when new schedules are created</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailSettings.sendAdminNotifications}
                      onChange={e => setEmailSettings({...emailSettings, sendAdminNotifications: e.target.checked})}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Send admin notifications</span>
                  </label>
                  <p className="text-sm text-gray-500 mt-1 ml-6">Get notified when users create new schedules</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailSettings.attachPdf}
                      onChange={e => setEmailSettings({...emailSettings, attachPdf: e.target.checked})}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Attach PDF to emails</span>
                  </label>
                  <p className="text-sm text-gray-500 mt-1 ml-6">Include schedule PDF as email attachment</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Email Subject Line
                  </label>
                  <input
                    type="text"
                    value={emailSettings.emailSubject}
                    onChange={e => setEmailSettings({...emailSettings, emailSubject: e.target.value})}
                    className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <p className="text-sm text-gray-500 mt-1">Available variables: {'{name}'}, {'{schedule_name}'}, {'{date}'}</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Email Template
                  </label>
                  <textarea
                    rows={8}
                    value={emailSettings.emailTemplate}
                    onChange={e => setEmailSettings({...emailSettings, emailTemplate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Available variables: {'{name}'}, {'{email}'}, {'{schedule_name}'}, {'{zones}'}, {'{location}'}
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-sm text-green-900 mb-2">Test Email</h4>
                  <p className="text-sm text-gray-700 mb-3">Send a test email to verify your settings</p>
                  <div className="flex gap-3">
                    <input
                      type="email"
                      value={testEmail}
                      onChange={e => setTestEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="flex-1 max-w-sm px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm"
                    />
                    <button 
                      onClick={() => handleTestEmail(testEmail)}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors"
                    >
                      Send Test Email
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button 
                    onClick={() => handleSaveSettings('email', emailSettings)}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    Save Email Settings
                  </button>
                </div>
              </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer with version info */}
        <div className="mt-8 pt-6 border-t border-gray-300">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Droplet className="w-4 h-4 text-blue-500" />
              <span>Big Irrigation Schedule Calculator</span>
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
                v{PLUGIN_VERSION}
              </span>
            </div>
            <div className="text-gray-500 text-xs">
              © {new Date().getFullYear()} Big Irrigation. All rights reserved.
            </div>
          </div>
        </div>

      {/* Submission Detail Modal */}
      <AnimatePresence>
        {selectedSubmission && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" 
            onClick={() => setSelectedSubmission(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" 
              onClick={e => e.stopPropagation()}
            >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl text-gray-900">Submission Details</h3>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Information */}
              <div>
                <h4 className="text-gray-900 mb-3 pb-2 border-b border-gray-200">Contact Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Name</div>
                    <div className="text-gray-900">{selectedSubmission.name || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Email</div>
                    <div className="text-gray-900">{selectedSubmission.email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Phone</div>
                    <div className="text-gray-900">{selectedSubmission.phone || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Company</div>
                    <div className="text-gray-900">{selectedSubmission.company || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Property Information */}
              <div>
                <h4 className="text-gray-900 mb-3 pb-2 border-b border-gray-200">Property Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Address</div>
                    <div className="text-gray-900">{selectedSubmission.address || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Location</div>
                    <div className="text-gray-900">{selectedSubmission.location}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Coordinates</div>
                    <div className="text-gray-900 text-sm font-mono">
                      {selectedSubmission.lat !== undefined && selectedSubmission.lng !== undefined
                        ? `${selectedSubmission.lat.toFixed(4)}, ${selectedSubmission.lng.toFixed(4)}`
                        : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Schedule Name</div>
                    <div className="text-gray-900">{selectedSubmission.scheduleName || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Watering Restrictions */}
              <div>
                <h4 className="text-gray-900 mb-3 pb-2 border-b border-gray-200">Watering Restrictions</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Allowed Days</div>
                    <div className="text-gray-900">
                      {selectedSubmission.restrictions?.allowedDays?.join(', ') || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Time Window</div>
                    <div className="text-gray-900">
                      {selectedSubmission.restrictions?.startTime && selectedSubmission.restrictions?.endTime
                        ? `${selectedSubmission.restrictions.startTime} - ${selectedSubmission.restrictions.endTime}`
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Zone Details */}
              {selectedSubmission.zoneDetails && selectedSubmission.zoneDetails.length > 0 ? (
                <div>
                  <h4 className="text-gray-900 mb-3 pb-2 border-b border-gray-200">
                    Zone Details ({selectedSubmission.zones} zones)
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="border border-gray-200 px-3 py-2 text-left">Name</th>
                          <th className="border border-gray-200 px-3 py-2 text-left">Plant Type</th>
                          <th className="border border-gray-200 px-3 py-2 text-left">Soil</th>
                          <th className="border border-gray-200 px-3 py-2 text-left">Slope</th>
                          <th className="border border-gray-200 px-3 py-2 text-left">Sun</th>
                          <th className="border border-gray-200 px-3 py-2 text-left">Sprinkler</th>
                          <th className="border border-gray-200 px-3 py-2 text-left">Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSubmission.zoneDetails.map((zone, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="border border-gray-200 px-3 py-2">{zone.name}</td>
                            <td className="border border-gray-200 px-3 py-2 capitalize">{zone.plantType.replace('-', ' ')}</td>
                            <td className="border border-gray-200 px-3 py-2 capitalize">{zone.soilType}</td>
                            <td className="border border-gray-200 px-3 py-2 capitalize">{zone.slope}</td>
                            <td className="border border-gray-200 px-3 py-2 capitalize">{zone.sunExposure.replace('-', ' ')}</td>
                            <td className="border border-gray-200 px-3 py-2">{zone.sprayHeadType}</td>
                            <td className="border border-gray-200 px-3 py-2 capitalize">{zone.landscapeType}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="text-gray-900 mb-3 pb-2 border-b border-gray-200">
                    Zone Details ({selectedSubmission.zones} zones)
                  </h4>
                  <p className="text-gray-500 text-sm">Zone details not available for this submission.</p>
                </div>
              )}

              {/* Technical Information */}
              <div>
                <h4 className="text-gray-900 mb-3 pb-2 border-b border-gray-200">Technical Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">IP Address</div>
                    <div className="text-gray-900 text-sm font-mono">{selectedSubmission.ipAddress || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Submission Date</div>
                    <div className="text-gray-900">{selectedSubmission.date}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm text-gray-600">User Agent</div>
                    <div className="text-gray-900 text-xs font-mono break-all">{selectedSubmission.userAgent || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
                <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg">
                  Re-send Email
                </button>
                <button 
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg ml-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
      </div>
      </div>
    </div>
  );
}
