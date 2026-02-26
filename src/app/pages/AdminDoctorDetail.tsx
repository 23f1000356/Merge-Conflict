import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { LogOut, Menu, ArrowLeft, Mail, Phone, MapPin, Clock, Star, Edit, Save, X } from 'lucide-react';
import { userService } from '../services/api';
import { toast } from 'sonner';

const AdminDoctorDetail = () => {
  const navigate = useNavigate();
  const { doctorId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  useEffect(() => {
    fetchDoctorDetail();
  }, [doctorId]);

  const fetchDoctorDetail = async () => {
    try {
      setLoading(true);
      const res = await userService.getAllUsers();
      const doctorsList = res.data?.filter((u: any) => u.role === 'doctor') || [];
      const foundDoctor = doctorsList.find((d: any) => d.id === doctorId);
      
      if (foundDoctor) {
        setDoctor(foundDoctor);
        setEditData(foundDoctor);
      } else {
        toast.error('Doctor not found');
        navigate('/doctors-list');
      }
    } catch (err) {
      toast.error('Failed to fetch doctor details');
      navigate('/doctors-list');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleSaveChanges = () => {
    setDoctor(editData);
    setIsEditing(false);
    toast.success('Profile updated successfully');
  };

  const handleEditChange = (field: string, value: any) => {
    setEditData({ ...editData, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Doctor Not Found</h2>
          <button
            onClick={() => navigate('/doctors-list')}
            className="text-cyan-600 hover:text-cyan-700 font-medium"
          >
            Back to Doctors List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
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
            { icon: '👨‍⚕️', label: 'Doctors', path: '/doctors-list' },
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
        <div className="max-w-4xl mx-auto">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/doctors-list')}
              className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Doctors
            </button>
            <button
              onClick={() => {
                if (isEditing) {
                  handleSaveChanges();
                } else {
                  setIsEditing(true);
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isEditing
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-cyan-600 hover:bg-cyan-700 text-white'
              }`}
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </>
              )}
            </button>
          </div>

          {/* Profile Section */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
            {/* Header with gradient */}
            <div className="h-40 bg-gradient-to-r from-cyan-500 to-blue-600 relative">
              <div className="absolute bottom-0 left-6 translate-y-1/2">
                <div className="w-32 h-32 bg-gray-200 rounded-full border-4 border-white flex items-center justify-center text-6xl font-bold text-cyan-600">
                  {doctor.fullName?.charAt(0).toUpperCase() || 'D'}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 pt-20">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column - Basic Info */}
                <div>
                  <div className="mb-6">
                    <label className="text-gray-700 font-semibold">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData?.fullName || ''}
                        onChange={(e) => handleEditChange('fullName', e.target.value)}
                        className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-bold text-2xl">{doctor.fullName}</p>
                    )}
                  </div>

                  <div className="mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-lg font-bold text-gray-900">4.8/5.0</span>
                    <span className="text-sm text-gray-600">(156 reviews)</span>
                  </div>

                  <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        {isEditing ? (
                          <input
                            type="email"
                            value={editData?.email || ''}
                            onChange={(e) => handleEditChange('email', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900"
                          />
                        ) : (
                          <p className="text-gray-900">{doctor.email}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={editData?.phone || ''}
                            onChange={(e) => handleEditChange('phone', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900"
                          />
                        ) : (
                          <p className="text-gray-900">{doctor.phone || 'Not provided'}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        {isEditing ? (
                          <input
                            type="text"
                            defaultValue="Main Hospital"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900"
                          />
                        ) : (
                          <p className="text-gray-900">Main Hospital</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Availability</p>
                        {isEditing ? (
                          <input
                            type="text"
                            defaultValue="9 AM - 5 PM"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-gray-900"
                          />
                        ) : (
                          <p className="text-gray-900">9 AM - 5 PM</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Professional Info */}
                <div>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <h3 className="font-bold text-gray-900 text-lg">Professional Information</h3>
                    
                    <div>
                      <label className="text-sm text-gray-600">Specialty</label>
                      {isEditing ? (
                        <input
                          type="text"
                          defaultValue="Cognitive Specialist"
                          className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium mt-1">Cognitive Specialist</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm text-gray-600">License Number</label>
                      {isEditing ? (
                        <input
                          type="text"
                          defaultValue="MD-2019-45678"
                          className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium mt-1">MD-2019-45678</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm text-gray-600">Years of Experience</label>
                      {isEditing ? (
                        <input
                          type="number"
                          defaultValue="15"
                          className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium mt-1">15 years</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm text-gray-600">Status</label>
                      <p className={`text-gray-900 font-medium mt-1 px-3 py-1 rounded-full text-sm w-fit ${
                        doctor.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {doctor.status === 'approved' ? 'Approved' : 'Pending Approval'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-gray-600 text-sm mb-2">Total Patients</p>
              <p className="text-3xl font-bold text-gray-900">24</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-gray-600 text-sm mb-2">Completed Appointments</p>
              <p className="text-3xl font-bold text-green-600">156</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-gray-600 text-sm mb-2">Upcoming Appointments</p>
              <p className="text-3xl font-bold text-blue-600">8</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-gray-600 text-sm mb-2">Patient Satisfaction</p>
              <p className="text-3xl font-bold text-cyan-600">96%</p>
            </div>
          </div>

          {/* Recent Appointments */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Recent Appointments</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left font-bold text-gray-900">Patient</th>
                    <th className="px-6 py-3 text-left font-bold text-gray-900">Date & Time</th>
                    <th className="px-6 py-3 text-left font-bold text-gray-900">Duration</th>
                    <th className="px-6 py-3 text-left font-bold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { patient: 'John Smith', date: '2024-02-26 10:00 AM', duration: '30 min', status: 'Completed' },
                    { patient: 'Sarah Wilson', date: '2024-02-26 11:00 AM', duration: '30 min', status: 'Completed' },
                    { patient: 'Michael Brown', date: '2024-02-27 02:00 PM', duration: '45 min', status: 'Scheduled' },
                    { patient: 'Emma Davis', date: '2024-02-28 03:00 PM', duration: '30 min', status: 'Scheduled' },
                  ].map((apt, idx) => (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900 font-medium">{apt.patient}</td>
                      <td className="px-6 py-4 text-gray-600">{apt.date}</td>
                      <td className="px-6 py-4 text-gray-600">{apt.duration}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          apt.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {apt.status}
                        </span>
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

export default AdminDoctorDetail;
