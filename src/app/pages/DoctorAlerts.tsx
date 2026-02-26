import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { LogOut, Menu, AlertCircle, Bell, ChevronRight } from 'lucide-react';
import { doctorService } from '../services/api';
import { toast } from 'sonner';

const DoctorAlerts = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
  const doctorName = localStorage.getItem('doctorName') || 'Dr. Sarah Johnson';

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await doctorService.getDashboard();
      if (res?.data?.success && res.data.activeAlerts) {
        setAlerts(res.data.activeAlerts);
      }
    } catch (err) {
      toast.error('Error fetching alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleDismissAlert = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
    toast.success('Alert dismissed');
  };

  const filteredAlerts = filterSeverity === 'all'
    ? alerts
    : alerts.filter(alert => alert.severity?.toLowerCase() === filterSeverity);

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'border-l-red-600 bg-red-50';
      case 'medium':
        return 'border-l-orange-600 bg-orange-50';
      case 'low':
        return 'border-l-yellow-600 bg-yellow-50';
      default:
        return 'border-l-cyan-600 bg-cyan-50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-orange-600';
      default:
        return 'text-cyan-600';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-cyan-100 text-cyan-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 transition-transform duration-300 z-40 md:z-0 overflow-y-auto`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">C</span>
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
            { icon: '🚨', label: 'Alerts', path: '/dashboard/doctor/alerts' },
            { icon: '⚙️', label: 'Settings', path: '/dashboard/doctor/settings' },
          ].map((item: any) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                item.path === '/dashboard/doctor/alerts'
                  ? 'bg-cyan-50 text-cyan-600 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
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

      {/* Mobile Menu */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Alerts & Notifications</h1>
          <p className="text-gray-600 mb-6">Patient alerts requiring your attention</p>

          {/* Filter */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setFilterSeverity('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterSeverity === 'all'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Alerts ({alerts.length})
            </button>
            <button
              onClick={() => setFilterSeverity('critical')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterSeverity === 'critical'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Critical ({alerts.filter(a => a.severity?.toLowerCase() === 'critical').length})
            </button>
            <button
              onClick={() => setFilterSeverity('high')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterSeverity === 'high'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              High ({alerts.filter(a => a.severity?.toLowerCase() === 'high').length})
            </button>
          </div>

          {filteredAlerts.length > 0 ? (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`border-l-4 rounded-lg p-6 hover:shadow-lg transition-shadow ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 flex gap-4">
                      <div className={`flex-shrink-0 ${getSeverityIcon(alert.severity)} mt-0.5`}>
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{alert.patientName}</h3>
                          <span className={`text-xs font-medium px-3 py-1 rounded-full ${getSeverityBadgeColor(alert.severity)}`}>
                            {alert.severity || 'Medium'}
                          </span>
                        </div>
                        <p className="font-medium text-gray-800 mb-1">{alert.alertType}</p>
                        <p className="text-sm text-gray-700 mb-3">{alert.title}</p>
                        <button
                          onClick={() => navigate(`/dashboard/patient/${alert.patientId}`)}
                          className="text-cyan-600 hover:text-cyan-800 text-sm font-medium flex items-center gap-1"
                        >
                          View Patient Profile
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDismissAlert(alert.id)}
                      className="px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded transition-colors whitespace-nowrap ml-4"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Alerts</h3>
              <p className="text-gray-600">
                {filterSeverity === 'all'
                  ? 'All your patients are doing well!'
                  : `No ${filterSeverity} severity alerts at this time.`}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DoctorAlerts;
