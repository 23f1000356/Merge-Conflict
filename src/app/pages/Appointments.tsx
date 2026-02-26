import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import Sidebar from '../components/Sidebar';
import { Menu, LogOut, Calendar, Clock, User, FileText, Search, Filter } from 'lucide-react';
import { userService } from '../services/api';

export default function Appointments() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);
  const [doctor, setDoctor] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setDoctor(JSON.parse(userData));
    }

    // Mock appointments data - In production, fetch from API
    const mockAppointments = [
      {
        id: 1,
        patientName: 'Rajesh Kumar',
        date: new Date(2026, 1, 26).toISOString(),
        time: '10:00 AM',
        status: 'completed',
        specialty: 'Cognitive Assessment',
        diagnosis: 'Early stage memory decline',
        treatment: 'Lifestyle modifications recommended',
        nextVisit: '2026-03-26',
      },
      {
        id: 2,
        patientName: 'Priya Singh',
        date: new Date(2026, 1, 25).toISOString(),
        time: '2:30 PM',
        status: 'completed',
        specialty: 'Cognitive Health Review',
        diagnosis: 'Normal cognitive function',
        treatment: 'Continue current routine',
        nextVisit: '2026-04-25',
      },
      {
        id: 3,
        patientName: 'Arjun Patel',
        date: new Date(2026, 2, 5).toISOString(),
        time: '11:00 AM',
        status: 'scheduled',
        specialty: 'Baseline Assessment',
        diagnosis: 'Pending',
        treatment: 'Pending',
        nextVisit: 'TBD',
      },
      {
        id: 4,
        patientName: 'Meera Desai',
        date: new Date(2026, 2, 10).toISOString(),
        time: '3:00 PM',
        status: 'scheduled',
        specialty: 'Follow-up Assessment',
        diagnosis: 'Pending',
        treatment: 'Pending',
        nextVisit: 'TBD',
      },
    ];

    setAppointments(mockAppointments);
    setFilteredAppointments(mockAppointments);
  }, []);

  useEffect(() => {
    let filtered = appointments;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(apt =>
        apt.patientName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    setFilteredAppointments(filtered);
  }, [searchQuery, statusFilter, appointments]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Appointment History</h1>
            <p className="text-gray-600 mt-1">View and manage all patient appointments</p>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2">Total Appointments</p>
                <p className="text-3xl font-bold text-gray-900">{appointments.length}</p>
              </div>
              <Calendar className="w-12 h-12 text-cyan-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2">Completed</p>
                <p className="text-3xl font-bold text-green-600">
                  {appointments.filter(a => a.status === 'completed').length}
                </p>
              </div>
              <FileText className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2">Scheduled</p>
                <p className="text-3xl font-bold text-blue-600">
                  {appointments.filter(a => a.status === 'scheduled').length}
                </p>
              </div>
              <Clock className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient name..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="scheduled">Scheduled</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-cyan-600" />
                      <h3 className="text-lg font-bold text-gray-900">{appointment.patientName}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-700">
                        {new Date(appointment.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-700">{appointment.time}</span>
                    </div>
                    <div className="pt-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(appointment.status)}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6">
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Specialty</p>
                      <p className="text-gray-900">{appointment.specialty}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Diagnosis</p>
                      <p className="text-gray-900">{appointment.diagnosis}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Treatment</p>
                      <p className="text-gray-900">{appointment.treatment}</p>
                    </div>
                    {appointment.status === 'completed' && (
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">Next Visit</p>
                        <p className="text-gray-900">{new Date(appointment.nextVisit).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <p className="text-gray-500">No appointments found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
