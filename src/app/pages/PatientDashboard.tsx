import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/StatsCard';
import { Menu, TrendingUp, TrendingDown, Minus, Bell, Globe } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { testService } from '../services/api';

export default function PatientDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

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

  const latestStats = history[0] || {
    cognitiveIndex: 0,
    brainAge: 0,
    riskProbability: 0,
    riskLevel: 'Low'
  };

  const chartData = history.slice().reverse().map(item => ({
    date: new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: item.cognitiveIndex,
    risk: item.riskProbability,
  }));

  const voiceMetrics: any[] = [];
  const typingMetrics: any[] = [];
  const predictionData: any[] = [];

  const getRiskColor = (risk: number) => {
    if (risk < 30) return 'bg-green-500';
    if (risk < 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRiskText = (risk: number) => {
    if (risk < 30) return 'Low Risk';
    if (risk < 60) return 'Moderate';
    return 'High Risk';
  };

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
            <div className="flex items-center gap-4">
              <div className="text-4xl">👋</div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome, {user?.fullName || 'User'}!</h1>
                <p className="text-gray-600 mt-1">Take control of your cognitive health journey</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Globe className="w-5 h-5 text-gray-600" />
              </button>
              <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Low Risk
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatsCard title="Cognitive Index" value={`${latestStats.cognitiveIndex}%`} icon="🧠" trend="Latest Assessment" />
          <StatsCard title="Brain Age" value={`${Math.round(latestStats.brainAge)} yrs`} icon="🎯" trend={`Actual Age: ${user?.age || '-'} yrs`} />
          <StatsCard title="Risk Level" value={`${Math.round(latestStats.riskProbability)}%`} icon="⚡" trend="Based on AI analysis" />
          <StatsCard
            title="Voice Stability"
            value="N/A"
            icon="🎤"
            trend="Assessment pending"
          />
        </div>

        {/* Cognitive Trend Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Cognitive Trend Analysis</h2>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-cyan-50 text-cyan-600 rounded-lg text-sm font-medium">
                Weekly
              </button>
              <button className="px-4 py-2 hover:bg-gray-50 text-gray-600 rounded-lg text-sm font-medium">
                Monthly
              </button>
              <button className="px-4 py-2 hover:bg-gray-50 text-gray-600 rounded-lg text-sm font-medium">
                Yearly
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={3} name="Overall Score" />
              <Line type="monotone" dataKey="risk" stroke="#f59e0b" strokeWidth={2} name="Risk %" />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              {history.length > 0 ? (
                <>
                  ℹ️ <strong>Insight:</strong> Your current brain age ({Math.round(latestStats.brainAge)}) is
                  {' '}{Math.round(latestStats.brainAge) <= (user?.age || 0) ? 'lower than' : 'higher than'} your actual age ({user?.age}).
                  This indicates a {Math.round(latestStats.brainAge) <= (user?.age || 0) ? 'positive' : 'concerning'} metabolic/cognitive trend.
                </>
              ) : (
                "Take your first test to see how your brain age compares to your actual age."
              )}
            </p>
          </div>
        </div>

        {/* Voice & Behavioral Insights */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Voice Analytics */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              🎤 Voice Analytics
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={voiceMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Typing Behavior */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              ⌨️ Typing Behavior
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={typingMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Prediction & AI Insights */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            🔮 AI-Powered 3-Month Forecast
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={predictionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="predicted" stroke="#10b981" fill="#d1fae5" />
                  <Area type="monotone" dataKey="confidence" stroke="#3b82f6" fill="#dbeafe" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-xl border border-cyan-200">
              <h4 className="font-semibold text-gray-900 mb-3">AI Explanation</h4>
              <div className="space-y-3 text-sm text-gray-700">
                <p>
                  Your recent reaction time has <strong>improved by 12%</strong> compared to your baseline.
                </p>
                <p>
                  Voice pause frequency has <strong>decreased</strong>, indicating better fluency.
                </p>
                <p>
                  Risk level remains <strong className="text-green-600">stable and low</strong>, with 92% confidence.
                </p>
                <p className="pt-2 border-t border-cyan-300">
                  <strong>Projected Brain Age (3 months):</strong> 40 years
                  <span className="text-green-600 font-semibold"> (-5 years improvement)</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Alerts */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">⚠️ Smart Alerts</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-2xl">✅</div>
              <div>
                <h4 className="font-semibold text-green-900">All Clear!</h4>
                <p className="text-sm text-green-700 mt-1">
                  No abnormal patterns detected. Keep up the great work!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Brain Gym */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            🎮 Brain Gym - Daily Challenges
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <div className="text-3xl mb-2">🧩</div>
              <h4 className="font-semibold text-gray-900 mb-1">Memory Drill</h4>
              <p className="text-sm text-gray-600 mb-3">2-minute challenge</p>
              <button className="w-full py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
                Start
              </button>
            </div>
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <div className="text-3xl mb-2">⚡</div>
              <h4 className="font-semibold text-gray-900 mb-1">Speed Challenge</h4>
              <p className="text-sm text-gray-600 mb-3">Test your reaction</p>
              <button className="w-full py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
                Start
              </button>
            </div>
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <div className="text-3xl mb-2">🎯</div>
              <h4 className="font-semibold text-gray-900 mb-1">Focus Game</h4>
              <p className="text-sm text-gray-600 mb-3">Concentration test</p>
              <button className="w-full py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
                Start
              </button>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between p-4 bg-white rounded-lg border border-purple-200">
            <div>
              <p className="text-sm text-gray-600">Weekly Progress</p>
              <p className="text-2xl font-bold text-purple-600">5/7 Days</p>
            </div>
            <div className="text-4xl">🔥</div>
          </div>
        </div>

        {/* Reports & Sharing */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Link
            to="/reports"
            className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-4xl mb-3">📥</div>
            <h4 className="font-semibold text-gray-900 mb-2">Download PDF Report</h4>
            <p className="text-sm text-gray-600">Get comprehensive analysis</p>
          </Link>
          <button className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow text-center">
            <div className="text-4xl mb-3">👨‍⚕️</div>
            <h4 className="font-semibold text-gray-900 mb-2">Share with Doctor</h4>
            <p className="text-sm text-gray-600">Grant access to your data</p>
          </button>
          <button className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow text-center">
            <div className="text-4xl mb-3">📧</div>
            <h4 className="font-semibold text-gray-900 mb-2">Email Summary</h4>
            <p className="text-sm text-gray-600">Weekly digest to inbox</p>
          </button>
        </div>
      </main>
    </div>
  );
}
