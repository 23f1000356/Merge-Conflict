import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { LogOut, Menu, Eye, Loader, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { auditLogService } from '../services/api';

const AdminSecurity = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [securityStats, setSecurityStats] = useState({
    failedLogins: 0,
    activeSessions: 0,
    dataExports: 0,
    roleChanges: 0,
  });

  // Fetch audit logs on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [logsRes, statsRes] = await Promise.all([
          auditLogService.getAuditLogs(10),
          auditLogService.getSecurityStats(),
        ]);
        setAuditLogs(logsRes.data || []);
        setSecurityStats(statsRes.data || securityStats);
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Failed to fetch security data';
        toast.error(errorMsg);
        console.error('Error fetching security data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Security & Audit Trail</h1>
          <p className="text-gray-600 mb-6">Monitor login activities, system changes, and user actions</p>

          {/* Security Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-gray-600 mb-2">Failed Login Attempts</p>
              <p className="text-3xl font-bold text-red-600">{securityStats.failedLogins}</p>
              <p className="text-sm text-gray-500 mt-2">Last 24 hours</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-gray-600 mb-2">Active Sessions</p>
              <p className="text-3xl font-bold text-green-600">{securityStats.activeSessions}</p>
              <p className="text-sm text-gray-500 mt-2">Authorized users</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-gray-600 mb-2">Data Exports</p>
              <p className="text-3xl font-bold text-blue-600">{securityStats.dataExports}</p>
              <p className="text-sm text-gray-500 mt-2">This month</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-gray-600 mb-2">Role Changes</p>
              <p className="text-3xl font-bold text-purple-600">{securityStats.roleChanges}</p>
              <p className="text-sm text-gray-500 mt-2">Recent changes</p>
            </div>
          </div>

          {/* Audit Trail */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Audit Trail</h2>
              {loading && <Loader className="w-5 h-5 animate-spin text-cyan-600" />}
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-6 h-6 animate-spin text-cyan-600 mr-3" />
                <span className="text-gray-600">Loading audit logs...</span>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-600 font-medium">No audit logs found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-3 text-left font-bold text-gray-900">Time</th>
                      <th className="px-6 py-3 text-left font-bold text-gray-900">Action</th>
                      <th className="px-6 py-3 text-left font-bold text-gray-900">User</th>
                      <th className="px-6 py-3 text-left font-bold text-gray-900">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-600">{log.time || log.timestamp}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{log.action}</td>
                        <td className="px-6 py-4 text-gray-600">{log.user || log.email}</td>
                        <td className="px-6 py-4 text-gray-600">
                          <div className="flex items-center gap-2">
                            <span className="line-clamp-1">{log.details || log.description}</span>
                            <Eye className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSecurity;
