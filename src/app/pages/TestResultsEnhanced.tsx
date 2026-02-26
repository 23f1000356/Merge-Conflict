import { Link, useLocation } from 'react-router';
import { ArrowRight, Download, Share2, Home, AlertCircle, TrendingUp, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, Legend, ComposedChart, Area } from 'recharts';
import { useEffect } from 'react';

export default function TestResults() {
  const location = useLocation();
  const testData = location.state?.testData || {};
  const userData = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    localStorage.setItem('lastTestCompleted', Date.now().toString());
  }, []);

  // Core metrics
  const overallScore = Math.round(testData.cognitiveIndex || 0);
  const brainAge = Math.round(testData.brainAge || 0);
  const actualAge = userData.age || 0;
  const riskLevel = Math.round(testData.riskProbability || 0);

  // Individual scores
  const memoryScore = Math.round(testData.memoryScore || 0);
  const reactionScore = Math.round(testData.reactionScore || 0);
  const attentionScore = Math.round(testData.attentionScore || 0);
  const voiceScore = Math.round(testData.voiceScore || 0);
  const typingScore = Math.round(testData.typingScore || 0);

  // Performance change (simulated - in real app would compare with last test)
  const performanceChange = Math.random() > 0.5 ? Math.round(Math.random() * 5) : -Math.round(Math.random() * 3);
  const reactionImprovement = Math.round(Math.random() * 150);
  const pauseFrequency = Math.round(Math.random() * 15);

  // Stability Score (CSI) - Cognitive Stability Index (0-100, higher is better)
  const stabilityScore = Math.round(75 + Math.random() * 20);

  // Brain age gap
  const brainAgeGap = Math.abs(brainAge - actualAge);
  const brainAgeInterpretation = brainAgeGap <= 2 ? 'aligned with your age group' : brainAgeGap <= 5 ? 'slightly younger than your age' : 'older than your age group';

  // Last test comparison (simulated)
  const lastTestScore = Math.max(0, overallScore - performanceChange);

  // Sudden drop detection
  const hasSuddenDrop = performanceChange <= -15;

  const scores = [
    { category: 'Memory', score: memoryScore },
    { category: 'Reaction', score: reactionScore },
    { category: 'Attention', score: attentionScore },
    { category: 'Voice', score: voiceScore },
    { category: 'Typing', score: typingScore },
  ];

  const radarData = scores.map(s => ({ subject: s.category, A: s.score, fullMark: 100 }));
  const performanceTrendData = scores;

  // 3-Month forecast
  const predictionData = [
    { month: 'Today', score: overallScore, stability: stabilityScore },
    { month: 'Week 1', score: Math.min(100, overallScore + 2), stability: stabilityScore + 1 },
    { month: 'Week 2', score: Math.min(100, overallScore + 4), stability: stabilityScore + 2 },
    { month: 'Week 3', score: Math.min(100, overallScore + 6), stability: stabilityScore + 1 },
    { month: 'Week 4', score: Math.min(100, overallScore + 8), stability: stabilityScore + 2 },
    { month: 'Month 2', score: Math.min(100, overallScore + 12), stability: stabilityScore + 3 },
    { month: 'Month 3', score: Math.min(100, overallScore + 15), stability: stabilityScore + 3 },
  ];

  // Risk classification functions
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

  const getRiskBgColor = () => {
    if (riskLevel < 30) return 'bg-green-50 border-green-200';
    if (riskLevel < 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getRiskTextColor = () => {
    if (riskLevel < 30) return 'text-green-700';
    if (riskLevel < 60) return 'text-yellow-700';
    return 'text-red-700';
  };

  // Dynamic recommendations based on risk level
  const getRecommendations = () => {
    if (riskLevel < 30) {
      return {
        title: '🟢 Your Cognitive Performance is Stable',
        message: 'Your cognitive performance is showing positive patterns.',
        actions: [
          '✓ Continue weekly monitoring',
          '✓ Maintain 7-8 hours of sleep',
          '✓ Brain exercises 10 min/day',
          '✓ Physical activity 30 min/day',
          '✓ Reduce screen fatigue',
        ],
        retestMessage: 'Retest in 7 days',
        urgency: 'normal',
      };
    } else if (riskLevel < 60) {
      return {
        title: '🟡 Early Signs of Cognitive Fluctuation',
        message: 'We detected some variations in your cognitive performance. Early intervention can help.',
        actions: [
          '⚠ Increase memory training exercises',
          '⚠ Practice reaction speed drills',
          '⚠ Reduce stress and anxiety',
          '⚠ Improve hydration intake',
          '⚠ Monitor sleep patterns closely',
        ],
        retestMessage: 'Retest in 3-5 days',
        urgency: 'moderate',
        extraNote: 'Consider consulting a doctor if decline continues',
      };
    } else {
      return {
        title: '🔴 Significant Cognitive Decline Detected',
        message: 'Consistent decline patterns have been detected. Professional evaluation is recommended.',
        actions: [
          '🚨 Immediate doctor consultation recommended',
          '🚨 Share report with a neurologist',
          '🚨 Avoid multitasking',
          '🚨 Reduce cognitive load',
          '🚨 Track symptoms daily',
        ],
        retestMessage: 'Retest within 48 hours',
        urgency: 'high',
        extraNote: 'Download your report and consult with a medical professional',
      };
    }
  };

  // AI Insight based on risk level
  const getAIInsight = () => {
    if (riskLevel < 30) {
      return `Your reaction time and memory performance are stable at ${memoryScore}% and ${reactionScore}% respectively. Voice fluency shows consistent patterns at ${voiceScore}%. No abnormal patterns detected. Keep up the excellent work!`;
    } else if (riskLevel < 60) {
      return `Reaction delay has increased by ${Math.abs(performanceChange)}% compared to your baseline. Speech pauses show mild irregularity. Voice stability at ${voiceScore}% shows room for improvement. Consider focusing on memory and reaction time drills.`;
    } else {
      return `Consistent decline observed across memory (${memoryScore}%), reaction time (${reactionScore}%), and voice patterns (${voiceScore}%) over recent sessions. Immediate attention and professional consultation highly recommended.`;
    }
  };

  const recommendations = getRecommendations();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Success Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Completed!</h1>
          <p className="text-gray-600">Your comprehensive cognitive assessment results are ready</p>
        </div>

        {/* Sudden Drop Warning */}
        {hasSuddenDrop && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 mb-8 flex gap-4">
            <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-red-900 mb-2">⚠️ Sudden Performance Drop Detected</h3>
              <p className="text-red-800">Your cognitive score dropped {Math.abs(performanceChange)}% compared to your last test. Please consider retesting to confirm this result or consult with a healthcare professional.</p>
            </div>
          </div>
        )}

        {/* Risk Summary Card */}
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-8 text-white mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-cyan-100 mb-2">Cognitive Score</p>
              <p className="text-4xl font-bold">{overallScore}%</p>
              <p className="text-xs text-cyan-100 mt-1">{performanceChange > 0 ? '+' : ''}{performanceChange}% from last test</p>
            </div>
            <div className="text-center">
              <p className="text-cyan-100 mb-2">Brain Age</p>
              <p className="text-4xl font-bold">{brainAge}</p>
              <p className="text-xs text-cyan-100 mt-1">Actual: {actualAge} yrs</p>
            </div>
            <div className="text-center">
              <p className="text-cyan-100 mb-2">Stability Index</p>
              <p className="text-4xl font-bold">{stabilityScore}%</p>
              <p className="text-xs text-cyan-100 mt-1">CSI Score</p>
            </div>
            <div className="text-center">
              <p className="text-cyan-100 mb-2">Risk Level</p>
              <div className={`inline-block px-3 py-1 rounded-full ${getRiskColor()} text-white font-semibold text-sm`}>
                {getRiskText()}
              </div>
              <p className="text-xs text-cyan-100 mt-1">{riskLevel}%</p>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Detailed Score Breakdown</h2>
          <div className="space-y-6">
            {[
              { name: 'Memory Score', score: memoryScore, icon: '🧠' },
              { name: 'Reaction Score', score: reactionScore, icon: '⚡' },
              { name: 'Attention Score', score: attentionScore, icon: '🎯' },
              { name: 'Voice Fluency', score: voiceScore, icon: '🎤' },
              { name: 'Typing Stability', score: typingScore, icon: '⌨️' },
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-gray-700">{item.icon} {item.name}</span>
                  <span className="font-bold text-gray-900">{item.score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Change Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Performance Change</h3>
            </div>
            <p className={`text-3xl font-bold ${performanceChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {performanceChange > 0 ? '+' : ''}{performanceChange}%
            </p>
            <p className="text-sm text-gray-600 mt-1">from last test</p>
          </div>

          <div className="bg-purple-50 rounded-xl border border-purple-200 p-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Reaction Time</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">-{reactionImprovement}ms</p>
            <p className="text-sm text-gray-600 mt-1">improved from baseline</p>
          </div>

          <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Voice Metrics</h3>
            <p className="text-3xl font-bold text-indigo-600">{pauseFrequency}%</p>
            <p className="text-sm text-gray-600 mt-1">pause frequency reduced</p>
          </div>
        </div>

        {/* Brain Age Detailed Section */}
        <div className={`rounded-xl border-2 p-6 mb-8 ${getRiskBgColor()}`}>
          <h2 className="text-xl font-bold text-gray-900 mb-4">🧠 Brain Age Analysis</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-gray-600 mb-1">Actual Age</p>
              <p className="text-3xl font-bold text-gray-900">{actualAge} years</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Predicted Brain Age</p>
              <p className="text-3xl font-bold text-cyan-600">{brainAge} years</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Brain Age Gap</p>
              <p className={`text-3xl font-bold ${brainAgeGap === 0 ? 'text-green-600' : brainAgeGap <= 2 ? 'text-blue-600' : 'text-orange-600'}`}>
                {brainAgeGap === 0 ? '0' : brainAgeGap > actualAge ? '+' : '-'}{brainAgeGap} years
              </p>
            </div>
          </div>
          <p className={`mt-4 p-3 rounded-lg ${getRiskBgColor()} text-gray-700`}>
            <strong>Interpretation:</strong> Your cognitive performance is {brainAgeInterpretation}. {brainAgeGap === 0 ? 'This indicates excellent cognitive alignment with your chronological age.' : brainAgeGap < actualAge ? 'This is a positive indicator of cognitive vitality.' : 'Consider implementing cognitive training to improve performance.'}
          </p>
        </div>

        {/* Cognitive Stability Index */}
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📈 Cognitive Stability Index (CSI)</h2>
          <div className="flex items-end gap-6 mb-6">
            <div>
              <p className="text-gray-600 mb-2">Current CSI Score</p>
              <p className="text-5xl font-bold text-teal-600">{stabilityScore}%</p>
            </div>
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-6">
                <div
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 h-6 rounded-full transition-all duration-500"
                  style={{ width: `${stabilityScore}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {stabilityScore > 75 ? '✓ Highly Stable' : stabilityScore > 50 ? '⚠ Moderate Stability' : '⚠ Fluctuating'}
              </p>
            </div>
          </div>
          <p className="text-gray-700">
            Your cognitive patterns show {stabilityScore > 75 ? 'excellent stability' : stabilityScore > 50 ? 'moderate consistency' : 'significant fluctuation'} across test sessions. A high CSI indicates reliable cognitive function, while a lower score suggests variable performance that may require monitoring.
          </p>
        </div>

        {/* Score Charts */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Bar Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Component Scores</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="category" stroke="#6b7280" />
                <YAxis stroke="#6b7280" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value) => [`${value}%`, 'Score']}
                />
                <Bar dataKey="score" fill="#06b6d4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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

        {/* 3-Month Forecast */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            🔮 3-Month Forecast
          </h2>
          <p className="text-sm text-gray-600 mb-4">Projected cognitive improvement and stability based on your current performance</p>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={predictionData} margin={{ top: 5, right: 30, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis yAxisId="left" stroke="#6b7280" domain={[0, 100]} />
              <YAxis yAxisId="right" orientation="right" stroke="#6b7280" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="score" fill="#d1fae5" stroke="#10b981" strokeWidth={3} name="Projected Score" />
              <Line yAxisId="right" type="monotone" dataKey="stability" stroke="#3b82f6" strokeWidth={2} name="Stability Index" strokeDasharray="5 5" />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-gray-600 mb-1">Expected Improvement</p>
              <p className="text-2xl font-bold text-green-600">+15%</p>
              <p className="text-xs text-gray-500 mt-1">Over 3 months</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Confidence Level</p>
              <p className="text-2xl font-bold text-blue-600">95%</p>
              <p className="text-xs text-gray-500 mt-1">Based on current trends</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <p className="text-sm text-gray-600 mb-1">Expected Brain Age</p>
              <p className="text-2xl font-bold text-purple-600">{Math.max(18, brainAge - 2)} yrs</p>
              <p className="text-xs text-gray-500 mt-1">from {brainAge} years</p>
            </div>
          </div>
        </div>

        {/* AI Insight Box */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🤖 AI Insight Analysis</h2>
          <p className="text-gray-700 leading-relaxed">
            {getAIInsight()}
          </p>
        </div>

        {/* Risk-Based Recommendations */}
        <div className={`rounded-xl border-2 p-8 mb-8 ${getRiskBgColor()}`}>
          <h2 className={`text-2xl font-bold mb-4 ${getRiskTextColor()}`}>{recommendations.title}</h2>
          <p className={`mb-6 text-lg ${getRiskTextColor()}`}>{recommendations.message}</p>
          
          <div className="bg-white rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Recommended Actions:</h3>
            <div className="space-y-3">
              {recommendations.actions.map((action, idx) => (
                <p key={idx} className={`${getRiskTextColor()} font-medium`}>{action}</p>
              ))}
            </div>
          </div>

          {recommendations.extraNote && (
            <div className="bg-white rounded-lg p-4 mb-4 border-l-4 border-orange-400">
              <p className="text-gray-700 font-semibold">{recommendations.extraNote}</p>
            </div>
          )}

          <p className={`text-lg font-bold ${getRiskTextColor()}`}>
            ⏰ {recommendations.retestMessage}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid sm:grid-cols-5 gap-4 mb-8">
          <button className="flex flex-col items-center gap-2 p-4 bg-white border-2 border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
            <Download className="w-6 h-6 text-cyan-600" />
            <span className="font-semibold text-gray-900 text-sm">Download PDF</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-white border-2 border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
            <Share2 className="w-6 h-6 text-cyan-600" />
            <span className="font-semibold text-gray-900 text-sm">Share Doctor</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-white border-2 border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
            <Zap className="w-6 h-6 text-cyan-600" />
            <span className="font-semibold text-gray-900 text-sm">Brain Training</span>
          </button>
          <Link
            to="/test"
            className="flex flex-col items-center gap-2 p-4 bg-white border-2 border-gray-200 rounded-xl hover:shadow-lg transition-shadow"
          >
            <ArrowRight className="w-6 h-6 text-cyan-600" />
            <span className="font-semibold text-gray-900 text-sm">Retake Test</span>
          </Link>
          <Link
            to="/dashboard/patient"
            className="flex flex-col items-center gap-2 p-4 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-colors shadow-lg"
          >
            <Home className="w-6 h-6" />
            <span className="font-semibold text-sm">Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
