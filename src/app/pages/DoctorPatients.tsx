import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Search, Filter, ChevronRight, AlertCircle, TrendingDown, LogOut, Menu } from 'lucide-react';
import { Button } from '../components/ui/button';
import { doctorService } from '../services/api';
import { toast } from 'sonner';

const DoctorPatients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const doctorName = localStorage.getItem('doctorName') || 'Dr. Sarah Johnson';

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await doctorService.getDashboard();
      if (res?.data?.success && res.data.patientList) {
        setPatients(res.data.patientList);
        setFilteredPatients(res.data.patientList);
      }
    } catch (err) {
      toast.error('Error fetching patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = patients;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (riskFilter !== 'all') {
      filtered = filtered.filter(p => p.riskLevel?.toLowerCase() === riskFilter.toLowerCase());
    }

    setFilteredPatients(filtered);
  }, [searchTerm, riskFilter, patients]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
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
                item.path === '/dashboard/doctor/patients'
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
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Patients</h1>
          <p className="text-gray-600 mb-6">Manage and monitor your patient list</p>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">All Risk Levels</option>
                <option value="high">High Risk</option>
                <option value="moderate">Moderate Risk</option>
                <option value="low">Low Risk</option>
              </select>
            </div>
          </div>

          {/* Patients Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Patient Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Age</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Risk Level</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Risk %</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Brain Age</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Trend</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map((patient) => (
                      <tr key={patient.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900">{patient.fullName}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{patient.age}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(patient.riskLevel)}`}>
                            {patient.riskLevel}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{patient.riskProbability?.toFixed(1)}%</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{patient.brainAge}</td>
                        <td className="px-6 py-4 text-sm">
                          {patient.trend === 'declining' ? (
                            <span className="flex items-center gap-1 text-red-600">
                              <TrendingDown className="w-4 h-4" />
                              Declining
                            </span>
                          ) : (
                            <span className="text-green-600">Stable</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => navigate(`/dashboard/patient/${patient.id}`)}
                            className="text-cyan-600 hover:text-cyan-800 font-medium flex items-center gap-1"
                          >
                            View
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        No patients found matching your filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-4">Total patients: {filteredPatients.length}</p>
        </div>
      </main>
    </div>
  );
};

export default DoctorPatients;
