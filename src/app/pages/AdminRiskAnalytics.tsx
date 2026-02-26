import { useState } from 'react';
import { useNavigate } from 'react-router';
import { LogOut, Menu } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'sonner';

const AdminRiskAnalytics = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const riskByAge = [
    { ageGroup: '18-25', low: 45, moderate: 28, high: 8 },
    { ageGroup: '26-35', low: 52, moderate: 35, high: 18 },
    { ageGroup: '36-45', low: 48, moderate: 42, high: 28 },
    { ageGroup: '46-55', low: 38, moderate: 48, high: 35 },
    { ageGroup: '56-65', low: 28, moderate: 52, high: 45 },
    { ageGroup: '65+', low: 18, moderate: 42, high: 55 }
  ];

  const riskTrend = [
    { month: 'Jan', highRisk: 85, moderateRisk: 120, lowRisk: 450 },
    { month: 'Feb', highRisk: 92, moderateRisk: 135, lowRisk: 465 },
    { month: 'Mar', highRisk: 105, moderateRisk: 155, lowRisk: 480 },
    { month: 'Apr', highRisk: 98, moderateRisk: 145, lowRisk: 520 },
    { month: 'May', highRisk: 112, moderateRisk: 168, lowRisk: 545 }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 transition-transform duration-300 z-40 md:z-0 overflow-y-auto`}>
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">Admin</h1>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 hover:bg-gray-100 rounded">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {[
            { icon: '📊', label: 'Dashboard', path: '/dashboard/admin' },
            { icon: '👥', label: 'Users', path: '/admin/users' },
            { icon: '👨‍⚕️', label: 'Doctors', path: '/admin/doctors' },
            { icon: '🤖', label: 'AI Model', path: '/admin/ai-model' },
            { icon: '📈', label: 'Risk Analytics', path: '/admin/risk-analytics' },
            { icon: '📅', label: 'Appointments', path: '/admin/appointments' },
            { icon: '📄', label: 'Reports', path: '/admin/reports' },
            { icon: '🖥️', label: 'System Health', path: '/admin/system-health' },
            { icon: '🔐', label: 'Security', path: '/admin/security' },
            { icon: '⚙️', label: 'Settings', path: '/admin/settings' },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                window.location.pathname === item.path
                  ? 'bg-cyan-50 text-cyan-600 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button onClick={handleLogout} className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg">
        <Menu className="w-6 h-6" />
      </button>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Risk Analytics</h1>
          <p className="text-gray-600 mb-6">Comprehensive risk distribution and trend analysis</p>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-gray-600 mb-2">Total High-Risk Cases</p>
              <p className="text-3xl font-bold text-red-600">112</p>
              <p className="text-sm text-gray-500 mt-2">+8% from last month</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-gray-600 mb-2">Moderate Risk</p>
              <p className="text-3xl font-bold text-yellow-600">168</p>
              <p className="text-sm text-gray-500 mt-2">+12% from last month</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-gray-600 mb-2">At-Risk Alerts</p>
              <p className="text-3xl font-bold text-cyan-600">34</p>
              <p className="text-sm text-gray-500 mt-2">Pending review</p>
            </div>
          </div>

          {/* Risk Trend */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Risk Trends Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={riskTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="highRisk" fill="#ef4444" stroke="#dc2626" />
                <Area type="monotone" dataKey="moderateRisk" fill="#f59e0b" stroke="#d97706" />
                <Area type="monotone" dataKey="lowRisk" fill="#10b981" stroke="#059669" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Risk by Age */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Risk Distribution by Age Group</h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={riskByAge}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="ageGroup" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Bar dataKey="low" fill="#10b981" name="Low Risk" />
                <Bar dataKey="moderate" fill="#f59e0b" name="Moderate Risk" />
                <Bar dataKey="high" fill="#ef4444" name="High Risk" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminRiskAnalytics;
