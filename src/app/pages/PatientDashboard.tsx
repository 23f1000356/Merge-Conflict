import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import Sidebar from '../components/Sidebar';
import BookAppointment from '../components/BookAppointment';
import {
  Menu,
  Calendar,
  FileText,
  LogOut,
  TrendingUp,
  Zap,
  Download,
  Share2,
  Eye,
  Mic,
  Activity,
  Bell,
  Brain,
  Gamepad2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { testService } from '../services/api';
import { toast } from 'sonner';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'tests' | 'appointments'>('tests');
  const [trendRange, setTrendRange] = useState<'weekly' | 'monthly'>('weekly');
  const [daysSinceLastTest, setDaysSinceLastTest] = useState<number | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    const fetchHistory = async () => {
      try {
        const response = await testService.getHistory();
        setHistory(response.data || []);
      } catch (error) {
        console.error('Failed to fetch history', error);
      }
    };
    fetchHistory();

    const lastTestCompleted = localStorage.getItem('lastTestCompleted');
    if (lastTestCompleted) {
      const diffMs = Date.now() - parseInt(lastTestCompleted, 10);
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      setDaysSinceLastTest(days);
    }
  }, []);

  const latestTest = history[0];
  const recentTests = history.slice(0, 5);

  // Prepare history for trend calculations (oldest -> newest)
  const sortedHistory = history.slice().reverse();
  const weeklyHistory = sortedHistory.slice(-7);
  const monthlyHistory = sortedHistory.slice(-30);
  const baseTrendSource = trendRange === 'weekly' ? weeklyHistory : monthlyHistory;

  // Chart data for cognitive trend
  const trendData = baseTrendSource.map((item) => ({
    date: new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: item.cognitiveIndex || 0,
    risk: item.riskProbability || 0,
  }));

  // Sparkline data for top summary card (last few tests)
  const sparklineData = sortedHistory.slice(-6).map((item) => ({
    date: new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: item.cognitiveIndex || 0,
  }));

  const latestScore = latestTest?.cognitiveIndex || 0;
  const previousScore = history[1]?.cognitiveIndex || latestScore;
  const scoreDelta = latestScore - previousScore;
  const scoreDeltaPercent = previousScore ? ((latestScore - previousScore) / previousScore) * 100 : 0;

  const brainAge = latestTest?.brainAge || 0;
  const actualAge = user?.age || 0;
  const brainAgeGap = brainAge && actualAge ? brainAge - actualAge : 0;

  const riskProbability = latestTest?.riskProbability || 0;
  const riskLevel = latestTest?.riskLevel || 'Low';
  const baselineScore = 100;
  const riskThreshold = 60;

  // Stability score based on last 5 tests (lower variability = higher stability)
  const stabilityWindow = history.slice(0, 5);
  let stabilityScore = 0;
  if (stabilityWindow.length > 1) {
    const diffs: number[] = [];
    for (let i = 1; i < stabilityWindow.length; i++) {
      const current = stabilityWindow[i - 1].cognitiveIndex || 0;
      const previous = stabilityWindow[i].cognitiveIndex || 0;
      diffs.push(Math.abs(current - previous));
    }
    const avgDiff = diffs.reduce((sum, d) => sum + d, 0) / diffs.length;
    stabilityScore = Math.max(0, Math.min(100, Math.round(100 - avgDiff)));
  }

  // Sudden drop / improvement streak detection
  let suddenDrop = false;
  let improvementStreak = 1;
  if (baseTrendSource.length > 1) {
    const scores = baseTrendSource.map((item) => item.cognitiveIndex || 0);
    for (let i = 1; i < scores.length; i++) {
      const diff = scores[i] - scores[i - 1];
      if (diff <= -15) {
        suddenDrop = true;
      }
      if (diff >= 0) {
        improvementStreak += 1;
      } else {
        improvementStreak = 1;
      }
    }
  }

  const voiceScore = latestTest?.voiceScore || 0;
  const typingScore = latestTest?.typingScore || 0;

  const voiceBehaviorData = [
    {
      name: 'Speech Rate',
      value: Math.min(100, Math.round(voiceScore)),
    },
    {
      name: 'Pause Duration',
      value: Math.max(0, Math.min(100, 100 - Math.round(voiceScore / 1.2))),
    },
    {
      name: 'Fluency Index',
      value: Math.min(100, Math.round((voiceScore + latestScore) / 2)),
    },
  ];

  const typingBehaviorData = [
    {
      name: 'Typing Speed',
      value: Math.min(100, Math.round((typingScore || latestScore) * 0.9)),
    },
    {
      name: 'Backspace Frequency',
      value: Math.max(0, Math.min(100, 100 - Math.round((typingScore || latestScore) * 0.7))),
    },
    {
      name: 'Hesitation Index',
      value: Math.max(0, Math.min(100, 100 - Math.round(latestScore * 0.8))),
    },
  ];

  // Simple 3-month forecast based on latest score and stability
  const projectedScore = Math.min(100, latestScore + 12);
  const forecastConfidence = stabilityScore ? Math.min(95, 60 + stabilityScore / 2) : 0;
  const projectedBrainAge = Math.max(18, Math.round(brainAge - Math.min(3, stabilityScore / 30)));

  const forecastData = [
    { period: 'Today', score: latestScore, confidence: forecastConfidence - 5 },
    { period: '1 Month', score: Math.min(100, latestScore + 4), confidence: forecastConfidence - 2 },
    { period: '2 Months', score: Math.min(100, latestScore + 8), confidence: forecastConfidence },
    { period: '3 Months', score: projectedScore, confidence: forecastConfidence },
  ];

  const riskBadgeClasses =
    riskProbability < 30
      ? 'bg-green-100 text-green-700'
      : riskProbability < 60
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-red-100 text-red-700';

  const riskExplanation =
    riskProbability < 30
      ? 'Your results are within a healthy range.'
      : riskProbability < 60
      ? 'We see some fluctuations. Keep monitoring regularly.'
      : 'Patterns suggest elevated risk. Consider consulting a doctor.';

  const alerts: string[] = [];
  if (daysSinceLastTest !== null && daysSinceLastTest >= 7) {
    alerts.push(`You haven’t taken a test in ${daysSinceLastTest} days.`);
  }
  if (suddenDrop) {
    alerts.push('A recent test showed a sudden drop in your cognitive score.');
  }
  const latestReactionScore = latestTest?.reactionScore || 0;
  const previousReactionScore = history[1]?.reactionScore || latestReactionScore;
  if (previousReactionScore && latestReactionScore && latestReactionScore < previousReactionScore - 5) {
    alerts.push('Reaction time appears slightly slower than your recent baseline.');
  }
  if (riskProbability >= 60 || stabilityScore < 50) {
    alerts.push('Consider consulting a doctor to discuss these patterns.');
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role="patient" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.fullName || 'User'}!</h1>
            <p className="text-gray-600 mt-1">Take control of your cognitive health journey</p>
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

        {/* KPI Cards / Top Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl p-6 shadow-md text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-100 mb-1 text-xs uppercase tracking-wide">Cognitive Index</p>
                <p className="text-3xl font-bold">{Math.round(latestScore)}%</p>
                {history.length > 1 && (
                  <p
                    className={`text-xs mt-1 ${
                      scoreDelta >= 0 ? 'text-emerald-200' : 'text-rose-200'
                    }`}
                  >
                    {scoreDelta >= 0 ? '+' : ''}
                    {Math.round(scoreDeltaPercent)}% vs last test
                  </p>
                )}
                {history.length <= 1 && (
                  <p className="text-xs text-cyan-100 mt-1">Baseline established</p>
                )}
              </div>
              <div className="w-12 h-12 bg-white/15 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            {sparklineData.length > 1 && (
              <div className="mt-4 h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparklineData}>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      formatter={(value) => [`${value}%`, 'Score']}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 shadow-md text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 mb-1 text-xs uppercase tracking-wide">Brain Age</p>
                <p className="text-3xl font-bold">{brainAge ? Math.round(brainAge) : 0}</p>
                <p className="text-xs text-indigo-100 mt-1">
                  Actual age: {actualAge || '—'} yrs
                </p>
                {brainAge && actualAge ? (
                  <p className="text-xs text-indigo-100 mt-1">
                    Brain age gap:{' '}
                    <span className={brainAgeGap <= 0 ? 'text-emerald-200' : 'text-amber-200'}>
                      {brainAgeGap > 0 ? '+' : ''}
                      {Math.abs(Math.round(brainAgeGap))} yrs
                    </span>
                  </p>
                ) : (
                  <p className="text-xs text-indigo-100 mt-1">Complete your profile for age comparison</p>
                )}
              </div>
              <div className="w-12 h-12 bg-white/15 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-500 to-lime-600 rounded-xl p-6 shadow-md text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 mb-1 text-xs uppercase tracking-wide">Risk Level</p>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/15"
                  >
                    {riskLevel}
                  </span>
                  <span className="text-sm font-bold">
                    {Math.round(riskProbability)}%
                  </span>
                </div>
                <p className="text-xs text-emerald-100 mt-1">{riskExplanation}</p>
              </div>
              <div className="w-12 h-12 bg-white/15 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-sky-500 to-cyan-600 rounded-xl p-6 shadow-md text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sky-100 mb-1 text-xs uppercase tracking-wide">Stability Score</p>
                <p className="text-3xl font-bold">
                  {stabilityScore ? `${stabilityScore}%` : history.length > 0 ? '—' : '0%'}
                </p>
                <p className="text-xs text-sky-100 mt-1">
                  Based on last {stabilityWindow.length || 1} tests
                </p>
                <p className="text-xs text-sky-100 mt-2">
                  Total tests: <span className="font-semibold">{history.length}</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-white/15 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Cognitive Trend */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Cognitive Trend</h2>
                <div className="inline-flex rounded-full bg-gray-100 p-1 text-xs">
                  <button
                    onClick={() => setTrendRange('weekly')}
                    className={`px-3 py-1 rounded-full font-medium ${
                      trendRange === 'weekly'
                        ? 'bg-white shadow-sm text-cyan-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setTrendRange('monthly')}
                    className={`px-3 py-1 rounded-full font-medium ${
                      trendRange === 'monthly'
                        ? 'bg-white shadow-sm text-cyan-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#6b7280" domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      formatter={(value) => [`${value}%`, 'Score']}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      name="Cognitive Score"
                      dot={{ fill: '#06b6d4', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <ReferenceLine
                      y={baselineScore}
                      stroke="#22c55e"
                      strokeDasharray="4 4"
                      label={{ value: 'Baseline', position: 'right', fill: '#16a34a', fontSize: 10 }}
                    />
                    <ReferenceLine
                      y={riskThreshold}
                      stroke="#f97316"
                      strokeDasharray="4 4"
                      label={{ value: 'Risk Threshold', position: 'right', fill: '#ea580c', fontSize: 10 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  <p className="text-center">Take your first test to see cognitive trends</p>
                </div>
              )}
              {trendData.length > 0 && (
                <div className="mt-4 text-xs text-gray-500 space-y-1">
                  {suddenDrop && (
                    <p>⚠ We detected at least one sudden drop in your recent trend.</p>
                  )}
                  {improvementStreak > 2 && (
                    <p>✅ You are on an improvement streak of {improvementStreak} tests.</p>
                  )}
                  {!suddenDrop && improvementStreak <= 2 && (
                    <p>Performance looks generally stable. Keep testing regularly.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            {/* Quick Action Panel */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900">Quick Actions</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Link
                  to="/test"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-cyan-100 bg-cyan-50 text-cyan-700 font-medium hover:bg-cyan-100 transition-colors"
                >
                  <Zap className="w-4 h-4" />
                  Take Test
                </Link>
                <Link
                  to="/test/voice"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-purple-100 bg-purple-50 text-purple-700 font-medium hover:bg-purple-100 transition-colors"
                >
                  <Mic className="w-4 h-4" />
                  Voice Assessment
                </Link>
                <Link
                  to="/progress"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-blue-100 bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition-colors"
                >
                  <Activity className="w-4 h-4" />
                  View Trends
                </Link>
                <Link
                  to="/reports"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-700 font-medium hover:bg-emerald-100 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Report
                </Link>
              </div>
            </div>

            {/* Take Test Hero Button */}
            <Link
              to="/test"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow block"
            >
              <div className="text-3xl mb-2">🧪</div>
              <h3 className="font-bold mb-1">Take a Test</h3>
              <p className="text-sm text-cyan-100">Start a new cognitive assessment</p>
            </Link>

            {/* Recent Results Summary */}
            {latestTest && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Latest Results</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Memory:</span>
                    <span className="font-semibold text-gray-900">{Math.round(latestTest.memoryScore || 0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reaction:</span>
                    <span className="font-semibold text-gray-900">{Math.round(latestTest.reactionScore || 0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Attention:</span>
                    <span className="font-semibold text-gray-900">{Math.round(latestTest.attentionScore || 0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Voice:</span>
                    <span className="font-semibold text-gray-900">{Math.round(latestTest.voiceScore || 0)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Voice & Behavior Insights + AI Forecast */}
        <div className="mt-8 grid lg:grid-cols-2 gap-8">
          {/* Voice & Typing Insights */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Mic className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-gray-900">Voice & Behavior Insights</h2>
            </div>
            {latestTest ? (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  Based on your latest assessment, we analyze how you speak and type to make the system feel more intelligent.
                </p>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">Voice Metrics</h3>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={voiceBehaviorData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '11px' }} />
                        <YAxis stroke="#6b7280" domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                          formatter={(value) => [`${value}%`, 'Index']}
                        />
                        <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">Typing Metrics</h3>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={typingBehaviorData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '11px' }} />
                        <YAxis stroke="#6b7280" domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                          formatter={(value) => [`${value}%`, 'Index']}
                        />
                        <Bar dataKey="value" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-500 text-sm">
                Take a test to unlock voice and typing insights.
              </div>
            )}
          </div>

          {/* AI Forecast Section */}
          <div className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50 rounded-xl border border-indigo-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-gray-900">AI Forecast</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              3‑month projection of your cognitive score, based on your current pattern and stability.
            </p>
            {latestTest && forecastData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="period" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      formatter={(value, name) => {
                        if (name === 'score') return [`${value}%`, 'Projected Score'];
                        if (name === 'confidence') return [`${value}%`, 'Confidence'];
                        return [value as string, name as string];
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#10b981"
                      strokeWidth={3}
                      name="Projected Score"
                      dot={{ r: 4, fill: '#10b981' }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="confidence"
                      stroke="#93c5fd"
                      strokeWidth={2}
                      name="Confidence"
                      strokeDasharray="5 5"
                      dot={{ r: 3, fill: '#93c5fd' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-4 grid sm:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white/70 rounded-lg p-3 border border-emerald-100">
                    <p className="text-xs text-gray-500 mb-1">Projected Score</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {projectedScore}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">In ~3 months</p>
                  </div>
                  <div className="bg-white/70 rounded-lg p-3 border border-blue-100">
                    <p className="text-xs text-gray-500 mb-1">Confidence</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {Math.round(forecastConfidence)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Based on stability</p>
                  </div>
                  <div className="bg-white/70 rounded-lg p-3 border border-purple-100">
                    <p className="text-xs text-gray-500 mb-1">Brain Age Projection</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {brainAge ? projectedBrainAge : 0} yrs
                    </p>
                    <p className="text-xs text-gray-500 mt-1">If current trend continues</p>
                  </div>
                </div>
                <p className="mt-4 text-xs text-gray-600">
                  Performance is likely to remain{' '}
                  <span className="font-semibold">
                    {stabilityScore > 75 ? 'stable or improving' : stabilityScore > 50 ? 'moderately stable' : 'somewhat fluctuating'}
                  </span>{' '}
                  if your current habits continue.
                </p>
              </>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-gray-500 text-sm">
                Complete at least one test to view AI forecasts.
              </div>
            )}
          </div>
        </div>

        {/* Smart Alerts & Brain Training */}
        <div className="mt-8 grid lg:grid-cols-2 gap-8">
          {/* Smart Alerts */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold text-gray-900">Smart Alerts</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Gentle nudges based on your usage and performance.
            </p>
            <ul className="space-y-2 text-sm">
              {alerts.length > 0 ? (
                alerts.map((alert, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2"
                  >
                    <span className="mt-0.5 text-amber-500">•</span>
                    <span className="text-gray-800">{alert}</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                  You’re up to date. No alerts right now — great job staying consistent!
                </li>
              )}
            </ul>
          </div>

          {/* Brain Training */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Gamepad2 className="w-5 h-5" />
              <h2 className="text-lg font-bold">Brain Gym</h2>
            </div>
            <p className="text-sm text-cyan-50 mb-4">
              Short, science-inspired activities to keep your brain active between tests.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                <p className="font-semibold mb-1">Daily Memory Drill</p>
                <p className="text-xs text-cyan-50 mb-2">
                  3–5 minute word and pattern recall exercises.
                </p>
                <Link
                  to="/brain-gym?mode=memory"
                  className="mt-1 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold hover:bg-white/30 transition-colors inline-block"
                >
                  Start practise
                </Link>
              </div>
              <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                <p className="font-semibold mb-1">Reaction Mini Game</p>
                <p className="text-xs text-cyan-50 mb-2">
                  Tap as soon as shapes change color.
                </p>
                <Link
                  to="/brain-gym/reaction-game"
                  className="mt-1 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold hover:bg-white/30 transition-colors inline-block"
                >
                  Play demo
                </Link>
              </div>
              <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                <p className="font-semibold mb-1">Streak Counter</p>
                <p className="text-xs text-cyan-50 mb-2">
                  Consistent testing days in a row:{' '}
                  <span className="font-bold">
                    {Math.max(1, improvementStreak)}
                  </span>
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                <p className="font-semibold mb-1">Pattern Focus Game</p>
                <p className="text-xs text-cyan-50 mb-2">
                  Quick sequence game to challenge attention and focus.
                </p>
                <Link
                  to="/brain-gym?mode=focus"
                  className="mt-1 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold hover:bg-white/30 transition-colors inline-block"
                >
                  Play now
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tests and Appointments Tabs Section */}
        <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('tests')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'tests'
                  ? 'text-cyan-600 border-b-2 border-cyan-600 bg-cyan-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              Recent Tests
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'appointments'
                  ? 'text-cyan-600 border-b-2 border-cyan-600 bg-cyan-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Book Appointment
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'tests' ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Test History</h2>
                  <Link to="/reports" className="text-cyan-600 hover:text-cyan-700 font-medium text-sm">
                    See All →
                  </Link>
                </div>

                {recentTests.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-gray-600 font-semibold">Date</th>
                          <th className="text-left py-3 px-4 text-gray-600 font-semibold">Score</th>
                          <th className="text-left py-3 px-4 text-gray-600 font-semibold">Brain Age</th>
                          <th className="text-left py-3 px-4 text-gray-600 font-semibold">Risk Level</th>
                          <th className="text-left py-3 px-4 text-gray-600 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentTests.map((test) => (
                          <tr key={test.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <span className="font-medium text-gray-900">
                                {new Date(test.createdAt).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-semibold text-gray-900">{Math.round(test.cognitiveIndex)}%</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-gray-700">{Math.round(test.brainAge)} yrs</span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                  test.riskProbability < 30
                                    ? 'bg-green-100 text-green-700'
                                    : test.riskProbability < 60
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {test.riskLevel || 'Low'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <Link
                                to="/test/results"
                                state={{ testData: test }}
                                className="text-cyan-600 hover:text-cyan-700 font-medium"
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No tests yet. Take your first test to get started!</p>
                  </div>
                )}
              </>
            ) : (
              <BookAppointment />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
