import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import Sidebar from '../components/Sidebar';
import { Menu, LogOut, Search, Star, MapPin, Clock } from 'lucide-react';
import { userService } from '../services/api';

export default function AdminDoctorsList() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await userService.getAllUsers();
        const doctorsList = response.data?.filter((u: any) => u.role === 'doctor') || [];
        setDoctors(doctorsList);
        setFilteredDoctors(doctorsList);
      } catch (error) {
        console.error('Failed to fetch doctors', error);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    const filtered = doctors.filter(doc =>
      (doc.fullName || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredDoctors(filtered);
  }, [searchQuery, doctors]);

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
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Doctors Management</h1>
            <p className="text-gray-600 mt-1">Manage all medical staff and their availability</p>
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

        {/* Search Bar */}
        <div className="mb-8 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by doctor name..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        {/* Doctors Grid - Mobile Optimized */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
              >
                {/* Header with gradient */}
                <div className="h-32 bg-gradient-to-r from-cyan-500 to-blue-600 relative">
                  <div className="absolute bottom-0 left-4 translate-y-1/2">
                    <div className="w-20 h-20 bg-gray-200 rounded-full border-4 border-white flex items-center justify-center text-3xl font-bold text-cyan-600">
                      {doctor.fullName?.charAt(0).toUpperCase() || 'D'}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 pt-12">
                  <h3 className="text-lg font-bold text-gray-900">{doctor.fullName || 'Dr. Unknown'}</h3>
                  <p className="text-sm text-cyan-600 font-semibold mb-4">Medical Professional</p>

                  {/* Stats */}
                  <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>Rating: <strong>4.8/5.0</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span>Location: <strong>Main Hospital</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span>Availability: <strong>9 AM - 5 PM</strong></span>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <p className="text-xs text-gray-600">Patients</p>
                      <p className="text-xl font-bold text-green-600">
                        {Math.floor(Math.random() * 20) + 5}
                      </p>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <p className="text-xs text-gray-600">This Week</p>
                      <p className="text-xl font-bold text-blue-600">
                        {Math.floor(Math.random() * 8) + 2}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button 
                    onClick={() => navigate(`/doctor/${doctor.id}`)}
                    className="w-full py-2 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-colors"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-xl border border-gray-200 p-12 text-center">
              <p className="text-gray-500 mb-4">No doctors found</p>
              {searchQuery && <p className="text-sm text-gray-400">Try a different search term</p>}
            </div>
          )}
        </div>

        {/* Summary Statistics */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <p className="text-gray-600 mb-2">Total Doctors</p>
            <p className="text-3xl font-bold text-gray-900">{doctors.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <p className="text-gray-600 mb-2">Active Today</p>
            <p className="text-3xl font-bold text-green-600">{Math.ceil(doctors.length * 0.8)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <p className="text-gray-600 mb-2">Avg. Rating</p>
            <p className="text-3xl font-bold text-cyan-600">4.8 ⭐</p>
          </div>
        </div>
      </main>
    </div>
  );
}
