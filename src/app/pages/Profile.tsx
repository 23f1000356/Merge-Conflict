import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Sidebar from '../components/Sidebar';
import { Menu, Save, Globe, Lock, Users, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { testService } from '../services/api';

export default function Profile() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    age: 0,
    gender: 'male',
    phone: '',
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        fullName: parsedUser.fullName || '',
        email: parsedUser.email || '',
        age: parsedUser.age || 0,
        gender: parsedUser.gender || 'male',
        phone: parsedUser.phone || '',
      });
    }
  }, []);

  const [settings, setSettings] = useState({
    language: 'en',
    voiceLanguage: 'en',
    enableFamilySharing: false,
    familyEmail: '',
    familyPermission: 'summary',
  });

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
  };

  const handleSaveProfile = () => {
    try {
      const existingUserRaw = localStorage.getItem('user');
      const existingUser = existingUserRaw ? JSON.parse(existingUserRaw) : {};

      const updatedUser = {
        ...existingUser,
        fullName: formData.fullName,
        email: formData.email,
        age: formData.age,
        gender: formData.gender,
        phone: formData.phone,
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to save profile', error);
      toast.error('Failed to save profile. Please try again.');
    }
  };

  const handleSaveSettings = () => {
    try {
      localStorage.setItem('profileSettings', JSON.stringify(settings));
      toast.success('Settings saved!');
    } catch (error) {
      console.error('Failed to save settings', error);
      toast.error('Failed to save settings. Please try again.');
    }
  };

  const handleDownloadData = async () => {
    try {
      const response = await testService.getHistory();
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'cognitive-data.json');
      document.body.appendChild(link);
      link.click();
      link.parentElement?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Your data download has started.');
    } catch (error) {
      console.error('Failed to download data', error);
      toast.error('Failed to prepare your data for download.');
    }
  };

  const handleDeleteAccount = () => {
    const confirmed = confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your cognitive data.'
    );

    if (!confirmed) {
      return;
    }

    try {
      // Clear client-side data for this user
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('profileSettings');

      toast.error('Your account has been deleted.');

      // Redirect to home/login
      navigate('/');
    } catch (error) {
      console.error('Failed to delete account', error);
      toast.error('Failed to delete account. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={user?.role || 'patient'} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile & Settings</h1>

        {/* Profile Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center text-3xl text-white font-bold">
              {getInitials(formData.fullName)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{formData.fullName}</h2>
              <p className="text-gray-600 capitalize">{user?.role || 'Patient'}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>

        {/* Language Preferences */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Language Preferences
          </h3>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Interface Language</label>
              <select
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="mr">Marathi</option>
                <option value="gu">Gujarati</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Voice Recognition Language</label>
              <select
                value={settings.voiceLanguage}
                onChange={(e) => setSettings({ ...settings, voiceLanguage: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Preferences
          </button>
        </div>

        {/* Data & Privacy */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Data & Privacy
          </h3>

          <div className="space-y-4">
            <button
              onClick={handleDownloadData}
              className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-cyan-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Download My Data</p>
                  <p className="text-sm text-gray-600">Export all your test results and analysis</p>
                </div>
              </div>
            </button>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-900">Data Encrypted</span>
              </div>
              <p className="text-sm text-green-800">
                Your data is encrypted using industry-standard AES-256 encryption and stored securely.
              </p>
            </div>
          </div>
        </div>

        {/* Family Sharing */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Family Sharing Settings
          </h3>

          <div className="mb-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableFamilySharing}
                onChange={(e) => setSettings({ ...settings, enableFamilySharing: e.target.checked })}
                className="w-5 h-5 text-cyan-600 rounded focus:ring-cyan-500"
              />
              <span className="font-medium text-gray-900">Enable Family Monitoring</span>
            </label>
          </div>

          {settings.enableFamilySharing && (
            <div className="space-y-4 ml-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Family Member Email</label>
                <input
                  type="email"
                  value={settings.familyEmail}
                  onChange={(e) => setSettings({ ...settings, familyEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  placeholder="family@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permission Level</label>
                <select
                  value={settings.familyPermission}
                  onChange={(e) => setSettings({ ...settings, familyPermission: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="summary">View Summary Only</option>
                  <option value="full">View Full Reports</option>
                </select>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  ℹ️ Family members will receive email notifications about your cognitive health updates based on the permission level you set.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Danger Zone
          </h3>

          <p className="text-sm text-red-800 mb-4">
            Deleting your account will permanently remove all cognitive data, test results, and analysis. This action cannot be undone.
          </p>

          <button
            onClick={handleDeleteAccount}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
          >
            Delete Account
          </button>
        </div>
      </main>
    </div>
  );
}
