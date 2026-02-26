import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import Sidebar from '../components/Sidebar';
import { Menu, LogOut, TrendingUp, Search, Calendar, Users, Award } from 'lucide-react';
import { userService } from '../services/api';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [doctor, setDoctor] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setDoctor(JSON.parse(userData));
    }

    const fetchPatients = async () => {
      try {
        const response = await userService.getPatients();
        setPatients(response.data);
      } catch (error) {
        console.error('Failed to fetch patients', error);
      }
    };

    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((p) =>
    (p.fullName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const highRiskPatients = patients.filter(
    (p) => (p.RiskScores?.[0]?.riskProbability || 0) > 60
  ).length;

  const getRiskColor = (risk: number) => {
    if (risk < 30) return 'bg-green-100 text-green-700';
    if (risk < 60) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Hello, Dr. {doctor?.fullName?.split(' ').pop() || 'Doctor'}! 👋</h1>
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

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2">Total Consultations</p>
                <p className="text-3xl font-bold text-gray-900">{patients.length}</p>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2">Upcoming Patients</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
                <p className="text-xs text-gray-500 mt-1">This week</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2">Completed Today</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
                <p className="text-xs text-green-600 mt-1">✓ On track</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2">Average Rating</p>
                <p className="text-3xl font-bold text-gray-900">4.8 ⭐</p>
                <p className="text-xs text-gray-500 mt-1">from {patients.length} patients</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Request Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* High Risk Alert */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Appointment Requests</h2>
              {highRiskPatients > 0 ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-900 font-semibold">⚠️ {highRiskPatients} HIGH RISK patient(s) need review</p>
                  <p className="text-red-800 text-sm mt-1">Significant cognitive decline detected</p>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-green-900 font-semibold">✓ All clear - No urgent requests</p>
                  <p className="text-green-800 text-sm mt-1">All patients are stable</p>
                </div>
              )}

              {/* Sample Appointment - Would be populated from database */}
              <div className="space-y-3 mt-4">
                {patients.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">No appointment requests at the moment</p>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{patients[0]?.fullName}</p>
                        <p className="text-sm text-gray-600 mt-1">Cognitive Assessment Follow-up</p>
                      </div>
                      <button className="px-3 py-1 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700">
                        Accept
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* My Availability */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">My Availability</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Monday</span>
                <span className="font-medium text-gray-900">9:00 - 5:00 PM</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Tuesday</span>
                <span className="font-medium text-gray-900">9:00 - 5:00 PM</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Wednesday</span>
                <span className="font-medium text-gray-900">9:00 - 5:00 PM</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Thursday</span>
                <span className="font-medium text-gray-900">9:00 - 5:00 PM</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Friday</span>
                <span className="font-medium text-gray-900">9:00 - 3:00 PM</span>
              </div>
            </div>
            <button className="w-full mt-4 py-2 bg-cyan-50 text-cyan-600 rounded-lg font-medium hover:bg-cyan-100 transition-colors">
              Edit Schedule
            </button>
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Patients</h2>
            <Link to="/appointments" className="text-cyan-600 hover:text-cyan-700 font-medium text-sm">
              View All →
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
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Gender</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Age</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Risk Level</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.slice(0, 5).map((patient) => {
                    const risk = patient.RiskScores?.[0]?.riskProbability || 0;
                    const riskLevel = risk > 60 ? 'High' : risk > 30 ? 'Moderate' : 'Low';
                    return (
                      <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{patient.fullName}</td>
                        <td className="py-3 px-4 text-gray-700">{patient.gender || 'N/A'}</td>
                        <td className="py-3 px-4 text-gray-700">{patient.age}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getRiskColor(risk)}`}>
                            {riskLevel}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                            Active
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
                    );
                  })}
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
