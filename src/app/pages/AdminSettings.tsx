import { useState } from 'react';
import { useNavigate } from 'react-router';
import { LogOut, Menu, Save } from 'lucide-react';
import { toast } from 'sonner';

const AdminSettings = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState({
    lowRiskThreshold: 30,
    moderateRiskThreshold: 60,
    emailNotificationsEnabled: true,
    smsNotificationsEnabled: false,
    appNotificationsEnabled: true,
    voiceModuleEnabled: true,
    defaultTestDifficulty: 'medium',
    maintenanceMode: false,
  });

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSaveSettings = () => {
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    toast.success('Settings saved successfully');
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">System Settings</h1>
          <p className="text-gray-600 mb-6">Configure system-wide settings and features</p>

          {/* Risk Thresholds */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Risk Assessment Thresholds</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Low Risk Threshold ({settings.lowRiskThreshold}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={settings.lowRiskThreshold}
                  onChange={(e) => handleSettingChange('lowRiskThreshold', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-sm text-gray-600 mt-2">Risk probability below this value is considered Low Risk</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Moderate Risk Threshold ({settings.moderateRiskThreshold}%)
                </label>
                <input
                  type="range"
                  min="30"
                  max="80"
                  value={settings.moderateRiskThreshold}
                  onChange={(e) => handleSettingChange('moderateRiskThreshold', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-sm text-gray-600 mt-2">Risk probability between thresholds is Moderate Risk</p>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Notification Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-600">Send alerts and updates via email</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotificationsEnabled}
                  onChange={(e) => handleSettingChange('emailNotificationsEnabled', e.target.checked)}
                  className="w-5 h-5 text-cyan-600 rounded"
                />
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">SMS Notifications</h3>
                  <p className="text-sm text-gray-600">Send critical alerts via SMS</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.smsNotificationsEnabled}
                  onChange={(e) => handleSettingChange('smsNotificationsEnabled', e.target.checked)}
                  className="w-5 h-5 text-cyan-600 rounded"
                />
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">App Notifications</h3>
                  <p className="text-sm text-gray-600">Send push notifications in the app</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.appNotificationsEnabled}
                  onChange={(e) => handleSettingChange('appNotificationsEnabled', e.target.checked)}
                  className="w-5 h-5 text-cyan-600 rounded"
                />
              </div>
            </div>
          </div>

          {/* Feature Toggle */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Feature Toggles</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Voice Assessment Module</h3>
                  <p className="text-sm text-gray-600">Enable voice-based cognitive testing</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.voiceModuleEnabled}
                  onChange={(e) => handleSettingChange('voiceModuleEnabled', e.target.checked)}
                  className="w-5 h-5 text-cyan-600 rounded"
                />
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Maintenance Mode</h3>
                  <p className="text-sm text-gray-600">Put system in maintenance mode</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                  className="w-5 h-5 text-cyan-600 rounded"
                />
              </div>
            </div>
          </div>

          {/* Test Configuration */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Test Configuration</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Default Test Difficulty</label>
              <select
                value={settings.defaultTestDifficulty}
                onChange={(e) => handleSettingChange('defaultTestDifficulty', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <p className="text-sm text-gray-600 mt-2">Default difficulty level for new tests</p>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveSettings}
            className="w-full px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;
