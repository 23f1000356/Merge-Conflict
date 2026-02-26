import { useState } from 'react';
import { useNavigate } from 'react-router';
import { LogOut, Menu, DownloadCloud } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

const AdminAIModel = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const modelMetrics = {
    accuracy: 94.5,
    precision: 93.2,
    recall: 95.8,
    f1Score: 94.5,
    version: '2.1.0',
    datasetSize: 15420,
    lastTrained: '2024-02-20',
    nextTraining: '2024-03-20'
  };

  const confusionMatrixData = [
    { name: 'Low (Predicted)', low: 2845, moderate: 120, high: 35 },
    { name: 'Moderate (Predicted)', low: 95, moderate: 4230, high: 180 },
    { name: 'High (Predicted)', low: 20, moderate: 140, high: 3872 }
  ];

  const modelAccuracyHistory = [
    { month: 'Jan', accuracy: 92.1 },
    { month: 'Feb', accuracy: 92.8 },
    { month: 'Mar', accuracy: 93.5 },
    { month: 'Apr', accuracy: 94.1 },
    { month: 'May', accuracy: 94.5 }
  ];

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Model Monitoring</h1>
          <p className="text-gray-600 mb-6">Track model performance and manage retraining</p>

          {/* Performance Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-gray-600 mb-2">Accuracy</p>
              <p className="text-3xl font-bold text-cyan-600">{modelMetrics.accuracy}%</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-gray-600 mb-2">Precision</p>
              <p className="text-3xl font-bold text-blue-600">{modelMetrics.precision}%</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-gray-600 mb-2">Recall</p>
              <p className="text-3xl font-bold text-green-600">{modelMetrics.recall}%</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-gray-600 mb-2">F1 Score</p>
              <p className="text-3xl font-bold text-purple-600">{modelMetrics.f1Score}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Accuracy History */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Accuracy Trend</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={modelAccuracyHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Line type="monotone" dataKey="accuracy" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Model Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Model Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-gray-600">Model Version:</span><span className="font-medium">{modelMetrics.version}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Dataset Size:</span><span className="font-medium">{modelMetrics.datasetSize.toLocaleString()} samples</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Last Trained:</span><span className="font-medium">{modelMetrics.lastTrained}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Next Training:</span><span className="font-medium">{modelMetrics.nextTraining}</span></div>
              </div>
              <button className="w-full mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium">
                🔄 Retrain Model
              </button>
            </div>
          </div>

          {/* Confusion Matrix */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Confusion Matrix</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={confusionMatrixData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="low" fill="#10b981" />
                <Bar dataKey="moderate" fill="#f59e0b" />
                <Bar dataKey="high" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminAIModel;
