import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import Sidebar from '../components/Sidebar';
import { Menu, LogOut, TrendingUp, Search, Calendar, Users, Award, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { doctorService, appointmentService, riskAlertService } from '../services/api';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [doctor, setDoctor] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setDoctor(JSON.parse(userData));
    }

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all dashboard data in parallel
      const [dashboardRes, patientsRes, appointmentsRes, alertsRes] = await Promise.all([
        doctorService.getDashboard(),
        doctorService.getPatients(),
        appointmentService.getDoctorAppointments('scheduled'),
        riskAlertService.getAlerts('active', undefined, 10)
      ]);

      setDashboardData(dashboardRes.data);
      setPatients(patientsRes.data.patients || []);
      setUpcomingAppointments(appointmentsRes.data.appointments || []);
      setActiveAlerts(alertsRes.data.alerts || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((p) =>
    (p.fullName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRiskColor = (riskLevel: string) => {
    if (riskLevel === 'High') return 'bg-red-100 text-red-700 border-red-300';
    if (riskLevel === 'Moderate') return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-green-100 text-green-700 border-green-300';
  };

  const getSeverityColor = (severity: string) => {
    if (severity === 'critical' || severity === 'high') return 'bg-red-100 text-red-700';
    if (severity === 'medium') return 'bg-yellow-100 text-yellow-700';
    return 'bg-blue-100 text-blue-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role="doctor" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      <main className="flex-1 md:ml-64 p-4 md:p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Hello, Dr. {doctor?.fullName?.split(' ').pop() || 'Doctor'}! 👋
            </h1>
            <p className="text-gray-600 mt-1">Manage your patients and consultations</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/login');
            }}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* KPI Cards - Main Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Patients */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2 text-sm font-medium">Total Patients</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardData?.kpis?.totalPatients || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Active patients</p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </div>

          {/* High Risk Patients */}
          <div className="bg-white rounded-xl border border-red-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2 text-sm font-medium">High Risk Patients</p>
                <p className="text-3xl font-bold text-red-600">{dashboardData?.kpis?.highRiskPatients || 0}</p>
                <p className="text-xs text-red-500 mt-1">Require attention</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          {/* Active Alerts */}
          <div className="bg-white rounded-xl border border-orange-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2 text-sm font-medium">Active Alerts</p>
                <p className="text-3xl font-bold text-orange-600">{dashboardData?.kpis?.activeAlerts || 0}</p>
                <p className="text-xs text-orange-500 mt-1">Unacknowledged</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-xl border border-blue-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2 text-sm font-medium">This Week</p>
                <p className="text-3xl font-bold text-blue-600">{dashboardData?.kpis?.weeklyAppointments || 0}</p>
                <p className="text-xs text-blue-500 mt-1">Appointments</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Recent Tests</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.kpis?.recentTests || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Follow-ups</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.kpis?.pendingFollowUps || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Overdue</p>
              </div>
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Clinical Notes</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.kpis?.recentNotes || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
              </div>
              <CheckCircle className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Alerts Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">⚠️ Active Risk Alerts</h2>
                <Link to="/alerts" className="text-cyan-600 hover:text-cyan-700 text-sm font-medium">
                  View All →
                </Link>
              </div>

              {activeAlerts.length > 0 ? (
                <div className="space-y-3">
                  {activeAlerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold">{alert.Patient?.fullName || 'Patient'}</p>
                          <p className="text-sm mt-1">{alert.title}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded">
                              {alert.alertType}
                            </span>
                            <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded">
                              {new Date(alert.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Link
                          to={`/patient/${alert.patientId}`}
                          className="px-3 py-1 bg-white bg-opacity-30 rounded text-sm hover:bg-opacity-50 transition-colors"
                        >
                          Review
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-900 font-semibold">✓ No active alerts</p>
                  <p className="text-green-800 text-sm mt-1">All patients are stable</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">📅 Upcoming</h2>
              <Link to="/appointments" className="text-cyan-600 hover:text-cyan-700 text-sm font-medium">
                View All →
              </Link>
            </div>

            {upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.slice(0, 5).map((apt) => (
                  <div
                    key={apt.id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <p className="font-semibold text-sm text-gray-900">{apt.Patient?.fullName}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(apt.appointmentDate).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{apt.appointmentType}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No upcoming appointments</p>
              </div>
            )}
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">👥 Your Patients</h2>
            <Link to="/appointments" className="text-cyan-600 hover:text-cyan-700 font-medium text-sm">
              Manage All →
            </Link>
          </div>

          {/* Search Bar */}
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Patients Table */}
          {filteredPatients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Age</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Risk Level</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Overall Score</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Brain Age Gap</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Trend</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.slice(0, 10).map((patient) => (
                    <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{patient.fullName}</td>
                      <td className="py-3 px-4 text-gray-700">{patient.age || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold border ${getRiskColor(
                            patient.riskLevel
                          )}`}
                        >
                          {patient.riskLevel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {patient.overallScore?.toFixed(1) || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {patient.brainAgeGap?.toFixed(1) || 'N/A'} yrs
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs">
                          {patient.weeklyTrend === 'improving' && '📈 Improving'}
                          {patient.weeklyTrend === 'declining' && '📉 Declining'}
                          {patient.weeklyTrend === 'stable' && '➡️ Stable'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          to={`/patient/${patient.id}`}
                          className="text-cyan-600 hover:text-cyan-700 font-medium"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No patients found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
