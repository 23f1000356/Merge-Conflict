import { useState } from 'react';
import { useNavigate } from 'react-router';
import { LogOut, Menu, Download, FileText } from 'lucide-react';

const AdminReports = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const reports = [
    { id: 1, name: 'Monthly Analytics Report', generated: '2024-02-20', type: 'PDF', size: '2.4 MB', downloads: 45 },
    { id: 2, name: 'Risk Assessment Summary', generated: '2024-02-19', type: 'PDF', size: '1.8 MB', downloads: 28 },
    { id: 3, name: 'Doctor Performance Metrics', generated: '2024-02-18', type: 'Excel', size: '3.2 MB', downloads: 62 },
    { id: 4, name: 'Patient Demographics Report', generated: '2024-02-17', type: 'PDF', size: '1.5 MB', downloads: 35 },
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Report Monitoring</h1>
              <p className="text-gray-600">View and manage generated reports and logs</p>
            </div>
            <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium">
              📊 Generate Report
            </button>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-gray-600 mb-2">Total Reports</p>
              <p className="text-3xl font-bold text-gray-900">628</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-gray-600 mb-2">This Month</p>
              <p className="text-3xl font-bold text-blue-600">124</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-gray-600 mb-2">Total Downloads</p>
              <p className="text-3xl font-bold text-green-600">1,245</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-gray-600 mb-2">Storage Used</p>
              <p className="text-3xl font-bold text-purple-600">45.2 GB</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-900">Report Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-900">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-900">Generated</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-900">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-900">Downloads</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        {report.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{report.type}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{report.generated}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{report.size}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{report.downloads}</td>
                      <td className="px-6 py-4 text-sm">
                        <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg">
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
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

export default AdminReports;
