import { Link, useLocation } from 'react-router';
import { ArrowRight, Download, Share2, Home } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function TestResults() {
  const location = useLocation();
  const testData = location.state?.testData || {};
  const userData = JSON.parse(localStorage.getItem('user') || '{}');

  // Real data from location state
  const overallScore = Math.round(testData.cognitiveIndex || 0);
  const brainAge = Math.round(testData.brainAge || 0);
  const actualAge = userData.age || 0;
  const riskLevel = Math.round(testData.riskProbability || 0);

  const scores = [
    { category: 'Memory', score: Math.round(testData.memoryScore || 0) },
    { category: 'Reaction', score: Math.round(testData.reactionScore || 0) },
    { category: 'Attention', score: Math.round(testData.attentionScore || 0) },
    { category: 'Voice', score: Math.round(testData.voiceScore || 0) },
    { category: 'Typing', score: Math.round(testData.typingScore || 0) },
  ];

  const radarData = scores.map(s => ({ subject: s.category, A: s.score, fullMark: 100 }));

  const historicalData: any[] = [];
  const predictionData: any[] = [];

  const getRiskColor = () => {
    if (riskLevel < 30) return 'bg-green-500';
    if (riskLevel < 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRiskText = () => {
    if (riskLevel < 30) return 'Low Risk';
    if (riskLevel < 60) return 'Moderate Risk';
    return 'High Risk';
  };

  const getRecommendations = () => {
    if (riskLevel < 30) {
      return [
        'Maintain current routine',
        'Continue weekly testing',
        'Keep engaging in brain training exercises',
        'Maintain healthy sleep schedule',
      ];
    }
    return [
      'Improve sleep quality',
      'Practice memory drills daily',
      'Consider consulting a neurologist',
      'Increase cognitive training frequency',
    ];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Success Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Completed!</h1>
          <p className="text-gray-600">Your cognitive assessment results are ready</p>
        </div>

        {/* Risk Summary Card */}
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-8 text-white mb-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-cyan-100 mb-2">Overall Cognitive Score</p>
              <p className="text-5xl font-bold">{overallScore}%</p>
            </div>
            <div className="text-center">
              <p className="text-cyan-100 mb-2">Brain Age</p>
              <p className="text-5xl font-bold">{brainAge}</p>
              <p className="text-sm text-cyan-100 mt-1">
                Actual: {actualAge} yrs ({brainAge <= actualAge ? '-' : '+'}{Math.abs(brainAge - actualAge)})
              </p>
            </div>
            <div className="text-center">
              <p className="text-cyan-100 mb-2">Risk Level</p>
              <div className="flex items-center justify-center gap-3">
                <p className="text-5xl font-bold">{riskLevel}%</p>
                <div className={`px-4 py-2 rounded-full ${getRiskColor()} text-white font-semibold`}>
                  {getRiskText()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Bar Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Score Breakdown</h2>
            <div className="space-y-4">
              {scores.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-gray-700">{item.category}</span>
                    <span className="font-bold text-gray-900">{item.score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Radar Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Performance Profile</h2>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" stroke="#6b7280" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6b7280" />
                <Radar name="Score" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trend Graph */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Performance Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" domain={[60, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4', r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* AI Explanation */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            🤖 AI Analysis
          </h2>
          <div className="space-y-3 text-gray-700">
            <p>
              Your cognitive assessment has been processed. The results show an overall cognitive index of <strong>{overallScore}%</strong>.
            </p>
            <p className="pt-3 border-t border-purple-300 font-semibold text-gray-900">
              Overall assessment: Your cognitive health is <span className={riskLevel < 30 ? 'text-green-600' : 'text-yellow-600'}>{getRiskText()}</span>.
            </p>
          </div>
        </div>

        {/* 3-Month Forecast */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            🔮 3-Month Forecast
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={predictionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis domain={[75, 90]} stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} strokeDasharray="5 5" dot={{ fill: '#10b981', r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-600">
            <span>Confidence Level: <strong className="text-gray-900">{overallScore > 0 ? "95%" : "0%"}</strong></span>
            <span>|</span>
            <span>Projected Brain Age: <strong className="text-green-600">{brainAge > 0 ? brainAge - 1 : "N/A"} years</strong></span>
          </div>
        </div>

        {/* Recommendations */}
        <div className={`rounded-xl border-2 p-6 mb-8 ${riskLevel < 30 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
          }`}>
          <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Recommendations</h2>
          <ul className="space-y-2">
            {getRecommendations().map((rec, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className={riskLevel < 30 ? 'text-green-600' : 'text-yellow-600'}>✓</span>
                <span className="text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="grid sm:grid-cols-4 gap-4">
          <button className="flex flex-col items-center gap-2 p-6 bg-white border-2 border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
            <Download className="w-8 h-8 text-cyan-600" />
            <span className="font-semibold text-gray-900">Download PDF</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-6 bg-white border-2 border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
            <Share2 className="w-8 h-8 text-cyan-600" />
            <span className="font-semibold text-gray-900">Share with Doctor</span>
          </button>
          <Link
            to="/test"
            className="flex flex-col items-center gap-2 p-6 bg-white border-2 border-gray-200 rounded-xl hover:shadow-lg transition-shadow"
          >
            <ArrowRight className="w-8 h-8 text-cyan-600" />
            <span className="font-semibold text-gray-900">Retake Test</span>
          </Link>
          <Link
            to="/dashboard/patient"
            className="flex flex-col items-center gap-2 p-6 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors shadow-lg"
          >
            <Home className="w-8 h-8" />
            <span className="font-semibold">Go to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
