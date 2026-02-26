import { useState } from 'react';
import { useNavigate } from 'react-router';
import { LogOut, Menu, User, Bell, Lock, Save, Camera } from 'lucide-react';
import { toast } from 'sonner';

const DoctorSettings = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile');
  const doctorName = localStorage.getItem('doctorName') || 'Dr. Sarah Johnson';
  const doctorEmail = localStorage.getItem('doctorEmail') || 'sarah.johnson@hospital.com';
  
  const [profile, setProfile] = useState({
    name: doctorName,
    email: doctorEmail,
    phone: '+1 (555) 123-4567',
    specialty: 'Cognitive Health Specialist',
    licenseNumber: 'MD-123456',
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: true,
    weeklyReport: true,
    patientUpdates: true,
  });

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotifications({ ...notifications, [name]: checked });
  };

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSecurity({ ...security, [name]: value });
  };

  const handleSaveProfile = () => {
    localStorage.setItem('doctorName', profile.name);
    localStorage.setItem('doctorEmail', profile.email);
    toast.success('Profile updated successfully');
  };

  const handleSaveNotifications = () => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
    toast.success('Notification settings saved');
  };

  const handleChangePassword = () => {
    if (!security.currentPassword || !security.newPassword || !security.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (security.newPassword !== security.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    toast.success('Password changed successfully');
    setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

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
                item.path === '/dashboard/doctor/settings'
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
        <div className="max-w-2xl mx-auto">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-bold text-3xl mb-4 relative group cursor-pointer">
              {doctorName[0]}
              <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{doctorName}</h1>
            <p className="text-gray-600">Cognitive Health Specialist</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            {[
              { id: 'profile', label: 'Profile Information', icon: User },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'security', label: 'Security', icon: Lock },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-4 px-4 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'text-cyan-600 border-b-2 border-cyan-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSaveProfile}
                  className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>

              {/* Professional Information */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Professional Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
                    <input
                      type="text"
                      name="specialty"
                      value={profile.specialty}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={profile.licenseNumber}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Notification Preferences</h2>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Email Alerts</h3>
                  <p className="text-sm text-gray-600">Receive alerts via email</p>
                </div>
                <input
                  type="checkbox"
                  name="emailAlerts"
                  checked={notifications.emailAlerts}
                  onChange={handleNotificationChange}
                  className="w-5 h-5 text-cyan-600 rounded"
                />
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Push Notifications</h3>
                  <p className="text-sm text-gray-600">Receive push notifications on your device</p>
                </div>
                <input
                  type="checkbox"
                  name="pushNotifications"
                  checked={notifications.pushNotifications}
                  onChange={handleNotificationChange}
                  className="w-5 h-5 text-cyan-600 rounded"
                />
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Weekly Reports</h3>
                  <p className="text-sm text-gray-600">Receive weekly patient summary reports</p>
                </div>
                <input
                  type="checkbox"
                  name="weeklyReport"
                  checked={notifications.weeklyReport}
                  onChange={handleNotificationChange}
                  className="w-5 h-5 text-cyan-600 rounded"
                />
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Patient Updates</h3>
                  <p className="text-sm text-gray-600">Get notified of patient status changes</p>
                </div>
                <input
                  type="checkbox"
                  name="patientUpdates"
                  checked={notifications.patientUpdates}
                  onChange={handleNotificationChange}
                  className="w-5 h-5 text-cyan-600 rounded"
                />
              </div>
              <button
                onClick={handleSaveNotifications}
                className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Preferences
              </button>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={security.currentPassword}
                  onChange={handleSecurityChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={security.newPassword}
                  onChange={handleSecurityChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={security.confirmPassword}
                  onChange={handleSecurityChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <button
                onClick={handleChangePassword}
                className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                Change Password
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DoctorSettings;
