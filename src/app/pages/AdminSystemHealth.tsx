import { useState } from 'react';
import { useNavigate } from 'react-router';
import { LogOut, Menu, AlertCircle } from 'lucide-react';

const AdminSystemHealth = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const systemMetrics = [
    { name: 'CPU Usage', value: 45, max: 100, unit: '%', color: 'text-cyan-600' },
    { name: 'RAM Usage', value: 68, max: 100, unit: '%', color: 'text-blue-600' },
    { name: 'API Response Time', value: 145, max: 500, unit: 'ms', color: 'text-green-600' },
    { name: 'Database Connections', value: 234, max: 500, unit: '', color: 'text-purple-600' },
  ];

  const errorLogs = [
    { id: 1, time: '2024-02-26 14:30:45', severity: 'Error', message: 'Database connection timeout', count: 5 },
    { id: 2, time: '2024-02-26 12:15:20', severity: 'Warning', message: 'API response time exceeded threshold', count: 12 },
    { id: 3, time: '2024-02-26 09:45:10', severity: 'Info', message: 'System health check completed', count: 1 },
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">System Health & Monitoring</h1>
          <p className="text-gray-600 mb-6">Real-time system performance metrics and error logs</p>

          {/* System Metrics */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            {systemMetrics.map((metric) => (
              <div key={metric.name} className="bg-white rounded-xl border border-gray-200 p-6">
                <p className="text-gray-600 mb-3 text-sm font-medium">{metric.name}</p>
                <div className="flex items-end gap-2 mb-3">
                  <p className={`text-3xl font-bold ${metric.color}`}>{metric.value}</p>
                  <p className="text-gray-600 text-sm">/ {metric.max}{metric.unit}</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      metric.value > metric.max * 0.8 ? 'bg-red-600' :
                      metric.value > metric.max * 0.6 ? 'bg-yellow-600' :
                      'bg-green-600'
                    }`}
                    style={{ width: `${(metric.value / metric.max) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* System Status */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Server Status</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Uptime</span>
                  <span className="font-medium text-green-600">99.98%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Primary Server</span>
                  <span className="flex items-center gap-2"><span className="w-2 h-2 bg-green-600 rounded-full"></span>Online</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Database</span>
                  <span className="flex items-center gap-2"><span className="w-2 h-2 bg-green-600 rounded-full"></span>Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Cache Status</span>
                  <span className="flex items-center gap-2"><span className="w-2 h-2 bg-green-600 rounded-full"></span>Active</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Performance</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Avg Response Time</span>
                  <span className="font-medium">145ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Requests/sec</span>
                  <span className="font-medium">342</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Error Rate</span>
                  <span className="font-medium text-orange-600">0.12%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Last Backup</span>
                  <span className="font-medium">2 hours ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Logs */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Error Logs</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-bold text-gray-900">Time</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-900">Severity</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-900">Message</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-900">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {errorLogs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">{log.time}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-2 ${
                          log.severity === 'Error' ? 'text-red-600' :
                          log.severity === 'Warning' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`}>
                          <AlertCircle className="w-4 h-4" />
                          {log.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-900">{log.message}</td>
                      <td className="px-4 py-3 text-gray-600">{log.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSystemHealth;
