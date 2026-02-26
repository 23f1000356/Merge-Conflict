import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { LogOut, Menu, Plus, Edit, Trash2, CheckCircle, Clock } from 'lucide-react';
import { userService } from '../services/api';
import { toast } from 'sonner';

const AdminDoctors = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await userService.getAllUsers();
      const doctorsList = res.data?.filter((u: any) => u.role === 'doctor') || [];
      setDoctors(doctorsList);
    } catch (err) {
      toast.error('Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleApprovDoctor = (doctorId: string) => {
    toast.success('Doctor approved');
    setDoctors(doctors.map(d => d.id === doctorId ? { ...d, status: 'approved' } : d));
  };

  const handleDeleteDoctor = (doctorId: string) => {
    if (window.confirm('Remove this doctor from the system?')) {
      setDoctors(doctors.filter(d => d.id !== doctorId));
      toast.success('Doctor removed');
    }
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Doctor Management</h1>
              <p className="text-gray-600">Manage doctors, approve applications, and monitor performance</p>
            </div>
            <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Doctor
            </button>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-gray-600 mb-2">Total Doctors</p>
              <p className="text-3xl font-bold text-gray-900">{doctors.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-gray-600 mb-2">Active</p>
              <p className="text-3xl font-bold text-green-600">{doctors.filter(d => d.status === 'approved').length}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-gray-600 mb-2">Pending Approval</p>
              <p className="text-3xl font-bold text-yellow-600">{doctors.filter(d => d.status === 'pending').length}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-gray-600 mb-2">Avg Rating</p>
              <p className="text-3xl font-bold text-cyan-600">4.8⭐</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-600 mx-auto"></div></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-900">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-900">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-900">Specialty</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-900">Patients</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-900">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.map((doctor) => (
                      <tr key={doctor.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{doctor.fullName}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{doctor.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">Cognitive Specialist</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">15</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            doctor.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {doctor.status === 'approved' ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm flex gap-2">
                          {doctor.status !== 'approved' && (
                            <button onClick={() => handleApprovDoctor(doctor.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteDoctor(doctor.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
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

export default AdminDoctors;
