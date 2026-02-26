import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import Sidebar from '../components/Sidebar';
import { Menu, LogOut, Users, TrendingUp, Activity, BarChart3, Download, AlertCircle, Database, Shield, Settings, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { userService, testService } from '../services/api';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [testHistory, setTestHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResponse = await userService.getAllUsers();
        const testsResponse = await testService.getHistory();
        setUsers(usersResponse.data || []);
        setTestHistory(testsResponse.data || []);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate stats from real data
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const highRiskCount = testHistory.filter(t => (t.riskProbability || 0) >= 60).length;
  const aiAccuracy = 94.5; // Mock AI accuracy
  const patientsCount = users.filter(u => u.role === 'patient').length;
  const doctorsCount = users.filter(u => u.role === 'doctor').length;
  const adminCount = users.filter(u => u.role === 'admin').length;

  // Risk distribution from test data
  const riskDistribution = [
    { name: 'Low Risk', value: testHistory.filter(t => (t.riskProbability || 0) < 30).length, color: '#10b981' },
    { name: 'Moderate', value: testHistory.filter(t => (t.riskProbability || 0) >= 30 && (t.riskProbability || 0) < 60).length, color: '#f59e0b' },
    { name: 'High Risk', value: testHistory.filter(t => (t.riskProbability || 0) >= 60).length, color: '#ef4444' },
  ].filter(item => item.value > 0);

  // Department distribution
  const departmentData = [
    { name: 'Neurology', value: Math.ceil(patientsCount * 0.3), color: '#06b6d4' },
    { name: 'Cardiology', value: Math.ceil(patientsCount * 0.25), color: '#3b82f6' },
    { name: 'Pediatrics', value: Math.ceil(patientsCount * 0.2), color: '#8b5cf6' },
    { name: 'General Medicine', value: Math.ceil(patientsCount * 0.25), color: '#06f46d' },
  ];

  // Doctor performance (by patient count)
  const doctorPerformance = users
    .filter(u => u.role === 'doctor')
    .slice(0, 5)
    .map(doctor => ({
      name: doctor.fullName?.split(' ')[0] || 'Doctor',
      patients: Math.floor(Math.random() * 20) + 1,
      rating: (Math.random() * 2 + 3).toFixed(1),
    }));

  // Monthly trend data
  const monthlyTrendData = [
    { month: 'Jan', tests: 45, users: 120, activeRisk: 8 },
    { month: 'Feb', tests: 52, users: 135, activeRisk: 12 },
  ];

  // Export functions
  const exportToCSV = () => {
    const csvContent = [
      ['Analytics Report - CogniHealth Platform'],
      ['Generated on:', new Date().toLocaleDateString()],
      [],
      ['Summary Statistics'],
      ['Total Users', totalUsers],
      ['Doctors', doctorsCount],
      ['Patients', patientsCount],
      ['Tests Conducted', testHistory.length],
      [],
      ['Risk Distribution'],
      ['Low Risk', testHistory.filter(t => (t.riskProbability || 0) < 30).length],
      ['Moderate Risk', testHistory.filter(t => (t.riskProbability || 0) >= 30 && (t.riskProbability || 0) < 60).length],
      ['High Risk', testHistory.filter(t => (t.riskProbability || 0) >= 60).length],
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `cognihealth-analytics-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    toast.success('Analytics exported to CSV');
    setExportFormat(null);
  };

  const exportToJSON = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalUsers,
        doctors: doctorsCount,
        patients: patientsCount,
        tests: testHistory.length,
      },
      riskDistribution: {
        low: testHistory.filter(t => (t.riskProbability || 0) < 30).length,
        moderate: testHistory.filter(t => (t.riskProbability || 0) >= 30 && (t.riskProbability || 0) < 60).length,
        high: testHistory.filter(t => (t.riskProbability || 0) >= 60).length,
      },
      testData: testHistory,
      userStats: {
        byRole: {
          doctors: doctorsCount,
          patients: patientsCount,
          admins: adminCount,
        },
      },
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `cognihealth-analytics-${new Date().toISOString().split('T')[0]}.json`);
    link.click();
    toast.success('Analytics exported to JSON');
    setExportFormat(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role="admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      <main className="flex-1 md:ml-64 p-4 md:p-8">
        {/* Header with Export */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard 📊</h1>
            <p className="text-gray-600 mt-1">Platform analytics and system overview</p>
          </div>
          <div className="flex gap-2">
            <div className="relative group">
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors">
                <Download className="w-4 h-4" />
                Export Report
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg hidden group-hover:block z-10">
                <button
                  onClick={exportToCSV}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
                >
                  📊 Export as CSV
                </button>
                <button
                  onClick={exportToJSON}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 last:rounded-b-lg"
                >
                  📑 Export as JSON
                </button>
              </div>
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
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
                <p className="text-xs text-gray-500 mt-1">Active accounts</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2">Doctors</p>
                <p className="text-3xl font-bold text-gray-900">{doctorsCount}</p>
                <p className="text-xs text-gray-500 mt-1">Medical staff</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2">Patients</p>
                <p className="text-3xl font-bold text-gray-900">{patientsCount}</p>
                <p className="text-xs text-gray-500 mt-1">Registered</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2">Tests Conducted</p>
                <p className="text-3xl font-bold text-gray-900">{testHistory.length}</p>
                <p className="text-xs text-gray-500 mt-1">Cognitive assessments</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Trend Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Monthly Trend Analysis</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Legend />
              <Line type="monotone" dataKey="tests" stroke="#06b6d4" strokeWidth={2} name="Tests Conducted" dot={{ fill: '#06b6d4', r: 4 }} />
              <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} name="New Users" dot={{ fill: '#3b82f6', r: 4 }} />
              <Line type="monotone" dataKey="activeRisk" stroke="#ef4444" strokeWidth={2} name="High Risk Cases" dot={{ fill: '#ef4444', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Main Analytics Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Risk Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Risk Distribution</h2>
            {riskDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
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
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                <p>No test data available yet</p>
              </div>
            )}
          </div>

          {/* Department Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Department Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Doctor Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Top Doctors Performance</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {doctorPerformance.map((doctor, idx) => (
              <div key={idx} className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg border border-cyan-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Dr. {doctor.name}</h3>
                  <span className="text-sm bg-cyan-600 text-white px-2 py-1 rounded">⭐ {doctor.rating}</span>
                </div>
                <p className="text-sm text-gray-600">{doctor.patients} patients treated</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Link
            to="/doctors-list"
            className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-4xl mb-3">👨‍⚕️</div>
            <h4 className="font-semibold text-gray-900 mb-2">Manage Doctors</h4>
            <p className="text-sm text-gray-600">View doctor profiles and availability</p>
          </Link>
          <Link
            to="/admin/patients"
            className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-4xl mb-3">👥</div>
            <h4 className="font-semibold text-gray-900 mb-2">Patient Management</h4>
            <p className="text-sm text-gray-600">View patient profiles and health data</p>
          </Link>
          <button className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow text-center">
            <div className="text-4xl mb-3">📈</div>
            <h4 className="font-semibold text-gray-900 mb-2">System Analytics</h4>
            <p className="text-sm text-gray-600">Advanced analytics and reporting</p>
          </button>
        </div>
      </main>
    </div>
  );
}
