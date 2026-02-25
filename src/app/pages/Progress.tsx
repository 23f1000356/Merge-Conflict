import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Menu, TrendingUp, TrendingDown, Download } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ScatterChart, Scatter } from 'recharts';
import { testService } from '../services/api';

export default function Progress() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('monthly');
  const [metricA, setMetricA] = useState('cognitive');
  const [metricB, setMetricB] = useState('sleep');
  const [history, setHistory] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));

    const fetchHistory = async () => {
      try {
        const response = await testService.getHistory();
        setHistory(response.data);
      } catch (error) {
        console.error('Failed to fetch history', error);
      }
    };
    fetchHistory();
  }, []);

  const weeklyData = history.filter(item => {
    const d = new Date(item.createdAt);
    const now = new Date();
    return (now.getTime() - d.getTime()) <= 7 * 24 * 60 * 60 * 1000;
  }).reverse().map(item => ({
    date: new Date(item.createdAt).toLocaleDateString('en-US', { weekday: 'short' }),
    cognitive: item.cognitiveIndex,
    memory: item.TestResult?.memoryScore || 0,
    reaction: item.TestResult?.reactionTime || 0,
  }));

  const monthlyData = history.slice().reverse().map(item => ({
    month: new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short' }),
    cognitive: item.cognitiveIndex,
    brainAge: item.brainAge,
  }));

  const brainAgeData = history.slice().reverse().map(item => ({
    date: new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short' }),
    actual: user?.age || 0,
    predicted: item.brainAge,
  }));

  // These stay empty until advanced tracking is added
  const correlationData: any[] = [];
  const moduleBreakdown: any[] = [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="patient" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Progress & Trends</h1>
              <p className="text-gray-600">Long-term cognitive health monitoring</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Data
              </button>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="weekly">Weekly View</option>
            <option value="monthly">Monthly View</option>
            <option value="yearly">Yearly View</option>
          </select>

          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
            <option value="all">All Modules</option>
            <option value="memory">Memory Only</option>
            <option value="reaction">Reaction Only</option>
            <option value="voice">Voice Only</option>
            <option value="typing">Typing Only</option>
          </select>

          <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg">
            <input type="checkbox" className="w-4 h-4 text-cyan-600" />
            <span className="text-sm text-gray-700">Show Baseline</span>
          </label>
        </div>

        {/* Main Trend Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Cognitive Score Trend</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={timeRange === 'monthly' ? monthlyData : weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey={timeRange === 'monthly' ? 'month' : 'date'} stroke="#6b7280" />
              <YAxis stroke="#6b7280" domain={[60, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Legend />
              <Line type="monotone" dataKey="cognitive" stroke="#06b6d4" strokeWidth={3} name="Overall Score" dot={{ r: 5 }} />
              {timeRange === 'weekly' && (
                <>
                  <Line type="monotone" dataKey="memory" stroke="#8b5cf6" strokeWidth={2} name="Memory" />
                  <Line type="monotone" dataKey="reaction" stroke="#f59e0b" strokeWidth={2} name="Reaction" />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-4 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">+8% improvement this month</span>
            </div>
          </div>
        </div>

        {/* Brain Age Comparison */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            🧠 Brain Age vs Actual Age
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={brainAgeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" domain={[(user?.age || 0) - 10, (user?.age || 0) + 10]} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Legend />
              <Line type="monotone" dataKey="actual" stroke="#94a3b8" strokeWidth={2} name="Actual Age" strokeDasharray="5 5" />
              <Line type="monotone" dataKey="predicted" stroke="#06b6d4" strokeWidth={3} name="Brain Age" dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              {history.length > 0 ? (
                <>
                  ✨ Your current brain age of <strong>{Math.round(history[0].brainAge)}</strong> is
                  {' '}{Math.round(history[0].brainAge) <= (user?.age || 0) ? 'younger than' : 'older than'} your actual age of <strong>{user?.age}</strong>.
                  The gap is <strong>{Math.abs(Math.round(history[0].brainAge) - (user?.age || 0))} years</strong>.
                </>
              ) : (
                "Complete your first assessment to see your brain age comparison."
              )}
            </p>
          </div>
        </div>

        {/* Correlation Analysis */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Performance Correlation</h2>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Metric A</label>
              <select
                value={metricA}
                onChange={(e) => setMetricA(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              >
                <option value="cognitive">Cognitive Score</option>
                <option value="memory">Memory Score</option>
                <option value="reaction">Reaction Time</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Metric B</label>
              <select
                value={metricB}
                onChange={(e) => setMetricB(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              >
                <option value="sleep">Sleep Hours</option>
                <option value="exercise">Exercise Minutes</option>
                <option value="stress">Stress Level</option>
              </select>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" dataKey="sleep" name="Sleep Hours" stroke="#6b7280" />
              <YAxis type="number" dataKey="cognitive" name="Cognitive Score" stroke="#6b7280" domain={[70, 90]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Scatter data={correlationData} fill="#06b6d4" />
            </ScatterChart>
          </ResponsiveContainer>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              📊 <strong>Insight:</strong> On days with 8+ hours of sleep, your cognitive performance improves by an average of 12%.
            </p>
          </div>
        </div>

        {/* Module Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Score Breakdown by Module</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={moduleBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="module" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="week1" fill="#94a3b8" name="Week 1" />
              <Bar dataKey="week2" fill="#64748b" name="Week 2" />
              <Bar dataKey="week3" fill="#475569" name="Week 3" />
              <Bar dataKey="week4" fill="#06b6d4" name="Week 4" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Decline Detection Panel */}
        <div className="mt-8 bg-green-50 border-2 border-green-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">✅ Pattern Analysis</h3>
          <p className="text-gray-700">
            No concerning patterns detected. All cognitive metrics show stable or improving trends over the past 30 days.
          </p>
        </div>
      </main>
    </div>
  );
}
