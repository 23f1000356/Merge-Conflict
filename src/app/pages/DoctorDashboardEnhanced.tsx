import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Calendar,
  RefreshCw,
  Users,
  Clock,
  Activity,
  LogOut,
  Menu,
  BarChart3,
  Download
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '../components/ui/button';
import { doctorService } from '../services/api';
import { toast } from 'sonner';

const DoctorDashboardEnhanced = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get logged-in doctor's info from localStorage
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const doctorName = userData?.fullName || userData?.name || 'Dr. Unknown';

  // Mock data for charts
  const monthlyTrendData = [
    { month: 'Jan', patientsAssessed: 45, improved: 32, riseCases: 8 },
    { month: 'Feb', patientsAssessed: 52, improved: 38, riseCases: 7 },
    { month: 'Mar', patientsAssessed: 48, improved: 35, riseCases: 10 },
    { month: 'Apr', patientsAssessed: 61, improved: 44, riseCases: 9 },
    { month: 'May', patientsAssessed: 55, improved: 40, riseCases: 6 },
  ];

  const riskDistribution = [
    { name: 'Low Risk', value: 18, color: '#10b981' },
    { name: 'Moderate', value: 8, color: '#f59e0b' },
    { name: 'High Risk', value: 4, color: '#ef4444' },
  ];

  const patientCategoryData = [
    { category: 'Cognitive Decline', count: 12, fill: '#ef4444' },
    { category: 'Stable', count: 15, fill: '#10b981' },
    { category: 'Improving', count: 3, fill: '#3b82f6' },
  ];

  // 📊 FETCH DASHBOARD DATA
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const res = await doctorService.getDashboard();

      if (res?.data?.success) {
        setDashboardData(res.data);
        setLastRefresh(new Date());
      }
    } catch (err) {
      toast.error('Error fetching dashboard');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  // First load
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  // 🎯 THE 4 INSTANT INSIGHTS
  const highRiskPatients = dashboardData?.highRiskCount || 0;
  const overdueFollowUps = dashboardData?.followUpDueCount || 0;
  const decliningPatients = dashboardData?.patientList?.filter(
    (p: any) => p.trend === 'declining'
  ).length || 0;
  const todayAppointments = dashboardData?.todayAppointmentsCount || 0;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 transition-transform duration-300 z-40 md:z-0 overflow-y-auto`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">CogniHealth</h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 hover:bg-gray-100 rounded">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {[
            { icon: '📊', label: 'Dashboard', path: '/dashboard/doctor' },
            { icon: '👥', label: 'My Patients', path: '/dashboard/doctor/patients' },
            { icon: '📅', label: 'Appointments', path: '/dashboard/doctor/appointments' },
            { icon: '📜', label: 'History', path: '/dashboard/doctor/history' },
            { icon: '📄', label: 'Reports', path: '/dashboard/doctor/reports' },
            { 
              icon: '🚨', 
              label: 'Alerts', 
              path: '/dashboard/doctor/alerts',
              badge: dashboardData?.activeAlerts?.length || 0
            },
            { icon: '⚙️', label: 'Settings', path: '/dashboard/doctor/settings' },
          ].map((item: any) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                window.location.pathname === item.path
                  ? 'bg-cyan-50 text-cyan-600 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-3">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </span>
              {item.badge > 0 && (
                <span className="bg-cyan-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome, {doctorName}!</h1>
              <p className="text-gray-600 mt-1">Manage your patients and track their cognitive health</p>
            </div>
            <Button
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="gap-2"
              variant="outline"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        <div className="p-4 md:p-8">
          {/* KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* High-Risk Patients */}
            <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl p-6 shadow-md text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100 text-xs uppercase tracking-wide font-semibold">High-Risk Patients</p>
                  <p className="text-4xl font-bold mt-2">{highRiskPatients}</p>
                  <p className="text-xs text-cyan-100 mt-2">Need immediate attention</p>
                </div>
                <div className="w-12 h-12 bg-white/15 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Follow-ups Due */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 shadow-md text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-xs uppercase tracking-wide font-semibold">Follow-ups Due</p>
                  <p className="text-4xl font-bold mt-2">{overdueFollowUps}</p>
                  <p className="text-xs text-indigo-100 mt-2">Overdue follow-ups</p>
                </div>
                <div className="w-12 h-12 bg-white/15 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Declining Trends */}
            <div className="bg-gradient-to-r from-emerald-500 to-lime-600 rounded-xl p-6 shadow-md text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-xs uppercase tracking-wide font-semibold">Declining Trends</p>
                  <p className="text-4xl font-bold mt-2">{decliningPatients}</p>
                  <p className="text-xs text-emerald-100 mt-2">Performance decline</p>
                </div>
                <div className="w-12 h-12 bg-white/15 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Today's Appointments */}
            <div className="bg-gradient-to-r from-sky-500 to-cyan-600 rounded-xl p-6 shadow-md text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sky-100 text-xs uppercase tracking-wide font-semibold">Today's Appointments</p>
                  <p className="text-4xl font-bold mt-2">{todayAppointments}</p>
                  <p className="text-xs text-sky-100 mt-2">Scheduled today</p>
                </div>
                <div className="w-12 h-12 bg-white/15 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* CHARTS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Monthly Trend Analysis */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Monthly Trend Analysis</h3>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Download className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Line type="monotone" dataKey="patientsAssessed" stroke="#06b6d4" strokeWidth={2} name="Patients Assessed" />
                  <Line type="monotone" dataKey="improved" stroke="#10b981" strokeWidth={2} name="Improved" />
                  <Line type="monotone" dataKey="riseCases" stroke="#ef4444" strokeWidth={2} name="Risk Cases" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Risk Distribution Pie */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Risk Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} (${value})`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PATIENT CATEGORY DISTRIBUTION */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Patient Health Status Distribution</h3>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Download className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={patientCategoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="category" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[8, 8, 0, 0]}>
                  {patientCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 🚨 ACTIVE ALERTS BANNER */}
          {dashboardData?.activeAlerts && dashboardData.activeAlerts.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Alerts</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {dashboardData.activeAlerts.slice(0, 5).map((alert: any) => {
                  const isCritical = alert.severity === 'critical' || alert.severity === 'high';
                  return (
                    <div
                      key={alert.id}
                      className={`border-l-4 rounded p-4 ${
                        isCritical
                          ? 'border-l-cyan-600 bg-cyan-50'
                          : 'border-l-blue-600 bg-cyan-50'
                      }`}
                    >
                      <div className="flex gap-3">
                        <AlertCircle className={`flex-shrink-0 mt-1 ${
                          isCritical ? 'text-cyan-600' : 'text-cyan-600'
                        }`} size={18} />
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-semibold text-sm ${
                            isCritical ? 'text-cyan-900' : 'text-cyan-900'
                          }`}>
                            {alert.patientName}: {alert.alertType}
                          </h3>
                          <p className={`text-xs mt-1 ${
                            isCritical ? 'text-cyan-700' : 'text-cyan-700'
                          }`}>
                            {alert.title}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 🗓️ TODAY'S APPOINTMENTS */}
          {dashboardData?.todayAppointments && dashboardData.todayAppointments.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Schedule</h2>
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="space-y-3">
                  {dashboardData.todayAppointments.map((apt: any) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 font-bold">
                          {apt.patientName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{apt.patientName}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(apt.time).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                            {' • '}
                            {apt.duration || 30} mins • {apt.mode}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            apt.riskLevel === 'High'
                              ? 'bg-red-100 text-red-700'
                              : apt.riskLevel === 'Moderate'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {apt.riskLevel}
                        </span>
                        <Button
                          onClick={() => navigate(`/dashboard/patient/${apt.patientId}`)}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 👥 PATIENT LIST WITH TRENDS */}
          {dashboardData?.patientList && dashboardData.patientList.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">My Patients</h2>
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Age</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Risk Level</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Score</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Brain Age</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Trend</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.patientList.slice(0, 10).map((patient: any, idx: number) => (
                        <tr
                          key={patient.id}
                          className={`border-b border-gray-200 hover:bg-gray-50 transition-colors`}
                        >
                          <td className="py-3 px-4">
                            <div className="font-semibold text-gray-900">{patient.fullName}</div>
                            <p className="text-xs text-gray-500">{patient.email}</p>
                          </td>
                          <td className="py-3 px-4 text-gray-700">{patient.age}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                patient.riskLevel === 'High'
                                  ? 'bg-red-100 text-red-700'
                                  : patient.riskLevel === 'Moderate'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-green-100 text-green-700'
                              }`}
                            >
                              {patient.riskLevel}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-gray-900">{patient.riskProbability.toFixed(1)}%</div>
                            <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                              <div
                                className={`h-2 rounded-full ${
                                  patient.riskLevel === 'High'
                                    ? 'bg-red-600'
                                    : patient.riskLevel === 'Moderate'
                                    ? 'bg-yellow-600'
                                    : 'bg-green-600'
                                }`}
                                style={{
                                  width: `${patient.riskProbability}%`
                                }}
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {patient.brainAge ? (
                              <div>
                                <div className="font-semibold">{patient.brainAge}</div>
                                <p className="text-xs text-gray-500">
                                  {patient.age - patient.brainAge > 0 ? '↓' : '↑'} {Math.abs(
                                    patient.age - patient.brainAge
                                  )} yrs
                                </p>
                              </div>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {patient.trend === 'improving' ? (
                                <TrendingUp className="text-green-600" size={16} />
                              ) : patient.trend === 'declining' ? (
                                <TrendingDown className="text-red-600" size={16} />
                              ) : (
                                <Activity className="text-gray-600" size={16} />
                              )}
                              <span className="text-xs font-medium">{patient.trendEmoji}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              onClick={() => navigate(`/dashboard/patient/${patient.id}`)}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {dashboardData.patientList.length > 10 && (
                  <div className="mt-4 text-center">
                    <Button
                      onClick={() => navigate('/dashboard/doctor/patients')}
                      variant="outline"
                    >
                      View All Patients ({dashboardData.patientList.length})
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!dashboardData?.patientList || dashboardData.patientList.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-sm text-center">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No patients assigned</h3>
              <p className="text-gray-600">
                You don't have any patients assigned yet. Contact your administrator to assign patients.
              </p>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboardEnhanced;

