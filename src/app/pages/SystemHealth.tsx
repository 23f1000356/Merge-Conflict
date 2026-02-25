import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Menu, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export default function SystemHealth() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const apiResponseData: any[] = [];
  const confusionMatrix: any[] = [];

  const handleRetrain = () => {
    if (confirm('Retraining may take 2-3 minutes. Continue?')) {
      toast.success('Model retraining initiated...');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={user?.role || 'admin'} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">System Health & AI Model</h1>
          <p className="text-gray-600">Monitor model performance and system metrics</p>
        </div>

        {/* Model Performance KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6">
            <p className="text-sm text-green-700 mb-2">Model Accuracy</p>
            <p className="text-4xl font-bold text-green-900">94.2%</p>
            <p className="text-xs text-green-600 mt-2">↑ +1.2% vs last model</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6">
            <p className="text-sm text-blue-700 mb-2">Precision</p>
            <p className="text-4xl font-bold text-blue-900">92.8%</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-6">
            <p className="text-sm text-purple-700 mb-2">Recall</p>
            <p className="text-4xl font-bold text-purple-900">91.5%</p>
          </div>

          <div className="bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-200 rounded-xl p-6">
            <p className="text-sm text-pink-700 mb-2">F1 Score</p>
            <p className="text-4xl font-bold text-pink-900">92.1%</p>
          </div>
        </div>

        {/* Confusion Matrix */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Confusion Matrix</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-3 bg-gray-50"></th>
                  <th className="border border-gray-300 p-3 bg-gray-50 font-semibold">Pred: Low</th>
                  <th className="border border-gray-300 p-3 bg-gray-50 font-semibold">Pred: Moderate</th>
                  <th className="border border-gray-300 p-3 bg-gray-50 font-semibold">Pred: High</th>
                </tr>
              </thead>
              <tbody>
                {confusionMatrix.map((row, idx) => (
                  <tr key={idx}>
                    <td className="border border-gray-300 p-3 bg-gray-50 font-semibold">Actual: {row.actual}</td>
                    <td className={`border border-gray-300 p-3 text-center ${row.predLow > 50 ? 'bg-green-100 font-bold' : ''}`}>
                      {row.predLow}
                    </td>
                    <td className={`border border-gray-300 p-3 text-center ${row.predMod > 50 ? 'bg-green-100 font-bold' : ''}`}>
                      {row.predMod}
                    </td>
                    <td className={`border border-gray-300 p-3 text-center ${row.predHigh > 50 ? 'bg-green-100 font-bold' : ''}`}>
                      {row.predHigh}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Model Control */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Model Control</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Dataset Size</p>
              <p className="text-2xl font-bold text-gray-900">15,240 samples</p>
              <p className="text-xs text-green-600 mt-1">+320 since last retrain</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Last Retrain Date</p>
              <p className="text-2xl font-bold text-gray-900">Feb 20, 2026</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Model Version</p>
              <p className="text-2xl font-bold text-gray-900">v2.4.1</p>
            </div>
          </div>

          <button
            onClick={handleRetrain}
            className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-semibold flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Retrain Model
          </button>
        </div>

        {/* System Health Metrics */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* API Response Time */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">API Response Time (Last 24h)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={apiResponseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="ms" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* System Stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Server Load</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '45%' }}></div>
                  </div>
                  <span className="font-semibold text-gray-900">45%</span>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Memory Usage</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: '62%' }}></div>
                  </div>
                  <span className="font-semibold text-gray-900">62%</span>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">System Uptime</span>
                <span className="font-semibold text-green-600">99.9%</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Database Status</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">Connected</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
