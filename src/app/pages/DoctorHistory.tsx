import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { LogOut, Menu, Calendar, User, ChevronRight } from 'lucide-react';
import { doctorService } from '../services/api';
import { toast } from 'sonner';

const DoctorHistory = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const doctorName = localStorage.getItem('doctorName') || 'Dr. Sarah Johnson';

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await doctorService.getDashboard();
      if (res?.data?.success && res.data.patientList) {
        setPatients(res.data.patientList);
      }
    } catch (err) {
      toast.error('Error fetching history');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-600"></div>
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
                item.path === '/dashboard/doctor/history'
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
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Patient History</h1>
          <p className="text-gray-600 mb-6">View past interactions and appointments with your patients</p>

          {patients.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{patient.fullName}</h3>
                      <p className="text-sm text-gray-600">{patient.age} years old</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-cyan-600" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Risk Level</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs font-medium px-3 py-1 rounded-full ${
                            patient.riskLevel === 'High'
                              ? 'bg-red-100 text-red-800'
                              : patient.riskLevel === 'Moderate'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {patient.riskLevel}
                        </span>
                        <span className="text-sm font-semibold text-gray-700">
                          {patient.riskProbability?.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Brain Age</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{patient.brainAge}</p>
                    </div>

                    {patient.trend && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Trend</p>
                        <p className={`text-sm font-medium mt-1 ${
                          patient.trend === 'declining' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {patient.trend === 'declining' ? 'Declining' : 'Stable'}
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => navigate(`/dashboard/patient/${patient.id}`)}
                    className="w-full mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    View Details
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No History</h3>
              <p className="text-gray-600">No patient history available at this time.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DoctorHistory;
